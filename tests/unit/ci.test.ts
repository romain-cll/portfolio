import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const ciPath = new URL('../../.gitlab-ci.yml', import.meta.url)

// Durée maximale tolérée pour le job lighthouse : un run normal dure environ une minute
// (3 runs de ~12 s, plus l'installation), la limite doit rester du même ordre de grandeur.
const MAX_SECONDS = 10 * 60

const read = () => readFileSync(ciPath, 'utf8')

/** Lignes du bloc de premier niveau `name:` (jusqu'à la clé de premier niveau suivante). */
function topLevelBlock(yaml: string, name: string): string[] | null {
  const lines = yaml.split('\n')
  const start = lines.findIndex((line) => line.startsWith(`${name}:`))
  if (start === -1) return null
  const block: string[] = []
  for (const line of lines.slice(start + 1)) {
    if (/^\S/.test(line) && !line.startsWith('#')) break
    block.push(line)
  }
  return block
}

/** « 10m », « 10 minutes », « 1h 30m », « 600 seconds », « 600 » (secondes) → secondes. */
function toSeconds(text: string): number | null {
  const units: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400, w: 604800 }
  const names: Record<string, string> = {
    second: 's', seconds: 's', sec: 's', secs: 's',
    minute: 'm', minutes: 'm', min: 'm', mins: 'm',
    hour: 'h', hours: 'h', hr: 'h', hrs: 'h',
    day: 'd', days: 'd', week: 'w', weeks: 'w',
  }
  const cleaned = text.replace(/#.*$/, '').replace(/['"]/g, '').trim()
  if (/^\d+$/.test(cleaned)) return Number(cleaned)
  let total = 0
  let matched = false
  for (const [, amount, unit] of cleaned.matchAll(/(\d+(?:\.\d+)?)\s*([a-z]+)/gi)) {
    const key = names[unit!.toLowerCase()] ?? unit!.toLowerCase()
    if (!(key in units)) return null
    total += Number(amount) * units[key]!
    matched = true
  }
  return matched ? total : null
}

/** Délai maximal du job, en secondes : mot-clé `timeout:` du job (ou de `default:`), sinon `timeout` shell sur `lhci`. */
function lighthouseTimeoutSeconds(yaml: string): number | null {
  const job = topLevelBlock(yaml, 'lighthouse')
  assert.ok(job, 'le job `lighthouse` est introuvable dans .gitlab-ci.yml')

  const keyword = job.map((line) => /^ {2}timeout:\s*(.+)$/.exec(line)).find(Boolean)
  if (keyword) return toSeconds(keyword[1]!)

  const shell = job.map((line) => /\btimeout\s+(?:-\S+\s+)*(\d+\s*[smh]?)\s/.exec(line)).find(Boolean)
  if (shell) return toSeconds(shell[1]!)

  const fromDefault = topLevelBlock(yaml, 'default')
    ?.map((line) => /^ {2}timeout:\s*(.+)$/.exec(line))
    .find(Boolean)
  return fromDefault ? toSeconds(fromDefault[1]!) : null
}

describe('B2 — le job lighthouse de la CI ne peut pas tourner sans fin', () => {
  it('CA20 — le job lighthouse a un délai maximal configuré', () => {
    const seconds = lighthouseTimeoutSeconds(read())
    assert.notEqual(
      seconds,
      null,
      'aucun délai maximal sur le job lighthouse : ajouter `timeout:` au job dans .gitlab-ci.yml (sans cela, un run bloqué tourne jusqu’à l’annulation manuelle, 34 minutes dans la MR !1)',
    )
  })

  it(`CA20 — le délai maximal du job lighthouse ne dépasse pas ${MAX_SECONDS / 60} minutes`, () => {
    const seconds = lighthouseTimeoutSeconds(read())
    assert.ok(seconds !== null, 'aucun délai maximal sur le job lighthouse')
    assert.ok(seconds > 0, `délai invalide : ${seconds}s`)
    assert.ok(
      seconds <= MAX_SECONDS,
      `le délai du job lighthouse est de ${seconds / 60} min : il doit être d’au plus ${MAX_SECONDS / 60} min`,
    )
  })
})

// ---------------------------------------------------------------------------
// CA20 : Lighthouse tourne sur les pipelines de `main`, pas sur ceux des MR
// ---------------------------------------------------------------------------

type Variables = Record<string, string | undefined>

/** Variables prédéfinies GitLab pour les deux types de pipeline qui existent dans ce dépôt (voir `workflow`). */
const MAIN_PIPELINE: Variables = {
  CI_PIPELINE_SOURCE: 'push',
  CI_COMMIT_BRANCH: 'main',
  CI_COMMIT_REF_NAME: 'main',
  CI_DEFAULT_BRANCH: 'main',
}
const MERGE_REQUEST_PIPELINE: Variables = {
  CI_PIPELINE_SOURCE: 'merge_request_event',
  CI_MERGE_REQUEST_IID: '1',
  CI_MERGE_REQUEST_SOURCE_BRANCH_NAME: 'fix/portfolio-socle-deploy',
  CI_MERGE_REQUEST_TARGET_BRANCH_NAME: 'main',
  CI_COMMIT_REF_NAME: 'fix/portfolio-socle-deploy',
  CI_DEFAULT_BRANCH: 'main',
  // CI_COMMIT_BRANCH n'est pas définie dans un pipeline de merge request.
}

/** Évalue une expression `rules:if` (opérandes `$VAR`, `==`, `!=`, `=~`, `!~`, `&&`, `||`). Le reste est refusé. */
function evaluate(expression: string, variables: Variables): boolean {
  const operand = (text: string): string | undefined => {
    const t = text.trim()
    const variable = /^\$([A-Z_][A-Z0-9_]*)$/.exec(t)
    if (variable) return variables[variable[1]!]
    const literal = /^"([^"]*)"$|^'([^']*)'$/.exec(t)
    if (literal) return literal[1] ?? literal[2]
    if (t === 'null') return undefined
    throw new Error(`opérande non pris en charge par le test : ${t}`)
  }
  const atom = (text: string): boolean => {
    const t = text.trim()
    const regex = /^(.+?)\s*(=~|!~)\s*\/(.*)\/([a-z]*)$/.exec(t)
    if (regex) {
      const value = operand(regex[1]!)
      const matches = value !== undefined && new RegExp(regex[3]!, regex[4]).test(value)
      return regex[2] === '=~' ? matches : !matches
    }
    const comparison = /^(.+?)\s*(==|!=)\s*(.+)$/.exec(t)
    if (comparison) {
      const same = operand(comparison[1]!) === operand(comparison[3]!)
      return comparison[2] === '==' ? same : !same
    }
    const value = operand(t)
    return value !== undefined && value !== ''
  }
  if (/[()]/.test(expression.replace(/"[^"]*"|'[^']*'|\/[^/]*\//g, ''))) {
    throw new Error(`parenthèses non prises en charge par le test : ${expression}`)
  }
  return expression.split('||').some((or) => or.split('&&').every(atom))
}

/** Le job est-il créé dans un pipeline portant ces variables ? (`rules`, `only`, `except`, sinon toujours.) */
function jobRuns(yaml: string, name: string, variables: Variables): boolean {
  const job = topLevelBlock(yaml, name)
  assert.ok(job, `le job \`${name}\` est introuvable dans .gitlab-ci.yml`)

  const rulesAt = job.findIndex((line) => /^ {2}rules:\s*$/.test(line))
  if (rulesAt !== -1) {
    const rules: Array<{ if?: string; when?: string }> = []
    for (const line of job.slice(rulesAt + 1)) {
      if (/^ {0,2}\S/.test(line)) break
      const item = /^ {4}- (\w+):\s*(.*)$/.exec(line)
      const more = /^ {6}(\w+):\s*(.*)$/.exec(line)
      const entry = item ?? more
      if (!entry) continue
      if (item) rules.push({})
      const key = entry[1]!
      if (key !== 'if' && key !== 'when') throw new Error(`clé de rules non prise en charge par le test : ${key}`)
      rules[rules.length - 1]![key] = entry[2]!.replace(/\s+#.*$/, '').trim()
    }
    for (const rule of rules) {
      if (rule.if !== undefined && !evaluate(rule.if, variables)) continue
      return (rule.when ?? 'on_success') !== 'never'
    }
    return false
  }

  const list = (key: 'only' | 'except'): string[] | null => {
    const at = job.findIndex((line) => new RegExp(`^ {2}${key}:`).test(line))
    if (at === -1) return null
    const inline = /\[(.*)\]/.exec(job[at]!)
    if (inline) return inline[1]!.split(',').map((x) => x.trim().replace(/['"]/g, ''))
    const items: string[] = []
    for (const line of job.slice(at + 1)) {
      const item = /^ {4}- (.+)$/.exec(line)
      if (!item) break
      items.push(item[1]!.trim().replace(/['"]/g, ''))
    }
    return items
  }
  const matches = (refs: string[]) =>
    refs.some((ref) =>
      ref === 'merge_requests'
        ? variables.CI_PIPELINE_SOURCE === 'merge_request_event'
        : ref === 'branches'
          ? variables.CI_COMMIT_BRANCH !== undefined
          : ref === 'pushes'
            ? variables.CI_PIPELINE_SOURCE === 'push'
            : variables.CI_COMMIT_BRANCH === ref,
    )
  const only = list('only')
  const except = list('except')
  return (only === null || matches(only)) && (except === null || !matches(except))
}

describe('CA20 — Lighthouse uniquement sur les pipelines de main', () => {
  it('CA20 — le job lighthouse tourne sur un pipeline de main', () => {
    assert.equal(jobRuns(read(), 'lighthouse', MAIN_PIPELINE), true)
  })

  it('CA20 — le job lighthouse ne tourne pas sur un pipeline de merge request', () => {
    assert.equal(
      jobRuns(read(), 'lighthouse', MERGE_REQUEST_PIPELINE),
      false,
      'le job lighthouse est créé dans les pipelines de MR : ajouter `rules: - if: $CI_COMMIT_BRANCH == "main"` au job (quota de minutes du free tier)',
    )
  })

  it('CA19 — lint, unit, build et e2e tournent toujours sur un pipeline de merge request', () => {
    for (const name of ['lint', 'unit', 'build', 'e2e']) {
      assert.equal(jobRuns(read(), name, MERGE_REQUEST_PIPELINE), true, `le job ${name} ne tourne plus sur les MR`)
    }
  })
})

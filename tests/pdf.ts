// Lecture minimale d'un PDF produit par Chromium (Skia/PDF) : de quoi vérifier les CV livrés sans outil externe.
// Pages, format, liens et texte. Le texte se décode par les `ToUnicode` des polices, comme le fait un lecteur PDF,
// y compris pour les polices Type3 (codes sur 1 octet), les XObjects de type Form et les `/ActualText`.
// Ce module ne dépend d'aucun outil de test, il se charge aussi bien depuis `node --test` que depuis Playwright.

import { inflateSync } from 'node:zlib'

// ---------------------------------------------------------------------------
// Objets PDF
// ---------------------------------------------------------------------------

interface PdfName {
  kind: 'name'
  value: string
}
interface PdfRef {
  kind: 'ref'
  num: number
}
interface PdfString {
  kind: 'string'
  bytes: Buffer
}
interface PdfDict {
  kind: 'dict'
  entries: Map<string, PdfValue>
}
type PdfValue = number | boolean | null | PdfName | PdfRef | PdfString | PdfDict | PdfValue[]

interface PdfObject {
  value: PdfValue
  stream?: Buffer
}

const WHITESPACE = new Set([0, 9, 10, 12, 13, 32])
const DELIMITERS = new Set('()<>[]{}/%'.split('').map((c) => c.charCodeAt(0)))

type Token =
  | { t: 'number'; v: number }
  | { t: 'name'; v: string }
  | { t: 'string'; v: Buffer }
  | { t: 'punct'; v: '<<' | '>>' | '[' | ']' | '{' | '}' }
  | { t: 'keyword'; v: string }
  | { t: 'eof' }

class Lexer {
  readonly data: Buffer
  pos: number

  constructor(data: Buffer, pos = 0) {
    this.data = data
    this.pos = pos
  }

  private skipSpace() {
    while (this.pos < this.data.length) {
      const c = this.data[this.pos]!
      if (WHITESPACE.has(c)) this.pos++
      else if (c === 0x25) {
        while (this.pos < this.data.length && this.data[this.pos] !== 10 && this.data[this.pos] !== 13) this.pos++
      } else break
    }
  }

  next(): Token {
    this.skipSpace()
    const { data } = this
    if (this.pos >= data.length) return { t: 'eof' }
    const c = data[this.pos]!
    if (c === 0x28) return { t: 'string', v: this.literalString() }
    if (c === 0x3c) {
      if (data[this.pos + 1] === 0x3c) {
        this.pos += 2
        return { t: 'punct', v: '<<' }
      }
      return { t: 'string', v: this.hexString() }
    }
    if (c === 0x3e) {
      if (data[this.pos + 1] === 0x3e) {
        this.pos += 2
        return { t: 'punct', v: '>>' }
      }
      this.pos++
      return this.next()
    }
    if (c === 0x5b || c === 0x5d || c === 0x7b || c === 0x7d) {
      this.pos++
      return { t: 'punct', v: String.fromCharCode(c) as '[' | ']' | '{' | '}' }
    }
    if (c === 0x2f) {
      this.pos++
      const start = this.pos
      while (this.pos < data.length && !WHITESPACE.has(data[this.pos]!) && !DELIMITERS.has(data[this.pos]!)) this.pos++
      const raw = data.toString('latin1', start, this.pos)
      return { t: 'name', v: raw.replace(/#([0-9a-fA-F]{2})/g, (_, hex: string) => String.fromCharCode(Number.parseInt(hex, 16))) }
    }
    const start = this.pos
    while (this.pos < data.length && !WHITESPACE.has(data[this.pos]!) && !DELIMITERS.has(data[this.pos]!)) this.pos++
    if (this.pos === start) {
      this.pos++
      return this.next()
    }
    const word = data.toString('latin1', start, this.pos)
    if (/^[+-]?(\d+\.?\d*|\.\d+)$/.test(word)) return { t: 'number', v: Number(word) }
    return { t: 'keyword', v: word }
  }

  private literalString(): Buffer {
    const out: number[] = []
    let depth = 0
    this.pos++
    while (this.pos < this.data.length) {
      const c = this.data[this.pos++]!
      if (c === 0x5c) {
        const e = this.data[this.pos++]!
        if (e === 0x6e) out.push(10)
        else if (e === 0x72) out.push(13)
        else if (e === 0x74) out.push(9)
        else if (e === 0x62) out.push(8)
        else if (e === 0x66) out.push(12)
        else if (e >= 0x30 && e <= 0x37) {
          let octal = e - 0x30
          for (let i = 0; i < 2; i++) {
            const d = this.data[this.pos]
            if (d !== undefined && d >= 0x30 && d <= 0x37) {
              octal = octal * 8 + (d - 0x30)
              this.pos++
            }
          }
          out.push(octal & 255)
        } else if (e === 13) {
          if (this.data[this.pos] === 10) this.pos++
        } else if (e !== 10) out.push(e)
      } else if (c === 0x28) {
        depth++
        out.push(c)
      } else if (c === 0x29) {
        if (depth === 0) break
        depth--
        out.push(c)
      } else out.push(c)
    }
    return Buffer.from(out)
  }

  private hexString(): Buffer {
    this.pos++
    let hex = ''
    while (this.pos < this.data.length && this.data[this.pos] !== 0x3e) {
      const c = String.fromCharCode(this.data[this.pos++]!)
      if (/[0-9a-fA-F]/.test(c)) hex += c
    }
    this.pos++
    if (hex.length % 2 === 1) hex += '0'
    return Buffer.from(hex, 'hex')
  }
}

const isName = (v: PdfValue | undefined, value?: string): v is PdfName =>
  typeof v === 'object' && v !== null && !Array.isArray(v) && v.kind === 'name' && (value === undefined || v.value === value)
const isDict = (v: PdfValue | undefined): v is PdfDict =>
  typeof v === 'object' && v !== null && !Array.isArray(v) && v.kind === 'dict'
const isRef = (v: PdfValue | undefined): v is PdfRef =>
  typeof v === 'object' && v !== null && !Array.isArray(v) && v.kind === 'ref'
const isString = (v: PdfValue | undefined): v is PdfString =>
  typeof v === 'object' && v !== null && !Array.isArray(v) && v.kind === 'string'

/** Lit une valeur ; `refs` autorise la forme `12 0 R`. `first` est un jeton déjà lu. */
function readValue(lexer: Lexer, first: Token = lexer.next(), refs = true): PdfValue | { keyword: string } {
  switch (first.t) {
    case 'number': {
      if (refs && Number.isInteger(first.v) && first.v >= 0) {
        const save = lexer.pos
        const gen = lexer.next()
        if (gen.t === 'number' && Number.isInteger(gen.v)) {
          const r = lexer.next()
          if (r.t === 'keyword' && r.v === 'R') return { kind: 'ref', num: first.v }
        }
        lexer.pos = save
      }
      return first.v
    }
    case 'name':
      return { kind: 'name', value: first.v }
    case 'string':
      return { kind: 'string', bytes: first.v }
    case 'punct': {
      if (first.v === '[') {
        const items: PdfValue[] = []
        for (;;) {
          const token = lexer.next()
          if (token.t === 'eof' || (token.t === 'punct' && token.v === ']')) return items
          const item = readValue(lexer, token, refs)
          if (isKeywordResult(item)) continue
          items.push(item)
        }
      }
      if (first.v === '<<') {
        const entries = new Map<string, PdfValue>()
        for (;;) {
          const key = lexer.next()
          if (key.t === 'eof' || (key.t === 'punct' && key.v === '>>')) return { kind: 'dict', entries }
          if (key.t !== 'name') continue
          const item = readValue(lexer, lexer.next(), refs)
          if (!isKeywordResult(item)) entries.set(key.v, item)
        }
      }
      return { keyword: first.v }
    }
    case 'keyword':
      if (first.v === 'true') return true
      if (first.v === 'false') return false
      if (first.v === 'null') return null
      return { keyword: first.v }
    default:
      return { keyword: '' }
  }
}

const isKeywordResult = (v: PdfValue | { keyword: string }): v is { keyword: string } =>
  typeof v === 'object' && v !== null && !Array.isArray(v) && 'keyword' in v

// ---------------------------------------------------------------------------
// Document
// ---------------------------------------------------------------------------

export interface PdfLink {
  uri: string
  /** [x0, y0, x1, y1] en points. */
  rect: number[]
}

export interface PdfPageInfo {
  /** Largeur et hauteur de la MediaBox, en points (1/72 pouce). */
  width: number
  height: number
  links: PdfLink[]
  /** Texte de la page, un retour à la ligne à chaque déplacement du curseur de texte. */
  text: string
}

export interface PdfInfo {
  /** Version de l'en-tête (`1.4`). */
  version: string
  /** Pages de l'arbre des pages. */
  pages: PdfPageInfo[]
  /** Objets dont `/Type` vaut `/Page` : doit coïncider avec `pages.length`. */
  pageObjects: number
  /** Texte de toutes les pages. */
  text: string
  /** Glyphes dont aucun `ToUnicode` ne donne le caractère. 0 : le texte est entièrement lisible. */
  undecodable: number
  /** Nombre d'opérateurs d'affichage de texte rencontrés. */
  textOperations: number
  /** Nombre d'images (`/Subtype /Image`) du fichier. */
  images: number
  /** `/FontName` des descripteurs de police, sans le préfixe de sous-ensemble `XXXXXX+`, sans doublon, triés. */
  fontNames: string[]
  /** Nombre de polices par sous-type (`Type3`, `Type0`, `TrueType`…). */
  fonts: Record<string, number>
}

class PdfDocument {
  readonly objects = new Map<number, PdfObject>()
  readonly data: Buffer

  constructor(data: Buffer) {
    this.data = data
    this.scanObjects()
  }

  private scanObjects() {
    const source = this.data.toString('latin1')
    const header = /(?<![\d])(\d+) (\d+) obj\b/g
    let match: RegExpExecArray | null
    while ((match = header.exec(source))) {
      const lexer = new Lexer(this.data, match.index + match[0].length)
      const value = readValue(lexer)
      if (isKeywordResult(value)) continue
      const object: PdfObject = { value }
      // Un flux suit le dictionnaire : `stream`, un saut de ligne, les octets, `endstream`.
      const after = lexer.pos
      const probe = lexer.next()
      if (isDict(value) && probe.t === 'keyword' && probe.v === 'stream') {
        let start = lexer.pos
        if (this.data[start] === 13) start++
        if (this.data[start] === 10) start++
        const declared = value.entries.get('Length')
        let end = -1
        if (typeof declared === 'number' && this.data.toString('latin1', start + declared, start + declared + 12).includes('endstream')) {
          end = start + declared
        } else {
          end = source.indexOf('endstream', start)
          if (end === -1) end = this.data.length
          else if (this.data[end - 1] === 10) end -= this.data[end - 2] === 13 ? 2 : 1
        }
        object.stream = this.data.subarray(start, end)
        header.lastIndex = Math.max(header.lastIndex, end)
      } else lexer.pos = after
      this.objects.set(Number(match[1]), object)
    }
  }

  resolve(value: PdfValue | undefined): PdfValue | undefined {
    let current = value
    for (let i = 0; i < 20 && isRef(current); i++) current = this.objects.get(current.num)?.value
    return current
  }

  dict(value: PdfValue | undefined): PdfDict | undefined {
    const resolved = this.resolve(value)
    return isDict(resolved) ? resolved : undefined
  }

  get(dict: PdfDict | undefined, key: string): PdfValue | undefined {
    return dict ? this.resolve(dict.entries.get(key)) : undefined
  }

  /** Octets d'un flux, décodés (FlateDecode seulement : c'est ce qu'écrit Skia). */
  streamOf(value: PdfValue | undefined): Buffer | undefined {
    const object = isRef(value) ? this.objects.get(value.num) : undefined
    if (!object?.stream) return undefined
    const dict = isDict(object.value) ? object.value : undefined
    let filters = this.resolve(dict?.entries.get('Filter'))
    if (filters === undefined) return object.stream
    if (!Array.isArray(filters)) filters = [filters]
    let bytes = object.stream
    for (const filter of filters) {
      const name = this.resolve(filter)
      if (isName(name, 'FlateDecode') || isName(name, 'Fl')) bytes = inflateSync(bytes)
      else throw new Error(`filtre PDF non géré : ${isName(name) ? name.value : String(name)}`)
    }
    return bytes
  }

  number(value: PdfValue | undefined): number {
    const resolved = this.resolve(value)
    return typeof resolved === 'number' ? resolved : Number.NaN
  }
}

// ---------------------------------------------------------------------------
// ToUnicode
// ---------------------------------------------------------------------------

interface CMap {
  /** Longueurs de code (en octets) déclarées par `codespacerange`, avec leurs bornes. */
  spaces: { bytes: number; low: number; high: number }[]
  map: Map<number, string>
}

const utf16be = (bytes: Buffer): string => {
  let text = ''
  for (let i = 0; i + 1 < bytes.length; i += 2) text += String.fromCharCode(bytes.readUInt16BE(i))
  return text
}

function parseCMap(source: Buffer): CMap {
  const cmap: CMap = { spaces: [], map: new Map() }
  const lexer = new Lexer(source)
  const operands: Token[] = []
  const code = (token: Token | undefined) => (token?.t === 'string' ? token.v.readUIntBE(0, Math.min(token.v.length, 6)) : Number.NaN)
  for (let token = lexer.next(); token.t !== 'eof'; token = lexer.next()) {
    if (token.t !== 'keyword') {
      operands.push(token)
      continue
    }
    if (token.v === 'endcodespacerange') {
      for (let i = 0; i + 1 < operands.length; i += 2) {
        const low = operands[i]
        const high = operands[i + 1]
        if (low?.t === 'string' && high?.t === 'string') {
          cmap.spaces.push({ bytes: low.v.length, low: code(low), high: code(high) })
        }
      }
    } else if (token.v === 'endbfchar') {
      for (let i = 0; i + 1 < operands.length; i += 2) {
        const from = operands[i]
        const to = operands[i + 1]
        if (from?.t === 'string' && to?.t === 'string') cmap.map.set(code(from), utf16be(to.v))
      }
    } else if (token.v === 'endbfrange') {
      // <bas> <haut> <départ> ou <bas> <haut> [<a> <b> …] : les tableaux sont rejoués à partir de leurs jetons.
      let i = 0
      while (i + 2 < operands.length) {
        const low = code(operands[i])
        const high = code(operands[i + 1])
        const target = operands[i + 2]
        if (target?.t === 'string') {
          const base = utf16be(target.v)
          for (let c = low; c <= high; c++) {
            const last = base.charCodeAt(base.length - 1) + (c - low)
            cmap.map.set(c, base.slice(0, -1) + String.fromCharCode(last))
          }
          i += 3
        } else if (target?.t === 'punct' && target.v === '[') {
          let j = i + 3
          let c = low
          while (j < operands.length && !(operands[j]!.t === 'punct' && (operands[j] as { v: string }).v === ']')) {
            const item = operands[j]!
            if (item.t === 'string') cmap.map.set(c++, utf16be(item.v))
            j++
          }
          i = j + 1
        } else i++
      }
    }
    if (token.v.startsWith('end') || token.v.startsWith('begin')) operands.length = 0
  }
  return cmap
}

/** Découpe une chaîne affichée en codes selon les `codespacerange` : 1 octet pour Type3, 2 pour Identity-H. */
function* codes(bytes: Buffer, cmap: CMap | undefined): Generator<number> {
  let i = 0
  while (i < bytes.length) {
    let size = 1
    if (cmap && cmap.spaces.length > 0) {
      const sizes = [...new Set(cmap.spaces.map((s) => s.bytes))].sort((a, b) => a - b)
      size = sizes.at(-1)!
      for (const candidate of sizes) {
        if (i + candidate > bytes.length) continue
        const value = bytes.readUIntBE(i, candidate)
        if (cmap.spaces.some((s) => s.bytes === candidate && value >= s.low && value <= s.high)) {
          size = candidate
          break
        }
      }
    }
    size = Math.min(size, bytes.length - i)
    yield bytes.readUIntBE(i, size)
    i += size
  }
}

// ---------------------------------------------------------------------------
// Contenu des pages
// ---------------------------------------------------------------------------

interface TextState {
  out: string[]
  undecodable: number
  operations: number
  cmaps: Map<PdfDict, CMap | null>
}

/** Texte d'un `/ActualText` : UTF-16BE avec BOM, sinon octets simples. */
const actualText = (bytes: Buffer): string =>
  bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff ? utf16be(bytes.subarray(2)) : bytes.toString('latin1')

function walkContent(doc: PdfDocument, content: Buffer, resources: PdfDict | undefined, state: TextState, depth = 0) {
  if (depth > 8) return
  const lexer = new Lexer(content)
  const fonts = doc.dict(doc.get(resources, 'Font'))
  const xobjects = doc.dict(doc.get(resources, 'XObject'))
  const properties = doc.dict(doc.get(resources, 'Properties'))

  let font: PdfDict | undefined
  const fontStack: (PdfDict | undefined)[] = []
  // Contenu marqué : `true` si la pile compte au moins un `/ActualText` (les glyphes sont alors remplacés par ce texte).
  const marked: { replacement: string | undefined }[] = []
  const replaced = () => marked.some((m) => m.replacement !== undefined)
  let operands: (PdfValue | { keyword: string })[] = []

  const decode = (bytes: Buffer): string => {
    state.operations++
    if (replaced()) return ''
    let cmap: CMap | null | undefined
    if (font) {
      cmap = state.cmaps.get(font)
      if (cmap === undefined) {
        const stream = doc.streamOf(font.entries.get('ToUnicode'))
        cmap = stream ? parseCMap(stream) : null
        state.cmaps.set(font, cmap)
      }
    }
    let text = ''
    for (const c of codes(bytes, cmap ?? undefined)) {
      const char = cmap?.map.get(c)
      if (char === undefined) state.undecodable++
      else text += char
    }
    return text
  }

  const show = (value: PdfValue | { keyword: string } | undefined) => {
    if (isString(value as PdfValue)) state.out.push(decode((value as PdfString).bytes))
  }

  for (let token = lexer.next(); token.t !== 'eof'; token = lexer.next()) {
    if (token.t === 'keyword' && !['true', 'false', 'null'].includes(token.v)) {
      const op = token.v
      const a = operands
      switch (op) {
        case 'q':
          fontStack.push(font)
          break
        case 'Q':
          font = fontStack.pop()
          break
        case 'Tf': {
          const name = a[0]
          font = isName(name as PdfValue) ? doc.dict(fonts?.entries.get((name as PdfName).value)) : undefined
          break
        }
        case 'Tj':
        case "'":
          if (op === "'") state.out.push('\n')
          show(a[0])
          break
        case '"':
          state.out.push('\n')
          show(a[2])
          break
        case 'TJ': {
          const list = a[0]
          if (Array.isArray(list)) for (const item of list) show(item)
          break
        }
        case 'Td':
        case 'TD':
        case 'Tm':
        case 'T*':
          // Un déplacement vertical commence une nouvelle ligne ; un déplacement horizontal enchaîne le texte.
          if (op === 'T*' || op === 'Tm' || (typeof a[1] === 'number' && a[1] !== 0)) state.out.push('\n')
          break
        case 'ET':
          state.out.push('\n')
          break
        case 'BMC':
          marked.push({ replacement: undefined })
          break
        case 'BDC': {
          const props = a[1]
          const dict = isDict(props as PdfValue) ? (props as PdfDict) : isName(props as PdfValue) ? doc.dict(properties?.entries.get((props as PdfName).value)) : undefined
          const actual = doc.get(dict, 'ActualText')
          marked.push({ replacement: isString(actual) ? actualText(actual.bytes) : undefined })
          break
        }
        case 'EMC': {
          const closed = marked.pop()
          // Le texte de remplacement se pose à la fermeture de l'élément le plus extérieur qui en porte un.
          if (closed?.replacement !== undefined && !replaced()) state.out.push(closed.replacement)
          break
        }
        case 'Do': {
          const name = a[0]
          const ref = isName(name as PdfValue) ? xobjects?.entries.get((name as PdfName).value) : undefined
          const object = isRef(ref) ? doc.objects.get(ref.num) : undefined
          const dict = object && isDict(object.value) ? object.value : undefined
          if (dict && isName(doc.get(dict, 'Subtype'), 'Form')) {
            const stream = doc.streamOf(ref)
            if (stream) walkContent(doc, stream, doc.dict(doc.get(dict, 'Resources')) ?? resources, state, depth + 1)
          }
          break
        }
        case 'BI': {
          // Image en ligne : on saute jusqu'à `EI`.
          const rest = content.toString('latin1', lexer.pos)
          const end = rest.search(/\sEI(\s|$)/)
          lexer.pos = end === -1 ? content.length : lexer.pos + end + 3
          break
        }
        default:
          break
      }
      operands = []
      continue
    }
    const value = readValue(lexer, token, false)
    if (!isKeywordResult(value)) operands.push(value)
  }
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

function collectPages(doc: PdfDocument, node: PdfDict, inherited: { resources?: PdfValue; mediaBox?: PdfValue }, out: { dict: PdfDict; inherited: typeof inherited }[]) {
  const next = {
    resources: node.entries.get('Resources') ?? inherited.resources,
    mediaBox: node.entries.get('MediaBox') ?? inherited.mediaBox,
  }
  const kids = doc.get(node, 'Kids')
  if (Array.isArray(kids)) {
    for (const kid of kids) {
      const child = doc.dict(kid)
      if (child) collectPages(doc, child, next, out)
    }
  } else out.push({ dict: node, inherited: next })
}

export function inspectPdf(buffer: Buffer): PdfInfo {
  const head = buffer.toString('latin1', 0, 16)
  const version = /^%PDF-(\d\.\d)/.exec(head)?.[1]
  if (version === undefined) throw new Error('en-tête %PDF- absent')
  const doc = new PdfDocument(buffer)
  for (const object of doc.objects.values()) {
    if (isDict(object.value) && isName(object.value.entries.get('Type'), 'ObjStm')) {
      throw new Error('flux d’objets (ObjStm) : non géré par tests/pdf.ts, Skia n’en écrit pas')
    }
  }

  const all = [...doc.objects.values()].map((o) => o.value).filter(isDict)
  const catalog = all.find((d) => isName(d.entries.get('Type'), 'Catalog'))
  const root = doc.dict(catalog?.entries.get('Pages'))
  if (!root) throw new Error('arbre des pages introuvable')
  const leaves: Parameters<typeof collectPages>[3] = []
  collectPages(doc, root, {}, leaves)

  const state: TextState = { out: [], undecodable: 0, operations: 0, cmaps: new Map() }
  const pages: PdfPageInfo[] = leaves.map(({ dict, inherited }) => {
    const box = doc.resolve(inherited.mediaBox)
    const numbers = Array.isArray(box) ? box.map((n) => doc.number(n)) : []
    const [x0 = 0, y0 = 0, x1 = 0, y1 = 0] = numbers

    const links: PdfLink[] = []
    const annots = doc.get(dict, 'Annots')
    if (Array.isArray(annots)) {
      for (const ref of annots) {
        const annot = doc.dict(ref)
        if (!annot || !isName(doc.get(annot, 'Subtype'), 'Link')) continue
        const action = doc.dict(annot.entries.get('A'))
        const uri = doc.get(action, 'URI')
        const rect = doc.get(annot, 'Rect')
        if (isString(uri)) links.push({ uri: uri.bytes.toString('latin1'), rect: Array.isArray(rect) ? rect.map((n) => doc.number(n)) : [] })
      }
    }

    const start = state.out.length
    let contents = doc.get(dict, 'Contents')
    const refs = Array.isArray(contents) ? contents : [dict.entries.get('Contents')]
    contents = undefined
    const resources = doc.dict(inherited.resources)
    for (const ref of refs) {
      const stream = doc.streamOf(ref)
      if (stream) walkContent(doc, stream, resources, state)
    }
    return { width: x1 - x0, height: y1 - y0, links, text: state.out.slice(start).join('') }
  })

  const fonts: Record<string, number> = {}
  const fontNames = new Set<string>()
  let images = 0
  for (const value of all) {
    if (isName(value.entries.get('Type'), 'FontDescriptor')) {
      const name = doc.get(value, 'FontName')
      if (isName(name)) fontNames.add(name.value.replace(/^[A-Z]{6}\+/, ''))
    }
    const subtype = doc.get(value, 'Subtype')
    if (isName(doc.get(value, 'Type'), 'Font') && isName(subtype)) fonts[subtype.value] = (fonts[subtype.value] ?? 0) + 1
    if (isName(subtype, 'Image')) images++
  }

  return {
    version,
    pages,
    pageObjects: all.filter((d) => isName(d.entries.get('Type'), 'Page')).length,
    text: pages.map((p) => p.text).join('\n'),
    undecodable: state.undecodable,
    textOperations: state.operations,
    images,
    fontNames: [...fontNames].sort(),
    fonts,
  }
}

/** Texte sans espace ni retour à la ligne, comparable d'un rendu à l'autre (la mise en page coupe les lignes où elle veut). */
export const squash = (text: string): string => text.replace(/\s+/g, '')

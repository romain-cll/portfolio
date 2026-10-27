import { createFileRoute } from '@tanstack/react-router'

import { Chip } from '../../components/chip'
import { DetailList } from '../../components/detail-list'
import type { Detail } from '../../components/detail-list'
import {
  Edge,
  FlowDiagram,
  Group,
  Lane,
  Node,
  Stack,
} from '../../components/flow-diagram'
import { ItemList } from '../../components/item-list'
import type { Item } from '../../components/item-list'
import { PageHeader } from '../../components/page-header'
import { ProjectNav } from '../../components/project-nav'
import { Section } from '../../components/section'
import { TextLink } from '../../components/text-link'
import { Wide } from '../../components/wide'

export const Route = createFileRoute('/projects/rstack')({
  head: () => ({ meta: [{ title: 'rstack — Romain Caillé' }] }),
  component: Rstack,
})

// In Information and again at the bottom of the page
const repository: Detail = {
  label: 'Repository',
  value: (
    <TextLink href="https://github.com/romain-cll/rstack" iconRight="↗">
      github.com/romain-cll/rstack
    </TextLink>
  ),
}

const information: Array<Detail> = [
  { label: 'Period', value: '2026 – Now' },
  { label: 'Open source', value: 'MIT License' },
  {
    label: 'Stack',
    value: 'Claude Code (skills, subagents, hooks), Bash, jq',
  },
  repository,
]

const skills: Array<Item> = [
  {
    title: <Chip>/rs-plan</Chip>,
    detail:
      'Clarifies the need with me, writes the spec (user story, Given/When/Then criteria, out of scope) and the technical plan, then checks it’s ready to build.',
  },
  {
    title: <Chip>/rs-build</Chip>,
    detail:
      'Runs the agents on the feature’s branch: failing tests, code, rebase, review, fix rounds. Comes back to me only on a stop.',
  },
  {
    title: <Chip>/rs-ship</Chip>,
    detail:
      'Rebases, checks the tests are untouched, runs the suite, lint, typecheck and Definition of Done again, then pushes and opens the pull request. Never merges.',
  },
  {
    title: <Chip>/rs-explain</Chip>,
    detail: 'Turns an explanation into a diagram when text isn’t enough.',
  },
]

const agents: Array<Item> = [
  {
    title: (
      <>
        <Chip variant="agent">@tester</Chip> · Sonnet
      </>
    ),
    detail:
      'Writes the failing tests from the acceptance criteria, each at the lowest level that can observe it. Test files only.',
  },
  {
    title: (
      <>
        <Chip variant="agent">@dev</Chip> · Sonnet
      </>
    ),
    detail:
      'Writes the minimal code that makes the tests pass, then refactors while they stay green.',
  },
  {
    title: (
      <>
        <Chip variant="agent">@reviewer</Chip> · Opus
      </>
    ),
    detail:
      'A new one every round. Runs every check itself, blocks only on a closed list, and tags each item for who fixes it: the dev, the tester, or me.',
  },
]

const decisions: Array<Item> = [
  {
    title: 'The spec is the contract',
    detail:
      'Agents read the spec file, never the conversation, so they all work from the same ground.',
  },
  {
    title: 'Tests frozen once red',
    detail:
      'They’re committed before any code exists. From then on, the dev can only make them pass.',
  },
  {
    title: 'Guardrails as hooks, not prompts',
    detail:
      'The dev can’t write a test file, and the reviewer can only run read-only commands. The host enforces it; instructions alone don’t.',
  },
  {
    title: 'Only a real choice stops the build',
    detail:
      'Anything an agent can fix without a decision loops without me. A wrong criterion or a plan to rework comes back to me.',
  },
  {
    title: 'Loops that end',
    detail:
      '3 fix rounds at most, counted across runs. A problem that comes back, or a round that fixes nothing, stops the build earlier.',
  },
  {
    title: 'A strict bar for blocking',
    detail:
      'A bug blocks only if the reviewer can write the steps a user takes to trigger it. Everything else goes into the pull request as a note.',
  },
]

const tradeOffs: Array<Item> = [
  {
    title: 'Claude Code only, for now',
    detail:
      'The guards rely on its hooks. Other hosts will need their own guards, not just the skills.',
  },
  {
    title: 'Specs stay out of git',
    detail:
      'Deleting the worktree deletes the spec. The team gets what it needs from the pull request.',
  },
  {
    title: 'Stops rather than pushes through',
    detail:
      'A capped loop sometimes stops on something I settle in a minute, in exchange for never spinning in circles.',
  },
]

const learned: Array<Item> = [
  {
    title: 'A reviewer that re-reviews everything never says OK',
    detail:
      'Reviews ended KO almost every time, on test coverage and test cost rather than on bugs. Later rounds now check only the earlier blocking items and the new diff.',
  },
  {
    title: 'Agents add tests until told what enough is',
    detail:
      'Every rule asked for more tests, none for fewer. Each one now has a ceiling: the lowest level that observes the criterion, one mode by default.',
  },
  {
    title: 'Install by copy, not by symlink',
    detail:
      'Links followed the checkout, so switching rstack’s branch put unfinished work into every project.',
  },
]

const results: Array<Detail> = [
  repository,
  {
    label: 'GitHub contributions',
    value: 'April 166 → October 535 (×3.2)',
  },
]

function FeatureFlow() {
  return (
    <FlowDiagram
      minWidth={600}
      caption="One feature, one worktree. Two decisions are mine, the rest loops on its own."
    >
      <Lane
        label="Worktree · feature A"
        ghosts={['Worktree · feature B', 'Worktree · feature C']}
      >
        <Stack>
          <Node title={<Chip>/rs-plan</Chip>}>spec + technical plan</Node>
          <Node variant="gate" title="You approve the plan" />
          <Group
            id="build"
            className="w-full pb-12"
            label={
              <>
                <Chip>/rs-build</Chip> · runs without you
              </>
            }
          >
            <Stack direction="row" spacing={24} align="stretch">
              <Node
                id="tester"
                title={<Chip variant="agent">@tester</Chip>}
                className="flex-1"
              >
                red tests, frozen
              </Node>
              <Node
                id="dev"
                title={<Chip variant="agent">@dev</Chip>}
                className="flex-1"
              >
                makes them pass
              </Node>
              <Node title="Rebase" className="flex-1">
                onto main
              </Node>
              <Node
                id="reviewer"
                title={<Chip variant="agent">@reviewer</Chip>}
                className="flex-1"
              >
                fresh each round
              </Node>
            </Stack>
          </Group>
          {/* Two outcomes side by side; the arrows into them are Edges */}
          <Stack
            direction="row"
            connect={false}
            align="start"
            spacing={88}
            edge={false}
          >
            <Stack>
              <Node id="ship" title={<Chip>/rs-ship</Chip>}>
                rebase · checks · DoD · push · PR
              </Node>
              <Node variant="gate" title="You merge" />
            </Stack>
            <Node id="decide" variant="gate" title="You decide">
              cap hit · no convergence · spec issue
            </Node>
          </Stack>
        </Stack>
      </Lane>

      {/* A fix round goes back to the tester or the dev: one line, two heads */}
      <Edge from="reviewer" to="dev" fromSide="bottom" toSide="bottom" dashed />
      <Edge
        from="reviewer"
        to="tester"
        fromSide="bottom"
        toSide="bottom"
        dashed
        label="KO · fix round, max 3"
        labelSide="below"
      />
      <Edge from="build" to="ship" label="OK" />
      <Edge
        from="build"
        to="decide"
        toAt={1 / 3}
        label="Stop"
        labelSide="left"
      />
      <Edge from="decide" to="build" fromAt={2 / 3} label="look first" />
      <Edge from="decide" to="ship" label="ship anyway" />
    </FlowDiagram>
  )
}

function Rstack() {
  return (
    <>
      <PageHeader label="Project" />

      {/* The title sits closer to About than sections do to each other */}
      <div className="flex flex-col gap-(--gap-page-title)">
        <h1 className="font-(--weight-medium)">rstack</h1>
        <Section title="About">
          <p>
            Skills and agent loops to build features in parallel: one worktree
            per feature, from a spec I approve to a tested pull request. Open
            source, for Claude Code.
          </p>
        </Section>
      </div>

      <Section title="Information">
        <DetailList items={information} />
      </Section>

      <Section title="Problem">
        <p>
          Running several features at once with coding agents should multiply
          output. Without a frame, it multiplies interruptions: an agent left to
          itself can’t carry a feature end to end, so it stops to ask, guesses
          where it should ask, or bends the tests until they pass. Every
          worktree becomes another conversation to watch, re-explain and
          unblock, and the developer, worn out, becomes the bottleneck.
        </p>
      </Section>

      <Section title="Solution">
        <div className="flex flex-col gap-(--gap-block)">
          <p>
            Each feature runs in its own worktree, through three skills.{' '}
            <Chip>/rs-plan</Chip> writes the spec and the technical plan with
            me, and nothing is built until I approve it. <Chip>/rs-build</Chip>{' '}
            then runs alone: <Chip variant="agent">@tester</Chip> writes failing
            tests, <Chip variant="agent">@dev</Chip> makes them pass without
            being allowed to touch them, and a fresh{' '}
            <Chip variant="agent">@reviewer</Chip> checks the result. Fixes loop
            without me, three rounds at most. On an OK review,{' '}
            <Chip>/rs-ship</Chip> runs every check again and opens the pull
            request. Two decisions per feature are left to me: the plan and the
            merge.
          </p>
          {/* The solution, drawn: full page width */}
          <Wide>
            <FeatureFlow />
          </Wide>
        </div>
      </Section>

      <Section title="Skills">
        <ItemList items={skills} />
      </Section>

      <Section title="Agents">
        <ItemList items={agents} />
      </Section>

      <Section title="Decisions">
        <ItemList items={decisions} />
      </Section>

      <Section title="Trade-offs">
        <ItemList items={tradeOffs} />
      </Section>

      <Section title="Learned">
        <ItemList items={learned} />
      </Section>

      <Section title="Results">
        <DetailList items={results} />
      </Section>

      <ProjectNav current="rstack" />
    </>
  )
}

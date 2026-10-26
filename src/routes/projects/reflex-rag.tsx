import { createFileRoute } from '@tanstack/react-router'

import { DetailList } from '../../components/detail-list'
import type { Detail } from '../../components/detail-list'
import { ItemList } from '../../components/item-list'
import type { Item } from '../../components/item-list'
import { PageHeader } from '../../components/page-header'
import { ProjectNav } from '../../components/project-nav'
import { Section } from '../../components/section'
import { Table } from '../../components/table'
import { TextLink } from '../../components/text-link'
import { Wide } from '../../components/wide'

export const Route = createFileRoute('/projects/reflex-rag')({
  head: () => ({ meta: [{ title: 'Reflex RAG — Romain Caillé' }] }),
  component: ReflexRag,
})

// In Information and again at the bottom of the page
const code: Detail = {
  label: 'Code',
  value: (
    <TextLink href="https://github.com/romain-cll/reflex-rag" iconRight="↗">
      github.com/romain-cll/reflex-rag
    </TextLink>
  ),
}

const report: Detail = {
  label: 'Report',
  value: (
    <TextLink
      href="https://github.com/romain-cll/reflex-rag/blob/main/REPORT.md"
      iconRight="↗"
    >
      REPORT.md
    </TextLink>
  ),
}

const information: Array<Detail> = [
  { label: 'Role', value: 'Solo' },
  { label: 'Period', value: 'October 2026' },
  { label: 'Status', value: 'Done · open source' },
  {
    label: 'Stack',
    value:
      'Bun, TypeScript, SQLite FTS5, Claude Haiku 5.5, Mistral embeddings, Jev',
  },
  code,
  report,
]

const approach: Array<Item> = [
  {
    title: 'A bench with planted traps',
    detail:
      '202 notes of a fictional company, written from a truth file that plants traps: decisions revised over time, copies that diverge, facts worded without the question’s words, topics never mentioned.',
  },
  {
    title: '120 questions, five kinds',
    detail:
      'Simple, multi-hop, temporal, contradiction, no-answer. Half to tune, half held out for the published figures.',
  },
  {
    title: 'One pipeline, only the judge changes',
    detail: 'Same search and same answering model for every config.',
  },
  {
    title: 'A judge and a one-page policy',
    detail:
      'Each turn, the judge scores every candidate note: states the answer, leads to it, or neither. A deterministic policy then follows links, answers, rewrites the query or abstains.',
  },
  {
    title: 'Every wrong answer traced to a layer',
    detail:
      'Retrieval, with the step where the source was lost, or the answering model.',
  },
]

const observations: Array<Item> = [
  {
    title: 'The gain is multi-hop',
    detail:
      'Simple RAG gathers every source for 1 multi-hop question in 15, the loops for about 11. Of the 9 answers the Haiku loop gains over simple RAG, 8.3 are multi-hop.',
  },
  {
    title: 'The speed is in the call',
    detail:
      'Both loops make about the same number of judge calls. A Haiku call takes 3.44 s, a Jev call 0.32 s: one writes its verdicts as text, the other returns a probability per option.',
  },
  {
    title: 'Cheaper per token, not fewer tokens',
    detail:
      'Jev reads more tokens per call than Haiku, but costs less per token and doesn’t bill its output.',
  },
  {
    title: 'Where retrieval fails moves',
    detail:
      'In simple RAG, the search misses the source. In the loops, the judge sees nearly every missing source and doesn’t keep it.',
  },
  {
    title: 'The fallback was the problem',
    detail:
      'The Haiku fallback, meant for the notes Jev nearly kept, ran in 28 of 60 questions. 83 of its 87 calls came after Jev had already kept the answer, so the LLM call the design exists to avoid became its main cost.',
  },
]

const summary: Array<Detail> = [
  {
    label: 'Quality',
    value: 'Jev’s loop matches Haiku’s: same complete contexts, same accuracy',
  },
  {
    label: 'Latency',
    value: 'Retrieval 0.68 s against 6.45 s (p50), about ten times faster',
  },
  {
    label: 'Cost',
    value:
      '58% cheaper than the Haiku loop, but 2.8 times simple RAG end to end',
  },
  {
    label: 'Verdict',
    value: 'Hypothesis holds for quality and latency, partly for cost',
  },
]

const trust: Array<Item> = [
  {
    title: 'Three runs per config',
    detail:
      'Accuracy moves by up to 3 answers between runs, so no claim rests on a smaller gap: C+ is “at least as good as B”, not better.',
  },
  {
    title: 'The grader is code, checked by hand',
    detail:
      'No model grades the answers. I checked 20 answers drawn at random and agreed with its verdict on all 20.',
  },
  {
    title: 'Every figure is traced',
    detail:
      'Each one comes from a run folder tied to a commit, and the results table is generated from the traces.',
  },
]

const failures: Array<Item> = [
  {
    title: 'Truncated verdicts',
    detail:
      'The first Haiku run lost 18 of 60 questions: its thinking used up the token budget and cut off its verdicts. This was a harness bug, visible only because errors are counted apart from wrong answers.',
  },
  {
    title: 'Scoring links from their sentence',
    detail:
      'A judge recognises a note that holds the answer, but not a note that a link’s text says leads to it. Following a link now means judging the note it points to.',
  },
  {
    title: 'Judging notes one at a time',
    detail:
      'Alone, the page holding a multi-hop answer looked irrelevant. Judged with the other notes of the turn, it was recognised, so one call per turn became the design.',
  },
  {
    title: 'Fallback only when nothing is kept',
    detail:
      'It never fired, and quality dropped. What matters is whether an answer is kept, not whether any note is.',
  },
]

const limits: Array<Item> = [
  {
    title: 'Retrieval only',
    detail: 'No agent planning, memory or permissions.',
  },
  {
    title: 'Small synthetic corpus',
    detail:
      '202 short notes, written by Claude models, the family of the LLM under test.',
  },
  {
    title: 'The gain is almost all multi-hop',
    detail: 'Simple RAG is near the ceiling on the other kinds of question.',
  },
  {
    title: 'One LLM',
    detail:
      'The cost advantage rests on list prices; the latency advantage doesn’t.',
  },
]

const learned: Array<Item> = [
  {
    title: 'Count harness failures apart from wrong answers',
    detail:
      'The first run’s 18 failures were a token budget bug, not a bad judge.',
  },
  {
    title: 'Tie a fallback to the state of the turn, not to one note’s score',
    detail: 'Most calls came once the answer was already found.',
  },
  {
    title: 'Replay traces before paying for a run',
    detail: 'The fix’s effect was predicted offline, from existing traces.',
  },
  {
    title: 'Know the noise before reading a gap',
    detail:
      'With up to 3 answers of spread between runs, a 1.7-answer lead is not a result.',
  },
]

function ReflexRag() {
  return (
    <>
      <PageHeader label="Project" />

      {/* The title sits closer to About than sections do to each other */}
      <div className="flex flex-col gap-(--gap-page-title)">
        <h1 className="font-(--weight-medium)">Reflex RAG</h1>
        <Section title="About">
          <p>
            A retrieval layer over a vault of Markdown notes, where a small
            decision model judges the search loop instead of an LLM. Measured
            against the same loop judged by Claude Haiku: same quality,
            retrieval about ten times faster and 58% cheaper.
          </p>
        </Section>
      </div>

      <Section title="Information">
        <DetailList items={information} />
      </Section>

      <Section title="Why">
        <div className="flex flex-col gap-(--gap-paragraph)">
          <p>
            Agents that answer from documents spend LLM calls on yes/no
            decisions: does this note answer the question, is the answer
            complete, is this link worth opening. An LLM writes text to answer
            each one, which is slow and costly for what is a closed question.
          </p>
          <p>
            Simple RAG skips those calls, but it can’t tell whether a note
            actually answers, is out of date, or only leads to the note that
            does. It hands over its top results as they come.
          </p>
          <p>
            A system-one model answers a closed question with a probability for
            each option instead of writing text. I wanted to know whether one
            could take those decisions in place of the LLM.
          </p>
          <p>
            Hypothesis, written before the system-one loop was built: a
            retrieval loop judged by a system-one model reaches the quality of
            the same loop judged by an LLM, at a cost and latency close to
            simple RAG.
          </p>
        </div>
      </Section>

      <Section title="Approach">
        <div className="flex flex-col gap-(--gap-block)">
          <p>
            The tool is the measuring device. What I set out to show is the
            method: evals, traces, failure diagnosis, then a fix measured before
            and after.
          </p>
          <ItemList items={approach} />
          <Table
            columns={[
              { header: 'Config' },
              { header: 'Retrieval' },
              { header: 'Judge' },
            ]}
            rows={[
              ['A', 'top 5 notes of one search', 'none'],
              ['B', 'loop', 'Claude Haiku 5.5'],
              ['C', 'loop', 'Jev, a system-one model'],
            ]}
          />
        </div>
      </Section>

      <Section title="Observations">
        <ItemList items={observations} />
      </Section>

      <Section title="The fix">
        <div className="flex flex-col gap-(--gap-block)">
          <p>
            The fallback rule looked at each note alone, never at whether the
            turn already had its answer. One option now sends notes to Haiku
            only while no answer is kept. I wrote the spec, then failing tests,
            then the implementation. Replaying old traces predicted the effect
            before any paid run.
          </p>
          <Wide>
            <Table
              columns={[
                { header: 'Test split, 3 runs' },
                { header: 'Questions with a fallback', align: 'right' },
                { header: 'Retrieval p50', align: 'right' },
                { header: 'Retrieval cost / question', align: 'right' },
                { header: 'Context complete', align: 'right' },
                { header: 'Accuracy', align: 'right' },
              ]}
              rows={[
                ['Before', '28/60', '2.24 s', '$0.00102', '88.9%', '52.7/60'],
                [
                  'After (C+)',
                  '1.7/60',
                  '0.70 s',
                  '$0.00086',
                  '88.9%',
                  '53.3/60',
                ],
              ]}
              highlightLast
            />
          </Wide>
          <p>
            The fallback became 16 times rarer and retrieval three times faster,
            at the same quality.
          </p>
        </div>
      </Section>

      <Section title="Results">
        <div className="flex flex-col gap-(--gap-block)">
          <p>60 held-out questions, mean of three runs per config.</p>
          <Wide>
            <Table
              columns={[
                { header: 'Config' },
                { header: 'Context complete', align: 'right' },
                { header: 'Retrieval cost / question', align: 'right' },
                { header: 'Retrieval p50', align: 'right' },
                { header: 'Accuracy', align: 'right' },
              ]}
              rows={[
                ['A: simple RAG', '68.8%', '$0.0000015', '0.22 s', '42.7/60'],
                [
                  'B: loop judged by Haiku',
                  '86.8%',
                  '$0.00203',
                  '6.45 s',
                  '51.7/60',
                ],
                [
                  'C: loop judged by Jev',
                  '86.8%',
                  '$0.00085',
                  '0.68 s',
                  '51.7/60',
                ],
                [
                  'C+: C, fallback fixed',
                  '88.9%',
                  '$0.00086',
                  '0.70 s',
                  '53.3/60',
                ],
              ]}
            />
          </Wide>
          <DetailList items={summary} />
        </div>
      </Section>

      <Section title="Can the numbers be trusted">
        <ItemList items={trust} />
      </Section>

      <Section title="What did not work">
        <ItemList items={failures} />
      </Section>

      <Section title="Limits">
        <ItemList items={limits} />
      </Section>

      <Section title="Learned">
        <ItemList items={learned} />
      </Section>

      <Section title="Links">
        <DetailList items={[code, report]} />
      </Section>

      <ProjectNav current="reflex-rag" />
    </>
  )
}

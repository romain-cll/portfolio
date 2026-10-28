import { createFileRoute } from '@tanstack/react-router'

import { Code } from '../../components/code'
import { DetailList } from '../../components/detail-list'
import type { Detail } from '../../components/detail-list'
import { ItemList } from '../../components/item-list'
import type { Item } from '../../components/item-list'
import { PageHeader } from '../../components/page-header'
import { ProjectNav } from '../../components/project-nav'
import { Section } from '../../components/section'
import { TextLink } from '../../components/text-link'

export const Route = createFileRoute('/projects/videocn')({
  head: () => ({ meta: [{ title: 'VideoCn — Romain Caillé' }] }),
  component: VideoCn,
})

const site = (
  <TextLink href="https://videocn.dev" iconRight="↗">
    videocn.dev
  </TextLink>
)

const repositoryLink = (
  <TextLink href="https://github.com/romain-cll/videocn" iconRight="↗">
    github.com/romain-cll/videocn
  </TextLink>
)

const install: Detail = {
  label: 'Install',
  value: <Code>pnpm dlx shadcn@latest add @videocn/player</Code>,
}

const information: Array<Detail> = [
  { label: 'Period', value: 'Since September 2026' },
  { label: 'Open source', value: 'MIT License' },
  {
    label: 'Stack',
    value: 'Next.js 16, TypeScript, Tailwind 4, shadcn registry, Shaka Player',
  },
  { label: 'Website', value: site },
  { label: 'Repository', value: repositoryLink },
]

const approach: Array<Item> = [
  {
    title: 'Scope as a contract',
    detail:
      'The MVP document lists what the player does and what it doesn’t. Each change to it is dated and says why. The roadmap names what drops first if time runs out: the heatmap, then subtitle sizing.',
  },
  {
    title: 'Contracts before components',
    detail:
      'Each phase opens with its types: state, actions, props. The engine interface came in phase 0 with only the native engine behind it, so streaming could plug in later without rewriting the state or the scrubber.',
  },
  {
    title: 'Real installs from phase 1',
    detail:
      'The registry is served locally, installed into two outside projects, one on Radix and one on Base UI, then opened in a browser. Type checks and builds don’t catch a control that renders at zero pixels.',
  },
  {
    title: 'Specs for the later features',
    detail:
      'The control bar redesign and subtitles each had a spec with numbered acceptance criteria, 33 for subtitles, each one checked in the browser at 360 px and on both primitive families.',
  },
]

const decisions: Array<Item> = [
  {
    title: 'One install, one file per control',
    detail:
      'A single registry item installs the whole player into the user’s ui folder. Nothing is published separately, because a scrubber on its own isn’t a product. Each control still gets its own file because the code becomes the user’s, and they have to be able to read it.',
  },
  {
    title: 'Independent from the paid service',
    detail:
      'It only reads standard web formats and never calls the service, so it stays complete for anyone who produces those files themselves.',
  },
  {
    title: 'Native first, Shaka only when needed',
    detail: (
      <>
        The player talks to an engine interface with two implementations. MP4
        and WebM play on <Code>{'<video>'}</Code> alone. Shaka Player is
        imported dynamically, only for HLS or DASH sources. The engine depends
        on what the browser supports, never on which browser it is.
      </>
    ),
  },
  {
    title: 'The host’s theme, nothing else',
    detail: (
      <>
        Semantic tokens only, enforced by a lint rule: no hardcoded color. The
        radius follows <Code>--radius</Code> everywhere, pills included, so a
        theme set to zero gets a fully square player.
      </>
    ),
  },
  {
    title: 'Code that runs on both primitive families',
    detail: (
      <>
        shadcn installs the consumer’s own Button, built on Radix or Base UI,
        and their APIs differ. The player uses only the props they share, so no{' '}
        <Code>asChild</Code> and no <Code>render</Code>.
      </>
    ),
  },
  {
    title: 'Custom code only where the primitive blocks',
    detail: (
      <>
        The shadcn Slider hides its track, so it can’t show the buffer or
        chapters. It also doesn’t let you name the element that carries the
        slider role, which puts volume out of reach for screen readers and voice
        control. DropdownMenu renders into <Code>document.body</Code>, which
        isn’t displayed once the player goes fullscreen. The slider and the
        menus are the only components written from scratch, and they reuse the
        shadcn menu’s classes.
      </>
    ),
  },
  {
    title: 'Layout follows the player’s width, not the device',
    detail:
      'Below about 506 px, chapters, subtitles and Picture-in-Picture move into the settings menu. A player in a desktop sidebar gets the compact bar, and a wide touch screen keeps the full one.',
  },
  {
    title: 'YouTube’s habits where people already have them',
    detail:
      'Dragging the scrubber pauses only on the first real move and resumes only if the video was playing. In auto, the quality menu shows what is actually playing, “Auto (720p)”. A quality row with nothing to choose is greyed out, not removed.',
  },
]

const tradeOffs: Array<Item> = [
  {
    title: 'Shaka installs for everyone',
    detail:
      'A dynamic import of a missing package breaks the build, so Shaka can’t be an optional dependency. In return, an app that only plays MP4 never loads it.',
  },
  {
    title: 'Props, not composition',
    detail: (
      <>
        <Code>{'<VideoCn>'}</Code> takes no children: chapters, subtitles and
        visible controls are all props. It’s one tag to drop in, and nobody has
        to edit the code they received, but it offers less freedom than shadcn’s
        usual compound components.
      </>
    ),
  },
  {
    title: 'Subtitles drawn by the player',
    detail:
      'Cues render inside the player, so they stay visible in fullscreen and use the theme. Position and styling set in the WebVTT file are ignored.',
  },
  {
    title: 'Two shadcn styles need one line',
    detail: (
      <>
        lyra and sera hardcode square corners in each component and leave{' '}
        <Code>--radius</Code> untouched, and nothing in the CSS can detect that.
        Their users set <Code>--radius: 0</Code> themselves.
      </>
    ),
  },
]

const learned: Array<Item> = [
  {
    title: 'A green build can ship an invisible control',
    detail:
      'The first cross install put a zero-pixel volume slider in a Base UI project, with types and build passing. The primitive’s own width class won over mine without tailwind-merge seeing a conflict. Primitives now keep their full width inside a wrapper, and the only test that counts is looking at the rendered page.',
  },
  {
    title: 'The shadcn CLI rewrites your code',
    detail: (
      <>
        For RTL projects it turns <Code>origin-left</Code> into{' '}
        <Code>origin-start</Code>, which doesn’t exist, and it ends each line of
        a multiline <Code>className</Code> with a backslash that kills those
        classes. Timelines and numbers now stay left to right, and class strings
        stay on one line.
      </>
    ),
  },
  {
    title: 'Seeking at pointer speed shows nothing',
    detail:
      'No seek finishes before the next one starts, so the image freezes. Capping it at about one seek every 150 ms keeps the picture moving.',
  },
  {
    title: 'Test the narrowest width first',
    detail:
      'At 360 px, the expanded volume slider had 1.6 px of track. The timestamp now hides while the slider is open, and screen readers still read it.',
  },
]

const next: Array<Item> = [
  {
    title: 'Hover thumbnails',
    detail:
      'This is the most visible feature still missing. They’ll come from a WebVTT file pointing into a sprite, the first file the paid service will produce.',
  },
  {
    title: 'Chapters from a WebVTT file',
    detail: 'They can then change without redeploying the page.',
  },
  {
    title: 'Before v1',
    detail:
      'A VoiceOver and Voice Control pass done by hand, a square build for lyra and sera, and the @videocn listing in the shadcn directory.',
  },
]

const results: Array<Detail> = [
  install,
  {
    label: 'Weight',
    value: '17 kB gzip. Shaka 262 kB gzip (only for HLS/DASH)',
  },
  { label: 'Plays', value: 'MP4, WebM, HLS, DASH, Live (with rewind)' },
  { label: 'Compatible', value: 'Radix/Base UI, Light/Dark, RTL' },
  { label: 'Website', value: site },
  { label: 'Repository', value: repositoryLink },
  {
    label: 'Based on',
    value: (
      <TextLink href="https://ui.shadcn.com" iconRight="↗">
        ui.shadcn.com
      </TextLink>
    ),
  },
]

function VideoCn() {
  return (
    <>
      <PageHeader label="Project" />

      {/* The title sits closer to About than sections do to each other */}
      <div className="flex flex-col gap-(--gap-page-title)">
        <h1 className="font-(--weight-medium)">VideoCn</h1>
        <Section title="About">
          <p>
            A complete video player for React, installed with one shadcn
            command. Built on the native <Code>{'<video>'}</Code> element and
            shadcn/ui, it takes the host project’s theme and plays MP4, HLS,
            DASH and live streams. Open source.
          </p>
        </Section>
      </div>

      <Section title="Information">
        <DetailList items={information} />
      </Section>

      <Section title="Why">
        <div className="flex flex-col gap-(--gap-paragraph)">
          <p>
            In a shadcn/ui app, the video player is the odd one out: native
            controls can’t be styled, and player libraries bring their own look
            that you then override.
          </p>
          <p>
            I wanted a player that installs like any shadcn component and takes
            the app’s theme.
          </p>
          <p>
            It’s also the free half of a product: a paid service will produce
            what a good player needs, transcoded renditions, thumbnail sprites
            and subtitles.
          </p>
        </div>
      </Section>

      <Section title="Approach">
        <div className="flex flex-col gap-(--gap-block)">
          <p>
            I wrote down the scope before the first line of code, then built the
            player in eight phases, ordered by what blocks what.
          </p>
          <ItemList items={approach} />
        </div>
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

      <Section title="What’s next">
        <ItemList items={next} />
      </Section>

      <Section title="Results">
        <DetailList items={results} />
      </Section>

      <ProjectNav current="videocn" />
    </>
  )
}

/**
 * Flow diagrams, without a library: plain flex layout for the boxes, arrows
 * drawn over it in SVG. Two kinds of arrows, mixed freely:
 * - Stack draws one between consecutive children (opt out per child with
 *   `edge={false}`, label it with `edgeLabel`)
 * - Edge links any two elements with an `id` (Node, Group, Lane, or your own
 *   element through useFlowNode). Edges are measured from the DOM and drawn
 *   again on resize, so the layout can be anything.
 */
import {
  Children,
  Fragment,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { HTMLAttributes, ReactNode, RefObject } from 'react'
import { createPortal } from 'react-dom'

type Side = 'top' | 'right' | 'bottom' | 'left'
type Point = { x: number; y: number }
type Rect = {
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
}

const cx = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ')

/* Geometry */

const NORMAL: Record<Side, Point> = {
  top: { x: 0, y: -1 },
  right: { x: 1, y: 0 },
  bottom: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
}

const isVertical = (side: Side) => side === 'top' || side === 'bottom'

function anchor(rect: Rect, side: Side, at: number): Point {
  switch (side) {
    case 'top':
      return { x: rect.left + rect.width * at, y: rect.top }
    case 'bottom':
      return { x: rect.left + rect.width * at, y: rect.bottom }
    case 'left':
      return { x: rect.left, y: rect.top + rect.height * at }
    case 'right':
      return { x: rect.right, y: rect.top + rect.height * at }
  }
}

/** Sides to leave and enter by, from where the two boxes sit */
function autoSides(a: Rect, b: Rect): [Side, Side] {
  if (b.top >= a.bottom) return ['bottom', 'top']
  if (b.bottom <= a.top) return ['top', 'bottom']
  return b.left + b.width / 2 >= a.left + a.width / 2
    ? ['right', 'left']
    : ['left', 'right']
}

/** Drops repeated points and the middle of straight runs */
function simplify(points: Array<Point>): Array<Point> {
  const close = (a: number, b: number) => Math.abs(a - b) < 0.5
  const out: Array<Point> = []
  for (const point of points) {
    const last = out.at(-1)
    if (last && close(last.x, point.x) && close(last.y, point.y)) continue
    out.push(point)
  }
  return out.filter((p, i) => {
    if (i === 0 || i === out.length - 1) return true
    const a = out[i - 1]
    const c = out[i + 1]
    return !(
      (close(a.x, p.x) && close(p.x, c.x)) ||
      (close(a.y, p.y) && close(p.y, c.y))
    )
  })
}

/** Right-angled path between two anchors; `offset` is how far it leaves a side before turning */
function route(
  p1: Point,
  s1: Side,
  p2: Point,
  s2: Side,
  offset: number,
): Array<Point> {
  const a = { x: p1.x + NORMAL[s1].x * offset, y: p1.y + NORMAL[s1].y * offset }
  const b = { x: p2.x + NORMAL[s2].x * offset, y: p2.y + NORMAL[s2].y * offset }
  let middle: Array<Point>
  if (isVertical(s1) && isVertical(s2)) {
    const y =
      s1 === s2
        ? s1 === 'bottom'
          ? Math.max(a.y, b.y)
          : Math.min(a.y, b.y)
        : (p1.y + p2.y) / 2
    middle = [
      { x: p1.x, y },
      { x: p2.x, y },
    ]
  } else if (!isVertical(s1) && !isVertical(s2)) {
    const x =
      s1 === s2
        ? s1 === 'right'
          ? Math.max(a.x, b.x)
          : Math.min(a.x, b.x)
        : (p1.x + p2.x) / 2
    middle = [
      { x, y: p1.y },
      { x, y: p2.y },
    ]
  } else if (isVertical(s1)) {
    middle = [{ x: p1.x, y: p2.y }]
  } else {
    middle = [{ x: p2.x, y: p1.y }]
  }
  return simplify([p1, ...middle, p2])
}

/* Diagram: knows every box with an id, redraws edges when anything moves */

type Flow = {
  register: (id: string, element: HTMLElement | null) => void
  get: (id: string) => HTMLElement | undefined
  rootRef: RefObject<HTMLDivElement | null>
  overlay: HTMLDivElement | null
  tick: number
}

const FlowContext = createContext<Flow | null>(null)

function useFlow() {
  const flow = useContext(FlowContext)
  if (!flow) throw new Error('Flow parts must be inside <FlowDiagram>')
  return flow
}

/** Makes any element an edge end: `<div ref={useFlowNode('my-id')} />` */
export function useFlowNode<T extends HTMLElement = HTMLDivElement>(
  id?: string,
) {
  const { register } = useFlow()
  return useCallback(
    (element: T | null) => {
      if (id) register(id, element)
    },
    [id, register],
  )
}

export function FlowDiagram({
  caption,
  minWidth,
  children,
}: {
  /** Under the diagram, like Figure and Table: a legend, a source */
  caption?: ReactNode
  /** Below this width (px), the diagram scrolls sideways instead of squeezing */
  minWidth?: number
  children: ReactNode
}) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const nodes = useRef(new Map<string, HTMLElement>())
  const [overlay, setOverlay] = useState<HTMLDivElement | null>(null)
  const [tick, setTick] = useState(0)
  const [registry, setRegistry] = useState(0)
  const frame = useRef(0)

  // One redraw per frame, however many resizes fire
  const redraw = useCallback(() => {
    if (frame.current) return
    frame.current = requestAnimationFrame(() => {
      frame.current = 0
      setTick((t) => t + 1)
    })
  }, [])

  const register = useCallback((id: string, element: HTMLElement | null) => {
    const map = nodes.current
    if (element ? map.get(id) === element : !map.has(id)) return
    if (element) map.set(id, element)
    else map.delete(id)
    setRegistry((r) => r + 1)
  }, [])

  const get = useCallback((id: string) => nodes.current.get(id), [])

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return
    const observer = new ResizeObserver(redraw)
    observer.observe(root)
    nodes.current.forEach((element) => observer.observe(element))
    // Text reflows once Geist loads
    document.fonts.ready.then(redraw).catch(() => {})
    return () => observer.disconnect()
  }, [redraw, registry])

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  const flow = useMemo<Flow>(
    () => ({ register, get, rootRef, overlay, tick: tick + registry }),
    [register, get, overlay, tick, registry],
  )

  return (
    <FlowContext.Provider value={flow}>
      <figure className="flex flex-col gap-(--gap-caption)">
        <div className="overflow-x-auto">
          <div ref={rootRef} className="relative" style={{ minWidth }}>
            {children}
            <div
              ref={setOverlay}
              className="pointer-events-none absolute inset-0 z-10"
            />
          </div>
        </div>
        {caption && <figcaption className="text-muted">{caption}</figcaption>}
      </figure>
    </FlowContext.Provider>
  )
}

/* Stack: lays out its children and draws an arrow between each */

/** What any child of a Stack may carry */
export type Linkable = {
  /** false skips the arrow into this child (the space stays) */
  edge?: boolean
  /** Label on the arrow into this child */
  edgeLabel?: ReactNode
}

function ArrowHead({ direction }: { direction: 'down' | 'right' }) {
  return (
    <svg
      viewBox="0 0 8 8"
      aria-hidden="true"
      className={cx(
        'size-2 shrink-0 fill-current',
        direction === 'right' && '-rotate-90',
      )}
    >
      <path d="M0 1 L8 1 L4 7 Z" />
    </svg>
  )
}

function Connector({
  direction,
  label,
  hidden,
  spacing,
}: {
  direction: 'col' | 'row'
  label?: ReactNode
  hidden: boolean
  spacing: number
}) {
  const vertical = direction === 'col'
  return (
    <div
      aria-hidden={hidden || undefined}
      className={cx(
        'relative flex shrink-0 items-center text-edge',
        vertical ? 'flex-col self-center' : 'flex-row',
      )}
      style={vertical ? { height: spacing } : { width: spacing }}
    >
      {!hidden && (
        <>
          <span
            className={cx(
              'flex-1 bg-current',
              vertical ? 'w-(--edge-width)' : 'h-(--edge-width)',
            )}
          />
          <ArrowHead direction={vertical ? 'down' : 'right'} />
        </>
      )}
      {!hidden && label != null && (
        <span
          className={cx(
            'absolute whitespace-nowrap text-muted',
            vertical
              ? 'top-1/2 left-3 -translate-y-1/2'
              : 'bottom-2 left-1/2 -translate-x-1/2',
          )}
        >
          {label}
        </span>
      )}
    </div>
  )
}

const ALIGN = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
} as const

export function Stack({
  direction = 'col',
  connect = true,
  align = 'center',
  spacing = 40,
  className,
  children,
}: Linkable & {
  direction?: 'col' | 'row'
  /** Draw arrows between consecutive children */
  connect?: boolean
  align?: keyof typeof ALIGN
  /** Space (px) between children, arrow or not */
  spacing?: number
  className?: string
  children?: ReactNode
}) {
  const items = Children.toArray(children).filter(isValidElement)
  return (
    <div
      className={cx(
        'flex',
        direction === 'col' ? 'flex-col' : 'flex-row',
        ALIGN[align],
        className,
      )}
    >
      {items.map((child, i) => {
        const { edge, edgeLabel } = child.props as Linkable
        return (
          <Fragment key={child.key ?? i}>
            {i > 0 && (
              <Connector
                direction={direction}
                spacing={spacing}
                label={edgeLabel}
                hidden={!connect || edge === false}
              />
            )}
            {child}
          </Fragment>
        )
      })}
    </div>
  )
}

/* Boxes */

const VARIANTS = {
  step: 'border-divider bg-bg',
  /** A step that needs you: green, with ◆ */
  gate: 'border-accent-border bg-accent-surface',
  muted: 'border-dashed border-border',
} as const

export type NodeProps = Linkable &
  Omit<HTMLAttributes<HTMLDivElement>, 'title'> & {
    id?: string
    variant?: keyof typeof VARIANTS
    title?: ReactNode
    /** Before the title; gates get ◆ unless you pass null */
    icon?: ReactNode
  }

/** A box: a title in --text, its details (children) in --muted. Sized by its content; set a width through className */
export function Node({
  id,
  variant = 'step',
  title,
  icon,
  children,
  className,
  edge: _edge,
  edgeLabel: _edgeLabel,
  ...rest
}: NodeProps) {
  const ref = useFlowNode(id)
  const glyph =
    icon !== undefined ? (
      icon
    ) : variant === 'gate' ? (
      <span className="text-accent">◆</span>
    ) : null
  return (
    <div
      ref={ref}
      className={cx(
        'relative rounded-md border px-4 py-2.5 text-center text-balance',
        VARIANTS[variant],
        className,
      )}
      {...rest}
    >
      {title != null && (
        <p>
          {glyph != null && (
            <span aria-hidden="true" className="mr-1.5">
              {glyph}
            </span>
          )}
          {title}
        </p>
      )}
      {children != null && <div className="text-muted">{children}</div>}
    </div>
  )
}

/** A dashed frame around boxes: a loop, a phase. Can be an edge end. */
export function Group({
  id,
  label,
  dashed = true,
  className,
  children,
}: Linkable & {
  id?: string
  label?: ReactNode
  dashed?: boolean
  className?: string
  children?: ReactNode
}) {
  const ref = useFlowNode(id)
  return (
    <div
      ref={ref}
      className={cx(
        'relative rounded-lg border border-divider bg-surface p-4',
        dashed && 'border-dashed',
        label != null && 'pt-11',
        className,
      )}
    >
      {label != null && (
        <div className="absolute top-3 left-4 text-muted">{label}</div>
      )}
      {children}
    </div>
  )
}

// How far each ghost lane sits from the next: enough for its label
const GHOST_Y = 26
const GHOST_X = 12

/** A framed lane (worktree, team, site…); `ghosts` stacks parallel lanes behind it */
export function Lane({
  id,
  label,
  ghosts = [],
  className,
  children,
}: Linkable & {
  id?: string
  label?: ReactNode
  ghosts?: Array<ReactNode>
  className?: string
  children?: ReactNode
}) {
  const ref = useFlowNode(id)
  const count = ghosts.length
  return (
    <div className="relative" style={{ paddingTop: count * GHOST_Y }}>
      {ghosts
        .map((ghost, i) => ({ ghost, depth: i + 1 }))
        .reverse()
        .map(({ ghost, depth }) => (
          <div
            key={depth}
            aria-hidden="true"
            className="absolute rounded-lg border border-divider bg-bg"
            style={{
              top: (count - depth) * GHOST_Y,
              bottom: depth * GHOST_Y,
              left: depth * GHOST_X,
              right: (count - depth) * GHOST_X,
              opacity: 1 - depth * 0.25,
            }}
          >
            <div className="truncate px-4 pt-px text-muted">{ghost}</div>
          </div>
        ))}
      <div
        ref={ref}
        className={cx(
          'relative rounded-lg border border-border bg-bg p-6',
          label != null && 'pt-12',
          className,
        )}
        style={{ marginRight: count * GHOST_X }}
      >
        {label != null && (
          <div className="absolute top-3 left-4 text-muted">{label}</div>
        )}
        {children}
      </div>
    </div>
  )
}

/* Edge: an arrow between any two ids */

export type EdgeProps = {
  from: string
  to: string
  /** Side it leaves / enters by; picked from where the boxes sit when omitted */
  fromSide?: Side
  toSide?: Side
  /** Where along that side, 0 → 1 (0.5 is the middle): 1/3 and 2/3 for two edges between the same boxes */
  fromAt?: number
  toAt?: number
  /** How far (px) the line leaves a side before turning */
  offset?: number
  label?: ReactNode
  labelSide?: 'above' | 'below' | 'left' | 'right'
  dashed?: boolean
  /** No arrow head */
  plain?: boolean
}

type Geometry = { points: Array<Point>; labelAt: Point; horizontal: boolean }

const LABEL_TRANSFORM = {
  above: 'translate(-50%, calc(-100% - 6px))',
  below: 'translate(-50%, 6px)',
  right: 'translate(10px, -50%)',
  left: 'translate(calc(-100% - 10px), -50%)',
}

export function Edge({
  from,
  to,
  fromSide,
  toSide,
  fromAt,
  toAt,
  offset = 20,
  label,
  labelSide,
  dashed,
  plain,
}: EdgeProps) {
  const { get, rootRef, overlay, tick } = useFlow()
  const markerId = 'flow-arrow-' + useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const [geometry, setGeometry] = useState<Geometry | null>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    const fromElement = get(from)
    const toElement = get(to)
    if (!root || !fromElement || !toElement) {
      setGeometry(null)
      return
    }
    const origin = root.getBoundingClientRect()
    const rect = (element: HTMLElement): Rect => {
      const r = element.getBoundingClientRect()
      return {
        left: r.left - origin.left,
        top: r.top - origin.top,
        right: r.right - origin.left,
        bottom: r.bottom - origin.top,
        width: r.width,
        height: r.height,
      }
    }
    const a = rect(fromElement)
    const b = rect(toElement)
    const [autoFrom, autoTo] = autoSides(a, b)
    const s1 = fromSide ?? autoFrom
    const s2 = toSide ?? autoTo
    const p1 = anchor(a, s1, fromAt ?? 0.5)
    const p2 = anchor(b, s2, toAt ?? 0.5)

    // Facing sides: straighten the line where the boxes overlap on the other axis
    const facing =
      (s1 === 'bottom' && s2 === 'top') ||
      (s1 === 'top' && s2 === 'bottom') ||
      (s1 === 'right' && s2 === 'left') ||
      (s1 === 'left' && s2 === 'right')
    if (facing) {
      const vertical = isVertical(s1)
      const [aLo, aHi, bLo, bHi] = vertical
        ? [a.left, a.right, b.left, b.right]
        : [a.top, a.bottom, b.top, b.bottom]
      const pad = 4
      const set = (p: Point, value: number) =>
        vertical ? (p.x = value) : (p.y = value)
      const along = (p: Point) => (vertical ? p.x : p.y)
      if (
        fromAt == null &&
        toAt != null &&
        along(p2) >= aLo + pad &&
        along(p2) <= aHi - pad
      ) {
        set(p1, along(p2))
      } else if (
        toAt == null &&
        fromAt != null &&
        along(p1) >= bLo + pad &&
        along(p1) <= bHi - pad
      ) {
        set(p2, along(p1))
      } else if (fromAt == null && toAt == null) {
        const lo = Math.max(aLo, bLo) + pad
        const hi = Math.min(aHi, bHi) - pad
        if (hi > lo) {
          const narrower =
            aHi - aLo < bHi - bLo ? (aLo + aHi) / 2 : (bLo + bHi) / 2
          const value = Math.min(hi, Math.max(lo, narrower))
          set(p1, value)
          set(p2, value)
        }
      }
    }

    // The label goes on the longest stretch
    const points = route(p1, s1, p2, s2, offset)
    let longest = 0
    let longestLength = -1
    for (let i = 0; i < points.length - 1; i++) {
      const length =
        Math.abs(points[i + 1].x - points[i].x) +
        Math.abs(points[i + 1].y - points[i].y)
      if (length > longestLength) {
        longestLength = length
        longest = i
      }
    }
    const start = points[longest]
    const end = points[longest + 1]
    setGeometry({
      points,
      labelAt: { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 },
      horizontal: Math.abs(end.y - start.y) < 0.5,
    })
  }, [tick, from, to, fromSide, toSide, fromAt, toAt, offset, get, rootRef])

  if (!geometry || !overlay) return null

  const path = geometry.points
    .map((p, i) => `${i ? 'L' : 'M'} ${p.x} ${p.y}`)
    .join(' ')
  const side = labelSide ?? (geometry.horizontal ? 'above' : 'right')

  return createPortal(
    <>
      <svg
        aria-hidden="true"
        className="absolute inset-0 size-full overflow-visible text-edge"
      >
        {!plain && (
          <defs>
            <marker
              id={markerId}
              viewBox="0 0 8 8"
              refX="7"
              refY="4"
              markerWidth="8"
              markerHeight="8"
              markerUnits="userSpaceOnUse"
              orient="auto"
            >
              <path d="M0 0 L8 4 L0 8 Z" fill="currentColor" />
            </marker>
          </defs>
        )}
        <path
          d={path}
          fill="none"
          stroke="currentColor"
          style={{ strokeWidth: 'var(--edge-width)' }}
          strokeDasharray={dashed ? '4 4' : undefined}
          strokeLinejoin="round"
          markerEnd={plain ? undefined : `url(#${markerId})`}
        />
      </svg>
      {label != null && (
        <span
          className="absolute whitespace-nowrap text-muted"
          style={{
            left: geometry.labelAt.x,
            top: geometry.labelAt.y,
            transform: LABEL_TRANSFORM[side],
          }}
        >
          {label}
        </span>
      )}
    </>,
    overlay,
  )
}

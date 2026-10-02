import { useEffect, useRef, useState } from "react"
import { Maximize, PauseFilled, PlayFilledAlt } from "@carbon/icons-react"
import type { CSSProperties } from "react"

const SRC = "/media/fraud-engine.mp4"
const POSTER = "/media/fraud-engine-poster.webp"

/** `m:ss`, comme le design. */
const clock = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`

const CONTROL =
  "flex h-6 w-7 flex-none items-center justify-center text-foreground hover:text-foreground-strong"

export function VideoPlayer() {
  const video = useRef<HTMLVideoElement>(null)
  const started = useRef(false)
  const userPaused = useRef(false)
  const reduced = useRef(false)
  const [time, setTime] = useState({ current: 0, duration: 0 })
  const [playing, setPlaying] = useState(false)
  const [ready, setReady] = useState(false)
  const [controls, setControls] = useState(false)

  const play = () => {
    void video.current?.play().catch(() => {})
  }
  // La source n'est posée qu'au premier besoin : aucun octet de la vidéo avant.
  const load = () => {
    const el = video.current
    if (el && !started.current) {
      started.current = true
      el.src = SRC
    }
  }

  useEffect(() => {
    const el = video.current
    if (!el) return
    el.defaultMuted = true
    el.muted = true
    reduced.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (reduced.current || userPaused.current) return
          load()
          play()
        } else if (!el.paused && !document.fullscreenElement) {
          el.pause()
        }
      },
      { threshold: 0.35 }
    )
    observer.observe(el)

    const onFullscreen = () => {
      if (!document.fullscreenElement) {
        el.controls = false
        setControls(false)
      }
    }
    document.addEventListener("fullscreenchange", onFullscreen)
    return () => {
      observer.disconnect()
      document.removeEventListener("fullscreenchange", onFullscreen)
    }
  }, [])

  const sync = () => {
    const el = video.current
    if (el) {
      setTime({ current: el.currentTime, duration: el.duration || 0 })
      setPlaying(!el.paused)
    }
  }

  const toggle = () => {
    const el = video.current
    if (!el) return
    if (el.paused) {
      userPaused.current = false
      load()
      play()
    } else {
      userPaused.current = true
      el.pause()
    }
  }

  const seek = (fraction: number) => {
    const el = video.current
    if (!el?.duration) return
    el.currentTime = fraction * el.duration
    setTime({ current: el.currentTime, duration: el.duration })
  }

  const fullscreen = () => {
    const el = video.current
    if (!el) return
    load()
    el.controls = true
    setControls(true)
    const fallback = () => {
      el.controls = false
      setControls(false)
      // Safari iOS ne connaît que son propre plein écran.
      const ios = el as HTMLVideoElement & {
        webkitEnterFullscreen?: () => void
      }
      ios.webkitEnterFullscreen?.()
    }
    if ("requestFullscreen" in el) el.requestFullscreen().catch(fallback)
    else fallback()
  }

  const fraction = time.duration ? time.current / time.duration : 0

  return (
    <div className="bg-surface-deep">
      <div className="relative aspect-video overflow-hidden border-b border-border bg-surface-deep">
        <video
          ref={video}
          muted
          loop
          playsInline
          preload="none"
          controls={controls}
          onTimeUpdate={sync}
          onLoadedMetadata={sync}
          onDurationChange={sync}
          onPlay={sync}
          onPause={sync}
          onLoadedData={() => setReady(true)}
          className="absolute inset-0 block size-full object-contain"
        />
        {ready ? null : (
          <img
            src={POSTER}
            alt=""
            loading="lazy"
            decoding="async"
            className="pointer-events-none absolute inset-0 block size-full object-contain"
          />
        )}
        <span className="absolute bottom-0 left-0 bg-veil-70 px-2 py-0.75 font-mono text-micro text-foreground">
          2 generators · 1 → 3 scorers
        </span>
      </div>
      <div className="flex items-center gap-2 border-b border-border bg-background px-3 py-2 font-mono text-small text-muted-foreground labels:gap-3">
        <button
          type="button"
          onClick={toggle}
          aria-label="play / pause"
          className={CONTROL}
        >
          {playing ? (
            <PauseFilled aria-hidden size={14} />
          ) : (
            <PlayFilledAlt aria-hidden size={14} />
          )}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step="any"
          value={fraction}
          onChange={(event) => seek(event.currentTarget.valueAsNumber)}
          aria-label="seek"
          className="seek min-w-0 flex-1"
          style={{ "--seek": fraction * 100 } as CSSProperties}
        />
        <span className="flex-none whitespace-nowrap">
          {clock(time.current)} / {clock(time.duration)}
        </span>
        <button
          type="button"
          onClick={fullscreen}
          aria-label="fullscreen"
          className={CONTROL}
        >
          <Maximize aria-hidden size={14} />
        </button>
      </div>
    </div>
  )
}

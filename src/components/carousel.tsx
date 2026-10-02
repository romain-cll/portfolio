import { useState } from "react"

import { cn } from "@/lib/utils"

const ARROW =
  "absolute top-1/2 flex size-7 -translate-y-1/2 items-center justify-center bg-veil-50 font-mono text-sm leading-none hover:bg-veil-70"

export function Carousel({
  name,
  shots,
}: {
  name: string
  shots: readonly string[]
}) {
  const [index, setIndex] = useState(0)
  const step = (delta: number) =>
    setIndex((value) => (value + delta + shots.length) % shots.length)

  return (
    <div className="relative aspect-shot overflow-hidden border-b border-border bg-screenshot">
      {shots.map((src, i) => (
        <img
          key={src}
          src={src}
          alt={`${name} — screenshot`}
          loading="lazy"
          decoding="async"
          className={cn(
            "absolute inset-0 block size-full object-contain object-center transition-opacity duration-300",
            i === index ? "opacity-100" : "opacity-0"
          )}
        />
      ))}
      <button
        type="button"
        onClick={() => step(-1)}
        aria-label="previous screenshot"
        className={cn(ARROW, "left-0")}
      >
        ‹
      </button>
      <button
        type="button"
        onClick={() => step(1)}
        aria-label="next screenshot"
        className={cn(ARROW, "right-0")}
      >
        ›
      </button>
      <span className="absolute right-0 bottom-0 bg-veil-50 px-1.5 py-0.5 font-mono text-micro">
        {index + 1} / {shots.length}
      </span>
    </div>
  )
}

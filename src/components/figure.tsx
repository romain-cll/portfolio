import { useState } from 'react'
import type { ReactNode } from 'react'

type FigureProps = {
  /** Missing while the image isn't made yet: the placeholder shows instead */
  src?: string
  /** Also the placeholder text, when the image is missing or fails to load */
  alt: string
  caption?: ReactNode
  /** CSS aspect-ratio of the frame, kept by the placeholder so nothing shifts */
  ratio?: string
}

export function Figure({ src, alt, caption, ratio = '16 / 10' }: FigureProps) {
  // Keyed on the src, so a new image gets its own try
  const [failedSrc, setFailedSrc] = useState<string>()
  const failed = !src || failedSrc === src

  return (
    <figure className="flex flex-col gap-(--gap-caption)">
      <div
        style={{ aspectRatio: ratio }}
        className="overflow-hidden rounded-md border border-surface-border bg-surface"
      >
        {failed ? (
          <div className="flex size-full items-center justify-center p-4 text-center text-muted">
            {alt}
          </div>
        ) : (
          <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="size-full object-cover"
            onError={() => setFailedSrc(src)}
            // A server-rendered image can fail before React listens to onError
            ref={(img) => {
              if (img?.complete && img.naturalWidth === 0) setFailedSrc(src)
            }}
          />
        )}
      </div>
      {caption && <figcaption className="text-muted">{caption}</figcaption>}
    </figure>
  )
}

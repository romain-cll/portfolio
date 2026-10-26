import { useRef, useState } from 'react'
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

const iconButton =
  'grid size-8 cursor-pointer place-items-center rounded-md border border-divider bg-bg text-text'
const icon =
  'size-4 fill-none stroke-current stroke-[1.5] [stroke-linecap:round] [stroke-linejoin:round]'

export function Figure({ src, alt, caption, ratio = '16 / 10' }: FigureProps) {
  // Keyed on the src, so a new image gets its own try
  const [failedSrc, setFailedSrc] = useState<string>()
  const failed = !src || failedSrc === src
  const lightbox = useRef<HTMLDialogElement>(null)

  return (
    <figure className="flex flex-col gap-(--gap-caption)">
      <div
        style={{ aspectRatio: ratio }}
        className="group relative overflow-hidden rounded-md border border-divider bg-surface"
      >
        {failed ? (
          <div className="flex size-full items-center justify-center p-4 text-center text-muted">
            {alt}
          </div>
        ) : (
          <>
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
            <button
              type="button"
              aria-label="Enlarge image"
              onClick={() => lightbox.current?.showModal()}
              // Shown on hover or keyboard focus; always there on touch screens, which can't hover
              className={`${iconButton} absolute right-2 bottom-2 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100`}
            >
              <svg viewBox="0 0 16 16" aria-hidden="true" className={icon}>
                <path d="M10 2.5h3.5V6M13.5 2.5 9 7M6 13.5H2.5V10M2.5 13.5 7 9" />
              </svg>
            </button>
          </>
        )}
      </div>
      {caption && <figcaption className="text-muted">{caption}</figcaption>}

      {/* Lightbox: the image as large as the screen allows, over a dimmed, blurred page.
          Native dialog: Escape closes it and keyboard focus stays inside */}
      {!failed && (
        <dialog
          ref={lightbox}
          aria-label={alt}
          // A click outside the image closes it, like the close button: the
          // dialog fills the screen, so only clicks around the image land on it
          onClick={(event) => {
            if (event.target === event.currentTarget) lightbox.current?.close()
          }}
          className="m-0 size-full max-h-none max-w-none cursor-zoom-out items-center justify-center bg-transparent p-4 transition-opacity duration-200 open:flex backdrop:bg-black/60 backdrop:backdrop-blur-sm backdrop:transition-opacity backdrop:duration-200 motion-reduce:transition-none sm:p-12 starting:open:opacity-0 starting:open:backdrop:opacity-0"
        >
          <img
            src={src}
            alt={alt}
            className="max-h-full max-w-full cursor-auto rounded-md object-contain"
          />
          <form method="dialog">
            <button
              aria-label="Close"
              className={`${iconButton} absolute top-4 right-4`}
            >
              <svg viewBox="0 0 16 16" aria-hidden="true" className={icon}>
                <path d="m4 4 8 8M12 4l-8 8" />
              </svg>
            </button>
          </form>
        </dialog>
      )}
    </figure>
  )
}

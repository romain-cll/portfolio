import type { CSSProperties, ElementType, ReactNode } from "react"

import { cn } from "@/lib/utils"

/** Élément révélé par le défilement : opacité et montée entre `from` et `to` (progression de la section). */
export function Reveal({
  as: Tag = "div",
  from,
  to,
  dy = 18,
  scale = false,
  className,
  children,
}: {
  as?: ElementType
  from: number
  to: number
  dy?: number
  scale?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    <Tag
      className={cn("reveal", scale && "reveal-scale", className)}
      style={{ "--from": from, "--to": to, "--dy": dy } as CSSProperties}
    >
      {children}
    </Tag>
  )
}

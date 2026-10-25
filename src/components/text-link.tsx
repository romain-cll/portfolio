import type { ComponentProps, ReactNode } from 'react'

type TextLinkProps = ComponentProps<'a'> & {
  /** `inline`: link inside running text, always underlined in --border */
  variant?: 'default' | 'inline'
  iconLeft?: ReactNode
  iconRight?: ReactNode
}

const variants = {
  default: 'hover:underline',
  inline: 'text-text underline decoration-border',
}

export function TextLink({
  variant = 'default',
  iconLeft,
  iconRight,
  className,
  children,
  ...props
}: TextLinkProps) {
  return (
    <a
      className={[
        'underline-offset-(--underline-offset) decoration-(length:--underline-thickness)',
        variants[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {iconLeft && (
        <>
          <Icon>{iconLeft}</Icon>{' '}
        </>
      )}
      {children}
      {iconRight && (
        <>
          {' '}
          <Icon>{iconRight}</Icon>
        </>
      )}
    </a>
  )
}

// Text glyphs (↗) render as is; SVG icons are sized to the text
function Icon({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className="[&>svg]:inline-block [&>svg]:size-[1em] [&>svg]:align-[-0.125em]"
    >
      {children}
    </span>
  )
}

import type { ReactNode } from 'react'

export type Item = { title: ReactNode; detail?: ReactNode }

/** Title, then a muted detail under it, like the home's Experience */
export function ItemList({ items }: { items: Array<Item> }) {
  return (
    <ul className="flex flex-col gap-(--gap-items)">
      {items.map(({ title, detail }, index) => (
        <li key={index}>
          <p>{title}</p>
          {detail && <p className="text-muted">{detail}</p>}
        </li>
      ))}
    </ul>
  )
}

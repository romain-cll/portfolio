import type { ReactNode } from 'react'

export type Detail = { label: string; value: ReactNode }

/** Label on the left, value on the right: Information, Contact, Results */
export function DetailList({ items }: { items: Array<Detail> }) {
  return (
    <dl className="flex flex-col gap-(--gap-info)">
      {items.map(({ label, value }) => (
        <div key={label} className="flex justify-between gap-(--gap-inline)">
          <dt className="text-muted">{label}</dt>
          <dd className="text-right">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

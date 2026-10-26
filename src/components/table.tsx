import type { ReactNode } from 'react'

type Column = {
  header: string
  /** `right` for numbers, so their digits line up */
  align?: 'left' | 'right'
  /** Secondary values, in --muted */
  muted?: boolean
}

type TableProps = {
  columns: Array<Column>
  /** One value per column; the first one names the row */
  rows: Array<Array<ReactNode>>
  /** Last row in --text and medium weight: the outcome of the rows above */
  highlightLast?: boolean
  caption?: ReactNode
}

export function Table({ columns, rows, highlightLast, caption }: TableProps) {
  return (
    <figure className="flex flex-col gap-(--gap-caption)">
      {/* Scrolls sideways rather than crushing columns on narrow screens */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-divider text-muted">
              {columns.map(({ header, align }) => (
                <th
                  key={header}
                  scope="col"
                  className={`pb-2.5 font-normal ${alignment(align)}`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => {
              const highlighted = highlightLast && rowIndex === rows.length - 1

              return (
                <tr
                  key={rowIndex}
                  className={`border-b border-divider last:border-0 ${highlighted ? 'font-(--weight-medium)' : ''}`}
                >
                  {row.map((value, columnIndex) => {
                    const { align, muted } = columns[columnIndex]
                    // The first cell heads its row, for screen readers
                    const Cell = columnIndex === 0 ? 'th' : 'td'

                    return (
                      <Cell
                        key={columnIndex}
                        scope={columnIndex === 0 ? 'row' : undefined}
                        className={`py-2.5 [font-weight:inherit] ${alignment(align)} ${muted && !highlighted ? 'text-muted' : ''}`}
                      >
                        {value}
                      </Cell>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {caption && <figcaption className="text-muted">{caption}</figcaption>}
    </figure>
  )
}

// Right-aligned columns keep a gap from the column before and never wrap
function alignment(align: Column['align'] = 'left') {
  return align === 'right'
    ? 'pl-(--gap-inline) text-right whitespace-nowrap'
    : 'text-left'
}

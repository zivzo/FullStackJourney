import { href } from '../hooks/useHashRoute'

export interface Crumb {
  label: string
  segments?: string[]
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="breadcrumbs">
      <ol>
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={item.label}>
              {isLast || !item.segments ? (
                <span aria-current={isLast ? 'page' : undefined}>{item.label}</span>
              ) : (
                <a href={href(...item.segments)}>{item.label}</a>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

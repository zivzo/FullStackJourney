import { href } from '../hooks/useHashRoute'

export function NotFoundPage() {
  return (
    <section className="intro">
      <h1>Page not found</h1>
      <p>
        That page doesn&apos;t exist. <a href={href()}>Back to all skills</a>
      </p>
    </section>
  )
}

import { href } from '../hooks/useHashRoute'
import { tracks } from '../data/skills'

export function HomePage() {
  return (
    <>
      <section className="intro">
        <h1>Full-Stack Developer Skills</h1>
        <p>
          A roadmap of the skills a full-stack developer needs. Pick an area to
          explore its topics, key concepts and learning resources.
        </p>
      </section>

      <ul className="card-grid">
        {tracks.map((track) => (
          <li key={track.id}>
            <a className="card" href={href(track.id)}>
              <span className="card-icon" aria-hidden="true">
                {track.icon}
              </span>
              <h2>{track.title}</h2>
              <p>{track.description}</p>
              <span className={`badge badge-${track.status}`}>
                {track.status === 'active'
                  ? `${track.topics.length} topics`
                  : 'Coming soon'}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </>
  )
}

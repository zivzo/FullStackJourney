import { Breadcrumbs } from '../components/Breadcrumbs'
import { href } from '../hooks/useHashRoute'
import type { Topic, Track } from '../data/skills'

interface TopicPageProps {
  track: Track
  topic: Topic
}

export function TopicPage({ track, topic }: TopicPageProps) {
  const index = track.topics.indexOf(topic)
  const previous = track.topics[index - 1]
  const next = track.topics[index + 1]

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Home', segments: [] },
          { label: track.title, segments: [track.id] },
          { label: topic.title },
        ]}
      />

      <section className="intro">
        <h1>{topic.title}</h1>
        <p>{topic.summary}</p>
        <span className={`badge badge-${topic.level}`}>{topic.level}</span>
      </section>

      <section className="panel">
        <h2>Key concepts</h2>
        <ul className="checklist">
          {topic.concepts.map((concept) => (
            <li key={concept}>{concept}</li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h2>Resources</h2>
        <ul className="resources">
          {topic.resources.map((resource) => (
            <li key={resource.url}>
              <a href={resource.url} target="_blank" rel="noreferrer">
                {resource.label} ↗
              </a>
            </li>
          ))}
        </ul>
      </section>

      <nav className="pager" aria-label="Topic navigation">
        {previous ? (
          <a href={href(track.id, previous.id)}>← {previous.title}</a>
        ) : (
          <span />
        )}
        {next ? <a href={href(track.id, next.id)}>{next.title} →</a> : <span />}
      </nav>
    </>
  )
}

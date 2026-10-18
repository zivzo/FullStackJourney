import { Breadcrumbs } from '../components/Breadcrumbs'
import { href } from '../hooks/useHashRoute'
import type { Track } from '../data/skills'

export function TrackPage({ track }: { track: Track }) {
  return (
    <>
      <Breadcrumbs items={[{ label: 'Home', segments: [] }, { label: track.title }]} />

      <section className="intro">
        <h1>
          <span aria-hidden="true">{track.icon}</span> {track.title}
        </h1>
        <p>{track.description}</p>
      </section>

      {track.topics.length === 0 ? (
        <p className="empty">
          This area is coming soon. Start with the{' '}
          <a href={href('frontend')}>Frontend</a> track in the meantime.
        </p>
      ) : (
        <ol className="topic-list">
          {track.topics.map((topic, index) => (
            <li key={topic.id}>
              <a className="card topic-card" href={href(track.id, topic.id)}>
                <span className="step">{index + 1}</span>
                <div>
                  <h2>{topic.title}</h2>
                  <p>{topic.summary}</p>
                  {(topic.exercises?.length ?? 0) + (topic.frontendExercises?.length ?? 0) > 0 && (
                    <p className="topic-meta">
                      🧪 {(topic.exercises?.length ?? 0) + (topic.frontendExercises?.length ?? 0)} live{' '}
                      {(topic.exercises?.length ?? 0) + (topic.frontendExercises?.length ?? 0) === 1
                        ? 'exercise'
                        : 'exercises'}
                    </p>
                  )}
                </div>
                <span className={`badge badge-${topic.level}`}>{topic.level}</span>
              </a>
            </li>
          ))}
        </ol>
      )}
    </>
  )
}

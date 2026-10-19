import { Breadcrumbs } from '../components/Breadcrumbs'
import { CodeExampleBlock } from '../components/CodeExampleBlock'
import { ExerciseCard } from '../components/ExerciseCard'
import { ExerciseList } from '../components/ExerciseList'
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

      {topic.examples && topic.examples.length > 0 && (
        <section className="panel">
          <h2>Examples</h2>
          {topic.examples.map((example) => (
            <CodeExampleBlock key={example.title} example={example} />
          ))}
        </section>
      )}

      {topic.exercises && topic.exercises.length > 0 && (
        <section className="panel">
          <h2>Practice</h2>
          <p className="panel-intro">
            Write JavaScript in the editor and run the tests. Your code runs in a sandboxed worker
            right here in the browser.
          </p>
          {topic.exercises.map((exercise) => {
            const storageKey = `fullstackjourney:exercise:${track.id}/${topic.id}/${exercise.id}`
            return <ExerciseCard key={storageKey} exercise={exercise} storageKey={storageKey} />
          })}
        </section>
      )}

      {topic.frontendExercises && topic.frontendExercises.length > 0 && (
        <ExerciseList key={topic.id} topicId={topic.id} exercises={topic.frontendExercises} />
      )}

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

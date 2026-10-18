import { useCallback, useState } from 'react'
import { isCompleted, loadDraft, markCompleted } from '../playground/storage'
import type { Exercise } from '../playground/types'
import { InlineCode } from './InlineCode'
import { Playground } from './Playground'

interface ExerciseListProps {
  topicId: string
  exercises: Exercise[]
}

export function ExerciseList({ topicId, exercises }: ExerciseListProps) {
  return (
    <section className="panel">
      <h2>Exercises</h2>
      <p className="panel-intro">
        Practice by writing real code. The preview updates live as you type; press{' '}
        <strong>Check my code</strong> when you think you are done. Your code is saved in this
        browser.
      </p>
      <ol className="exercise-list">
        {exercises.map((exercise, index) => (
          <ExerciseCard
            key={exercise.id}
            number={index + 1}
            exercise={exercise}
            storageKey={`${topicId}/${exercise.id}`}
          />
        ))}
      </ol>
    </section>
  )
}

interface ExerciseCardProps {
  number: number
  exercise: Exercise
  storageKey: string
}

function ExerciseCard({ number, exercise, storageKey }: ExerciseCardProps) {
  const [draft] = useState(() => loadDraft(storageKey, exercise.starter))
  const [open, setOpen] = useState(draft !== null)
  const [completed, setCompleted] = useState(() => isCompleted(storageKey))

  const onComplete = useCallback(() => {
    markCompleted(storageKey)
    setCompleted(true)
  }, [storageKey])

  return (
    <li className="exercise">
      <div className="exercise-header">
        <h3>
          {number}. {exercise.title}
        </h3>
        {completed && <span className="badge badge-done">✓ Completed</span>}
      </div>

      <ol className="exercise-steps">
        {exercise.instructions.map((step) => (
          <li key={step}>
            <InlineCode text={step} />
          </li>
        ))}
      </ol>

      {exercise.hints && exercise.hints.length > 0 && (
        <details className="hints">
          <summary>Hints</summary>
          <ul>
            {exercise.hints.map((hint) => (
              <li key={hint}>
                <InlineCode text={hint} />
              </li>
            ))}
          </ul>
        </details>
      )}

      {open ? (
        <Playground
          exercise={exercise}
          storageKey={storageKey}
          initialFiles={draft ?? exercise.starter}
          onComplete={onComplete}
        />
      ) : (
        <button type="button" className="button button-primary" onClick={() => setOpen(true)}>
          Start coding
        </button>
      )}
    </li>
  )
}

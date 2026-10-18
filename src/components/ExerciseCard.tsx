import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import type { Exercise } from '../data/skills'
import type { RunResult } from '../lib/exerciseHarness'
import { runExercise } from '../lib/runExercise'
import { InlineText } from './InlineText'

const INDENT = '  '

function loadCode(storageKey: string, fallback: string): string {
  try {
    return localStorage.getItem(storageKey) ?? fallback
  } catch {
    return fallback
  }
}

function saveCode(storageKey: string, code: string, starterCode: string) {
  try {
    if (code === starterCode) localStorage.removeItem(storageKey)
    else localStorage.setItem(storageKey, code)
  } catch {
    // Storage can be unavailable (e.g. private mode); progress just won't persist.
  }
}

interface ExerciseCardProps {
  exercise: Exercise
  storageKey: string
}

export function ExerciseCard({ exercise, storageKey }: ExerciseCardProps) {
  const [code, setCode] = useState(() => loadCode(storageKey, exercise.starterCode))
  const [result, setResult] = useState<RunResult | null>(null)
  const [running, setRunning] = useState(false)
  const [hintsShown, setHintsShown] = useState(0)
  const [showSolution, setShowSolution] = useState(false)
  const escapePressed = useRef(false)
  const baseId = storageKey.replace(/[^\w-]/g, '-')
  const editorId = `${baseId}-editor`
  const helpId = `${baseId}-help`

  const updateCode = (next: string) => {
    setCode(next)
    saveCode(storageKey, next, exercise.starterCode)
  }

  const run = async () => {
    if (running) return
    setRunning(true)
    setResult(await runExercise(code, exercise.tests))
    setRunning(false)
  }

  const reset = () => {
    updateCode(exercise.starterCode)
    setResult(null)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      void run()
      return
    }
    if (event.key === 'Escape') {
      escapePressed.current = true
      return
    }
    if (event.key === 'Tab' && !event.shiftKey && !escapePressed.current) {
      event.preventDefault()
      const textarea = event.currentTarget
      const { selectionStart, selectionEnd } = textarea
      updateCode(code.slice(0, selectionStart) + INDENT + code.slice(selectionEnd))
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + INDENT.length
      })
    }
    escapePressed.current = false
  }

  const passed = result?.results.filter((test) => test.passed).length ?? 0
  const allPassed = !!result && !result.error && passed === exercise.tests.length

  return (
    <article className="exercise">
      <header className="exercise-header">
        <h3>{exercise.title}</h3>
        {allPassed && <span className="badge badge-solved">Solved</span>}
      </header>
      <p>
        <InlineText text={exercise.prompt} />
      </p>

      <label className="visually-hidden" htmlFor={editorId}>
        Code editor for {exercise.title}
      </label>
      <textarea
        id={editorId}
        className="code-editor"
        value={code}
        onChange={(event) => updateCode(event.target.value)}
        onKeyDown={onKeyDown}
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        rows={Math.min(Math.max(code.split('\n').length + 1, 8), 30)}
        aria-describedby={helpId}
      />
      <p id={helpId} className="editor-help">
        Tab indents · Esc then Tab leaves the editor · Ctrl/⌘ + Enter runs the tests. Your code is
        saved in this browser.
      </p>

      <div className="exercise-actions">
        <button type="button" className="button button-primary" onClick={run} disabled={running}>
          {running ? 'Running…' : '▶ Run tests'}
        </button>
        <button
          type="button"
          className="button"
          onClick={() => setHintsShown((count) => count + 1)}
          disabled={hintsShown >= exercise.hints.length}
        >
          Hint ({hintsShown}/{exercise.hints.length})
        </button>
        <button type="button" className="button" onClick={() => setShowSolution((show) => !show)}>
          {showSolution ? 'Hide solution' : 'Show solution'}
        </button>
        <button type="button" className="button" onClick={reset}>
          Reset
        </button>
      </div>

      {hintsShown > 0 && (
        <ol className="hints">
          {exercise.hints.slice(0, hintsShown).map((hint) => (
            <li key={hint}>
              💡 <InlineText text={hint} />
            </li>
          ))}
        </ol>
      )}

      <div aria-live="polite">
        {result && (
          <div className="results">
            {result.error ? (
              <p className="result-error">⚠ {result.error}</p>
            ) : (
              <>
                <p className={allPassed ? 'result-summary pass' : 'result-summary fail'}>
                  {allPassed
                    ? `🎉 All ${exercise.tests.length} tests passed!`
                    : `${passed} of ${exercise.tests.length} tests passed`}
                </p>
                <ul className="test-results">
                  {result.results.map((test) => (
                    <li key={test.name} className={test.passed ? 'pass' : 'fail'}>
                      <span aria-hidden="true">{test.passed ? '✔' : '✘'}</span>{' '}
                      <span className="visually-hidden">{test.passed ? 'Passed:' : 'Failed:'}</span>
                      {test.name}
                      {test.message && <div className="test-message">{test.message}</div>}
                    </li>
                  ))}
                </ul>
              </>
            )}
            {result.logs.length > 0 && (
              <>
                <h4>Console output</h4>
                <pre className="code-block console-output">{result.logs.join('\n')}</pre>
              </>
            )}
          </div>
        )}
      </div>

      {showSolution && (
        <div className="solution">
          <h4>Solution</h4>
          <pre className="code-block">
            <code>{exercise.solution}</code>
          </pre>
        </div>
      )}
    </article>
  )
}

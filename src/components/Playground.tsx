import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { buildDocument, isFrameMessage, type CheckOutcome, type ConsoleLevel } from '../playground/document'
import { prepareCode, type Problem } from '../playground/prepare'
import { saveDraft, setRunning, wasInterrupted } from '../playground/storage'
import type { Exercise, ExerciseFiles, FileName } from '../playground/types'
import { CodeEditor } from './CodeEditor'
import { InlineCode } from './InlineCode'

const FILE_LABELS: Record<FileName, string> = {
  html: 'index.html',
  css: 'styles.css',
  js: 'script.js',
  ts: 'script.ts',
  jsx: 'App.jsx',
  json: 'package.json',
}

const PREVIEW_DELAY_MS = 350
const CHECK_TIMEOUT_MS = 10_000
const MAX_LOG_ENTRIES = 200
// Scripts and forms may run, but the frame gets an opaque origin and cannot touch this page.
const SANDBOX = 'allow-scripts allow-forms'
const TYPE_CHECK_LABEL = 'The code compiles without TypeScript errors'

interface Frame {
  runId: string
  srcDoc: string
}

interface PreviewFrame extends Frame {
  /** The files this preview was built from. */
  files: ExerciseFiles
}

interface LogEntry {
  id: number
  level: ConsoleLevel
  text: string
}

type CheckState =
  | { status: 'idle' }
  | { status: 'running' }
  | { status: 'done'; results: CheckOutcome[]; files: ExerciseFiles }

interface PlaygroundProps {
  exercise: Exercise
  storageKey: string
  initialFiles: ExerciseFiles
  onComplete: () => void
}

function createRunId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

function sameFiles(a: ExerciseFiles, b: ExerciseFiles): boolean {
  const names = new Set([...Object.keys(a), ...Object.keys(b)] as FileName[])
  return [...names].every((name) => a[name] === b[name])
}

export function Playground({ exercise, storageKey, initialFiles, onComplete }: PlaygroundProps) {
  const baseId = useId()
  const fileNames = Object.keys(exercise.starter) as FileName[]
  const typeChecked = exercise.starter.ts !== undefined
  const hasPreview = exercise.preview ?? (exercise.starter.html !== undefined || exercise.react === true)
  const checkLabels = [...(typeChecked ? [TYPE_CHECK_LABEL] : []), ...exercise.checks.map((check) => check.label)]

  const [files, setFiles] = useState<ExerciseFiles>(initialFiles)
  const [activeFile, setActiveFile] = useState<FileName>(fileNames[0])
  const [preview, setPreview] = useState<PreviewFrame | null>(null)
  const [problems, setProblems] = useState<Problem[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [checkFrame, setCheckFrame] = useState<Frame | null>(null)
  const [checkState, setCheckState] = useState<CheckState>({ status: 'idle' })
  // Don't run code automatically if the last run never finished, or the page could freeze again.
  const [paused, setPaused] = useState(() => wasInterrupted(storageKey))

  const previewRef = useRef<HTMLIFrameElement>(null)
  const checkRef = useRef<HTMLIFrameElement>(null)
  const previewRunId = useRef('')
  const pendingCheck = useRef<{ runId: string; files: ExerciseFiles; typeErrors: boolean } | null>(null)
  const checkTimer = useRef<number | undefined>(undefined)
  const logId = useRef(0)
  const tabRefs = useRef<Partial<Record<FileName, HTMLButtonElement | null>>>({})

  // Rebuild the live preview shortly after the learner stops typing.
  useEffect(() => {
    if (paused) return
    let cancelled = false
    const timer = window.setTimeout(async () => {
      const prepared = await prepareCode(exercise, files)
      if (cancelled) return
      const runId = createRunId()
      previewRunId.current = runId
      setRunning(storageKey, 'preview', true)
      setProblems(prepared.problems)
      setLogs([])
      setPreview({
        runId,
        files,
        srcDoc: buildDocument({
          runId,
          files,
          script: prepared.script,
          setup: exercise.setup,
          reactRuntime: prepared.reactRuntime,
        }),
      })
    }, PREVIEW_DELAY_MS)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [exercise, files, paused, storageKey])

  useEffect(
    () => () => {
      setRunning(storageKey, 'preview', false)
      setRunning(storageKey, 'checks', false)
    },
    [storageKey],
  )

  useEffect(() => {
    saveDraft(storageKey, sameFiles(files, exercise.starter) ? null : files)
  }, [storageKey, exercise, files])

  const finishChecks = useCallback(
    (results: CheckOutcome[]) => {
      const pending = pendingCheck.current
      if (!pending) return
      pendingCheck.current = null
      setRunning(storageKey, 'checks', false)
      window.clearTimeout(checkTimer.current)
      setCheckFrame(null)

      const all = typeChecked
        ? [
            {
              passed: !pending.typeErrors,
              error: pending.typeErrors ? 'See the problems listed below the editor.' : undefined,
            },
            ...results,
          ]
        : results
      setCheckState({ status: 'done', results: all, files: pending.files })
      if (all.length > 0 && all.every((result) => result.passed)) onComplete()
    },
    [typeChecked, onComplete, storageKey],
  )

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      const { data } = event
      if (!isFrameMessage(data)) return

      if (
        data.type === 'loaded' &&
        data.runId === previewRunId.current &&
        event.source === previewRef.current?.contentWindow
      ) {
        setRunning(storageKey, 'preview', false)
      } else if (
        data.type === 'console' &&
        data.runId === previewRunId.current &&
        event.source === previewRef.current?.contentWindow
      ) {
        const entry = { id: logId.current++, level: data.level, text: String(data.text) }
        setLogs((current) => [...current, entry].slice(-MAX_LOG_ENTRIES))
      } else if (
        data.type === 'checks' &&
        data.runId === pendingCheck.current?.runId &&
        event.source === checkRef.current?.contentWindow &&
        Array.isArray(data.results)
      ) {
        finishChecks(
          exercise.checks.map((_, index) => ({
            passed: data.results[index]?.passed === true,
            error: typeof data.results[index]?.error === 'string' ? data.results[index].error : undefined,
          })),
        )
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [exercise, finishChecks, storageKey])

  useEffect(() => () => window.clearTimeout(checkTimer.current), [])

  async function runChecks() {
    setCheckState({ status: 'running' })
    const snapshot = files
    const prepared = await prepareCode(exercise, snapshot)
    const runId = createRunId()
    setRunning(storageKey, 'checks', true)
    pendingCheck.current = {
      runId,
      files: snapshot,
      typeErrors: prepared.problems.some((problem) => problem.file === 'ts'),
    }
    window.clearTimeout(checkTimer.current)
    checkTimer.current = window.setTimeout(() => {
      finishChecks(
        exercise.checks.map(() => ({
          passed: false,
          error: 'The checks timed out. Is there an infinite loop or an error that stops the page from loading?',
        })),
      )
    }, CHECK_TIMEOUT_MS)
    setCheckFrame({
      runId,
      srcDoc: buildDocument({
        runId,
        files: snapshot,
        script: prepared.script,
        setup: exercise.setup,
        reactRuntime: prepared.reactRuntime,
        checks: exercise.checks,
      }),
    })
  }

  function replaceFiles(next: ExerciseFiles, question: string) {
    if (sameFiles(files, next) || window.confirm(question)) {
      setFiles(next)
      setCheckState({ status: 'idle' })
    }
  }

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const offsets: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1 }
    let index = fileNames.indexOf(activeFile)
    if (event.key in offsets) index = (index + offsets[event.key] + fileNames.length) % fileNames.length
    else if (event.key === 'Home') index = 0
    else if (event.key === 'End') index = fileNames.length - 1
    else return
    event.preventDefault()
    setActiveFile(fileNames[index])
    tabRefs.current[fileNames[index]]?.focus()
  }

  const updating = !paused && preview?.files !== files
  const results = checkState.status === 'done' ? checkState.results : null
  const passedCount = results?.filter((result) => result.passed).length ?? 0
  const allPassed = results !== null && passedCount === results.length
  const stale = checkState.status === 'done' && !sameFiles(checkState.files, files)

  const consolePanel = (
    <div className="console">
      <h4>Console</h4>
      {logs.length === 0 ? (
        <p className="pane-note">Output from console.log() appears here.</p>
      ) : (
        <ul>
          {logs.map((entry) => (
            <li key={entry.id} className={`console-${entry.level}`}>
              {entry.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  )

  return (
    <div className="playground">
      <div className="playground-toolbar">
        <div role="tablist" aria-label="Files" className="file-tabs">
          {fileNames.map((name) => (
            <button
              key={name}
              ref={(element) => {
                tabRefs.current[name] = element
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${name}`}
              aria-selected={name === activeFile}
              aria-controls={`${baseId}-panel`}
              tabIndex={name === activeFile ? 0 : -1}
              onClick={() => setActiveFile(name)}
              onKeyDown={onTabKeyDown}
            >
              {FILE_LABELS[name]}
            </button>
          ))}
        </div>
        <div className="playground-actions">
          <button
            type="button"
            className="button"
            onClick={() => replaceFiles(exercise.starter, 'Reset to the starter code? Your changes will be lost.')}
          >
            Reset
          </button>
          <button
            type="button"
            className="button"
            onClick={() => replaceFiles(exercise.solution, 'Replace your code with the solution?')}
          >
            Show solution
          </button>
        </div>
      </div>

      {paused && (
        <div className="playground-notice" role="alert">
          <p>
            The last run of this code did not finish — it may contain an infinite loop. The preview is
            paused so you can fix the code first.
          </p>
          <button type="button" className="button button-primary" onClick={() => setPaused(false)}>
            Run code
          </button>
        </div>
      )}

      <div className="playground-body">
        <div
          className="editor-pane"
          role="tabpanel"
          id={`${baseId}-panel`}
          aria-labelledby={`${baseId}-tab-${activeFile}`}
        >
          <CodeEditor
            id={`${baseId}-editor`}
            label={`${FILE_LABELS[activeFile]} editor`}
            value={files[activeFile] ?? ''}
            onChange={(value) => setFiles((current) => ({ ...current, [activeFile]: value }))}
          />
          <p id={`${baseId}-editor-help`} className="pane-note">
            Tab indents · Shift+Tab outdents · Esc then Tab leaves the editor
          </p>
        </div>

        <div className="preview-pane">
          {hasPreview ? (
            <div className="pane-label">
              <span>Preview</span>
              {updating && <span className="pane-note">Updating…</span>}
            </div>
          ) : (
            consolePanel
          )}
          {preview && !paused && (
            <iframe
              key={preview.runId}
              ref={previewRef}
              className={hasPreview ? 'preview-frame' : 'hidden-frame'}
              title={`Live preview: ${exercise.title}`}
              sandbox={SANDBOX}
              srcDoc={preview.srcDoc}
              aria-hidden={hasPreview ? undefined : true}
              tabIndex={hasPreview ? undefined : -1}
            />
          )}
        </div>
      </div>

      {problems.length > 0 && (
        <div className="problems">
          <h4>Problems</h4>
          <ul>
            {problems.map((problem, index) => (
              <li key={index}>
                <strong>
                  {FILE_LABELS[problem.file]}
                  {problem.line !== undefined && `:${problem.line}:${problem.column}`}
                </strong>{' '}
                {problem.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasPreview && consolePanel}

      <div className="checks">
        <button
          type="button"
          className="button button-primary"
          onClick={runChecks}
          disabled={checkState.status === 'running'}
        >
          {checkState.status === 'running' ? 'Checking…' : 'Check my code'}
        </button>
        <ul className="check-list">
          {checkLabels.map((label, index) => {
            const result = results?.[index]
            const state = result ? (result.passed ? 'pass' : 'fail') : 'pending'
            return (
              <li key={label} className={`check-${state}`}>
                <span className="check-icon" aria-hidden="true">
                  {state === 'pass' ? '✓' : state === 'fail' ? '✗' : '○'}
                </span>
                <span>
                  <span className="visually-hidden">
                    {state === 'pass' ? 'Passed: ' : state === 'fail' ? 'Failed: ' : 'Not checked yet: '}
                  </span>
                  <InlineCode text={label} />
                  {result?.error && <span className="check-error">{result.error}</span>}
                </span>
              </li>
            )
          })}
        </ul>
        <p role="status" className="check-summary">
          {results &&
            (allPassed
              ? '🎉 All checks passed — nice work!'
              : `${passedCount} of ${results.length} checks passed. Keep going!`)}
          {stale && ' (You have changed the code since the last check.)'}
        </p>
      </div>

      {checkFrame && (
        <iframe
          key={checkFrame.runId}
          ref={checkRef}
          className="hidden-frame"
          title="Exercise checks"
          sandbox={SANDBOX}
          srcDoc={checkFrame.srcDoc}
          aria-hidden="true"
          tabIndex={-1}
        />
      )}
    </div>
  )
}

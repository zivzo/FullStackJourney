import type { ExerciseTest } from '../data/skills'
import type { RunRequest } from './exercise.worker'
import type { RunResult } from './exerciseHarness'

const TIMEOUT_MS = 5000

function isRunResult(data: unknown): data is RunResult {
  if (typeof data !== 'object' || data === null) return false
  const result = data as Partial<RunResult>
  return (
    Array.isArray(result.results) &&
    result.results.every(
      (test) =>
        typeof test === 'object' &&
        test !== null &&
        typeof test.name === 'string' &&
        typeof test.passed === 'boolean' &&
        (test.message === undefined || typeof test.message === 'string'),
    ) &&
    Array.isArray(result.logs) &&
    result.logs.every((log) => typeof log === 'string') &&
    (result.error === undefined || typeof result.error === 'string')
  )
}

/** Runs learner code against an exercise's tests in a disposable Web Worker. */
export function runExercise(code: string, tests: ExerciseTest[]): Promise<RunResult> {
  return new Promise((resolve) => {
    const worker = new Worker(new URL('./exercise.worker.ts', import.meta.url), {
      type: 'module',
    })

    const finish = (result: RunResult) => {
      clearTimeout(timer)
      worker.terminate()
      resolve(result)
    }

    const timer = setTimeout(
      () =>
        finish({
          results: [],
          logs: [],
          error: `Timed out after ${TIMEOUT_MS / 1000}s. Look for an infinite loop or a promise that never settles.`,
        }),
      TIMEOUT_MS,
    )

    worker.onmessage = (event: MessageEvent<RunResult>) => {
      const data = event.data
      finish(
        isRunResult(data)
          ? data
          : { results: [], logs: [], error: 'Unexpected message from the runner.' },
      )
    }
    worker.onerror = (event) => {
      event.preventDefault()
      finish({ results: [], logs: [], error: event.message || 'Your code crashed the runner.' })
    }

    const request: RunRequest = { code, tests }
    worker.postMessage(request)
  })
}

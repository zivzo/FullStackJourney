import type { ExerciseTest } from '../data/skills'
import type { RunRequest } from './exercise.worker'
import type { RunResult } from './exerciseHarness'

const TIMEOUT_MS = 5000

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
        data && Array.isArray(data.results) && Array.isArray(data.logs)
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

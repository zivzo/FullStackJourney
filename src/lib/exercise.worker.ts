import type { ExerciseTest } from '../data/skills'
import { runTests } from './exerciseHarness'

export interface RunRequest {
  code: string
  tests: ExerciseTest[]
}

// Learner code runs inside this worker so it can't touch the page and an
// infinite loop can be stopped by terminating the worker.
self.onmessage = async (event: MessageEvent<RunRequest>) => {
  const result = await runTests(event.data.code, event.data.tests)
  self.postMessage(result)
}

/** Editable files an exercise can expose, shown as tabs in the playground. */
export type FileName = 'html' | 'css' | 'js' | 'ts' | 'jsx' | 'json'

export type ExerciseFiles = Partial<Record<FileName, string>>

/**
 * Passed to every check. Checks run *inside* the sandboxed preview, after the
 * learner's code, so they can inspect the rendered page and their globals.
 */
export interface CheckContext {
  document: Document
  window: Window & typeof globalThis
  /** The learner's source code, keyed by file name. */
  source: ExerciseFiles
  /** Reads a global binding declared by the learner's code (e.g. a `const`). */
  global: <T = any>(name: string) => T
  /** Waits for the given number of milliseconds (default 0) so the UI can update. */
  tick: (ms?: number) => Promise<void>
}

export interface Check {
  label: string
  /**
   * Returns (or resolves to) `true` when the check passes. Throwing an error
   * fails the check and shows the error message to the learner.
   *
   * The function is serialised with `Function.prototype.toString()` and run in
   * the preview frame, so it must be self-contained: only use its `ctx`
   * argument and browser globals, never variables from the surrounding module.
   */
  test: (ctx: CheckContext) => boolean | Promise<boolean>
}

export interface Exercise {
  id: string
  title: string
  /** What the learner should build. Each entry is rendered as a step. */
  instructions: string[]
  /** Starting code. The keys decide which file tabs appear. */
  starter: ExerciseFiles
  /** A reference solution the learner can reveal. */
  solution: ExerciseFiles
  hints?: string[]
  /** Hidden JavaScript that runs before the learner's code (helpers, fixtures). */
  setup?: string
  /** Load React and ReactDOM as globals in the preview. */
  react?: boolean
  /**
   * Show the rendered page next to the editor. Defaults to `true` when the
   * exercise has HTML or uses React; otherwise the console is shown instead.
   */
  preview?: boolean
  checks: Check[]
}

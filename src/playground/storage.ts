import type { ExerciseFiles } from './types'

const DRAFT_PREFIX = 'fsj:draft:'
const DONE_PREFIX = 'fsj:done:'

// Storage can be unavailable (private mode, disabled cookies); exercises still work without it.
function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string | null): void {
  try {
    if (value === null) window.localStorage.removeItem(key)
    else window.localStorage.setItem(key, value)
  } catch {
    // Ignore quota and access errors.
  }
}

/** Returns the saved draft, keeping only the files the exercise actually has. */
export function loadDraft(key: string, starter: ExerciseFiles): ExerciseFiles | null {
  const raw = read(DRAFT_PREFIX + key)
  if (!raw) return null
  try {
    const saved: unknown = JSON.parse(raw)
    if (typeof saved !== 'object' || saved === null) return null
    const draft: ExerciseFiles = { ...starter }
    for (const name of Object.keys(starter) as (keyof ExerciseFiles)[]) {
      const value = (saved as Record<string, unknown>)[name]
      if (typeof value === 'string') draft[name] = value
    }
    return draft
  } catch {
    return null
  }
}

export function saveDraft(key: string, files: ExerciseFiles | null): void {
  write(DRAFT_PREFIX + key, files ? JSON.stringify(files) : null)
}

export function isCompleted(key: string): boolean {
  return read(DONE_PREFIX + key) === '1'
}

export function markCompleted(key: string): void {
  write(DONE_PREFIX + key, '1')
}

import type { ExerciseTest } from '../data/skills'

export interface TestResult {
  name: string
  passed: boolean
  message?: string
}

export interface RunResult {
  results: TestResult[]
  logs: string[]
  /** Set when the learner's code could not run at all (e.g. a syntax error). */
  error?: string
}

class AssertionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AssertionError'
  }
}

export function formatValue(value: unknown): string {
  if (value === undefined) return 'undefined'
  if (typeof value === 'function') return `[Function ${value.name || 'anonymous'}]`
  if (typeof value === 'bigint') return `${value}n`
  if (value instanceof Error) return `${value.name}: ${value.message}`
  try {
    return JSON.stringify(value) ?? String(value)
  } catch {
    return String(value)
  }
}

function isDeepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
    return false
  }
  if (Array.isArray(a) !== Array.isArray(b)) return false
  if (Array.isArray(a) && a.length !== (b as unknown[]).length) return false
  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  if (keysA.length !== keysB.length) return false
  return keysA.every(
    (key) =>
      Object.prototype.hasOwnProperty.call(b, key) &&
      isDeepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]),
  )
}

const assertions = {
  assert(condition: unknown, message = 'Expected condition to be truthy') {
    if (!condition) throw new AssertionError(message)
  },
  assertEqual(actual: unknown, expected: unknown, message?: string) {
    if (!Object.is(actual, expected)) {
      throw new AssertionError(
        `${message ? `${message}: ` : ''}expected ${formatValue(expected)}, got ${formatValue(actual)}`,
      )
    }
  },
  assertDeepEqual(actual: unknown, expected: unknown, message?: string) {
    if (!isDeepEqual(actual, expected)) {
      throw new AssertionError(
        `${message ? `${message}: ` : ''}expected ${formatValue(expected)}, got ${formatValue(actual)}`,
      )
    }
  },
  assertThrows(fn: () => unknown, message = 'Expected function to throw') {
    try {
      fn()
    } catch {
      return
    }
    throw new AssertionError(message)
  },
  async assertRejects(promiseOrFn: unknown, message = 'Expected promise to reject') {
    try {
      await (typeof promiseOrFn === 'function' ? promiseOrFn() : promiseOrFn)
    } catch {
      return
    }
    throw new AssertionError(message)
  },
}

type AsyncFunctionConstructor = new (...args: string[]) => (...args: unknown[]) => Promise<unknown>

const AsyncFunction = Object.getPrototypeOf(async function () {})
  .constructor as AsyncFunctionConstructor

function describeError(error: unknown): string {
  return error instanceof Error ? `${error.name}: ${error.message}` : `Thrown: ${formatValue(error)}`
}

/**
 * Evaluates the learner's code once, then runs each test in the same scope so
 * tests can call the functions and classes the learner declared.
 */
export async function runTests(code: string, tests: ExerciseTest[]): Promise<RunResult> {
  const logs: string[] = []
  const record =
    (prefix: string) =>
    (...args: unknown[]) => {
      logs.push(prefix + args.map((arg) => (typeof arg === 'string' ? arg : formatValue(arg))).join(' '))
    }
  const sandboxConsole = {
    log: record(''),
    info: record(''),
    debug: record(''),
    warn: record('⚠ '),
    error: record('✖ '),
  }

  const testBodies = tests.map((test) => `async () => {\n${test.code}\n}`).join(',\n')
  const names = ['console', ...Object.keys(assertions)]

  let suite: unknown
  try {
    const program = new AsyncFunction(...names, `${code}\n;return [\n${testBodies}\n];`)
    suite = await program(sandboxConsole, ...Object.values(assertions))
  } catch (error) {
    return { results: [], logs, error: describeError(error) }
  }

  if (!Array.isArray(suite)) {
    return {
      results: [],
      logs,
      error: 'Your code returned before the tests could run. Remove any top-level `return`.',
    }
  }

  const results: TestResult[] = []
  for (const [index, test] of tests.entries()) {
    try {
      await (suite[index] as () => Promise<void>)()
      results.push({ name: test.name, passed: true })
    } catch (error) {
      results.push({
        name: test.name,
        passed: false,
        message: error instanceof AssertionError ? error.message : describeError(error),
      })
    }
  }
  return { results, logs }
}

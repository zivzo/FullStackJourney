import type { Check, CheckContext, ExerciseFiles } from './types'

export const MESSAGE_CHANNEL = 'fsj-playground'

export type ConsoleLevel = 'log' | 'info' | 'warn' | 'error'

export interface CheckOutcome {
  passed: boolean
  error?: string
}

export type FrameMessage =
  | { channel: typeof MESSAGE_CHANNEL; runId: string; type: 'console'; level: ConsoleLevel; text: string }
  | { channel: typeof MESSAGE_CHANNEL; runId: string; type: 'checks'; results: CheckOutcome[] }
  | { channel: typeof MESSAGE_CHANNEL; runId: string; type: 'loaded' }

export function isFrameMessage(data: unknown): data is FrameMessage {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as { channel?: unknown }).channel === MESSAGE_CHANNEL &&
    typeof (data as { runId?: unknown }).runId === 'string'
  )
}

export interface DocumentOptions {
  runId: string
  files: ExerciseFiles
  script: string
  setup?: string
  reactRuntime?: string
  /** When given, the checks run after the learner's code and report back. */
  checks?: Check[]
}

/*
 * `bridge` and `runChecks` are serialised with `toString()` and executed inside
 * the sandboxed preview frame, so they must not reference anything outside
 * their own bodies.
 */

function bridge(runId: string, channel: string) {
  const send = (message: object) => parent.postMessage({ channel, runId, ...message }, '*')

  const format = (value: unknown, depth = 0): string => {
    if (typeof value === 'string') return depth === 0 ? value : JSON.stringify(value)
    if (typeof value === 'function') return `ƒ ${value.name || 'anonymous'}()`
    if (typeof value === 'undefined' || typeof value === 'symbol' || typeof value === 'bigint') {
      return String(value)
    }
    if (value instanceof Error) return `${value.name}: ${value.message}`
    if (value instanceof Element) return `<${value.tagName.toLowerCase()}>`
    if (value === null || typeof value !== 'object') return String(value)
    if (depth > 2) return Array.isArray(value) ? '[…]' : '{…}'
    if (Array.isArray(value)) return `[${value.map((item) => format(item, depth + 1)).join(', ')}]`
    if (value instanceof Map) {
      const entries = [...value].map(([key, item]) => `${format(key, depth + 1)} => ${format(item, depth + 1)}`)
      return `Map(${value.size}) {${entries.join(', ')}}`
    }
    if (value instanceof Set) {
      return `Set(${value.size}) {${[...value].map((item) => format(item, depth + 1)).join(', ')}}`
    }
    const entries = Object.entries(value).map(([key, item]) => `${key}: ${format(item, depth + 1)}`)
    return `{${entries.join(', ')}}`
  }

  for (const level of ['log', 'info', 'warn', 'error'] as const) {
    const original = console[level]
    console[level] = (...args: unknown[]) => {
      send({ type: 'console', level, text: args.map((arg) => format(arg)).join(' ') })
      original.apply(console, args)
    }
  }

  window.addEventListener('error', (event) => {
    send({ type: 'console', level: 'error', text: event.error ? format(event.error) : event.message })
  })
  window.addEventListener('unhandledrejection', (event) => {
    send({ type: 'console', level: 'error', text: `Unhandled promise rejection: ${format(event.reason)}` })
  })
  window.addEventListener('load', () => send({ type: 'loaded' }))
  // Submitting a form would navigate the preview away, so log the data instead.
  window.addEventListener('submit', (event) => {
    if (event.defaultPrevented || !(event.target instanceof HTMLFormElement)) return
    event.preventDefault()
    const fields = [...new FormData(event.target)].map(([name, value]) => `${name}=${String(value)}`)
    send({ type: 'console', level: 'info', text: `Form submitted: ${fields.join('&') || '(no named fields)'}` })
  })
}

async function runChecks(
  runId: string,
  channel: string,
  tests: Check['test'][],
  source: ExerciseFiles,
) {
  const ctx: CheckContext = {
    document,
    window,
    source,
    // Indirect eval runs in global scope, so it can see top-level `let`/`const`.
    // oxlint-disable-next-line no-eval -- names come from the exercise checks, not user input
    global: (name: string) => (0, eval)(name),
    tick: (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms)),
  }

  if (document.readyState !== 'complete') {
    await new Promise((resolve) => window.addEventListener('load', resolve, { once: true }))
  }
  // Give frameworks such as React a moment to render.
  await ctx.tick(50)

  const results = []
  for (const test of tests) {
    try {
      results.push({ passed: (await test(ctx)) === true })
    } catch (error) {
      results.push({ passed: false, error: error instanceof Error ? error.message : String(error) })
    }
  }
  parent.postMessage({ channel, runId, type: 'checks', results }, '*')
}

/** Escapes text so it cannot close the `<script>`/`<style>` element it is embedded in. */
function escapeRawText(text: string, tag: 'script' | 'style'): string {
  return text.replace(new RegExp(`</(${tag})`, 'gi'), '<\\/$1')
}

function inlineScript(source: string): string {
  return `<script>${escapeRawText(source, 'script')}</script>`
}

/** Serialises a value as a JavaScript literal that is safe to embed in a `<script>`. */
function toLiteral(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c')
}

/** Builds the `srcdoc` for the preview frame. */
export function buildDocument({ runId, files, script, setup, reactRuntime, checks }: DocumentOptions): string {
  const body = files.html ?? (reactRuntime ? '<div id="root"></div>' : '')
  const parts = [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    inlineScript(`(${bridge.toString()})(${toLiteral(runId)}, ${toLiteral(MESSAGE_CHANNEL)});`),
    '<style>html { color-scheme: light; font-family: system-ui, sans-serif; }</style>',
    files.css !== undefined ? `<style>${escapeRawText(files.css, 'style')}</style>` : '',
    reactRuntime ? inlineScript(reactRuntime) : '',
    setup ? inlineScript(setup) : '',
    '</head>',
    '<body>',
    body,
    script.trim() ? inlineScript(script) : '',
  ]

  if (checks) {
    const tests = checks.map((check) => `(${check.test.toString()})`).join(',\n')
    parts.push(
      inlineScript(
        `(${runChecks.toString()})(${toLiteral(runId)}, ${toLiteral(MESSAGE_CHANNEL)}, [\n${tests}\n], ${toLiteral(files)});`,
      ),
    )
  }

  parts.push('</body>', '</html>')
  return parts.join('\n')
}

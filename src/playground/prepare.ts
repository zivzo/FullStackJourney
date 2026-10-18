import type { Exercise, ExerciseFiles, FileName } from './types'

export interface Problem {
  file: FileName
  message: string
  line?: number
  column?: number
}

export interface PreparedCode {
  /** JavaScript to run in the preview, compiled from the js/ts/jsx file. */
  script: string
  problems: Problem[]
  reactRuntime?: string
}

/** Compiles the learner's files into something the preview frame can run. */
export async function prepareCode(exercise: Exercise, files: ExerciseFiles): Promise<PreparedCode> {
  const problems: Problem[] = []
  let script = files.js ?? ''

  try {
    if (files.ts !== undefined || files.jsx !== undefined) {
      const compiler = await import('./compiler')
      if (files.ts !== undefined) {
        const output = compiler.compileTypeScript(files.ts)
        script = output.js
        problems.push(...output.diagnostics.map((diagnostic) => ({ file: 'ts' as const, ...diagnostic })))
      }
      if (files.jsx !== undefined) {
        const output = compiler.compileJsx(files.jsx)
        script = output.js
        problems.push(...output.diagnostics.map((diagnostic) => ({ file: 'jsx' as const, ...diagnostic })))
      }
    }
  } catch (error) {
    const file = files.ts !== undefined ? 'ts' : 'jsx'
    problems.push({ file, message: `Could not load the compiler: ${String(error)}` })
  }

  if (files.json !== undefined) {
    try {
      JSON.parse(files.json)
    } catch (error) {
      problems.push({ file: 'json', message: error instanceof Error ? error.message : String(error) })
    }
  }

  let reactRuntime: string | undefined
  if (exercise.react) {
    try {
      reactRuntime = (await import('./reactRuntime')).reactRuntime
    } catch (error) {
      problems.push({ file: 'jsx', message: `Could not load React: ${String(error)}` })
    }
  }

  return { script, problems, reactRuntime }
}

import ts from 'typescript'

/**
 * The TypeScript compiler is large, so this module is only loaded (via
 * `compile.ts`) when an exercise contains TypeScript or JSX.
 */

export interface CompilerDiagnostic {
  message: string
  line?: number
  column?: number
}

export interface CompileOutput {
  js: string
  diagnostics: CompilerDiagnostic[]
}

const libSources = import.meta.glob<string>(
  [
    '../../node_modules/typescript/lib/lib.{es5,decorators,decorators.legacy}.d.ts',
    '../../node_modules/typescript/lib/lib.es20{15,16,17,18,19,20,21,22}*.d.ts',
    '!**/*.full.d.ts',
  ],
  { query: '?raw', import: 'default', eager: true },
)

/** Browser globals available to TypeScript exercises (the DOM lib is too big to load). */
const globalsSource = `
declare var console: {
  log(...data: any[]): void
  info(...data: any[]): void
  warn(...data: any[]): void
  error(...data: any[]): void
}
declare function setTimeout(handler: (...args: any[]) => void, timeout?: number, ...args: any[]): number
declare function clearTimeout(id: number | undefined): void
`

const LIB_DIR = '/lib/'
const ENTRY = '/exercise.ts'
const GLOBALS = '/globals.d.ts'

const staticFiles = new Map<string, string>([[GLOBALS, globalsSource]])
for (const [path, source] of Object.entries(libSources)) {
  staticFiles.set(LIB_DIR + path.slice(path.lastIndexOf('/') + 1), source)
}

const typeCheckOptions: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2022,
  lib: ['lib.es2022.d.ts'],
  strict: true,
  noEmit: true,
  types: [],
}

// Parsing the standard library is slow, so its source files are reused between runs.
const sourceFileCache = new Map<string, ts.SourceFile>()

function typeCheck(code: string): CompilerDiagnostic[] {
  const host: ts.CompilerHost = {
    getSourceFile(fileName, languageVersion) {
      if (fileName === ENTRY) return ts.createSourceFile(fileName, code, languageVersion, true)
      const cached = sourceFileCache.get(fileName)
      if (cached) return cached
      const text = staticFiles.get(fileName)
      if (text === undefined) return undefined
      const sourceFile = ts.createSourceFile(fileName, text, languageVersion)
      sourceFileCache.set(fileName, sourceFile)
      return sourceFile
    },
    getDefaultLibFileName: () => `${LIB_DIR}lib.d.ts`,
    getDefaultLibLocation: () => LIB_DIR,
    writeFile: () => {},
    getCurrentDirectory: () => '/',
    getCanonicalFileName: (fileName) => fileName,
    useCaseSensitiveFileNames: () => true,
    getNewLine: () => '\n',
    fileExists: (fileName) => fileName === ENTRY || staticFiles.has(fileName),
    readFile: (fileName) => (fileName === ENTRY ? code : staticFiles.get(fileName)),
  }

  const program = ts.createProgram([ENTRY, GLOBALS], typeCheckOptions, host)
  const entry = program.getSourceFile(ENTRY)
  return toDiagnostics([
    ...program.getOptionsDiagnostics(),
    ...program.getGlobalDiagnostics(),
    ...program.getSyntacticDiagnostics(entry),
    ...program.getSemanticDiagnostics(entry),
  ])
}

function toDiagnostics(diagnostics: readonly ts.Diagnostic[]): CompilerDiagnostic[] {
  return diagnostics
    .filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error)
    .map((diagnostic) => {
      const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
      if (!diagnostic.file || diagnostic.start === undefined) return { message }
      const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start)
      return { message, line: line + 1, column: character + 1 }
    })
}

function transpile(code: string, fileName: string): CompileOutput {
  const output = ts.transpileModule(code, {
    fileName,
    reportDiagnostics: true,
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.React,
    },
  })
  return { js: output.outputText, diagnostics: toDiagnostics(output.diagnostics ?? []) }
}

/** Strips types and type-checks the code with `strict` enabled. */
export function compileTypeScript(code: string): CompileOutput {
  const { js } = transpile(code, 'exercise.ts')
  return { js, diagnostics: typeCheck(code) }
}

/** Turns JSX into `React.createElement` calls. Reports syntax errors only. */
export function compileJsx(code: string): CompileOutput {
  return transpile(code, 'exercise.jsx')
}

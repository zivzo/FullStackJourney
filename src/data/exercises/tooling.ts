import type { Exercise } from '../../playground/types'

const packageJsonStarter = `{
  "name": "my-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
  },
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  },
  "devDependencies": {
    "vite": "^8.0.0"
  }
}
`

const envStarter = `// Vite exposes environment variables that start with VITE_ on import.meta.env.
// Here we simulate them with a plain object. All values are strings!
const env = {
  VITE_API_URL: 'https://api.example.com',
  VITE_DEBUG: 'true',
  VITE_PAGE_SIZE: '20',
  DATABASE_PASSWORD: 'do-not-ship-me',
}
`

export const toolingExercises: Exercise[] = [
  {
    id: 'npm-scripts',
    title: 'Write npm scripts in package.json',
    instructions: [
      'Add a `dev` script that runs `vite`, a `build` script that runs `vite build` and a `preview` script that runs `vite preview`.',
      'Add a `lint` script that runs `oxlint`, and add `oxlint` with the version range `^1.0.0` to `devDependencies`.',
      'Set the `version` to `1.0.0`.',
      'Keep the file valid JSON: double quotes everywhere and no trailing commas.',
    ],
    hints: [
      'Scripts are a map of names to commands: `"scripts": { "dev": "vite" }`. Run them with `npm run dev`.',
      'Tools only needed during development (bundlers, linters) belong in `devDependencies`.',
    ],
    starter: { json: packageJsonStarter },
    solution: {
      json: `{
  "name": "my-app",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "oxlint"
  },
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0"
  },
  "devDependencies": {
    "oxlint": "^1.0.0",
    "vite": "^8.0.0"
  }
}
`,
    },
    checks: [
      {
        label: '`package.json` is valid JSON',
        test: ({ source }) => {
          JSON.parse(source.json ?? '')
          return true
        },
      },
      {
        label: '`dev`, `build` and `preview` scripts run Vite',
        test: ({ source }) => {
          const scripts = JSON.parse(source.json ?? '').scripts ?? {}
          return scripts.dev === 'vite' && scripts.build === 'vite build' && scripts.preview === 'vite preview'
        },
      },
      {
        label: 'A `lint` script runs `oxlint`, which is listed in `devDependencies`',
        test: ({ source }) => {
          const pkg = JSON.parse(source.json ?? '')
          return (
            pkg.scripts?.lint === 'oxlint' &&
            pkg.devDependencies?.oxlint === '^1.0.0' &&
            !('oxlint' in (pkg.dependencies ?? {}))
          )
        },
      },
      {
        label: 'The version is `1.0.0`',
        test: ({ source }) => JSON.parse(source.json ?? '').version === '1.0.0',
      },
    ],
  },
  {
    id: 'env-config',
    title: 'Read configuration from environment variables',
    instructions: [
      '`loadConfig(env)` returns `{ apiUrl, debug, pageSize }`.',
      '`apiUrl` comes from `VITE_API_URL`, falling back to `http://localhost:3000` when it is missing.',
      '`debug` is the boolean `true` only when `VITE_DEBUG` is the string `\'true\'`.',
      '`pageSize` is `VITE_PAGE_SIZE` converted to a number, or `10` when it is missing or not a number.',
      '`getPublicEnv(env)` returns a new object with only the variables whose names start with `VITE_` — everything else must never reach the browser.',
    ],
    hints: [
      '`env.VITE_API_URL ?? \'http://localhost:3000\'` uses the fallback when the value is missing.',
      '`Number(\'abc\')` is `NaN`; check it with `Number.isNaN()`.',
      '`Object.fromEntries(Object.entries(env).filter(([key]) => key.startsWith(\'VITE_\')))`',
    ],
    starter: {
      js: `${envStarter}
function loadConfig(env) {
  // TODO: return { apiUrl, debug, pageSize }
}

function getPublicEnv(env) {
  // TODO: return only the VITE_ variables
}

console.log(loadConfig(env))
console.log(getPublicEnv(env))
`,
    },
    solution: {
      js: `${envStarter}
function loadConfig(env) {
  const pageSize = Number(env.VITE_PAGE_SIZE)
  return {
    apiUrl: env.VITE_API_URL ?? 'http://localhost:3000',
    debug: env.VITE_DEBUG === 'true',
    pageSize: env.VITE_PAGE_SIZE === undefined || Number.isNaN(pageSize) ? 10 : pageSize,
  }
}

function getPublicEnv(env) {
  return Object.fromEntries(Object.entries(env).filter(([key]) => key.startsWith('VITE_')))
}

console.log(loadConfig(env))
console.log(getPublicEnv(env))
`,
    },
    checks: [
      {
        label: 'Reads all three values from `env`',
        test: ({ global }) => {
          const config = global('loadConfig')({ VITE_API_URL: 'https://x.test', VITE_DEBUG: 'true', VITE_PAGE_SIZE: '50' })
          return config?.apiUrl === 'https://x.test' && config.debug === true && config.pageSize === 50
        },
      },
      {
        label: 'Uses the defaults when variables are missing',
        test: ({ global }) => {
          const config = global('loadConfig')({})
          return config?.apiUrl === 'http://localhost:3000' && config.debug === false && config.pageSize === 10
        },
      },
      {
        label: '`debug` is only true for the string `\'true\'`, and invalid page sizes fall back to 10',
        test: ({ global }) => {
          const config = global('loadConfig')({ VITE_DEBUG: 'false', VITE_PAGE_SIZE: 'lots' })
          return config?.debug === false && config.pageSize === 10
        },
      },
      {
        label: '`getPublicEnv` keeps only `VITE_` variables without changing the input',
        test: ({ global }) => {
          const input = { VITE_A: '1', SECRET: '2', VITE_B: '3' }
          const output = global('getPublicEnv')(input)
          return JSON.stringify(output) === '{"VITE_A":"1","VITE_B":"3"}' && Object.keys(input).length === 3
        },
      },
    ],
  },
]

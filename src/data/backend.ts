import type { Topic } from './skills'

/** Strips the leading newline and shared indentation so code can be indented in this file. */
function dedent(text: string): string {
  const lines = text.replace(/^\n/, '').replace(/\n[ \t]*$/, '').split('\n')
  const indent = Math.min(
    ...lines.filter((line) => line.trim()).map((line) => line.match(/^ */)![0].length),
  )
  return lines.map((line) => line.slice(indent)).join('\n')
}

export const backendTopics: Topic[] = [
  {
    id: 'http',
    title: 'HTTP Fundamentals',
    level: 'beginner',
    summary: 'How clients and servers talk: requests, responses, methods, status codes and headers.',
    concepts: [
      'The request/response cycle',
      'Methods (GET, POST, PUT, PATCH, DELETE) and idempotency',
      'Status code classes (2xx, 3xx, 4xx, 5xx)',
      'Headers (Content-Type, Authorization, Cache-Control)',
      'URLs, paths and query strings',
      'Statelessness, cookies and HTTPS',
    ],
    resources: [
      { label: 'MDN – An overview of HTTP', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview' },
      { label: 'MDN – HTTP response status codes', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status' },
    ],
    examples: [
      {
        title: 'A raw HTTP exchange',
        language: 'http',
        description:
          'Every request has a request line, headers, a blank line and an optional body. The response mirrors it with a status line.',
        code: dedent(`
          POST /api/users?invite=true HTTP/1.1
          Host: api.example.com
          Content-Type: application/json
          Authorization: Bearer <access-token>

          {"name": "Ada", "email": "ada@example.com"}

          HTTP/1.1 201 Created
          Content-Type: application/json
          Location: /api/users/42

          {"id": 42, "name": "Ada", "email": "ada@example.com"}
        `),
      },
      {
        title: 'Calling an API and handling status codes',
        language: 'js',
        description: '`fetch` only rejects on network errors, so always check `response.ok` yourself.',
        code: dedent(`
          const response = await fetch('/api/users/42', {
            headers: { Accept: 'application/json' },
          })

          if (response.status === 404) {
            console.log('User not found')
          } else if (!response.ok) {
            throw new Error(\`Request failed with \${response.status}\`)
          } else {
            const user = await response.json()
            console.log(user.name)
          }
        `),
      },
    ],
    exercises: [
      {
        id: 'parse-request',
        title: 'Parse a raw HTTP request',
        prompt:
          'Servers receive requests as plain text. Write `parseRequest(raw)` that turns a raw request into `{ method, path, query, headers, body }`. Lines are separated by `\\r\\n` and the headers end at the first empty line. Header names should be lower-cased and values trimmed; `query` is an object of query-string parameters.',
        starterCode: dedent(`
          function parseRequest(raw) {
            // TODO: return { method, path, query, headers, body }
          }

          console.log(parseRequest('GET /hello?name=Ada HTTP/1.1\\r\\nHost: localhost\\r\\n\\r\\n'))
        `),
        hints: [
          'Find the blank line with `raw.indexOf("\\r\\n\\r\\n")` — everything after it is the body.',
          'The first line is `METHOD TARGET VERSION`; split it on spaces.',
          '`Object.fromEntries(new URLSearchParams("a=1&b=2"))` gives `{ a: "1", b: "2" }`.',
          'Header values can contain colons (`Host: localhost:3000`), so split on the first colon only.',
        ],
        solution: dedent(`
          function parseRequest(raw) {
            const end = raw.indexOf('\\r\\n\\r\\n')
            const head = end === -1 ? raw : raw.slice(0, end)
            const body = end === -1 ? '' : raw.slice(end + 4)

            const [requestLine, ...headerLines] = head.split('\\r\\n')
            const [method, target] = requestLine.split(' ')
            const queryStart = target.indexOf('?')
            const path = queryStart === -1 ? target : target.slice(0, queryStart)
            const search = queryStart === -1 ? '' : target.slice(queryStart + 1)
            const query = Object.fromEntries(new URLSearchParams(search))

            const headers = {}
            for (const line of headerLines) {
              const colon = line.indexOf(':')
              if (colon === -1) continue
              headers[line.slice(0, colon).trim().toLowerCase()] = line.slice(colon + 1).trim()
            }

            return { method, path, query, headers, body }
          }
        `),
        tests: [
          {
            name: 'reads the method and path',
            code: dedent(`
              const req = parseRequest('GET /users HTTP/1.1\\r\\nHost: api.example.com\\r\\n\\r\\n')
              assertEqual(req.method, 'GET')
              assertEqual(req.path, '/users')
            `),
          },
          {
            name: 'parses the query string into an object',
            code: dedent(`
              const req = parseRequest('GET /search?q=node&page=2 HTTP/1.1\\r\\n\\r\\n')
              assertEqual(req.path, '/search')
              assertDeepEqual(req.query, { q: 'node', page: '2' })
            `),
          },
          {
            name: 'preserves question marks in query values',
            code: dedent(`
              const req = parseRequest('GET /search?q=what? HTTP/1.1\\r\\n\\r\\n')
              assertDeepEqual(req.query, { q: 'what?' })
            `),
          },
          {
            name: 'returns an empty query object when there is no query string',
            code: dedent(`
              const req = parseRequest('GET / HTTP/1.1\\r\\n\\r\\n')
              assertDeepEqual(req.query, {})
            `),
          },
          {
            name: 'lower-cases header names and trims values',
            code: dedent(`
              const req = parseRequest('GET / HTTP/1.1\\r\\nContent-Type:   application/json  \\r\\nX-Request-Id: abc\\r\\n\\r\\n')
              assertDeepEqual(req.headers, { 'content-type': 'application/json', 'x-request-id': 'abc' })
            `),
          },
          {
            name: 'keeps colons inside header values',
            code: dedent(`
              const req = parseRequest('GET / HTTP/1.1\\r\\nHost: localhost:3000\\r\\n\\r\\n')
              assertEqual(req.headers.host, 'localhost:3000')
            `),
          },
          {
            name: 'returns the body after the blank line',
            code: dedent(`
              const req = parseRequest('POST /users HTTP/1.1\\r\\nContent-Type: application/json\\r\\n\\r\\n{"name":"Ada"}')
              assertEqual(req.method, 'POST')
              assertEqual(req.body, '{"name":"Ada"}')
            `),
          },
        ],
      },
    ],
  },
  {
    id: 'nodejs',
    title: 'Node.js Runtime',
    level: 'beginner',
    summary: 'Running JavaScript on the server with non-blocking I/O.',
    concepts: [
      'The event loop and non-blocking I/O',
      'ES modules vs. CommonJS',
      'npm, package.json and semantic versioning',
      'Core modules (fs, path, http, events)',
      'Callbacks, promises and async/await',
      'process, environment variables and exit codes',
    ],
    resources: [
      { label: 'Node.js – Learn', url: 'https://nodejs.org/en/learn' },
      {
        label: 'Node.js – The event loop',
        url: 'https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick',
      },
    ],
    examples: [
      {
        title: 'A web server with zero dependencies',
        language: 'js',
        description: 'Run with `node server.js` and open http://localhost:3000.',
        code: dedent(`
          import { createServer } from 'node:http'

          const server = createServer((req, res) => {
            if (req.method === 'GET' && req.url === '/health') {
              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ status: 'ok' }))
              return
            }
            res.writeHead(404, { 'Content-Type': 'text/plain' })
            res.end('Not found')
          })

          const port = process.env.PORT ?? 3000
          server.listen(port, () => console.log(\`Listening on http://localhost:\${port}\`))
        `),
      },
      {
        title: 'Non-blocking file I/O',
        language: 'js',
        description:
          'While the file is being read, the event loop is free to handle other requests.',
        code: dedent(`
          import { readFile } from 'node:fs/promises'

          async function loadConfig(path) {
            try {
              const text = await readFile(path, 'utf8')
              return JSON.parse(text)
            } catch (error) {
              if (error.code === 'ENOENT') return {} // file missing: use defaults
              throw error
            }
          }

          const config = await loadConfig('./config.json')
        `),
      },
    ],
    exercises: [
      {
        id: 'retry',
        title: 'Retry a flaky async call',
        prompt:
          'Network calls fail. Write `async function retry(fn, attempts = 3, delayMs = 0)` that calls the async function `fn`. If it throws, wait `delayMs` milliseconds and try again, up to `attempts` calls in total. Resolve with the first successful result, or throw the last error if every attempt fails.',
        starterCode: dedent(`
          async function retry(fn, attempts = 3, delayMs = 0) {
            // TODO
          }
        `),
        hints: [
          'A `for` loop from 1 to `attempts` with `try { return await fn() } catch (error) { ... }` covers most of it.',
          'Remember the last error so you can `throw` it after the loop.',
          'Sleep with `await new Promise((resolve) => setTimeout(resolve, delayMs))`.',
        ],
        solution: dedent(`
          const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

          async function retry(fn, attempts = 3, delayMs = 0) {
            let lastError
            for (let attempt = 1; attempt <= attempts; attempt++) {
              try {
                return await fn()
              } catch (error) {
                lastError = error
                if (attempt < attempts) await sleep(delayMs)
              }
            }
            throw lastError
          }
        `),
        tests: [
          {
            name: 'resolves with the result when the first call succeeds',
            code: dedent(`
              let calls = 0
              const result = await retry(async () => { calls++; return 'ok' })
              assertEqual(result, 'ok')
              assertEqual(calls, 1, 'number of calls')
            `),
          },
          {
            name: 'retries until the call succeeds',
            code: dedent(`
              let calls = 0
              const result = await retry(async () => {
                calls++
                if (calls < 3) throw new Error('flaky')
                return 'finally'
              }, 5)
              assertEqual(result, 'finally')
              assertEqual(calls, 3, 'number of calls')
            `),
          },
          {
            name: 'throws the last error after all attempts fail',
            code: dedent(`
              let calls = 0
              let caught
              try {
                await retry(async () => { calls++; throw new Error('fail ' + calls) }, 3)
              } catch (error) {
                caught = error
              }
              assert(caught, 'retry should throw')
              assertEqual(caught.message, 'fail 3')
              assertEqual(calls, 3, 'number of calls')
            `),
          },
          {
            name: 'waits delayMs between attempts',
            code: dedent(`
              let calls = 0
              const start = Date.now()
              await retry(async () => { calls++; if (calls < 3) throw new Error('flaky'); return 1 }, 3, 30)
              const elapsed = Date.now() - start
              assert(elapsed >= 55, 'expected at least ~60ms of waiting, got ' + elapsed + 'ms')
            `),
          },
        ],
      },
    ],
  },
  {
    id: 'rest-apis',
    title: 'REST API Design',
    level: 'beginner',
    summary: 'Designing predictable, resource-oriented HTTP APIs.',
    concepts: [
      'Resources and URLs (plural nouns, nesting)',
      'Mapping CRUD to HTTP methods',
      'Choosing status codes (200, 201, 204, 400, 404, 409)',
      'Pagination, filtering and sorting',
      'Consistent JSON and error shapes',
      'Versioning and documentation (OpenAPI)',
    ],
    resources: [
      {
        label: 'Microsoft – RESTful web API design',
        url: 'https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design',
      },
      { label: 'OpenAPI Specification', url: 'https://swagger.io/specification/' },
    ],
    examples: [
      {
        title: 'Endpoints for a "posts" resource',
        language: 'text',
        code: dedent(`
          GET    /api/v1/posts               list posts        → 200
          GET    /api/v1/posts?page=2&sort=-createdAt
          POST   /api/v1/posts               create a post     → 201 + Location header
          GET    /api/v1/posts/:id           read one post     → 200 or 404
          PATCH  /api/v1/posts/:id           partial update    → 200
          PUT    /api/v1/posts/:id           replace           → 200
          DELETE /api/v1/posts/:id           delete            → 204
          GET    /api/v1/posts/:id/comments  nested resource   → 200
        `),
      },
      {
        title: 'Paginated list and error responses',
        language: 'json',
        description: 'Pick one shape for success and one for errors, and use them everywhere.',
        code: dedent(`
          // GET /api/v1/posts?page=2&limit=20 → 200
          {
            "data": [{ "id": 21, "title": "Hello REST" }],
            "meta": { "page": 2, "limit": 20, "total": 57 }
          }

          // POST /api/v1/posts with a missing title → 400
          {
            "error": {
              "code": "VALIDATION_FAILED",
              "message": "Request body is invalid",
              "details": { "title": "Title is required" }
            }
          }
        `),
      },
    ],
    exercises: [
      {
        id: 'match-route',
        title: 'Match a route pattern',
        prompt:
          'Routers compare the request path with patterns like `/users/:id`. Write `matchRoute(pattern, path)` that returns an object of URL-decoded params when the path matches (e.g. `{ id: "42" }`), or `null` when it does not. A trailing slash on the path should still match.',
        starterCode: dedent(`
          function matchRoute(pattern, path) {
            // TODO: return params object or null
          }

          console.log(matchRoute('/users/:id', '/users/42'))
        `),
        hints: [
          'Split both strings on "/" and drop empty segments: `.split("/").filter(Boolean)`.',
          'If the number of segments differs, there is no match.',
          'Segments starting with ":" capture a param; other segments must be equal.',
          'Use `decodeURIComponent` on captured values.',
        ],
        solution: dedent(`
          function matchRoute(pattern, path) {
            const patternParts = pattern.split('/').filter(Boolean)
            const pathParts = path.split('/').filter(Boolean)
            if (patternParts.length !== pathParts.length) return null

            const params = {}
            for (let i = 0; i < patternParts.length; i++) {
              const expected = patternParts[i]
              const actual = pathParts[i]
              if (expected.startsWith(':')) {
                params[expected.slice(1)] = decodeURIComponent(actual)
              } else if (expected !== actual) {
                return null
              }
            }
            return params
          }
        `),
        tests: [
          {
            name: 'captures a single param',
            code: `assertDeepEqual(matchRoute('/users/:id', '/users/42'), { id: '42' })`,
          },
          {
            name: 'captures multiple params',
            code: dedent(`
              assertDeepEqual(
                matchRoute('/users/:userId/posts/:postId', '/users/7/posts/99'),
                { userId: '7', postId: '99' },
              )
            `),
          },
          {
            name: 'returns an empty object for static routes that match',
            code: `assertDeepEqual(matchRoute('/health', '/health'), {})`,
          },
          {
            name: 'returns null when a static segment differs',
            code: `assertEqual(matchRoute('/users/:id', '/posts/42'), null)`,
          },
          {
            name: 'returns null when the segment count differs',
            code: dedent(`
              assertEqual(matchRoute('/users/:id', '/users'), null)
              assertEqual(matchRoute('/users/:id', '/users/42/posts'), null)
            `),
          },
          {
            name: 'ignores a trailing slash',
            code: `assertDeepEqual(matchRoute('/users/:id', '/users/42/'), { id: '42' })`,
          },
          {
            name: 'URL-decodes params',
            code: `assertDeepEqual(matchRoute('/files/:name', '/files/hello%20world'), { name: 'hello world' })`,
          },
        ],
      },
    ],
  },
  {
    id: 'express',
    title: 'Express & Middleware',
    level: 'intermediate',
    summary: 'Building HTTP APIs with a Node.js web framework.',
    concepts: [
      'Apps, routers and route handlers',
      'The req and res objects',
      'Middleware chains and next()',
      'Body parsing, static files and CORS',
      'Error-handling middleware',
      'Structuring code into routes, controllers and services',
    ],
    resources: [
      { label: 'Express – Getting started', url: 'https://expressjs.com/en/starter/installing.html' },
      { label: 'Express – Using middleware', url: 'https://expressjs.com/en/guide/using-middleware.html' },
    ],
    examples: [
      {
        title: 'A small CRUD API',
        language: 'js',
        code: dedent(`
          import express from 'express'

          const app = express()
          app.use(express.json()) // parse JSON bodies into req.body

          const todos = new Map()
          let nextId = 1

          app.get('/todos', (req, res) => {
            res.json([...todos.values()])
          })

          app.post('/todos', (req, res) => {
            const todo = { id: nextId++, title: req.body.title, done: false }
            todos.set(todo.id, todo)
            res.status(201).json(todo)
          })

          app.get('/todos/:id', (req, res) => {
            const todo = todos.get(Number(req.params.id))
            if (!todo) return res.status(404).json({ error: 'Not found' })
            res.json(todo)
          })

          app.delete('/todos/:id', (req, res) => {
            todos.delete(Number(req.params.id))
            res.status(204).end()
          })

          app.listen(3000)
        `),
      },
      {
        title: 'Logging and error-handling middleware',
        language: 'js',
        description:
          'Middleware runs in the order it is registered. An error handler is recognised by its four arguments.',
        code: dedent(`
          app.use((req, res, next) => {
            const start = Date.now()
            res.on('finish', () => {
              console.log(\`\${req.method} \${req.url} \${res.statusCode} \${Date.now() - start}ms\`)
            })
            next()
          })

          // ...routes...

          app.use((err, req, res, next) => {
            console.error(err)
            res.status(err.status ?? 500).json({ error: err.expose ? err.message : 'Internal error' })
          })
        `),
      },
    ],
    exercises: [
      {
        id: 'middleware-pipeline',
        title: 'Build a middleware pipeline',
        prompt:
          'Recreate the heart of Express. `createApp()` returns `{ use(fn), handle(req, res) }`. `handle` runs the registered middleware in order; each receives `(req, res, next)` and the chain only continues when `next()` is called. If a middleware calls `next(err)` or throws, skip the normal middleware and run the next error handler — a function with four parameters `(err, req, res, next)`. Error handlers are skipped when there is no error.',
        starterCode: dedent(`
          function createApp() {
            const stack = []

            return {
              use(fn) {
                stack.push(fn)
              },
              handle(req, res) {
                // TODO: run the stack
              },
            }
          }
        `),
        hints: [
          'Keep an `index` and write an inner `next(err)` function that takes `stack[index++]`.',
          '`fn.length` tells you how many parameters a function declares — 4 means error handler.',
          'With an error: call error handlers, skip the others by calling `next(err)` again. Without an error: do the opposite.',
          'Wrap each middleware call in `try/catch` and pass caught errors to `next(error)`.',
        ],
        solution: dedent(`
          function createApp() {
            const stack = []

            return {
              use(fn) {
                stack.push(fn)
              },
              handle(req, res) {
                let index = 0

                function next(err) {
                  const layer = stack[index++]
                  if (!layer) return
                  const isErrorHandler = layer.length === 4

                  try {
                    if (err) {
                      if (isErrorHandler) layer(err, req, res, next)
                      else next(err)
                    } else if (isErrorHandler) {
                      next()
                    } else {
                      layer(req, res, next)
                    }
                  } catch (error) {
                    next(error)
                  }
                }

                next()
              },
            }
          }
        `),
        tests: [
          {
            name: 'runs middleware in order with shared req and res',
            code: dedent(`
              const app = createApp()
              app.use((req, res, next) => { req.steps.push('a'); next() })
              app.use((req, res, next) => { req.steps.push('b'); res.body = 'done'; next() })
              const req = { steps: [] }
              const res = {}
              app.handle(req, res)
              assertDeepEqual(req.steps, ['a', 'b'])
              assertEqual(res.body, 'done')
            `),
          },
          {
            name: 'stops when a middleware does not call next()',
            code: dedent(`
              const app = createApp()
              app.use((req, res, next) => { req.steps.push('auth') })
              app.use((req, res, next) => { req.steps.push('handler'); next() })
              const req = { steps: [] }
              app.handle(req, {})
              assertDeepEqual(req.steps, ['auth'])
            `),
          },
          {
            name: 'next(err) skips to the error handler',
            code: dedent(`
              const app = createApp()
              app.use((req, res, next) => next(new Error('boom')))
              app.use((req, res, next) => { req.steps.push('skipped'); next() })
              app.use((err, req, res, next) => { res.status = 500; res.error = err.message })
              const req = { steps: [] }
              const res = {}
              app.handle(req, res)
              assertDeepEqual(req.steps, [])
              assertEqual(res.status, 500)
              assertEqual(res.error, 'boom')
            `),
          },
          {
            name: 'thrown errors also reach the error handler',
            code: dedent(`
              const app = createApp()
              app.use((req, res, next) => { throw new Error('thrown') })
              app.use((err, req, res, next) => { res.error = err.message })
              const res = {}
              app.handle({}, res)
              assertEqual(res.error, 'thrown')
            `),
          },
          {
            name: 'skips error handlers when there is no error',
            code: dedent(`
              const app = createApp()
              app.use((req, res, next) => { req.steps.push('a'); next() })
              app.use((err, req, res, next) => { req.steps.push('error handler'); next() })
              app.use((req, res, next) => { req.steps.push('b'); next() })
              const req = { steps: [] }
              app.handle(req, {})
              assertDeepEqual(req.steps, ['a', 'b'])
            `),
          },
        ],
      },
    ],
  },
  {
    id: 'validation',
    title: 'Validation & Error Handling',
    level: 'intermediate',
    summary: 'Never trusting input and failing in a predictable way.',
    concepts: [
      'Never trust client input',
      'Schema validation (e.g. Zod, Joi)',
      '400 vs. 422 and helpful error messages',
      'Custom error classes with status codes',
      'A single, central error handler',
      'Logging errors without leaking stack traces',
    ],
    resources: [
      { label: 'Zod', url: 'https://zod.dev/' },
      { label: 'Express – Error handling', url: 'https://expressjs.com/en/guide/error-handling.html' },
    ],
    examples: [
      {
        title: 'Validating a request body with Zod',
        language: 'js',
        code: dedent(`
          import { z } from 'zod'

          const CreateUser = z.object({
            email: z.string().email(),
            password: z.string().min(8),
            age: z.number().int().min(13).optional(),
          })

          app.post('/users', (req, res) => {
            const result = CreateUser.safeParse(req.body)
            if (!result.success) {
              return res.status(400).json({ errors: result.error.flatten().fieldErrors })
            }
            const user = createUser(result.data) // result.data is typed and trusted
            res.status(201).json(user)
          })
        `),
      },
      {
        title: 'Custom errors and a central handler',
        language: 'js',
        code: dedent(`
          class HttpError extends Error {
            constructor(status, message) {
              super(message)
              this.status = status
            }
          }

          app.get('/orders/:id', async (req, res, next) => {
            try {
              const order = await db.orders.find(req.params.id)
              if (!order) throw new HttpError(404, 'Order not found')
              res.json(order)
            } catch (error) {
              next(error)
            }
          })

          app.use((err, req, res, next) => {
            const status = err instanceof HttpError ? err.status : 500
            if (status === 500) console.error(err) // log details, don't send them
            res.status(status).json({ error: status === 500 ? 'Something went wrong' : err.message })
          })
        `),
      },
    ],
    exercises: [
      {
        id: 'validate-signup',
        title: 'Validate a signup payload',
        prompt:
          'Write `validateSignup(body)` returning `{ valid, errors }`, where `errors` maps field names to a message. Rules: `email` must be a string that looks like an email (something@something.tld); `password` must be a string of at least 8 characters; `age` is optional, but if present it must be an integer of at least 13. The function must never crash — not even when `body` is `null`.',
        starterCode: dedent(`
          function validateSignup(body) {
            const errors = {}

            // TODO: check email, password and age

            return { valid: Object.keys(errors).length === 0, errors }
          }
        `),
        hints: [
          'Start with `const { email, password, age } = body ?? {}`.',
          'A simple email check: `/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)`.',
          'Check types with `typeof` before checking length — `"12345678".length` and `[1,2,3,4,5,6,7,8].length` are both 8!',
          '`Number.isInteger(age)` is false for strings and decimals.',
        ],
        solution: dedent(`
          const EMAIL = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/

          function validateSignup(body) {
            const errors = {}
            const { email, password, age } = body ?? {}

            if (typeof email !== 'string' || !EMAIL.test(email)) {
              errors.email = 'A valid email is required'
            }
            if (typeof password !== 'string' || password.length < 8) {
              errors.password = 'Password must be at least 8 characters'
            }
            if (age !== undefined && (!Number.isInteger(age) || age < 13)) {
              errors.age = 'Age must be a whole number of at least 13'
            }

            return { valid: Object.keys(errors).length === 0, errors }
          }
        `),
        tests: [
          {
            name: 'accepts a valid payload',
            code: dedent(`
              const result = validateSignup({ email: 'ada@example.com', password: 'correct-horse', age: 36 })
              assertDeepEqual(result, { valid: true, errors: {} })
            `),
          },
          {
            name: 'age is optional',
            code: `assertEqual(validateSignup({ email: 'ada@example.com', password: 'correct-horse' }).valid, true)`,
          },
          {
            name: 'rejects a missing or malformed email',
            code: dedent(`
              assert(validateSignup({ password: 'correct-horse' }).errors.email, 'missing email')
              assert(validateSignup({ email: 'not-an-email', password: 'correct-horse' }).errors.email, 'malformed email')
            `),
          },
          {
            name: 'rejects short or non-string passwords',
            code: dedent(`
              assert(validateSignup({ email: 'ada@example.com', password: 'short' }).errors.password, 'short password')
              assert(
                validateSignup({ email: 'ada@example.com', password: [1, 2, 3, 4, 5, 6, 7, 8] }).errors.password,
                'array password',
              )
            `),
          },
          {
            name: 'rejects ages that are too low, decimals or strings',
            code: dedent(`
              const base = { email: 'ada@example.com', password: 'correct-horse' }
              assert(validateSignup({ ...base, age: 12 }).errors.age, 'age 12')
              assert(validateSignup({ ...base, age: 20.5 }).errors.age, 'age 20.5')
              assert(validateSignup({ ...base, age: '20' }).errors.age, 'age "20"')
            `),
          },
          {
            name: 'reports every invalid field at once',
            code: dedent(`
              const result = validateSignup({ email: 'nope', password: '123' })
              assertEqual(result.valid, false)
              assertDeepEqual(Object.keys(result.errors).sort(), ['email', 'password'])
            `),
          },
          {
            name: 'does not crash on a null body',
            code: dedent(`
              const result = validateSignup(null)
              assertEqual(result.valid, false)
              assertDeepEqual(Object.keys(result.errors).sort(), ['email', 'password'])
            `),
          },
        ],
      },
    ],
  },
  {
    id: 'auth',
    title: 'Authentication & Authorization',
    level: 'intermediate',
    summary: 'Knowing who a user is, and what they are allowed to do.',
    concepts: [
      'Authentication vs. authorization',
      'Password hashing (bcrypt, argon2)',
      'Sessions and cookies vs. tokens (JWT)',
      'JWT structure and signature verification',
      'OAuth 2.0 and OpenID Connect',
      'Role-based access control (RBAC)',
      'Secure cookies (HttpOnly, Secure, SameSite)',
    ],
    resources: [
      {
        label: 'OWASP – Authentication Cheat Sheet',
        url: 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html',
      },
      { label: 'jwt.io – Introduction to JWT', url: 'https://jwt.io/introduction' },
    ],
    examples: [
      {
        title: 'Hashing and checking passwords',
        language: 'js',
        description: 'Store only the hash. bcrypt salts automatically and is deliberately slow.',
        code: dedent(`
          import bcrypt from 'bcrypt'

          async function register(email, password) {
            const passwordHash = await bcrypt.hash(password, 12)
            return db.users.insert({ email, passwordHash })
          }

          async function login(email, password) {
            const user = await db.users.findByEmail(email)
            const ok = user && (await bcrypt.compare(password, user.passwordHash))
            if (!ok) throw new HttpError(401, 'Invalid email or password')
            return user
          }
        `),
      },
      {
        title: 'Protecting routes with a JWT and roles',
        language: 'js',
        code: dedent(`
          import jwt from 'jsonwebtoken'

          function requireAuth(req, res, next) {
            const token = req.headers.authorization?.replace(/^Bearer /, '')
            try {
              req.user = jwt.verify(token, process.env.JWT_SECRET) // checks signature + expiry
              next()
            } catch {
              res.status(401).json({ error: 'Not authenticated' })
            }
          }

          const requireRole = (role) => (req, res, next) =>
            req.user.roles.includes(role) ? next() : res.status(403).json({ error: 'Forbidden' })

          app.delete('/users/:id', requireAuth, requireRole('admin'), deleteUser)
        `),
      },
    ],
    exercises: [
      {
        id: 'decode-jwt',
        title: 'Decode a JWT',
        prompt:
          'A JWT is three base64url-encoded parts joined by dots: `header.payload.signature`. Write `decodeJwt(token)` that returns `{ header, payload }` as objects, and throws an `Error` if the token does not have exactly three parts. Remember: decoding is not verifying — never trust a token you have not verified on the server!',
        starterCode: dedent(`
          function decodeJwt(token) {
            // TODO: return { header, payload }
          }

          // Build a sample (unsigned) token to experiment with:
          const encode = (value) => btoa(JSON.stringify(value)).replace(/=+$/, '')
          const token = [encode({ alg: 'HS256', typ: 'JWT' }), encode({ sub: '1234', name: 'Ada' }), 'signature'].join('.')
          console.log(decodeJwt(token))
        `),
        hints: [
          'base64url uses "-" and "_" instead of "+" and "/". Swap them back before decoding.',
          '`atob(text)` decodes base64; `JSON.parse` turns the result into an object.',
          'Some base64 decoders need padding: add "=" until the length is a multiple of 4.',
        ],
        solution: dedent(`
          function decodePart(part) {
            const base64 = part.replace(/-/g, '+').replace(/_/g, '/')
            const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
            const bytes = Uint8Array.from(atob(padded), (character) => character.charCodeAt(0))
            return JSON.parse(new TextDecoder().decode(bytes))
          }

          function decodeJwt(token) {
            const parts = String(token).split('.')
            if (parts.length !== 3) throw new Error('Malformed token')
            return { header: decodePart(parts[0]), payload: decodePart(parts[1]) }
          }
        `),
        tests: [
          {
            name: 'decodes the header and payload',
            code: dedent(`
              const encode = (value) => btoa(JSON.stringify(value)).replace(/=+$/, '')
              const token = [encode({ alg: 'HS256', typ: 'JWT' }), encode({ sub: '1234', name: 'Ada' }), 'sig'].join('.')
              assertDeepEqual(decodeJwt(token), {
                header: { alg: 'HS256', typ: 'JWT' },
                payload: { sub: '1234', name: 'Ada' },
              })
            `),
          },
          {
            name: 'handles base64url characters and missing padding',
            code: dedent(`
              const encode = (value) =>
                btoa(JSON.stringify(value)).replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+$/, '')
              const payload = { note: '>>>???', roles: ['admin'], exp: 1700000000 }
              const token = encode({ alg: 'HS256' }) + '.' + encode(payload) + '.sig'
              assert(/[-_]/.test(token), 'test token should contain base64url characters')
              assertDeepEqual(decodeJwt(token).payload, payload)
            `),
          },
          {
            name: 'decodes UTF-8 claims',
            code: dedent(`
              const encode = (value) => {
                const bytes = new TextEncoder().encode(JSON.stringify(value))
                return btoa(String.fromCharCode(...bytes)).replace(/=+$/, '')
              }
              const token = [encode({ alg: 'HS256' }), encode({ name: 'José' }), 'sig'].join('.')
              assertEqual(decodeJwt(token).payload.name, 'José')
            `),
          },
          {
            name: 'throws on malformed tokens',
            code: dedent(`
              assertThrows(() => decodeJwt('not-a-token'), 'one part')
              assertThrows(() => decodeJwt('a.b'), 'two parts')
              assertThrows(() => decodeJwt('a.b.c.d'), 'four parts')
            `),
          },
        ],
      },
      {
        id: 'rbac',
        title: 'Role-based access control',
        prompt:
          'Write `createAuthorizer(rolePermissions)` that returns a function `can(user, permission)`. `rolePermissions` maps a role to a list of permissions, e.g. `{ editor: ["posts:read", "posts:write"] }`. A user (`{ roles: [...] }`) is allowed if any of their roles grants the permission. The special permission `"*"` grants everything. Users without roles — or no user at all — are denied.',
        starterCode: dedent(`
          function createAuthorizer(rolePermissions) {
            return function can(user, permission) {
              // TODO
            }
          }
        `),
        hints: [
          'Use `user?.roles ?? []` to handle missing users and roles.',
          '`roles.some(role => ...)` returns true as soon as one role grants access.',
          'Use `Object.prototype.hasOwnProperty.call(rolePermissions, role)` so inherited property names are denied.',
        ],
        solution: dedent(`
          function createAuthorizer(rolePermissions) {
            return function can(user, permission) {
              const roles = user?.roles ?? []
              return roles.some((role) => {
                const permissions = Object.prototype.hasOwnProperty.call(rolePermissions, role)
                  ? rolePermissions[role]
                  : []
                return permissions.includes('*') || permissions.includes(permission)
              })
            }
          }
        `),
        tests: [
          {
            name: 'allows permissions granted by a role',
            code: dedent(`
              const can = createAuthorizer({ editor: ['posts:read', 'posts:write'] })
              assertEqual(can({ roles: ['editor'] }, 'posts:write'), true)
            `),
          },
          {
            name: 'denies permissions not granted by any role',
            code: dedent(`
              const can = createAuthorizer({ viewer: ['posts:read'] })
              assertEqual(can({ roles: ['viewer'] }, 'posts:delete'), false)
            `),
          },
          {
            name: 'combines permissions from several roles',
            code: dedent(`
              const can = createAuthorizer({ viewer: ['posts:read'], billing: ['invoices:read'] })
              const user = { roles: ['viewer', 'billing'] }
              assertEqual(can(user, 'posts:read'), true)
              assertEqual(can(user, 'invoices:read'), true)
            `),
          },
          {
            name: '"*" grants everything',
            code: dedent(`
              const can = createAuthorizer({ admin: ['*'] })
              assertEqual(can({ roles: ['admin'] }, 'anything:at-all'), true)
            `),
          },
          {
            name: 'denies missing users, missing roles and unknown roles',
            code: dedent(`
              const can = createAuthorizer({ admin: ['*'] })
              assertEqual(can(null, 'posts:read'), false)
              assertEqual(can({}, 'posts:read'), false)
              assertEqual(can({ roles: ['ghost'] }, 'posts:read'), false)
              assertEqual(can({ roles: ['constructor'] }, 'posts:read'), false)
            `),
          },
        ],
      },
    ],
  },
  {
    id: 'caching',
    title: 'Caching',
    level: 'advanced',
    summary: 'Serving repeated requests quickly without hitting the database every time.',
    concepts: [
      'Where to cache: browser, CDN, server, database',
      'HTTP caching (Cache-Control, ETag, 304 Not Modified)',
      'In-memory caches vs. Redis',
      'The cache-aside pattern',
      'TTLs and cache invalidation',
      'Eviction policies (LRU) and cache stampedes',
    ],
    resources: [
      { label: 'MDN – HTTP caching', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching' },
      { label: 'Redis – Caching', url: 'https://redis.io/solutions/caching/' },
    ],
    examples: [
      {
        title: 'Cache-aside with Redis',
        language: 'js',
        description: 'Check the cache first; on a miss, load from the database and store the result with a TTL.',
        code: dedent(`
          import { createClient } from 'redis'

          const redis = await createClient().connect()

          async function getProduct(id) {
            const key = \`product:\${id}\`
            const cached = await redis.get(key)
            if (cached) return JSON.parse(cached)

            const product = await db.products.find(id)
            await redis.set(key, JSON.stringify(product), { EX: 60 }) // expire after 60s
            return product
          }

          async function updateProduct(id, changes) {
            await db.products.update(id, changes)
            await redis.del(\`product:\${id}\`) // invalidate
          }
        `),
      },
      {
        title: 'HTTP caching headers',
        language: 'js',
        code: dedent(`
          app.get('/api/catalog', (req, res) => {
            // Browsers and CDNs may reuse this response for 5 minutes.
            res.set('Cache-Control', 'public, max-age=300')
            res.json(catalog) // Express adds an ETag; repeat requests can get a 304
          })

          app.get('/api/me', (req, res) => {
            res.set('Cache-Control', 'private, no-store') // never cache personal data in shared caches
            res.json(req.user)
          })
        `),
      },
    ],
    exercises: [
      {
        id: 'lru-cache',
        title: 'Build an LRU cache',
        prompt:
          'Implement `class LRUCache` with a `capacity`. `get(key)` returns the value (or `undefined`) and marks the key as recently used. `set(key, value)` stores the value; when the cache grows beyond `capacity`, evict the least recently used key. Expose a `size` getter.',
        starterCode: dedent(`
          class LRUCache {
            constructor(capacity) {
              this.capacity = capacity
            }

            get(key) {
              // TODO
            }

            set(key, value) {
              // TODO
            }

            get size() {
              // TODO
            }
          }
        `),
        hints: [
          'A `Map` remembers insertion order, and `map.keys().next().value` is the oldest key.',
          'To mark a key as recently used, delete it and set it again so it moves to the end.',
        ],
        solution: dedent(`
          class LRUCache {
            constructor(capacity) {
              this.capacity = capacity
              this.entries = new Map()
            }

            get(key) {
              if (!this.entries.has(key)) return undefined
              const value = this.entries.get(key)
              this.entries.delete(key)
              this.entries.set(key, value)
              return value
            }

            set(key, value) {
              this.entries.delete(key)
              this.entries.set(key, value)
              if (this.entries.size > this.capacity) {
                const oldest = this.entries.keys().next().value
                this.entries.delete(oldest)
              }
            }

            get size() {
              return this.entries.size
            }
          }
        `),
        tests: [
          {
            name: 'stores and returns values',
            code: dedent(`
              const cache = new LRUCache(2)
              cache.set('a', 1)
              assertEqual(cache.get('a'), 1)
              assertEqual(cache.get('missing'), undefined)
              assertEqual(cache.size, 1)
            `),
          },
          {
            name: 'evicts the least recently used key',
            code: dedent(`
              const cache = new LRUCache(2)
              cache.set('a', 1)
              cache.set('b', 2)
              cache.set('c', 3)
              assertEqual(cache.get('a'), undefined, 'a should be evicted')
              assertEqual(cache.get('b'), 2)
              assertEqual(cache.get('c'), 3)
              assertEqual(cache.size, 2)
            `),
          },
          {
            name: 'get() marks a key as recently used',
            code: dedent(`
              const cache = new LRUCache(2)
              cache.set('a', 1)
              cache.set('b', 2)
              cache.get('a')
              cache.set('c', 3)
              assertEqual(cache.get('a'), 1, 'a was used recently')
              assertEqual(cache.get('b'), undefined, 'b should be evicted')
            `),
          },
          {
            name: 'updating a key does not evict anything',
            code: dedent(`
              const cache = new LRUCache(2)
              cache.set('a', 1)
              cache.set('b', 2)
              cache.set('a', 10)
              assertEqual(cache.size, 2)
              assertEqual(cache.get('a'), 10)
              assertEqual(cache.get('b'), 2)
            `),
          },
          {
            name: 'can cache falsy values',
            code: dedent(`
              const cache = new LRUCache(3)
              cache.set('zero', 0)
              cache.set('empty', '')
              assertEqual(cache.get('zero'), 0)
              assertEqual(cache.get('empty'), '')
            `),
          },
        ],
      },
    ],
  },
  {
    id: 'security',
    title: 'API Security',
    level: 'advanced',
    summary: 'Protecting your API, your data and your users.',
    concepts: [
      'The OWASP API Security Top 10',
      'Injection and parameterized queries',
      'CORS and security headers',
      'Rate limiting and brute-force protection',
      'Secrets management and environment variables',
      'HTTPS everywhere and dependency audits',
    ],
    resources: [
      { label: 'OWASP API Security Top 10', url: 'https://owasp.org/API-Security/' },
      {
        label: 'Express – Security best practices',
        url: 'https://expressjs.com/en/advanced/best-practice-security.html',
      },
    ],
    examples: [
      {
        title: 'SQL injection and how to prevent it',
        language: 'js',
        code: dedent(`
          // ❌ Vulnerable: an email of  ' OR '1'='1  returns every user
          const rows = await db.query(
            "SELECT * FROM users WHERE email = '" + req.body.email + "'",
          )

          // ✅ Safe: the driver sends the value separately from the SQL
          const { rows: users } = await db.query(
            'SELECT * FROM users WHERE email = $1',
            [req.body.email],
          )
        `),
      },
      {
        title: 'Hardening an Express app',
        language: 'js',
        code: dedent(`
          import cors from 'cors'
          import rateLimit from 'express-rate-limit'
          import helmet from 'helmet'

          app.use(helmet()) // sensible security headers
          app.use(cors({ origin: 'https://my-frontend.example.com' }))
          app.use(express.json({ limit: '100kb' })) // reject huge bodies
          app.use('/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 20 }))
        `),
      },
    ],
    exercises: [
      {
        id: 'rate-limiter',
        title: 'Write a rate limiter',
        prompt:
          'Write `createRateLimiter({ limit, windowMs })` returning `hit(clientId, now)`. Each client may make `limit` requests per fixed window that starts with their first request; the window resets once `windowMs` milliseconds have passed. `hit` returns `{ allowed, remaining }`, where `remaining` is how many more requests the client can make in the current window. Clients are tracked independently. (`now` is passed in so the limiter is easy to test.)',
        starterCode: dedent(`
          function createRateLimiter({ limit, windowMs }) {
            const clients = new Map()

            return function hit(clientId, now = Date.now()) {
              // TODO: return { allowed, remaining }
            }
          }
        `),
        hints: [
          'Store `{ windowStart, count }` per client in the Map.',
          'Start a new window when the client is new or `now - windowStart >= windowMs`.',
          'If `count` has already reached `limit`, deny without incrementing.',
        ],
        solution: dedent(`
          function createRateLimiter({ limit, windowMs }) {
            const clients = new Map()

            return function hit(clientId, now = Date.now()) {
              let entry = clients.get(clientId)
              if (!entry || now - entry.windowStart >= windowMs) {
                entry = { windowStart: now, count: 0 }
                clients.set(clientId, entry)
              }

              if (entry.count >= limit) return { allowed: false, remaining: 0 }

              entry.count++
              return { allowed: true, remaining: limit - entry.count }
            }
          }
        `),
        tests: [
          {
            name: 'allows requests up to the limit',
            code: dedent(`
              const hit = createRateLimiter({ limit: 3, windowMs: 1000 })
              assertDeepEqual(hit('ip-1', 0), { allowed: true, remaining: 2 })
              assertDeepEqual(hit('ip-1', 10), { allowed: true, remaining: 1 })
              assertDeepEqual(hit('ip-1', 20), { allowed: true, remaining: 0 })
            `),
          },
          {
            name: 'blocks requests over the limit',
            code: dedent(`
              const hit = createRateLimiter({ limit: 2, windowMs: 1000 })
              hit('ip-1', 0)
              hit('ip-1', 1)
              assertDeepEqual(hit('ip-1', 2), { allowed: false, remaining: 0 })
              assertDeepEqual(hit('ip-1', 999), { allowed: false, remaining: 0 })
            `),
          },
          {
            name: 'tracks clients independently',
            code: dedent(`
              const hit = createRateLimiter({ limit: 1, windowMs: 1000 })
              assertEqual(hit('ip-1', 0).allowed, true)
              assertEqual(hit('ip-2', 0).allowed, true)
              assertEqual(hit('ip-1', 1).allowed, false)
            `),
          },
          {
            name: 'resets after the window has passed',
            code: dedent(`
              const hit = createRateLimiter({ limit: 1, windowMs: 1000 })
              assertEqual(hit('ip-1', 0).allowed, true)
              assertEqual(hit('ip-1', 500).allowed, false)
              assertDeepEqual(hit('ip-1', 1000), { allowed: true, remaining: 0 })
            `),
          },
        ],
      },
    ],
  },
  {
    id: 'realtime',
    title: 'Real-time & Events',
    level: 'advanced',
    summary: 'Pushing updates to clients the moment something happens.',
    concepts: [
      'Polling vs. long polling vs. SSE vs. WebSockets',
      'The WebSocket handshake and message framing',
      'Events, pub/sub and the observer pattern',
      'Rooms, broadcasting and presence',
      'Scaling across servers with Redis pub/sub',
      'Heartbeats and reconnection',
    ],
    resources: [
      { label: 'MDN – WebSockets API', url: 'https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API' },
      { label: 'Socket.IO – Introduction', url: 'https://socket.io/docs/v4/' },
    ],
    examples: [
      {
        title: 'A WebSocket chat server',
        language: 'js',
        code: dedent(`
          import { WebSocketServer } from 'ws'

          const wss = new WebSocketServer({ port: 8080 })

          wss.on('connection', (socket) => {
            socket.on('message', (data) => {
              // broadcast to everyone who is still connected
              for (const client of wss.clients) {
                if (client.readyState === client.OPEN) client.send(data.toString())
              }
            })
          })

          // In the browser:
          // const ws = new WebSocket('ws://localhost:8080')
          // ws.onmessage = (event) => console.log(event.data)
          // ws.send('hello!')
        `),
      },
      {
        title: 'Server-Sent Events with Express',
        language: 'js',
        description: 'SSE is a simple one-way stream over plain HTTP, ideal for notifications and progress updates.',
        code: dedent(`
          app.get('/events', (req, res) => {
            res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' })
            res.flushHeaders()

            const timer = setInterval(() => {
              res.write(\`data: \${JSON.stringify({ time: Date.now() })}\\n\\n\`)
            }, 1000)

            req.on('close', () => clearInterval(timer))
          })

          // In the browser: new EventSource('/events').onmessage = (e) => console.log(e.data)
        `),
      },
    ],
    exercises: [
      {
        id: 'event-emitter',
        title: 'Build an event emitter',
        prompt:
          "Node's `EventEmitter` powers servers, sockets and streams. Implement `class EventEmitter` with `on(event, listener)`, `off(event, listener)`, `once(event, listener)` and `emit(event, ...args)`. Listeners run in the order they were added. `emit` returns `true` if the event had listeners, otherwise `false`.",
        starterCode: dedent(`
          class EventEmitter {
            constructor() {
              this.listeners = Object.create(null)
            }

            on(event, listener) {
              // TODO
            }

            off(event, listener) {
              // TODO
            }

            once(event, listener) {
              // TODO
            }

            emit(event, ...args) {
              // TODO
            }
          }
        `),
        hints: [
          'Store an array of listeners per event name.',
          '`once` can register a wrapper that calls `off` on itself before calling the listener.',
          'In `emit`, loop over a copy (`[...listeners]`) so listeners removed mid-emit do not cause others to be skipped.',
        ],
        solution: dedent(`
          class EventEmitter {
            constructor() {
              this.listeners = Object.create(null)
            }

            on(event, listener) {
              ;(this.listeners[event] ??= []).push(listener)
              return this
            }

            off(event, listener) {
              this.listeners[event] = (this.listeners[event] ?? []).filter((l) => l !== listener)
              return this
            }

            once(event, listener) {
              const wrapper = (...args) => {
                this.off(event, wrapper)
                listener(...args)
              }
              return this.on(event, wrapper)
            }

            emit(event, ...args) {
              const listeners = this.listeners[event] ?? []
              for (const listener of [...listeners]) listener(...args)
              return listeners.length > 0
            }
          }
        `),
        tests: [
          {
            name: 'calls listeners with the emitted arguments',
            code: dedent(`
              const emitter = new EventEmitter()
              let received
              emitter.on('message', (from, text) => { received = [from, text] })
              emitter.emit('message', 'ada', 'hi')
              assertDeepEqual(received, ['ada', 'hi'])
            `),
          },
          {
            name: 'calls multiple listeners in order',
            code: dedent(`
              const emitter = new EventEmitter()
              const calls = []
              emitter.on('tick', () => calls.push(1))
              emitter.on('tick', () => calls.push(2))
              emitter.emit('tick')
              assertDeepEqual(calls, [1, 2])
            `),
          },
          {
            name: 'off() removes a listener',
            code: dedent(`
              const emitter = new EventEmitter()
              let count = 0
              const listener = () => count++
              emitter.on('tick', listener)
              emitter.emit('tick')
              emitter.off('tick', listener)
              emitter.emit('tick')
              assertEqual(count, 1)
            `),
          },
          {
            name: 'once() listeners fire a single time',
            code: dedent(`
              const emitter = new EventEmitter()
              let count = 0
              emitter.once('connect', () => count++)
              emitter.emit('connect')
              emitter.emit('connect')
              assertEqual(count, 1)
            `),
          },
          {
            name: 'emit() reports whether there were listeners',
            code: dedent(`
              const emitter = new EventEmitter()
              assertEqual(emitter.emit('nothing'), false)
              let called = false
              emitter.on('constructor', () => { called = true })
              assertEqual(emitter.emit('constructor'), true)
              assertEqual(called, true)
              assertEqual(emitter.emit('toString'), false)
              emitter.on('something', () => {})
              assertEqual(emitter.emit('something'), true)
            `),
          },
          {
            name: 'removing a listener during emit does not skip others',
            code: dedent(`
              const emitter = new EventEmitter()
              const calls = []
              emitter.once('ready', () => calls.push('first'))
              emitter.on('ready', () => calls.push('second'))
              emitter.emit('ready')
              assertDeepEqual(calls, ['first', 'second'])
            `),
          },
        ],
      },
    ],
  },
  {
    id: 'background-jobs',
    title: 'Queues & Background Jobs',
    level: 'advanced',
    summary: 'Moving slow or unreliable work out of the request/response cycle.',
    concepts: [
      'Why offload work (emails, image processing, reports)',
      'Message queues (RabbitMQ, SQS) and job queues (BullMQ)',
      'Producers, consumers and workers',
      'Retries, backoff and dead-letter queues',
      'Idempotent jobs',
      'Scheduled jobs (cron) and concurrency limits',
    ],
    resources: [
      { label: 'BullMQ – Guide', url: 'https://docs.bullmq.io/' },
      { label: 'RabbitMQ – Tutorials', url: 'https://www.rabbitmq.com/tutorials' },
    ],
    examples: [
      {
        title: 'A job queue with BullMQ',
        language: 'js',
        description: 'The API responds immediately; a separate worker process sends the email.',
        code: dedent(`
          import { Queue, Worker } from 'bullmq'

          const connection = { host: 'localhost', port: 6379 } // Redis
          const emailQueue = new Queue('emails', { connection })

          // In the API: enqueue and respond right away
          app.post('/signup', async (req, res) => {
            const user = await createUser(req.body)
            await emailQueue.add(
              'welcome',
              { userId: user.id },
              { attempts: 5, backoff: { type: 'exponential', delay: 1000 } },
            )
            res.status(201).json(user)
          })

          // In a worker process: handle jobs, five at a time
          new Worker('emails', async (job) => sendWelcomeEmail(job.data.userId), {
            connection,
            concurrency: 5,
          })
        `),
      },
    ],
    exercises: [
      {
        id: 'concurrency-limit',
        title: 'Run tasks with a concurrency limit',
        prompt:
          'Workers process many jobs, but not all at once. Write `async function runWithConcurrency(tasks, limit)` where `tasks` is an array of functions that return promises. Run them so that at most `limit` are in progress at any moment, and resolve with their results in the original order. If any task rejects, reject with that error.',
        starterCode: dedent(`
          async function runWithConcurrency(tasks, limit) {
            // TODO
          }
        `),
        hints: [
          'Start `limit` "lanes". Each lane repeatedly takes the next unstarted task index until none remain.',
          'Store each result at its task index so the order is preserved.',
          '`await Promise.all(lanes)` waits for every lane and rejects as soon as one fails.',
        ],
        solution: dedent(`
          async function runWithConcurrency(tasks, limit) {
            const results = new Array(tasks.length)
            let nextIndex = 0

            async function lane() {
              while (nextIndex < tasks.length) {
                const index = nextIndex++
                results[index] = await tasks[index]()
              }
            }

            const lanes = Array.from({ length: Math.min(limit, tasks.length) }, lane)
            await Promise.all(lanes)
            return results
          }
        `),
        tests: [
          {
            name: 'resolves with results in the original order',
            code: dedent(`
              const delay = (ms, value) => () => new Promise((r) => setTimeout(() => r(value), ms))
              const results = await runWithConcurrency([delay(30, 'a'), delay(5, 'b'), delay(15, 'c')], 2)
              assertDeepEqual(results, ['a', 'b', 'c'])
            `),
          },
          {
            name: 'never runs more than `limit` tasks at once',
            code: dedent(`
              let active = 0
              let peak = 0
              const task = () => async () => {
                active++
                peak = Math.max(peak, active)
                await new Promise((r) => setTimeout(r, 10))
                active--
                return true
              }
              await runWithConcurrency(Array.from({ length: 8 }, task), 3)
              assertEqual(peak, 3, 'peak concurrency')
            `),
          },
          {
            name: 'runs every task even when limit is larger than the list',
            code: dedent(`
              let count = 0
              const tasks = [1, 2, 3].map((n) => async () => { count++; return n * 2 })
              assertDeepEqual(await runWithConcurrency(tasks, 10), [2, 4, 6])
              assertEqual(count, 3)
            `),
          },
          {
            name: 'resolves with an empty array when there are no tasks',
            code: `assertDeepEqual(await runWithConcurrency([], 2), [])`,
          },
          {
            name: 'rejects when a task fails',
            code: dedent(`
              const tasks = [async () => 1, async () => { throw new Error('job failed') }, async () => 3]
              await assertRejects(runWithConcurrency(tasks, 2), 'should reject when a task throws')
            `),
          },
        ],
      },
    ],
  },
]

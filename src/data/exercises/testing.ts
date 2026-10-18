import type { Exercise } from '../../playground/types'

/** A tiny Jest/Vitest-style test runner available as globals in the testing exercises. */
const testRunner = `
window.__tests = []

function test(name, fn) {
  window.__tests.push({ name, fn })
}

function expect(actual) {
  const show = (value) => (typeof value === 'string' ? JSON.stringify(value) : String(value))
  const fail = (message) => {
    throw new Error(message)
  }
  return {
    toBe(expected) {
      if (!Object.is(actual, expected)) fail('Expected ' + show(expected) + ' but received ' + show(actual))
    },
    toEqual(expected) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        fail('Expected ' + JSON.stringify(expected) + ' but received ' + JSON.stringify(actual))
      }
    },
    toContain(item) {
      if (!actual.includes(item)) fail('Expected ' + show(actual) + ' to contain ' + show(item))
    },
    toThrow() {
      try {
        actual()
      } catch {
        return
      }
      fail('Expected the function to throw')
    },
    async toReject() {
      try {
        await actual
      } catch {
        return
      }
      fail('Expected the promise to reject')
    },
  }
}

// Runs every test; globals such as fetch are restored after each one, like vi.restoreAllMocks().
window.__runTests = async function () {
  const results = []
  for (const { name, fn } of window.__tests) {
    const originalFetch = window.fetch
    try {
      await fn()
      results.push({ name, passed: true })
    } catch (error) {
      results.push({ name, passed: false, error: error instanceof Error ? error.message : String(error) })
    } finally {
      window.fetch = originalFetch
    }
  }
  return results
}

window.addEventListener('load', async () => {
  const results = await window.__runTests()
  const passed = results.filter((result) => result.passed).length
  const heading = document.createElement('h2')
  heading.textContent = passed + ' of ' + results.length + ' tests passed'
  const list = document.createElement('ul')
  list.style.listStyle = 'none'
  list.style.padding = '0'
  for (const result of results) {
    const item = document.createElement('li')
    item.style.color = result.passed ? '#059669' : '#dc2626'
    item.textContent = (result.passed ? '✓ ' : '✗ ') + result.name + (result.error ? ' — ' + result.error : '')
    list.append(item)
  }
  document.body.append(heading, list)
})
`

const slugifySource = `// The function under test. Don't change it — write tests for it below!
function slugify(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\\s-]/g, '')
    .replace(/[\\s-]+/g, '-')
}
`

const displayNameSource = `// The code under test. Don't change it — write tests for it below!
async function getDisplayName(userId) {
  const response = await fetch(\`https://api.example.com/users/\${userId}\`)
  if (!response.ok) throw new Error('Request failed')
  const user = await response.json()
  return \`\${user.firstName} \${user.lastName}\`
}
`

export const testingExercises: Exercise[] = [
  {
    id: 'unit-tests',
    title: 'Write unit tests that catch bugs',
    instructions: [
      'Write tests for `slugify()` using `test(name, fn)` and `expect(value).toBe(expected)`. The results appear in the preview.',
      'Add a test showing that upper-case letters become lower-case, e.g. `Hello World` → `hello-world`.',
      'Add a test showing that punctuation is removed, e.g. `Hello, World!` → `hello-world`.',
      'Add a test showing that several spaces become a single dash, e.g. `a   b` → `a-b`.',
      'The checks run your tests against broken versions of `slugify` — good tests fail when the code has a bug.',
    ],
    hints: [
      'Each test should check one behaviour, and its name should describe that behaviour.',
      'Available matchers: `toBe`, `toEqual`, `toContain`, `toThrow` and (async) `toReject`.',
    ],
    setup: testRunner,
    preview: true,
    starter: {
      js: `${slugifySource}
test('turns spaces into dashes', () => {
  expect(slugify('hello world')).toBe('hello-world')
})

// TODO: add tests for upper-case letters, punctuation and repeated spaces
`,
    },
    solution: {
      js: `${slugifySource}
test('turns spaces into dashes', () => {
  expect(slugify('hello world')).toBe('hello-world')
})

test('lower-cases letters', () => {
  expect(slugify('Hello World')).toBe('hello-world')
})

test('removes punctuation', () => {
  expect(slugify('Hello, World!')).toBe('hello-world')
})

test('collapses repeated spaces into one dash', () => {
  expect(slugify('a   b')).toBe('a-b')
})
`,
    },
    checks: [
      {
        label: 'There are at least 4 tests, and they all pass against the real `slugify`',
        test: async ({ global }) => {
          const tests = global('__tests')
          const results = await global('__runTests')()
          return tests.length >= 4 && results.every((result: { passed: boolean }) => result.passed)
        },
      },
      {
        label: 'Your tests catch a bug where upper-case letters are dropped',
        test: async ({ window, global }) => {
          const target = window as unknown as { slugify: (text: string) => string }
          const original = target.slugify
          target.slugify = (text) => text.trim().replace(/[^a-z0-9\s-]/g, '').replace(/[\s-]+/g, '-')
          try {
            const results = await global('__runTests')()
            return results.some((result: { passed: boolean }) => !result.passed)
          } finally {
            target.slugify = original
          }
        },
      },
      {
        label: 'Your tests catch a bug where punctuation is kept',
        test: async ({ window, global }) => {
          const target = window as unknown as { slugify: (text: string) => string }
          const original = target.slugify
          target.slugify = (text) => text.trim().toLowerCase().replace(/[\s-]+/g, '-')
          try {
            const results = await global('__runTests')()
            return results.some((result: { passed: boolean }) => !result.passed)
          } finally {
            target.slugify = original
          }
        },
      },
      {
        label: 'Your tests catch a bug where every space becomes its own dash',
        test: async ({ window, global }) => {
          const target = window as unknown as { slugify: (text: string) => string }
          const original = target.slugify
          target.slugify = (text) =>
            text
              .trim()
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/\s/g, '-')
          try {
            const results = await global('__runTests')()
            return results.some((result: { passed: boolean }) => !result.passed)
          } finally {
            target.slugify = original
          }
        },
      },
    ],
  },
  {
    id: 'mock-fetch',
    title: 'Mock network requests',
    instructions: [
      'Tests should never call a real API. In each test, replace `window.fetch` with a fake async function.',
      'Test that `getDisplayName(1)` returns `Ada Lovelace` when the fake responds with `{ ok: true, json: async () => ({ firstName: \'Ada\', lastName: \'Lovelace\' }) }`.',
      'Test that `getDisplayName(42)` requests `https://api.example.com/users/42` (record the URL your fake receives).',
      'Test that `getDisplayName()` rejects when the response has `ok: false`, using `await expect(promise).toReject()`.',
    ],
    hints: [
      'A fake: `window.fetch = async (url) => ({ ok: true, json: async () => user })`.',
      'Record calls: `let requestedUrl; window.fetch = async (url) => { requestedUrl = url; return … }`.',
      'The runner restores the real `fetch` after every test.',
    ],
    setup: testRunner,
    preview: true,
    starter: {
      js: `${displayNameSource}
test('formats the user name', async () => {
  // TODO: fake window.fetch and check the result
})

test('requests the right URL', async () => {
  // TODO: record the URL passed to your fake fetch
})

test('rejects when the request fails', async () => {
  // TODO: respond with { ok: false }
})
`,
    },
    solution: {
      js: `${displayNameSource}
test('formats the user name', async () => {
  window.fetch = async () => ({
    ok: true,
    json: async () => ({ firstName: 'Ada', lastName: 'Lovelace' }),
  })
  expect(await getDisplayName(1)).toBe('Ada Lovelace')
})

test('requests the right URL', async () => {
  let requestedUrl
  window.fetch = async (url) => {
    requestedUrl = url
    return { ok: true, json: async () => ({ firstName: 'Alan', lastName: 'Turing' }) }
  }
  await getDisplayName(42)
  expect(requestedUrl).toBe('https://api.example.com/users/42')
})

test('rejects when the request fails', async () => {
  window.fetch = async () => ({ ok: false })
  await expect(getDisplayName(1)).toReject()
})
`,
    },
    checks: [
      {
        label: 'All tests pass without touching the real network',
        test: async ({ window, global }) => {
          const original = window.fetch
          let networkCalls = 0
          window.fetch = () => {
            networkCalls++
            return Promise.reject(new Error('The test used the real network'))
          }
          try {
            const results = await global('__runTests')()
            return (
              global('__tests').length >= 3 &&
              results.every((result: { passed: boolean }) => result.passed) &&
              networkCalls === 0
            )
          } finally {
            window.fetch = original
          }
        },
      },
      {
        label: 'Your tests catch a bug in how the name is formatted',
        test: async ({ window, global }) => {
          const target = window as unknown as { getDisplayName: (id: number) => Promise<string> }
          const original = target.getDisplayName
          target.getDisplayName = async (userId) => {
            const response = await fetch(`https://api.example.com/users/${userId}`)
            if (!response.ok) throw new Error('Request failed')
            const user = await response.json()
            return user.firstName
          }
          try {
            const results = await global('__runTests')()
            return results.some((result: { passed: boolean }) => !result.passed)
          } finally {
            target.getDisplayName = original
          }
        },
      },
      {
        label: 'Your tests catch a request to the wrong URL',
        test: async ({ window, global }) => {
          const target = window as unknown as { getDisplayName: (id: number) => Promise<string> }
          const original = target.getDisplayName
          target.getDisplayName = async (userId) => {
            const response = await fetch(`https://api.example.com/user/${userId}`)
            if (!response.ok) throw new Error('Request failed')
            const user = await response.json()
            return `${user.firstName} ${user.lastName}`
          }
          try {
            const results = await global('__runTests')()
            return results.some((result: { passed: boolean }) => !result.passed)
          } finally {
            target.getDisplayName = original
          }
        },
      },
      {
        label: 'Your tests catch a failed request that is silently ignored',
        test: async ({ window, global }) => {
          const target = window as unknown as { getDisplayName: (id: number) => Promise<string | null> }
          const original = target.getDisplayName
          target.getDisplayName = async (userId) => {
            const response = await fetch(`https://api.example.com/users/${userId}`)
            if (!response.ok) return null
            const user = await response.json()
            return `${user.firstName} ${user.lastName}`
          }
          try {
            const results = await global('__runTests')()
            return results.some((result: { passed: boolean }) => !result.passed)
          } finally {
            target.getDisplayName = original
          }
        },
      },
    ],
  },
]

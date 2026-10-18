import type { Exercise } from '../../playground/types'

const photo = (color: string, label: string) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'%3E%3Crect width='600' height='400' fill='%23${color}'/%3E%3Ctext x='300' y='215' font-size='48' text-anchor='middle' fill='white' font-family='sans-serif'%3E${label}%3C/text%3E%3C/svg%3E`

const galleryCss = `img {
  display: block;
  max-width: 100%;
  height: auto;
  margin-bottom: 16px;
  border-radius: 8px;
}
`

const galleryStarter = `<h1>Mountain gallery</h1>
<img src="${photo('4f46e5', 'Hero')}" alt="Hero photo of the mountains">

<p>Scroll down for more photos.</p>
<div style="height: 800px"></div>

<img src="${photo('059669', 'Lake')}" alt="A mountain lake">
<img src="${photo('d97706', 'Sunset')}" alt="Sunset over the peaks">
<img src="${photo('dc2626', 'Cabin')}" alt="A cabin in the snow">
`

const debounceHtml = `<label for="search">Search</label>
<input id="search" placeholder="Type quickly…">
<p id="log">No searches yet.</p>
`

const debounceStarter = `let searchCount = 0

// Pretend this is an expensive request to a server.
function search(query) {
  searchCount++
  document.querySelector('#log').textContent = \`Searched \${searchCount} times. Last query: "\${query}"\`
}

function debounce(fn, wait) {
  // TODO: return a function that waits until it has not been called for \`wait\` ms,
  // then calls fn with the latest arguments.
  return fn
}

const debouncedSearch = debounce(search, 300)

document.querySelector('#search').addEventListener('input', (event) => {
  debouncedSearch(event.target.value)
})
`

export const performanceExercises: Exercise[] = [
  {
    id: 'debounce',
    title: 'Debounce expensive work',
    instructions: [
      'Type in the preview: right now every keystroke triggers a search.',
      'Implement `debounce(fn, wait)`: it returns a new function that restarts a timer on every call and only calls `fn` once `wait` ms have passed without another call.',
      'Pass the arguments of the latest call to `fn`.',
    ],
    hints: [
      'Keep the timer id in a variable inside `debounce` — the returned function closes over it.',
      'On every call: `clearTimeout(timer)`, then `timer = setTimeout(() => fn(...args), wait)`.',
    ],
    starter: { html: debounceHtml, js: debounceStarter },
    solution: {
      html: debounceHtml,
      js: debounceStarter.replace(
        `  // TODO: return a function that waits until it has not been called for \`wait\` ms,
  // then calls fn with the latest arguments.
  return fn`,
        `  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), wait)
  }`,
      ),
    },
    checks: [
      {
        label: 'Rapid calls are delayed and collapsed into one call with the latest arguments',
        test: async ({ global, tick }) => {
          const calls: unknown[] = []
          const debounced = global('debounce')((value: unknown) => calls.push(value), 50)
          debounced('a')
          debounced('b')
          debounced('c')
          if (calls.length !== 0) throw new Error('fn was called immediately')
          await tick(100)
          return JSON.stringify(calls) === '["c"]'
        },
      },
      {
        label: 'It calls `fn` again after a pause',
        test: async ({ global, tick }) => {
          const calls: unknown[] = []
          const debounced = global('debounce')((value: unknown) => calls.push(value), 30)
          debounced(1)
          await tick(60)
          debounced(2)
          await tick(60)
          return JSON.stringify(calls) === '[1,2]'
        },
      },
      {
        label: 'Typing quickly in the search box triggers only one search',
        test: async ({ document, window, global, tick }) => {
          const input = document.querySelector<HTMLInputElement>('#search')
          if (!input) return false
          const before = global<number>('searchCount')
          for (const value of ['p', 'pi', 'piz', 'pizza']) {
            input.value = value
            input.dispatchEvent(new window.Event('input', { bubbles: true }))
            await tick(10)
          }
          await tick(400)
          return global<number>('searchCount') - before === 1 && /"pizza"/.test(document.querySelector('#log')?.textContent ?? '')
        },
      },
    ],
  },
  {
    id: 'lazy-images',
    title: 'Load images efficiently',
    instructions: [
      'Add `width="600"` and `height="400"` to every image so the browser reserves space before it loads (no layout shift).',
      'Add `loading="lazy"` to the images below the fold so they only load when scrolled into view.',
      'Do not lazy-load the hero image at the top — it is the Largest Contentful Paint. Give it `fetchpriority="high"` instead.',
    ],
    hints: [
      'With `width`/`height` attributes plus `height: auto` in CSS, the browser knows the aspect ratio up front.',
      'Lazy-loading images that are visible straight away makes them load later, hurting LCP.',
    ],
    starter: { html: galleryStarter, css: galleryCss },
    solution: {
      html: galleryStarter
        .replace('alt="Hero', 'width="600" height="400" fetchpriority="high" alt="Hero')
        .replace(/alt="(A mountain lake|Sunset over the peaks|A cabin in the snow)"/g, 'width="600" height="400" loading="lazy" alt="$1"'),
      css: galleryCss,
    },
    checks: [
      {
        label: 'Every image has `width="600"` and `height="400"` attributes',
        test: ({ document }) => {
          const images = [...document.querySelectorAll('img')]
          return (
            images.length === 4 &&
            images.every((image) => image.getAttribute('width') === '600' && image.getAttribute('height') === '400')
          )
        },
      },
      {
        label: 'The three images below the fold use `loading="lazy"`',
        test: ({ document }) => {
          const images = [...document.querySelectorAll('img')].slice(1)
          return images.length === 3 && images.every((image) => image.getAttribute('loading') === 'lazy')
        },
      },
      {
        label: 'The hero image is not lazy and has `fetchpriority="high"`',
        test: ({ document }) => {
          const hero = document.querySelector('img')
          return (
            hero !== null &&
            hero.getAttribute('loading') !== 'lazy' &&
            hero.getAttribute('fetchpriority') === 'high'
          )
        },
      },
    ],
  },
]

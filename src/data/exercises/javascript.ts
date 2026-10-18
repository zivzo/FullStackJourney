import type { Exercise } from '../../playground/types'

export const javascriptExercises: Exercise[] = [
  {
    id: 'click-counter',
    title: 'Click counter with DOM events',
    instructions: [
      'Select the `#count`, `#increment` and `#reset` elements with `document.querySelector`.',
      'Keep the current count in a variable.',
      'When `#increment` is clicked, add 1 and show the new count in `#count`.',
      'When `#reset` is clicked, set the count back to 0.',
    ],
    hints: [
      '`button.addEventListener(\'click\', () => { … })` runs the function on every click.',
      'Update the page with `countElement.textContent = count`.',
    ],
    starter: {
      html: `<p>Count: <span id="count">0</span></p>
<button id="increment">+1</button>
<button id="reset">Reset</button>
`,
      js: `// 1. Select the elements
// 2. Keep the count in a variable
// 3. Listen for clicks and update the page

`,
    },
    solution: {
      html: `<p>Count: <span id="count">0</span></p>
<button id="increment">+1</button>
<button id="reset">Reset</button>
`,
      js: `const countElement = document.querySelector('#count')
const incrementButton = document.querySelector('#increment')
const resetButton = document.querySelector('#reset')

let count = 0

function render() {
  countElement.textContent = count
}

incrementButton.addEventListener('click', () => {
  count++
  render()
})

resetButton.addEventListener('click', () => {
  count = 0
  render()
})
`,
    },
    checks: [
      {
        label: 'Clicking +1 three times shows 3',
        test: ({ document }) => {
          const button = document.querySelector<HTMLButtonElement>('#increment')
          button?.click()
          button?.click()
          button?.click()
          return document.querySelector('#count')?.textContent?.trim() === '3'
        },
      },
      {
        label: 'Reset sets the count back to 0',
        test: ({ document }) => {
          document.querySelector<HTMLButtonElement>('#reset')?.click()
          return document.querySelector('#count')?.textContent?.trim() === '0'
        },
      },
      {
        label: 'Counting continues correctly after a reset',
        test: ({ document }) => {
          document.querySelector<HTMLButtonElement>('#increment')?.click()
          return document.querySelector('#count')?.textContent?.trim() === '1'
        },
      },
    ],
  },
  {
    id: 'shopping-cart',
    title: 'Shopping cart with array methods',
    instructions: [
      'Implement `getTotal(items)`: return the sum of `price * quantity` for every item. Try `reduce`.',
      'Implement `getInStockNames(items)`: return the names of the items that are in stock. Try `filter` and `map`.',
      'Show the total of `cart` with two decimals (`toFixed(2)`) in the `#total` element.',
    ],
    hints: [
      '`items.reduce((sum, item) => sum + item.price * item.quantity, 0)`',
      '`items.filter((item) => item.inStock)` keeps only the matching items.',
    ],
    starter: {
      html: `<h1>Your cart</h1>
<p>Total: $<span id="total">?</span></p>
`,
      js: `const cart = [
  { name: 'Keyboard', price: 49.99, quantity: 1, inStock: true },
  { name: 'Mouse', price: 19.5, quantity: 2, inStock: false },
  { name: 'Monitor', price: 189, quantity: 1, inStock: true },
]

function getTotal(items) {
  // Return the sum of price * quantity for every item
}

function getInStockNames(items) {
  // Return the names of the items that are in stock
}

console.log('Total:', getTotal(cart))
console.log('In stock:', getInStockNames(cart))
`,
    },
    solution: {
      html: `<h1>Your cart</h1>
<p>Total: $<span id="total">?</span></p>
`,
      js: `const cart = [
  { name: 'Keyboard', price: 49.99, quantity: 1, inStock: true },
  { name: 'Mouse', price: 19.5, quantity: 2, inStock: false },
  { name: 'Monitor', price: 189, quantity: 1, inStock: true },
]

function getTotal(items) {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

function getInStockNames(items) {
  return items.filter((item) => item.inStock).map((item) => item.name)
}

document.querySelector('#total').textContent = getTotal(cart).toFixed(2)

console.log('Total:', getTotal(cart))
console.log('In stock:', getInStockNames(cart))
`,
    },
    checks: [
      {
        label: '`getTotal` adds up `price * quantity`',
        test: ({ global }) => {
          const getTotal = global('getTotal')
          return (
            getTotal([]) === 0 &&
            getTotal([
              { name: 'A', price: 2, quantity: 3, inStock: true },
              { name: 'B', price: 1.5, quantity: 2, inStock: false },
            ]) === 9
          )
        },
      },
      {
        label: '`getInStockNames` returns only the names of in-stock items',
        test: ({ global }) => {
          const names = global('getInStockNames')([
            { name: 'A', price: 1, quantity: 1, inStock: false },
            { name: 'B', price: 1, quantity: 1, inStock: true },
            { name: 'C', price: 1, quantity: 1, inStock: true },
          ])
          return JSON.stringify(names) === '["B","C"]'
        },
      },
      {
        label: '`#total` shows 277.99',
        test: ({ document }) => document.querySelector('#total')?.textContent?.trim() === '277.99',
      },
    ],
  },
  {
    id: 'async-users',
    title: 'Load data with async/await',
    instructions: [
      'When `#load` is clicked, show `Loading…` in `#status` straight away.',
      'Then `await api.getUsers()` (it returns a promise that resolves after a short delay) and add one `<li>` per user name to `#users`.',
      'When done, show `Loaded 3 users` in `#status` (use the real number of users).',
      'Use `try`/`catch`: if the request fails, show `Something went wrong` in `#status`.',
    ],
    hints: [
      'Mark the click handler as `async` so you can use `await` inside it.',
      'Create list items with `document.createElement(\'li\')` and add them with `append`.',
    ],
    setup: `window.api = {
  getUsers() {
    return new Promise((resolve) => {
      setTimeout(() => resolve([
        { id: 1, name: 'Ada Lovelace' },
        { id: 2, name: 'Alan Turing' },
        { id: 3, name: 'Grace Hopper' },
      ]), 300)
    })
  },
}`,
    starter: {
      html: `<button id="load">Load users</button>
<p id="status"></p>
<ul id="users"></ul>
`,
      js: `const loadButton = document.querySelector('#load')
const statusElement = document.querySelector('#status')
const usersList = document.querySelector('#users')

// api.getUsers() returns a Promise that resolves to [{ id, name }, ...]

loadButton.addEventListener('click', () => {
  // Your code here
})
`,
    },
    solution: {
      html: `<button id="load">Load users</button>
<p id="status"></p>
<ul id="users"></ul>
`,
      js: `const loadButton = document.querySelector('#load')
const statusElement = document.querySelector('#status')
const usersList = document.querySelector('#users')

loadButton.addEventListener('click', async () => {
  statusElement.textContent = 'Loading…'
  usersList.replaceChildren()
  try {
    const users = await api.getUsers()
    for (const user of users) {
      const item = document.createElement('li')
      item.textContent = user.name
      usersList.append(item)
    }
    statusElement.textContent = \`Loaded \${users.length} users\`
  } catch (error) {
    console.error(error)
    statusElement.textContent = 'Something went wrong'
  }
})
`,
    },
    checks: [
      {
        label: 'Clicking the button shows `Loading…` right away',
        test: ({ document }) => {
          document.querySelector<HTMLButtonElement>('#load')?.click()
          return /loading/i.test(document.querySelector('#status')?.textContent ?? '')
        },
      },
      {
        label: 'Each user is rendered as an `<li>` in `#users`',
        test: async ({ document, tick }) => {
          await tick(400)
          const names = [...document.querySelectorAll('#users li')].map((item) => item.textContent?.trim())
          return JSON.stringify(names) === '["Ada Lovelace","Alan Turing","Grace Hopper"]'
        },
      },
      {
        label: '`#status` says `Loaded 3 users`',
        test: ({ document }) => document.querySelector('#status')?.textContent?.trim() === 'Loaded 3 users',
      },
      {
        label: 'A failed request shows `Something went wrong`',
        test: async ({ document, window, tick }) => {
          const api = (window as unknown as { api: { getUsers: () => Promise<unknown> } }).api
          api.getUsers = () => Promise.reject(new Error('Network error'))
          document.querySelector<HTMLButtonElement>('#load')?.click()
          await tick(50)
          return document.querySelector('#status')?.textContent?.trim() === 'Something went wrong'
        },
      },
    ],
  },
]

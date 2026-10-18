import type { Exercise } from '../../playground/types'

const reducerUi = `function Cart() {
  const [state, dispatch] = useReducer(cartReducer, { items: {} })

  const total = products.reduce(
    (sum, product) => sum + product.price * (state.items[product.id] ?? 0),
    0,
  )

  return (
    <div>
      <h1>Groceries</h1>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            {product.name} × {state.items[product.id] ?? 0}{' '}
            <button onClick={() => dispatch({ type: 'added', productId: product.id })}>
              Add {product.name}
            </button>{' '}
            <button onClick={() => dispatch({ type: 'removed', productId: product.id })}>
              Remove {product.name}
            </button>
          </li>
        ))}
      </ul>
      <p id="total">Total: \${total.toFixed(2)}</p>
      <button onClick={() => dispatch({ type: 'cleared' })}>Clear cart</button>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<Cart />)
`

const reducerHeader = `const { useReducer } = React

const products = [
  { id: 'apple', name: 'Apple', price: 0.5 },
  { id: 'bread', name: 'Bread', price: 2.25 },
  { id: 'milk', name: 'Milk', price: 1.2 },
]

// state looks like { items: { apple: 2, milk: 1 } } (product id → quantity)
`

const contextCss = `section {
  margin-top: 12px;
  padding: 16px;
  border-radius: 8px;
}

.light {
  background: #f3f4f6;
  color: #111827;
}

.dark {
  background: #111827;
  color: #f3f4f6;
}
`

export const stateManagementExercises: Exercise[] = [
  {
    id: 'cart-reducer',
    title: 'Manage a cart with useReducer',
    instructions: [
      'Handle `added`: increase the quantity of `action.productId` by 1.',
      'Handle `removed`: decrease the quantity by 1 and delete the product from `items` when it reaches 0.',
      'Handle `cleared`: empty the cart.',
      'Never mutate `state`: always return a new object (spread `...state.items` into a copy).',
    ],
    hints: [
      'Add: `return { items: { ...state.items, [id]: (state.items[id] ?? 0) + 1 } }`.',
      'To delete a key without mutating, copy first: `const items = { ...state.items }; delete items[id]`.',
    ],
    react: true,
    starter: {
      jsx: `${reducerHeader}
function cartReducer(state, action) {
  switch (action.type) {
    // TODO: handle 'added', 'removed' and 'cleared'
    default:
      return state
  }
}

${reducerUi}`,
    },
    solution: {
      jsx: `${reducerHeader}
function cartReducer(state, action) {
  switch (action.type) {
    case 'added': {
      const quantity = state.items[action.productId] ?? 0
      return { items: { ...state.items, [action.productId]: quantity + 1 } }
    }
    case 'removed': {
      const quantity = state.items[action.productId] ?? 0
      const items = { ...state.items }
      if (quantity <= 1) delete items[action.productId]
      else items[action.productId] = quantity - 1
      return { items }
    }
    case 'cleared':
      return { items: {} }
    default:
      return state
  }
}

${reducerUi}`,
    },
    checks: [
      {
        label: '`added` increases the quantity',
        test: ({ global }) => {
          const reducer = global('cartReducer')
          const once = reducer({ items: {} }, { type: 'added', productId: 'apple' })
          const twice = reducer(once, { type: 'added', productId: 'apple' })
          return once.items.apple === 1 && twice.items.apple === 2
        },
      },
      {
        label: '`removed` decreases the quantity and deletes the product at 0',
        test: ({ global }) => {
          const reducer = global('cartReducer')
          const one = reducer({ items: { apple: 2, milk: 1 } }, { type: 'removed', productId: 'apple' })
          const none = reducer({ items: { apple: 1, milk: 1 } }, { type: 'removed', productId: 'apple' })
          return one.items.apple === 1 && one.items.milk === 1 && !('apple' in none.items) && none.items.milk === 1
        },
      },
      {
        label: '`cleared` empties the cart',
        test: ({ global }) =>
          Object.keys(global('cartReducer')({ items: { apple: 3 } }, { type: 'cleared' }).items).length === 0,
      },
      {
        label: 'The reducer never mutates the previous state',
        test: ({ global }) => {
          const reducer = global('cartReducer')
          const state = Object.freeze({ items: Object.freeze({ apple: 1 }) })
          const added = reducer(state, { type: 'added', productId: 'apple' })
          const removed = reducer(state, { type: 'removed', productId: 'apple' })
          return (
            added !== state &&
            added.items !== state.items &&
            removed.items !== state.items &&
            state.items.apple === 1
          )
        },
      },
      {
        label: 'The page total updates when you add and remove items',
        test: async ({ document, tick }) => {
          const click = async (label: string) => {
            const button = [...document.querySelectorAll('button')].find((b) => b.textContent?.trim() === label)
            button?.click()
            await tick(20)
          }
          await click('Add Bread')
          await click('Add Bread')
          await click('Add Milk')
          await click('Remove Bread')
          const total = document.querySelector('#total')?.textContent?.trim()
          await click('Clear cart')
          return total === 'Total: $3.45' && document.querySelector('#total')?.textContent?.trim() === 'Total: $0.00'
        },
      },
    ],
  },
  {
    id: 'theme-context',
    title: 'Share state with Context',
    instructions: [
      'Create a `ThemeContext` with `createContext()`.',
      'In `App`, wrap the children in `<ThemeContext.Provider value={{ theme, setTheme }}>` (or `<ThemeContext value={…}>` in React 19).',
      'In `ThemeToggle`, read `theme` and `setTheme` with `useContext` and toggle between `light` and `dark` on click. The label should read `Switch to dark` or `Switch to light`.',
      'In `Panel`, read the theme with `useContext` and use it as the `className` and in the text.',
      'Do not pass any props to `ThemeToggle` or `Panel` — that is the point of Context!',
    ],
    hints: [
      '`const ThemeContext = createContext(null)` creates the context outside of any component.',
      '`const { theme, setTheme } = useContext(ThemeContext)` reads the value from the nearest provider.',
    ],
    react: true,
    starter: {
      jsx: `const { createContext, useContext, useState } = React

// TODO: create ThemeContext

function ThemeToggle() {
  // TODO: read theme and setTheme from the context
  return <button>Switch to dark</button>
}

function Panel() {
  // TODO: read the theme from the context
  return <section className="light">Current theme: light</section>
}

function App() {
  const [theme, setTheme] = useState('light')

  // TODO: provide { theme, setTheme } to the components below
  return (
    <div>
      <ThemeToggle />
      <Panel />
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
`,
      css: contextCss,
    },
    solution: {
      jsx: `const { createContext, useContext, useState } = React

const ThemeContext = createContext(null)

function ThemeToggle() {
  const { theme, setTheme } = useContext(ThemeContext)
  const next = theme === 'light' ? 'dark' : 'light'
  return <button onClick={() => setTheme(next)}>Switch to {next}</button>
}

function Panel() {
  const { theme } = useContext(ThemeContext)
  return <section className={theme}>Current theme: {theme}</section>
}

function App() {
  const [theme, setTheme] = useState('light')

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div>
        <ThemeToggle />
        <Panel />
      </div>
    </ThemeContext.Provider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
`,
      css: contextCss,
    },
    checks: [
      {
        label: 'The code uses `createContext` and `useContext`',
        test: ({ source }) => /createContext\s*\(/.test(source.jsx ?? '') && /useContext\s*\(/.test(source.jsx ?? ''),
      },
      {
        label: '`ThemeToggle` and `Panel` receive no props',
        test: ({ source }) => /<ThemeToggle\s*\/>/.test(source.jsx ?? '') && /<Panel\s*\/>/.test(source.jsx ?? ''),
      },
      {
        label: 'The panel starts in the light theme',
        test: ({ document }) => {
          const panel = document.querySelector('section')
          return panel?.className === 'light' && /Current theme: light/.test(panel.textContent ?? '')
        },
      },
      {
        label: 'Clicking the button switches the panel to dark and back',
        test: async ({ document, tick }) => {
          const button = document.querySelector('button')
          const panel = () => document.querySelector('section')
          button?.click()
          await tick(20)
          const dark =
            panel()?.className === 'dark' &&
            /Current theme: dark/.test(panel()?.textContent ?? '') &&
            button?.textContent?.trim() === 'Switch to light'
          button?.click()
          await tick(20)
          return dark && panel()?.className === 'light' && button?.textContent?.trim() === 'Switch to dark'
        },
      },
    ],
  },
]

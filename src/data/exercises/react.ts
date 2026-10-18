import type { Exercise } from '../../playground/types'

export const reactExercises: Exercise[] = [
  {
    id: 'counter-state',
    title: 'Components, props and state',
    instructions: [
      'Store `count` with `useState(0)` and increase it when the button is clicked.',
      'Give `Counter` a `step` prop (default `1`) and increase the count by `step` on each click.',
      'Render two counters in `App`: `<Counter />` and `<Counter step={5} />`. Notice that each one keeps its own state.',
    ],
    hints: [
      '`const [count, setCount] = useState(0)` returns the value and a setter.',
      'Default props come from destructuring: `function Counter({ step = 1 }) { … }`.',
      'Update with `setCount(count + step)` inside `onClick={() => …}`.',
    ],
    react: true,
    starter: {
      jsx: `const { useState } = React

function Counter() {
  const count = 0

  return (
    <div>
      <p>Count: {count}</p>
      <button>Add</button>
    </div>
  )
}

function App() {
  return (
    <main>
      <h1>Counters</h1>
      <Counter />
    </main>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
`,
    },
    solution: {
      jsx: `const { useState } = React

function Counter({ step = 1 }) {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + step)}>Add {step}</button>
    </div>
  )
}

function App() {
  return (
    <main>
      <h1>Counters</h1>
      <Counter />
      <Counter step={5} />
    </main>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
`,
    },
    checks: [
      {
        label: 'Two counters are rendered, both starting at 0',
        test: ({ document }) => {
          const counts = [...document.querySelectorAll('#root p')].map((p) => p.textContent?.trim())
          return document.querySelectorAll('#root button').length === 2 && counts.join() === 'Count: 0,Count: 0'
        },
      },
      {
        label: 'Clicking the first button adds 1 to the first counter only',
        test: async ({ document, tick }) => {
          document.querySelectorAll<HTMLButtonElement>('#root button')[0]?.click()
          await tick(20)
          const counts = [...document.querySelectorAll('#root p')].map((p) => p.textContent?.trim())
          return counts.join() === 'Count: 1,Count: 0'
        },
      },
      {
        label: 'Clicking the second button adds its `step` (5)',
        test: async ({ document, tick }) => {
          const button = document.querySelectorAll<HTMLButtonElement>('#root button')[1]
          button?.click()
          await tick(20)
          button?.click()
          await tick(20)
          const counts = [...document.querySelectorAll('#root p')].map((p) => p.textContent?.trim())
          return counts.join() === 'Count: 1,Count: 10'
        },
      },
    ],
  },
  {
    id: 'todo-list',
    title: 'Lists, keys and conditional rendering',
    instructions: [
      'Render `todos` as `<li>` elements inside a `<ul>`, using `todo.id` as the `key`. Give finished todos the class `done`.',
      'Clicking a todo toggles its `done` value. Create a new array with `map` instead of changing the old one.',
      'Below the list, show `N items left`, counting the todos that are not done.',
      'Finish `addTodo`: add `{ id: Date.now(), text, done: false }` to the list (ignore blank text) and clear the input.',
    ],
    hints: [
      '`todos.map((todo) => <li key={todo.id}>{todo.text}</li>)` turns data into elements.',
      'Toggle with `setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))`.',
      'Conditional class: `className={todo.done ? \'done\' : undefined}`.',
    ],
    react: true,
    starter: {
      jsx: `const { useState } = React

const initialTodos = [
  { id: 1, text: 'Learn JSX', done: true },
  { id: 2, text: 'Understand props and state', done: false },
  { id: 3, text: 'Build a todo app', done: false },
]

function TodoApp() {
  const [todos, setTodos] = useState(initialTodos)
  const [text, setText] = useState('')

  function addTodo(event) {
    event.preventDefault()
    // TODO: add a todo and clear the input
  }

  return (
    <div>
      <form onSubmit={addTodo}>
        <input
          aria-label="New todo"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="What needs doing?"
        />
        <button>Add</button>
      </form>
      {/* TODO: render the todos and the number of items left */}
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<TodoApp />)
`,
      css: `li {
  cursor: pointer;
}

.done {
  text-decoration: line-through;
  color: gray;
}
`,
    },
    solution: {
      jsx: `const { useState } = React

const initialTodos = [
  { id: 1, text: 'Learn JSX', done: true },
  { id: 2, text: 'Understand props and state', done: false },
  { id: 3, text: 'Build a todo app', done: false },
]

function TodoApp() {
  const [todos, setTodos] = useState(initialTodos)
  const [text, setText] = useState('')

  function addTodo(event) {
    event.preventDefault()
    if (!text.trim()) return
    setTodos([...todos, { id: Date.now(), text, done: false }])
    setText('')
  }

  function toggle(id) {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)))
  }

  const itemsLeft = todos.filter((todo) => !todo.done).length

  return (
    <div>
      <form onSubmit={addTodo}>
        <input
          aria-label="New todo"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="What needs doing?"
        />
        <button>Add</button>
      </form>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id} className={todo.done ? 'done' : undefined} onClick={() => toggle(todo.id)}>
            {todo.text}
          </li>
        ))}
      </ul>
      <p>{itemsLeft} items left</p>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<TodoApp />)
`,
      css: `li {
  cursor: pointer;
}

.done {
  text-decoration: line-through;
  color: gray;
}
`,
    },
    checks: [
      {
        label: 'The three todos are rendered as `<li>` elements in a `<ul>`',
        test: ({ document }) => {
          const items = [...document.querySelectorAll('ul li')].map((item) => item.textContent?.trim())
          return items.join('|') === 'Learn JSX|Understand props and state|Build a todo app'
        },
      },
      {
        label: 'Only finished todos have the `done` class',
        test: ({ document }) => {
          const items = [...document.querySelectorAll('ul li')]
          return items.length === 3 && items.map((item) => item.classList.contains('done')).join() === 'true,false,false'
        },
      },
      {
        label: 'Shows `2 items left`',
        test: ({ document }) => /(^|\D)2 items? left/.test(document.body.textContent ?? ''),
      },
      {
        label: 'Clicking a todo toggles it and updates the count',
        test: async ({ document, tick }) => {
          const item = () => document.querySelectorAll<HTMLLIElement>('ul li')[1]
          item()?.click()
          await tick(20)
          const toggledOn = item()?.classList.contains('done') && /(^|\D)1 items? left/.test(document.body.textContent ?? '')
          item()?.click()
          await tick(20)
          return toggledOn === true && !item()?.classList.contains('done')
        },
      },
      {
        label: 'Submitting the form adds a todo and clears the input',
        test: async ({ document, window, tick }) => {
          const input = document.querySelector('form input') as HTMLInputElement | null
          const form = document.querySelector('form')
          if (!input || !form) return false
          // Set the value the way a user would, so React's onChange fires.
          Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set?.call(input, 'Write tests')
          input.dispatchEvent(new window.Event('input', { bubbles: true }))
          await tick(20)
          form.requestSubmit()
          await tick(20)
          const items = [...document.querySelectorAll('ul li')].map((item) => item.textContent?.trim())
          return items.length === 4 && items[3] === 'Write tests' && input.value === ''
        },
      },
    ],
  },
]

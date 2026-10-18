import type { Exercise } from '../../playground/types'

export const htmlExercises: Exercise[] = [
  {
    id: 'semantic-layout',
    title: 'Build a semantic page layout',
    instructions: [
      'Replace `div.header` with a `<header>` element and wrap the links in a `<nav>`.',
      'Turn `div.content` into `<main>` and the blog post into an `<article>`.',
      'Make the post title an `<h1>` heading.',
      'Use a `<footer>` element for the footer.',
    ],
    hints: [
      'Semantic elements work exactly like `<div>`s, they just describe their content: `<header>…</header>`.',
      'You can delete the `class` attributes once each element has a meaningful tag name.',
    ],
    starter: {
      html: `<div class="header">
  <div class="logo">My Blog</div>
  <div class="links">
    <a href="#">Home</a>
    <a href="#">About</a>
  </div>
</div>

<div class="content">
  <div class="post">
    <div class="title">Hello, semantic HTML!</div>
    <p>Semantic elements describe the meaning of their content.</p>
  </div>
</div>

<div class="footer">© 2026 My Blog</div>
`,
    },
    solution: {
      html: `<header>
  <div class="logo">My Blog</div>
  <nav>
    <a href="#">Home</a>
    <a href="#">About</a>
  </nav>
</header>

<main>
  <article>
    <h1>Hello, semantic HTML!</h1>
    <p>Semantic elements describe the meaning of their content.</p>
  </article>
</main>

<footer>© 2026 My Blog</footer>
`,
    },
    checks: [
      {
        label: 'A `<header>` contains a `<nav>` with both links',
        test: ({ document }) => document.querySelectorAll('header nav a').length === 2,
      },
      {
        label: '`<main>` contains an `<article>`',
        test: ({ document }) => document.querySelector('main article') !== null,
      },
      {
        label: 'The post title is the only `<h1>` and sits inside the article',
        test: ({ document }) => {
          const headings = document.querySelectorAll('h1')
          return (
            headings.length === 1 &&
            headings[0].closest('article') !== null &&
            headings[0].textContent?.includes('Hello, semantic HTML!') === true
          )
        },
      },
      {
        label: 'A `<footer>` sits outside `<main>`',
        test: ({ document }) => {
          const footer = document.querySelector('footer')
          return footer !== null && footer.closest('main') === null
        },
      },
    ],
  },
  {
    id: 'signup-form',
    title: 'Create a sign-up form with built-in validation',
    instructions: [
      'Add an email field: an `<input>` with `type="email"`, `id="email"`, `name="email"` and the `required` attribute.',
      'Add a password field with `id="password"` and `name="password"` that needs at least 8 characters (`minlength`).',
      'Connect a `<label>` to every input using the `for` attribute.',
      'Add a submit `<button>`. Try submitting the form in the preview — the browser validates it for you!',
    ],
    hints: [
      '`<label for="email">Email</label>` is linked to the input whose `id` is `email`.',
      'Password inputs use `type="password"`; `minlength="8"` enforces the length.',
    ],
    starter: {
      html: `<h1>Create an account</h1>

<form>
  <!-- Add your fields here -->

</form>
`,
    },
    solution: {
      html: `<h1>Create an account</h1>

<form>
  <p>
    <label for="email">Email</label>
    <input type="email" id="email" name="email" required>
  </p>
  <p>
    <label for="password">Password</label>
    <input type="password" id="password" name="password" minlength="8" required>
  </p>
  <button type="submit">Sign up</button>
</form>
`,
    },
    checks: [
      {
        label: 'There is a required email input with `id="email"`',
        test: ({ document }) => {
          const email = document.querySelector<HTMLInputElement>('form input#email')
          return email !== null && email.type === 'email' && email.required && email.name === 'email'
        },
      },
      {
        label: 'The password input requires at least 8 characters',
        test: ({ document }) => {
          const password = document.querySelector<HTMLInputElement>('form input#password')
          return (
            password !== null &&
            password.type === 'password' &&
            password.name === 'password' &&
            password.minLength >= 8
          )
        },
      },
      {
        label: 'Every input has a connected `<label>`',
        test: ({ document }) => {
          const inputs = [...document.querySelectorAll('input')]
          return inputs.length > 0 && inputs.every((input) => (input.labels?.length ?? 0) > 0)
        },
      },
      {
        label: 'The form has a submit button',
        test: ({ document }) =>
          document.querySelector('form button:not([type]), form button[type="submit"], form input[type="submit"]') !==
          null,
      },
    ],
  },
]

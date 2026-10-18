import type { Exercise } from '../../playground/types'

const envelope =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect x='4' y='14' width='56' height='36' rx='4' fill='%234f46e5'/%3E%3Cpath d='M4 18l28 18 28-18' stroke='white' stroke-width='4' fill='none'/%3E%3C/svg%3E"

const newsletterCss = `.card {
  max-width: 320px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-family: system-ui, sans-serif;
  background: white;
}

.title {
  font-size: 20px;
  font-weight: bold;
}

.hint {
  color: #bbbbbb;
  font-size: 14px;
}

.btn {
  display: inline-block;
  margin-top: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: #4f46e5;
  color: white;
  font: inherit;
  cursor: pointer;
}
`

const subscribeJs = `function subscribe() {
  console.log('Thanks for subscribing!')
}
`

const faqCss = `.question {
  display: block;
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #f9fafb;
  font: inherit;
  font-weight: bold;
  text-align: left;
  cursor: pointer;
}

.answer {
  padding: 12px;
}
`

export const accessibilityExercises: Exercise[] = [
  {
    id: 'fix-newsletter',
    title: 'Fix an inaccessible sign-up card',
    instructions: [
      'Give the image a meaningful `alt` text.',
      'Make the title a real heading (`<h2>`). You can keep the `title` class.',
      'Connect a visible `<label>` to the email input.',
      'Replace the clickable `<div class="btn">` with a `<button>` so keyboard and screen reader users can use it.',
      'Darken the `.hint` text color so its contrast ratio against white is at least 4.5:1.',
    ],
    hints: [
      'A `<div>` with `onclick` cannot be focused with Tab or activated with Enter — a `<button>` can.',
      'Placeholders are not labels: they disappear while typing and are often low contrast.',
      'Gray text such as `#595959` or darker passes 4.5:1 on white.',
    ],
    starter: {
      html: `<div class="card">
  <img src="${envelope}">
  <div class="title">Join our newsletter</div>
  <p class="hint">One email a month. No spam.</p>
  <input type="email" placeholder="Email">
  <div class="btn" onclick="subscribe()">Subscribe</div>
</div>
`,
      css: newsletterCss,
      js: subscribeJs,
    },
    solution: {
      html: `<div class="card">
  <img src="${envelope}" alt="Envelope">
  <h2 class="title">Join our newsletter</h2>
  <p class="hint">One email a month. No spam.</p>
  <label for="email">Email</label>
  <input type="email" id="email" placeholder="you@example.com">
  <button class="btn" onclick="subscribe()">Subscribe</button>
</div>
`,
      css: newsletterCss.replace('#bbbbbb', '#4b5563'),
      js: subscribeJs,
    },
    checks: [
      {
        label: 'The image has non-empty `alt` text',
        test: ({ document }) => {
          const image = document.querySelector('img')
          return (image?.getAttribute('alt')?.trim() ?? '') !== ''
        },
      },
      {
        label: 'The title is an `<h2>` heading',
        test: ({ document }) => /newsletter/i.test(document.querySelector('h2')?.textContent ?? ''),
      },
      {
        label: 'The email input has a connected `<label>`',
        test: ({ document }) => {
          const input = document.querySelector<HTMLInputElement>('input[type="email"]')
          const label = input?.labels?.[0]
          return label !== undefined && (label.textContent?.trim() ?? '') !== ''
        },
      },
      {
        label: 'Subscribe is a real `<button>` and there are no clickable `<div>`s',
        test: ({ document }) => {
          const button = [...document.querySelectorAll('button')].find((b) => /subscribe/i.test(b.textContent ?? ''))
          return button !== undefined && document.querySelector('div[onclick], span[onclick]') === null
        },
      },
      {
        label: 'The `.hint` text has a contrast ratio of at least 4.5:1',
        test: ({ document, window }) => {
          const hint = document.querySelector('.hint')
          if (!hint) return false
          const channels = window.getComputedStyle(hint).color.match(/[\d.]+/g)?.slice(0, 3).map(Number)
          if (!channels || channels.length < 3) return false
          const luminance =
            channels
              .map((value) => {
                const c = value / 255
                return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
              })
              .reduce((sum, c, index) => sum + c * [0.2126, 0.7152, 0.0722][index], 0)
          const ratio = 1.05 / (luminance + 0.05)
          if (ratio < 4.5) throw new Error(`The contrast ratio is ${ratio.toFixed(2)}:1`)
          return true
        },
      },
    ],
  },
  {
    id: 'disclosure',
    title: 'Build an accessible show/hide (disclosure) widget',
    instructions: [
      'Change the question into a `<button>` so it can be reached with Tab and activated with Enter or Space.',
      'Add `aria-controls="answer-1"` to the button so assistive technology knows which element it controls.',
      'Keep `aria-expanded` in sync: `"false"` while the answer is hidden and `"true"` while it is shown.',
      'Hide the answer with the `hidden` attribute instead of inline styles.',
    ],
    hints: [
      '`button.setAttribute(\'aria-expanded\', String(isOpen))` updates the state.',
      '`answer.hidden = !isOpen` toggles visibility for everyone, including screen readers.',
    ],
    starter: {
      html: `<h1>FAQ</h1>
<div class="question">What is ARIA?</div>
<div class="answer" id="answer-1">
  ARIA attributes describe roles, states and properties to assistive technology.
</div>
`,
      css: faqCss,
      js: `const question = document.querySelector('.question')
const answer = document.querySelector('.answer')

answer.style.display = 'none'

question.addEventListener('click', () => {
  answer.style.display = answer.style.display === 'none' ? 'block' : 'none'
})
`,
    },
    solution: {
      html: `<h1>FAQ</h1>
<button class="question" aria-expanded="false" aria-controls="answer-1">What is ARIA?</button>
<div class="answer" id="answer-1" hidden>
  ARIA attributes describe roles, states and properties to assistive technology.
</div>
`,
      css: faqCss,
      js: `const question = document.querySelector('.question')
const answer = document.querySelector('.answer')

question.addEventListener('click', () => {
  const isOpen = question.getAttribute('aria-expanded') === 'true'
  question.setAttribute('aria-expanded', String(!isOpen))
  answer.hidden = isOpen
})
`,
    },
    checks: [
      {
        label: 'The question is a `<button>` with `aria-controls="answer-1"`',
        test: ({ document }) => {
          const button = document.querySelector('button[aria-controls]')
          return (
            button !== null &&
            /What is ARIA\?/.test(button.textContent ?? '') &&
            button.getAttribute('aria-controls') === 'answer-1' &&
            document.getElementById('answer-1') !== null
          )
        },
      },
      {
        label: 'Initially `aria-expanded="false"` and the answer has the `hidden` attribute',
        test: ({ document }) => {
          const button = document.querySelector('button[aria-controls]')
          const answer = document.getElementById('answer-1')
          return button?.getAttribute('aria-expanded') === 'false' && answer?.hidden === true
        },
      },
      {
        label: 'Clicking shows the answer and sets `aria-expanded="true"`',
        test: ({ document }) => {
          const button = document.querySelector<HTMLButtonElement>('button[aria-controls]')
          const answer = document.getElementById('answer-1')
          button?.click()
          return (
            button?.getAttribute('aria-expanded') === 'true' &&
            answer?.hidden === false &&
            answer.style.display !== 'none'
          )
        },
      },
      {
        label: 'Clicking again hides it and sets `aria-expanded="false"`',
        test: ({ document }) => {
          const button = document.querySelector<HTMLButtonElement>('button[aria-controls]')
          const answer = document.getElementById('answer-1')
          button?.click()
          return button?.getAttribute('aria-expanded') === 'false' && answer?.hidden === true
        },
      },
    ],
  },
]

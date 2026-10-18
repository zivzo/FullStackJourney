import type { Exercise } from '../../playground/types'

export const cssExercises: Exercise[] = [
  {
    id: 'flexbox-center',
    title: 'Center a card with Flexbox',
    instructions: [
      'Turn `.stage` into a flex container.',
      'Center `.card` horizontally with `justify-content`.',
      'Center `.card` vertically with `align-items`.',
    ],
    hints: ['Both `justify-content` and `align-items` accept the value `center`.'],
    starter: {
      html: `<div class="stage">
  <div class="card">Center me!</div>
</div>
`,
      css: `.stage {
  height: 300px;
  background: #eef2ff;
  /* Center .card horizontally and vertically using Flexbox */
}

.card {
  padding: 16px 24px;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
`,
    },
    solution: {
      html: `<div class="stage">
  <div class="card">Center me!</div>
</div>
`,
      css: `.stage {
  height: 300px;
  background: #eef2ff;
  display: flex;
  justify-content: center;
  align-items: center;
}

.card {
  padding: 16px 24px;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
`,
    },
    checks: [
      {
        label: '`.stage` uses `display: flex`',
        test: ({ document, window }) => {
          const stage = document.querySelector('.stage')
          return stage !== null && window.getComputedStyle(stage).display === 'flex'
        },
      },
      {
        label: 'The card is centered horizontally',
        test: ({ document }) => {
          const stage = document.querySelector('.stage')?.getBoundingClientRect()
          const card = document.querySelector('.card')?.getBoundingClientRect()
          if (!stage || !card) return false
          return card.width < stage.width && Math.abs(card.left - stage.left - (stage.right - card.right)) < 2
        },
      },
      {
        label: 'The card is centered vertically',
        test: ({ document }) => {
          const stage = document.querySelector('.stage')?.getBoundingClientRect()
          const card = document.querySelector('.card')?.getBoundingClientRect()
          if (!stage || !card) return false
          return card.height < stage.height && Math.abs(card.top - stage.top - (stage.bottom - card.bottom)) < 2
        },
      },
    ],
  },
  {
    id: 'responsive-grid',
    title: 'Responsive grid with custom properties',
    instructions: [
      'Make `.grid` a CSS Grid with 3 equal columns and a `16px` gap.',
      'Add a media query so screens narrower than `600px` show a single column.',
      'Define a custom property `--accent` on `:root` and use it with `var(--accent)` as the `background` of `.item`.',
    ],
    hints: [
      '`grid-template-columns: repeat(3, 1fr)` creates three equal columns.',
      '`@media (max-width: 600px) { … }` applies styles only on narrow screens.',
      'Resize your browser window to see the media query kick in.',
    ],
    starter: {
      html: `<section class="grid">
  <div class="item">1</div>
  <div class="item">2</div>
  <div class="item">3</div>
  <div class="item">4</div>
  <div class="item">5</div>
  <div class="item">6</div>
</section>
`,
      css: `.grid {
  /* Lay out the items in a grid */
}

.item {
  padding: 24px;
  border-radius: 8px;
  color: white;
  font-weight: bold;
  text-align: center;
  background: gray;
}
`,
    },
    solution: {
      html: `<section class="grid">
  <div class="item">1</div>
  <div class="item">2</div>
  <div class="item">3</div>
  <div class="item">4</div>
  <div class="item">5</div>
  <div class="item">6</div>
</section>
`,
      css: `:root {
  --accent: #4f46e5;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

@media (max-width: 600px) {
  .grid {
    grid-template-columns: 1fr;
  }
}

.item {
  padding: 24px;
  border-radius: 8px;
  color: white;
  font-weight: bold;
  text-align: center;
  background: var(--accent);
}
`,
    },
    checks: [
      {
        label: '`.grid` uses `display: grid`',
        test: ({ document, window }) => {
          const grid = document.querySelector('.grid')
          return grid !== null && window.getComputedStyle(grid).display === 'grid'
        },
      },
      {
        label: 'The grid has 3 equal columns on wide screens',
        test: ({ document, window }) => {
          const grid = document.querySelector('.grid')
          if (!grid || window.innerWidth <= 600) return false
          const columns = window.getComputedStyle(grid).gridTemplateColumns.split(' ')
          return columns.length === 3 && new Set(columns).size === 1
        },
      },
      {
        label: 'The gap between items is `16px`',
        test: ({ document, window }) => {
          const grid = document.querySelector('.grid')
          if (!grid) return false
          const style = window.getComputedStyle(grid)
          return style.columnGap === '16px' && style.rowGap === '16px'
        },
      },
      {
        label: 'A media query for screens below `600px` switches to a single column',
        test: ({ document }) => {
          const mediaRules: CSSMediaRule[] = []
          for (const sheet of document.styleSheets) {
            for (const rule of sheet.cssRules) {
              if (rule instanceof CSSMediaRule && /\b(600|599)px\b/.test(rule.conditionText)) mediaRules.push(rule)
            }
          }
          return mediaRules.some((media) =>
            [...media.cssRules].some((rule) => {
              if (!(rule instanceof CSSStyleRule) || !rule.selectorText.includes('.grid')) return false
              const columns = rule.style.gridTemplateColumns.trim()
              return columns !== '' && (/^repeat\(\s*1\s*,/.test(columns) || !/\s/.test(columns))
            }),
          )
        },
      },
      {
        label: '`--accent` is defined on `:root` and used as the background of `.item`',
        test: ({ document, window, source }) => {
          const accent = window.getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()
          const item = document.querySelector('.item')
          if (!accent || !item || !source.css?.includes('var(--accent)')) return false
          const probe = document.createElement('div')
          probe.style.background = 'var(--accent)'
          document.body.append(probe)
          const expected = window.getComputedStyle(probe).backgroundColor
          probe.remove()
          return window.getComputedStyle(item).backgroundColor === expected
        },
      },
    ],
  },
]

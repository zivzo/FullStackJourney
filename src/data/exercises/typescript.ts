import type { Exercise } from '../../playground/types'

export const typescriptExercises: Exercise[] = [
  {
    id: 'annotate-functions',
    title: 'Add types to objects and functions',
    instructions: [
      'The file is type-checked in `strict` mode and currently has errors — see the Problems list.',
      'Describe a product in the `Product` interface: `name` (string), `price` (number) and `tags` (array of strings).',
      'Annotate the parameters of `formatPrice` (`amount: number`, `currency: string`) and `describe` (`product: Product`).',
      'Add return types (`: string`) to both functions.',
    ],
    hints: [
      'An array of strings is written `string[]`.',
      'A parameter with a default value can still be annotated: `currency: string = \'USD\'`.',
    ],
    starter: {
      ts: `interface Product {
  // name, price and tags
}

function formatPrice(amount, currency = 'USD') {
  return \`\${amount.toFixed(2)} \${currency}\`
}

function describe(product) {
  return \`\${product.name} – \${formatPrice(product.price)} [\${product.tags.join(', ')}]\`
}

const keyboard: Product = { name: 'Keyboard', price: 49.9, tags: ['usb', 'mechanical'] }
console.log(describe(keyboard))
`,
    },
    solution: {
      ts: `interface Product {
  name: string
  price: number
  tags: string[]
}

function formatPrice(amount: number, currency: string = 'USD'): string {
  return \`\${amount.toFixed(2)} \${currency}\`
}

function describe(product: Product): string {
  return \`\${product.name} – \${formatPrice(product.price)} [\${product.tags.join(', ')}]\`
}

const keyboard: Product = { name: 'Keyboard', price: 49.9, tags: ['usb', 'mechanical'] }
console.log(describe(keyboard))
`,
    },
    checks: [
      {
        label: '`Product` has `name: string`, `price: number` and `tags: string[]`',
        test: ({ source }) => {
          const body = source.ts?.match(/interface\s+Product\s*\{([^}]*)\}/)?.[1] ?? ''
          return (
            /\bname\s*:\s*string\b/.test(body) &&
            /\bprice\s*:\s*number\b/.test(body) &&
            /\btags\s*:\s*(string\[\]|Array<string>)/.test(body)
          )
        },
      },
      {
        label: 'Both functions have typed parameters and a `string` return type',
        test: ({ source }) => {
          const code = source.ts ?? ''
          return (
            /function\s+formatPrice\s*\(\s*amount\s*:\s*number\s*,\s*currency\s*(:\s*string\s*)?=[^)]*\)\s*:\s*string/.test(code) &&
            /function\s+describe\s*\(\s*product\s*:\s*Product\s*\)\s*:\s*string/.test(code)
          )
        },
      },
      {
        label: '`describe()` still returns the formatted text',
        test: ({ global }) =>
          global('describe')({ name: 'Mouse', price: 5, tags: ['usb', 'wireless'] }) === 'Mouse – 5.00 USD [usb, wireless]',
      },
    ],
  },
  {
    id: 'discriminated-unions',
    title: 'Discriminated unions and narrowing',
    instructions: [
      'Add a `Triangle` type with `kind: \'triangle\'`, `base: number` and `height: number`.',
      'Make `Shape` a union of `Circle`, `Rectangle` and `Triangle`.',
      'Implement `area()` with `switch (shape.kind)`. Inside each `case`, TypeScript narrows `shape` to the matching type.',
    ],
    hints: [
      'Union types are written with `|`: `type Shape = A | B | C`.',
      'Circle area: `Math.PI * radius ** 2`. Triangle area: `(base * height) / 2`.',
    ],
    starter: {
      ts: `type Circle = { kind: 'circle'; radius: number }
type Rectangle = { kind: 'rectangle'; width: number; height: number }
// TODO: add a Triangle type

type Shape = Circle

function area(shape: Shape): number {
  // TODO: switch on shape.kind and return the area of each shape
  return 0
}

const shapes: Shape[] = [
  { kind: 'circle', radius: 1 },
  { kind: 'rectangle', width: 2, height: 3 },
  { kind: 'triangle', base: 4, height: 5 },
]

for (const shape of shapes) {
  console.log(shape.kind, area(shape).toFixed(2))
}
`,
    },
    solution: {
      ts: `type Circle = { kind: 'circle'; radius: number }
type Rectangle = { kind: 'rectangle'; width: number; height: number }
type Triangle = { kind: 'triangle'; base: number; height: number }

type Shape = Circle | Rectangle | Triangle

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle':
      return Math.PI * shape.radius ** 2
    case 'rectangle':
      return shape.width * shape.height
    case 'triangle':
      return (shape.base * shape.height) / 2
  }
}

const shapes: Shape[] = [
  { kind: 'circle', radius: 1 },
  { kind: 'rectangle', width: 2, height: 3 },
  { kind: 'triangle', base: 4, height: 5 },
]

for (const shape of shapes) {
  console.log(shape.kind, area(shape).toFixed(2))
}
`,
    },
    checks: [
      {
        label: '`area()` uses `switch (shape.kind)`',
        test: ({ source }) => /switch\s*\(\s*shape\.kind\s*\)/.test(source.ts ?? ''),
      },
      {
        label: 'Circle: `area({ kind: \'circle\', radius: 2 })` is 4π',
        test: ({ global }) => Math.abs(global('area')({ kind: 'circle', radius: 2 }) - 4 * Math.PI) < 1e-9,
      },
      {
        label: 'Rectangle: width × height',
        test: ({ global }) => global('area')({ kind: 'rectangle', width: 2, height: 3 }) === 6,
      },
      {
        label: 'Triangle: base × height ÷ 2',
        test: ({ global }) => global('area')({ kind: 'triangle', base: 4, height: 5 }) === 10,
      },
    ],
  },
  {
    id: 'generics',
    title: 'Reusable functions with generics',
    instructions: [
      'Replace every `any` with a type parameter, e.g. `function first<T>(items: T[]): T | undefined`.',
      'Implement `groupBy` so it puts every item into the array for its key.',
      'The type tests at the bottom must compile: the `@ts-expect-error` line only compiles when `first([1, 2, 3])` is known to return a number.',
    ],
    hints: [
      'Use the same type parameter for the items and the result: `groupBy<T>(items: T[], getKey: (item: T) => string): Record<string, T[]>`.',
      'Create a group the first time you see a key: `(groups[key] ??= []).push(item)`.',
    ],
    starter: {
      ts: `function first(items: any[]): any {
  return items[0]
}

function groupBy(items: any[], getKey: (item: any) => string): Record<string, any[]> {
  const groups: Record<string, any[]> = {}
  // TODO: add each item to groups[getKey(item)]
  return groups
}

console.log(first(['a', 'b']))
console.log(groupBy(['apple', 'avocado', 'banana'], (word) => word[0]))

// Type tests — these must compile once your functions are generic:
const firstNumber: number | undefined = first([1, 2, 3])
// @ts-expect-error first() of a number[] is a number, not a string
const notAString: string | undefined = first([1, 2, 3])
`,
    },
    solution: {
      ts: `function first<T>(items: T[]): T | undefined {
  return items[0]
}

function groupBy<T>(items: T[], getKey: (item: T) => string): Record<string, T[]> {
  const groups: Record<string, T[]> = {}
  for (const item of items) {
    const key = getKey(item)
    ;(groups[key] ??= []).push(item)
  }
  return groups
}

console.log(first(['a', 'b']))
console.log(groupBy(['apple', 'avocado', 'banana'], (word) => word[0]))

// Type tests — these must compile once your functions are generic:
const firstNumber: number | undefined = first([1, 2, 3])
// @ts-expect-error first() of a number[] is a number, not a string
const notAString: string | undefined = first([1, 2, 3])
`,
    },
    checks: [
      {
        label: 'No `any` is left in the code',
        test: ({ source }) => !/\bany\b/.test((source.ts ?? '').replace(/\/\/.*$/gm, '')),
      },
      {
        label: '`first()` returns the first element, or `undefined` for an empty array',
        test: ({ global }) => {
          const first = global('first')
          return first([7, 8]) === 7 && first([]) === undefined
        },
      },
      {
        label: '`groupBy()` groups items by key',
        test: ({ global }) =>
          JSON.stringify(global('groupBy')(['apple', 'avocado', 'banana'], (word: string) => word[0])) ===
          '{"a":["apple","avocado"],"b":["banana"]}',
      },
    ],
  },
]

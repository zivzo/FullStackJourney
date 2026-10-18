import type { Exercise } from '../playground/types'
import { accessibilityExercises } from './exercises/accessibility'
import { cssExercises } from './exercises/css'
import { htmlExercises } from './exercises/html'
import { javascriptExercises } from './exercises/javascript'
import { performanceExercises } from './exercises/performance'
import { reactExercises } from './exercises/react'
import { stateManagementExercises } from './exercises/state-management'
import { testingExercises } from './exercises/testing'
import { toolingExercises } from './exercises/tooling'
import { typescriptExercises } from './exercises/typescript'

export type Level = 'beginner' | 'intermediate' | 'advanced'

export interface Resource {
  label: string
  url: string
}

export interface Topic {
  id: string
  title: string
  summary: string
  level: Level
  concepts: string[]
  resources: Resource[]
  /** Hands-on coding exercises with a live preview. */
  exercises?: Exercise[]
}

export interface Track {
  id: string
  title: string
  icon: string
  description: string
  status: 'active' | 'planned'
  topics: Topic[]
}

export const tracks: Track[] = [
  {
    id: 'frontend',
    title: 'Frontend',
    icon: '🎨',
    description:
      'Everything that runs in the browser: structure, style, interactivity and the tooling that ships it.',
    status: 'active',
    topics: [
      {
        id: 'html',
        title: 'HTML',
        level: 'beginner',
        summary: 'The structure and meaning of every web page.',
        concepts: [
          'Document structure (head, body, meta tags)',
          'Semantic elements (header, nav, main, article, footer)',
          'Forms, inputs and validation',
          'Links, images and media',
          'SEO basics',
        ],
        resources: [
          { label: 'MDN – HTML', url: 'https://developer.mozilla.org/en-US/docs/Web/HTML' },
          { label: 'web.dev – Learn HTML', url: 'https://web.dev/learn/html' },
        ],
        exercises: htmlExercises,
      },
      {
        id: 'css',
        title: 'CSS',
        level: 'beginner',
        summary: 'Layout, styling and responsive design.',
        concepts: [
          'Selectors, specificity and the cascade',
          'Box model',
          'Flexbox and Grid',
          'Responsive design and media queries',
          'Custom properties (CSS variables)',
          'Transitions and animations',
        ],
        resources: [
          { label: 'MDN – CSS', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS' },
          { label: 'web.dev – Learn CSS', url: 'https://web.dev/learn/css' },
        ],
        exercises: cssExercises,
      },
      {
        id: 'javascript',
        title: 'JavaScript',
        level: 'beginner',
        summary: 'The language of the web.',
        concepts: [
          'Variables, types and functions',
          'Arrays and objects',
          'Scope, closures and "this"',
          'DOM manipulation and events',
          'Promises, async/await and fetch',
          'ES modules',
        ],
        resources: [
          { label: 'MDN – JavaScript', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
          { label: 'javascript.info', url: 'https://javascript.info/' },
        ],
        exercises: javascriptExercises,
      },
      {
        id: 'typescript',
        title: 'TypeScript',
        level: 'intermediate',
        summary: 'JavaScript with static types for safer, scalable code.',
        concepts: [
          'Basic and literal types',
          'Interfaces and type aliases',
          'Unions, narrowing and type guards',
          'Generics',
          'Utility types',
        ],
        resources: [
          { label: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/handbook/intro.html' },
        ],
        exercises: typescriptExercises,
      },
      {
        id: 'react',
        title: 'React',
        level: 'intermediate',
        summary: 'Building user interfaces from components.',
        concepts: [
          'JSX and components',
          'Props and state',
          'Hooks (useState, useEffect, useMemo, useRef)',
          'Lists, keys and conditional rendering',
          'Context and custom hooks',
          'Routing',
        ],
        resources: [
          { label: 'react.dev – Learn', url: 'https://react.dev/learn' },
        ],
        exercises: reactExercises,
      },
      {
        id: 'state-management',
        title: 'State Management',
        level: 'intermediate',
        summary: 'Keeping data consistent across a growing app.',
        concepts: [
          'Local vs. shared state',
          'Lifting state up and Context',
          'Reducers',
          'Server state and caching (e.g. TanStack Query)',
          'Global stores (e.g. Zustand, Redux Toolkit)',
        ],
        resources: [
          { label: 'react.dev – Managing State', url: 'https://react.dev/learn/managing-state' },
          { label: 'TanStack Query', url: 'https://tanstack.com/query/latest' },
        ],
        exercises: stateManagementExercises,
      },
      {
        id: 'tooling',
        title: 'Build Tooling',
        level: 'intermediate',
        summary: 'Package managers, bundlers, linters and formatters.',
        concepts: [
          'npm and package.json scripts',
          'Vite dev server and production builds',
          'Linting and formatting',
          'Environment variables',
          'Deploying static sites',
        ],
        resources: [
          { label: 'Vite Guide', url: 'https://vite.dev/guide/' },
          { label: 'npm Docs', url: 'https://docs.npmjs.com/' },
        ],
        exercises: toolingExercises,
      },
      {
        id: 'testing',
        title: 'Testing',
        level: 'advanced',
        summary: 'Confidence that your UI works and keeps working.',
        concepts: [
          'Unit tests',
          'Component tests (Testing Library)',
          'End-to-end tests (Playwright)',
          'Mocking network requests',
        ],
        resources: [
          { label: 'Vitest', url: 'https://vitest.dev/' },
          { label: 'Testing Library', url: 'https://testing-library.com/' },
          { label: 'Playwright', url: 'https://playwright.dev/' },
        ],
        exercises: testingExercises,
      },
      {
        id: 'accessibility',
        title: 'Accessibility',
        level: 'advanced',
        summary: 'Interfaces everyone can use.',
        concepts: [
          'Semantic HTML first',
          'Keyboard navigation and focus management',
          'ARIA roles and attributes',
          'Color contrast',
          'Screen reader testing',
        ],
        resources: [
          { label: 'web.dev – Learn Accessibility', url: 'https://web.dev/learn/accessibility' },
          { label: 'WAI-ARIA Practices', url: 'https://www.w3.org/WAI/ARIA/apg/' },
        ],
        exercises: accessibilityExercises,
      },
      {
        id: 'performance',
        title: 'Performance',
        level: 'advanced',
        summary: 'Fast loading and smooth interactions.',
        concepts: [
          'Core Web Vitals',
          'Code splitting and lazy loading',
          'Image optimization',
          'Caching',
          'Profiling with browser DevTools',
        ],
        resources: [
          { label: 'web.dev – Performance', url: 'https://web.dev/learn/performance' },
        ],
        exercises: performanceExercises,
      },
    ],
  },
  {
    id: 'backend',
    title: 'Backend',
    icon: '⚙️',
    description: 'Servers, APIs, authentication and business logic.',
    status: 'planned',
    topics: [],
  },
  {
    id: 'databases',
    title: 'Databases',
    icon: '🗄️',
    description: 'Storing, modeling and querying data with SQL and NoSQL.',
    status: 'planned',
    topics: [],
  },
  {
    id: 'devops',
    title: 'DevOps',
    icon: '🚀',
    description: 'Version control, CI/CD, containers and deployment.',
    status: 'planned',
    topics: [],
  },
]

export function findTrack(id: string | undefined): Track | undefined {
  return tracks.find((track) => track.id === id)
}

export function findTopic(track: Track, id: string | undefined): Topic | undefined {
  return track.topics.find((topic) => topic.id === id)
}

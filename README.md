# FullStackJourney

A navigable roadmap of the skills a full-stack developer needs, built with React, TypeScript and Vite.

Skill areas:

- 🎨 **Frontend** – HTML, CSS, JavaScript, TypeScript, React, state management, tooling, testing, accessibility and performance
- ⚙️ **Backend** – HTTP, Node.js, REST APIs, Express & middleware, validation, auth, caching, security, real-time and background jobs
- 🗄️ **Databases** – coming soon
- 🚀 **DevOps** – coming soon

Each area lists its topics in a suggested learning order; each topic has key concepts and learning resources. Backend topics also include code examples and live exercises: write JavaScript in the browser and run tests against it instantly (code runs in a sandboxed Web Worker and is saved in `localStorage`).

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run lint     # lint with oxlint
npm run build    # type-check and build to dist/
npm run deploy   # build and publish dist/ to GitHub Pages
```

## Project structure

```
src/
  data/skills.ts         # skill areas, topics, concepts and resources
  data/backend.ts        # backend topics, examples and exercises
  lib/                   # exercise test harness and Web Worker runner
  hooks/useHashRoute.ts  # tiny hash router (GitHub Pages friendly)
  components/            # Navbar, Breadcrumbs, code examples, exercise editor
  pages/                 # Home, Track, Topic and Not Found pages
  App.tsx                # route -> page mapping
  index.css              # global styles
```

## Adding content

Edit `src/data/skills.ts`: add topics to an existing track, or fill in the `topics` of a planned track and set its `status` to `'active'`.

A topic can optionally have:

- `examples` – code snippets with a title, language label and description.
- `exercises` – a prompt, `starterCode`, `hints`, a `solution` and `tests`. Each test is a JavaScript snippet that runs after the learner's code and can use `assert`, `assertEqual`, `assertDeepEqual`, `assertThrows` and `assertRejects` (`await` is allowed). Make sure the solution passes every test and the starter code fails them.

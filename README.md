# FullStackJourney

A navigable roadmap of the skills a full-stack developer needs, built with React, TypeScript and Vite.

Skill areas:

- 🎨 **Frontend** – HTML, CSS, JavaScript, TypeScript, React, state management, tooling, testing, accessibility and performance
- ⚙️ **Backend** – HTTP, Node.js, REST APIs, Express & middleware, validation, auth, caching, security, real-time and background jobs
- 🗄️ **Databases** – coming soon
- 🚀 **DevOps** – coming soon

Each area lists its topics in a suggested learning order; each topic has key concepts, learning resources and hands-on exercises.

Backend topics also include code examples and live exercises: write JavaScript in the browser and run tests against it instantly. Code runs in a sandboxed Web Worker and is saved in `localStorage`.

## Exercises

Every Frontend topic has coding exercises with a live playground: edit the starter code in the browser, watch the
preview and console update as you type, then press **Check my code** to run automated checks. Drafts and completed
exercises are saved in `localStorage`.

- Code runs in a sandboxed `<iframe>` (`allow-scripts allow-forms`, opaque origin), so it cannot access the site.
- TypeScript exercises are type-checked in `strict` mode and JSX is compiled with the TypeScript compiler, which is
  loaded lazily only on pages that need it. React exercises get `React`/`ReactDOM` as globals without a CDN.

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
  data/exercises/        # exercises for each frontend topic
  playground/            # exercise types, preview document builder, compiler, React runtime, storage
  components/            # Navbar, Breadcrumbs, examples, exercises, frontend playground
  pages/                 # Home, Track, Topic and Not Found pages
  App.tsx                # route -> page mapping
  index.css              # global styles
```

## Adding content

Edit `src/data/skills.ts`: add topics to an existing track, or fill in the `topics` of a planned track and set its `status` to `'active'`.

A topic can optionally have:

- `examples` – code snippets with a title, language label and description.
- `exercises` – a prompt, `starterCode`, `hints`, a `solution` and `tests`. Each test is a JavaScript snippet that runs after the learner's code and can use `assert`, `assertEqual`, `assertDeepEqual`, `assertThrows` and `assertRejects` (`await` is allowed). Make sure the solution passes every test and the starter code fails them.

Frontend exercises use the `Exercise` type in `src/playground/types.ts` and live in `src/data/exercises/`:

- `starter` and `solution` hold the code; their keys (`html`, `css`, `js`, `ts`, `jsx`, `json`) decide which file tabs appear.
- Each check's `test` runs inside the preview after the learner's code. It is serialised with `toString()`, so it must be
  self-contained and only use its `ctx` argument (`document`, `window`, `source`, `global(name)`, `tick(ms)`).
- Optional: `setup` (hidden script run first), `react: true` (load React), `hints`.
- Make sure the starter code fails at least one check and the solution passes them all.

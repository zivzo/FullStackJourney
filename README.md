# FullStackJourney

A navigable roadmap of the skills a full-stack developer needs, built with React, TypeScript and Vite.

Skill areas:

- 🎨 **Frontend** – HTML, CSS, JavaScript, TypeScript, React, state management, tooling, testing, accessibility and performance
- ⚙️ **Backend** – coming soon
- 🗄️ **Databases** – coming soon
- 🚀 **DevOps** – coming soon

Each area lists its topics in a suggested learning order; each topic has key concepts and learning resources.

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
  hooks/useHashRoute.ts  # tiny hash router (GitHub Pages friendly)
  components/            # Navbar, Breadcrumbs
  pages/                 # Home, Track, Topic and Not Found pages
  App.tsx                # route -> page mapping
  index.css              # global styles
```

## Adding content

Edit `src/data/skills.ts`: add topics to an existing track, or fill in the `topics` of a planned track and set its `status` to `'active'`.

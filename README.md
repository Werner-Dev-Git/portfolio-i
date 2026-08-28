# Werner — Designer & Developer portfolio

Two builds of the same portfolio, sharing one set of images.

| | Path | Stack | Deployed |
|---|---|---|---|
| **Static** | [`index.html`](index.html) | One self-contained file — vanilla JS, CDN GSAP/Motion/Three | GitHub Pages (this repo) |
| **App** | [`app/`](app/) | React 19 + TypeScript + Vite, React Three Fiber | `npm run build` → `app/dist` |

Both read the same assets from [`assets/`](assets/): `figma/` (48 design exports)
and `screens/` (full-page captures of every live site).

## Sections

- **Dev** — every live site as a browser-framed full-page capture that scrolls
  itself on hover (auto-pans on touch). Add a site in one place:
  `app/src/data/projects.ts`, or the `projects` array in `index.html`.
- **Design** — auto-scrolling wall of all 48 Figma shots, click for the lightbox.
- **About** — service cards with a live smoke effect and a Three.js lit slab that
  casts a real shadow for depth. The **Smoke Lab** panel tunes it live.
- **Contact** — email, copy-to-clipboard, GitHub.

Dark/light theme (green accent) with a View Transitions circle wipe, a morphing
particle swarm in the hero, GSAP scroll choreography, and full
`prefers-reduced-motion` support throughout.

## Running the React app

```bash
cd app
npm install
npm run dev      # http://localhost:5173
npm run build    # → app/dist
npm run preview  # serve the production build
```

Vite serves `../assets` as its public directory, so both builds stay in sync from
a single copy of the images. `base: './'` keeps the output portable — it works at
a domain root or under a project subpath.

## What the React version adds

Same design, better mechanics: the lightbox has swipe gestures, focus return and
neighbour preloading; cards engage on keyboard focus, not just hover; the theme
and Smoke Lab settings are React context (persisted to `localStorage`); Three.js
is code-split so it only downloads when the service cards scroll into view.

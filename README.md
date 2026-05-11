# Aryan Anand — Personal Portfolio

> *Obsessed with markets, chess, and systems where every decision has a consequence.*

Live → **[aryananand.vercel.app](https://aryananand.vercel.app)** &nbsp;|&nbsp; Built with React 19 · Vite · Framer Motion · GSAP · Tailwind CSS v4

---

## Overview

A high-performance personal portfolio built from scratch — no templates, no UI libraries. Every animation, interaction, and component was written by hand with a focus on the kind of motion quality you see on Awwwards-level sites.

The site doubles as a design statement: it should feel like a product, not a resumé.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion 11 · GSAP 3 |
| Smooth Scroll | Lenis |
| Chess Engine | Stockfish (Web Worker) · chess.js · react-chessboard |
| Deployment | Vercel |

---

## Features

### Animations & Interactions
- **Isometric grid hero background** — canvas-rendered drifting diamond lattice
- **Chessboard loading screen** — 64 squares flip in via Warnsdorff's knight's-tour order
- **Multi-layer knight sweep** — three-depth parallax transition on section navigation
- **SVG scroll progress bar** — `pathLength` animation with a glowing tip dot
- **Cursor ink splatter** — gold particles emitted on fast mouse movement
- **WebGL grain overlay** — procedural noise shader with section-entry bloom pulses
- **Proximity glow** — cards glow as the cursor approaches from any direction
- **Odometer stat counters** — digit-drum slot-machine animation on scroll into view
- **Isometric skills marquee** — three-lane parallax depth with perspective tilt

### Sections
- **Hero** — 3D tilt portrait with masked/unmasked reveal, magnetic buttons, rotating taglines
- **About** — Syntax-highlighted typewriter terminal bio, odometer counters, live Chess.com stats
- **Achievements** — Horizontal scroll with variable-font-weight number animations
- **Skills** — Three-speed parallax marquee with blob-morphing tag hover
- **Projects** — Bento grid (Chess × Recovery, CS50) + horizontal scroll strip with canvas animations per card, **project spotlight modal** (card morphs into a detailed case study via Framer Motion `layoutId`)
- **Product Teardowns** — Four live HTML teardown analyses with canvas-animated cards
- **Chess Challenge** — Full playable chess game vs Stockfish (ELO 2000) with a hidden 11-move Caro-Kann queen-sacrifice easter egg
- **Contact** — Solari departures-board word flip, radial pulse rings on email hover

### Project Spotlight Modal
Clicking any project card triggers a shared-layout animation — the card itself morphs into a full case study panel showing overview, problem, key features, challenges, results, and lessons learned. ESC, backdrop click, or close button to dismiss.

### Chess Easter Egg
Playing the exact Caro-Kann sequence (`1.e4 c6 2.d4 d5 3.Nc3 dxe4...`) triggers a scripted 11-move queen sacrifice checkmate. Any deviation drops into a live Stockfish game. The sequence rearms on new game.

---

## Project Structure

```
src/
├── components/         # All UI components
│   ├── Hero.tsx
│   ├── About.tsx
│   ├── Experience.tsx
│   ├── Skills.tsx
│   ├── Projects.tsx    # Canvas animations + spotlight modal
│   ├── ChessChallenge.tsx
│   ├── Contact.tsx
│   ├── Cursor.tsx
│   ├── LoadingScreen.tsx
│   ├── KnightTransition.tsx
│   └── ...
├── data/
│   └── portfolio.ts    # Single source of truth for all content
├── hooks/
│   ├── useCursorSpotlight.ts
│   └── useProximityGlow.ts
└── lib/
    └── lenis.ts
public/
├── stockfish.js        # Chess engine (Web Worker)
├── projects/           # Project images
└── teardowns/          # HTML teardown files
```

---

## Running Locally

```bash
git clone https://github.com/aryananand-04/personal-portfolio.git
cd personal-portfolio
npm install
npm run dev
```

Open `http://localhost:5173`

---

## Updating Content

All site content lives in one file: **`src/data/portfolio.ts`**

Edit personal info, achievements, skills, projects, and teardowns there. The site hot-reloads on save.

To add a project image: drop it in `public/projects/` and set the `image` field on the project entry.

---

## Performance

- Bundle code-split into vendor chunks (react, framer-motion/gsap, chess)
- Canvas animations use RAF with trail-fade instead of DOM elements
- Proximity glow uses a single shared `mousemove` listener for all cards
- Lenis smooth scroll synced with GSAP ticker for zero jank

---

## Deployment

Deployed on Vercel. Zero config — Vite is auto-detected.

```bash
# One-time setup
npm i -g vercel
vercel --prod
```

Every push to `main` triggers an automatic redeploy.

---

## License

MIT — feel free to use this as inspiration. If you fork it, make it your own.

---

*Aryan Anand · [aryananand.dev04@gmail.com](mailto:aryananand.dev04@gmail.com) · [linkedin.com/in/aryananand04](https://www.linkedin.com/in/aryananand04)*
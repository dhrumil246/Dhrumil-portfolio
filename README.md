# 🧱 Terminal Portfolio

A dual-mode, performance-first portfolio built as an interactive terminal. Recruiters skim in 30 seconds. Engineers dig deeper in 2–3 minutes.

**[Live Demo →]()**

---

## Overview

This portfolio runs as two parallel interfaces:

- **Terminal Mode** (default) — A Mac-style CLI that responds to typed commands or clickable chips. Every piece of information a recruiter needs is ≤2 clicks away.
- **Render Mode** (opt-in) — A Three.js-powered visual layer that shows skill constellations and project pipelines. Auto-disables on low FPS or mobile.

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Framework   | Next.js 14 (App Router)             |
| Language    | TypeScript                          |
| State       | Zustand                             |
| Styling     | Tailwind CSS + CSS Custom Properties|
| 3D Render   | React Three Fiber + drei            |
| Animation   | GSAP (micro-interactions)           |
| Deployment  | Vercel                              |

## Architecture

```
src/
├── app/                  # Next.js App Router
│   ├── layout.tsx        # Root layout, fonts, SEO metadata
│   ├── page.tsx          # Main page, dynamic render panel
│   └── globals.css       # Theme variables, base styles
│
├── components/
│   ├── terminal/
│   │   ├── Terminal.tsx   # Core terminal: I/O, cursor, keyboard
│   │   ├── Prompt.ts     # Prompt configuration
│   │   └── commands.ts   # Command registry, portfolio data, executor
│   │
│   ├── ui/
│   │   ├── CommandChips.tsx   # Clickable navigation for non-typers
│   │   ├── ThemeToggle.tsx    # Dark/light mode switch
│   │   └── RenderToggle.tsx   # 3D panel toggle with mobile guard
│   │
│   └── layout/
│       └── TerminalWindow.tsx # Mac chrome, wires components together
│
├── store/
│   └── useTerminalStore.ts    # Single Zustand store
│
├── lib/
│   ├── commandParser.ts       # Parser, autocomplete, Levenshtein typo suggest
│   └── deviceCheck.ts         # Device detection, WebGL check, motion prefs
│
└── render/
    ├── RenderCanvas.tsx        # R3F canvas, FPS monitor, scene switcher
    └── scenes/
        ├── SkillsScene.tsx     # Interactive skill constellation
        └── ProjectScene.tsx    # Project pipeline cards
```

### Design Decisions

**Dynamic Imports** — The entire Three.js render layer loads via `next/dynamic` with `ssr: false`. Bundle cost is zero until the user explicitly enables 3D mode.

**CSS Custom Properties** — Theming is handled through CSS variables on `:root` and `[data-theme="light"]`, allowing instant theme switches without re-renders.

**FPS Monitoring** — `RenderCanvas` includes a frame rate monitor. If FPS drops below 30 for 3 consecutive seconds, render mode auto-disables with a console warning.

**Mobile Strategy** — Device detection runs once on mount. On mobile: terminal is read-only, command chips are primary navigation, render toggle is disabled, and touch events are optimized.

**Command Architecture** — Commands are a simple dispatch map in `commands.ts`. Adding a new command means adding one function. The parser handles autocomplete (TAB), history navigation (↑↓), typo suggestions (Levenshtein distance), and Ctrl+C/Ctrl+L shortcuts.

## Commands

| Command         | Description                     |
|----------------|---------------------------------|
| `help`         | List all commands                |
| `about`        | Profile summary                  |
| `skills`       | Technical skills by category     |
| `projects`     | Featured project list            |
| `project <n>`  | Deep dive into a specific project|
| `experience`   | Work history                     |
| `resume`       | Download resume PDF              |
| `contact`      | Email, GitHub, LinkedIn          |
| `theme`        | Toggle dark/light mode           |
| `render`       | Toggle 3D visual panel           |
| `clear`        | Clear terminal output            |

### Hidden Commands

A few easter eggs exist for engineers who explore. They're not listed in `help` and never block content access.

## Getting Started

```bash
# Clone
git clone https://github.com/dhrumil246/my-portfolio
cd terminal-portfolio

# Install
npm install

# Dev server
npm run dev

# Build
npm run build

# Type check
npm run type-check
```

Open [http://localhost:3000](http://localhost:3000).

## Customization

All portfolio data lives in `src/components/terminal/commands.ts`:

- `PROFILE` — Name, title, tagline, links
- `SKILLS` — Skill categories and items
- `PROJECTS` — Project details with impact metrics
- `EXPERIENCE_DATA` — Work history

Update these objects and the terminal auto-reflects changes. No other files need modification for content updates.

## Performance

- **Lighthouse Score:** Target ≥ 90 across all categories
- **First Contentful Paint:** < 1s (terminal is SSR-safe, render is lazy)
- **Bundle:** Three.js only loads on render toggle
- **Animations:** One-time entrance, then frozen. No continuous GPU drain.
- **`prefers-reduced-motion`:** Fully respected

## Deployment

```bash
# Deploy to Vercel
npx vercel --prod
```

Or connect the GitHub repo to Vercel for automatic deployments on push.

## What This Demonstrates

- **CLI-driven UX design** — Real terminal interactions, not a CSS mockup
- **State management** — Single Zustand store driving both UI modes
- **Performance-aware rendering** — FPS monitoring, lazy loading, motion preferences
- **Separation of concerns** — Data, state, UI, and render layers are fully decoupled
- **Recruiter-first thinking** — Critical info is ≤2 clicks away via command chips
- **Accessibility** — ARIA labels, keyboard navigation, reduced motion support

## License

MIT
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run lint         # ESLint check
npm run type-check   # TypeScript validation (tsc --noEmit)
npm run format       # Prettier formatting (src/**/)
npm run analyze      # Bundle analysis (ANALYZE=true next build)
```

No test suite is configured.

## Architecture

**Dual-mode portfolio**: a terminal-first interface with an opt-in 3D render panel.

### Key Concepts

**Terminal Mode (always active)** — Full CLI with keyboard input, autocomplete (Levenshtein fuzzy match), history (↑↓), and command chips for mobile navigation. Commands and portfolio data are defined in `src/components/terminal/commands.ts`.

**Render Mode (opt-in, desktop-only)** — A React Three Fiber canvas loaded lazily via `next/dynamic` with `ssr: false`. Never bundled unless toggled. Auto-disables when FPS drops below 30 for 3 consecutive seconds.

**Single Zustand store** (`src/store/useTerminalStore.ts`) drives both modes: theme, render toggle state, terminal output history, command history, device type, and portfolio data fetched from `/api/portfolio`.

### Directory Layout

```
src/
├── app/
│   ├── layout.tsx          # Root layout, fonts, SEO metadata
│   ├── page.tsx            # Entry: PixelTransition → TerminalWindow
│   ├── globals.css         # Tailwind v4 @import + CSS custom properties for theming
│   └── api/portfolio/      # Dynamic portfolio data API route
├── components/
│   ├── terminal/           # Terminal.tsx (I/O), commands.ts (registry + data), Prompt.ts
│   ├── ui/                 # CommandChips, ThemeToggle, RenderToggle, PixelTransition, ShapeGrid
│   └── layout/             # TerminalWindow (top-level chrome), EntryScreen
├── store/
│   └── useTerminalStore.ts
├── lib/
│   ├── commandParser.ts    # Autocomplete + typo suggestions
│   └── deviceCheck.ts      # Device/WebGL/motion detection (runs once on mount)
└── render/
    ├── RenderCanvas.tsx    # R3F canvas + FPS monitor + scene switcher
    └── scenes/             # SkillScenes.tsx, ProjectScenes.tsx
```

### Styling

Tailwind v4 — configured entirely via `@import "tailwindcss"` in `globals.css`. There is no `tailwind.config.ts`. Theme switching uses CSS custom properties (`--bg`, `--surface`, `--text`, `--accent` etc.) on `:root` and `[data-theme="light"]`, so switching themes requires no React re-renders.

### TypeScript

Strict mode with `exactOptionalPropertyTypes` enabled. Path alias `@/*` → `./src/*`. Target ES2017.

### Performance Notes

- 3D bundle is zero-cost until render mode is toggled
- `detectDevice()` runs once; result is stored in Zustand and gates render toggle visibility
- Entrance animations run once and are frozen; respects `prefers-reduced-motion`
- CSS custom properties handle theming to avoid re-renders

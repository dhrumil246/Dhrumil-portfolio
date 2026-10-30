# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run type-check   # TypeScript validation (tsc --noEmit)
npm run format       # Prettier formatting (src/**/) — reformats whole files; prefer scoped edits
npm run analyze      # Bundle analysis (ANALYZE=true next build)
```

`npm run lint` is broken: it runs `next lint`, which Next 16 removed. Use `type-check` + `build` to verify. No test suite is configured.

## Architecture

**Terminal-first portfolio** with a 3D render panel beside it on desktop.

### Key Concepts

**Entry → terminal.** `page.tsx` renders `PixelTransition` with `EntryScreen` (boot log) as first content and the terminal as second. The terminal is **mounted, hidden, from page load**, so anything meant to be *seen* animating must key off the `revealed` prop (set when the entry hands off), not off mount. The entry auto-advances; click/Enter/Space/Esc skips. `PixelTransition` unmounts the entry after the reveal so its canvas loop stops.

**Terminal.** Keyboard input, autocomplete, history (↑↓), and command chips. Command handlers live in `src/components/terminal/commands.ts`. Mobile has no text input: everything must be reachable by chips or tappable lines (`cmdLine()` / `TerminalLine.cmd`, rendered as `.cmd-link` with a 44px hit area). Welcome and hint copy are device-aware.

**Portfolio data.** All content (profile, skills, projects with optional `caseStudy` sections, experience, achievements) is a static module: `src/lib/portfolioData.ts`. No API route. Figures in it are sourced from the project repos (comments say where) — keep claims checkable, and respect each repo's stated limits (e.g. YieldGuard's "do not claim" list).

**3D render panel (desktop only).** React Three Fiber canvas, lazy-loaded via `next/dynamic` with `ssr: false`. Auto-opens once when the terminal is revealed. `toggleRender` in the store refuses to open without WebGL (`supportsWebGL()`), and `RenderBoundary` closes the panel if the canvas throws, so a missing GPU never blanks the page. Auto-disables if FPS stays under 30 for 3s.
- Scenes: `WaferScene` (default, and for `project yieldguard`) and `ProjectScenes` (`projects` / other `project <name>`). Routing is `sceneFor()` in `src/render/sceneFor.ts`, its own module so `page.tsx` can label the panel without importing `RenderCanvas`.
- `lastCommand` holds the full input (`"project vaani"`), not just the verb — match with `startsWith`/exact strings accordingly.
- `src/render/waferData.ts` holds two **real** WM-811K class medoids with re-measured WaferCNN verdicts. The YieldGuard repo's other wafer maps are synthetic — don't add them as real data.

**Single Zustand store** (`src/store/useTerminalStore.ts`): theme, render state, terminal output, command history, last command, device type, and the static portfolio data.

### Directory Layout

```
src/
├── app/
│   ├── layout.tsx          # Root layout, JetBrains Mono font, SEO metadata
│   ├── page.tsx            # PixelTransition(EntryScreen → TerminalWindow + render panel), status bar
│   └── globals.css         # Tailwind v4 @import, theme tokens, .cmd-link / .render-close
├── components/
│   ├── terminal/           # Terminal.tsx (I/O), commands.ts (handlers), Prompt.ts
│   ├── ui/                 # CommandChips, ThemeToggle, PixelTransition, ShapeGrid
│   └── layout/             # TerminalWindow (chrome, chips, 3D auto-open), EntryScreen
├── store/
│   └── useTerminalStore.ts
├── lib/
│   ├── portfolioData.ts    # All portfolio content (static)
│   ├── commandParser.ts    # Parsing, autocomplete, typo suggestions, line()/cmdLine() helpers
│   └── deviceCheck.ts      # Device, reduced-motion and WebGL detection
└── render/
    ├── RenderCanvas.tsx    # R3F canvas, lights, FPS monitor, scene switch
    ├── RenderBoundary.tsx  # Closes the panel if the 3D throws
    ├── sceneFor.ts         # Command → scene + panel path
    ├── palette.ts          # 3D colours (mirror of the CSS tokens)
    ├── waferData.ts        # Real WM-811K wafer maps + model verdicts
    ├── components/Effects.tsx  # Post-processing (bloom etc.)
    └── scenes/             # WaferScene.tsx, ProjectScenes.tsx
```

### Styling

Tailwind v4 — configured entirely via `@import "tailwindcss"` in `globals.css`; there is no `tailwind.config.ts`. Theme tokens (`--bg`, `--surface`, `--text`, `--text-dim`, `--accent`, …) live on `:root` (dark) and `[data-theme="light"]`.

- **One accent** (lime; `--green` aliases it) on neutral ink. Amber/red are for emphasis/errors only. Every text colour is ≥ 4.5:1 on every surface it sits on — recheck contrast when changing tokens, including on chips.
- **Never add unlayered resets** like `* { margin: 0; padding: 0 }`. Tailwind v4 puts utilities in `@layer`, and any unlayered rule beats them — this once silently zeroed every `p-*`/`m-*` class site-wide.
- The light theme is applied on an inner `<div data-theme>`, not `<html>`; that div sets its own `color` so text doesn't inherit the dark `body` colour.
- Three.js can't read CSS variables: 3D colours come from `src/render/palette.ts`. **Change both** when retheming.
- JetBrains Mono is loaded with the `latin` subset only. Glyphs outside it (e.g. `▄ █ ▀`) fall back to another font with other widths and break monospace alignment — use ASCII for anything that must line up.

### TypeScript

Strict mode with `exactOptionalPropertyTypes` enabled. Path alias `@/*` → `./src/*`. Target ES2017. `TerminalLine.color` is a closed union of the system colours.

### Performance Notes

- 3D bundle loads only when the panel opens; wafer dies render as one `InstancedMesh` draw call
- `prefers-reduced-motion` is honoured in CSS, `ShapeGrid` (static frame), `PixelTransition` (plain cut) and the 3D scenes — CSS rules alone can't stop rAF loops or GSAP
- `supportsWebGL()` releases its probe context; browsers cap live WebGL contexts

### Verifying in the browser pane

A hidden preview pane pauses rAF/GSAP, so transitions freeze and timings are meaningless — show the pane first. `location.reload()` from the JS tool can silently fail; check `performance.now()` (page age) or use a real navigation. Deleting `.next` under a running dev server requires restarting it.

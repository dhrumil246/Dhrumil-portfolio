# Constellation Skills Scene — Design Spec

**Date:** 2026-04-23  
**Status:** Approved  
**Scope:** Replace `src/render/scenes/SkillScenes.tsx` with a constellation map visualization

---

## Problem

The current skills graph uses wireframe icospheres (icosahedrons) arranged in an ellipse connected to a spinning TorusKnot core. It feels generic — every category looks identical in shape, and there is no visual narrative tying the categories together.

---

## Solution

A **Constellation Map** — skills rendered as stars grouped into category clusters on a deep-space canvas. Lines between stars pulse with a traveling light particle. Clicking a cluster flies the camera in; clicking the background flies it back out.

---

## Scene Layout

Five constellation clusters scattered in a natural, non-symmetric arrangement (not a perfect ellipse):

| Cluster | World Position | Color |
|---|---|---|
| Languages | `(-1.3, 1.4, 0.2)` | `#a3e635` |
| Frontend | `(1.1, 1.2, -0.2)` | `#4ade80` |
| Backend | `(1.5, -0.3, 0.1)` | `#fb923c` |
| Databases | `(-1.0, -1.2, 0.3)` | `#fbbf24` |
| Tools | `(0.1, -1.5, -0.1)` | `#f43f5e` |

Each cluster contains:
- **1 main star** — represents the category; larger point mesh with stronger glow; category label always visible above it
- **N satellite stars** — one per skill; smaller points at hand-tuned offsets from the main star; skill name labels only visible when zoomed in
- **Spoke lines** — one `<Line>` per satellite, connecting it back to the main star at ~12% opacity in the cluster's accent color
- **Pulse particles** — 2 animated `SphereGeometry` meshes per spoke that travel from main star to satellite on a looping `(time * speed + phaseOffset) % 1.0` schedule

Background ambient particles are provided by the existing `Sparkles` component already in `RenderCanvas` — no new particle system needed.

---

## Interaction Model

### Default State
- Camera at `[0, 0, 5.8]`, fov 42 (unchanged)
- All 5 clusters fully visible at opacity 1.0
- Category labels visible; skill name labels hidden

### Click a Cluster
1. `selectedCluster` state updates to the clicked category
2. Camera position lerps to `[cx, cy, cz + 2.5]` over ~0.8 s via per-frame `THREE.Vector3.lerp()` in `useFrame`
3. `lookAt` target lerps to the cluster's world center
4. All other clusters' group opacity fades to 0.25
5. Skill name labels on the selected cluster fade in near each satellite star

### Click Away (Background)
- A large invisible `PlaneGeometry` mesh (`200 × 200`) sits behind the scene at `z = -2`
- Clicking it sets `selectedCluster` to `null`
- Camera lerps back to `[0, 0, 5.8]`
- `lookAt` target lerps back to `[0, 0, 0]`
- All cluster opacities restore to 1.0
- Skill labels fade out

No OrbitControls — all camera motion is manual lerping inside `useFrame`.

---

## Pulse Animation

Each spoke line has 2 pulse particles (small `SphereGeometry`, radius `0.015`) with staggered phase offsets so they don't fire simultaneously.

```
progress = (clock.elapsedTime * PULSE_SPEED + phaseOffset) % 1.0
position = lerp(mainStarPosition, satelliteStarPosition, progress)
```

- `PULSE_SPEED`: `0.18` (slow, calm signal feel)
- Phase offsets per pulse: `0.0` and `0.5` (evenly staggered)
- **Reduced motion:** pulse particles are not rendered; lines remain static

---

## Component Breakdown

All changes are contained in `src/render/scenes/SkillScenes.tsx` — full replacement. No other files change.

| Component | Responsibility |
|---|---|
| `ConstellationScene` (default export) | Reads portfolio data from store; owns `selectedCluster`, `cameraTarget`, `lookAtTarget` state; runs camera-lerp `useFrame`; renders all clusters + `BackgroundPlane` |
| `Cluster` | One category — renders main star mesh, satellite star meshes, `PulseLine` spokes, category label (always), skill labels (zoom-only) |
| `PulseLine` | Single spoke: one `<Line>` + 2 animated pulse particle meshes |
| `BackgroundPlane` | Large invisible mesh at `z = -2` that catches background pointer events to deselect |

---

## State

Managed in `ConstellationScene`:

```ts
const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
const cameraTarget = useRef(new THREE.Vector3(0, 0, 5.8));
const lookAtTarget = useRef(new THREE.Vector3(0, 0, 0));
```

Cluster opacity is derived from `selectedCluster` at render time — no separate opacity state.

---

## Dependencies

No new packages. Uses:
- `@react-three/fiber` — `useFrame`, `useThree`
- `@react-three/drei` — `Line`, `Text`
- `three` — `THREE.Vector3`, `THREE.MathUtils.lerp`

---

## Out of Scope

- ProjectScene — untouched
- RenderCanvas, store, API route — all untouched
- Mobile / SSR — render mode is already desktop-only; no changes needed

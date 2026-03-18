// @ts-nocheck
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Noise,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";

export default function Effects({
  theme,
  reducedMotion,
}: {
  theme: "dark" | "light";
  reducedMotion: boolean;
}) {
  // Post-processing is only really effective and visually pleasing in dark mode.
  // We can tone it down considerably in light mode, or disable some effects.
  const isDark = theme === "dark";

  // The following casts handle `@react-three/postprocessing` typing mismatches in React 18

  return (
    <EffectComposer disableNormalPass multisampling={4}>
      <Bloom
        luminanceThreshold={isDark ? 0.2 : 0.8}
        luminanceSmoothing={0.9}
        intensity={isDark ? 1.5 : 0.2}
        mipmapBlur // Better looking, softer blur
      />

      {/* Subtle chromatic aberration (color splitting at the edges) for a CRT/hacker feel */}
      <ChromaticAberration
        blendFunction={!reducedMotion && isDark ? BlendFunction.NORMAL : BlendFunction.SKIP}
        offset={new THREE.Vector2(0.0015, 0.0015)} // Minimal offset so it doesn't give a headache
      />

      {/* Film grain / noise to make it feel tactile */}
      {(<Noise
        premultiply
        blendFunction={!reducedMotion && isDark ? BlendFunction.ADD : BlendFunction.SKIP}
        opacity={0.03}
      /> as any)}

      {/* Vignette (darker edges) to focus attention on the center */}
      {(<Vignette
        offset={isDark ? 0.1 : 0.3}
        darkness={isDark ? 1.1 : 0.5}
      /> as any)}
    </EffectComposer>
  );
}

"use client";

import { Suspense, useEffect, useCallback, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import { useTerminalStore } from "@/store/useTerminalStore";
import { prefersReducedMotion } from "@/lib/deviceCheck";
import SkillsScene from "@/render/scenes/SkillScenes";
import ProjectScene from "@/render/scenes/ProjectScenes";
import Effects from "@/render/components/Effects";
import { PALETTE } from "@/render/palette";

// ─── FPS Monitor ───
function FPSMonitor({ onLowFPS }: { onLowFPS: () => void }) {
  useEffect(() => {
    let frames = 0;
    let lastTime = performance.now();
    let lowCount = 0;
    let rafId: number;

    const measure = () => {
      frames++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        const fps = frames;
        frames = 0;
        lastTime = now;

        if (fps < 30) {
          lowCount++;
          if (lowCount >= 3) onLowFPS();
        } else {
          lowCount = 0;
        }
      }
      rafId = requestAnimationFrame(measure);
    };

    rafId = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(rafId);
  }, [onLowFPS]);

  return null;
}

// ─── Loading Fallback ───
function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshBasicMaterial color={PALETTE.dark.accent} wireframe />
    </mesh>
  );
}

// ─── Main Render Canvas ───
export default function RenderCanvas() {
  const lastCommand = useTerminalStore((s) => s.lastCommand);
  const theme = useTerminalStore((s) => s.theme);
  const [reducedMotion] = useState(() => prefersReducedMotion());

  // Determine which scene to show based on last command
  const activeScene =
    // lastCommand is the full input ("project vaani"), so match the verb
    lastCommand?.startsWith("project") ? "projects" : "skills";

  const handleLowFPS = useCallback(() => {
    console.warn("[RenderCanvas] Low FPS detected, disabling render");
    useTerminalStore.getState().toggleRender();
  }, []);

  const ink = PALETTE[theme];
  const bgColor = ink.bg;

  return (
    <Canvas
      camera={{ position: [0, 0, 5.8], fov: 42 }}
      dpr={[1, 1.5]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      }}
      style={{ background: bgColor }}
    >
      <color attach="background" args={[bgColor]} />

      {/* Key light + fill light for card depth */}
      <ambientLight intensity={0.5} />
      <pointLight position={[4, 5, 4]} intensity={1.2} />
      <pointLight
        position={[-4, -3, 2]}
        intensity={0.4}
        color={theme === "dark" ? ink.accent : ink.textDim}
      />

      {/* Post-Processing Effects */}
      <Effects theme={theme} reducedMotion={reducedMotion} />

      {/* Ambient Data Particles */}
      {!reducedMotion && (
        <Sparkles
          count={120}
          scale={12}
          size={1.5}
          speed={0.3}
          opacity={0.25}
          color={theme === "dark" ? ink.accent : ink.textDim}
        />
      )}

      {/* FPS Guard */}
      <FPSMonitor onLowFPS={handleLowFPS} />

      {/* Scene Switcher */}
      <Suspense fallback={<LoadingFallback />}>
        {activeScene === "skills" ? (
          <SkillsScene reducedMotion={reducedMotion} theme={theme} />
        ) : (
          <ProjectScene reducedMotion={reducedMotion} theme={theme} />
        )}
      </Suspense>
    </Canvas>
  );
}
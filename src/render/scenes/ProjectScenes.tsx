"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { type Project } from "@/components/terminal/commands";
import { useTerminalStore } from "@/store/useTerminalStore";
import { PALETTE, type Theme } from "@/render/palette";

interface ProjectSceneProps {
  reducedMotion: boolean;
  theme: Theme;
}

// ─── Single 3D project card ───
function ProjectCard({
  project,
  color,
  isActive,
  targetPosition,
  reducedMotion,
  theme,
  index,
}: {
  project: Project;
  color: string;
  isActive: boolean;
  targetPosition: [number, number, number];
  reducedMotion: boolean;
  theme: Theme;
  index: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const scaleRef = useRef(0);
  const targetVec = useMemo(() => new THREE.Vector3(...targetPosition), [targetPosition]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Entry pop-in
    if (scaleRef.current < 1) {
      scaleRef.current = Math.min(scaleRef.current + delta * 1.8, 1);
      groupRef.current.scale.setScalar(scaleRef.current);
    }

    // Smooth slide to target
    groupRef.current.position.lerp(targetVec, 0.09);

    // Active card floats gently
    if (isActive && !reducedMotion) {
      const t = state.clock.elapsedTime;
      groupRef.current.position.y =
        targetPosition[1] + Math.sin(t * 0.9 + index) * 0.04;
    }
  });

  const { textDim: dimColor, surface: surfaceColor, border: borderColor } =
    PALETTE[theme];

  const W = 2.3;
  const H = 1.35;

  return (
    <group
      ref={groupRef}
      position={targetPosition}
      scale={0}
    >
      {/* Card body — real 3D depth with RoundedBox */}
      <RoundedBox args={[W, H, 0.07]} radius={0.045} smoothness={4}>
        <meshStandardMaterial
          color={surfaceColor}
          roughness={0.25}
          metalness={isActive ? 0.15 : 0.05}
          transparent
          opacity={isActive ? 0.97 : 0.3}
        />
      </RoundedBox>

      {/* Border frame */}
      <RoundedBox args={[W + 0.025, H + 0.025, 0.04]} radius={0.05} smoothness={4}>
        <meshBasicMaterial
          color={isActive ? color : borderColor}
          transparent
          opacity={isActive ? 0.35 : 0.12}
          side={THREE.BackSide}
        />
      </RoundedBox>

      {/* Top accent bar */}
      <mesh position={[0, H / 2 - 0.028, 0.045]}>
        <planeGeometry args={[W - 0.01, 0.055]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isActive ? 1 : 0.25}
        />
      </mesh>

      {/* Left accent stripe */}
      <mesh position={[-(W / 2) + 0.028, 0, 0.045]}>
        <planeGeometry args={[0.055, H - 0.01]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isActive ? 0.45 : 0.1}
        />
      </mesh>

      {/* Title */}
      <Text
        position={[-(W / 2) + 0.2, H / 2 - 0.24, 0.06]}
        fontSize={0.145}
        color={isActive ? color : dimColor}
        anchorX="left"
        anchorY="middle"
        maxWidth={W - 0.55}
        fillOpacity={isActive ? 1 : 0.4}
      >
        {project.title}
      </Text>

      {/* Year */}
      <Text
        position={[W / 2 - 0.18, H / 2 - 0.24, 0.06]}
        fontSize={0.085}
        color={dimColor}
        anchorX="right"
        anchorY="middle"
        fillOpacity={isActive ? 1 : 0.3}
      >
        {project.year}
      </Text>

      {/* Description */}
      <Text
        position={[-(W / 2) + 0.2, 0.1, 0.06]}
        fontSize={0.075}
        color={dimColor}
        anchorX="left"
        anchorY="middle"
        maxWidth={W - 0.3}
        fillOpacity={isActive ? 1 : 0.3}
      >
        {project.description.length > 62
          ? project.description.slice(0, 60) + "…"
          : project.description}
      </Text>

      {/* Impact */}
      <Text
        position={[-(W / 2) + 0.2, -0.17, 0.06]}
        fontSize={0.075}
        color={isActive ? color : dimColor}
        anchorX="left"
        anchorY="middle"
        maxWidth={W - 0.3}
        fillOpacity={isActive ? 1 : 0.25}
      >
        {project.impact}
      </Text>

      {/* Tech pills row */}
      <Text
        position={[-(W / 2) + 0.2, -0.42, 0.06]}
        fontSize={0.062}
        color={dimColor}
        anchorX="left"
        anchorY="middle"
        maxWidth={W - 0.3}
        fillOpacity={isActive ? 0.8 : 0.2}
      >
        {project.tech.slice(0, 5).join("  ·  ")}
      </Text>

      {/* Active indicator dot */}
      {isActive && (
        <mesh position={[W / 2 - 0.15, -(H / 2) + 0.16, 0.05]}>
          <circleGeometry args={[0.04, 16]} />
          <meshBasicMaterial color={color} />
        </mesh>
      )}
    </group>
  );
}

// ─── Main project scene ───
export default function ProjectScene({ reducedMotion, theme }: ProjectSceneProps) {
  const pData = useTerminalStore((s) => s.portfolioData?.PROJECTS) ?? [];
  const [activeIndex, setActiveIndex] = useState(0);
  const pausedRef = useRef(false);

  // `project <name>` focuses that card and holds it; `projects` browses
  const lastCommand = useTerminalStore((s) => s.lastCommand);
  const focusedIndex = pData.findIndex(
    (p: Project) => lastCommand?.trim().toLowerCase() === `project ${p.name}`
  );
  useEffect(() => {
    if (focusedIndex >= 0) setActiveIndex(focusedIndex);
  }, [focusedIndex]);

  // Auto-advance every 3.5s — pauses while hovering, or while one is focused
  useEffect(() => {
    if (reducedMotion || pData.length <= 1 || focusedIndex >= 0) return;
    const id = setInterval(() => {
      if (pausedRef.current) return;
      setActiveIndex((i) => (i + 1) % pData.length);
    }, 3500);
    return () => clearInterval(id);
  }, [pData.length, reducedMotion, focusedIndex]);

  // Stacked depth layout: active card center-front, others recede behind
  const getTarget = useMemo(() => {
    return (i: number): [number, number, number] => {
      const total = pData.length;
      let offset = i - activeIndex;
      // Wrap for circular feel
      if (offset > total / 2) offset -= total;
      if (offset < -total / 2) offset += total;

      const absOff = Math.abs(offset);
      return [
        offset * 2.55,
        absOff * -0.12,
        offset === 0 ? 0 : -absOff * 1.8,
      ];
    };
  }, [activeIndex, pData.length]);

  const accentColor = PALETTE[theme].accent;

  return (
    <group
      onPointerOver={() => (pausedRef.current = true)}
      onPointerOut={() => (pausedRef.current = false)}
    >
      {/* Scene label */}
      <Text
        position={[0, 1.3, 0]}
        fontSize={0.1}
        color={accentColor}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.12}
        fillOpacity={0.6}
      >
        PROJECT PIPELINE
      </Text>

      {/* Cards */}
      {pData.map((project: Project, i: number) => (
        <ProjectCard
          key={project.name ?? project.title}
          project={project}
          color={accentColor}
          isActive={i === activeIndex}
          targetPosition={getTarget(i)}
          reducedMotion={reducedMotion}
          theme={theme}
          index={i}
        />
      ))}

      {/* Dot nav */}
      {pData.map((_: Project, i: number) => (
        <mesh
          key={`dot-${i}`}
          position={[(i - (pData.length - 1) / 2) * 0.24, -1.1, 0]}
          onClick={() => setActiveIndex(i)}
          onPointerOver={() => (document.body.style.cursor = "pointer")}
          onPointerOut={() => (document.body.style.cursor = "auto")}
        >
          <circleGeometry args={[i === activeIndex ? 0.055 : 0.032, 16]} />
          <meshBasicMaterial
            color={i === activeIndex ? accentColor : PALETTE[theme].border}
          />
        </mesh>
      ))}
    </group>
  );
}

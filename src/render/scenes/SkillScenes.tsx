"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei/core/Text";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { useTerminalStore } from "@/store/useTerminalStore";

interface SkillsSceneProps {
  reducedMotion: boolean;
  theme: "dark" | "light";
}

const CATEGORY_COLORS: Record<string, string> = {
  languages: "#a3e635",
  frontend: "#4ade80",
  backend: "#fb923c",
  devops: "#fbbf24",
  tools: "#f43f5e",
};

function SkillNode({
  position,
  label,
  skills,
  color,
  reducedMotion,
  theme,
  index,
}: {
  position: [number, number, number];
  label: string;
  skills: string[];
  color: string;
  reducedMotion: boolean;
  theme: string;
  index: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [entryDone, setEntryDone] = useState(false);

  // Larger radius for the cyber-grid feel
  const radius = 0.25;

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (!entryDone) {
      const s = groupRef.current.scale.x;
      const next = Math.min(s + delta * 2.5, 1);
      groupRef.current.scale.setScalar(next);
      if (next >= 1) setEntryDone(true);
      return;
    }

    if (!reducedMotion) {
      const t = state.clock.elapsedTime;
      // Organic drifting in 3D space
      groupRef.current.position.y = position[1] + Math.sin(t * 0.8 + index) * 0.05;
      groupRef.current.position.x = position[0] + Math.cos(t * 0.5 + index) * 0.05;
      groupRef.current.position.z = position[2] + Math.sin(t * 1.2 + index) * 0.05;
    }
  });

  const textColor = theme === "dark" ? "#e2e8f0" : "#1e293b";
  const dimColor = theme === "dark" ? "#64748b" : "#94a3b8";

  return (
    <group
      ref={groupRef}
      position={position}
      scale={0}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Glow */}
      <mesh>
        <circleGeometry args={[radius * 1.6, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered ? 0.1 : 0.03}
        />
      </mesh>

      {/* Main circle */}
      <mesh>
        <circleGeometry args={[radius, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered ? 0.2 : 0.06}
        />
      </mesh>

      {/* Border ring */}
      <mesh>
        <ringGeometry args={[radius - 0.01, radius, 32]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered ? 0.9 : 0.5}
        />
      </mesh>

      {/* Category label */}
      <Text
        position={[0, 0.03, 0.01]}
        fontSize={0.065}
        color={hovered ? color : textColor}
        anchorX="center"
        anchorY="middle"
      >
        {label.toUpperCase()}
      </Text>

      {/* Skill count */}
      <Text
        position={[0, -0.06, 0.01]}
        fontSize={0.045}
        color={dimColor}
        anchorX="center"
        anchorY="middle"
      >
        {`${skills.length} skills`}
      </Text>

      {/* Expanded skills on hover */}
      {hovered &&
        skills.map((skill, si) => {
          const angle =
            (si / skills.length) * Math.PI * 2 - Math.PI / 2;
          const dist = radius + 0.22;
          const sx = Math.cos(angle) * dist;
          const sy = Math.sin(angle) * dist;
          return (
            <Text
              key={skill}
              position={[sx, sy, 0.01]}
              fontSize={0.04}
              color={color}
              anchorX="center"
              anchorY="middle"
            >
              {skill}
            </Text>
          );
        })}
    </group>
  );
}

function NetworkConnections({
  positions,
  theme,
}: {
  positions: [number, number, number][];
  theme: string;
}) {
  const lineColor = theme === "dark" ? "#a3e635" : "#94a3b8";
  
  return (
    <group>
      {/* Connect each node to the center */}
      {positions.map((pos, i) => (
        <Line
          key={`center-line-${i}`}
          points={[[0, 0, 0], pos]}
          color={lineColor}
          lineWidth={1.5}
          transparent
          opacity={0.15}
        />
      ))}
      
      {/* Connect nodes to form a ring */}
      {positions.map((pos, i) => {
        const nextPos = positions[(i + 1) % positions.length];
        return (
          <Line
            key={`ring-line-${i}`}
            points={[pos, nextPos]}
            color={lineColor}
            lineWidth={1}
            transparent
            opacity={0.08}
          />
        );
      })}
    </group>
  );
}

export default function SkillsScene({
  reducedMotion,
  theme,
}: SkillsSceneProps) {
  const sData = useTerminalStore((s) => s.portfolioData?.SKILLS) || {};
  const categories = useMemo(() => Object.entries(sData), [sData]);

  // Tight constellation that fits a 360px wide panel
  const positions: [number, number, number][] = useMemo(() => {
    return categories.map((_, i) => {
      const angle = (i / categories.length) * Math.PI * 2 - Math.PI / 2;
      const r = 0.7;
      return [
        Math.cos(angle) * r,
        Math.sin(angle) * r,
        0,
      ] as [number, number, number];
    });
  }, [categories]);

  return (
    <group>
      <NetworkConnections positions={positions} theme={theme} />

      {/* Central Hub Node */}
      <group>
        <mesh>
          <circleGeometry args={[0.3, 32]} />
          <meshBasicMaterial color={theme === "dark" ? "#0f172a" : "#f1f5f9"} />
        </mesh>
        <mesh>
          <ringGeometry args={[0.3, 0.32, 32]} />
          <meshBasicMaterial color={theme === "dark" ? "#a3e635" : "#65a30d"} transparent opacity={0.5} />
        </mesh>
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.09}
          color={theme === "dark" ? "#a3e635" : "#65a30d"}
          anchorX="center"
          anchorY="middle"
        >
          NEXUS
        </Text>
      </group>

      {categories.map(([cat, skills], i) => (
        <SkillNode
          key={cat}
          position={positions[i]}
          label={cat}
          skills={skills as string[]}
          color={CATEGORY_COLORS[cat] || "#a3e635"}
          reducedMotion={reducedMotion}
          theme={theme}
          index={i}
        />
      ))}
    </group>
  );
}
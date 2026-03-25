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

// ─── Spinning TorusKnot core ───
function CoreNode({ theme }: { theme: string }) {
  const knotRef = useRef<THREE.Mesh>(null);
  const color = theme === "dark" ? "#a3e635" : "#65a30d";

  useFrame((state) => {
    if (!knotRef.current) return;
    const t = state.clock.elapsedTime;
    knotRef.current.rotation.x = t * 0.4;
    knotRef.current.rotation.y = t * 0.6;
    knotRef.current.rotation.z = t * 0.2;
  });

  return (
    <group>
      <mesh ref={knotRef}>
        <torusKnotGeometry args={[0.15, 0.045, 80, 10]} />
        <meshBasicMaterial color={color} wireframe />
      </mesh>
    </group>
  );
}

// ─── Single skill category node (wireframe icosahedron) ───
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
  const meshRef = useRef<THREE.Mesh>(null);
  const scaleRef = useRef(0);
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (!groupRef.current || !meshRef.current) return;

    // Entry pop-in
    if (scaleRef.current < 1) {
      scaleRef.current = Math.min(scaleRef.current + delta * 2.5, 1);
      groupRef.current.scale.setScalar(scaleRef.current);
    }

    if (!reducedMotion) {
      const t = state.clock.elapsedTime;
      // Icosahedron spins on its own axes only — group stays fixed so text faces camera
      meshRef.current.rotation.x = t * (0.35 + index * 0.08);
      meshRef.current.rotation.y = t * (0.45 + index * 0.06);
      // Gentle vertical float
      groupRef.current.position.y =
        position[1] + Math.sin(t * 0.7 + index * 1.4) * 0.06;
    }
  });

  const textColor = theme === "dark" ? "#e2e8f0" : "#1e293b";
  const dimColor = theme === "dark" ? "#64748b" : "#94a3b8";

  return (
    <group
      ref={groupRef}
      position={position}
      scale={0}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* Wireframe icosahedron */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[0.13, 1]} />
        <meshBasicMaterial
          color={color}
          wireframe
          transparent
          opacity={hovered ? 1 : 0.7}
        />
      </mesh>

      {/* Category label — always faces camera since parent group doesn't rotate */}
      <Text
        position={[0, -0.24, 0]}
        fontSize={0.072}
        color={hovered ? color : textColor}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.06}
      >
        {label.toUpperCase()}
      </Text>

      {/* Skill count (idle) */}
      {!hovered && (
        <Text
          position={[0, -0.35, 0]}
          fontSize={0.052}
          color={dimColor}
          anchorX="center"
          anchorY="middle"
        >
          {skills.length} skills
        </Text>
      )}

      {/* Skill list on hover — column below label */}
      {hovered &&
        skills.map((skill, si) => (
          <Text
            key={skill}
            position={[0, -0.35 - si * 0.11, 0]}
            fontSize={0.05}
            color={color}
            anchorX="center"
            anchorY="middle"
          >
            {skill}
          </Text>
        ))}
    </group>
  );
}

// ─── Main ───
export default function SkillsScene({ reducedMotion, theme }: SkillsSceneProps) {
  const sData = useTerminalStore((s) => s.portfolioData?.SKILLS) ?? {};
  const categories = useMemo(() => Object.entries(sData), [sData]);

  // 3D positions — tall ellipse to fit the portrait panel (narrow X, taller Y)
  const positions = useMemo<[number, number, number][]>(() => {
    return categories.map((_, i) => {
      const angle = (i / categories.length) * Math.PI * 2 - Math.PI / 2;
      const rx = 0.72; // Narrow horizontal — stays within the panel
      const ry = 1.0;  // Taller vertical — uses portrait space
      const zOffset = Math.sin(angle * 2 + 0.5) * 0.4;
      return [
        Math.cos(angle) * rx,
        Math.sin(angle) * ry,
        zOffset,
      ];
    });
  }, [categories]);

  const lineColor = theme === "dark" ? "#a3e635" : "#94a3b8";

  return (
    <group>
      <CoreNode theme={theme} />

      {positions.map((pos, i) => (
        <Line
          key={`line-${i}`}
          points={[[0, 0, 0], pos]}
          color={lineColor}
          lineWidth={1}
          transparent
          opacity={0.12}
        />
      ))}

      {categories.map(([cat, skills], i) => (
        <SkillNode
          key={cat}
          position={positions[i]}
          label={cat}
          skills={skills as string[]}
          color={CATEGORY_COLORS[cat] ?? "#a3e635"}
          reducedMotion={reducedMotion}
          theme={theme}
          index={i}
        />
      ))}
    </group>
  );
}

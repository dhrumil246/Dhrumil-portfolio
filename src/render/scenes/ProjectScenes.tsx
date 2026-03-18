"use client";

import { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei/core/Text";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { type Project } from "@/components/terminal/commands";
import { useTerminalStore } from "@/store/useTerminalStore";

interface ProjectSceneProps {
  reducedMotion: boolean;
  theme: "dark" | "light";
}

const PROJECT_COLORS = ["#a3e635", "#fb923c", "#f43f5e", "#eab308"];

// ─── Single Project Card (3D) ───
function ProjectCard({
  project,
  position,
  rotation,
  color,
  reducedMotion,
  theme,
  index,
}: {
  project: Project;
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  reducedMotion: boolean;
  theme: string;
  index: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const [entryDone, setEntryDone] = useState(false);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (!entryDone) {
      const s = groupRef.current.scale.x;
      const next = Math.min(s + delta * 1.5, 1);
      groupRef.current.scale.setScalar(next);
      if (next >= 1) setEntryDone(true);
      return;
    }

    if (!reducedMotion) {
      const t = state.clock.elapsedTime;
      groupRef.current.position.y =
        position[1] + Math.sin(t * 0.4 + index * 1.5) * 0.03;
    }
  });

  const textColor = theme === "dark" ? "#e2e8f0" : "#1e293b";
  const dimColor = theme === "dark" ? "#64748b" : "#94a3b8";
  const surfaceColor = theme === "dark" ? "#111827" : "#ffffff";

  const cardW = 2.2;
  const cardH = 1.2;

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={0}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Card border */}
      <mesh position={[0, 0, -0.001]}>
        <planeGeometry args={[cardW + 0.03, cardH + 0.03]} />
        <meshBasicMaterial
          color={hovered ? color : theme === "dark" ? "#1e293b" : "#e2e8f0"}
          transparent
          opacity={hovered ? 0.8 : 0.4}
        />
      </mesh>

      {/* Card background */}
      <mesh>
        <planeGeometry args={[cardW, cardH]} />
        <meshBasicMaterial
          color={surfaceColor}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Accent bar at top */}
      <mesh position={[0, cardH / 2 - 0.03, 0.001]}>
        <planeGeometry args={[cardW, 0.05]} />
        <meshBasicMaterial color={color} />
      </mesh>

      {/* Project title */}
      <Text
        position={[-cardW / 2 + 0.15, cardH / 2 - 0.22, 0.01]}
        fontSize={0.13}
        color={hovered ? color : textColor}
        anchorX="left"
        anchorY="middle"
        maxWidth={cardW - 0.6}
      >
        {project.title}
      </Text>

      {/* Year */}
      <Text
        position={[cardW / 2 - 0.15, cardH / 2 - 0.22, 0.01]}
        fontSize={0.09}
        color={dimColor}
        anchorX="right"
        anchorY="middle"
      >
        {project.year}
      </Text>

      {/* Description */}
      <Text
        position={[-cardW / 2 + 0.15, 0, 0.01]}
        fontSize={0.08}
        color={dimColor}
        anchorX="left"
        anchorY="middle"
        maxWidth={cardW - 0.3}
      >
        {project.description.slice(0, 55)}...
      </Text>

      {/* Impact */}
      <Text
        position={[-cardW / 2 + 0.15, -0.2, 0.01]}
        fontSize={0.08}
        color={color}
        anchorX="left"
        anchorY="middle"
        maxWidth={cardW - 0.3}
      >
        {project.impact}
      </Text>

      {/* Tech stack */}
      <Text
        position={[-cardW / 2 + 0.15, -0.4, 0.01]}
        fontSize={0.065}
        color={dimColor}
        anchorX="left"
        anchorY="middle"
        maxWidth={cardW - 0.3}
      >
        {project.tech.join(" · ")}
      </Text>
    </group>
  );
}

// ─── Pipeline connector ───
function PipelineConnector({
  from,
  to,
  theme,
}: {
  from: [number, number, number];
  to: [number, number, number];
  theme: string;
}) {
  const lineColor = theme === "dark" ? "#a3e635" : "#cbd5e1";

  // Creates a structured right-angled path between cards for a tech/PCB look
  const midPoint: [number, number, number] = [
    (from[0] + to[0]) / 2,
    (from[1] + to[1]) / 2,
    Math.min(from[2], to[2]) - 0.5, // Push line backwards to give depth
  ];

  return (
    <Line
      points={[from, midPoint, to]}
      color={lineColor}
      lineWidth={1}
      transparent
      opacity={0.3}
    />
  );
}

// ─── Main Project Scene ───
export default function ProjectScene({
  reducedMotion,
  theme,
}: ProjectSceneProps) {
  const pData = useTerminalStore((s) => s.portfolioData?.PROJECTS) || [];
  
  // Curved holographic array layout
  const layout = useMemo(() => {
    const total = pData.length;
    const spread = Math.PI / 1.8; // The total arc angle
    const radius = 4.5;
    
    return pData.map((_: any, i: number) => {
      // Calculate angle along the arc
      const angle = total > 1 
        ? (i / (total - 1)) * spread - (spread / 2) 
        : 0;
      
      const x = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius - radius + 0.5; // Offset to keep it visible
      const y = i % 2 === 0 ? 0.4 : -0.4; // Zig-zag vertical stagger
      
      return {
        position: [x, y, z] as [number, number, number],
        // Rotate so cards face outward from the center of the cylinder
        rotation: [0, angle, 0] as [number, number, number],
      };
    });
  }, [pData]);

  return (
    <group position={[0, 0, 0]}>
      {/* Pipeline connectors */}
      {layout.length > 1 &&
        layout.slice(0, -1).map((node: { position: [number, number, number] }, i: number) => (
          <PipelineConnector
            key={i}
            from={node.position}
            to={layout[i + 1].position}
            theme={theme}
          />
        ))}

      {/* Project cards */}
      {pData.map((project: any, i: number) => (
        <ProjectCard
          key={project.name || project.title}
          project={project}
          position={layout[i].position}
          rotation={layout[i].rotation}
          color={PROJECT_COLORS[i % PROJECT_COLORS.length]}
          reducedMotion={reducedMotion}
          theme={theme}
          index={i}
        />
      ))}

      {/* Scene title */}
      <Text
        position={[0, 2.1, 0]}
        fontSize={0.16}
        color={theme === "dark" ? "#a3e635" : "#65a30d"}
        anchorX="center"
        anchorY="middle"
      >
        PROJECT PIPELINE
      </Text>
    </group>
  );
}
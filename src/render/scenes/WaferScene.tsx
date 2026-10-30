"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";
import { PALETTE, type Theme } from "@/render/palette";
import { WAFERS } from "@/render/waferData";

interface WaferSceneProps {
  reducedMotion: boolean;
  theme: Theme;
}

const GRID = 64; // WM-811K maps here are 64×64
const SIZE = 2.3; // wafer diameter in scene units
const STEP = SIZE / GRID;
const PASS_H = 0.018;
const FAIL_H = 0.11; // failed dies stand up, so the defect pattern reads as relief

// ─── All dies of one wafer: a single InstancedMesh, one draw call ───
function Dies({ rows, theme }: { rows: readonly string[]; theme: Theme }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const dies = useMemo(() => {
    const out: { x: number; y: number; fail: boolean }[] = [];
    rows.forEach((row, y) =>
      [...row].forEach((c, x) => {
        if (c !== "0") out.push({ x, y, fail: c === "2" });
      })
    );
    return out;
  }, [rows]);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const o = new THREE.Object3D();
    const color = new THREE.Color();
    const ink = PALETTE[theme];
    dies.forEach((d, i) => {
      const h = d.fail ? FAIL_H : PASS_H;
      o.position.set((d.x - GRID / 2 + 0.5) * STEP, h / 2, (d.y - GRID / 2 + 0.5) * STEP);
      o.scale.set(STEP * 0.84, h, STEP * 0.84); // gap between dies = scribe lines
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
      mesh.setColorAt(i, color.set(d.fail ? ink.accent : ink.die));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [dies, theme]);

  return (
    // key: die count differs per wafer, and an instance count can't change in place
    <instancedMesh key={dies.length} ref={ref} args={[undefined, undefined, dies.length]}>
      <boxGeometry args={[1, 1, 1]} />
      {/* Unlit with exact palette colours: lighting + tone mapping turned the
          light-mode wafer slate grey. Relief still reads as the wafer spins. */}
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  );
}

// ─── Main ───
export default function WaferScene({ reducedMotion, theme }: WaferSceneProps) {
  const [index, setIndex] = useState(0);
  const paused = useRef(false);
  const spin = useRef<THREE.Group>(null);
  const ink = PALETTE[theme];
  const wafer = WAFERS[index];
  const next = () => setIndex((i) => (i + 1) % WAFERS.length);

  // Alternate failing ↔ nominal every 6s; hovering holds the current one
  useEffect(() => {
    if (reducedMotion) return;
    const id = setInterval(() => {
      if (!paused.current) setIndex((i) => (i + 1) % WAFERS.length);
    }, 6000);
    return () => clearInterval(id);
  }, [reducedMotion]);

  // Slow spin in the wafer's own plane
  useFrame((state) => {
    if (spin.current && !reducedMotion) {
      spin.current.rotation.y = state.clock.elapsedTime * 0.12;
    }
  });

  return (
    <group
      onPointerOver={() => {
        paused.current = true;
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        paused.current = false;
        document.body.style.cursor = "auto";
      }}
      onClick={next}
    >
      <Text
        position={[0, 1.66, 0]}
        fontSize={0.115}
        color={ink.accent}
        anchorX="center"
        letterSpacing={0.12}
        fillOpacity={0.75}
      >
        WM-811K · REAL WAFER
      </Text>
      <Text
        position={[0, 1.43, 0]}
        fontSize={0.085}
        color={ink.textDim}
        anchorX="center"
        textAlign="center"
        maxWidth={2.9}
      >
        {wafer.caption}
      </Text>

      {/* Tilted toward the camera so the raised failed dies read as relief */}
      <group rotation={[1.0, 0, 0]} position={[0, 0.05, 0]}>
        <group ref={spin}>
          <mesh position={[0, -0.006, 0]}>
            <cylinderGeometry args={[SIZE / 2 + 0.03, SIZE / 2 + 0.03, 0.012, 96]} />
            <meshStandardMaterial color={ink.border} roughness={0.4} metalness={0.3} />
          </mesh>
          <Dies rows={wafer.rows} theme={theme} />
        </group>
      </group>

      <Text
        position={[0, -1.3, 0]}
        fontSize={0.115}
        color={ink.text}
        anchorX="center"
      >
        {`WaferCNN → ${wafer.prediction}  ${wafer.confidence.toFixed(4)}`}
      </Text>
      <Text
        position={[0, -1.5, 0]}
        fontSize={0.08}
        color={ink.textDim}
        anchorX="center"
      >
        {`${wafer.failDies} failed of ${wafer.dies.toLocaleString("en-US")} dies · softmax, not calibrated`}
      </Text>

      {/* Which wafer, and a tap target to switch */}
      {WAFERS.map((w, i) => (
        <mesh
          key={w.key}
          position={[(i - (WAFERS.length - 1) / 2) * 0.22, -1.74, 0]}
          onClick={(e) => {
            e.stopPropagation();
            setIndex(i);
          }}
        >
          <circleGeometry args={[i === index ? 0.05 : 0.032, 20]} />
          <meshBasicMaterial color={i === index ? ink.accent : ink.textDim} />
        </mesh>
      ))}
    </group>
  );
}

import React, { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { z } from "zod";
import { fontFor } from "../lib/fonts";
import { springAt } from "../lib/motion";
import { defaultTheme, themeSchema } from "../lib/theme";

export const logo3DSchema = z.object({
  label: z.string(),
  theme: themeSchema.optional(),
});
export type Logo3DProps = z.infer<typeof logo3DSchema>;

/** A star-shaped logo extruded in 3D with Three.js, rendered via react-three-fiber (@remotion/three). */
const StarLogo: React.FC<{ color: string; color2: string; t: number; pop: number }> = ({ color, color2, t, pop }) => {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const spikes = 6;
    for (let i = 0; i <= spikes * 2; i++) {
      const r = i % 2 === 0 ? 1.4 : 0.65;
      const a = (i / (spikes * 2)) * Math.PI * 2;
      const x = Math.cos(a) * r;
      const y = Math.sin(a) * r;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    const g = new THREE.ExtrudeGeometry(shape, { depth: 0.5, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.1, bevelSegments: 4 });
    g.center();
    return g;
  }, []);
  return (
    <group scale={pop} rotation={[Math.sin(t * 1.3) * 0.4, t * 1.6, 0]}>
      <mesh geometry={geometry}>
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.25} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2, 0.06, 16, 120]} />
        <meshStandardMaterial color={color2} emissive={color2} emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
};

export const Logo3D: React.FC<Logo3DProps> = ({ label, theme = defaultTheme }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const pop = springAt(frame, fps, { stiffness: 80, damping: 10 });
  const textIn = interpolate(frame, [20, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${theme.background}, #1a1440)` }}>
      <ThreeCanvas width={width} height={height} camera={{ position: [0, 0, 6], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 4, 5]} intensity={2.2} />
        <pointLight position={[-4, -2, 3]} intensity={30} color={theme.accent2} />
        <group position={[0, 0.5, 0]}>
          <StarLogo color={theme.accent} color2={theme.accent2} t={frame / fps} pop={pop} />
        </group>
      </ThreeCanvas>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: height * 0.1 }}>
        <div
          style={{
            ...fontFor(label),
            fontSize: 84,
            fontWeight: 900,
            color: theme.foreground,
            opacity: textIn,
            letterSpacing: fontFor(label).direction === "rtl" ? 0 : `${(1 - textIn) * 30}px`,
          }}
        >
          {label}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import Matter from "matter-js";
import { utils } from "animejs";
import { z } from "zod";
import { fontFor } from "../lib/fonts";
import { defaultTheme, palette, themeSchema } from "../lib/theme";

export const physicsDropSchema = z.object({
  items: z.array(z.string()).min(1),
  title: z.string().optional(),
  seed: z.number().default(7),
  theme: themeSchema.optional(),
});
export type PhysicsDropProps = z.infer<typeof physicsDropSchema>;

type Snapshot = { x: number; y: number; angle: number }[];

/**
 * Matter.js rigid-body physics. The whole simulation is pre-computed once with a
 * fixed timestep and a seeded RNG, so frame N is always identical — required for
 * Remotion's parallel, out-of-order rendering.
 */
export const PhysicsDrop: React.FC<PhysicsDropProps> = ({ items, title, seed = 7, theme = defaultTheme }) => {
  const frame = useCurrentFrame();
  const { width, height, fps, durationInFrames } = useVideoConfig();

  const { sizes, frames } = useMemo(() => {
    const rand = utils.createSeededRandom(seed);
    const engine = Matter.Engine.create({ gravity: { x: 0, y: 1.2 } });
    const wall = { isStatic: true, restitution: 0.4 };
    Matter.Composite.add(engine.world, [
      Matter.Bodies.rectangle(width / 2, height + 50, width * 2, 100, wall),
      Matter.Bodies.rectangle(-50, height / 2, 100, height * 3, wall),
      Matter.Bodies.rectangle(width + 50, height / 2, 100, height * 3, wall),
    ]);
    const sz = items.map((label) => ({ w: Math.max(140, label.length * 30 + 60), h: 90 }));
    const bodies = items.map((_, i) =>
      Matter.Bodies.rectangle(
        width * 0.2 + rand(0, 1, 3) * width * 0.6,
        -150 - i * 140,
        sz[i].w,
        sz[i].h,
        { restitution: 0.55, friction: 0.3, angle: (rand(0, 1, 3) - 0.5) * 1.2, chamfer: { radius: 24 } },
      ),
    );
    Matter.Composite.add(engine.world, bodies);
    const out: Snapshot[] = [];
    const substeps = 4;
    for (let f = 0; f < durationInFrames; f++) {
      out.push(bodies.map((b) => ({ x: b.position.x, y: b.position.y, angle: b.angle })));
      for (let s = 0; s < substeps; s++) Matter.Engine.update(engine, 1000 / fps / substeps);
    }
    return { sizes: sz, frames: out };
  }, [items, seed, width, height, fps, durationInFrames]);

  const snap = frames[Math.min(frame, frames.length - 1)];

  return (
    <AbsoluteFill style={{ background: theme.background, overflow: "hidden" }}>
      {title ? (
        <div
          style={{
            ...fontFor(title),
            position: "absolute",
            top: 60,
            width: "100%",
            textAlign: "center",
            fontSize: 72,
            fontWeight: 900,
            color: theme.foreground,
          }}
        >
          {title}
        </div>
      ) : null}
      {items.map((label, i) => (
        <div
          key={i}
          style={{
            ...fontFor(label),
            position: "absolute",
            left: snap[i].x - sizes[i].w / 2,
            top: snap[i].y - sizes[i].h / 2,
            width: sizes[i].w,
            height: sizes[i].h,
            transform: `rotate(${snap[i].angle}rad)`,
            borderRadius: 24,
            background: palette[i % palette.length],
            color: "#0b1020",
            fontSize: 44,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 12px 30px rgba(0,0,0,.35)",
          }}
        >
          {label}
        </div>
      ))}
    </AbsoluteFill>
  );
};

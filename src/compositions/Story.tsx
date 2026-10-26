import React from "react";
import { AbsoluteFill, Html5Audio, Sequence, interpolate, staticFile, useCurrentFrame, type CalculateMetadataFunction } from "remotion";
import { z } from "zod";
import { defaultTheme, themeSchema } from "../lib/theme";
import { KineticTitle } from "./KineticTitle";
import { PhysicsDrop } from "./PhysicsDrop";
import { Logo3D } from "./Logo3D";
import { AnimatedChart } from "./AnimatedChart";
import { LottieBadge } from "./LottieBadge";
import { AudioBars } from "./AudioBars";

const base = { duration: z.number().positive().default(3) };

export const sceneSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("title"), title: z.string(), subtitle: z.string().optional(), ...base }),
  z.object({ type: z.literal("physics"), items: z.array(z.string()).min(1), title: z.string().optional(), seed: z.number().default(7), ...base }),
  z.object({ type: z.literal("logo3d"), label: z.string(), ...base }),
  z.object({ type: z.literal("chart"), title: z.string(), data: z.array(z.object({ label: z.string(), value: z.number() })), unit: z.string().default(""), ...base }),
  z.object({ type: z.literal("badge"), text: z.string(), ...base }),
  z.object({ type: z.literal("audio"), audio: z.string().default("demo-beat.mp3"), title: z.string().optional(), bars: z.number().default(48), ...base }),
]);
export type Scene = z.infer<typeof sceneSchema>;

export const storySchema = z.object({
  width: z.number().int().default(1280),
  height: z.number().int().default(720),
  fps: z.number().int().default(30),
  theme: themeSchema.default(defaultTheme),
  music: z.string().optional(),
  scenes: z.array(sceneSchema).min(1),
});
export type StoryProps = z.infer<typeof storySchema>;

export const calculateStoryMetadata: CalculateMetadataFunction<StoryProps> = ({ props }) => {
  const parsed = storySchema.parse(props);
  const durationInFrames = parsed.scenes.reduce((sum, s) => sum + Math.round(s.duration * parsed.fps), 0);
  return { durationInFrames, fps: parsed.fps, width: parsed.width, height: parsed.height, props: parsed };
};

const Fade: React.FC<{ children: React.ReactNode; frames: number }> = ({ children, frames }) => {
  const frame = useCurrentFrame();
  const fade = 8;
  const opacity = interpolate(frame, [0, fade, frames - fade, frames], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

const renderScene = (scene: Scene, theme: StoryProps["theme"]) => {
  switch (scene.type) {
    case "title":
      return <KineticTitle title={scene.title} subtitle={scene.subtitle} theme={theme} />;
    case "physics":
      return <PhysicsDrop items={scene.items} title={scene.title} seed={scene.seed} theme={theme} />;
    case "logo3d":
      return <Logo3D label={scene.label} theme={theme} />;
    case "chart":
      return <AnimatedChart title={scene.title} data={scene.data} unit={scene.unit} theme={theme} />;
    case "badge":
      return <LottieBadge text={scene.text} theme={theme} />;
    case "audio":
      return <AudioBars audio={scene.audio} title={scene.title} bars={scene.bars} theme={theme} />;
  }
};

/** Renders any JSON spec: a list of scenes played back-to-back with cross-fades. */
export const Story: React.FC<StoryProps> = ({ scenes, theme, music, fps }) => {
  let from = 0;
  return (
    <AbsoluteFill style={{ background: theme.background }}>
      {music ? <Html5Audio src={/^https?:\/\//.test(music) ? music : staticFile(music)} /> : null}
      {scenes.map((scene, i) => {
        const frames = Math.round(scene.duration * fps);
        const seq = (
          <Sequence key={i} from={from} durationInFrames={frames} name={`${i + 1}. ${scene.type}`}>
            <Fade frames={frames}>{renderScene(scene, theme)}</Fade>
          </Sequence>
        );
        from += frames;
        return seq;
      })}
    </AbsoluteFill>
  );
};

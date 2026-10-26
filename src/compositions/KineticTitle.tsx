import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { gsap } from "gsap";
import { z } from "zod";
import { fontFor } from "../lib/fonts";
import { ease, progress, springAt } from "../lib/motion";
import { defaultTheme, themeSchema } from "../lib/theme";

export const kineticTitleSchema = z.object({
  title: z.string(),
  subtitle: z.string().optional(),
  theme: themeSchema.optional(),
});
export type KineticTitleProps = z.infer<typeof kineticTitleSchema>;

/**
 * Kinetic typography. Words (not letters, so Persian/Arabic shaping stays intact)
 * fly in on a paused GSAP timeline that is *seeked* to the current frame.
 */
export const KineticTitle: React.FC<KineticTitleProps> = ({ title, subtitle, theme = defaultTheme }) => {
  const frame = useCurrentFrame();
  const { fps, width, durationInFrames } = useVideoConfig();
  const words = title.split(/\s+/).filter(Boolean);
  const font = fontFor(title);

  // Build the GSAP timeline once, animating plain objects (no DOM access → deterministic).
  const { tl, state } = useMemo(() => {
    const st = words.map(() => ({ y: 120, opacity: 0, rot: 12, blur: 12, scale: 0.6 }));
    const timeline = gsap.timeline({ paused: true });
    st.forEach((s, i) => {
      timeline.to(s, { y: 0, opacity: 1, rot: 0, blur: 0, scale: 1, duration: 0.7, ease: "back.out(1.8)" }, 0.15 + i * 0.12);
    });
    // Outro: everything lifts away together.
    const outStart = durationInFrames / fps - 0.6;
    timeline.to(st, { y: -60, opacity: 0, blur: 8, duration: 0.5, ease: "power2.in" }, outStart);
    return { tl: timeline, state: st };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, fps, durationInFrames]);

  tl.seek(frame / fps, false);

  const bar = ease("outExpo", progress(frame, 10, 30));
  const sub = springAt(frame - (12 + words.length * 4), fps, { stiffness: 90, damping: 15 });
  const glow = 0.5 + 0.5 * Math.sin(frame / 12);

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 40%, ${theme.accent}33, ${theme.background} 60%)`,
        justifyContent: "center",
        alignItems: "center",
        color: theme.foreground,
        ...font,
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0 0.3em",
          maxWidth: width * 0.85,
          fontSize: Math.min(140, Math.max(56, (width * 3) / Math.max(8, title.length))),
          fontWeight: 900,
          lineHeight: 1.25,
          direction: font.direction,
          textShadow: `0 0 ${20 + glow * 30}px ${theme.accent}aa`,
        }}
      >
        {words.map((w, i) => (
          <span
            key={i}
            style={{
              display: "inline-block",
              transform: `translateY(${state[i].y}px) rotate(${state[i].rot}deg) scale(${state[i].scale})`,
              opacity: state[i].opacity,
              filter: `blur(${state[i].blur}px)`,
            }}
          >
            {w}
          </span>
        ))}
      </div>
      <div
        style={{
          height: 8,
          width: width * 0.4 * bar,
          marginTop: 30,
          borderRadius: 4,
          background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent2})`,
        }}
      />
      {subtitle ? (
        <div
          style={{
            ...fontFor(subtitle),
            marginTop: 30,
            fontSize: 48,
            opacity: sub * state[0].opacity,
            transform: `translateY(${(1 - sub) * 40}px)`,
            color: theme.accent2,
          }}
        >
          {subtitle}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

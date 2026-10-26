import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Lottie, type LottieAnimationData } from "@remotion/lottie";
import { z } from "zod";
import { fontFor } from "../lib/fonts";
import { makeBadgeLottie } from "../lib/lottieBadge";
import { ease, progress } from "../lib/motion";
import { defaultTheme, themeSchema } from "../lib/theme";

export const lottieBadgeSchema = z.object({
  text: z.string(),
  theme: themeSchema.optional(),
});
export type LottieBadgeProps = z.infer<typeof lottieBadgeSchema>;

/** Lottie (lottie-web via @remotion/lottie) with a code-generated animation + anime.js-eased caption. */
export const LottieBadge: React.FC<LottieBadgeProps> = ({ text, theme = defaultTheme }) => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();
  const data = useMemo(() => makeBadgeLottie(theme.accent, theme.accent2) as unknown as LottieAnimationData, [theme.accent, theme.accent2]);
  const p = ease("outBack", progress(frame, 35, 20));
  return (
    <AbsoluteFill style={{ background: theme.background, alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: height * 0.55, height: height * 0.55 }}>
        <Lottie animationData={data} loop={false} />
      </div>
      <div
        style={{
          ...fontFor(text),
          fontSize: 64,
          fontWeight: 800,
          color: theme.foreground,
          opacity: Math.min(1, p),
          transform: `translateY(${(1 - p) * 40}px)`,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

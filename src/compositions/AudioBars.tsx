import React from "react";
import { AbsoluteFill, Html5Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useAudioData, visualizeAudio } from "@remotion/media-utils";
import { z } from "zod";
import { fontFor } from "../lib/fonts";
import { defaultTheme, palette, themeSchema } from "../lib/theme";

export const audioBarsSchema = z.object({
  audio: z.string().default("demo-beat.mp3"),
  title: z.string().optional(),
  bars: z.number().int().min(8).max(128).default(48),
  theme: themeSchema.optional(),
});
export type AudioBarsProps = z.infer<typeof audioBarsSchema>;

const resolveSrc = (src: string) => (/^https?:\/\//.test(src) ? src : staticFile(src));

/** Audio-reactive spectrum bars using Remotion's FFT helpers (@remotion/media-utils). */
export const AudioBars: React.FC<AudioBarsProps> = ({ audio = "demo-beat.mp3", title, bars = 48, theme = defaultTheme }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const src = resolveSrc(audio);
  const audioData = useAudioData(src);

  const samples = 128;
  const spectrum = audioData
    ? visualizeAudio({ fps, frame, audioData, numberOfSamples: samples, optimizeFor: "speed" })
    : new Array(samples).fill(0);
  // Log-ish compression so quiet highs are visible.
  const values = new Array(bars).fill(0).map((_, i) => {
    // Logarithmic frequency mapping: more bars for mids/highs, like a real analyser.
    const idx = Math.min(samples - 1, Math.floor(Math.pow(samples * 0.8, i / bars)));
    const v = spectrum[idx] ?? 0;
    const tilt = 1 + (i / bars) * 3; // boost highs, they carry far less energy
    return Math.min(1, Math.pow(v * 1.6 * tilt, 0.7));
  });
  const bass = values.slice(0, 4).reduce((a, b) => a + b, 0) / 4;
  const barW = (width * 0.8) / bars;

  return (
    <AbsoluteFill style={{ background: theme.background, alignItems: "center", justifyContent: "center" }}>
      <Html5Audio src={src} />
      <div
        style={{
          position: "absolute",
          width: height * 0.5,
          height: height * 0.5,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${theme.accent}88, transparent 70%)`,
          transform: `scale(${1 + bass * 0.6})`,
        }}
      />
      {title ? (
        <div style={{ ...fontFor(title), position: "absolute", top: 70, fontSize: 64, fontWeight: 900, color: theme.foreground }}>{title}</div>
      ) : null}
      <div style={{ position: "absolute", bottom: height * 0.15, display: "flex", alignItems: "flex-end", height: height * 0.5, gap: barW * 0.25 }}>
        {values.map((v, i) => (
          <div
            key={i}
            style={{
              width: barW * 0.75,
              height: Math.max(6, v * height * 0.5),
              borderRadius: barW,
              background: `linear-gradient(0deg, ${palette[i % 2]}, ${palette[(i % 4) + 2]})`,
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

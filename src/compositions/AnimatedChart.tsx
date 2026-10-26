import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import * as d3 from "d3";
import { z } from "zod";
import { fontFor } from "../lib/fonts";
import { springAt } from "../lib/motion";
import { defaultTheme, palette, themeSchema } from "../lib/theme";

export const chartSchema = z.object({
  title: z.string(),
  data: z.array(z.object({ label: z.string(), value: z.number() })).min(1),
  unit: z.string().default(""),
  theme: themeSchema.optional(),
});
export type AnimatedChartProps = z.infer<typeof chartSchema>;

/** Animated bar chart: D3 scales/axes math + Motion springs, staggered per bar. RTL aware. */
export const AnimatedChart: React.FC<AnimatedChartProps> = ({ title, data, unit = "", theme = defaultTheme }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const font = fontFor(title);
  const rtl = font.direction === "rtl";
  const margin = { top: 200, right: 120, bottom: 140, left: 120 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;
  const ordered = rtl ? [...data].reverse() : data;

  const x = d3.scaleBand().domain(ordered.map((d) => d.label)).range([0, innerW]).padding(0.25);
  const y = d3.scaleLinear().domain([0, (d3.max(data, (d) => d.value) ?? 1) * 1.15]).nice().range([innerH, 0]);
  const ticks = y.ticks(5);
  const fmt = d3.format(",.0f");
  const titleIn = springAt(frame, fps, { stiffness: 100, damping: 16 });

  return (
    <AbsoluteFill style={{ background: theme.background, color: theme.foreground, ...font }}>
      <div style={{ position: "absolute", top: 60, width: "100%", textAlign: "center", fontSize: 64, fontWeight: 900, opacity: titleIn, transform: `translateY(${(1 - titleIn) * -30}px)` }}>
        {title}
      </div>
      <svg width={width} height={height} style={{ position: "absolute" }}>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {ticks.map((t) => (
            <g key={t} transform={`translate(0,${y(t)})`} opacity={titleIn * 0.6}>
              <line x1={0} x2={innerW} stroke={theme.foreground} strokeOpacity={0.15} />
              <text x={rtl ? innerW + 16 : -16} textAnchor={rtl ? "start" : "end"} dy="0.35em" fill={theme.foreground} fontSize={24}>
                {fmt(t)}
              </text>
            </g>
          ))}
          {ordered.map((d, i) => {
            const idx = rtl ? ordered.length - 1 - i : i;
            const p = springAt(frame - 15 - idx * 6, fps, { stiffness: 90, damping: 12 });
            const h = (innerH - y(d.value)) * p;
            const bx = x(d.label) ?? 0;
            const color = palette[idx % palette.length];
            return (
              <g key={d.label}>
                <rect x={bx} y={innerH - h} width={x.bandwidth()} height={h} rx={12} fill={color} />
                <text x={bx + x.bandwidth() / 2} y={innerH - h - 18} textAnchor="middle" fill={theme.foreground} fontSize={30} fontWeight={700} opacity={Math.min(1, p)}>
                  {fmt(d.value * Math.min(1, p))}
                  {unit}
                </text>
                <text x={bx + x.bandwidth() / 2} y={innerH + 50} textAnchor="middle" fill={theme.foreground} fontSize={30} style={fontFor(d.label)}>
                  {d.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

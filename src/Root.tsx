import React from "react";
import { Composition } from "remotion";
import { KineticTitle, kineticTitleSchema } from "./compositions/KineticTitle";
import { PhysicsDrop, physicsDropSchema } from "./compositions/PhysicsDrop";
import { Logo3D, logo3DSchema } from "./compositions/Logo3D";
import { AnimatedChart, chartSchema } from "./compositions/AnimatedChart";
import { LottieBadge, lottieBadgeSchema } from "./compositions/LottieBadge";
import { AudioBars, audioBarsSchema } from "./compositions/AudioBars";
import { Story, calculateStoryMetadata, storySchema } from "./compositions/Story";
import { defaultTheme } from "./lib/theme";
import exampleSpec from "../specs/showcase.json";

const common = { fps: 30, width: 1280, height: 720 } as const;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="KineticTitle" component={KineticTitle} schema={kineticTitleSchema} durationInFrames={120} {...common}
      defaultProps={{ title: "Motion Studio — open-source motion graphics", subtitle: "Remotion · GSAP · anime.js · Motion", theme: defaultTheme }} />
    <Composition id="KineticTitleFa" component={KineticTitle} schema={kineticTitleSchema} durationInFrames={120} {...common}
      defaultProps={{ title: "استودیوی موشن گرافیک متن‌باز", subtitle: "ساخته‌شده با ابزارهای آزاد", theme: defaultTheme }} />
    <Composition id="PhysicsDrop" component={PhysicsDrop} schema={physicsDropSchema} durationInFrames={150} {...common}
      defaultProps={{ title: "Matter.js physics", items: ["Remotion", "GSAP", "Three.js", "Lottie", "D3", "Matter.js", "anime.js", "Motion"], seed: 7, theme: defaultTheme }} />
    <Composition id="Logo3D" component={Logo3D} schema={logo3DSchema} durationInFrames={120} {...common}
      defaultProps={{ label: "MOTION STUDIO", theme: defaultTheme }} />
    <Composition id="AnimatedChart" component={AnimatedChart} schema={chartSchema} durationInFrames={120} {...common}
      defaultProps={{ title: "Weekly views (demo data)", unit: "k", theme: defaultTheme, data: [
        { label: "Mon", value: 12 }, { label: "Tue", value: 19 }, { label: "Wed", value: 27 }, { label: "Thu", value: 24 }, { label: "Fri", value: 41 },
      ] }} />
    <Composition id="LottieBadge" component={LottieBadge} schema={lottieBadgeSchema} durationInFrames={90} {...common}
      defaultProps={{ text: "Rendered with Lottie", theme: defaultTheme }} />
    <Composition id="AudioBars" component={AudioBars} schema={audioBarsSchema} durationInFrames={300} {...common}
      defaultProps={{ audio: "demo-beat.mp3", title: "Audio-reactive", bars: 48, theme: defaultTheme }} />
    <Composition id="Story" component={Story} schema={storySchema} calculateMetadata={calculateStoryMetadata}
      durationInFrames={300} {...common} defaultProps={exampleSpec as never} />
  </>
);

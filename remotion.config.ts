import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// Software WebGL so Three.js scenes render on headless servers / CI.
Config.setChromiumOpenGlRenderer("swangle");

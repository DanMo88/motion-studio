// Synthesises the demo soundtrack (public/demo-beat.mp3) with FFmpeg — no third-party audio.
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";

mkdirSync("public", { recursive: true });
const expr = [
  // kick every 0.5s
  "0.9*sin(2*PI*(50+120*exp(-30*mod(t,0.5)))*mod(t,0.5))*exp(-7*mod(t,0.5))",
  // bass line (changes every 2s)
  "0.25*sin(2*PI*(55*pow(2,floor(mod(t/2,4))*3/12))*t)",
  // arpeggio
  "0.15*sin(2*PI*(440*pow(2,mod(floor(t*8),4)*4/12))*t)*exp(-6*mod(t,0.125))",
  // hi-hat (noise) on off-beats
  "0.12*(random(0)*2-1)*exp(-40*mod(t+0.25,0.5))",
].join("+");
execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "lavfi", "-i", `aevalsrc='${expr}':s=44100:d=12`, "-ac", "1", "-b:a", "96k", "public/demo-beat.mp3"], { stdio: "inherit" });
console.log("wrote public/demo-beat.mp3");

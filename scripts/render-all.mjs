// Renders every example composition + spec into out/.
import { execFileSync } from "node:child_process";

const jobs = [
  ["--composition", "KineticTitle"],
  ["--composition", "KineticTitleFa"],
  ["--composition", "PhysicsDrop"],
  ["--composition", "Logo3D"],
  ["--composition", "AnimatedChart"],
  ["--composition", "LottieBadge"],
  ["--composition", "AudioBars"],
  ["--spec", "specs/showcase.json"],
  ["--spec", "specs/persian.json"],
  ["--spec", "specs/simple.txt"],
];
for (const args of jobs) {
  execFileSync("node", ["scripts/make.mjs", ...args], { stdio: "inherit" });
}

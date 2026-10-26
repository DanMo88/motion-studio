// Parses a spec file: JSON (full control) or a simple one-scene-per-line text format.
import { readFileSync } from "node:fs";

const parseLine = (line) => {
  const m = line.match(/^\s*(\w+)\s*:\s*(.*)$/);
  if (!m) throw new Error(`Cannot parse line: "${line}" (expected "<type>: <text>")`);
  const [, type, rest] = m;
  const parts = rest.split("|").map((s) => s.trim()).filter(Boolean);
  switch (type) {
    case "title":
      return { type, title: parts[0], subtitle: parts[1], duration: 3 };
    case "physics":
      return { type, items: parts, duration: 4 };
    case "logo3d":
      return { type, label: parts[0], duration: 3.5 };
    case "badge":
      return { type, text: parts[0], duration: 2.5 };
    case "audio":
      return { type, title: parts[0], duration: 5 };
    case "chart": {
      // chart: Title | A=10, B=20, C=30
      const data = (parts[1] ?? "").split(",").map((kv) => {
        const [label, value] = kv.split("=").map((s) => s.trim());
        return { label, value: Number(value) };
      });
      return { type, title: parts[0], data, duration: 3.5 };
    }
    default:
      throw new Error(`Unknown scene type "${type}". Use: title, physics, logo3d, chart, badge, audio`);
  }
};

export const loadSpec = (file) => {
  const raw = readFileSync(file, "utf8");
  if (file.endsWith(".json")) return JSON.parse(raw);
  const scenes = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"))
    .map(parseLine);
  return { scenes, music: "demo-beat.mp3" };
};

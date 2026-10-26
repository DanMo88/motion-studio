import { spring as motionSpring, mix } from "motion";
import { eases } from "animejs";

/**
 * Frame-accurate helpers. Remotion renders every frame independently, so every
 * animation library is used in "seek" / pure-function mode: we ask it for the
 * value at time t instead of letting it run on requestAnimationFrame.
 */

/** Motion (motion.dev) physical spring sampled at a frame. Returns ~0 → 1. */
export const springAt = (
  frame: number,
  fps: number,
  opts: { stiffness?: number; damping?: number; mass?: number } = {},
) => {
  if (frame <= 0) return 0;
  const gen = motionSpring({ keyframes: [0, 1], stiffness: 140, damping: 14, mass: 1, ...opts });
  return gen.next((frame / fps) * 1000).value as number;
};

/** anime.js easing functions, exposed by name (e.g. "outElastic", "inOutExpo"). */
export const ease = (name: string, t: number): number => {
  const clamped = Math.min(1, Math.max(0, t));
  const e = (eases as Record<string, unknown>)[name];
  if (typeof e !== "function") return clamped;
  const out = (e as (x: number) => number | ((x: number) => number))(clamped);
  // Parametric eases (outElastic, outBack...) return a function when called with params.
  if (typeof out === "function") return out(clamped);
  return out;
};

export const lerp = (a: number, b: number, t: number) => mix(a, b, t);

/** Progress 0..1 of `frame` inside [start, start+duration]. */
export const progress = (frame: number, start: number, duration: number) =>
  Math.min(1, Math.max(0, (frame - start) / duration));

import {Easing, interpolate, spring} from 'remotion';

/* Graph-editor style curves (cubic-bezier equivalents of AE presets). */
export const E = {
  expoOut: Easing.bezier(0.16, 1, 0.3, 1),
  quintOut: Easing.bezier(0.22, 1, 0.36, 1),
  quintInOut: Easing.bezier(0.83, 0, 0.17, 1),
  cubicInOut: Easing.bezier(0.65, 0, 0.35, 1),
  // anticipation: dips below 0 before accelerating (pull-back then throw)
  anticip: Easing.bezier(0.36, -0.35, 0.3, 1),
  // overshoot then settle
  backOut: Easing.bezier(0.34, 1.45, 0.64, 1),
  inQuad: Easing.bezier(0.55, 0.085, 0.68, 0.53),
  inExpo: Easing.bezier(0.7, 0, 0.84, 0),
  linear: Easing.linear,
};

/** progress 0..1 between frames a..b with easing */
export const p = (f: number, a: number, b: number, ease = E.expoOut) =>
  interpolate(f, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/** weighted spring with natural settle (no bouncy toy feel) */
export const sp = (frame: number, fps: number, delay = 0, cfg: {damping?: number; mass?: number; stiffness?: number} = {}) =>
  spring({frame: frame - delay, fps, config: {damping: 18, mass: 0.9, stiffness: 120, ...cfg}});

/** deterministic pseudo random from a seed */
export const rnd = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

/** fade in at start, fade out at end of a duration (frames) */
export const inOut = (f: number, dur: number, a = 10, b = 10) =>
  Math.min(p(f, 0, a, E.quintOut), 1 - p(f, dur - b, dur, E.cubicInOut));

export const fmt = (n: number, decimals = 0) =>
  n.toLocaleString('en-US', {minimumFractionDigits: decimals, maximumFractionDigits: decimals});

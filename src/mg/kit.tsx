import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {C, F} from '../theme';
import {E, p, sp} from '../lib/anim';
import {PaperBG, Vignette, gradeFilter} from '../components/Look';
import {MaskLine, TypeOn} from '../components/Type';

export type MG = {dur: number; shot?: any; [k: string]: any};

/** 2.5D camera rig: wraps a layer in perspective and moves it along an eased path. */
export const Rig: React.FC<{
  children: React.ReactNode;
  keys: Array<{f: number; rx?: number; ry?: number; z?: number; x?: number; y?: number; s?: number}>;
  persp?: number;
  ease?: (t: number) => number;
}> = ({children, keys, persp = 1800, ease = E.quintInOut}) => {
  const f = useCurrentFrame();
  const fr = keys.map((k) => k.f);
  const g = (prop: keyof (typeof keys)[0], d: number) =>
    interpolate(f, fr, keys.map((k) => (k[prop] as number) ?? d), {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  return (
    <AbsoluteFill style={{perspective: persp, perspectiveOrigin: '50% 45%'}}>
      <AbsoluteFill
        style={{
          transformStyle: 'preserve-3d',
          transform: `translate3d(${g('x', 0)}px, ${g('y', 0)}px, ${g('z', 0)}px) rotateX(${g('rx', 0)}deg) rotateY(${g('ry', 0)}deg) scale(${g('s', 1)})`,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Section label in mono with leading rule */
export const Eyebrow: React.FC<{text: string; delay?: number; color?: string; style?: React.CSSProperties}> = ({
  text,
  delay = 0,
  color = C.cobalt,
  style,
}) => {
  const f = useCurrentFrame();
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: 16, ...style}}>
      <div style={{width: 46, height: 3, background: color, transform: `scaleX(${p(f, delay, delay + 18)})`, transformOrigin: 'left'}} />
      <TypeOn text={text} delay={delay + 4} cps={2.4} style={{fontSize: 22, letterSpacing: '0.28em', color}} />
    </div>
  );
};

export const Headline: React.FC<{text: string; delay?: number; size?: number; color?: string; serif?: boolean; style?: React.CSSProperties}> = ({
  text,
  delay = 0,
  size = 84,
  color = C.ink,
  serif = false,
  style,
}) => (
  <MaskLine delay={delay} dur={26}>
    <div
      style={{
        fontFamily: serif ? F.serif : F.display,
        fontWeight: serif ? 400 : 800,
        fontSize: size,
        color,
        lineHeight: 1,
        letterSpacing: serif ? '-0.01em' : '-0.025em',
        ...style,
      }}
    >
      {text}
    </div>
  </MaskLine>
);

export const Source: React.FC<{text: string; delay?: number; dark?: boolean}> = ({text, delay = 20, dark = false}) => {
  const f = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        left: 110,
        bottom: 56,
        fontFamily: F.mono,
        fontSize: 18,
        letterSpacing: '0.08em',
        color: dark ? C.grey : '#6B7685',
        opacity: p(f, delay, delay + 14),
      }}
    >
      SOURCE · {text.toUpperCase()}
    </div>
  );
};

/** Paper document card with soft shadow (generic editorial document, not an official form) */
export const Paper: React.FC<{w: number; h: number; style?: React.CSSProperties; children?: React.ReactNode; tone?: string}> = ({
  w,
  h,
  style,
  children,
  tone = C.paper,
}) => (
  <div
    style={{
      position: 'absolute',
      width: w,
      height: h,
      background: tone,
      boxShadow: '0 2px 0 rgba(0,0,0,0.04), 0 30px 60px rgba(10,20,40,0.28), 0 8px 18px rgba(10,20,40,0.18)',
      overflow: 'hidden',
      ...style,
    }}
  >
    {children}
  </div>
);

/** Text lines placeholder for document body — rendered as fine grey rules (no fake legal text) */
export const DocLines: React.FC<{n: number; w: number; gap?: number; seed?: number; color?: string}> = ({n, w, gap = 22, seed = 1, color = '#D5DAE1'}) => (
  <div>
    {Array.from({length: n}).map((_, i) => {
      const ww = w * (0.55 + 0.45 * Math.abs(Math.sin(seed * 7 + i * 1.7)));
      return <div key={i} style={{height: 8, width: i % 6 === 5 ? ww * 0.5 : ww, background: color, borderRadius: 4, marginBottom: gap - 8}} />;
    })}
  </div>
);

/** Rubber stamp slam with anticipation + overshoot */
export const Stamp: React.FC<{text: string; delay: number; color?: string; rot?: number; size?: number; style?: React.CSSProperties}> = ({
  text,
  delay,
  color = C.red,
  rot = -8,
  size = 64,
  style,
}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = sp(f, fps, delay, {damping: 11, stiffness: 220, mass: 0.7});
  const vis = f >= delay;
  return (
    <div
      style={{
        position: 'absolute',
        opacity: vis ? Math.min(1, s * 2) : 0,
        transform: `rotate(${rot}deg) scale(${2.2 - 1.2 * s})`,
        border: `6px solid ${color}`,
        color,
        fontFamily: F.display,
        fontWeight: 900,
        fontSize: size,
        letterSpacing: '0.08em',
        padding: '8px 26px',
        borderRadius: 10,
        mixBlendMode: 'multiply',
        ...style,
      }}
    >
      {text}
    </div>
  );
};

/** Horizontal bar with label + counter */
export const BarH: React.FC<{
  value: number;
  max: number;
  width: number;
  delay: number;
  color: string;
  label: string;
  display: string;
  height?: number;
  dark?: boolean;
}> = ({value, max, width, delay, color, label, display, height = 64, dark = false}) => {
  const f = useCurrentFrame();
  const t = p(f, delay, delay + 34, E.expoOut);
  return (
    <div style={{marginBottom: 28}}>
      <div style={{fontFamily: F.mono, fontSize: 22, letterSpacing: '0.14em', color: dark ? C.grey : '#5B6675', marginBottom: 10, opacity: p(f, delay - 4, delay + 8)}}>{label}</div>
      <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
        <div style={{width: (value / max) * width * t, height, background: color, borderRadius: 3}} />
        <div style={{fontFamily: F.display, fontWeight: 800, fontSize: height * 0.9, color: dark ? C.white : C.ink, opacity: p(f, delay + 8, delay + 20), fontVariantNumeric: 'tabular-nums'}}>
          {display}
        </div>
      </div>
    </div>
  );
};

/** A video plate used inside graphics (e.g. inside a phone, a postcard) */
export const Plate: React.FC<{src?: string; img?: string; style?: React.CSSProperties; look?: string}> = ({src, img, style, look}) => (
  <AbsoluteFill style={{overflow: 'hidden', ...style}}>
    {src ? (
      <OffthreadVideo src={staticFile(src)} muted style={{width: '100%', height: '100%', objectFit: 'cover', filter: gradeFilter(look)}} />
    ) : img ? (
      <Img src={staticFile(img)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: gradeFilter(look)}} />
    ) : null}
  </AbsoluteFill>
);

export const Stage: React.FC<{tone?: 'white' | 'ink' | 'midnight'; children: React.ReactNode; grid?: boolean; vignette?: boolean}> = ({
  tone = 'white',
  children,
  grid = true,
  vignette = true,
}) => (
  <AbsoluteFill>
    <PaperBG tone={tone} grid={grid} />
    {children}
    {vignette ? <Vignette strength={tone === 'white' ? 0.18 : 0.5} /> : null}
  </AbsoluteFill>
);

/** Simple person glyph (used in waffles / pipelines) */
export const PersonGlyph: React.FC<{size: number; color: string; style?: React.CSSProperties}> = ({size, color, style}) => (
  <svg width={size} height={size * 1.3} viewBox="0 0 20 26" style={style}>
    <circle cx="10" cy="6" r="5" fill={color} />
    <path d="M1 26 C1 16 4 13 10 13 C16 13 19 16 19 26 Z" fill={color} />
  </svg>
);

export const exitFade = (f: number, dur: number, len = 10) => 1 - p(f, dur - len, dur, E.cubicInOut);

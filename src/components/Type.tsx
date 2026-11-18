import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';
import {E, p, fmt} from '../lib/anim';
import {F} from '../theme';

/** Single line masked reveal: text rises from below a hard mask edge. */
export const MaskLine: React.FC<{
  children: React.ReactNode;
  delay?: number;
  dur?: number;
  style?: React.CSSProperties;
  from?: 'below' | 'above' | 'left';
  out?: number; // frame at which it exits (optional)
}> = ({children, delay = 0, dur = 22, style, from = 'below', out}) => {
  const f = useCurrentFrame();
  const t = p(f, delay, delay + dur, E.expoOut);
  const o = out !== undefined ? p(f, out, out + 14, E.inExpo) : 0;
  const off = (1 - t) * 105 + o * -105;
  const tr = from === 'left' ? `translateX(${-(1 - t) * 105}%)` : `translateY(${from === 'above' ? -off : off}%)`;
  return (
    <div style={{overflow: 'hidden', display: 'block', paddingBottom: '0.06em', ...style}}>
      <div style={{transform: tr, willChange: 'transform'}}>{children}</div>
    </div>
  );
};

/** Word-by-word kinetic reveal with tracking settle and soft focus pull. */
export const Words: React.FC<{
  text: string;
  delay?: number;
  stagger?: number;
  style?: React.CSSProperties;
  wordStyle?: (i: number, w: string) => React.CSSProperties;
  dur?: number;
}> = ({text, delay = 0, stagger = 3, style, wordStyle, dur = 20}) => {
  const f = useCurrentFrame();
  const words = text.split(' ');
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', columnGap: '0.26em', ...style}}>
      {words.map((w, i) => {
        const t = p(f, delay + i * stagger, delay + i * stagger + dur, E.expoOut);
        return (
          <span key={i} style={{overflow: 'hidden', display: 'inline-block', paddingBottom: '0.08em'}}>
            <span
              style={{
                display: 'inline-block',
                transform: `translateY(${(1 - t) * 100}%) rotate(${(1 - t) * 4}deg)`,
                transformOrigin: 'left bottom',
                filter: `blur(${(1 - t) * 6}px)`,
                ...(wordStyle ? wordStyle(i, w) : {}),
              }}
            >
              {w}
            </span>
          </span>
        );
      })}
    </div>
  );
};

/** Character cascade for mono labels (technical typing feel, no cursor gimmick). */
export const TypeOn: React.FC<{text: string; delay?: number; cps?: number; style?: React.CSSProperties}> = ({
  text,
  delay = 0,
  cps = 1.4,
  style,
}) => {
  const f = useCurrentFrame();
  const n = Math.max(0, Math.floor((f - delay) * cps));
  return (
    <span style={{fontFamily: F.mono, whiteSpace: 'pre', ...style}}>
      {text.slice(0, n)}
      <span style={{opacity: 0}}>{text.slice(n)}</span>
    </span>
  );
};

/** Rolling numeric counter with tabular figures. */
export const Counter: React.FC<{
  to: number;
  from?: number;
  delay?: number;
  dur?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  style?: React.CSSProperties;
}> = ({to, from = 0, delay = 0, dur = 40, decimals = 0, prefix = '', suffix = '', style}) => {
  const f = useCurrentFrame();
  const t = p(f, delay, delay + dur, E.quintOut);
  const v = interpolate(t, [0, 1], [from, to]);
  return (
    <span style={{fontVariantNumeric: 'tabular-nums', ...style}}>
      {prefix}
      {fmt(v, decimals)}
      {suffix}
    </span>
  );
};

/** Parse a display value like "226,000+" / "14.3%" / "−15,405" into counter parts. */
export const parseStat = (v: string) => {
  const m = v.match(/^([^0-9]*)([0-9][0-9,]*\.?[0-9]*)(.*)$/);
  if (!m) return null;
  const num = parseFloat(m[2].replace(/,/g, ''));
  const decimals = m[2].includes('.') ? m[2].split('.')[1].length : 0;
  return {pre: m[1], num, decimals, post: m[3]};
};

/** Highlighter sweep behind text (research-note yellow). */
export const Highlight: React.FC<{
  children: React.ReactNode;
  delay?: number;
  dur?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({children, delay = 0, dur = 18, color = 'rgba(245,232,172,0.95)', style}) => {
  const f = useCurrentFrame();
  const t = p(f, delay, delay + dur, E.cubicInOut);
  return (
    <span
      style={{
        backgroundImage: `linear-gradient(${color}, ${color})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${t * 100}% 88%`,
        backgroundPosition: '0 70%',
        boxDecorationBreak: 'clone',
        WebkitBoxDecorationBreak: 'clone',
        padding: '0 0.08em',
        ...style,
      }}
    >
      {children}
    </span>
  );
};

/** Animated rule line */
export const Rule: React.FC<{delay?: number; dur?: number; color: string; width: number | string; height?: number; style?: React.CSSProperties}> = ({
  delay = 0,
  dur = 24,
  color,
  width,
  height = 2,
  style,
}) => {
  const f = useCurrentFrame();
  const t = p(f, delay, delay + dur, E.quintOut);
  return <div style={{width, height, background: color, transform: `scaleX(${t})`, transformOrigin: 'left', ...style}} />;
};

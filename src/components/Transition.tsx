import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C} from '../theme';
import {E, p} from '../lib/anim';

/**
 * Incoming-shot transition. The incoming shot starts `tin` frames before the cut
 * and is revealed over the outgoing one; by the cut frame it is fully on screen.
 */
export const TransitionIn: React.FC<{type: string; tin: number; children: React.ReactNode; dir?: number}> = ({
  type,
  tin,
  children,
  dir = 1,
}) => {
  const f = useCurrentFrame();
  if (!tin || type === 'cut') return <>{children}</>;
  const t = p(f, 0, tin, E.quintInOut);
  const done = f >= tin;
  if (done && type !== 'flash' && type !== 'burn') return <>{children}</>;
  switch (type) {
    case 'lightbar': {
      // horizontal light bar sweeps down, revealing the next image behind it
      const y = t * 1080;
      return (
        <AbsoluteFill>
          <AbsoluteFill style={{clipPath: `inset(0 0 ${1080 - y}px 0)`}}>{children}</AbsoluteFill>
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: y - 40,
              height: 80,
              background: 'linear-gradient(180deg, rgba(255,255,255,0), rgba(255,255,255,0.95) 50%, rgba(255,255,255,0))',
              filter: 'blur(6px)',
              opacity: 1 - p(f, tin - 4, tin),
            }}
          />
        </AbsoluteFill>
      );
    }
    case 'whip': {
      const x = (1 - t) * 1920 * dir;
      const v = Math.sin(t * Math.PI); // velocity proxy
      return (
        <AbsoluteFill style={{transform: `translateX(${x}px)`, filter: `blur(${v * 18}px)`}}>
          {children}
        </AbsoluteFill>
      );
    }
    case 'mask': {
      // rounded-rect aperture opens from centre (shape morph)
      const w = 6 + t * 94;
      const h = 3 + t * 97;
      const r = (1 - t) * 40;
      return (
        <AbsoluteFill style={{clipPath: `inset(${(100 - h) / 2}% ${(100 - w) / 2}% round ${r}px)`}}>
          <AbsoluteFill style={{transform: `scale(${1.15 - 0.15 * t})`}}>{children}</AbsoluteFill>
        </AbsoluteFill>
      );
    }
    case 'push': {
      const y = (1 - t) * 1080;
      return (
        <AbsoluteFill style={{transform: `translateY(${y}px)`, boxShadow: '0 -30px 60px rgba(0,0,0,0.4)'}}>{children}</AbsoluteFill>
      );
    }
    case 'zoom': {
      return (
        <AbsoluteFill style={{opacity: t, transform: `scale(${1.25 - 0.25 * t})`, filter: `blur(${(1 - t) * 14}px)`}}>
          {children}
        </AbsoluteFill>
      );
    }
    case 'dip': {
      const a = p(f, 0, tin / 2, E.cubicInOut);
      const b = p(f, tin / 2, tin, E.cubicInOut);
      return (
        <AbsoluteFill>
          <AbsoluteFill style={{opacity: b}}>{children}</AbsoluteFill>
          <AbsoluteFill style={{background: C.ink, opacity: a * (1 - b)}} />
        </AbsoluteFill>
      );
    }
    case 'flash': {
      // brief exposure flash peaking on the cut
      const peak = 1 - Math.abs(f - tin) / tin;
      return (
        <AbsoluteFill>
          <AbsoluteFill style={{opacity: f >= tin ? 1 : t}}>{children}</AbsoluteFill>
          <AbsoluteFill style={{background: '#FFFFFF', mixBlendMode: 'screen', opacity: Math.max(0, peak) * 0.85}} />
        </AbsoluteFill>
      );
    }
    case 'burn': {
      // film burn: warm leak blooms across the cut
      const peak = Math.max(0, 1 - Math.abs(f - tin) / (tin * 1.2));
      return (
        <AbsoluteFill>
          <AbsoluteFill style={{opacity: f >= tin ? 1 : t}}>{children}</AbsoluteFill>
          <AbsoluteFill
            style={{
              background: `radial-gradient(ellipse 60% 90% at ${20 + 60 * t}% 50%, rgba(255,214,150,0.95), rgba(222,129,118,0.55) 40%, rgba(0,0,0,0) 75%)`,
              mixBlendMode: 'screen',
              opacity: peak,
            }}
          />
        </AbsoluteFill>
      );
    }
    default:
      return <AbsoluteFill style={{opacity: t}}>{children}</AbsoluteFill>;
  }
};

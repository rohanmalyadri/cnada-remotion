import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {C} from '../theme';
import {rnd} from '../lib/anim';

/** Film grain from pre-rendered noise tiles, offset each frame (cheap + organic). */
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.07}) => {
  const f = useCurrentFrame();
  const i = f % 4;
  const x = Math.floor(rnd(f) * 256);
  const y = Math.floor(rnd(f + 99) * 256);
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url(${staticFile(`look/grain_${i}.png`)})`,
        backgroundPosition: `${x}px ${y}px`,
        opacity,
        mixBlendMode: 'overlay',
        pointerEvents: 'none',
      }}
    />
  );
};

export const Vignette: React.FC<{strength?: number}> = ({strength = 0.45}) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 75% 70% at 50% 50%, rgba(0,0,0,0) 55%, rgba(10,14,22,${strength}) 100%)`,
      pointerEvents: 'none',
    }}
  />
);

/** Documentary grade: cool shadows, neutral skin, gentle contrast. */
export const Grade: React.FC<{mode?: 'natural' | 'dark' | 'cool' | 'warm' | 'archive'}> = ({mode = 'natural'}) => {
  const shadow =
    mode === 'dark'
      ? 'linear-gradient(180deg, rgba(20,43,73,0.35), rgba(23,28,36,0.55))'
      : mode === 'cool'
        ? 'linear-gradient(180deg, rgba(53,108,246,0.10), rgba(20,43,73,0.22))'
        : mode === 'warm'
          ? 'linear-gradient(180deg, rgba(245,232,172,0.06), rgba(20,43,73,0.12))'
          : mode === 'archive'
            ? 'linear-gradient(180deg, rgba(245,232,172,0.10), rgba(23,28,36,0.25))'
            : 'linear-gradient(180deg, rgba(20,43,73,0.04), rgba(20,43,73,0.16))';
  return <AbsoluteFill style={{background: shadow, mixBlendMode: 'soft-light', pointerEvents: 'none'}} />;
};

export const gradeFilter = (mode?: string) =>
  mode === 'dark'
    ? 'contrast(1.08) saturate(0.78) brightness(0.72)'
    : mode === 'archive'
      ? 'grayscale(1) contrast(1.12) brightness(0.98) sepia(0.12)'
      : mode === 'cool'
        ? 'contrast(1.06) saturate(0.88) brightness(0.96)'
        : 'contrast(1.05) saturate(0.93)';

/** Subtle grid paper used in editorial white compositions */
export const PaperBG: React.FC<{tone?: 'white' | 'ink' | 'midnight'; grid?: boolean}> = ({tone = 'white', grid = true}) => {
  const bg =
    tone === 'white'
      ? `radial-gradient(ellipse 90% 80% at 50% 40%, #FFFFFF 0%, ${C.white} 55%, #E9EDF2 100%)`
      : tone === 'ink'
        ? `radial-gradient(ellipse 80% 80% at 50% 35%, #222B38 0%, ${C.ink} 60%, #0E1116 100%)`
        : `radial-gradient(ellipse 80% 80% at 50% 30%, #1E3C64 0%, ${C.midnight} 55%, #0B1830 100%)`;
  const line = tone === 'white' ? 'rgba(20,43,73,0.055)' : 'rgba(220,226,234,0.05)';
  return (
    <AbsoluteFill style={{background: bg}}>
      {grid ? (
        <AbsoluteFill
          style={{
            backgroundImage: `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
            backgroundPosition: '-1px -1px',
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

export const StillImg: React.FC<{src: string; style?: React.CSSProperties}> = ({src, style}) => (
  <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover', ...style}} />
);

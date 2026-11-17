import React from 'react';
import {AbsoluteFill, Img, OffthreadVideo, staticFile, useCurrentFrame, interpolate} from 'remotion';
import {C} from '../theme';
import {E, p, rnd} from '../lib/anim';
import {Grade, Vignette, gradeFilter} from './Look';
import {Overlay, ChapterOverlayFrame} from './Overlays';
import {PaperBG} from './Look';

export type Shot = Record<string, any>;

/** Deterministic camera move per shot so no two clips move identically. */
const camera = (seed: number, f: number, dur: number) => {
  const r = rnd(seed);
  const t = interpolate(f, [0, dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: E.cubicInOut});
  const kind = Math.floor(r * 5);
  const amp = 0.035 + rnd(seed + 3) * 0.035;
  switch (kind) {
    case 0: // push in
      return {s: 1.04 + amp * t, x: 0, y: 0};
    case 1: // pull out
      return {s: 1.04 + amp * (1 - t), x: 0, y: 0};
    case 2: // drift right
      return {s: 1.07, x: (t - 0.5) * 40, y: 0};
    case 3: // drift left + slight rise
      return {s: 1.07, x: (0.5 - t) * 40, y: (0.5 - t) * 10};
    default: // rise
      return {s: 1.06 + amp * 0.5 * t, x: 0, y: (0.5 - t) * 24};
  }
};

export const StockShot: React.FC<{shot: Shot}> = ({shot}) => {
  const f = useCurrentFrame();
  const dur = shot.to - shot.from + (shot.tin || 0);
  const cam = camera(shot.seed || 1, f, dur);
  const isChapter = shot.ov && shot.ov.t === 'chapter';
  let frameStyle: React.CSSProperties = {};
  let chapterT = 1;
  if (isChapter) {
    const c = ChapterOverlayFrame(f, dur);
    chapterT = c.t;
    frameStyle = {
      transform: `scale(${c.scale}) rotate(${c.rot}deg)`,
      boxShadow: `0 ${40 * (1 - c.t)}px ${90 * (1 - c.t)}px rgba(0,0,0,${0.5 * (1 - c.t)})`,
      outline: `${Math.round(26 * (1 - c.t))}px solid ${C.white}`,
    };
  }
  const look = shot.look || (shot.ov && ['question', 'qcard', 'kicker'].includes(shot.ov.t) ? 'dark' : 'natural');
  return (
    <AbsoluteFill style={{background: C.ink}}>
      {isChapter ? <PaperBG tone="ink" grid={false} /> : null}
      <AbsoluteFill style={frameStyle}>
        <AbsoluteFill style={{overflow: 'hidden'}}>
          <AbsoluteFill style={{transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.s})`}}>
            {shot.clip ? (
              <OffthreadVideo
                src={staticFile(shot.clip)}
                muted
                style={{width: '100%', height: '100%', objectFit: 'cover', filter: gradeFilter(look)}}
              />
            ) : (
              <AbsoluteFill style={{background: C.midnight}} />
            )}
          </AbsoluteFill>
          <Grade mode={look} />
          <Vignette strength={isChapter ? 0.6 * chapterT : 0.42} />
        </AbsoluteFill>
      </AbsoluteFill>
      <Overlay ov={shot.ov} dur={dur} />
    </AbsoluteFill>
  );
};

/** Real photographs: Ken-Burns with a blurred-fill depth layer when aspect differs. */
export const PhotoShot: React.FC<{shot: Shot}> = ({shot}) => {
  const f = useCurrentFrame();
  const dur = shot.to - shot.from + (shot.tin || 0);
  const t = p(f, 0, dur, E.cubicInOut);
  const mode = shot.mode || 'kenburns';
  const src = staticFile(shot.imgFile);
  const portrait = (shot.imgAspect || 1.6) < 1.3;
  const filter = mode === 'archive' ? gradeFilter('archive') : mode === 'dark' ? gradeFilter('dark') : 'contrast(1.04) saturate(0.95)';
  const r = rnd(shot.seed || 2);
  const dir = r > 0.5 ? 1 : -1;
  return (
    <AbsoluteFill style={{background: C.ink, overflow: 'hidden'}}>
      {portrait ? (
        <>
          <AbsoluteFill style={{transform: `scale(1.25)`, filter: `blur(40px) brightness(0.45) saturate(0.7)`}}>
            <Img src={src} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          </AbsoluteFill>
          <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
            <div
              style={{
                height: 900,
                transform: `translateX(${(dir * 260) + (t - 0.5) * 30 * dir}px) scale(${1 + 0.05 * t}) perspective(1600px) rotateY(${dir * -4 + t * dir * 2}deg)`,
                boxShadow: '0 50px 100px rgba(0,0,0,0.55)',
                outline: `14px solid ${C.white}`,
              }}
            >
              <Img src={src} style={{height: '100%', filter}} />
            </div>
          </AbsoluteFill>
        </>
      ) : (
        <AbsoluteFill style={{transform: `scale(${1.08 + 0.08 * t}) translate(${dir * (t - 0.5) * 30}px, ${(0.5 - t) * 12}px)`}}>
          <Img src={src} style={{width: '100%', height: '100%', objectFit: 'cover', filter}} />
        </AbsoluteFill>
      )}
      <Grade mode={mode === 'archive' ? 'archive' : mode === 'dark' ? 'dark' : 'natural'} />
      <Vignette strength={0.5} />
      {shot.credit ? (
        <div
          style={{
            position: 'absolute',
            right: 40,
            bottom: 26,
            fontFamily: '"IBM Plex Mono", monospace',
            fontSize: 15,
            color: 'rgba(247,248,250,0.62)',
            letterSpacing: '0.06em',
            opacity: p(f, 10, 24),
          }}
        >
          {shot.credit}
        </div>
      ) : null}
      <Overlay ov={shot.ov} dur={dur} />
    </AbsoluteFill>
  );
};

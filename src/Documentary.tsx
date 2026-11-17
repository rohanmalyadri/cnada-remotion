import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import timeline from './data/timeline.json';
import {C, ensureFonts} from './theme';
import {StockShot, PhotoShot, Shot} from './components/Shots';
import {TransitionIn} from './components/Transition';
import {Grain} from './components/Look';
import {REGISTRY} from './mg';

export const ShotView: React.FC<{shot: Shot}> = ({shot}) => {
  const dur = shot.to - shot.from + (shot.tin || 0);
  if (shot.kind === 'stock') return <StockShot shot={shot} />;
  if (shot.kind === 'photo' && !shot.comp) return <PhotoShot shot={shot} />;
  const Comp = REGISTRY[shot.comp];
  if (!Comp) return <AbsoluteFill style={{background: C.ink}} />;
  return <Comp dur={dur} shot={shot} {...(shot.props || {})} />;
};

export const Documentary: React.FC<{from?: number; to?: number}> = ({from = 0, to = 1e9}) => {
  ensureFonts();
  const shots = (timeline as Shot[]).filter((s) => s.to > from && s.from - (s.tin || 0) < to);
  return (
    <AbsoluteFill style={{background: C.ink}}>
      {shots.map((s) => {
        const start = s.from - (s.tin || 0);
        return (
          <Sequence key={s.id} from={start} durationInFrames={s.to - start} name={`${s.id} ${s.comp || s.kind}`} premountFor={30}>
            <TransitionIn type={s.trans || 'cut'} tin={s.tin || 0} dir={s.seed % 2 ? 1 : -1}>
              <ShotView shot={s} />
            </TransitionIn>
          </Sequence>
        );
      })}
      <Grain opacity={0.06} />
    </AbsoluteFill>
  );
};

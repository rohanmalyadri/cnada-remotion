import React from 'react';
import {Composition} from 'remotion';
import {Documentary, ShotView} from './Documentary';
import timeline from './data/timeline.json';
import {ensureFonts} from './theme';

const TOTAL = 34935; // 1164.48 s × 30 fps — the narration is the master timeline

/** Single-shot preview composition for benchmarking individual sequences. */
const ShotPreview: React.FC<{id: string}> = ({id}) => {
  ensureFonts();
  const s = (timeline as any[]).find((x) => x.id === id) || (timeline as any[])[0];
  return <ShotView shot={{...s, tin: 0}} />;
};

export const RemotionRoot = () => (
  <>
    <Composition id="Documentary" component={Documentary} durationInFrames={TOTAL} fps={30} width={1920} height={1080} defaultProps={{}} />
    <Composition
      id="Shot"
      component={ShotPreview}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{id: 'S000'}}
      calculateMetadata={({props}) => {
        const s = (timeline as any[]).find((x) => x.id === (props as any).id);
        return {durationInFrames: s ? s.to - s.from : 300};
      }}
    />
  </>
);

import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate} from 'remotion';
import {C, F} from '../theme';
import {E, p, lerp} from '../lib/anim';
import {MaskLine, TypeOn, Words, Counter} from '../components/Type';
import {Stage, Eyebrow, MG, Source} from './kit';
import docs from '../data/docs.json';

type Doc = {img: string; w: number; h: number; boxes: Record<string, number[][]>};

/**
 * Genuine source document on screen: the captured page arrives in perspective,
 * the camera travels to the key sentence, a research-note highlighter sweeps it,
 * and the key figure is extracted into the editorial layer.
 */
export const DocShot: React.FC<{
  dur: number;
  doc: string;
  marks: string[];
  focus?: string;
  callout?: React.ReactNode;
  eyebrow: string;
  source: string;
  side?: 'left' | 'right';
  zoom?: number;
  clipBottom?: number;
}> = ({dur, doc, marks, focus, callout, eyebrow, source, side = 'right', zoom = 1.55, clipBottom = 0}) => {
  const f = useCurrentFrame();
  const d = (docs as Record<string, Doc>)[doc];
  // page drawn at 1440 css px wide -> scale to fit 1100px tall column
  const k = 1000 / d.h;
  const pw = d.w * k;
  const fr = d.boxes[focus || marks[0]]?.[0] || [d.w / 2, d.h / 2, 10, 10];
  const fx = (fr[0] + fr[2] / 2) * k;
  const fy = (fr[1] + fr[3] / 2) * k;
  const arrive = p(f, 0, 34, E.expoOut);
  const travel = p(f, 26, 70, E.quintInOut);
  const pageX = side === 'right' ? 880 : 100;
  const s = lerp(1, zoom, travel);
  // keep the highlighted sentence in the open half of the frame
  const targetX = side === 'right' ? 1290 : 640;
  const tx = lerp(0, targetX - (pageX + fx), travel);
  const ty = lerp(0, 560 - (40 + fy), travel);
  const exit = p(f, dur - 12, dur, E.inExpo);
  return (
    <Stage tone="ink" grid={false}>
      <AbsoluteFill style={{perspective: 2400}}>
        <div
          style={{
            position: 'absolute',
            left: pageX,
            top: 40,
            width: pw,
            height: 1000,
            transformOrigin: `${fx}px ${fy}px`,
            transform: `translate(${tx}px, ${ty + (1 - arrive) * 500}px) rotateX(${(1 - arrive) * 35 + (1 - travel) * 6}deg) rotateY(${side === 'right' ? -10 + travel * 8 : 10 - travel * 8}deg) scale(${s})`,
            boxShadow: '0 60px 120px rgba(0,0,0,0.6)',
            opacity: 1 - exit,
            clipPath: clipBottom ? `inset(0 0 ${clipBottom}% 0)` : undefined,
          }}
        >
          <Img src={staticFile(d.img)} style={{width: pw, height: 1000, display: 'block'}} />
          {marks.map((m, mi) =>
            (d.boxes[m] || []).map((r, ri) => {
              const t = p(f, 60 + mi * 16 + ri * 6, 80 + mi * 16 + ri * 6, E.cubicInOut);
              return (
                <div
                  key={`${mi}-${ri}`}
                  style={{
                    position: 'absolute',
                    left: r[0] * k - 3,
                    top: r[1] * k - 2,
                    width: (r[2] * k + 6) * t,
                    height: r[3] * k + 4,
                    background: 'rgba(245,232,172,0.85)',
                    mixBlendMode: 'multiply',
                  }}
                />
              );
            }),
          )}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: side === 'right' ? 'linear-gradient(90deg, rgba(23,28,36,0.97) 0%, rgba(23,28,36,0.92) 40%, rgba(23,28,36,0) 60%)' : 'linear-gradient(270deg, rgba(23,28,36,0.97) 0%, rgba(23,28,36,0.92) 40%, rgba(23,28,36,0) 60%)'}} />
      <div style={{position: 'absolute', [side === 'right' ? 'left' : 'right']: 110, top: 260, width: 640, opacity: 1 - exit}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
          <div style={{width: 12, height: 12, background: C.note}} />
          <TypeOn text={eyebrow} delay={8} cps={2.4} style={{fontSize: 22, letterSpacing: '0.24em', color: C.note}} />
        </div>
        <div style={{marginTop: 28}}>{callout}</div>
      </div>
      <Source text={source} delay={24} dark />
    </Stage>
  );
};

export const GovAnnouncement: React.FC<MG> = ({dur}) => (
  <DocShot
    dur={dur}
    doc="ircc_top"
    marks={['380,000 permanent resident admissions for each of the next three years', '370,000 new temporary resident arrivals']}
    eyebrow="GOVERNMENT OF CANADA · 5 NOV 2026"
    zoom={1.25}
    source="IRCC backgrounder, canada.ca, 2026-11-05"
    callout={
      <>
        <MaskLine delay={12}>
          <div style={{fontFamily: F.serif, fontSize: 76, color: C.white, lineHeight: 1.02}}>A major announcement</div>
        </MaskLine>
        <div style={{marginTop: 18}}>
          <Words text="The 2027–2029 Immigration Levels Plan, tabled with Budget 2026." delay={22} stagger={1.6} style={{fontFamily: F.display, fontWeight: 500, fontSize: 36, color: C.silver, lineHeight: 1.2}} />
        </div>
      </>
    }
  />
);

export const HousingStudy: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  return (
    <DocShot
      dur={dur}
      doc="housing_finding"
      marks={['was associated with 11% of the rise in both median house values']}
      eyebrow="GOVERNMENT OF CANADA STUDY · 2025"
      zoom={1.7}
      source="IRCC / Statistics Canada research, ‘Immigration and housing prices across municipalities in Canada’ (2025)"
      callout={
        <>
          <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 220, color: C.note, lineHeight: 0.85, letterSpacing: '-0.04em'}}>
            <Counter to={11} delay={70} dur={30} suffix="%" />
          </div>
          <div style={{marginTop: 20}}>
            <Words text="of the rise in median house values and rents, 2006–2021, was associated with new immigration." delay={78} stagger={1.3} style={{fontFamily: F.serif, fontSize: 44, color: C.white, lineHeight: 1.12}} />
          </div>
          <div style={{marginTop: 24, fontFamily: F.mono, fontSize: 19, color: C.grey, letterSpacing: '0.06em', opacity: p(f, 110, 124)}}>
            AN ASSOCIATION ACROSS MUNICIPALITIES, NOT A SOLE CAUSE
          </div>
        </>
      }
    />
  );
};

export const ISDStat: React.FC<MG> = ({dur}) => (
  <DocShot
    dur={dur}
    doc="isd"
    marks={['1,350']}
    eyebrow="INSTITUTE FOR STRATEGIC DIALOGUE · 2025"
    side="left"
    zoom={1.6}
    clipBottom={22}
    source="ISD, ‘The rise of anti-South Asian hate in Canada’ (April 2025)"
    callout={
      <>
        <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 180, color: C.coral, lineHeight: 0.85, letterSpacing: '-0.04em'}}>
          +<Counter to={1350} delay={60} dur={34} />%
        </div>
        <div style={{marginTop: 20}}>
          <Words text="rise in X posts containing anti-South Asian slurs, 2023 → 2024." delay={66} stagger={1.4} style={{fontFamily: F.serif, fontSize: 46, color: C.white, lineHeight: 1.12}} />
        </div>
      </>
    }
  />
);

export const OfficialDoc: React.FC<MG> = ({dur}) => (
  <DocShot
    dur={dur}
    doc="ircc_200k"
    marks={['Time-limited measure to support people already in Canada', 'up to 200,000 people already living in Canada transition to permanent residence']}
    eyebrow="THE 5 NOVEMBER 2026 ANNOUNCEMENT"
    side="left"
    zoom={1.45}
    source="IRCC backgrounder, canada.ca, 2026-11-05"
    callout={
      <>
        <MaskLine delay={10}>
          <div style={{fontFamily: F.serif, fontSize: 80, color: C.white, lineHeight: 1}}>Back to the announcement.</div>
        </MaskLine>
        <div style={{marginTop: 18}}>
          <Words text="A time-limited measure — written into the official backgrounder." delay={20} stagger={1.5} style={{fontFamily: F.display, fontWeight: 500, fontSize: 36, color: C.silver, lineHeight: 1.2}} />
        </div>
      </>
    }
  />
);

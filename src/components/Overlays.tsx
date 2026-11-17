import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, F} from '../theme';
import {E, p, sp} from '../lib/anim';
import {Counter, MaskLine, Rule, TypeOn, Words, parseStat} from './Type';

type Ov = Record<string, any>;

const exitT = (f: number, dur: number) => p(f, dur - 12, dur, E.inExpo);

const Scrim: React.FC<{side?: 'left' | 'bottom' | 'full' | 'right'; strength?: number}> = ({side = 'left', strength = 0.72}) => {
  const bg =
    side === 'left'
      ? `linear-gradient(90deg, rgba(14,18,25,${strength}) 0%, rgba(14,18,25,${strength * 0.6}) 38%, rgba(14,18,25,0) 70%)`
      : side === 'right'
        ? `linear-gradient(270deg, rgba(14,18,25,${strength}) 0%, rgba(14,18,25,${strength * 0.6}) 38%, rgba(14,18,25,0) 70%)`
        : side === 'bottom'
          ? `linear-gradient(0deg, rgba(14,18,25,${strength}) 0%, rgba(14,18,25,${strength * 0.5}) 30%, rgba(14,18,25,0) 60%)`
          : `rgba(14,18,25,${strength * 0.7})`;
  const f = useCurrentFrame();
  return <AbsoluteFill style={{background: bg, opacity: p(f, 0, 14, E.quintOut)}} />;
};

/* LOCATION TAG — line draws, label rises, sub-label types on */
const Loc: React.FC<{ov: Ov; dur: number}> = ({ov, dur}) => {
  const f = useCurrentFrame();
  const x = exitT(f, dur);
  return (
    <AbsoluteFill style={{opacity: 1 - x}}>
      <Scrim side="bottom" strength={0.55} />
      <div style={{position: 'absolute', left: 110, bottom: 110}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, marginBottom: 14}}>
          <div style={{width: 12, height: 12, borderRadius: 6, background: C.cobalt, transform: `scale(${sp(f, 30, 2)})`}} />
          <Rule delay={4} dur={26} color={C.white} width={220} height={2} />
        </div>
        <MaskLine delay={8}>
          <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 76, letterSpacing: '0.02em', color: C.white, lineHeight: 1}}>{ov.text}</div>
        </MaskLine>
        {ov.sub ? (
          <div style={{marginTop: 12, color: C.silver, fontSize: 24, letterSpacing: '0.24em'}}>
            <TypeOn text={ov.sub} delay={18} cps={1.6} />
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

/* BIG STATISTIC — counter, label, source line */
const Stat: React.FC<{ov: Ov; dur: number}> = ({ov, dur}) => {
  const f = useCurrentFrame();
  const x = exitT(f, dur);
  const st = parseStat(String(ov.value));
  const col = ov.tone === 'coral' ? C.coral : ov.tone === 'note' ? C.note : C.white;
  const big = (
    <span style={{fontFamily: F.display, fontWeight: 800, fontSize: 168, letterSpacing: '-0.035em', color: col, lineHeight: 0.9}}>
      {ov.prefix ? <span style={{fontSize: 70, fontWeight: 600, letterSpacing: '0', marginRight: 10, verticalAlign: '0.9em'}}>{ov.prefix}</span> : null}
      {st ? (
        <>
          {st.pre}
          <Counter to={st.num} decimals={st.decimals} delay={6} dur={34} />
          {st.post}
        </>
      ) : (
        ov.value
      )}
      {ov.suffix ? <span style={{fontSize: 64, fontWeight: 600, marginLeft: 8}}>{ov.suffix}</span> : null}
    </span>
  );
  return (
    <AbsoluteFill style={{opacity: 1 - x}}>
      <Scrim side="left" strength={0.78} />
      <div style={{position: 'absolute', left: 110, top: 300, width: 900}}>
        <Rule delay={0} dur={22} color={col} width={90} height={6} style={{marginBottom: 34}} />
        <MaskLine delay={2} dur={26}>
          {big}
        </MaskLine>
        <div style={{marginTop: 26}}>
          <Words
            text={ov.label}
            delay={14}
            stagger={1.6}
            style={{fontFamily: F.display, fontWeight: 500, fontSize: 40, color: C.white, lineHeight: 1.18, maxWidth: 820}}
          />
        </div>
        {ov.source ? (
          <div style={{marginTop: 30, fontSize: 19, color: C.grey, letterSpacing: '0.08em', opacity: p(f, 30, 44)}}>
            <TypeOn text={'SOURCE · ' + ov.source.toUpperCase()} delay={30} cps={3} />
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

/* KICKER — editorial statement in serif with a display sub-line */
const Kicker: React.FC<{ov: Ov; dur: number}> = ({ov, dur}) => {
  const f = useCurrentFrame();
  const x = exitT(f, dur);
  return (
    <AbsoluteFill style={{opacity: 1 - x}}>
      <Scrim side="left" strength={0.74} />
      <div style={{position: 'absolute', left: 120, top: 360, width: 1100}}>
        <Words text={ov.text} delay={2} stagger={2.2} style={{fontFamily: F.serif, fontSize: 82, color: C.white, lineHeight: 1.04, letterSpacing: '-0.01em'}} />
        {ov.sub ? (
          <div style={{marginTop: 30, display: 'flex', gap: 22, alignItems: 'flex-start'}}>
            <Rule delay={14} dur={20} color={C.cobalt} width={6} height={56} style={{transformOrigin: 'top', transform: `scaleY(${p(f, 14, 34)})`}} />
            <Words text={ov.sub} delay={18} stagger={1.4} style={{fontFamily: F.display, fontWeight: 500, fontSize: 38, color: C.silver, lineHeight: 1.25, maxWidth: 940}} />
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

/* QUESTION — centred serif italic, quote marks scale in */
const Question: React.FC<{ov: Ov; dur: number}> = ({ov, dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const x = exitT(f, dur);
  return (
    <AbsoluteFill style={{opacity: 1 - x, justifyContent: 'center', alignItems: 'center'}}>
      <Scrim side="full" strength={0.85} />
      <div style={{width: 1400, textAlign: 'center', position: 'relative'}}>
        <div
          style={{
            fontFamily: F.serif,
            fontSize: 220,
            color: C.cobalt,
            lineHeight: 0.6,
            height: 90,
            transform: `scale(${sp(f, fps, 0, {damping: 14})})`,
          }}
        >
          “
        </div>
        <Words
          text={ov.text}
          delay={4}
          stagger={2.4}
          style={{justifyContent: 'center', fontFamily: F.serif, fontStyle: 'italic', fontSize: 88, color: C.white, lineHeight: 1.05}}
        />
        {ov.sub ? (
          <Words
            text={ov.sub}
            delay={16}
            stagger={2.2}
            style={{justifyContent: 'center', marginTop: 16, fontFamily: F.serif, fontSize: 64, color: C.silver, lineHeight: 1.1}}
          />
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

/* PROFILE — technical annotation brackets, mono type-on */
const Profile: React.FC<{ov: Ov; dur: number}> = ({ov, dur}) => {
  const f = useCurrentFrame();
  const x = exitT(f, dur);
  const h = p(f, 0, 18);
  return (
    <AbsoluteFill style={{opacity: 1 - x}}>
      <Scrim side="right" strength={0.6} />
      <div style={{position: 'absolute', right: 120, top: 330, width: 640}}>
        <div style={{position: 'absolute', left: -30, top: -26, width: 30, height: 30, borderLeft: `3px solid ${C.note}`, borderTop: `3px solid ${C.note}`, opacity: h}} />
        <div style={{position: 'absolute', right: -30, bottom: -26, width: 30, height: 30, borderRight: `3px solid ${C.note}`, borderBottom: `3px solid ${C.note}`, opacity: h}} />
        {ov.lines.map((l: string, i: number) => (
          <div key={i} style={{fontSize: i === 0 ? 64 : 30, fontFamily: i === 0 ? F.display : F.mono, fontWeight: i === 0 ? 800 : 500, color: i === 0 ? C.note : C.white, letterSpacing: i === 0 ? '0.02em' : '0.12em', marginBottom: 14}}>
            {i === 0 ? <MaskLine delay={2}>{l}</MaskLine> : <TypeOn text={l} delay={10 + i * 12} cps={1.8} />}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* CHIPS — priority categories pop in sequence */
const Chips: React.FC<{ov: Ov; dur: number}> = ({ov, dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const x = exitT(f, dur);
  return (
    <AbsoluteFill style={{opacity: 1 - x}}>
      <Scrim side="bottom" strength={0.75} />
      <div style={{position: 'absolute', left: 110, bottom: 120, right: 110}}>
        <div style={{fontFamily: F.mono, color: C.note, fontSize: 24, letterSpacing: '0.3em', marginBottom: 22}}>
          <TypeOn text={ov.title} cps={2} />
        </div>
        <div style={{display: 'flex', gap: 18, flexWrap: 'wrap'}}>
          {ov.items.map((it: string, i: number) => {
            const s = sp(f, fps, 6 + i * 7, {damping: 13, stiffness: 160});
            return (
              <div
                key={i}
                style={{
                  transform: `translateY(${(1 - s) * 40}px) scale(${0.8 + 0.2 * s})`,
                  opacity: Math.min(1, s * 1.4),
                  background: i === 0 ? C.cobalt : 'rgba(247,248,250,0.95)',
                  color: i === 0 ? C.white : C.ink,
                  fontFamily: F.display,
                  fontWeight: 700,
                  fontSize: 34,
                  padding: '16px 28px',
                  borderRadius: 999,
                  letterSpacing: '0.04em',
                }}
              >
                {it}
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* REASON — outlined numeral + word */
const Reason: React.FC<{ov: Ov; dur: number}> = ({ov, dur}) => {
  const f = useCurrentFrame();
  const x = exitT(f, dur);
  return (
    <AbsoluteFill style={{opacity: 1 - x}}>
      <Scrim side="left" strength={0.7} />
      <div style={{position: 'absolute', left: 110, top: 290}}>
        <MaskLine delay={0} dur={26}>
          <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 300, lineHeight: 0.85, color: 'transparent', WebkitTextStroke: `3px ${C.white}`, letterSpacing: '-0.04em'}}>{ov.n}</div>
        </MaskLine>
        <div style={{display: 'flex', alignItems: 'center', gap: 20, marginTop: 20}}>
          <div style={{fontFamily: F.mono, color: C.note, fontSize: 24, letterSpacing: '0.3em'}}>
            <TypeOn text="REASON" delay={10} cps={2} />
          </div>
          <Rule delay={12} dur={22} color={C.note} width={120} height={2} />
        </div>
        <MaskLine delay={12} dur={24}>
          <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 110, color: C.white, letterSpacing: '0.01em'}}>{ov.text}</div>
        </MaskLine>
      </div>
    </AbsoluteFill>
  );
};

/* ESTIMATE — research note card, explicitly not official */
const Estimate: React.FC<{ov: Ov; dur: number}> = ({ov, dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const x = exitT(f, dur);
  const s = sp(f, fps, 2, {damping: 16});
  return (
    <AbsoluteFill style={{opacity: 1 - x}}>
      <Scrim side="right" strength={0.55} />
      <div
        style={{
          position: 'absolute',
          right: 130,
          top: 300,
          width: 640,
          background: C.note,
          padding: '42px 46px',
          boxShadow: '0 30px 60px rgba(0,0,0,0.35)',
          transform: `translateY(${(1 - s) * 80}px) rotate(${(1 - s) * 6 - 1.5}deg)`,
          opacity: Math.min(1, s * 1.5),
        }}
      >
        <div style={{fontFamily: F.mono, fontSize: 20, letterSpacing: '0.28em', color: C.midnight, marginBottom: 18}}>RESEARCH NOTE · ESTIMATE</div>
        <div style={{fontFamily: F.serif, fontSize: 56, color: C.ink, lineHeight: 1.05}}>{ov.text}</div>
        <div style={{marginTop: 20, fontFamily: F.display, fontWeight: 600, fontSize: 24, color: C.red, letterSpacing: '0.02em'}}>{ov.sub}</div>
      </div>
    </AbsoluteFill>
  );
};

/* LIST — five realities index */
const List: React.FC<{ov: Ov; dur: number}> = ({ov, dur}) => {
  const f = useCurrentFrame();
  const x = exitT(f, dur);
  return (
    <AbsoluteFill style={{opacity: 1 - x}}>
      <Scrim side="left" strength={0.8} />
      <div style={{position: 'absolute', left: 120, top: 220}}>
        <div style={{fontFamily: F.mono, fontSize: 24, color: C.note, letterSpacing: '0.3em', marginBottom: 28}}>
          <TypeOn text={ov.title} cps={2.2} />
        </div>
        {ov.items.map((it: string, i: number) => (
          <div key={i} style={{display: 'flex', alignItems: 'baseline', gap: 28, marginBottom: 6}}>
            <div style={{fontFamily: F.mono, fontSize: 26, color: C.cobalt, opacity: p(f, 8 + i * 6, 18 + i * 6)}}>{String(i + 1).padStart(2, '0')}</div>
            <MaskLine delay={8 + i * 6} dur={22}>
              <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 92, color: C.white, lineHeight: 1.05, letterSpacing: '-0.01em'}}>{it}</div>
            </MaskLine>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* REALITY — numbered editorial card */
const Reality: React.FC<{ov: Ov; dur: number}> = ({ov, dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const x = exitT(f, dur);
  const s = sp(f, fps, 0, {damping: 20, stiffness: 140});
  return (
    <AbsoluteFill style={{opacity: 1 - x}}>
      <Scrim side="left" strength={0.5} />
      <div
        style={{
          position: 'absolute',
          left: 100,
          top: 250,
          width: 760,
          background: C.white,
          padding: '48px 54px 54px',
          transform: `translateX(${(1 - s) * -120}px)`,
          opacity: Math.min(1, s * 1.6),
          boxShadow: '0 40px 80px rgba(0,0,0,0.35)',
        }}
      >
        <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: F.mono, fontSize: 22, color: C.midnight, letterSpacing: '0.25em'}}>
          <span>GROUND REALITY</span>
          <span style={{color: C.cobalt}}>{ov.n} / 05</span>
        </div>
        <Rule delay={6} dur={20} color={C.ink} width="100%" height={2} style={{margin: '20px 0 26px'}} />
        <MaskLine delay={6}>
          <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 104, color: C.ink, lineHeight: 0.95, letterSpacing: '-0.02em'}}>{ov.title}</div>
        </MaskLine>
        <div style={{marginTop: 22}}>
          <Words text={ov.line} delay={14} stagger={1.5} style={{fontFamily: F.serif, fontSize: 48, color: C.inkSoft, lineHeight: 1.1}} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* QUESTION CARD — the three closing questions */
const QCard: React.FC<{ov: Ov; dur: number}> = ({ov, dur}) => {
  const f = useCurrentFrame();
  const x = exitT(f, dur);
  return (
    <AbsoluteFill style={{opacity: 1 - x}}>
      <Scrim side="full" strength={0.9} />
      <div style={{position: 'absolute', left: 160, top: 210, width: 1500}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
          <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 150, color: C.cobalt, lineHeight: 1}}>
            <MaskLine>{'Q' + ov.n}</MaskLine>
          </div>
          <Rule delay={8} dur={30} color={C.grey} width={420} height={2} />
        </div>
        <div style={{marginTop: 30}}>
          <Words text={ov.text} delay={8} stagger={1.3} style={{fontFamily: F.serif, fontSize: 72, color: C.white, lineHeight: 1.12}} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* PERSON ID — lower third for real public figures */
const Person: React.FC<{ov: Ov; dur: number}> = ({ov, dur}) => {
  const f = useCurrentFrame();
  const x = exitT(f, dur);
  return (
    <AbsoluteFill style={{opacity: 1 - x}}>
      <Scrim side="bottom" strength={0.75} />
      <div style={{position: 'absolute', left: 110, bottom: 100, width: 1200}}>
        <div style={{display: 'flex', alignItems: 'stretch', gap: 24}}>
          <div style={{width: 8, background: C.cobalt, transform: `scaleY(${p(f, 0, 18)})`, transformOrigin: 'bottom'}} />
          <div>
            <MaskLine delay={4}>
              <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 64, color: C.white, lineHeight: 1}}>{ov.name}</div>
            </MaskLine>
            <div style={{marginTop: 10, fontSize: 24, color: C.note, letterSpacing: '0.16em'}}>
              <TypeOn text={ov.role.toUpperCase()} delay={12} cps={2.4} />
            </div>
            {ov.note ? (
              <div style={{marginTop: 14, maxWidth: 1000}}>
                <Words text={ov.note} delay={22} stagger={1.2} style={{fontFamily: F.serif, fontSize: 38, color: C.silver, lineHeight: 1.15}} />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ARCHIVE caption */
const Archive: React.FC<{ov: Ov; dur: number}> = ({ov, dur}) => {
  const f = useCurrentFrame();
  const x = exitT(f, dur);
  return (
    <AbsoluteFill style={{opacity: 1 - x}}>
      <Scrim side="bottom" strength={0.7} />
      <div style={{position: 'absolute', left: 110, bottom: 96, width: 1300}}>
        <div style={{fontFamily: F.mono, fontSize: 26, color: C.note, letterSpacing: '0.22em'}}>
          <TypeOn text={ov.text} cps={2.2} />
        </div>
        <div style={{marginTop: 14}}>
          <Words text={ov.sub} delay={10} stagger={1.4} style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: 48, color: C.white, lineHeight: 1.1}} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* CHAPTER — the postcard motif: footage begins as a postcard, camera pushes through it */
export const ChapterOverlayFrame = (f: number, dur: number) => {
  // returns transform for the footage layer (postcard → full bleed)
  const t = p(f, 8, Math.min(dur - 6, 60), E.quintInOut);
  const scale = 0.62 + 0.38 * t;
  const rot = (1 - t) * -2.2;
  return {scale, rot, t};
};

const Chapter: React.FC<{ov: Ov; dur: number}> = ({ov, dur}) => {
  const f = useCurrentFrame();
  const x = exitT(f, dur);
  const t = p(f, 8, Math.min(dur - 6, 60), E.quintInOut);
  return (
    <AbsoluteFill style={{opacity: 1 - x}}>
      <Scrim side="left" strength={0.55 + 0.25 * t} />
      <div style={{position: 'absolute', left: 120, top: 330, width: 1500}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 22}}>
          <div style={{fontFamily: F.mono, fontSize: 26, color: C.note, letterSpacing: '0.34em'}}>
            <TypeOn text={'CHAPTER ' + ov.num} delay={4} cps={2} />
          </div>
          <Rule delay={8} dur={30} color={C.note} width={160} height={2} />
        </div>
        <MaskLine delay={10} dur={28}>
          <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 132, color: C.white, lineHeight: 0.98, letterSpacing: '-0.025em', marginTop: 18}}>{ov.title}</div>
        </MaskLine>
        <div style={{marginTop: 22}}>
          <Words text={ov.sub} delay={22} stagger={2} style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: 52, color: C.silver}} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Note: React.FC<{ov: Ov; dur: number}> = ({ov}) => (
  <div style={{position: 'absolute', left: 110, bottom: 70, fontFamily: F.mono, fontSize: 20, color: C.grey, letterSpacing: '0.12em'}}>{ov.text}</div>
);

export const Overlay: React.FC<{ov: Ov | null; dur: number}> = ({ov, dur}) => {
  if (!ov) return null;
  const M: Record<string, React.FC<{ov: Ov; dur: number}>> = {
    loc: Loc,
    stat: Stat,
    kicker: Kicker,
    question: Question,
    profile: Profile,
    chips: Chips,
    reason: Reason,
    estimate: Estimate,
    list: List,
    reality: Reality,
    qcard: QCard,
    person: Person,
    archive: Archive,
    chapter: Chapter,
    note: Note,
  };
  const Comp = M[ov.t];
  return Comp ? <Comp ov={ov} dur={dur} /> : null;
};

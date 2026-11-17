import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {geoPath, geoMercator, geoConicConformal} from 'd3-geo';
import {C, F} from '../theme';
import {E, p, sp, rnd, lerp} from '../lib/anim';
import {MaskLine, TypeOn, Words, Counter, Rule} from '../components/Type';
import {Stage, Eyebrow, Paper, DocLines, Stamp, MG, Rig, Source, PersonGlyph, exitFade} from './kit';
import india from '../data/india_states.json';
import canada from '../data/canada_provinces.json';

/* ── Telugu states map: Hyderabad · Vijayawada · Guntur ─────────── */
export const IndiaMapCities: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  const focus = (india as any).features.filter((x: any) => ['Telangana', 'Andhra Pradesh'].includes(x.properties.name));
  const ctx = (india as any).features.filter((x: any) => ['Karnataka', 'Maharashtra', 'Tamil Nadu', 'Odisha', 'Chhattisgarh', 'Goa', 'Kerala', 'Puducherry'].includes(x.properties.name));
  const proj = geoMercator().fitExtent([[520, 110], [1500, 1000]], {type: 'FeatureCollection', features: focus} as any);
  const path = geoPath(proj);
  const cities = [
    {n: 'HYDERABAD', c: [78.4867, 17.385]},
    {n: 'VIJAYAWADA', c: [80.648, 16.5062]},
    {n: 'GUNTUR', c: [80.4365, 16.3067]},
  ];
  const draw = p(f, 0, 40, E.quintOut);
  return (
    <Stage tone="white">
      <Rig keys={[{f: 0, rx: 24, s: 1.12, y: 40}, {f: dur, rx: 12, s: 1.0, y: 0}]} ease={E.cubicInOut}>
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          {ctx.map((x: any, i: number) => (
            <path key={'c' + i} d={path(x) || ''} fill="#E7EBF0" stroke="#C9D1DB" strokeWidth={1.5} opacity={draw} />
          ))}
          {focus.map((x: any, i: number) => (
            <path key={i} d={path(x) || ''} fill={i === 0 ? '#DCE6FD' : '#E8EEFE'} stroke={C.cobalt} strokeWidth={3} strokeDasharray={6000} strokeDashoffset={6000 * (1 - draw)} />
          ))}
          {cities.map((c, i) => {
            const [x, y] = proj(c.c as any) as [number, number];
            const t = p(f, 16 + i * 8, 36 + i * 8, E.backOut);
            const dx = i === 0 ? -40 : 40;
            const ly = i === 0 ? y - 70 : i === 1 ? y - 110 : y + 90;
            return (
              <g key={i} opacity={Math.min(1, t * 2)}>
                <circle cx={x} cy={y} r={34 * t} fill="rgba(53,108,246,0.15)" />
                <circle cx={x} cy={y} r={11 * t} fill={C.cobalt} />
                <line x1={x} y1={y} x2={x + dx * 3} y2={ly} stroke={C.ink} strokeWidth={2} strokeDasharray={200} strokeDashoffset={200 * (1 - t)} />
                <text x={x + dx * 3 + (dx > 0 ? 10 : -10)} y={ly + (i === 2 ? 30 : -6)} textAnchor={dx > 0 ? 'start' : 'end'} fontFamily={F.display} fontWeight={800} fontSize={40} fill={C.ink}>
                  {c.n}
                </text>
              </g>
            );
          })}
        </svg>
      </Rig>
      <div style={{position: 'absolute', left: 110, top: 110}}>
        <Eyebrow text="TEN YEARS AGO · TELANGANA & ANDHRA PRADESH" />
      </div>
    </Stage>
  );
};

/* ── H-1B lottery: qualifications don't decide selection ─────────── */
export const LotteryDraw: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  const cols = 16;
  const rows = 8;
  const n = cols * rows;
  const sweep = p(f, 30, dur - 20, E.linear);
  return (
    <Stage tone="white">
      <Rig keys={[{f: 0, rx: 30, s: 0.95, y: 60}, {f: dur, rx: 22, s: 1.02, y: 30}]} ease={E.cubicInOut}>
        <div style={{position: 'absolute', left: 170, top: 330, width: 1580, display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 10}}>
          {Array.from({length: n}).map((_, i) => {
            const a = p(f, (i % cols) * 0.6 + Math.floor(i / cols) * 1.2, (i % cols) * 0.6 + Math.floor(i / cols) * 1.2 + 14, E.quintOut);
            const chosen = rnd(i * 3.1) < 0.22;
            const decided = sweep * cols > (i % cols) + 0.5;
            const bg = !decided ? '#FFFFFF' : chosen ? C.cobalt : '#E3E7EC';
            return (
              <div key={i} style={{height: 56, background: bg, boxShadow: '0 4px 10px rgba(10,20,40,0.12)', transform: `translateY(${(1 - a) * 30}px)`, opacity: a, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.mono, fontSize: 14, color: decided && chosen ? '#fff' : '#8A94A3'}}>
                {String(100000 + Math.floor(rnd(i) * 899999)).slice(0, 6)}
              </div>
            );
          })}
        </div>
      </Rig>
      <div style={{position: 'absolute', left: 170, top: 110}}>
        <Eyebrow text="UNITED STATES · H-1B REGISTRATIONS" />
        <div style={{height: 18}} />
        <Words text="Selection by lottery." delay={6} stagger={3} style={{fontFamily: F.display, fontWeight: 800, fontSize: 92, color: C.ink, letterSpacing: '-0.02em'}} />
      </div>
      <div style={{position: 'absolute', right: 170, top: 150, display: 'flex', gap: 14, alignItems: 'center', opacity: p(f, 30, 44)}}>
        <div style={{width: 26, height: 26, background: C.cobalt}} />
        <div style={{fontFamily: F.mono, fontSize: 20, color: C.midnight}}>SELECTED</div>
        <div style={{width: 26, height: 26, background: '#E3E7EC', marginLeft: 20}} />
        <div style={{fontFamily: F.mono, fontSize: 20, color: C.midnight}}>NOT SELECTED</div>
      </div>
      <Source text="USCIS: random selection is used when registrations exceed the annual cap" delay={34} />
    </Stage>
  );
};

/* ── SEQUENCE 2 — the Study-to-PR formula ─────────────── */
const STEPS = [
  {k: 'STUDY PERMIT', d: 'ARRIVE AS A STUDENT', t: 'DAY 1'},
  {k: 'COLLEGE', d: '1–2 YEAR PROGRAM', t: '1–2 YRS'},
  {k: 'POST-GRAD WORK PERMIT', d: 'PGWP', t: 'UP TO 3 YRS'},
  {k: 'CANADIAN JOB', d: 'SKILLED WORK', t: '1 YEAR'},
  {k: 'POINTS', d: 'EXPRESS ENTRY · CRS', t: 'DRAW'},
  {k: 'PERMANENT RESIDENCE', d: 'PR CARD', t: 'PR'},
  {k: 'CITIZENSHIP', d: '3 OF 5 YEARS PRESENT', t: '~3 YRS'},
];
export const StudyToPR: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const gap = 470;
  const CW = 400;
  const per = Math.max(22, (dur - 60) / STEPS.length);
  // camera keeps the active card at x≈760 with the next two cards visible
  const cam = interpolate(f, STEPS.map((_, i) => 16 + i * per), STEPS.map((_, i) => -i * gap), {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: E.quintInOut,
  });
  const camEnd = p(f, dur - 46, dur - 8, E.quintInOut);
  const total = (STEPS.length - 1) * gap;
  const pullS = lerp(1.12, 0.55, camEnd);
  const baseX = lerp(cam + 560, (1920 - (total + CW) * pullS) / 2 / pullS, camEnd);
  return (
    <Stage tone="white">
      <div style={{position: 'absolute', left: 110, top: 80}}>
        <Eyebrow text="THE STUDY-TO-PR FORMULA · AS IT WAS SOLD" />
        <div style={{height: 14}} />
        <MaskLine delay={4}>
          <div style={{fontFamily: F.serif, fontSize: 72, color: C.ink}}>No lottery. Just a formula.</div>
        </MaskLine>
      </div>
      <AbsoluteFill style={{perspective: 2200, top: 60}}>
        <AbsoluteFill style={{transformStyle: 'preserve-3d', transform: `scale(${pullS}) translateX(${baseX}px) rotateX(${lerp(14, 4, camEnd)}deg)`, transformOrigin: '0px 560px'}}>
          <div style={{position: 'absolute', left: CW / 2, top: 700, width: total, height: 8, background: '#DCE2EA'}} />
          <div style={{position: 'absolute', left: CW / 2, top: 700, width: Math.min(total, Math.max(0, -cam)), height: 8, background: C.cobalt}} />
          {STEPS.map((st, i) => {
            const t0 = 16 + i * per - 10;
            const up = sp(f, fps, t0, {damping: 15, stiffness: 130});
            const active = f >= t0;
            return (
              <div key={i} style={{position: 'absolute', left: i * gap, top: 300}}>
                <div
                  style={{
                    width: CW,
                    height: 330,
                    background: i === 5 ? C.cobalt : '#FFFFFF',
                    color: i === 5 ? '#fff' : C.ink,
                    boxShadow: '0 30px 60px rgba(10,20,40,0.22)',
                    padding: 34,
                    boxSizing: 'border-box',
                    transformOrigin: '50% 100%',
                    transform: `rotateX(${(1 - up) * -24}deg) translateY(${(1 - up) * 40}px)`,
                    opacity: active ? 1 : 0.35,
                    filter: active ? 'none' : 'grayscale(1)',
                  }}
                >
                  <div style={{fontFamily: F.mono, fontSize: 22, letterSpacing: '0.18em', color: i === 5 ? C.note : C.cobalt}}>
                    {String(i + 1).padStart(2, '0')} · {st.t}
                  </div>
                  <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 46, lineHeight: 1.02, marginTop: 22, letterSpacing: '-0.01em'}}>{st.k}</div>
                  <div style={{fontFamily: F.mono, fontSize: 19, letterSpacing: '0.1em', marginTop: 18, color: i === 5 ? C.silver : '#6B7685'}}>{st.d}</div>
                </div>
                <div style={{position: 'absolute', left: CW / 2 - 16, top: 384, width: 32, height: 32, borderRadius: 16, background: active ? C.cobalt : '#DCE2EA', border: '6px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.15)'}} />
              </div>
            );
          })}
          <div
            style={{
              position: 'absolute',
              left: Math.min(total, -cam) + CW / 2 - 60,
              top: 760,
              width: 120,
              height: 160,
              background: C.midnight,
              borderRadius: 10,
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: C.note,
              fontFamily: F.mono,
              fontSize: 16,
              letterSpacing: '0.1em',
              transform: `rotate(${Math.sin(f / 9) * 3}deg)`,
              opacity: 1 - camEnd,
            }}
          >
            PASSPORT
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 110, bottom: 60, fontFamily: F.mono, fontSize: 20, color: '#6B7685', letterSpacing: '0.06em', opacity: p(f, dur - 60, dur - 40)}}>
        A COMMON PATH, NEVER A GUARANTEE · EVERY STEP DEPENDED ON THE RULES AND ELIGIBILITY IN FORCE
      </div>
    </Stage>
  );
};

/* ── 1 in 4 new PRs: waffle ─────────── */
export const WaffleShare: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  return (
    <Stage tone="ink">
      <div style={{position: 'absolute', left: 140, top: 180, display: 'grid', gridTemplateColumns: 'repeat(10, 58px)', gap: 16}}>
        {Array.from({length: 100}).map((_, i) => {
          const a = p(f, i * 0.35, i * 0.35 + 12, E.backOut);
          const hl = i < 30 && f > 34 + i * 0.6;
          return (
            <div key={i} style={{transform: `scale(${a})`}}>
              <PersonGlyph size={58} color={hl ? C.coral : '#3A4454'} />
            </div>
          );
        })}
      </div>
      <div style={{position: 'absolute', left: 1050, top: 300, width: 760}}>
        <Eyebrow text="NEW PERMANENT RESIDENTS · 2023" color={C.note} />
        <div style={{height: 20}} />
        <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 210, color: C.coral, lineHeight: 0.9, letterSpacing: '-0.04em'}}>
          <Counter to={29.6} decimals={1} delay={30} dur={40} suffix="%" />
        </div>
        <Words text="were Indian citizens — more than one in four." delay={40} stagger={2} style={{fontFamily: F.serif, fontSize: 60, color: C.white, lineHeight: 1.1, marginTop: 18}} />
        <div style={{fontFamily: F.mono, fontSize: 22, color: C.grey, marginTop: 28, opacity: p(f, 60, 74)}}>139,715 OF ~471,800 · IRCC</div>
      </div>
    </Stage>
  );
};

/* ── ₹20 / 30 / 40 lakh loans stack up ─────────── */
export const LoanStack: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const blocks = [20, 30, 40];
  return (
    <Stage tone="white">
      <div style={{position: 'absolute', left: 150, top: 160, width: 760}}>
        <Eyebrow text="FAMILY FINANCES · AS DESCRIBED" />
        <div style={{height: 24}} />
        <Words text="Farmland sold. Loans signed." delay={4} stagger={3} style={{fontFamily: F.serif, fontSize: 92, color: C.ink, lineHeight: 1.02}} />
      </div>
      <div style={{position: 'absolute', left: 1100, bottom: 160, width: 600}}>
        {blocks.map((b, i) => {
          const s = sp(f, fps, 8 + i * 12, {damping: 13, stiffness: 160, mass: 1.2});
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 0,
                bottom: i * 170,
                width: 560 - i * 30,
                height: 150,
                background: i === 2 ? C.midnight : i === 1 ? '#2B4A75' : '#4C6A96',
                color: '#fff',
                boxShadow: '0 18px 30px rgba(10,20,40,0.25)',
                transform: `translateY(${(1 - s) * -700}px) rotate(${(1 - s) * (i % 2 ? 6 : -6)}deg)`,
                display: 'flex',
                alignItems: 'center',
                padding: '0 36px',
                justifyContent: 'space-between',
              }}
            >
              <span style={{fontFamily: F.display, fontWeight: 800, fontSize: 70}}>₹{b} lakh</span>
              <span style={{fontFamily: F.mono, fontSize: 20, color: C.note, letterSpacing: '0.16em'}}>LOAN</span>
            </div>
          );
        })}
      </div>
      <Stamp text="LAND SOLD" delay={44} color={C.red} rot={-10} size={58} style={{left: 160, top: 640}} />
    </Stage>
  );
};

/* ── The formula is torn up ─────────── */
export const FormulaTear: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  const t = p(f, 40, 80, E.anticip);
  const halves = [-1, 1];
  return (
    <Stage tone="white">
      {halves.map((h, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: 360,
            top: 240,
            width: 1200,
            height: 600,
            clipPath:
              h < 0
                ? 'polygon(0 0, 51% 0, 48% 18%, 52% 35%, 47% 52%, 51% 70%, 48% 86%, 50% 100%, 0 100%)'
                : 'polygon(51% 0, 100% 0, 100% 100%, 50% 100%, 48% 86%, 51% 70%, 47% 52%, 52% 35%, 48% 18%)',
            transform: `translate(${h * t * 260}px, ${t * t * 700}px) rotate(${h * t * 22}deg)`,
            transformOrigin: h < 0 ? '0% 100%' : '100% 100%',
          }}
        >
          <Paper w={1200} h={600} style={{padding: 60, boxSizing: 'border-box'}}>
            <div style={{fontFamily: F.mono, fontSize: 24, letterSpacing: '0.3em', color: C.cobalt}}>THE FORMULA</div>
            <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 70, color: C.ink, marginTop: 40, lineHeight: 1.3}}>
              Study → PGWP → Job →<br />
              Points → PR → Citizen
            </div>
            <div style={{fontFamily: F.mono, fontSize: 22, color: '#6B7685', marginTop: 40}}>NO LOTTERY · NO LUCK · JUST A FORMULA</div>
          </Paper>
        </div>
      ))}
      <div style={{position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', opacity: p(f, 70, 90)}}>
        <MaskLine delay={72}>
          <div style={{fontFamily: F.serif, fontSize: 96, color: C.ink}}>Written by Canada. Torn up by Canada.</div>
        </MaskLine>
      </div>
    </Stage>
  );
};

/* ── SEQUENCE 4 — PR levels: the U-turn ─────────── */
export const PolicyTimeline: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  const data = [
    {y: '2024', v: 483640, l: '483,640', kind: 'actual'},
    {y: '2025', v: 393500, l: '~393,500', kind: 'actual'},
    {y: '2026', v: 380000, l: '380,000', kind: 'target'},
    {y: '2027', v: 380000, l: '380,000', kind: 'plan'},
    {y: '2028', v: 380000, l: '380,000', kind: 'plan'},
    {y: '2029', v: 380000, l: '380,000', kind: 'plan'},
  ];
  const max = 520000;
  const H0 = 560;
  const base = 860;
  const freeze = p(f, dur - 110, dur - 70, E.quintOut);
  const targetLine = base - (500000 / max) * H0;
  return (
    <Stage tone="ink">
      <div style={{position: 'absolute', left: 120, top: 80}}>
        <Eyebrow text="NEW PERMANENT RESIDENTS PER YEAR" color={C.note} />
      </div>
      {/* old 500k target line, struck through */}
      <div style={{position: 'absolute', left: 260, top: targetLine, width: 1500 * p(f, 4, 30), height: 3, background: `repeating-linear-gradient(90deg, ${C.grey}, ${C.grey} 14px, transparent 14px, transparent 26px)`}} />
      <div style={{position: 'absolute', left: 1130, top: targetLine - 40, fontFamily: F.mono, fontSize: 19, color: C.grey, opacity: p(f, 20, 34), whiteSpace: 'nowrap'}}>
        <span style={{position: 'relative'}}>
          500,000 / YEAR — TARGET FOR 2025 & 2026 SET IN THE 2023 PLAN
          <span style={{position: 'absolute', left: 0, right: 0, top: '50%', height: 3, background: C.red, transform: `scaleX(${p(f, 40, 60)})`, transformOrigin: 'left'}} />
        </span>
      </div>
      {data.map((d, i) => {
        const t = p(f, 12 + i * 14, 50 + i * 14, E.expoOut);
        const h = (d.v / max) * H0 * t;
        const col = d.kind === 'actual' ? (i === 0 ? '#4C6A96' : C.cobalt) : d.kind === 'target' ? C.cobalt : 'rgba(53,108,246,0.55)';
        return (
          <div key={i} style={{position: 'absolute', left: 300 + i * 230, top: base - h, width: 150, height: h, background: col}}>
            {d.kind === 'plan' ? <div style={{position: 'absolute', inset: 0, background: `rgba(220,226,234,${0.55 * freeze})`, borderTop: `4px solid rgba(255,255,255,${freeze})`}} /> : null}
            <div style={{position: 'absolute', top: -54, left: -30, width: 210, textAlign: 'center', fontFamily: F.display, fontWeight: 800, fontSize: 34, color: C.white, opacity: p(f, 36 + i * 14, 50 + i * 14)}}>{d.l}</div>
            <div style={{position: 'absolute', top: h + 18, left: 0, width: 150, textAlign: 'center', fontFamily: F.mono, fontSize: 26, color: C.silver}}>{d.y}</div>
            <div style={{position: 'absolute', top: h + 54, left: 0, width: 150, textAlign: 'center', fontFamily: F.mono, fontSize: 16, letterSpacing: '0.16em', color: C.grey}}>{d.kind.toUpperCase()}</div>
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 300, top: 150, display: 'flex', alignItems: 'baseline', gap: 18, fontFamily: F.display, fontWeight: 800, fontSize: 72, color: C.coral, opacity: p(f, 60, 74)}}>
        −19%
        <span style={{fontFamily: F.mono, fontSize: 22, color: C.grey, fontWeight: 400}}>2024 → 2025 ADMISSIONS</span>
      </div>
      <div style={{position: 'absolute', left: 1300, top: 130, opacity: freeze, textAlign: 'right', width: 520}}>
        <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 84, color: C.silver, letterSpacing: '0.04em'}}>FROZEN</div>
        <div style={{fontFamily: F.mono, fontSize: 22, color: C.grey}}>AT 380,000 A YEAR THROUGH 2029</div>
      </div>
      <Source text="IRCC annual reports & levels plans (2024–2026, 2027–2029)" delay={30} dark />
    </Stage>
  );
};

/* ── Canada provinces: nominations rise to 95,000 ─────────── */
export const ProvinceMap: React.FC<MG> = ({dur, variant}) => {
  const f = useCurrentFrame();
  const feats = (canada as any).features;
  const proj = geoConicConformal().parallels([49, 77]).rotate([96, 0]).fitExtent([[780, 110], [1860, 1000]], canada as any);
  const path = geoPath(proj);
  const small = ['New Brunswick', 'Nova Scotia', 'Prince Edward Island', 'Newfoundland and Labrador', 'Manitoba', 'Saskatchewan'];
  const big = ['Ontario', 'British Columbia'];
  const reality = variant === 'reality';
  return (
    <Stage tone="midnight" grid={false}>
      <Rig keys={[{f: 0, rx: 18, s: 1.05}, {f: dur, rx: 10, s: 1.0}]}>
        <svg width={1920} height={1080} style={{position: 'absolute'}}>
          {feats.map((x: any, i: number) => {
            const n = x.properties.name;
            const t = p(f, 2 + i * 1.5, 18 + i * 1.5);
            let fill = `rgba(53,108,246,${0.25 + 0.45 * t})`;
            if (reality) fill = small.includes(n) ? `rgba(245,232,172,${0.35 + 0.55 * t})` : big.includes(n) ? 'rgba(173,182,194,0.25)' : 'rgba(53,108,246,0.25)';
            return <path key={i} d={path(x) || ''} fill={fill} stroke="rgba(247,248,250,0.7)" strokeWidth={1.4} />;
          })}
        </svg>
      </Rig>
      <div style={{position: 'absolute', left: 110, top: 300, width: 600}}>
        <Eyebrow text={reality ? 'GROUND REALITY 03 · PROVINCE' : 'PROVINCIAL NOMINEE PROGRAM'} color={C.note} />
        <div style={{height: 20}} />
        <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 170, color: C.white, lineHeight: 0.9, letterSpacing: '-0.03em'}}>
          <Counter to={95000} delay={6} dur={36} />
        </div>
        <Words
          text={reality ? 'nominations a year — clearer paths in smaller provinces and rural areas than Toronto or Vancouver.' : 'provincial nominations a year in the 2027–2029 plan.'}
          delay={14}
          stagger={1.4}
          style={{fontFamily: F.serif, fontSize: 48, color: C.silver, lineHeight: 1.1, marginTop: 16}}
        />
      </div>
      <Source text="IRCC 2027–2029 Immigration Levels Plan (PNP target)" delay={20} dark />
    </Stage>
  );
};

/* ── The applicant profile that no longer fits ─────────── */
export const ApplicantProfile: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const fields = [
    ['AGE', '24'],
    ['CREDENTIAL', '1-yr business management diploma'],
    ['FRENCH', 'None'],
    ['IN-DEMAND OCCUPATION', 'No'],
  ];
  const needle = interpolate(p(f, 40, 90, E.backOut), [0, 1], [70, -62]);
  return (
    <Stage tone="white">
      <Paper w={900} h={700} style={{left: 150, top: 190, padding: 56, boxSizing: 'border-box', transform: `translateY(${(1 - sp(f, fps, 0)) * 120}px)`}}>
        <div style={{fontFamily: F.mono, fontSize: 22, letterSpacing: '0.3em', color: C.cobalt}}>APPLICANT PROFILE</div>
        <Rule delay={4} color={C.ink} width="100%" height={2} style={{margin: '22px 0 30px'}} />
        {fields.map(([k, v], i) => (
          <div key={i} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '20px 0', borderBottom: '1px solid #E1E6EC', opacity: p(f, 8 + i * 6, 20 + i * 6)}}>
            <span style={{fontFamily: F.mono, fontSize: 20, color: '#6B7685', letterSpacing: '0.12em', flexShrink: 0, marginRight: 30}}>{k}</span>
            <span style={{fontFamily: F.display, fontWeight: 700, fontSize: 34, color: i >= 2 ? C.red : C.ink, textAlign: 'right', maxWidth: 470}}>{v}</span>
          </div>
        ))}
      </Paper>
      <div style={{position: 'absolute', left: 1180, top: 290, width: 600, height: 400}}>
        <svg width={600} height={360}>
          <path d="M60 320 A240 240 0 0 1 540 320" stroke="#E1E6EC" strokeWidth={40} fill="none" />
          <path d="M60 320 A240 240 0 0 1 160 125" stroke={C.red} strokeWidth={40} fill="none" />
          <path d="M440 125 A240 240 0 0 1 540 320" stroke={C.cobalt} strokeWidth={40} fill="none" />
          <g transform={`translate(300 320) rotate(${needle})`}>
            <line x1={0} y1={0} x2={0} y2={-220} stroke={C.ink} strokeWidth={8} strokeLinecap="round" />
            <circle r={18} fill={C.ink} />
          </g>
        </svg>
        <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: F.mono, fontSize: 22, color: '#6B7685', padding: '0 30px'}}>
          <span style={{color: C.red}}>LOW PRIORITY</span>
          <span style={{color: C.cobalt}}>PRIORITY</span>
        </div>
      </div>
    </Stage>
  );
};

/* ── Four reasons ─────────── */
export const FourReasons: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const r = ['HOUSING', 'PUBLIC MOOD', 'JOBS', 'FRAUD'];
  return (
    <Stage tone="ink">
      <div style={{position: 'absolute', left: 110, top: 150}}>
        <Eyebrow text="WHY CANADA PULLED THE HANDBRAKE" color={C.note} />
      </div>
      <div style={{position: 'absolute', left: 110, top: 330, display: 'flex', gap: 30}}>
        {r.map((x, i) => {
          const s = sp(f, fps, 4 + i * 6, {damping: 16, stiffness: 150});
          const flick = i === 3 ? (Math.sin(f * 1.7) > 0.2 && f > 50 ? 1 : 0.55) : 1;
          return (
            <div key={i} style={{width: 400, height: 420, border: `3px solid ${i === 3 ? C.red : 'rgba(220,226,234,0.35)'}`, padding: 34, boxSizing: 'border-box', transform: `translateY(${(1 - s) * 120}px)`, opacity: Math.min(1, s * 1.4) * (i === 3 ? flick : 1)}}>
              <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 120, color: i === 3 ? C.red : C.white, lineHeight: 1}}>{String(i + 1).padStart(2, '0')}</div>
              <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 44, color: C.white, marginTop: 140}}>{x}</div>
            </div>
          );
        })}
      </div>
    </Stage>
  );
};

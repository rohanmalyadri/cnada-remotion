import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {C, F} from '../theme';
import {E, p, sp, rnd, lerp} from '../lib/anim';
import {MaskLine, TypeOn, Words, Counter, Rule} from '../components/Type';
import {Stage, Eyebrow, Paper, DocLines, Stamp, MG, Rig, Source, PersonGlyph, BarH} from './kit';

/* ── Public mood: IRCC tracking survey ─────────── */
export const SurveyChart: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  const pts = [
    {l: 'MAR 2023', v: 22},
    {l: 'NOV 2023', v: 35},
    {l: 'NOV 2024', v: 54},
  ];
  const X = (i: number) => 260 + i * 520;
  const Y = (v: number) => 900 - v * 10;
  const t = p(f, 6, 70, E.quintInOut);
  const d = pts.map((q, i) => `${i ? 'L' : 'M'}${X(i)} ${Y(q.v)}`).join(' ');
  return (
    <Stage tone="white">
      <div style={{position: 'absolute', left: 120, top: 90}}>
        <Eyebrow text="REASON 02 · PUBLIC MOOD" />
        <div style={{height: 18}} />
        <Words text="“There are too many immigrants coming to Canada.”" delay={4} stagger={1.6} style={{fontFamily: F.serif, fontSize: 70, color: C.ink, maxWidth: 1500}} />
      </div>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <line x1={200} y1={Y(50)} x2={1600} y2={Y(50)} stroke={C.coral} strokeWidth={2} strokeDasharray="8 10" opacity={p(f, 20, 40)} />
        <text x={1610} y={Y(50) + 8} fontFamily={F.mono} fontSize={22} fill={C.coral} opacity={p(f, 20, 40)}>
          HALF
        </text>
        <path d={d} stroke={C.cobalt} strokeWidth={8} fill="none" strokeDasharray={1400} strokeDashoffset={1400 * (1 - t)} strokeLinecap="round" />
        {pts.map((q, i) => {
          const a = p(f, 6 + i * 26, 22 + i * 26, E.backOut);
          return (
            <g key={i} opacity={Math.min(1, a * 2)}>
              <circle cx={X(i)} cy={Y(q.v)} r={18 * a} fill={i === 2 ? C.cobalt : '#fff'} stroke={C.cobalt} strokeWidth={6} />
              <text x={X(i)} y={Y(q.v) - 40} textAnchor="middle" fontFamily={F.display} fontWeight={800} fontSize={i === 2 ? 96 : 60} fill={C.ink}>
                {q.v}%
              </text>
              <text x={X(i)} y={960} textAnchor="middle" fontFamily={F.mono} fontSize={24} fill="#5B6675">
                {q.l}
              </text>
            </g>
          );
        })}
      </svg>
      <Source text="IRCC annual tracking survey (telephone), Nov 2024 — via IRCC transition binder" delay={30} />
    </Stage>
  );
};

/* ── Fraud: generic letter of acceptance flagged ─────────── */
export const FraudLetter: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = sp(f, fps, 0, {damping: 18});
  return (
    <Stage tone="ink" grid={false}>
      <Rig keys={[{f: 0, rx: 30, ry: -12, s: 0.9}, {f: dur, rx: 14, ry: -4, s: 1.02}]} ease={E.cubicInOut}>
        <Paper w={760} h={960} style={{left: 980, top: 60, padding: 64, boxSizing: 'border-box', transform: `translateY(${(1 - s) * 300}px)`}}>
          <div style={{fontFamily: F.serif, fontSize: 40, color: C.ink}}>Letter of Acceptance</div>
          <div style={{fontFamily: F.mono, fontSize: 18, color: '#6B7685', marginTop: 10, letterSpacing: '0.12em'}}>DESIGNATED LEARNING INSTITUTION · ID ███████</div>
          <Rule color={C.ink} width="100%" height={2} style={{margin: '30px 0'}} />
          <DocLines n={16} w={620} seed={11} />
          <div style={{position: 'absolute', bottom: 70, left: 64, fontFamily: F.serif, fontStyle: 'italic', fontSize: 36, color: '#6B7685'}}>Registrar</div>
        </Paper>
        <Stamp text="NOT VERIFIED" delay={30} rot={-14} size={78} style={{left: 1080, top: 430}} />
      </Rig>
      <div style={{position: 'absolute', left: 120, top: 300, width: 760}}>
        <Eyebrow text="REASON 04 · FRAUD" color={C.coral} />
        <div style={{height: 24}} />
        {['Fake admission letters', 'Colleges that exist on paper', 'Enrolled students who never attend'].map((t, i) => (
          <MaskLine key={i} delay={10 + i * 8}>
            <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 58, color: C.white, lineHeight: 1.25}}>{t}</div>
          </MaskLine>
        ))}
        <div style={{marginTop: 30, fontFamily: F.mono, fontSize: 20, color: C.grey, opacity: p(f, 40, 54)}}>GENERIC ILLUSTRATION — NOT A REAL INSTITUTION’S DOCUMENT</div>
      </div>
    </Stage>
  );
};

/* ── Study-permit refusal rates ─────────── */
export const RefusalBars: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  return (
    <Stage tone="white">
      <div style={{position: 'absolute', left: 140, top: 110}}>
        <Eyebrow text="STUDY PERMIT APPLICATIONS REFUSED · AUGUST" />
      </div>
      <div style={{position: 'absolute', left: 140, top: 260}}>
        <BarH value={32} max={80} width={1300} delay={6} color="#9AAFD2" label="INDIA · AUGUST 2023" display="32%" height={90} />
        <BarH value={74} max={80} width={1300} delay={22} color={C.red} label="INDIA · AUGUST 2025" display="74%" height={90} />
        <BarH value={40} max={80} width={1300} delay={38} color={C.grey} label="ALL COUNTRIES · AUGUST 2025" display="~40%" height={90} />
      </div>
      <Source text="IRCC data reported by Reuters, Nov 2025" delay={40} />
    </Stage>
  );
};

/* ── Who built the system: fees → colleges, targets → permits ─────────── */
export const MoneyFlow: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  const nodes = [
    {x: 330, y: 540, t: 'INTERNATIONAL STUDENTS', c: C.coral},
    {x: 960, y: 330, t: 'COLLEGES', c: C.cobalt},
    {x: 960, y: 760, t: 'GOVERNMENTS', c: C.cobalt},
    {x: 1590, y: 540, t: 'PERMITS APPROVED', c: C.midnight},
  ];
  const links = [
    {a: 0, b: 1, l: 'INTERNATIONAL FEES'},
    {a: 2, b: 3, l: 'HIGH TARGETS'},
    {a: 1, b: 3, l: 'ADMISSIONS'},
  ];
  return (
    <Stage tone="white">
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        {links.map((k, i) => {
          const A = nodes[k.a];
          const B = nodes[k.b];
          const t = p(f, 10 + i * 10, 40 + i * 10, E.quintOut);
          const d = `M${A.x} ${A.y} C${(A.x + B.x) / 2} ${A.y}, ${(A.x + B.x) / 2} ${B.y}, ${B.x} ${B.y}`;
          return (
            <g key={i}>
              <path d={d} stroke="#C9D1DB" strokeWidth={22} fill="none" />
              <path d={d} stroke={C.cobalt} strokeWidth={22} fill="none" strokeDasharray={1600} strokeDashoffset={1600 * (1 - t)} opacity={0.85} />
              {[0, 1, 2].map((j) => {
                const u = (f / 45 + j / 3) % 1;
                const len = 1600;
                return <path key={j} d={d} stroke="#F5E8AC" strokeWidth={8} fill="none" strokeDasharray={`18 ${len}`} strokeDashoffset={-u * len} opacity={t} strokeLinecap="round" />;
              })}
              <text x={(A.x + B.x) / 2} y={(A.y + B.y) / 2 - 22} textAnchor="middle" fontFamily={F.mono} fontSize={22} fill={C.midnight} opacity={t}>
                {k.l}
              </text>
            </g>
          );
        })}
      </svg>
      {nodes.map((n, i) => {
        const s = p(f, i * 6, i * 6 + 20, E.backOut);
        return (
          <div key={i} style={{position: 'absolute', left: n.x - 190, top: n.y - 60, width: 380, height: 120, background: n.c, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: F.display, fontWeight: 800, fontSize: 28, letterSpacing: '0.04em', transform: `scale(${s})`, boxShadow: '0 20px 40px rgba(10,20,40,0.2)'}}>
            {n.t}
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 120, top: 90}}>
        <Eyebrow text="WHO BUILT THE SYSTEM" />
      </div>
    </Stage>
  );
};

/* ── SEQUENCE 6 — Indians granted PR, Jan–Jul ─────────── */
export const IndianPRCompare: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  const H0 = 600;
  const a = p(f, 6, 40, E.expoOut);
  const b = p(f, 30, 70, E.expoOut);
  const h1 = (68690 / 70000) * H0 * a;
  const h2 = (53285 / 70000) * H0 * b;
  return (
    <Stage tone="ink">
      <div style={{position: 'absolute', left: 120, top: 90}}>
        <Eyebrow text="INDIAN CITIZENS GRANTED PERMANENT RESIDENCE · JAN–JUL" color={C.note} />
      </div>
      {[{h: h1, v: 68690, y: '2025', c: '#4C6A96', d: 6}, {h: h2, v: 53285, y: '2026', c: C.coral, d: 30}].map((x, i) => (
        <div key={i} style={{position: 'absolute', left: 300 + i * 420, top: 900 - x.h, width: 280, height: x.h, background: x.c}}>
          <div style={{position: 'absolute', top: -96, left: -40, width: 360, textAlign: 'center', fontFamily: F.display, fontWeight: 800, fontSize: 76, color: C.white}}>
            <Counter to={x.v} delay={x.d} dur={36} />
          </div>
          <div style={{position: 'absolute', top: x.h + 20, width: 280, textAlign: 'center', fontFamily: F.mono, fontSize: 30, color: C.silver}}>{x.y}</div>
        </div>
      ))}
      {/* the gap */}
      <div style={{position: 'absolute', left: 720, top: 900 - h1, width: 280, height: Math.max(0, h1 - h2), border: `3px dashed ${C.coral}`, opacity: p(f, 70, 84)}} />
      <div style={{position: 'absolute', left: 1120, top: 330, width: 700, opacity: p(f, 72, 88)}}>
        <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 170, color: C.coral, lineHeight: 0.9, letterSpacing: '-0.03em'}}>−15,405</div>
        <div style={{fontFamily: F.serif, fontSize: 52, color: C.white, marginTop: 14}}>fewer Indians in the same seven months (−22%)</div>
      </div>
      <Source text="IRCC open data, permanent residents by country of citizenship (monthly), as compiled Aug 2026" delay={40} dark />
    </Stage>
  );
};

/* ── 64% of the reduction ─────────── */
export const CutShare: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  const t = p(f, 20, 60, E.quintOut);
  return (
    <Stage tone="white">
      <div style={{position: 'absolute', left: 140, top: 120}}>
        <Eyebrow text="TOTAL PR GRANTS · JAN–JUL 2025 → 2026" />
        <div style={{height: 22}} />
        <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 74, color: C.ink}}>
          <Counter to={246580} delay={0} dur={20} /> → <Counter from={246580} to={222625} delay={10} dur={34} />
        </div>
        <div style={{fontFamily: F.mono, fontSize: 24, color: '#5B6675', marginTop: 10}}>A REDUCTION OF 23,955 PLACES</div>
      </div>
      <div style={{position: 'absolute', left: 140, top: 520, width: 1640, height: 150, background: '#E3E7EC'}}>
        <div style={{position: 'absolute', left: 0, top: 0, height: 150, width: 1640 * 0.643 * t, background: C.coral}} />
        <div style={{position: 'absolute', left: 30, top: 34, fontFamily: F.display, fontWeight: 900, fontSize: 80, color: '#fff', opacity: p(f, 40, 54)}}>64% INDIAN</div>
        <div style={{position: 'absolute', right: 30, top: 50, fontFamily: F.mono, fontSize: 26, color: '#5B6675', opacity: p(f, 50, 64)}}>ALL OTHER COUNTRIES · 36%</div>
      </div>
      <div style={{position: 'absolute', left: 140, top: 720, opacity: p(f, 56, 70)}}>
        <Words text="15,405 of the 23,955 places cut." delay={56} stagger={2} style={{fontFamily: F.serif, fontSize: 64, color: C.ink}} />
      </div>
      <Source text="IRCC monthly PR data, Jan–Jul 2025 vs 2026" delay={40} />
    </Stage>
  );
};

/* ── The pipeline effect: narrow the pipe, the biggest stream loses most ─────────── */
export const PipelineFlow: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  const narrow = p(f, 70, 110, E.quintInOut);
  const groups = [
    {n: 'INDIA', share: 0.3, c: C.coral},
    {n: 'CHINA', share: 0.09, c: '#6F8BC4'},
    {n: 'PHILIPPINES', share: 0.06, c: '#8FA6D3'},
    {n: 'ALL OTHERS', share: 0.55, c: '#4C5A6E'},
  ];
  const pipeH = lerp(420, 230, narrow);
  const N = 220;
  return (
    <Stage tone="ink">
      <div style={{position: 'absolute', left: 120, top: 80}}>
        <Eyebrow text="THE PIPELINE EFFECT · ILLUSTRATIVE SHARES" color={C.note} />
      </div>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <path d={`M0 ${540 - 260} L700 ${540 - 260} L1000 ${540 - pipeH / 2} L1920 ${540 - pipeH / 2}`} stroke={C.silver} strokeWidth={4} fill="none" />
        <path d={`M0 ${540 + 260} L700 ${540 + 260} L1000 ${540 + pipeH / 2} L1920 ${540 + pipeH / 2}`} stroke={C.silver} strokeWidth={4} fill="none" />
        {Array.from({length: N}).map((_, i) => {
          const r = rnd(i + 1);
          let acc = 0;
          let g = groups[3];
          for (const gg of groups) {
            acc += gg.share;
            if (r < acc) {
              g = gg;
              break;
            }
          }
          const speed = 6 + rnd(i + 7) * 4;
          const x = ((f * speed + rnd(i + 3) * 2400) % 2100) - 100;
          const lane = (rnd(i + 11) - 0.5) * 2;
          const half = x < 700 ? 240 : x > 1000 ? pipeH / 2 - 20 : lerp(240, pipeH / 2 - 20, (x - 700) / 300);
          // after narrowing, a share of dots is blocked at the throat
          const blocked = narrow > 0.5 && rnd(i + 21) < 0.35 * narrow && x > 900;
          if (blocked) return null;
          return <circle key={i} cx={x} cy={540 + lane * half} r={9} fill={g.c} opacity={0.95} />;
        })}
      </svg>
      <div style={{position: 'absolute', left: 120, bottom: 150, display: 'flex', gap: 40}}>
        {groups.map((g, i) => (
          <div key={i} style={{display: 'flex', alignItems: 'center', gap: 12, opacity: p(f, 10 + i * 4, 24 + i * 4)}}>
            <div style={{width: 22, height: 22, borderRadius: 11, background: g.c}} />
            <div style={{fontFamily: F.mono, fontSize: 22, color: C.silver}}>{g.n}</div>
          </div>
        ))}
      </div>
      <div style={{position: 'absolute', right: 120, top: 150, width: 640, textAlign: 'right', opacity: p(f, 90, 110)}}>
        <Words text="Same rule for everyone. The biggest stream loses the most." delay={92} stagger={2} style={{justifyContent: 'flex-end', fontFamily: F.serif, fontSize: 60, color: C.white, lineHeight: 1.08}} />
      </div>
    </Stage>
  );
};

/* ── Diplomatic freeze timeline ─────────── */
export const DiplomaticFreeze: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  const ev = [
    {d: 'SEP 2023', t: 'Allegation in Parliament', s: 'India rejects it; calls Nijjar a terrorist'},
    {d: '2023–24', t: 'Diplomats expelled', s: 'Both sides'},
    {d: '2023–25', t: 'Visa services disrupted', s: 'Relations frozen'},
    {d: 'JUN 2025', t: 'G7 invitation', s: 'High Commissioners later restored'},
    {d: 'MAR 2026', t: 'Carney in New Delhi', s: 'US$50B trade target by 2030'},
  ];
  const t = p(f, 0, dur - 10, E.cubicInOut);
  return (
    <Stage tone="white">
      <div style={{position: 'absolute', left: 120, top: 100}}>
        <Eyebrow text="INDIA–CANADA · THE DIPLOMATIC LAYER" />
      </div>
      <div style={{position: 'absolute', left: 120, top: 520, width: 1680, height: 4, background: '#DCE2EA'}} />
      <div style={{position: 'absolute', left: 120, top: 520, width: 1680 * t, height: 4, background: C.ink}} />
      {ev.map((e, i) => {
        const x = 110 + i * 365;
        const a = p(f, i * 10, i * 10 + 18, E.backOut);
        const cold = i < 3;
        return (
          <div key={i} style={{position: 'absolute', left: x, top: i % 2 ? 560 : 250, width: 330, opacity: Math.min(1, a * 1.5), transform: `translateY(${(1 - a) * (i % 2 ? 30 : -30)}px)`}}>
            <div style={{fontFamily: F.mono, fontSize: 22, color: cold ? C.red : C.cobalt, letterSpacing: '0.14em'}}>{e.d}</div>
            <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 40, color: C.ink, marginTop: 10, lineHeight: 1.05}}>{e.t}</div>
            <div style={{fontFamily: F.serif, fontSize: 32, color: '#5B6675', marginTop: 8}}>{e.s}</div>
          </div>
        );
      })}
      {ev.map((e, i) => (
        <div key={'d' + i} style={{position: 'absolute', left: 110 + i * 365 - 12, top: 510, width: 24, height: 24, borderRadius: 12, background: i < 3 ? C.red : C.cobalt, transform: `scale(${p(f, i * 10, i * 10 + 14, E.backOut)})`}} />
      ))}
      <Source text="Government of Canada & Government of India statements; Reuters, Al Jazeera reporting" delay={30} />
    </Stage>
  );
};

/* ── SEQUENCE 7b — three options when status runs out ─────────── */
export const ThreePaths: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  const paths = [
    {t: 'Leave Canada', s: 'Go home or move elsewhere', c: C.grey, y: 250},
    {t: 'Apply for another status — and wait', s: 'If eligible for another permit or pathway', c: C.cobalt, y: 540},
    {t: 'Stay without legal status', s: 'The riskiest outcome', c: C.red, y: 830},
  ];
  return (
    <Stage tone="ink">
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        {paths.map((q, i) => {
          const t = p(f, 10 + i * 8, 46 + i * 8, E.quintOut);
          const d = `M520 540 C760 540, 760 ${q.y}, 1000 ${q.y}`;
          return <path key={i} d={d} stroke={q.c} strokeWidth={10} fill="none" strokeDasharray={800} strokeDashoffset={800 * (1 - t)} strokeLinecap="round" />;
        })}
      </svg>
      <div style={{position: 'absolute', left: 120, top: 440, width: 400}}>
        <div style={{fontFamily: F.mono, fontSize: 22, color: C.note, letterSpacing: '0.2em'}}>PERMIT EXPIRES</div>
        <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 52, color: C.white, lineHeight: 1.05, marginTop: 10}}>No PR. No other visa.</div>
      </div>
      {paths.map((q, i) => (
        <div key={i} style={{position: 'absolute', left: 1030, top: q.y - 60, width: 800, opacity: p(f, 30 + i * 8, 44 + i * 8)}}>
          <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 52, color: i === 2 ? C.coral : C.white}}>{q.t}</div>
          <div style={{fontFamily: F.mono, fontSize: 22, color: C.grey, marginTop: 8, letterSpacing: '0.06em'}}>{q.s.toUpperCase()}</div>
        </div>
      ))}
    </Stage>
  );
};

/* ── Temporary resident population ─────────── */
export const TRPopulation: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  const pts = [
    {l: 'PEAK · LATE 2024', v: 3.15},
    {l: 'MID-2026', v: 2.56},
  ];
  const X = (i: number) => 320 + i * 1200;
  const Y = (v: number) => 880 - (v - 2.2) * 620;
  const t = p(f, 6, 80, E.quintInOut);
  const line = pts.map((q, i) => `${i ? 'L' : 'M'}${X(i)} ${Y(q.v)}`).join(' ');
  const area = line + ` L${X(pts.length - 1)} 900 L${X(0)} 900 Z`;
  return (
    <Stage tone="white">
      <div style={{position: 'absolute', left: 120, top: 90}}>
        <Eyebrow text="NON-PERMANENT RESIDENTS IN CANADA (MILLIONS)" />
      </div>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <defs>
          <clipPath id="rev">
            <rect x={0} y={0} width={220 + 1500 * t} height={1080} />
          </clipPath>
        </defs>
        <g clipPath="url(#rev)">
          <path d={area} fill="rgba(53,108,246,0.12)" />
          <path d={line} stroke={C.cobalt} strokeWidth={7} fill="none" strokeDasharray="18 14" />
        </g>
        {pts.map((q, i) => (
          <g key={i} opacity={p(f, 6 + i * 16, 20 + i * 16)}>
            <circle cx={X(i)} cy={Y(q.v)} r={12} fill={i === 0 || i === 4 ? C.ink : '#fff'} stroke={C.ink} strokeWidth={4} />
            {i === 0 || i === pts.length - 1 ? (
              <text x={X(i)} y={Y(q.v) - 36} textAnchor="middle" fontFamily={F.display} fontWeight={800} fontSize={64} fill={i === 0 ? C.ink : C.coral}>
                {q.v.toFixed(2)}M
              </text>
            ) : null}
            <text x={X(i)} y={960} textAnchor="middle" fontFamily={F.mono} fontSize={22} fill="#5B6675">
              {q.l}
            </text>
          </g>
        ))}
      </svg>
      <div style={{position: 'absolute', right: 140, top: 180, textAlign: 'right', opacity: p(f, 70, 86)}}>
        <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 110, color: C.coral}}>−590,000</div>
        <div style={{fontFamily: F.mono, fontSize: 22, color: '#5B6675'}}>IN ROUGHLY 18 MONTHS</div>
      </div>
      <Source text="Statistics Canada quarterly estimates (start and end points only; path between them not plotted)" delay={30} />
    </Stage>
  );
};

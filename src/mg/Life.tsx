import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {geoPath, geoNaturalEarth1, geoConicConformal} from 'd3-geo';
import {feature} from 'topojson-client';
import {C, F} from '../theme';
import {E, p, sp, rnd, lerp} from '../lib/anim';
import {MaskLine, TypeOn, Words, Counter, Rule, Highlight} from '../components/Type';
import {Stage, Eyebrow, Paper, DocLines, Stamp, MG, Rig, Source, PersonGlyph, exitFade} from './kit';
import {Vignette} from '../components/Look';
import land110 from 'world-atlas/land-110m.json';
import canada from '../data/canada_provinces.json';

/* ── 1 in 6 students who look for work can't find it ─────────── */
export const OneInSix: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  return (
    <Stage tone="white">
      <div style={{position: 'absolute', left: 140, top: 130}}>
        <Eyebrow text="STUDENTS AGED 15–24 · APRIL 2026" />
        <div style={{height: 20}} />
        <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 200, color: C.ink, lineHeight: 0.9, letterSpacing: '-0.04em'}}>
          <Counter to={16} delay={4} dur={30} suffix="%" />
        </div>
        <Words text="student unemployment — about one in six job-seekers." delay={10} stagger={1.8} style={{fontFamily: F.serif, fontSize: 56, color: '#3A4454', marginTop: 10, maxWidth: 1000}} />
      </div>
      <div style={{position: 'absolute', left: 140, top: 640, display: 'flex', gap: 46}}>
        {Array.from({length: 6}).map((_, i) => {
          const a = p(f, 20 + i * 5, 34 + i * 5, E.backOut);
          const off = i === 5 && f > 60;
          return (
            <div key={i} style={{transform: `translateY(${(1 - a) * 50}px)`, opacity: Math.min(1, a * 1.4)}}>
              <PersonGlyph size={150} color={off ? C.coral : C.midnight} style={{opacity: off ? 1 : 0.9}} />
            </div>
          );
        })}
      </div>
      <Source text="Statistics Canada, Labour Force Survey, April 2026" delay={30} />
    </Stage>
  );
};

/* ── Rent invoice + conversion to rupees ─────────── */
export const RentInvoice: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = sp(f, fps, 0, {damping: 18});
  const conv = p(f, 40, 70, E.quintInOut);
  return (
    <Stage tone="white">
      <Rig keys={[{f: 0, rx: 24, ry: 10, s: 0.94}, {f: dur, rx: 12, ry: 2, s: 1.02}]}>
        <Paper w={760} h={880} style={{left: 160, top: 100, padding: 60, boxSizing: 'border-box', transform: `translateY(${(1 - s) * 400}px) rotate(-2deg)`}}>
          <div style={{fontFamily: F.mono, fontSize: 22, letterSpacing: '0.24em', color: C.cobalt}}>MONTHLY RENT · TORONTO</div>
          <Rule delay={6} color={C.ink} width="100%" height={2} style={{margin: '26px 0'}} />
          <div style={{fontFamily: F.mono, fontSize: 24, color: '#6B7685'}}>ONE-BEDROOM · MEDIAN ASKING</div>
          <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 150, color: C.ink, marginTop: 10, letterSpacing: '-0.03em'}}>
            C$<Counter to={2150} delay={8} dur={30} />
          </div>
          <div style={{fontFamily: F.mono, fontSize: 24, color: '#6B7685'}}>PER MONTH · SEPTEMBER 2026</div>
          <div style={{marginTop: 40}}>
            <DocLines n={7} w={620} seed={8} />
          </div>
        </Paper>
      </Rig>
      <div style={{position: 'absolute', left: 1080, top: 330, opacity: conv, transform: `translateX(${(1 - conv) * 80}px)`}}>
        <div style={{fontFamily: F.mono, fontSize: 26, color: C.midnight, letterSpacing: '0.2em'}}>IN RUPEES</div>
        <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 170, color: C.coral, letterSpacing: '-0.03em'}}>≈ ₹1.3 lakh</div>
        <div style={{fontFamily: F.serif, fontSize: 52, color: C.ink}}>every month, for one room.</div>
      </div>
      <Source text="Door Insight via Moving2Canada, Sept 2026 (median asking rent)" delay={30} />
    </Stage>
  );
};

/* ── Telugu community estimate 80% → 20% ─────────── */
export const CommunityEstimate: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  const a = p(f, 6, 40, E.expoOut);
  const b = p(f, 40, 80, E.expoOut);
  return (
    <Stage tone="ink">
      <div style={{position: 'absolute', left: 120, top: 110}}>
        <Eyebrow text="TELUGU GRADUATES WHO GOT PERMITS & JOBS" color={C.note} />
      </div>
      <div style={{position: 'absolute', left: 120, top: 280, display: 'flex', gap: 120, alignItems: 'flex-end'}}>
        {[{v: 80, l: 'A FEW YEARS AGO', d: 6, c: '#4C6A96', t: a}, {v: 20, l: 'NOW', d: 40, c: C.coral, t: b}].map((x, i) => (
          <div key={i}>
            <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 160, color: i ? C.coral : C.white, lineHeight: 1}}>
              <Counter to={x.v} delay={x.d} dur={30} suffix="%" />
            </div>
            <div style={{width: 360, height: 30, background: 'rgba(220,226,234,0.15)', marginTop: 20}}>
              <div style={{height: 30, width: 360 * (x.v / 100) * x.t, background: x.c}} />
            </div>
            <div style={{fontFamily: F.mono, fontSize: 22, color: C.grey, marginTop: 14}}>{x.l}</div>
          </div>
        ))}
      </div>
      <div
        style={{
          position: 'absolute',
          right: 130,
          top: 330,
          width: 560,
          background: C.note,
          padding: 40,
          transform: `rotate(${2 - p(f, 50, 70) * 2}deg) translateY(${(1 - p(f, 50, 70, E.backOut)) * 60}px)`,
          opacity: p(f, 50, 66),
        }}
      >
        <div style={{fontFamily: F.mono, fontSize: 20, letterSpacing: '0.24em', color: C.midnight}}>RESEARCH NOTE</div>
        <div style={{fontFamily: F.serif, fontSize: 48, color: C.ink, marginTop: 14, lineHeight: 1.05}}>An estimate from Telugu community leaders in Toronto.</div>
        <div style={{fontFamily: F.display, fontWeight: 700, fontSize: 26, color: C.red, marginTop: 14}}>Not official data.</div>
      </div>
    </Stage>
  );
};

/* ── SEQUENCE 8 core: what the photo leaves out ─────────── */
export const LifeChecklist: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const rows = [
    {k: 'DEGREE', v: 'Completed', c: C.cobalt},
    {k: 'EDUCATION LOAN', v: 'Still running', c: C.coral},
    {k: 'JOB', v: 'None yet', c: C.coral},
    {k: 'WORK PERMIT', v: 'Expiring', c: C.red},
  ];
  const pull = p(f, 0, 40, E.quintInOut);
  return (
    <Stage tone="ink" grid={false}>
      <div style={{position: 'absolute', left: lerp(560, 120, pull), top: lerp(150, 200, pull), width: lerp(800, 700, pull), height: lerp(780, 680, pull), background: '#fff', padding: 18, boxShadow: '0 50px 100px rgba(0,0,0,0.5)', transform: `rotate(${-2 * pull}deg)`}}>
        <Img src={staticFile('photos/status_photo.jpg')} style={{width: '100%', height: '80%', objectFit: 'cover'}} />
        <div style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: 46, color: C.ink, marginTop: 20, textAlign: 'center'}}>“All good here!”</div>
      </div>
      <div style={{position: 'absolute', left: 940, top: 230, width: 860}}>
        <div style={{fontFamily: F.mono, fontSize: 22, color: C.note, letterSpacing: '0.26em', opacity: p(f, 20, 34)}}>OUTSIDE THE FRAME</div>
        {rows.map((r, i) => {
          const s = sp(f, fps, 24 + i * 8, {damping: 16, stiffness: 150});
          return (
            <div key={i} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '2px solid rgba(220,226,234,0.18)', padding: '26px 0', transform: `translateX(${(1 - s) * 120}px)`, opacity: Math.min(1, s * 1.5)}}>
              <span style={{fontFamily: F.mono, fontSize: 26, color: C.silver, letterSpacing: '0.14em'}}>{r.k}</span>
              <span style={{fontFamily: F.display, fontWeight: 800, fontSize: 54, color: r.c}}>{r.v}</span>
            </div>
          );
        })}
      </div>
    </Stage>
  );
};

/* ── Viral claim: unverified ─────────── */
export const ViralClaim: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = sp(f, fps, 0, {damping: 18});
  return (
    <Stage tone="ink" grid={false}>
      <div style={{position: 'absolute', left: 700, top: 80, width: 520, height: 920, borderRadius: 60, background: '#0B0E13', padding: 14, boxShadow: '0 50px 100px rgba(0,0,0,0.6)', transform: `translateY(${(1 - s) * 400}px) rotate(${(1 - s) * 8}deg)`}}>
        <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 48, overflow: 'hidden'}}>
          <Img src={staticFile('images/wasaga_beach_2024.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(16px) brightness(0.6) saturate(0.6)'}} />
          <div style={{position: 'absolute', bottom: 120, left: 30, right: 30}}>
            {[0.9, 0.7, 0.5].map((w, i) => (
              <div key={i} style={{height: 18, width: `${w * 100}%`, background: 'rgba(255,255,255,0.75)', borderRadius: 9, marginBottom: 14}} />
            ))}
          </div>
          <div style={{position: 'absolute', right: 26, bottom: 260, display: 'flex', flexDirection: 'column', gap: 30}}>
            {['♥', '💬', '↗'].map((x, i) => (
              <div key={i} style={{width: 70, height: 70, borderRadius: 35, background: 'rgba(255,255,255,0.18)', color: '#fff', fontSize: 34, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                {x}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Stamp text="UNVERIFIED" delay={18} rot={-12} size={84} color={C.red} style={{left: 690, top: 440, mixBlendMode: 'normal', background: 'rgba(23,28,36,0.6)'}} />
      <div style={{position: 'absolute', left: 120, top: 380, width: 520}}>
        <Eyebrow text="WASAGA BEACH · 2024" color={C.coral} />
        <div style={{height: 20}} />
        <Words text="A viral claim blaming Indians — never substantiated." delay={6} stagger={1.8} style={{fontFamily: F.serif, fontSize: 56, color: C.white, lineHeight: 1.08}} />
      </div>
      <div style={{position: 'absolute', left: 120, top: 760, width: 520, fontFamily: F.mono, fontSize: 20, color: C.grey, lineHeight: 1.5, opacity: p(f, 30, 44)}}>
        THE ORIGINAL VIDEO IS NOT REPRODUCED HERE. THE TOWN PUBLICLY DISPUTED THE CLAIMS.
      </div>
    </Stage>
  );
};

/* ── AI images "Canada in 2050" — described, not reproduced ─────────── */
export const AIImageCard: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  const scan = (f * 9) % 1080;
  return (
    <Stage tone="ink" grid={false}>
      <div style={{position: 'absolute', left: 160, top: 160, width: 1000, height: 640, overflow: 'hidden', background: '#0E1520', border: '2px solid rgba(220,226,234,0.2)'}}>
        <svg width={1000} height={640}>
          {Array.from({length: 26}).map((_, i) => {
            const w = 24 + rnd(i) * 40;
            const h = 120 + rnd(i + 5) * 360;
            const x = i * 39;
            return <rect key={i} x={x} y={640 - h} width={w} height={h} fill="#1E2A3B" />;
          })}
        </svg>
        <div style={{position: 'absolute', left: 0, right: 0, top: scan % 640, height: 3, background: 'rgba(53,108,246,0.7)', boxShadow: '0 0 20px rgba(53,108,246,0.8)'}} />
        <div style={{position: 'absolute', left: 30, top: 26, fontFamily: F.mono, fontSize: 22, color: C.coral, letterSpacing: '0.2em', border: `2px solid ${C.coral}`, padding: '6px 14px'}}>AI-GENERATED · SYNTHETIC</div>
      </div>
      <div style={{position: 'absolute', left: 1220, top: 260, width: 560}}>
        <Eyebrow text="ANONYMOUS ACCOUNTS" color={C.note} />
        <div style={{height: 20}} />
        <Words text="Fabricated images of Indian flags over Canadian cities, captioned “Canada in 2050”." delay={6} stagger={1.5} style={{fontFamily: F.serif, fontSize: 52, color: C.white, lineHeight: 1.08}} />
        <div style={{marginTop: 26, fontFamily: F.mono, fontSize: 20, color: C.grey, lineHeight: 1.5, opacity: p(f, 30, 44)}}>DESCRIBED, NOT REPRODUCED.</div>
      </div>
    </Stage>
  );
};

/* ── Regular levels 2027–2029 ─────────── */
export const LevelsTable: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  const rows = [
    {k: 'Permanent residents', v: 380000},
    {k: 'New temporary residents', v: 370000},
    {k: '— of which international students', v: 150000, sub: true},
  ];
  return (
    <Stage tone="white">
      <div style={{position: 'absolute', left: 140, top: 130}}>
        <Eyebrow text="BUDGET 2026 · REGULAR LEVELS, EACH YEAR 2027–2029" />
      </div>
      <div style={{position: 'absolute', left: 140, top: 280, width: 1640}}>
        <div style={{display: 'flex', fontFamily: F.mono, fontSize: 22, color: '#5B6675', borderBottom: `3px solid ${C.ink}`, paddingBottom: 14}}>
          <div style={{flex: 1}}>CATEGORY</div>
          {['2027', '2028', '2029'].map((y) => (
            <div key={y} style={{width: 280, textAlign: 'right'}}>{y}</div>
          ))}
        </div>
        {rows.map((r, i) => (
          <div key={i} style={{display: 'flex', alignItems: 'baseline', borderBottom: '1px solid #D5DBE3', padding: '30px 0', opacity: p(f, 8 + i * 8, 22 + i * 8)}}>
            <div style={{flex: 1, fontFamily: r.sub ? F.serif : F.display, fontWeight: r.sub ? 400 : 700, fontSize: r.sub ? 40 : 48, color: r.sub ? '#5B6675' : C.ink}}>{r.k}</div>
            {[0, 1, 2].map((j) => (
              <div key={j} style={{width: 280, textAlign: 'right', fontFamily: F.display, fontWeight: 800, fontSize: r.sub ? 44 : 64, color: r.sub ? '#5B6675' : C.ink}}>
                <Counter to={r.v} delay={10 + i * 8 + j * 4} dur={26} />
              </div>
            ))}
          </div>
        ))}
      </div>
      <Source text="IRCC, 2027–2029 Immigration Levels Plan backgrounder (5 Nov 2026)" delay={24} />
    </Stage>
  );
};

/* ── Selection: Canada chooses whom to keep ─────────── */
export const SelectionSieve: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  const N = 90;
  return (
    <Stage tone="midnight" grid={false}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 520, height: 8, background: `repeating-linear-gradient(90deg, ${C.silver}, ${C.silver} 40px, transparent 40px, transparent 70px)`, opacity: 0.8}} />
      {Array.from({length: N}).map((_, i) => {
        const x = 160 + (i % 18) * 92;
        const row = Math.floor(i / 18);
        const keep = rnd(i * 2.3) < 0.42;
        const t = p(f, 10 + row * 6 + (i % 18) * 0.6, 60 + row * 6 + (i % 18) * 0.6, E.inQuad);
        const y = keep ? lerp(120 + row * 70, 640 + row * 70, t) : lerp(120 + row * 70, 470 + (row % 2) * 6, Math.min(1, t * 1.2));
        return (
          <div key={i} style={{position: 'absolute', left: x, top: y}}>
            <PersonGlyph size={44} color={keep && t > 0.7 ? C.note : keep ? C.white : 'rgba(173,182,194,0.5)'} />
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 140, bottom: 80, width: 1640, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', opacity: p(f, 70, 90)}}>
        <Words text="Not inviting new people — choosing whom to keep." delay={70} stagger={2} style={{fontFamily: F.serif, fontSize: 64, color: C.white}} />
      </div>
      <div style={{position: 'absolute', left: 140, top: 60}}>
        <Eyebrow text="ALREADY IN CANADA" color={C.note} />
      </div>
    </Stage>
  );
};

/* ── Not automatic: eligibility structure ─────────── */
export const NotAutomatic: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  const items = [
    {h: 'WORKERS COHORT · UP TO 100,000', l: ['Nominated by provinces & territories for regional needs (incl. PNP)', 'Or already applied to certain federal programs (e.g. Atlantic Immigration, Agri-Food, home care)']},
    {h: 'HUMANITARIAN COHORT · UP TO 100,000', l: ['Remaining Hong Kong & Ukraine family pathway applications', 'Approved humanitarian cases; spouses & children of Canadians/PRs in Canada']},
  ];
  return (
    <Stage tone="white">
      <div style={{position: 'absolute', left: 140, top: 100}}>
        <Eyebrow text="WHO THE MEASURE IS FOR · OFFICIAL DESCRIPTION" />
      </div>
      {items.map((it, i) => (
        <div key={i} style={{position: 'absolute', left: 140 + i * 840, top: 230, width: 780, opacity: p(f, 6 + i * 10, 20 + i * 10)}}>
          <div style={{fontFamily: F.mono, fontSize: 24, color: i ? C.midnight : C.cobalt, letterSpacing: '0.12em'}}>{it.h}</div>
          <Rule delay={8 + i * 10} color={C.ink} width="100%" height={2} style={{margin: '18px 0'}} />
          {it.l.map((x, j) => (
            <div key={j} style={{fontFamily: F.serif, fontSize: 42, color: C.ink, lineHeight: 1.15, marginBottom: 20}}>
              {x}
            </div>
          ))}
        </div>
      ))}
      <Stamp text="NOT AUTOMATIC PR" delay={46} rot={-6} size={92} color={C.red} style={{left: 560, top: 720}} />
      <div style={{position: 'absolute', right: 140, bottom: 70, fontFamily: F.mono, fontSize: 22, color: '#5B6675', opacity: p(f, 60, 74)}}>FULL RULES NOT YET PUBLISHED (AS OF NOV 2026)</div>
    </Stage>
  );
};

/* ── Carney vs Poilievre ─────────── */
export const FaceOff: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  const a = p(f, 0, 26, E.expoOut);
  const b = p(f, 10, 36, E.expoOut);
  const card = (img: string, name: string, role: string, quote: string, t: number, left: number, d: number) => (
    <div style={{position: 'absolute', left, top: 0, width: 960, height: 1080, overflow: 'hidden', clipPath: `inset(${(1 - t) * 100}% 0 0 0)`}}>
      <Img src={staticFile(img)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 20%', filter: 'contrast(1.05) saturate(0.9)', transform: `scale(${1.1 - 0.06 * p(f, 0, dur)})`}} />
      <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(14,18,25,0.92) 0%, rgba(14,18,25,0.2) 50%, rgba(14,18,25,0) 70%)'}} />
      <div style={{position: 'absolute', left: 70, bottom: 90, width: 820}}>
        <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 64, color: C.white}}>{name}</div>
        <div style={{fontFamily: F.mono, fontSize: 22, color: C.note, letterSpacing: '0.14em', marginTop: 6}}>{role}</div>
        <div style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: 52, color: C.white, marginTop: 18, opacity: p(f, d, d + 16)}}>{quote}</div>
      </div>
    </div>
  );
  return (
    <AbsoluteFill style={{background: C.ink}}>
      {card('images/carney_2025.png', 'Mark Carney', 'PRIME MINISTER', 'Defends the measure', a, 0, 30)}
      {card('images/poilievre.jpg', 'Pierre Poilievre', 'LEADER OF THE OPPOSITION', 'Calls it a “disaster”', b, 960, 50)}
      <div style={{position: 'absolute', left: 957, top: 0, width: 6, height: 1080, background: C.white, transform: `scaleY(${p(f, 10, 30)})`}} />
      <div style={{position: 'absolute', right: 30, top: 24, fontFamily: F.mono, fontSize: 14, color: 'rgba(247,248,250,0.6)'}}>PHOTOS: WIKIMEDIA COMMONS (SEE CREDITS)</div>
    </AbsoluteFill>
  );
};

/* ── The postcard returns ─────────── */
export const PostcardReturn: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  const t = p(f, 0, 50, E.quintInOut);
  const notes = ['₹40 lakh loan', 'Permit expiring', 'Shared room', 'C$2,150 rent', 'Job search'];
  return (
    <Stage tone="ink" grid={false}>
      <div style={{position: 'absolute', left: lerp(160, 560, t), top: lerp(60, 170, t), width: lerp(1600, 800, t), height: lerp(960, 600, t), background: '#fff', padding: 18, boxShadow: '0 60px 120px rgba(0,0,0,0.6)', transform: `rotate(${lerp(0, -3, t)}deg)`}}>
        <Img src={staticFile('photos/status_photo.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
      </div>
      <div style={{position: 'absolute', left: 120, top: 80, opacity: p(f, 20, 34)}}>
        <Eyebrow text="THE SAME PHOTO · 40 REPLIES" color={C.note} />
      </div>
      {notes.map((n, i) => {
        const a = p(f, 50 + i * 8, 68 + i * 8, E.backOut);
        const pos = [
          [180, 300],
          [1420, 250],
          [200, 720],
          [1400, 760],
          [820, 860],
        ][i];
        return (
          <div key={i} style={{position: 'absolute', left: pos[0], top: pos[1], background: C.note, padding: '18px 28px', fontFamily: F.display, fontWeight: 800, fontSize: 38, color: C.ink, transform: `scale(${a}) rotate(${(rnd(i) - 0.5) * 8}deg)`, boxShadow: '0 20px 40px rgba(0,0,0,0.35)'}}>
            {n}
          </div>
        );
      })}
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 70, textAlign: 'center', opacity: p(f, 100, 120)}}>
        <MaskLine delay={100}>
          <div style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: 72, color: C.white}}>Does it look different now?</div>
        </MaskLine>
      </div>
    </Stage>
  );
};

/* ── Budget: living-cost requirement ─────────── */
export const BudgetCard: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  const steps = [
    {l: 'JAN 2024 RULE', v: 'C$20,635', d: 8},
    {l: 'SEPT 2025', v: 'C$22,895', d: 26},
  ];
  return (
    <Stage tone="white">
      <div style={{position: 'absolute', left: 140, top: 120}}>
        <Eyebrow text="GROUND REALITY 04 · BUDGET" />
        <div style={{height: 24}} />
        <Words text="Proof of living funds — on top of tuition." delay={4} stagger={2} style={{fontFamily: F.serif, fontSize: 80, color: C.ink}} />
      </div>
      <div style={{position: 'absolute', left: 140, top: 420, display: 'flex', gap: 70, alignItems: 'flex-end'}}>
        {steps.map((x, i) => (
          <div key={i} style={{opacity: p(f, x.d, x.d + 14)}}>
            <div style={{fontFamily: F.mono, fontSize: 22, color: '#5B6675'}}>{x.l}</div>
            <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 84, color: '#8A94A3', position: 'relative'}}>
              {x.v}
              <div style={{position: 'absolute', left: 0, top: '52%', height: 5, width: `${p(f, x.d + 26, x.d + 40) * 100}%`, background: C.red}} />
            </div>
          </div>
        ))}
        <div style={{opacity: p(f, 50, 64)}}>
          <div style={{fontFamily: F.mono, fontSize: 22, color: C.cobalt}}>SINCE 1 SEPT 2026 · SINGLE APPLICANT</div>
          <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 150, color: C.ink, letterSpacing: '-0.03em'}}>
            C$<Counter from={22895} to={23448} delay={52} dur={30} />
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 140, top: 760, width: 1500, fontFamily: F.serif, fontSize: 44, color: '#3A4454', opacity: p(f, 70, 84)}}>
        The minimum rises every year. In big cities, rent takes the major share of income.
      </div>
      <Source text="IRCC proof-of-funds requirement (outside Quebec), as updated Sept 2025 and Sept 2026" delay={30} />
    </Stage>
  );
};

/* ── Alternatives: Germany, New Zealand ─────────── */
export const AlternativesMap: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  const land = feature(land110 as any, (land110 as any).objects.land) as any;
  const rot = lerp(-40, -60, p(f, 0, dur, E.cubicInOut));
  const proj = geoNaturalEarth1().rotate([rot, 0]).fitExtent([[80, 140], [1840, 1000]], {type: 'Sphere'} as any);
  const path = geoPath(proj);
  const pts = [
    {n: 'CANADA', c: [-96, 56], col: C.grey},
    {n: 'GERMANY', c: [10.4, 51.2], col: C.cobalt},
    {n: 'NEW ZEALAND', c: [172, -41], col: C.cobalt},
    {n: 'HYDERABAD', c: [78.5, 17.4], col: C.coral},
  ];
  const [hx, hy] = proj(pts[3].c as any) as [number, number];
  return (
    <Stage tone="white" grid={false}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        <path d={path({type: 'Sphere'} as any) || ''} fill="#EEF2F7" />
        <path d={path(land) || ''} fill="#D3DAE3" stroke="#fff" strokeWidth={0.8} />
        {pts.slice(0, 3).map((q, i) => {
          const [x, y] = proj(q.c as any) as [number, number];
          const t = p(f, 10 + i * 12, 40 + i * 12, E.quintOut);
          const mx = (x + hx) / 2;
          const my = Math.min(y, hy) - 160;
          return (
            <g key={i}>
              <path d={`M${hx} ${hy} Q${mx} ${my} ${x} ${y}`} stroke={q.col} strokeWidth={i ? 5 : 3} fill="none" strokeDasharray={i ? '0' : '10 10'} pathLength={1} strokeDashoffset={0} opacity={t} />
              <circle cx={x} cy={y} r={12 * t} fill={q.col} />
              <text x={x} y={y - 26} textAnchor="middle" fontFamily={F.display} fontWeight={800} fontSize={34} fill={i ? C.ink : '#8A94A3'} opacity={t}>
                {q.n}
              </text>
            </g>
          );
        })}
        <circle cx={hx} cy={hy} r={12} fill={C.coral} />
      </svg>
      <div style={{position: 'absolute', left: 120, top: 70}}>
        <Eyebrow text="GROUND REALITY 05 · ALTERNATIVES" />
        <div style={{height: 14}} />
        <Words text="Canada is one option — no longer the default." delay={6} stagger={2} style={{fontFamily: F.serif, fontSize: 64, color: C.ink}} />
      </div>
    </Stage>
  );
};

/* ── The formula returns: who sold it ─────────── */
export const FormulaReturn: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  const lines = ['Sold by consultancies.', 'Believed by relatives.', 'Rewarded by Canada — for a few years.', 'Then the rules changed.'];
  return (
    <Stage tone="white">
      <div style={{position: 'absolute', left: 160, top: 220}}>
        <Eyebrow text="THE KHAMMAM STUDENT FOLLOWED THE FORMULA" />
        <div style={{height: 30}} />
        {lines.map((l, i) => (
          <MaskLine key={i} delay={6 + i * 10}>
            <div style={{fontFamily: i === 3 ? F.display : F.serif, fontWeight: i === 3 ? 800 : 400, fontSize: i === 3 ? 84 : 78, color: i === 3 ? C.red : C.ink, lineHeight: 1.2}}>{l}</div>
          </MaskLine>
        ))}
      </div>
    </Stage>
  );
};

/* ── Family land on a scale against one policy document ─────────── */
export const LandOnScale: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  const tilt = interpolate(p(f, 20, 70, E.backOut), [0, 1], [0, -9]);
  return (
    <Stage tone="ink" grid={false}>
      <div style={{position: 'absolute', left: 960, top: 300, width: 8, height: 560, background: C.silver, marginLeft: -4}} />
      <div style={{position: 'absolute', left: 260, top: 290, width: 1400, height: 8, background: C.silver, transform: `rotate(${tilt}deg)`, transformOrigin: '50% 50%'}}>
        <div style={{position: 'absolute', left: 0, top: 8, width: 2, height: 160, background: C.silver}} />
        <div style={{position: 'absolute', right: 0, top: 8, width: 2, height: 160, background: C.silver}} />
        <div style={{position: 'absolute', left: -200, top: 168, width: 400, height: 260, border: '10px solid #fff', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', transform: `rotate(${-tilt}deg)`}}>
          <Img src={staticFile('photos/india_rice.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
          <div style={{fontFamily: F.mono, fontSize: 22, color: C.silver, marginTop: 20, letterSpacing: '0.14em'}}>THE FAMILY’S LAND</div>
        </div>
        <div style={{position: 'absolute', right: -170, top: 168, width: 340, height: 220, background: C.paper, padding: 26, boxSizing: 'border-box', transform: `rotate(${-tilt}deg)`, boxShadow: '0 30px 60px rgba(0,0,0,0.5)'}}>
          <div style={{fontFamily: F.mono, fontSize: 18, color: C.cobalt, letterSpacing: '0.14em'}}>ONE BUDGET</div>
          <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 34, color: C.ink, marginTop: 8}}>Policy change</div>
          <div style={{marginTop: 14}}>
            <DocLines n={4} w={280} seed={4} />
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 90, textAlign: 'center', opacity: p(f, 40, 56)}}>
        <Words text="Dreaming is not the mistake. Betting the land on a policy is." delay={40} stagger={2} style={{justifyContent: 'center', fontFamily: F.serif, fontSize: 64, color: C.white}} />
      </div>
    </Stage>
  );
};

/* ── Final: the map of Canada and the question ─────────── */
export const FinalMap: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  const proj = geoConicConformal().parallels([49, 77]).rotate([96, 0]).fitExtent([[460, 50], [1460, 740]], canada as any);
  const path = geoPath(proj);
  const draw = p(f, 0, 50, E.quintOut);
  const fade = 1 - p(f, dur - 18, dur, E.cubicInOut);
  return (
    <AbsoluteFill style={{background: C.ink, opacity: fade}}>
      <svg width={1920} height={1080} style={{position: 'absolute'}}>
        {(canada as any).features.map((x: any, i: number) => (
          <path key={i} d={path(x) || ''} fill={`rgba(53,108,246,${0.08 + 0.1 * draw})`} stroke={C.silver} strokeWidth={1.2} strokeDasharray={5000} strokeDashoffset={5000 * (1 - draw)} />
        ))}
      </svg>
      <Vignette strength={0.6} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 800, textAlign: 'center'}}>
        <Words text="Is Canada opening its doors to everyone —" delay={10} stagger={2} style={{justifyContent: 'center', fontFamily: F.serif, fontSize: 64, color: C.white}} />
        <Words text="or selecting the people it needs?" delay={26} stagger={2} style={{justifyContent: 'center', fontFamily: F.serif, fontStyle: 'italic', fontSize: 64, color: C.note}} />
      </div>
    </AbsoluteFill>
  );
};

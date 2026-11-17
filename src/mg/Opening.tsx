import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {C, F} from '../theme';
import {E, p, sp, rnd, lerp} from '../lib/anim';
import {MaskLine, TypeOn, Words, Counter, Rule} from '../components/Type';
import {Stage, Eyebrow, Paper, DocLines, Stamp, MG, exitFade, Rig, Source, PersonGlyph} from './kit';
import {Vignette} from '../components/Look';

const MapleLeaf: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <path
      fill={color}
      d="M50 4 L57 20 L66 15 L63 38 L78 25 L82 33 L96 30 L90 46 L97 50 L74 66 L78 76 L55 73 L54 96 L46 96 L45 73 L22 76 L26 66 L3 50 L10 46 L4 30 L18 33 L22 25 L37 38 L34 15 L43 20 Z"
    />
  </svg>
);

/* ── 1. A status update on a phone ─────────────────────────────── */
export const PhoneStatus: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = sp(f, fps, 2, {damping: 20, stiffness: 90, mass: 1.1});
  const push = p(f, dur - 40, dur, E.inExpo);
  const prog = p(f, 6, dur - 6, E.linear);
  return (
    <Stage tone="ink" grid={false}>
      <AbsoluteFill style={{background: `radial-gradient(circle at 34% 50%, rgba(53,108,246,0.35), rgba(0,0,0,0) 45%)`}} />
      <AbsoluteFill style={{perspective: 2000}}>
        <div
          style={{
            position: 'absolute',
            left: 330,
            top: 70,
            width: 480,
            height: 960,
            borderRadius: 64,
            background: '#0B0E13',
            padding: 16,
            boxShadow: '0 60px 120px rgba(0,0,0,0.6), inset 0 0 0 2px #2B3240',
            transform: `translateY(${(1 - enter) * 700}px) rotateY(${lerp(-26, -10, enter) + push * 10}deg) rotateX(${(1 - enter) * 10}deg) scale(${1 + push * 1.6}) translateX(${push * 260}px)`,
            transformOrigin: '50% 50%',
          }}
        >
          <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: 50, overflow: 'hidden', background: '#000'}}>
            <Img src={staticFile('photos/status_photo.jpg')} style={{position: 'absolute', height: '100%', left: '-62%', transform: `scale(${1.05 + prog * 0.06})`}} />
            <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.45), rgba(0,0,0,0) 22%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.55))'}} />
            {/* progress segments */}
            <div style={{position: 'absolute', top: 22, left: 18, right: 18, display: 'flex', gap: 6}}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} style={{flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.35)', overflow: 'hidden'}}>
                  <div style={{height: '100%', background: '#fff', width: `${i < 2 ? 100 : i === 2 ? prog * 100 : 0}%`}} />
                </div>
              ))}
            </div>
            <div style={{position: 'absolute', top: 44, left: 22, display: 'flex', alignItems: 'center', gap: 14}}>
              <div style={{width: 52, height: 52, borderRadius: 26, background: C.cobalt, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <MapleLeaf size={30} color="#fff" />
              </div>
              <div>
                <div style={{fontFamily: F.display, fontWeight: 700, color: '#fff', fontSize: 26}}>Friend</div>
                <div style={{fontFamily: F.display, color: 'rgba(255,255,255,0.75)', fontSize: 20}}>2h ago</div>
              </div>
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: 120,
                left: 0,
                right: 0,
                textAlign: 'center',
                fontFamily: F.display,
                fontWeight: 700,
                fontSize: 42,
                color: '#fff',
                textShadow: '0 4px 20px rgba(0,0,0,0.6)',
                opacity: p(f, 26, 40),
                transform: `translateY(${(1 - p(f, 26, 44)) * 20}px)`,
              }}
            >
              Settled. ❄
              <div style={{fontSize: 30, fontWeight: 500, marginTop: 6}}>Toronto life</div>
            </div>
          </div>
        </div>
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 960, top: 360, opacity: 1 - push}}>
        <Eyebrow text="STATUS · 2 HOURS AGO" color={C.note} delay={10} />
        <div style={{height: 26}} />
        <MaskLine delay={16} dur={28}>
          <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 132, color: C.white, lineHeight: 0.92, letterSpacing: '-0.03em'}}>Settled</div>
        </MaskLine>
        <MaskLine delay={22} dur={28}>
          <div style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: 120, color: C.silver, lineHeight: 1}}>in Canada.</div>
        </MaskLine>
      </div>
    </Stage>
  );
};

/* ── 2. Photo after photo ─────────────────────────────── */
const STACK = ['photos/coffee_snow.jpg', 'photos/friends_selfie.jpg', 'photos/apartment_bright.jpg', 'photos/skyline_cn.jpg', 'photos/status_photo.jpg'];
export const PhotoStack: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <Stage tone="white">
      <Rig keys={[{f: 0, rx: 28, s: 0.92, y: 30}, {f: dur, rx: 18, s: 1.04, y: 0}]} ease={E.cubicInOut}>
        {STACK.map((src, i) => {
          const d = i * 6;
          const s = sp(f, fps, d, {damping: 15, stiffness: 140, mass: 0.8});
          const r = (rnd(i + 4) - 0.5) * 22;
          const x = 960 - 300 + (rnd(i + 9) - 0.5) * 520;
          const y = 540 - 220 + (rnd(i + 21) - 0.5) * 220;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: 600,
                height: 440,
                background: '#fff',
                padding: '18px 18px 70px',
                boxShadow: `0 ${30 * s}px ${60 * s}px rgba(10,20,40,${0.28 * s})`,
                transform: `translateY(${(1 - s) * -500}px) rotate(${r + (1 - s) * 18}deg) scale(${1 + (1 - s) * 0.35})`,
                opacity: f >= d ? 1 : 0,
              }}
            >
              <Img src={staticFile(src)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
              <div style={{position: 'absolute', bottom: 22, left: 22, fontFamily: F.mono, fontSize: 18, color: '#7A8594', letterSpacing: '0.12em'}}>
                {['FIRST SNOW ☕', 'WEEKEND ✦', 'NEW PLACE', 'TORONTO', 'SETTLED'][i]}
              </div>
            </div>
          );
        })}
      </Rig>
      <div style={{position: 'absolute', right: 90, top: 70, fontFamily: F.mono, fontSize: 24, color: C.midnight, letterSpacing: '0.2em'}}>
        PHOTO{' '}
        <Counter to={STACK.length} dur={30} delay={0} style={{color: C.cobalt}} /> / {STACK.length}
      </div>
    </Stage>
  );
};

/* ── 3. The hook: the postcard pulls back and tears ─────────────── */
export const PostcardTear: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  const pull = p(f, 6, 58, E.quintInOut);
  const tear = p(f, 70, 104, E.anticip);
  const title = p(f, 96, 120);
  const items = [
    {x: -760, y: -300, r: -9, w: 520, h: 340, k: 'loan'},
    {x: 640, y: -330, r: 7, w: 470, h: 300, k: 'permit'},
    {x: -700, y: 300, r: 6, w: 470, h: 290, k: 'rent'},
    {x: 690, y: 290, r: -6, w: 440, h: 280, k: 'cash'},
  ];
  return (
    <Stage tone="ink" grid={false}>
      <AbsoluteFill style={{perspective: 2200}}>
        <AbsoluteFill style={{transformStyle: 'preserve-3d', transform: `rotateX(${pull * 22}deg) scale(${lerp(2.15, 0.78, pull)}) translateY(${pull * 40}px)`}}>
          {/* surrounding reality on the desk */}
          {items.map((it, i) => {
            const a = p(f, 20 + i * 5, 50 + i * 5, E.quintOut);
            return (
              <Paper
                key={i}
                w={it.w}
                h={it.h}
                style={{
                  left: 960 - it.w / 2 + it.x,
                  top: 540 - it.h / 2 + it.y,
                  transform: `rotate(${it.r}deg) translateY(${(1 - a) * 60}px)`,
                  opacity: a,
                  padding: 34,
                  boxSizing: 'border-box',
                }}
              >
                {it.k === 'loan' ? (
                  <>
                    <div style={{fontFamily: F.mono, fontSize: 20, letterSpacing: '0.2em', color: C.midnight}}>EDUCATION LOAN · STATEMENT</div>
                    <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 70, color: C.ink, marginTop: 18}}>₹40,00,000</div>
                    <div style={{fontFamily: F.mono, fontSize: 20, color: C.red, marginTop: 8}}>OUTSTANDING</div>
                    <div style={{marginTop: 22}}>
                      <DocLines n={4} w={420} seed={2} />
                    </div>
                  </>
                ) : it.k === 'permit' ? (
                  <>
                    <div style={{fontFamily: F.mono, fontSize: 20, letterSpacing: '0.2em', color: C.midnight}}>WORK PERMIT</div>
                    <div style={{fontFamily: F.mono, fontSize: 22, color: '#5B6675', marginTop: 18}}>VALID UNTIL</div>
                    <div style={{fontFamily: F.mono, fontWeight: 600, fontSize: 52, color: C.red, marginTop: 4}}>EXPIRING</div>
                    <div style={{marginTop: 18}}>
                      <DocLines n={3} w={380} seed={5} />
                    </div>
                  </>
                ) : it.k === 'rent' ? (
                  <>
                    <div style={{fontFamily: F.mono, fontSize: 20, letterSpacing: '0.2em', color: C.midnight}}>RENT DUE · 1-BEDROOM</div>
                    <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 70, color: C.ink, marginTop: 18}}>C$2,150</div>
                    <div style={{fontFamily: F.mono, fontSize: 20, color: '#5B6675', marginTop: 6}}>PER MONTH · TORONTO</div>
                  </>
                ) : (
                  <>
                    <div style={{fontFamily: F.mono, fontSize: 20, letterSpacing: '0.2em', color: C.midnight}}>WAGES · CASH</div>
                    <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 70, color: C.coral, marginTop: 18}}>C$7 / hr</div>
                    <div style={{fontFamily: F.mono, fontSize: 20, color: '#5B6675', marginTop: 6}}>NO PAYSLIP</div>
                  </>
                )}
              </Paper>
            );
          })}
          {/* the postcard */}
          <div style={{position: 'absolute', left: 960 - 560, top: 540 - 360, width: 1120, height: 720}}>
            {[0, 1].map((half) => {
              const isBottom = half === 1;
              const fall = isBottom ? tear : -tear * 0.35;
              return (
                <div
                  key={half}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: '#fff',
                    padding: 22,
                    clipPath: isBottom
                      ? 'polygon(0 54%, 8% 52%, 17% 56%, 26% 51%, 37% 55%, 49% 50%, 58% 55%, 70% 51%, 81% 56%, 92% 52%, 100% 55%, 100% 100%, 0 100%)'
                      : 'polygon(0 0, 100% 0, 100% 55%, 92% 52%, 81% 56%, 70% 51%, 58% 55%, 49% 50%, 37% 55%, 26% 51%, 17% 56%, 8% 52%, 0 54%)',
                    transform: `translateY(${fall * 900}px) rotate(${fall * 14}deg)`,
                    transformOrigin: '20% 55%',
                    boxShadow: '0 40px 90px rgba(0,0,0,0.5)',
                    opacity: 1 - fall * 0.2,
                  }}
                >
                  <div style={{position: 'relative', width: '100%', height: '100%', overflow: 'hidden'}}>
                    <Img src={staticFile('photos/status_photo.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                    <div style={{position: 'absolute', right: 30, top: 26, width: 150, height: 150, borderRadius: 75, border: `5px solid rgba(200,61,73,0.85)`, color: 'rgba(200,61,73,0.9)', fontFamily: F.mono, fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', transform: 'rotate(-12deg)', letterSpacing: '0.1em'}}>
                      CANADA
                      <br />
                      ✦ POST ✦
                    </div>
                    <div style={{position: 'absolute', left: 30, bottom: 26, fontFamily: F.serif, fontStyle: 'italic', fontSize: 64, color: '#fff', textShadow: '0 4px 24px rgba(0,0,0,0.6)'}}>Greetings from Toronto</div>
                  </div>
                </div>
              );
            })}
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
      <Vignette strength={0.55} />
      <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 45% at 50% 52%, rgba(14,18,25,${0.88 * title}) 0%, rgba(14,18,25,${0.6 * title}) 60%, rgba(14,18,25,${0.35 * title}) 100%)`}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 455, textAlign: 'center', opacity: title}}>
        <div style={{fontFamily: F.mono, fontSize: 26, letterSpacing: '0.4em', color: C.coral}}>
          <TypeOn text="THE OTHER SIDE" delay={96} cps={2} />
        </div>
        <MaskLine delay={100} dur={26}>
          <div style={{fontFamily: F.serif, fontSize: 104, color: C.white, marginTop: 10}}>What the photo doesn’t show.</div>
        </MaskLine>
      </div>
    </Stage>
  );
};

/* ── 4. Study visa → admission → classes attended: 0 ───────────── */
export const DocTally: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const cards = [
    {t: 'STUDY VISA', v: 'GRANTED', c: C.cobalt},
    {t: 'COLLEGE ADMISSION', v: 'ENROLLED', c: C.cobalt},
    {t: 'CLASSES ATTENDED', v: '0', c: C.red},
  ];
  return (
    <Stage tone="white">
      <Rig keys={[{f: 0, ry: -8, x: 60}, {f: dur, ry: 6, x: -60}]} ease={E.cubicInOut}>
        {cards.map((c, i) => {
          const s = sp(f, fps, 2 + i * 9, {damping: 17, stiffness: 150});
          return (
            <Paper
              key={i}
              w={470}
              h={560}
              style={{left: 190 + i * 530, top: 260, transform: `translateY(${(1 - s) * 160}px) rotate(${(i - 1) * 2}deg)`, opacity: Math.min(1, s * 1.5), padding: 44, boxSizing: 'border-box'}}
            >
              <div style={{fontFamily: F.mono, fontSize: 22, letterSpacing: '0.22em', color: '#5B6675'}}>{String(i + 1).padStart(2, '0')}</div>
              <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 46, color: C.ink, marginTop: 18, lineHeight: 1.05}}>{c.t}</div>
              <Rule delay={10 + i * 9} color={C.ink} width="100%" height={2} style={{margin: '26px 0'}} />
              <DocLines n={5} w={380} seed={i + 3} />
              <div style={{position: 'absolute', left: 44, bottom: 40, fontFamily: i === 2 ? F.display : F.mono, fontWeight: i === 2 ? 900 : 600, fontSize: i === 2 ? 170 : 40, color: c.c, lineHeight: 1}}>
                {i === 2 ? <Counter from={120} to={0} delay={22} dur={34} /> : c.v}
              </div>
            </Paper>
          );
        })}
      </Rig>
      <div style={{position: 'absolute', left: 190, top: 140}}>
        <Eyebrow text="ON PAPER: A STUDENT" />
      </div>
    </Stage>
  );
};

/* ── 5. Attribution card ─────────────── */
export const SourceCard: React.FC<MG> = ({dur, outlet, line}) => {
  const f = useCurrentFrame();
  return (
    <Stage tone="white" grid={false}>
      <div style={{position: 'absolute', left: 220, top: 330, width: 1480, opacity: exitFade(f, dur)}}>
        <Eyebrow text="REAL STORIES · NEWS REPORT" />
        <div style={{height: 30}} />
        <MaskLine delay={6}>
          <div style={{fontFamily: F.serif, fontSize: 70, color: '#5B6675'}}>Both accounts were reported by</div>
        </MaskLine>
        <MaskLine delay={12} dur={30}>
          <div style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: 168, color: C.ink, lineHeight: 1.02, letterSpacing: '-0.01em'}}>{outlet}</div>
        </MaskLine>
        <Rule delay={20} dur={30} color={C.ink} width={1480} height={3} style={{marginTop: 26}} />
        <div style={{marginTop: 22, fontFamily: F.mono, fontSize: 22, color: '#5B6675', letterSpacing: '0.12em', opacity: p(f, 30, 44)}}>
          IDENTITIES NOT PUBLISHED · FOOTAGE IS ILLUSTRATIVE OF THE SETTING, NOT THE INDIVIDUALS
        </div>
      </div>
    </Stage>
  );
};

/* ── 6. Group-chat photo with replies, then a crack ─────────── */
export const PostcardCrack: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const replies = ['Congrats bro!! 🔥', 'Settled ra 👏', 'Take me also', 'Proud of you', 'Superb life!'];
  const crack = p(f, 70, 110, E.quintOut);
  return (
    <Stage tone="ink" grid={false}>
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 40%, rgba(20,43,73,0.9), rgba(0,0,0,0) 60%)`}} />
      <Rig keys={[{f: 0, s: 0.96, ry: 6}, {f: dur, s: 1.06, ry: -4}]}>
        <div style={{position: 'absolute', left: 560, top: 110, width: 800, height: 600, background: '#fff', padding: 16, borderRadius: 26, boxShadow: '0 50px 100px rgba(0,0,0,0.55)'}}>
          <div style={{position: 'relative', width: '100%', height: '100%', overflow: 'hidden', borderRadius: 14}}>
            <Img src={staticFile('photos/status_photo.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
            <svg width="768" height="568" style={{position: 'absolute', inset: 0}}>
              {[
                'M384 284 L300 180 L250 160 L180 60 L150 0',
                'M384 284 L470 200 L520 210 L640 90 L700 40',
                'M384 284 L360 380 L300 430 L260 568',
                'M384 284 L500 330 L560 420 L700 470 L768 520',
                'M384 284 L250 300 L120 290 L0 330',
              ].map((d, i) => (
                <path key={i} d={d} stroke="rgba(255,255,255,0.95)" strokeWidth={3} fill="none" strokeDasharray={900} strokeDashoffset={900 * (1 - crack)} style={{filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.9))'}} />
              ))}
            </svg>
          </div>
        </div>
        <div style={{position: 'absolute', left: 560, top: 740, display: 'flex', flexWrap: 'wrap', gap: 14, width: 820}}>
          {replies.map((r, i) => {
            const s = sp(f, fps, 8 + i * 6, {damping: 14, stiffness: 180});
            return (
              <div key={i} style={{background: i % 2 ? '#26303F' : '#1F3A62', color: '#fff', fontFamily: F.display, fontSize: 30, padding: '12px 22px', borderRadius: 22, transform: `scale(${s})`, transformOrigin: 'left center', opacity: Math.min(1, s * 1.4)}}>
                {r}
              </div>
            );
          })}
        </div>
      </Rig>
      <div style={{position: 'absolute', left: 120, top: 50}}>
        <Eyebrow text="FAMILY GROUP · 40 REPLIES" color={C.note} />
      </div>
      <div style={{position: 'absolute', right: 110, bottom: 140, textAlign: 'right', opacity: p(f, 90, 110)}}>
        <MaskLine delay={92}>
          <div style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: 84, color: C.white}}>And behind it?</div>
        </MaskLine>
      </div>
    </Stage>
  );
};

/* ── 7. +200,000 on top of 380,000 ─────────── */
export const ExtraBlock: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  const a = p(f, 4, 40, E.expoOut);
  const b = p(f, 26, 66, E.backOut);
  const W1 = 1100 * a;
  const W2 = (1100 * 200 / 380) * b;
  return (
    <Stage tone="white">
      <div style={{position: 'absolute', left: 140, top: 210}}>
        <Eyebrow text="PERMANENT RESIDENCE · ANNOUNCED 5 NOV 2026" />
        <div style={{height: 22}} />
        <Words text="On top of the regular quota" delay={4} stagger={3} style={{fontFamily: F.serif, fontSize: 88, color: C.ink}} />
      </div>
      <div style={{position: 'absolute', left: 140, top: 520, display: 'flex', alignItems: 'flex-start'}}>
        <div>
          <div style={{width: W1, height: 150, background: C.cobalt}} />
          <div style={{fontFamily: F.mono, fontSize: 22, color: C.midnight, marginTop: 14, letterSpacing: '0.12em', opacity: a}}>REGULAR TARGET · 380,000 / YEAR</div>
        </div>
        <div>
          <div
            style={{
              width: W2,
              height: 150,
              background: `repeating-linear-gradient(-45deg, ${C.note}, ${C.note} 14px, #EAD98E 14px, #EAD98E 28px)`,
              borderLeft: `4px solid ${C.white}`,
            }}
          />
          <div style={{fontFamily: F.mono, fontSize: 22, color: '#7A6A1E', marginTop: 14, letterSpacing: '0.12em', opacity: b, width: 560}}>
            + UP TO 200,000 · ONE-TIME · ALREADY IN CANADA · BY END-2027
          </div>
        </div>
      </div>
      <Source text="IRCC, 2027–2029 Immigration Levels Plan backgrounder, 5 Nov 2026" delay={30} />
    </Stage>
  );
};

/* ── 8. The twist: Indians granted PR fell ─────────── */
export const IndianDropTeaser: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  const seatsT = p(f, 120, 150);
  return (
    <Stage tone="ink">
      <div style={{position: 'absolute', left: 130, top: 170}}>
        <Eyebrow text="INDIAN CITIZENS GRANTED PR · JANUARY–JULY" color={C.note} />
      </div>
      <div style={{position: 'absolute', left: 130, top: 300, display: 'flex', gap: 120, alignItems: 'flex-end'}}>
        <div>
          <div style={{fontFamily: F.mono, fontSize: 28, color: C.grey}}>2025</div>
          <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 150, color: C.white, letterSpacing: '-0.03em'}}>
            <Counter to={68690} delay={6} dur={40} />
          </div>
        </div>
        <div style={{fontFamily: F.display, fontSize: 90, color: C.grey, marginBottom: 40, opacity: p(f, 30, 44)}}>→</div>
        <div>
          <div style={{fontFamily: F.mono, fontSize: 28, color: C.grey}}>2026</div>
          <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 150, color: C.coral, letterSpacing: '-0.03em'}}>
            <Counter from={68690} to={53285} delay={34} dur={44} />
          </div>
        </div>
      </div>
      <div style={{position: 'absolute', left: 130, top: 560, opacity: p(f, 76, 92)}}>
        <MaskLine delay={78}>
          <div style={{fontFamily: F.display, fontWeight: 700, fontSize: 64, color: C.white}}>
            −15,405 <span style={{fontFamily: F.serif, fontStyle: 'italic', fontWeight: 400, color: C.silver}}>in seven months</span>
          </div>
        </MaskLine>
      </div>
      <div style={{position: 'absolute', left: 130, top: 720, display: 'flex', alignItems: 'center', gap: 34, opacity: seatsT}}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{transform: `translateY(${(1 - p(f, 120 + i * 5, 140 + i * 5, E.backOut)) * 40}px)`}}>
            <PersonGlyph size={70} color={i < 2 && f > 140 + i * 6 ? C.coral : C.silver} />
          </div>
        ))}
        <div style={{fontFamily: F.serif, fontSize: 54, color: C.white, marginLeft: 20}}>
          Two of every three PR places cut were Indian <span style={{fontFamily: F.mono, fontSize: 28, color: C.grey}}>(64%)</span>
        </div>
      </div>
      <Source text="IRCC monthly permanent resident data, Jan–Jul 2025 vs 2026" delay={40} dark />
    </Stage>
  );
};

/* ── 9. What this video covers ─────────── */
export const ChapterMenu: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  const rows = ['How the Canada craze began', 'Why Canada made a U-turn', 'Why Indians were hit hardest', 'The ground reality', 'The game behind 200,000 PRs'];
  return (
    <Stage tone="white">
      <div style={{position: 'absolute', left: 160, top: 170}}>
        <Eyebrow text="IN THIS FILM" />
        <div style={{height: 34}} />
        {rows.map((r, i) => (
          <div key={i} style={{display: 'flex', alignItems: 'baseline', gap: 30, height: 128, borderBottom: `2px solid rgba(23,28,36,${0.12 * p(f, i * 4, i * 4 + 14)})`}}>
            <div style={{fontFamily: F.mono, fontSize: 28, color: C.cobalt, width: 60, opacity: p(f, i * 4, i * 4 + 10)}}>{String(i + 1).padStart(2, '0')}</div>
            <MaskLine delay={i * 4} dur={22}>
              <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 84, color: C.ink, letterSpacing: '-0.02em'}}>{r}</div>
            </MaskLine>
          </div>
        ))}
      </div>
    </Stage>
  );
};

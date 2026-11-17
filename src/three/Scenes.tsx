import React, {useMemo} from 'react';
import * as THREE from 'three';
import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {geoEquirectangular, geoPath, geoInterpolate} from 'd3-geo';
import {feature} from 'topojson-client';
import land110 from 'world-atlas/land-110m.json';
import {C, F} from '../theme';
import {E, p, sp, rnd, lerp} from '../lib/anim';
import {CameraPath, Studio, Floor, useTex, useCanvasTex, roundRect} from './common';
import {MaskLine, TypeOn, Words, Counter} from '../components/Type';
import {Eyebrow, MG, Source} from '../mg/kit';
import {Vignette} from '../components/Look';

const Canvas3D: React.FC<{children: React.ReactNode; bg?: string; fog?: [number, number]}> = ({children, bg = C.ink, fog}) => (
  <ThreeCanvas width={1920} height={1080} shadows camera={{fov: 40, near: 0.1, far: 400, position: [0, 4, 14]}} gl={{antialias: true}}>
    <color attach="background" args={[bg]} />
    {fog ? <fog attach="fog" args={[bg, fog[0], fog[1]]} /> : null}
    {children}
  </ThreeCanvas>
);

/* ─────────────────────────── DOOR ─────────────────────────── */
const DoorRig: React.FC<{open: number; light: number; backlight?: boolean}> = ({open, light, backlight = true}) => (
  <group>
    {/* wall with an opening (four slabs) */}
    <mesh position={[-6.1, 3.5, 0]} castShadow receiveShadow>
      <boxGeometry args={[10, 7, 0.4]} />
      <meshStandardMaterial color="#E9EDF2" roughness={0.9} />
    </mesh>
    <mesh position={[6.1, 3.5, 0]} castShadow receiveShadow>
      <boxGeometry args={[10, 7, 0.4]} />
      <meshStandardMaterial color="#E9EDF2" roughness={0.9} />
    </mesh>
    <mesh position={[0, 6.2, 0]} castShadow receiveShadow>
      <boxGeometry args={[2.2, 1.6, 0.4]} />
      <meshStandardMaterial color="#E9EDF2" roughness={0.9} />
    </mesh>
    {/* door frame: two jambs and a head (not a solid panel) */}
    {[[-1.15, 2.7, 0.12, 5.5], [1.15, 2.7, 0.12, 5.5]].map(([x, y, w, h], i) => (
      <mesh key={i} position={[x, y, 0.22]} castShadow>
        <boxGeometry args={[w, h, 0.5]} />
        <meshStandardMaterial color={C.midnight} roughness={0.5} />
      </mesh>
    ))}
    <mesh position={[0, 5.45, 0.22]} castShadow>
      <boxGeometry args={[2.42, 0.12, 0.5]} />
      <meshStandardMaterial color={C.midnight} roughness={0.5} />
    </mesh>
    {/* door slab on hinge at x=-1.1 */}
    <group position={[-1.1, 0, 0.1]} rotation={[0, open * 1.6, 0]}>
      <mesh position={[1.1, 2.7, 0]} castShadow>
        <boxGeometry args={[2.18, 5.4, 0.12]} />
        <meshStandardMaterial color={C.red} roughness={0.45} metalness={0.05} />
      </mesh>
      <mesh position={[1.95, 2.6, 0.12]}>
        <sphereGeometry args={[0.09, 24, 24]} />
        <meshStandardMaterial color="#D7C48A" metalness={0.8} roughness={0.25} />
      </mesh>
    </group>
    {/* light behind the door */}
    <mesh position={[0, 2.7, -0.4]} visible={backlight}>
      <planeGeometry args={[2.2, 5.4]} />
      <meshBasicMaterial color={new THREE.Color('#FFF4D6').multiplyScalar(0.25 + 0.9 * light)} />
    </mesh>
    <spotLight position={[0, 4.5, -3]} target-position={[0, 0, 6]} angle={0.5} penumbra={0.6} intensity={140 * light} distance={30} color="#FFE7B8" castShadow />
  </group>
);

export const Door3D: React.FC<MG> = ({dur, state}) => {
  const f = useCurrentFrame();
  let open = 0.5;
  if (state === 'closing') open = lerp(0.85, 0.0, p(f, 6, dur - 30, E.quintInOut));
  if (state === 'ajar') open = lerp(0.0, 0.22, p(f, 10, dur - 10, E.quintOut));
  if (state === 'selective') open = lerp(0.1, 0.55, p(f, 4, 60, E.quintInOut));
  const light = Math.min(1, open * (state === 'ajar' ? 4.5 : 2.2));
  const N = state === 'selective' ? 28 : 0;
  return (
    <AbsoluteFill>
      <Canvas3D fog={[12, 40]}>
        <CameraPath keys={[{f: 0, pos: [4.5, 2.2, 15], look: [0, 2.4, 0]}, {f: dur, pos: [2.2, 2.0, 10.5], look: [0, 2.3, 0]}]} ease={E.cubicInOut} />
        <Studio intensity={state === 'ajar' ? 0.3 : 0.5} />
        <Floor color="#1C222C" />
        <DoorRig open={open} light={light} />
        {Array.from({length: N}).map((_, i) => {
          const chosen = rnd(i * 4.1) < 0.3;
          const t = p(f, 40 + i * 2, 120 + i * 2, E.cubicInOut);
          const x0 = (rnd(i) - 0.5) * 9;
          const z0 = 2.5 + rnd(i + 3) * 3.5;
          const x = chosen ? lerp(x0, (rnd(i + 9) - 0.5) * 1.2, t) : x0;
          const z = chosen ? lerp(z0, -1.5 - rnd(i) * 2, t) : z0;
          return (
            <mesh key={i} position={[x, 0.75, z]} castShadow>
              <capsuleGeometry args={[0.18, 0.7, 8, 16]} />
              <meshStandardMaterial color={chosen ? '#F5E8AC' : '#6F7A8A'} roughness={0.6} emissive={chosen ? '#5A4A10' : '#000'} emissiveIntensity={chosen ? 0.3 * t : 0} />
            </mesh>
          );
        })}
      </Canvas3D>
      <Vignette strength={0.55} />
      {state === 'selective' ? (
        <div style={{position: 'absolute', left: 120, top: 120, width: 760}}>
          <Eyebrow text="NEITHER OPENING NOR CLOSING" color={C.note} />
          <div style={{height: 20}} />
          <Words text="Canada opens the door for itself — for the people it needs." delay={14} stagger={2} style={{fontFamily: F.serif, fontSize: 64, color: C.white, lineHeight: 1.06}} />
        </div>
      ) : state === 'ajar' ? (
        <div style={{position: 'absolute', left: 120, top: 140, width: 760}}>
          <Words text="Amid the anger and the cuts — why open a back door?" delay={10} stagger={2} style={{fontFamily: F.serif, fontSize: 70, color: C.white, lineHeight: 1.06}} />
        </div>
      ) : (
        <div style={{position: 'absolute', left: 120, bottom: 140, width: 900}}>
          <Eyebrow text="2024–2026 · CUTS AND TIGHTER RULES" color={C.coral} />
        </div>
      )}
    </AbsoluteFill>
  );
};

/* ─────────────────────────── JOURNEY: boarding pass → globe ─────────────────────────── */
const useEarthTex = () =>
  useCanvasTex(
    2048,
    1024,
    (ctx) => {
      ctx.fillStyle = '#10233F';
      ctx.fillRect(0, 0, 2048, 1024);
      const proj = geoEquirectangular().fitSize([2048, 1024], {type: 'Sphere'} as any);
      const path = geoPath(proj, ctx);
      const land = feature(land110 as any, (land110 as any).objects.land) as any;
      ctx.beginPath();
      path(land);
      ctx.fillStyle = '#DCE2EA';
      ctx.fill();
      ctx.strokeStyle = 'rgba(53,108,246,0.25)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 2048; i += 64) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 1024);
        ctx.stroke();
      }
      for (let j = 0; j <= 1024; j += 64) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(2048, j);
        ctx.stroke();
      }
    },
    [],
  );

const ll2v = (lon: number, lat: number, r: number) => {
  const phi = ((90 - lat) * Math.PI) / 180;
  const th = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th));
};

const Arc: React.FC<{from: [number, number]; to: [number, number]; t: number; color: string}> = ({from, to, t, color}) => {
  const geo = useMemo(() => {
    const ip = geoInterpolate(from, to);
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 80; i++) {
      const [lo, la] = ip(i / 80);
      const h = 1 + 0.18 * Math.sin((Math.PI * i) / 80);
      pts.push(ll2v(lo, la, 3 * h));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, 0.025, 8, false);
  }, [from, to]);
  geo.setDrawRange(0, Math.floor(160 * 8 * 6 * t));
  return (
    <mesh geometry={geo}>
      <meshBasicMaterial color={color} />
    </mesh>
  );
};

export const JourneyMap3D: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  const earth = useEarthTex();
  const pass = useCanvasTex(1024, 420, (ctx) => {
    ctx.fillStyle = '#F7F8FA';
    roundRect(ctx, 0, 0, 1024, 420, 28);
    ctx.fill();
    ctx.fillStyle = '#142B49';
    ctx.fillRect(0, 0, 1024, 86);
    ctx.fillStyle = '#F5E8AC';
    ctx.font = '600 34px "IBM Plex Mono"';
    ctx.fillText('BOARDING PASS · ONE WAY', 40, 56);
    ctx.fillStyle = '#171C24';
    ctx.font = '900 130px "Inter Tight"';
    ctx.fillText('HYD', 40, 250);
    ctx.fillText('YYZ', 640, 250);
    ctx.fillStyle = '#356CF6';
    ctx.font = '700 80px "Inter Tight"';
    ctx.fillText('→', 440, 235);
    ctx.fillStyle = '#5B6675';
    ctx.font = '500 30px "IBM Plex Mono"';
    ctx.fillText('HYDERABAD', 44, 300);
    ctx.fillText('TORONTO', 646, 300);
    ctx.fillText('CLASS: STUDENT     SEAT: 32A', 44, 380);
  });
  const fly = p(f, 0, 50, E.quintInOut);
  const arcT = p(f, 50, dur - 10, E.quintInOut);
  const spin = lerp(-2.0, -1.2, p(f, 0, dur, E.cubicInOut));
  const hyd: [number, number] = [78.48, 17.38];
  const yyz: [number, number] = [-79.38, 43.65];
  const yvr: [number, number] = [-123.12, 49.28];
  return (
    <AbsoluteFill>
      <Canvas3D bg={C.midnight}>
        <CameraPath keys={[{f: 0, pos: [0, 0.4, 5], look: [0, 0.2, 0]}, {f: 50, pos: [0, 2.2, 9.5], look: [0, 0.8, 0]}, {f: dur, pos: [-1.2, 3.6, 8.2], look: [0, 1.2, 0]}]} />
        <Studio intensity={0.9} />
        <group rotation={[0.35, spin, 0]}>
          <mesh>
            <sphereGeometry args={[3, 96, 96]} />
            <meshStandardMaterial map={earth} roughness={0.85} />
          </mesh>
          <Arc from={hyd} to={yyz} t={arcT} color="#F5E8AC" />
          <Arc from={hyd} to={yvr} t={Math.max(0, arcT - 0.15)} color="#DE8176" />
          {[hyd, yyz, yvr].map((c, i) => (
            <mesh key={i} position={ll2v(c[0], c[1], 3.02)}>
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshBasicMaterial color={i ? '#F5E8AC' : '#DE8176'} />
            </mesh>
          ))}
        </group>
        <group position={[0, lerp(0.2, 4.8, fly), lerp(2.6, -2, fly)]} rotation={[lerp(-0.3, -1.2, fly), lerp(0, 0.6, fly), lerp(0.04, 0.3, fly)]} scale={lerp(1, 0.5, fly)}>
          <mesh castShadow>
            <boxGeometry args={[2.44, 1.0, 0.02]} />
            <meshStandardMaterial map={pass} roughness={0.5} />
          </mesh>
        </group>
      </Canvas3D>
      <Vignette strength={0.45} />
      <div style={{position: 'absolute', left: 120, bottom: 120, opacity: p(f, 60, 80)}}>
        <Eyebrow text="HYDERABAD → TORONTO · VANCOUVER" color={C.note} delay={60} />
        <div style={{height: 14}} />
        <MaskLine delay={66}>
          <div style={{fontFamily: F.serif, fontSize: 86, color: C.white}}>No lottery. Just Canada.</div>
        </MaskLine>
      </div>
    </AbsoluteFill>
  );
};

/* ─────────────────────────── FINANCIAL TRAP ─────────────────────────── */
export const FinancialTrap3D: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  const rice = useTex('photos/india_rice.jpg');
  const cats = ['TUITION', 'FLIGHT & VISA', 'RENT', 'LIVING COSTS', 'LOAN EMI'];
  const drain = p(f, 40, dur - 20, E.cubicInOut);
  const srcH = lerp(6, 0.6, drain);
  return (
    <AbsoluteFill>
      <Canvas3D fog={[16, 50]}>
        <CameraPath keys={[{f: 0, pos: [-9, 6, 12], look: [0, 2, 0]}, {f: dur, pos: [-3, 5, 14], look: [1, 2, 0]}]} ease={E.cubicInOut} />
        <Studio intensity={0.9} warm />
        <Floor color="#1A2029" />
        {/* the land */}
        <mesh position={[-7, 0.15, 0]} receiveShadow castShadow>
          <boxGeometry args={[3.2, 0.3, 3.2]} />
          <meshStandardMaterial map={rice} color="#FFFFFF" roughness={0.9} />
        </mesh>
        {/* source column: loan + land sale */}
        <mesh position={[-3.2, srcH / 2, 0]} castShadow>
          <boxGeometry args={[1.6, srcH, 1.6]} />
          <meshStandardMaterial color="#F5E8AC" roughness={0.4} />
        </mesh>
        {cats.map((c, i) => {
          const h = 0.2 + 2.6 * p(f, 40 + i * 10, 80 + i * 10, E.quintOut) * (i === 0 ? 1.4 : i === 4 ? 1.1 : 0.8);
          return (
            <mesh key={i} position={[-0.5 + i * 2.1, h / 2, 0]} castShadow>
              <boxGeometry args={[1.3, h, 1.3]} />
              <meshStandardMaterial color={i === 4 ? '#C83D49' : i === 0 ? '#356CF6' : '#4C6A96'} roughness={0.45} />
            </mesh>
          );
        })}
      </Canvas3D>
      <Vignette strength={0.5} />
      <div style={{position: 'absolute', left: 120, top: 100, width: 900}}>
        <Eyebrow text="SEQUENCE · WHERE THE MONEY GOES" color={C.note} />
        <div style={{height: 16}} />
        <Words text="Land sold. ₹40 lakh borrowed. Then every month, it drains." delay={6} stagger={2} style={{fontFamily: F.serif, fontSize: 60, color: C.white, lineHeight: 1.06}} />
      </div>
      <div style={{position: 'absolute', left: 120, bottom: 70, display: 'flex', gap: 34, fontFamily: F.mono, fontSize: 20, color: C.silver, letterSpacing: '0.1em', opacity: p(f, 50, 70)}}>
        <span style={{color: C.note}}>■ AVAILABLE FUNDS</span>
        {cats.map((c, i) => (
          <span key={i} style={{color: i === 4 ? C.coral : i === 0 ? '#7FA2FF' : C.silver}}>■ {c}</span>
        ))}
      </div>
      <div style={{position: 'absolute', right: 120, top: 110, fontFamily: F.mono, fontSize: 16, color: C.grey}}>PROPORTIONS ILLUSTRATIVE · NO RATES OR EMI AMOUNTS IMPLIED</div>
    </AbsoluteFill>
  );
};

/* ─────────────────────────── HOUSING CITY ─────────────────────────── */
export const HousingCity3D: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  const bld = useMemo(
    () =>
      Array.from({length: 140}).map((_, i) => {
        const gx = (i % 14) - 6.5;
        const gz = Math.floor(i / 14) - 4.5;
        return {x: gx * 1.4, z: gz * 1.4, h: 0.4 + Math.pow(rnd(i + 2), 2.2) * 6 * (1 - Math.min(1, Math.hypot(gx, gz) / 10)), d: rnd(i + 7)};
      }),
    [],
  );
  const grow = p(f, 0, 50, E.quintOut);
  const factors = [
    {t: 'Interest rates', c: C.white},
    {t: 'Zoning rules', c: C.white},
    {t: 'Investor demand', c: C.white},
    {t: 'Decades of under-building', c: C.white},
    {t: 'Immigration ≈ 11%', c: C.note},
  ];
  return (
    <AbsoluteFill>
      <Canvas3D bg="#0F141B" fog={[14, 40]}>
        <CameraPath keys={[{f: 0, pos: [14, 9, 14], look: [0, 1, 0]}, {f: dur, pos: [6, 6, 16], look: [0, 1.4, 0]}]} ease={E.cubicInOut} />
        <Studio intensity={0.8} />
        <Floor color="#161B23" />
        {bld.map((b, i) => {
          const h = b.h * Math.min(1, grow * 1.6 - b.d * 0.6 + 0.2);
          const hh = Math.max(0.05, h);
          const hot = i % 9 === 0;
          return (
            <mesh key={i} position={[b.x, hh / 2, b.z]} castShadow receiveShadow>
              <boxGeometry args={[1, hh, 1]} />
              <meshStandardMaterial color={hot ? '#356CF6' : '#DCE2EA'} roughness={0.7} emissive={hot ? '#1A3A8A' : '#000'} emissiveIntensity={hot ? 0.35 : 0} />
            </mesh>
          );
        })}
      </Canvas3D>
      <Vignette strength={0.5} />
      <AbsoluteFill style={{background: 'linear-gradient(90deg, rgba(15,20,27,0.92) 0%, rgba(15,20,27,0.75) 35%, rgba(15,20,27,0) 60%)'}} />
      <div style={{position: 'absolute', left: 110, top: 110, width: 900}}>
        <Eyebrow text="WHAT DRIVES HOUSING COSTS" color={C.note} />
        <div style={{height: 24}} />
        {factors.map((x, i) => (
          <MaskLine key={i} delay={12 + i * 8}>
            <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 56, color: x.c, lineHeight: 1.3}}>{x.t}</div>
          </MaskLine>
        ))}
      </div>
      <Source text="Factors named in the narration; 11% figure — IRCC/StatCan research (2025)" delay={40} dark />
    </AbsoluteFill>
  );
};

/* ─────────────────────────── PERMIT CLIFF ─────────────────────────── */
const TOWERS = [
  {label: '2025 · FULL YEAR', v: 1053000, x: -5},
  {label: 'Q1 2026', v: 314538, x: 0},
  {label: 'Q2–Q4 2026', v: 612358, x: 5},
];
export const PermitCliff3D: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  const per = 5000; // one card ≈ 5,000 permits
  const cards = useMemo(() => {
    const out: {tower: number; k: number}[] = [];
    TOWERS.forEach((t, ti) => {
      const n = Math.round(t.v / per);
      for (let k = 0; k < n; k++) out.push({tower: ti, k});
    });
    return out;
  }, []);
  const geo = useMemo(() => new THREE.BoxGeometry(1.6, 0.025, 1.1), []);
  const mats = useMemo(() => [new THREE.MeshStandardMaterial({color: '#F7F8FA', roughness: 0.5}), new THREE.MeshStandardMaterial({color: '#DE8176', roughness: 0.5}), new THREE.MeshStandardMaterial({color: '#ADB6C2', roughness: 0.5})], []);
  return (
    <AbsoluteFill>
      <Canvas3D fog={[18, 50]}>
        <CameraPath keys={[{f: 0, pos: [-12, 4, 12], look: [-3, 1, 0]}, {f: dur, pos: [2, 6, 17.5], look: [0, 2.0, 0]}]} ease={E.cubicInOut} />
        <Studio intensity={0.85} />
        <Floor color="#1A2029" />
        {/* timeline track */}
        <mesh position={[0, 0.01, 2.2]} receiveShadow>
          <boxGeometry args={[18, 0.02, 0.08]} />
          <meshStandardMaterial color="#356CF6" emissive="#356CF6" emissiveIntensity={0.4} />
        </mesh>
        {cards.map((c, i) => {
          const T = TOWERS[c.tower];
          const start = 6 + c.tower * 22 + c.k * 0.18;
          const t = p(f, start, start + 18, E.quintOut);
          const y = 0.03 + c.k * 0.022;
          const x = lerp(-11, T.x, t);
          const z = lerp(2.2, 0, t);
          return <mesh key={i} geometry={geo} material={mats[c.tower === 1 ? 1 : c.tower === 0 ? 0 : 2]} position={[x, lerp(0.05, y, t), z]} rotation={[0, (rnd(i) - 0.5) * 0.08, 0]} castShadow />;
        })}
      </Canvas3D>
      <Vignette strength={0.5} />
      <div style={{position: 'absolute', left: 110, top: 100}}>
        <Eyebrow text="WORK PERMITS EXPIRING · EACH CARD ≈ 5,000 PERMITS" color={C.note} />
      </div>
      <div style={{position: 'absolute', left: 110, bottom: 110, display: 'flex', gap: 80}}>
        {TOWERS.map((t, i) => (
          <div key={i} style={{opacity: p(f, 20 + i * 22, 40 + i * 22)}}>
            <div style={{fontFamily: F.mono, fontSize: 22, color: C.grey, letterSpacing: '0.12em'}}>{t.label}</div>
            <div style={{fontFamily: F.display, fontWeight: 800, fontSize: 70, color: i === 1 ? C.coral : C.white}}>
              {i === 2 ? '~' : ''}
              <Counter to={i === 0 ? 1.05 : i === 1 ? 314538 : 612000} decimals={i === 0 ? 2 : 0} delay={20 + i * 22} dur={30} suffix={i === 0 ? 'M' : ''} />
            </div>
          </div>
        ))}
      </div>
      <Source text="IRCC data as reported (2025 total ≈1.05M; 2026 ≈926,896; Q1 2026 = 314,538 via ATIP). Q2–Q4 = remainder." delay={60} dark />
    </AbsoluteFill>
  );
};

/* ─────────────────────────── THROUGH THE PHOTO ─────────────────────────── */
export const ThroughPhoto3D: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  const photo = useTex('photos/status_photo.jpg');
  const desk = useTex('photos/desk_bills.jpg');
  const fade = p(f, dur * 0.45, dur * 0.8, E.cubicInOut);
  return (
    <AbsoluteFill>
      <Canvas3D bg="#0E1116">
        <CameraPath keys={[{f: 0, pos: [0, 0, 7], look: [0, 0, 0]}, {f: dur, pos: [0, -0.3, -1.2], look: [0, -1.2, -6]}]} ease={E.inQuad} />
        <ambientLight intensity={0.25} />
        <pointLight position={[1.5, 2, -4]} intensity={30 * (0.3 + fade)} color="#FFD9A0" distance={12} castShadow />
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[4.8, 3.2]} />
          <meshBasicMaterial map={photo} transparent opacity={1 - fade} />
        </mesh>
        {/* the room behind the photo */}
        <mesh position={[0, -2, -5]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[6, 4]} />
          <meshStandardMaterial map={desk} roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.5, -7.2]}>
          <planeGeometry args={[12, 6]} />
          <meshStandardMaterial color="#232A35" roughness={1} />
        </mesh>
        <mesh position={[-1.4, -1.6, -5]} castShadow>
          <boxGeometry args={[1.6, 0.06, 1.1]} />
          <meshStandardMaterial color="#2B2F36" metalness={0.3} roughness={0.4} />
        </mesh>
      </Canvas3D>
      <div style={{position: 'absolute', left: 0, right: 0, top: 860, textAlign: 'center', opacity: p(f, 10, 24)}}>
        <MaskLine delay={10}>
          <div style={{fontFamily: F.serif, fontStyle: 'italic', fontSize: 64, color: C.white, textShadow: '0 6px 30px rgba(0,0,0,0.6)'}}>And outside the photo?</div>
        </MaskLine>
      </div>
    </AbsoluteFill>
  );
};

/* ─────────────────────────── 200,000 COHORTS ─────────────────────────── */
export const Cohorts3D: React.FC<MG> = ({dur}) => {
  const f = useCurrentFrame();
  const open = p(f, 4, 40, E.quintInOut);
  const N = 200; // one cube = 1,000 people
  const geo = useMemo(() => new THREE.BoxGeometry(0.22, 0.22, 0.22), []);
  const mW = useMemo(() => new THREE.MeshStandardMaterial({color: '#356CF6', roughness: 0.4, emissive: '#0F2A70', emissiveIntensity: 0.3}), []);
  const mH = useMemo(() => new THREE.MeshStandardMaterial({color: '#F5E8AC', roughness: 0.4, emissive: '#4A3F10', emissiveIntensity: 0.25}), []);
  return (
    <AbsoluteFill>
      <Canvas3D fog={[16, 46]}>
        <CameraPath keys={[{f: 0, pos: [0, 2.8, 11], look: [0, 2.6, 0]}, {f: 46, pos: [0, 2.5, 1.6], look: [0, 1.8, -6]}, {f: 84, pos: [0, 6.5, -2], look: [0, 0, -10]}, {f: dur, pos: [0, 9.5, -3], look: [0, 0, -11.5]}]} />
        <Studio intensity={0.8} />
        <Floor color="#1A2029" />
        <group position={[0, 0, 0]}>
          <DoorRig open={open} light={open} backlight={false} />
          <pointLight position={[0, 6, -8]} intensity={60} distance={30} color="#FFF1D0" />
        </group>
        {/* gates */}
        {[-4, 4].map((x, gi) => (
          <group key={gi} position={[x, 0, -12]}>
            <mesh position={[-1.2, 1.5, 0]} castShadow>
              <boxGeometry args={[0.2, 3, 0.2]} />
              <meshStandardMaterial color={gi ? '#F5E8AC' : '#356CF6'} />
            </mesh>
            <mesh position={[1.2, 1.5, 0]} castShadow>
              <boxGeometry args={[0.2, 3, 0.2]} />
              <meshStandardMaterial color={gi ? '#F5E8AC' : '#356CF6'} />
            </mesh>
            <mesh position={[0, 3, 0]} castShadow>
              <boxGeometry args={[2.6, 0.2, 0.2]} />
              <meshStandardMaterial color={gi ? '#F5E8AC' : '#356CF6'} />
            </mesh>
          </group>
        ))}
        {Array.from({length: N}).map((_, i) => {
          const g = i % 2; // 0 workers, 1 humanitarian
          const t = p(f, 40 + (i / N) * 90, 100 + (i / N) * 90, E.cubicInOut);
          const col = Math.floor(i / 2) % 10;
          const row = Math.floor(i / 20);
          const x0 = (col - 4.5) * 0.3;
          const z0 = -2 - row * 0.3;
          const xg = (g ? 4 : -4) + (col - 4.5) * 0.22;
          const zg = -12 + 2 - row * 0.32;
          const x = lerp(x0, xg, t);
          const z = lerp(z0, zg, t);
          return <mesh key={i} geometry={geo} material={g ? mH : mW} position={[x, 0.12 + Math.sin(t * Math.PI) * 0.6, z]} castShadow />;
        })}
      </Canvas3D>
      <Vignette strength={0.5} />
      <div style={{position: 'absolute', left: 110, top: 90}}>
        <Eyebrow text="TIME-LIMITED MEASURE · UP TO 200,000 ALREADY IN CANADA · THROUGH 2027" color={C.note} />
      </div>
      <div style={{position: 'absolute', left: 110, bottom: 100, width: 760, opacity: p(f, 90, 110)}}>
        <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 84, color: '#7FA2FF'}}>Up to 100,000</div>
        <div style={{fontFamily: F.mono, fontSize: 24, color: C.silver, letterSpacing: '0.12em'}}>WORKERS COHORT · VIA PROVINCES & SELECT FEDERAL PROGRAMS</div>
      </div>
      <div style={{position: 'absolute', right: 110, bottom: 100, width: 760, textAlign: 'right', opacity: p(f, 100, 120)}}>
        <div style={{fontFamily: F.display, fontWeight: 900, fontSize: 84, color: C.note}}>Up to 100,000</div>
        <div style={{fontFamily: F.mono, fontSize: 24, color: C.silver, letterSpacing: '0.12em'}}>HUMANITARIAN & FAMILY COHORT</div>
      </div>
      <div style={{position: 'absolute', right: 110, top: 90, fontFamily: F.mono, fontSize: 18, color: C.grey}}>EACH CUBE ≈ 1,000 PEOPLE</div>
    </AbsoluteFill>
  );
};

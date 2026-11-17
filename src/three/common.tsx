import React, {useEffect, useMemo, useState} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {continueRender, delayRender, staticFile, useCurrentFrame, interpolate} from 'remotion';
import {E} from '../lib/anim';

/** Load a texture with Remotion's render gate so frames never render before it is ready. */
export const useTex = (src: string | null) => {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  const [handle] = useState(() => (src ? delayRender('tex ' + src) : 0));
  useEffect(() => {
    if (!src) return;
    new THREE.TextureLoader().load(
      staticFile(src),
      (t) => {
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 8;
        setTex(t);
        continueRender(handle);
      },
      undefined,
      () => continueRender(handle),
    );
  }, [src, handle]);
  return tex;
};

/** Canvas-drawn texture (labels, boarding passes, document faces). */
export const useCanvasTex = (w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void, deps: any[] = []) =>
  useMemo(() => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d')!;
    draw(ctx);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

type Key = {f: number; pos: [number, number, number]; look: [number, number, number]; fov?: number};

/** Keyframed camera with graph-editor easing between keys. */
export const CameraPath: React.FC<{keys: Key[]; ease?: (t: number) => number}> = ({keys, ease = E.quintInOut}) => {
  const f = useCurrentFrame();
  const {camera} = useThree();
  const fr = keys.map((k) => k.f);
  const g = (sel: (k: Key) => number) =>
    interpolate(f, fr, keys.map(sel), {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});
  const pos = [g((k) => k.pos[0]), g((k) => k.pos[1]), g((k) => k.pos[2])] as const;
  const look = [g((k) => k.look[0]), g((k) => k.look[1]), g((k) => k.look[2])] as const;
  camera.position.set(pos[0], pos[1], pos[2]);
  camera.lookAt(look[0], look[1], look[2]);
  const fov = g((k) => k.fov ?? 40);
  if ((camera as THREE.PerspectiveCamera).fov !== fov) {
    (camera as THREE.PerspectiveCamera).fov = fov;
    camera.updateProjectionMatrix();
  }
  return null;
};

/** Studio lighting: key + rim + soft fill, shadows on. */
export const Studio: React.FC<{key1?: [number, number, number]; warm?: boolean; intensity?: number}> = ({key1 = [6, 10, 6], warm = false, intensity = 1}) => (
  <>
    <ambientLight intensity={0.35 * intensity} color="#C9D6F2" />
    <hemisphereLight args={['#E8EEFF', '#142B49', 0.45 * intensity]} />
    <directionalLight
      position={key1}
      intensity={2.2 * intensity}
      color={warm ? '#FFE9C9' : '#FFFFFF'}
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-camera-left={-20}
      shadow-camera-right={20}
      shadow-camera-top={20}
      shadow-camera-bottom={-20}
      shadow-bias={-0.0004}
    />
    <directionalLight position={[-8, 4, -6]} intensity={0.9 * intensity} color="#7FA2FF" />
  </>
);

export const Floor: React.FC<{color?: string; y?: number; size?: number}> = ({color = '#171C24', y = 0, size = 200}) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} receiveShadow>
    <planeGeometry args={[size, size]} />
    <meshStandardMaterial color={color} roughness={0.85} metalness={0.05} />
  </mesh>
);

export const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

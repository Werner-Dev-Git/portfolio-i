import { useRef, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useTheme } from '@/lib/theme';

export interface PointerState {
  /** Pointer position within the card, in pixels from its centre. */
  x: number;
  y: number;
  /** 0 → dark, 1 → fully lit. */
  target: number;
  /** True on touch devices: the light orbits instead of following a cursor. */
  orbit: boolean;
}

const INSET = 17; /* .service-inner margin + border */

/** The inner panel as a real slab casting a soft shadow on the back panel,
 *  lit by a coloured point light that tracks the cursor. */
function Rig({ pointer, color }: { pointer: RefObject<PointerState>; color: string }) {
  const { size } = useThree();
  const lightRef = useRef<THREE.PointLight>(null);
  const level = useRef(0);
  const pos = useRef({ x: 0, y: 0 });
  const { theme } = useTheme();
  const dark = theme === 'dark';

  useFrame((state) => {
    const light = lightRef.current;
    if (!light) return;
    const p = pointer.current;

    if (p.orbit) {
      const t = state.clock.elapsedTime * 0.7;
      p.x = Math.cos(t) * size.width * 0.26;
      p.y = Math.sin(t) * size.height * 0.26;
    }
    level.current += (p.target - level.current) * 0.08;
    pos.current.x += (p.x - pos.current.x) * 0.12;
    pos.current.y += (p.y - pos.current.y) * 0.12;

    light.intensity = level.current * (dark ? 3.4 : 4.2);
    light.position.set(pos.current.x * 0.7, pos.current.y * 0.7, 80);
  });

  return (
    <>
      <ambientLight intensity={dark ? 0.42 : 1.25} />
      <pointLight
        ref={lightRef}
        color={color}
        intensity={0}
        distance={0}
        decay={0}
        position={[0, 0, 80]}
        castShadow
        shadow-mapSize={[512, 512]}
        shadow-bias={-0.003}
      />
      <mesh receiveShadow scale={[size.width, size.height, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial color={dark ? '#121a15' : '#dfe9e1'} roughness={0.92} metalness={0.08} />
      </mesh>
      <mesh castShadow position={[0, 0, 10]} scale={[size.width - INSET * 2, size.height - INSET * 2, 1]}>
        <boxGeometry args={[1, 1, 16]} />
        <meshStandardMaterial color={dark ? '#18231c' : '#f1f7f2'} roughness={0.85} metalness={0.05} />
      </mesh>
    </>
  );
}

export function LightRig({ pointer, color }: { pointer: RefObject<PointerState>; color: string }) {
  return (
    <div className="light-layer">
      <Canvas
        orthographic
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0, 240], zoom: 1, near: 0.1, far: 500 }}
        gl={{ alpha: true, antialias: true }}
        style={{ pointerEvents: 'none' }}
      >
        <Rig pointer={pointer} color={color} />
      </Canvas>
    </div>
  );
}

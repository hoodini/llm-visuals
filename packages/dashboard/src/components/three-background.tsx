'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

function FloatingParticles({ count = 35 }: { count?: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    return Array.from({ length: count }, () => ({
      position: [
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6,
      ] as [number, number, number],
      speed: 0.1 + Math.random() * 0.3,
      offset: Math.random() * Math.PI * 2,
      scale: 0.015 + Math.random() * 0.04,
    }));
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    particles.forEach((p, i) => {
      dummy.position.set(
        p.position[0] + Math.sin(t * p.speed + p.offset) * 0.5,
        p.position[1] + Math.cos(t * p.speed * 0.7 + p.offset) * 0.4,
        p.position[2] + Math.sin(t * p.speed * 0.5 + p.offset) * 0.3,
      );
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#c084fc" transparent opacity={0.5} />
    </instancedMesh>
  );
}

function GradientOrb() {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    mesh.current.rotation.x = Math.sin(t * 0.15) * 0.2;
    mesh.current.rotation.y = t * 0.08;
    mesh.current.scale.setScalar(1 + Math.sin(t * 0.3) * 0.05);
  });

  return (
    <mesh ref={mesh} position={[2, 0.5, -3]}>
      <icosahedronGeometry args={[2.5, 4]} />
      <meshBasicMaterial
        color="#ede9fe"
        transparent
        opacity={0.35}
        wireframe
      />
    </mesh>
  );
}

function SecondOrb() {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.elapsedTime;
    mesh.current.rotation.z = t * 0.06;
    mesh.current.rotation.x = Math.cos(t * 0.12) * 0.15;
    mesh.current.scale.setScalar(1 + Math.cos(t * 0.25) * 0.04);
  });

  return (
    <mesh ref={mesh} position={[-3, -1, -4]}>
      <icosahedronGeometry args={[1.8, 3]} />
      <meshBasicMaterial
        color="#ddd6fe"
        transparent
        opacity={0.25}
        wireframe
      />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <GradientOrb />
      <SecondOrb />
      <FloatingParticles />
    </>
  );
}

export function ThreeBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none" style={{ opacity: 0.45 }}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}

export default ThreeBackground;

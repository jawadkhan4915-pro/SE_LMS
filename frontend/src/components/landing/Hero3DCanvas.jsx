import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Animated 3D Floating Geometry Core
function AnimatedShape({ mouse, isMobile }) {
  const meshRef = useRef();
  const outerRingRef = useRef();
  const knotRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
      // Gentle mouse parallax interpolation
      meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, mouse.current.x * (isMobile ? 0.4 : 0.8), 0.05);
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, mouse.current.y * (isMobile ? 0.4 : 0.8), 0.05);
    }

    if (outerRingRef.current) {
      outerRingRef.current.rotation.x -= delta * 0.15;
      outerRingRef.current.rotation.z += delta * 0.25;
    }

    if (knotRef.current) {
      knotRef.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Central Distorted Glowing Sphere */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh scale={isMobile ? 1.3 : 1.8}>
          <sphereGeometry args={[1, isMobile ? 32 : 64, isMobile ? 32 : 64]} />
          <MeshDistortMaterial
            color="#4f46e5"
            attach="material"
            distort={0.45}
            speed={2.5}
            roughness={0.2}
            metalness={0.8}
            wireframe={false}
          />
        </mesh>
      </Float>

      {/* Torus Ring around the sphere - Accent Color (Sky Blue) */}
      <mesh ref={outerRingRef} scale={isMobile ? 1.9 : 2.6}>
        <torusGeometry args={[1, 0.03, 16, isMobile ? 60 : 100]} />
        <meshStandardMaterial
          color="#0ea5e9"
          emissive="#0ea5e9"
          emissiveIntensity={0.6}
          roughness={0.1}
          metalness={0.9}
          wireframe
        />
      </mesh>

      {/* Wireframe Inner Knot */}
      <mesh ref={knotRef} scale={isMobile ? 0.9 : 1.2}>
        <torusKnotGeometry args={[1, 0.25, isMobile ? 64 : 128, 32]} />
        <meshStandardMaterial
          color="#818cf8"
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Floating Particle Stars/Sparkles around scene */}
      <Sparkles
        count={isMobile ? 35 : 70}
        scale={8}
        size={3.5}
        speed={0.4}
        opacity={0.7}
        color="#0ea5e9"
      />
      <Sparkles
        count={isMobile ? 25 : 50}
        scale={6}
        size={2.5}
        speed={0.6}
        opacity={0.8}
        color="#818cf8"
      />
    </group>
  );
}

export default function Hero3DCanvas() {
  const mouse = useRef({ x: 0, y: 0 });
  const [hasWebGL, setHasWebGL] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check screen size
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Check WebGL availability
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch (e) {
      setHasWebGL(false);
    }

    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      mouse.current = { x, y };
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        const x = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        const y = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
        mouse.current = { x, y };
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  if (!hasWebGL) {
    return (
      <div className="w-full h-full flex items-center justify-center relative">
        <div className="w-48 h-48 sm:w-72 sm:h-72 rounded-full bg-gradient-to-tr from-indigo-600/30 to-sky-500/30 blur-3xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Suspense
        fallback={
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-indigo-600 dark:text-indigo-400">
            <div className="w-8 h-8 sm:w-10 sm:h-10 border-3 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
            <span className="text-[10px] sm:text-xs font-semibold tracking-wide uppercase opacity-75">
              Initializing 3D Canvas...
            </span>
          </div>
        }
      >
        <Canvas
          camera={{ position: [0, 0, isMobile ? 7.5 : 6], fov: isMobile ? 50 : 45 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.7} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
          <pointLight position={[-10, -10, -10]} intensity={1} color="#0ea5e9" />
          <pointLight position={[5, 5, 5]} intensity={1.2} color="#4f46e5" />
          
          <AnimatedShape mouse={mouse} isMobile={isMobile} />
        </Canvas>
      </Suspense>
    </div>
  );
}

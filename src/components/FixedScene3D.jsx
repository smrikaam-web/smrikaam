import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function ArchitecturalGridBlocks({ isDark = false, onContextLost }) {
  const groupRef = useRef();
  const scrollRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      scrollRef.current = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Generate 42 architectural code blocks with subtle varied depths and trajectories
  const cubesData = useMemo(() => {
    const boxGeom = new THREE.BoxGeometry(0.85, 0.85, 0.85);
    const edgesGeom = new THREE.EdgesGeometry(boxGeom);

    return Array.from({ length: 36 }, () => {
      const side = Math.random() > 0.5 ? 1 : -1;
      const x = side * (4.8 + Math.random() * 4.2);
      const y = (Math.random() - 0.5) * 16;
      const z = (Math.random() - 0.5) * 8;
      const speed = 0.003 + Math.random() * 0.007;
      const axis = Math.random() > 0.5 ? 'y' : 'x';
      return {
        boxGeom,
        edgesGeom,
        pos: [x, y, z],
        speed,
        axis,
        rot: [Math.random() * Math.PI, Math.random() * Math.PI, 0],
      };
    });
  }, []);

  const cubesRefs = useRef([]);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.03; // Calm continuous rotation
      const scrollFactor = scrollRef.current * 0.0004;
      groupRef.current.position.y = -scrollFactor;
    }

    cubesRefs.current.forEach((refItem, idx) => {
      if (!refItem) return;
      const data = cubesData[idx];
      const axis = data.axis;

      refItem.position[axis] += data.speed;
      if (refItem.position[axis] > 7) {
        refItem.position[axis] = -7;
      }

      refItem.rotation.x += delta * 0.15;
      refItem.rotation.y += delta * 0.18;
    });
  });

  // Handle WebGL context loss gracefully
  useEffect(() => {
    const canvasEl = document.querySelector('canvas');
    if (!canvasEl) return;

    const handleWebGlLost = (e) => {
      e.preventDefault();
      if (onContextLost) onContextLost();
    };

    canvasEl.addEventListener('webglcontextlost', handleWebGlLost, false);
    return () => {
      canvasEl.removeEventListener('webglcontextlost', handleWebGlLost);
    };
  }, [onContextLost]);

  // Dynamic Theme Colors
  const meshColor = isDark ? '#111111' : '#E5E5E5';
  const meshOpacity = isDark ? 0.45 : 0.25;
  const edgeColor = isDark ? '#ffffff' : '#000000';
  const edgeOpacity = isDark ? 0.65 : 0.50;

  return (
    <group ref={groupRef}>
      <ambientLight intensity={isDark ? 0.7 : 1.2} />
      <pointLight
        position={[10, 15, 10]}
        intensity={isDark ? 1.8 : 1.5}
        color="#ffffff"
      />
      <directionalLight
        position={[-10, -10, -5]}
        intensity={isDark ? 0.5 : 0.8}
        color="#ffffff"
      />

      {cubesData.map((data, idx) => (
        <group
          key={idx}
          position={data.pos}
          rotation={data.rot}
          ref={(el) => (cubesRefs.current[idx] = el)}
        >
          <mesh geometry={data.boxGeom}>
            <meshStandardMaterial
              color={meshColor}
              transparent
              opacity={meshOpacity}
              roughness={0.2}
              metalness={0.1}
            />
          </mesh>
          <lineSegments geometry={data.edgesGeom}>
            <lineBasicMaterial
              color={edgeColor}
              transparent
              opacity={edgeOpacity}
            />
          </lineSegments>
        </group>
      ))}
    </group>
  );
}

export default function FixedScene3D() {
  const [shouldRender, setShouldRender] = useState(true);
  const [contextLost, setContextLost] = useState(false);
  const [isDark, setIsDark] = useState(() =>
    typeof document !== 'undefined'
      ? document.documentElement.classList.contains('dark')
      : false
  );

  useEffect(() => {
    // Observe theme toggle on document.documentElement
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    const checkVisibility = () => {
      if (document.visibilityState === 'hidden') {
        setShouldRender(false);
      } else {
        setShouldRender(true);
      }
    };

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setShouldRender(false);
    }

    document.addEventListener('visibilitychange', checkVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', checkVisibility);
    };
  }, []);

  if (!shouldRender || contextLost) return null;

  return (
    <div
      className={`hidden md:block fixed inset-0 -z-10 pointer-events-none overflow-hidden transition-opacity duration-300 ${
        isDark ? 'opacity-30' : 'opacity-20'
      }`}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 14], fov: 45 }}
        dpr={[1, 1.25]}
        gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
      >
        <ArchitecturalGridBlocks
          isDark={isDark}
          onContextLost={() => setContextLost(true)}
        />
      </Canvas>
    </div>
  );
}

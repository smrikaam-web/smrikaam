import React, { useRef, useEffect } from 'react';

/**
 * Central 3D Cube for What We Build Section
 * Sits in the center between the 6 capabilities with continuous 3D rotation,
 * glowing core, and floating vertices.
 */
export default function WhatWeBuild3DNetwork({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = canvas.offsetWidth || 340;
    let height = canvas.offsetHeight || 340;

    const setupCanvas = () => {
      width = canvas.offsetWidth || 340;
      height = canvas.offsetHeight || 340;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    setupCanvas();
    window.addEventListener('resize', setupCanvas);

    const s = 65; // Outer cube
    const sCore = 38; // Inner core cube

    const makeVertices = (size) => [
      [-size, -size, -size],
      [size, -size, -size],
      [size, size, -size],
      [-size, size, -size],
      [-size, -size, size],
      [size, -size, size],
      [size, size, size],
      [-size, size, size],
    ];

    const outerVertices = makeVertices(s);
    const innerVertices = makeVertices(sCore);

    const project = (x, y, z, rotX, rotY) => {
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x1 = x * cosY + z * sinY;
      const z1 = -x * sinY + z * cosY;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      const fov = 320;
      const distance = 280;
      const scale = fov / (distance + z2);

      return {
        px: width / 2 + x1 * scale,
        py: height / 2 + y2 * scale,
      };
    };

    const render = () => {
      time += 0.01;
      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.classList.contains('dark');
      const rotY = time * 0.35;
      const rotX = 0.45 + Math.sin(time * 0.4) * 0.08;
      const floatY = Math.sin(time * 0.8) * 4;

      const projOuter = outerVertices.map(([vx, vy, vz]) =>
        project(vx, vy + floatY, vz, rotX, rotY)
      );

      const projInner = innerVertices.map(([vx, vy, vz]) =>
        project(vx, vy + floatY, vz, -rotX * 0.8, -rotY * 1.2)
      );

      // Faces for Outer Cube
      const faces = [
        [0, 1, 2, 3],
        [4, 5, 6, 7],
        [0, 1, 5, 4],
        [2, 3, 7, 6],
        [0, 3, 7, 4],
        [1, 2, 6, 5],
      ];

      faces.forEach((face) => {
        ctx.beginPath();
        ctx.moveTo(projOuter[face[0]].px, projOuter[face[0]].py);
        for (let i = 1; i < face.length; i++) {
          ctx.lineTo(projOuter[face[i]].px, projOuter[face[i]].py);
        }
        ctx.closePath();
        ctx.fillStyle = isDark
          ? 'rgba(255, 255, 255, 0.06)'
          : 'rgba(255, 255, 255, 0.30)';
        ctx.fill();
      });

      // Edges for Outer Cube
      const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7],
      ];

      edges.forEach(([i, j]) => {
        ctx.beginPath();
        ctx.moveTo(projOuter[i].px, projOuter[i].py);
        ctx.lineTo(projOuter[j].px, projOuter[j].py);
        ctx.strokeStyle = isDark
          ? 'rgba(255, 255, 255, 0.65)'
          : 'rgba(15, 23, 42, 0.60)';
        ctx.lineWidth = 1.3;
        ctx.stroke();
      });

      // Inner Rotating Core
      edges.forEach(([i, j]) => {
        ctx.beginPath();
        ctx.moveTo(projInner[i].px, projInner[i].py);
        ctx.lineTo(projInner[j].px, projInner[j].py);
        ctx.strokeStyle = isDark
          ? 'rgba(255, 255, 255, 0.95)'
          : 'rgba(15, 23, 42, 0.90)';
        ctx.lineWidth = 1.6;
        ctx.stroke();
      });

      // Outer Vertices Glow Nodes
      projOuter.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.px, p.py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? 'rgba(255, 255, 255, 0.95)'
          : 'rgba(15, 23, 42, 0.95)';
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', setupCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      className={`relative w-full h-full min-h-[200px] md:min-h-[240px] max-h-[280px] flex items-center justify-center pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full max-w-[280px] max-h-[280px] object-contain"
      />
    </div>
  );
}


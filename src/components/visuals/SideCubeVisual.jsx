import React, { useRef, useEffect } from 'react';

/**
 * SideCubeVisual
 * Highly optimized, responsive 3D wireframe cube visual for peripheral page margins.
 * Decorative ambient engineering element:
 * - Positioned on left/right flanks
 * - Pointer events disabled (never blocks clicks/scroll)
 * - Safe opacity (0.15 - 0.28)
 * - Seamless automatic Dark/Light mode adaptation
 */
export default function SideCubeVisual({
  size = 140,
  speed = 1,
  variant = 'nested', // 'nested' | 'cluster' | 'isometric'
  className = '',
  style = {}
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = Math.random() * 20;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = size * 2;
    const height = size * 2;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const sOuter = size * 0.44;
    const sInner = size * (variant === 'cluster' ? 0.22 : 0.26);

    const outerVertices = [
      [-sOuter, -sOuter, -sOuter],
      [sOuter, -sOuter, -sOuter],
      [sOuter, sOuter, -sOuter],
      [-sOuter, sOuter, -sOuter],
      [-sOuter, -sOuter, sOuter],
      [sOuter, -sOuter, sOuter],
      [sOuter, sOuter, sOuter],
      [-sOuter, sOuter, sOuter],
    ];

    const innerVertices = [
      [-sInner, -sInner, -sInner],
      [sInner, -sInner, -sInner],
      [sInner, sInner, -sInner],
      [-sInner, sInner, -sInner],
      [-sInner, -sInner, sInner],
      [sInner, -sInner, sInner],
      [sInner, sInner, sInner],
      [-sInner, sInner, sInner],
    ];

    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
    ];

    const faces = [
      [0, 1, 2, 3],
      [4, 5, 6, 7],
      [0, 1, 5, 4],
      [2, 3, 7, 6],
      [0, 3, 7, 4],
      [1, 2, 6, 5],
    ];

    const project = (x, y, z, rotX, rotY) => {
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x1 = x * cosY + z * sinY;
      const z1 = -x * sinY + z * cosY;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      const scale = 240 / (280 + z2);

      return {
        px: width / 2 + x1 * scale,
        py: height / 2 + y2 * scale,
        depth: z2
      };
    };

    const render = () => {
      time += 0.01 * speed;
      ctx.clearRect(0, 0, width, height);

      const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
      const rotY = time * 0.35;
      const rotX = 0.45 + Math.sin(time * 0.4) * 0.08;
      const floatY = Math.sin(time * 0.9) * 4;

      const outerProj = outerVertices.map(([vx, vy, vz]) =>
        project(vx, vy + floatY, vz, rotX, rotY)
      );

      const innerProj = innerVertices.map(([vx, vy, vz]) =>
        project(vx, vy + floatY, vz, -rotX * 1.1, -rotY * 1.1)
      );

      // Render Outer Translucent Faces
      faces.forEach((face) => {
        ctx.beginPath();
        ctx.moveTo(outerProj[face[0]].px, outerProj[face[0]].py);
        for (let i = 1; i < face.length; i++) {
          ctx.lineTo(outerProj[face[i]].px, outerProj[face[i]].py);
        }
        ctx.closePath();
        ctx.fillStyle = isDark
          ? 'rgba(255, 255, 255, 0.03)'
          : 'rgba(0, 0, 0, 0.02)';
        ctx.fill();
      });

      // Render Outer Edges
      edges.forEach(([i, j]) => {
        ctx.beginPath();
        ctx.moveTo(outerProj[i].px, outerProj[i].py);
        ctx.lineTo(outerProj[j].px, outerProj[j].py);
        ctx.strokeStyle = isDark
          ? 'rgba(255, 255, 255, 0.45)'
          : 'rgba(0, 0, 0, 0.35)';
        ctx.lineWidth = 1.0;
        ctx.stroke();
      });

      // Render Outer Vertices Nodes
      outerProj.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.px, p.py, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? 'rgba(255, 255, 255, 0.85)'
          : 'rgba(0, 0, 0, 0.75)';
        ctx.fill();
      });

      // Render Inner Nested Wireframe
      if (variant === 'nested' || variant === 'cluster') {
        edges.forEach(([i, j]) => {
          ctx.beginPath();
          ctx.moveTo(innerProj[i].px, innerProj[i].py);
          ctx.lineTo(innerProj[j].px, innerProj[j].py);
          ctx.strokeStyle = isDark
            ? 'rgba(255, 255, 255, 0.65)'
            : 'rgba(0, 0, 0, 0.50)';
          ctx.lineWidth = 1.2;
          ctx.stroke();
        });

        innerProj.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.px, p.py, 1.4, 0, Math.PI * 2);
          ctx.fillStyle = isDark
            ? 'rgba(255, 255, 255, 0.95)'
            : 'rgba(0, 0, 0, 0.85)';
          ctx.fill();
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [size, speed, variant]);

  return (
    <div
      className={`pointer-events-none select-none z-0 overflow-hidden ${className}`}
      style={style}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        style={{
          width: size,
          height: size,
          display: 'block'
        }}
      />
    </div>
  );
}

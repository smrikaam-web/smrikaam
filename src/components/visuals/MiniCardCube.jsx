import React, { useRef, useEffect } from 'react';

/**
 * MiniCardCube Visual
 * Compact, lightweight 3D wireframe cube for architectural cards (Goal, Vision, Mission, etc.).
 * Continuously floats and rotates smoothly.
 */
export default function MiniCardCube({ size = 36, speed = 1, className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = Math.random() * 10;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = size * 2;
    const height = size * 2;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const s = size * 0.42;
    const vertices = [
      [-s, -s, -s],
      [s, -s, -s],
      [s, s, -s],
      [-s, s, -s],
      [-s, -s, s],
      [s, -s, s],
      [s, s, s],
      [-s, s, s],
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

      const scale = 160 / (180 + z2);

      return {
        px: width / 2 + x1 * scale,
        py: height / 2 + y2 * scale,
      };
    };

    const render = () => {
      time += 0.015 * speed;
      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.classList.contains('dark');
      const rotY = time * 0.4;
      const rotX = 0.45 + Math.sin(time * 0.5) * 0.1;
      const floatY = Math.sin(time) * 2;

      const proj = vertices.map(([vx, vy, vz]) =>
        project(vx, vy + floatY, vz, rotX, rotY)
      );

      // Faces
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
        ctx.moveTo(proj[face[0]].px, proj[face[0]].py);
        for (let i = 1; i < face.length; i++) {
          ctx.lineTo(proj[face[i]].px, proj[face[i]].py);
        }
        ctx.closePath();
        ctx.fillStyle = isDark
          ? 'rgba(255, 255, 255, 0.08)'
          : 'rgba(255, 255, 255, 0.40)';
        ctx.fill();
      });

      // Edges
      const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7],
      ];

      edges.forEach(([i, j]) => {
        ctx.beginPath();
        ctx.moveTo(proj[i].px, proj[i].py);
        ctx.lineTo(proj[j].px, proj[j].py);
        ctx.strokeStyle = isDark
          ? 'rgba(255, 255, 255, 0.75)'
          : 'rgba(15, 23, 42, 0.65)';
        ctx.lineWidth = 1.1;
        ctx.stroke();
      });

      // Vertices nodes
      proj.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.px, p.py, 1.4, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? 'rgba(255, 255, 255, 0.95)'
          : 'rgba(15, 23, 42, 0.90)';
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [size, speed]);

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 pointer-events-none select-none ${className}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} style={{ width: `${size}px`, height: `${size}px` }} />
    </div>
  );
}


import React, { useRef, useEffect } from 'react';

/**
 * 3D Animated Cubes for Accelerators Showcase
 * Variants for BitXhift, MigrateMax, ParseMaster, and LinkGenX.
 * Continuously floats, rotates slowly, and animates its internal telemetry nodes.
 */
export default function AcceleratorCube({
  variant = 'bitxhift',
  size = 100,
  className = '',
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time =
      variant === 'bitxhift'
        ? 0
        : variant === 'migratemax'
        ? 1.5
        : variant === 'parsemaster'
        ? 3
        : 4.5;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = size * 2;
    const height = size * 2;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const s = size * 0.44;
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

    // Inner nested structure depending on variant
    const sInner = s * (variant === 'linkgenx' ? 0.7 : 0.5);
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

    const project = (x, y, z, rotX, rotY) => {
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x1 = x * cosY + z * sinY;
      const z1 = -x * sinY + z * cosY;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      const scale = 250 / (280 + z2);

      return {
        px: width / 2 + x1 * scale,
        py: height / 2 + y2 * scale,
      };
    };

    const render = () => {
      time += 0.009;
      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.classList.contains('dark');
      const rotY = time * 0.32;
      const rotX = 0.45 + Math.sin(time * 0.5) * 0.06;
      const floatY = Math.sin(time * 1.1) * 3.5;

      const projOuter = vertices.map(([vx, vy, vz]) =>
        project(vx, vy + floatY, vz, rotX, rotY)
      );

      const projInner = innerVertices.map(([vx, vy, vz]) =>
        project(
          vx,
          vy + floatY,
          vz,
          variant === 'migratemax' ? -rotX : rotX * 1.2,
          variant === 'migratemax' ? -rotY : rotY * 1.2
        )
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
        ctx.moveTo(projOuter[face[0]].px, projOuter[face[0]].py);
        for (let i = 1; i < face.length; i++) {
          ctx.lineTo(projOuter[face[i]].px, projOuter[face[i]].py);
        }
        ctx.closePath();
        ctx.fillStyle = isDark
          ? 'rgba(255, 255, 255, 0.06)'
          : 'rgba(255, 255, 255, 0.35)';
        ctx.fill();
      });

      const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7],
      ];

      // Outer wireframe
      edges.forEach(([i, j]) => {
        ctx.beginPath();
        ctx.moveTo(projOuter[i].px, projOuter[i].py);
        ctx.lineTo(projOuter[j].px, projOuter[j].py);
        ctx.strokeStyle = isDark
          ? 'rgba(255, 255, 255, 0.75)'
          : 'rgba(15, 23, 42, 0.65)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });

      // Inner wireframe
      edges.forEach(([i, j]) => {
        ctx.beginPath();
        ctx.moveTo(projInner[i].px, projInner[i].py);
        ctx.lineTo(projInner[j].px, projInner[j].py);
        ctx.strokeStyle = isDark
          ? 'rgba(255, 255, 255, 0.50)'
          : 'rgba(15, 23, 42, 0.40)';
        ctx.lineWidth = 0.9;
        ctx.stroke();
      });

      // Diagonal cross-links for LinkGenX
      if (variant === 'linkgenx') {
        for (let i = 0; i < 8; i += 2) {
          ctx.beginPath();
          ctx.moveTo(projOuter[i].px, projOuter[i].py);
          ctx.lineTo(projInner[i].px, projInner[i].py);
          ctx.strokeStyle = isDark
            ? 'rgba(255, 255, 255, 0.35)'
            : 'rgba(15, 23, 42, 0.30)';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      // Nodes
      projOuter.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.px, p.py, 2.0, 0, Math.PI * 2);
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
  }, [variant, size]);

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


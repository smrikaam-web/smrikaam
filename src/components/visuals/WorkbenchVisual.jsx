import React, { useRef, useEffect } from 'react';

/**
 * 3D Visuals for Editorial Workbench Cards
 * Type 'terrain': Animated 3D wireframe perspective terrain grid with undulating data waves.
 * Type 'cube': Animated 3D parsing cube structure with streaming matrix nodes.
 */
export default function WorkbenchVisual({ type = 'terrain', className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = canvas.offsetWidth || 380;
    let height = canvas.offsetHeight || 180;

    const setupCanvas = () => {
      width = canvas.offsetWidth || 380;
      height = canvas.offsetHeight || 180;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    setupCanvas();
    window.addEventListener('resize', setupCanvas);

    const renderTerrain = (isDark) => {
      ctx.clearRect(0, 0, width, height);

      const rows = 12;
      const cols = 22;
      const spacingX = width / (cols - 1);
      const spacingY = (height * 0.8) / (rows - 1);

      ctx.lineWidth = 0.9;
      ctx.strokeStyle = isDark
        ? 'rgba(255, 255, 255, 0.35)'
        : 'rgba(15, 23, 42, 0.40)';

      const points = [];

      for (let r = 0; r < rows; r++) {
        const rowPoints = [];
        const progressY = r / (rows - 1);
        const yBase = height * 0.2 + r * spacingY;

        for (let c = 0; c < cols; c++) {
          const x = c * spacingX;
          const distFromCenter = Math.abs(c - cols / 2) / (cols / 2);
          const wave =
            Math.sin(time * 1.5 + c * 0.4 + r * 0.6) *
            Math.cos(time * 0.8 + r * 0.5) *
            (1 - distFromCenter * 0.5) *
            18;

          const y = yBase - wave * (1 - progressY * 0.3);
          rowPoints.push({ x, y });
        }
        points.push(rowPoints);
      }

      // Draw Horizontal Grid Lines
      for (let r = 0; r < rows; r++) {
        ctx.beginPath();
        ctx.moveTo(points[r][0].x, points[r][0].y);
        for (let c = 1; c < cols; c++) {
          ctx.lineTo(points[r][c].x, points[r][c].y);
        }
        ctx.stroke();
      }

      // Draw Vertical Grid Lines
      for (let c = 0; c < cols; c += 2) {
        ctx.beginPath();
        ctx.moveTo(points[0][c].x, points[0][c].y);
        for (let r = 1; r < rows; r++) {
          ctx.lineTo(points[r][c].x, points[r][c].y);
        }
        ctx.stroke();
      }

      // Draw Highlight Peaks (Data telemetry nodes)
      for (let r = 2; r < rows - 2; r += 2) {
        for (let c = 4; c < cols - 4; c += 4) {
          const p = points[r][c];
          ctx.beginPath();
          ctx.arc(p.px || p.x, p.py || p.y, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = isDark
            ? 'rgba(255, 255, 255, 0.95)'
            : 'rgba(15, 23, 42, 0.90)';
          ctx.fill();
        }
      }
    };

    const renderCube = (isDark) => {
      ctx.clearRect(0, 0, width, height);

      const s = 48;
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

      const sInner = 28;
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

      const rotY = time * 0.4;
      const rotX = 0.42 + Math.sin(time * 0.6) * 0.08;
      const floatY = Math.sin(time * 1.2) * 4;

      const project = (x, y, z) => {
        const cosY = Math.cos(rotY);
        const sinY = Math.sin(rotY);
        const x1 = x * cosY + z * sinY;
        const z1 = -x * sinY + z * cosY;

        const cosX = Math.cos(rotX);
        const sinX = Math.sin(rotX);
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;

        const scale = 200 / (220 + z2);
        return {
          px: width / 2 + x1 * scale,
          py: height / 2 + y2 * scale,
        };
      };

      const projOuter = vertices.map(([vx, vy, vz]) =>
        project(vx, vy + floatY, vz)
      );
      const projInner = innerVertices.map(([vx, vy, vz]) =>
        project(vx, vy + floatY, vz)
      );

      // Outer faces
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

      const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7],
      ];

      // Outer Edges
      edges.forEach(([i, j]) => {
        ctx.beginPath();
        ctx.moveTo(projOuter[i].px, projOuter[i].py);
        ctx.lineTo(projOuter[j].px, projOuter[j].py);
        ctx.strokeStyle = isDark
          ? 'rgba(255, 255, 255, 0.75)'
          : 'rgba(15, 23, 42, 0.65)';
        ctx.lineWidth = 1.3;
        ctx.stroke();
      });

      // Inner Core
      edges.forEach(([i, j]) => {
        ctx.beginPath();
        ctx.moveTo(projInner[i].px, projInner[i].py);
        ctx.lineTo(projInner[j].px, projInner[j].py);
        ctx.strokeStyle = isDark
          ? 'rgba(255, 255, 255, 0.45)'
          : 'rgba(15, 23, 42, 0.40)';
        ctx.lineWidth = 0.9;
        ctx.stroke();
      });

      // Outer Nodes
      projOuter.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.px, p.py, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? 'rgba(255, 255, 255, 0.95)'
          : 'rgba(15, 23, 42, 0.90)';
        ctx.fill();
      });
    };

    const render = () => {
      time += 0.012;
      const isDark = document.documentElement.classList.contains('dark');

      if (type === 'terrain') {
        renderTerrain(isDark);
      } else {
        renderCube(isDark);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', setupCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [type]);

  return (
    <div
      className={`relative w-full h-[120px] md:h-[130px] flex items-center justify-center pointer-events-none select-none overflow-hidden bg-[var(--color-surface-subtle)]/40 border-b border-[var(--color-border)] ${className}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full object-contain" />
    </div>
  );
}


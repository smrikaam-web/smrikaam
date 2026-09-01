import React, { useRef, useEffect } from 'react';

/**
 * CtaCoreCluster Visual
 * Grand 3D architectural visual climax for "Have A Business Challenge?" section.
 * Large illuminated multi-cube system with glowing core, orbiting micro-cubes,
 * perspective ground grid, and ambient particles.
 */
export default function CtaCoreCluster({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = canvas.offsetWidth || 480;
    let height = canvas.offsetHeight || 440;

    const setupCanvas = () => {
      width = canvas.offsetWidth || 480;
      height = canvas.offsetHeight || 440;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    setupCanvas();
    window.addEventListener('resize', setupCanvas);

    const cubes = [
      { x: 0, y: 0, z: 0, size: 95, isCore: true },
      { x: -50, y: -40, z: 35, size: 65 },
      { x: 55, y: -30, z: -25, size: 70 },
      { x: 40, y: 45, z: 30, size: 60 },
      { x: -45, y: 40, z: -35, size: 55 },
      { x: -90, y: -10, z: 20, size: 35 },
      { x: 80, y: 15, z: -40, size: 35 },
      // Floating micro-cubes
      { x: -110, y: -65, z: 60, size: 18, isMicro: true },
      { x: 115, y: -50, z: -55, size: 20, isMicro: true },
      { x: 95, y: 75, z: 45, size: 16, isMicro: true },
      { x: -85, y: 85, z: -40, size: 18, isMicro: true },
    ];

    // Ambient floating particles
    const particles = Array.from({ length: 24 }, () => ({
      x: (Math.random() - 0.5) * 320,
      y: (Math.random() - 0.5) * 260,
      z: (Math.random() - 0.5) * 200,
      speed: 0.5 + Math.random() * 0.8,
      size: 1 + Math.random() * 2,
    }));

    const project = (x, y, z, rotX, rotY) => {
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x1 = x * cosY + z * sinY;
      const z1 = -x * sinY + z * cosY;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      const fov = 420;
      const distance = 360;
      const scale = fov / (distance + z2);

      return {
        px: width / 2 + x1 * scale,
        py: height / 2 + y2 * scale,
        depth: z2,
      };
    };

    const drawGrid = (rotX, rotY, isDark) => {
      const gridY = 130;
      const gridSize = 220;
      const step = 35;

      ctx.lineWidth = 0.7;
      ctx.strokeStyle = isDark
        ? 'rgba(255, 255, 255, 0.10)'
        : 'rgba(15, 23, 42, 0.10)';

      for (let gx = -gridSize; gx <= gridSize; gx += step) {
        const p1 = project(gx, gridY, -gridSize, rotX, rotY);
        const p2 = project(gx, gridY, gridSize, rotX, rotY);
        ctx.beginPath();
        ctx.moveTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);
        ctx.stroke();
      }

      for (let gz = -gridSize; gz <= gridSize; gz += step) {
        const p1 = project(-gridSize, gridY, gz, rotX, rotY);
        const p2 = project(gridSize, gridY, gz, rotX, rotY);
        ctx.beginPath();
        ctx.moveTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);
        ctx.stroke();
      }
    };

    const render = () => {
      time += 0.008;
      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.classList.contains('dark');
      const rotY = time * 0.26;
      const rotX = 0.35 + Math.sin(time * 0.35) * 0.04;

      drawGrid(rotX, rotY, isDark);

      // Draw subtle particles
      particles.forEach((pt) => {
        const py = pt.y + Math.sin(time * pt.speed + pt.x) * 8;
        const px = pt.x + Math.cos(time * pt.speed * 0.8 + pt.y) * 5;
        const proj = project(px, py, pt.z, rotX, rotY);

        ctx.beginPath();
        ctx.arc(proj.px, proj.py, pt.size, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? 'rgba(255, 255, 255, 0.50)'
          : 'rgba(15, 23, 42, 0.45)';
        ctx.fill();
      });

      cubes.forEach((cube) => {
        const s = cube.size / 2;
        const floatY = cube.isMicro
          ? Math.sin(time * 1.5 + cube.x) * 7
          : Math.sin(time * 0.7 + cube.x * 0.05) * 3.5;

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

        const proj = vertices.map(([vx, vy, vz]) =>
          project(cube.x + vx, cube.y + vy + floatY, cube.z + vz, rotX, rotY)
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

          if (cube.isCore) {
            ctx.fillStyle = isDark
              ? 'rgba(255, 255, 255, 0.18)'
              : 'rgba(255, 255, 255, 0.55)';
          } else {
            ctx.fillStyle = isDark
              ? 'rgba(255, 255, 255, 0.06)'
              : 'rgba(255, 255, 255, 0.28)';
          }
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

          if (cube.isCore) {
            ctx.strokeStyle = isDark
              ? 'rgba(255, 255, 255, 0.95)'
              : 'rgba(15, 23, 42, 0.90)';
            ctx.lineWidth = 1.6;
          } else if (cube.isMicro) {
            ctx.strokeStyle = isDark
              ? 'rgba(255, 255, 255, 0.45)'
              : 'rgba(15, 23, 42, 0.40)';
            ctx.lineWidth = 0.9;
          } else {
            ctx.strokeStyle = isDark
              ? 'rgba(255, 255, 255, 0.65)'
              : 'rgba(15, 23, 42, 0.60)';
            ctx.lineWidth = 1.2;
          }
          ctx.stroke();
        });

        // Vertex Nodes
        if (!cube.isMicro) {
          proj.forEach((p, idx) => {
            if (idx % 2 === 0) {
              ctx.beginPath();
              ctx.arc(p.px, p.py, cube.isCore ? 2.8 : 2.0, 0, Math.PI * 2);
              ctx.fillStyle = isDark
                ? 'rgba(255, 255, 255, 0.95)'
                : 'rgba(15, 23, 42, 0.95)';
              ctx.fill();
            }
          });
        }
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
      className={`relative w-full h-full min-h-[220px] md:min-h-[260px] max-h-[300px] flex items-center justify-center pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full max-w-[320px] max-h-[320px] object-contain"
      />
    </div>
  );
}


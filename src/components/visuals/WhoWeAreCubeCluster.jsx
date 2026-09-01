import React, { useRef, useEffect } from 'react';

/**
 * Who We Are Section 3D Architectural Visual
 * Layered geometric cubes with continuous subtle floating and slow rotation.
 */
export default function WhoWeAreCubeCluster({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = canvas.offsetWidth || 440;
    let height = canvas.offsetHeight || 440;

    const setupCanvas = () => {
      width = canvas.offsetWidth || 440;
      height = canvas.offsetHeight || 440;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    setupCanvas();
    window.addEventListener('resize', setupCanvas);

    const cubes = [
      { x: 0, y: 0, z: 0, size: 90, isCore: true },
      { x: -50, y: -40, z: 30, size: 60 },
      { x: 50, y: 35, z: -25, size: 65 },
      { x: 35, y: -50, z: 35, size: 50 },
      { x: -45, y: 45, z: -35, size: 50 },
      { x: -90, y: -20, z: 50, size: 22, isMicro: true },
      { x: 95, y: 15, z: -45, size: 24, isMicro: true },
      { x: 10, y: 80, z: 30, size: 18, isMicro: true },
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

      const fov = 400;
      const distance = 350;
      const scale = fov / (distance + z2);

      return {
        px: width / 2 + x1 * scale,
        py: height / 2 + y2 * scale,
        depth: z2,
      };
    };

    const render = () => {
      time += 0.007;
      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.classList.contains('dark');
      const rotY = time * 0.22;
      const rotX = 0.32 + Math.sin(time * 0.35) * 0.03;

      cubes.forEach((cube) => {
        const s = cube.size / 2;
        const floatY = cube.isMicro
          ? Math.sin(time * 1.4 + cube.x) * 6
          : Math.sin(time * 0.7 + cube.x * 0.04) * 3;

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
          ctx.fillStyle = isDark
            ? 'rgba(255, 255, 255, 0.08)'
            : 'rgba(255, 255, 255, 0.35)';
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
            ? cube.isCore ? 'rgba(255, 255, 255, 0.90)' : 'rgba(255, 255, 255, 0.50)'
            : cube.isCore ? 'rgba(15, 23, 42, 0.85)' : 'rgba(15, 23, 42, 0.48)';
          ctx.lineWidth = cube.isCore ? 1.4 : 1.0;
          ctx.stroke();
        });
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
        className="w-full h-full max-w-full sm:max-w-[340px] max-h-[340px] object-contain"
      />
    </div>
  );
}


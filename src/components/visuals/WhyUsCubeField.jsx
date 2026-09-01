import React, { useRef, useEffect } from 'react';

/**
 * WhyUsCubeField Visual
 * Ambient floating 3D wireframe cubes in the background of Why Choose Us section.
 */
export default function WhyUsCubeField({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = canvas.offsetWidth || 800;
    let height = canvas.offsetHeight || 260;

    const setupCanvas = () => {
      width = canvas.offsetWidth || 800;
      height = canvas.offsetHeight || 260;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    setupCanvas();
    window.addEventListener('resize', setupCanvas);

    const cubes = [
      { x: -280, y: -20, z: 20, size: 45, speed: 0.8 },
      { x: -90, y: 30, z: -40, size: 55, speed: 1.1 },
      { x: 100, y: -30, z: 30, size: 40, speed: 0.9 },
      { x: 290, y: 15, z: -20, size: 50, speed: 1.0 },
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

      const scale = 500 / (550 + z2);

      return {
        px: width / 2 + x1 * scale,
        py: height / 2 + y2 * scale,
      };
    };

    const render = () => {
      time += 0.007;
      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.classList.contains('dark');

      cubes.forEach((cube) => {
        const s = cube.size / 2;
        const rotY = time * 0.25 * cube.speed;
        const rotX = 0.38 + Math.sin(time * 0.4 * cube.speed) * 0.05;
        const floatY = Math.sin(time * cube.speed + cube.x) * 5;

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
            ? 'rgba(255, 255, 255, 0.05)'
            : 'rgba(255, 255, 255, 0.28)';
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
            ? 'rgba(255, 255, 255, 0.45)'
            : 'rgba(15, 23, 42, 0.40)';
          ctx.lineWidth = 1.0;
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
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full object-contain opacity-70" />
    </div>
  );
}


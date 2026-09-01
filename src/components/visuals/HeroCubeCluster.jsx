import React, { useRef, useEffect } from 'react';

/**
 * Hero 3D Cube Cluster Visual
 * Real 3D multi-cube architectural system with translucent surfaces,
 * wireframe edges, glowing inner core, floating micro-cubes, nodes, and perspective grid.
 * Continuously animates subtly (slow rotation, floating, edge illumination).
 */
export default function HeroCubeCluster({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = canvas.offsetWidth || 520;
    let height = canvas.offsetHeight || 520;

    const setupCanvas = () => {
      width = canvas.offsetWidth || 520;
      height = canvas.offsetHeight || 520;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    setupCanvas();
    window.addEventListener('resize', setupCanvas);

    // 3D Cubes Definition (x, y, z, size, opacity)
    const cubes = [
      { x: 0, y: 0, z: 0, size: 110, isCore: true },
      { x: -55, y: -45, z: 45, size: 70 },
      { x: 65, y: -35, z: -30, size: 85 },
      { x: 45, y: 50, z: 40, size: 75 },
      { x: -60, y: 40, z: -40, size: 65 },
      { x: -95, y: -10, z: 15, size: 45 },
      { x: 85, y: 20, z: -60, size: 40 },
      { x: 20, y: -85, z: 20, size: 50 },
      { x: -30, y: 90, z: -20, size: 45 },
      // Micro floating cubes
      { x: -130, y: -70, z: 80, size: 20, isMicro: true },
      { x: 140, y: -60, z: -70, size: 24, isMicro: true },
      { x: 120, y: 95, z: 60, size: 18, isMicro: true },
      { x: -110, y: 110, z: -50, size: 22, isMicro: true },
      { x: 0, y: -130, z: 40, size: 16, isMicro: true },
    ];

    // 3D Projector Helper
    const project = (x, y, z, rotX, rotY, rotZ) => {
      // Rotate Y
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      let x1 = x * cosY + z * sinY;
      let z1 = -x * sinY + z * cosY;

      // Rotate X
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      let y2 = y * cosX - z1 * sinX;
      let z2 = y * sinX + z1 * cosX;

      // Rotate Z
      const cosZ = Math.cos(rotZ);
      const sinZ = Math.sin(rotZ);
      let x3 = x1 * cosZ - y2 * sinZ;
      let y3 = x1 * sinZ + y2 * cosZ;

      // Perspective Projection
      const fov = 450;
      const distance = 400;
      const scale = fov / (distance + z2);

      return {
        px: width / 2 + x3 * scale,
        py: height / 2 + y3 * scale,
        scale,
        depth: z2,
      };
    };

    const drawCube = (cube, baseRotX, baseRotY, isDark) => {
      const s = cube.size / 2;
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

      // Subtle float offset for individual cubes
      const floatY = cube.isMicro
        ? Math.sin(time * 1.5 + cube.x) * 8
        : Math.sin(time * 0.8 + cube.x * 0.05) * 4;
      const floatX = Math.cos(time * 0.6 + cube.y * 0.05) * 3;

      const projVertices = vertices.map(([vx, vy, vz]) =>
        project(
          cube.x + vx + floatX,
          cube.y + vy + floatY,
          cube.z + vz,
          baseRotX,
          baseRotY,
          0
        )
      );

      // Cube Faces (indices into vertices)
      const faces = [
        [0, 1, 2, 3], // Front/Back
        [4, 5, 6, 7],
        [0, 1, 5, 4], // Top/Bottom
        [2, 3, 7, 6],
        [0, 3, 7, 4], // Left/Right
        [1, 2, 6, 5],
      ];

      // Draw Translucent Faces
      faces.forEach((face) => {
        ctx.beginPath();
        ctx.moveTo(projVertices[face[0]].px, projVertices[face[0]].py);
        for (let i = 1; i < face.length; i++) {
          ctx.lineTo(projVertices[face[i]].px, projVertices[face[i]].py);
        }
        ctx.closePath();

        if (cube.isCore) {
          ctx.fillStyle = isDark
            ? 'rgba(255, 255, 255, 0.16)'
            : 'rgba(255, 255, 255, 0.55)';
        } else {
          ctx.fillStyle = isDark
            ? 'rgba(255, 255, 255, 0.06)'
            : 'rgba(255, 255, 255, 0.28)';
        }
        ctx.fill();
      });

      // Draw Wireframe Edges
      const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7],
      ];

      edges.forEach(([i, j]) => {
        ctx.beginPath();
        ctx.moveTo(projVertices[i].px, projVertices[i].py);
        ctx.lineTo(projVertices[j].px, projVertices[j].py);

        if (cube.isCore) {
          ctx.strokeStyle = isDark
            ? 'rgba(255, 255, 255, 0.95)'
            : 'rgba(15, 23, 42, 0.88)';
          ctx.lineWidth = 1.6;
        } else if (cube.isMicro) {
          ctx.strokeStyle = isDark
            ? 'rgba(255, 255, 255, 0.45)'
            : 'rgba(15, 23, 42, 0.40)';
          ctx.lineWidth = 0.9;
        } else {
          ctx.strokeStyle = isDark
            ? 'rgba(255, 255, 255, 0.60)'
            : 'rgba(15, 23, 42, 0.55)';
          ctx.lineWidth = 1.1;
        }
        ctx.stroke();
      });

      // Nodes on vertices for tech architectural look
      if (!cube.isMicro) {
        projVertices.forEach((p, vIdx) => {
          if (vIdx % 2 === 0) {
            ctx.beginPath();
            ctx.arc(p.px, p.py, cube.isCore ? 2.8 : 2.0, 0, Math.PI * 2);
            ctx.fillStyle = isDark
              ? 'rgba(255, 255, 255, 0.95)'
              : 'rgba(15, 23, 42, 0.90)';
            ctx.fill();
          }
        });
      }
    };

    // Draw Ground Perspective Grid
    const drawGrid = (rotX, rotY, isDark) => {
      const gridY = 160;
      const gridSize = 260;
      const step = 40;

      ctx.lineWidth = 0.7;
      ctx.strokeStyle = isDark
        ? 'rgba(255, 255, 255, 0.10)'
        : 'rgba(15, 23, 42, 0.10)';

      for (let gx = -gridSize; gx <= gridSize; gx += step) {
        const p1 = project(gx, gridY, -gridSize, rotX, rotY, 0);
        const p2 = project(gx, gridY, gridSize, rotX, rotY, 0);
        ctx.beginPath();
        ctx.moveTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);
        ctx.stroke();
      }

      for (let gz = -gridSize; gz <= gridSize; gz += step) {
        const p1 = project(-gridSize, gridY, gz, rotX, rotY, 0);
        const p2 = project(gridSize, gridY, gz, rotX, rotY, 0);
        ctx.beginPath();
        ctx.moveTo(p1.px, p1.py);
        ctx.lineTo(p2.px, p2.py);
        ctx.stroke();
      }
    };

    const render = () => {
      time += 0.008; // Calm, continuous architectural motion
      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.classList.contains('dark');

      // Continuous Slow Rotation & Floating
      const rotY = time * 0.25; // ~45s full revolution
      const rotX = 0.35 + Math.sin(time * 0.4) * 0.04;

      drawGrid(rotX, rotY, isDark);

      // Sort cubes by projected depth for proper occlusion
      const sortedCubes = [...cubes].sort((a, b) => {
        const pA = project(a.x, a.y, a.z, rotX, rotY, 0);
        const pB = project(b.x, b.y, b.z, rotX, rotY, 0);
        return pA.depth - pB.depth;
      });

      sortedCubes.forEach((cube) => drawCube(cube, rotX, rotY, isDark));

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
      className={`relative w-full h-full min-h-[260px] md:min-h-[320px] max-h-[380px] flex items-center justify-center pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full max-w-[440px] max-h-[440px] object-contain"
      />
    </div>
  );
}


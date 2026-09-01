import React, { useRef, useEffect } from 'react';

/**
 * ConnectingArchitecture3D
 * Sits in the center between "WHO WE ARE" (Left) and "WHAT WE BUILD" (Right).
 * Renders a central rotating 3D wireframe cube with dual-directional data streams,
 * pulsing circuit connectors, and horizontal bridging rays connecting both sides.
 */
export default function ConnectingArchitecture3D({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = canvas.offsetWidth || 240;
    let height = canvas.offsetHeight || 320;

    const setupCanvas = () => {
      width = canvas.offsetWidth || 240;
      height = canvas.offsetHeight || 320;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    setupCanvas();
    window.addEventListener('resize', setupCanvas);

    // 3D Cube Vertices
    const s = 46; // Outer cube size
    const sCore = 26; // Inner core cube size

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

    const project = (x, y, z, rotX, rotY, cx, cy) => {
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x1 = x * cosY + z * sinY;
      const z1 = -x * sinY + z * cosY;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      const fov = 320;
      const distance = 260;
      const scale = fov / (distance + z2);

      return {
        px: cx + x1 * scale,
        py: cy + y2 * scale,
      };
    };

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.classList.contains('dark');
      const cx = width / 2;
      const cy = height / 2;

      // Theme Colors
      const mainStroke = isDark ? 'rgba(255, 255, 255, 0.75)' : 'rgba(20, 20, 20, 0.75)';
      const coreStroke = isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(20, 20, 20, 0.95)';
      const fillFace = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)';
      const busLine = isDark ? 'rgba(255, 255, 255, 0.22)' : 'rgba(20, 20, 20, 0.20)';
      const busActive = isDark ? 'rgba(255, 255, 255, 0.90)' : 'rgba(20, 20, 20, 0.90)';

      // 1. Horizontal System Bus Connecting Left to Right
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = busLine;

      // Top Bus Line
      ctx.beginPath();
      ctx.moveTo(0, cy - 65);
      ctx.lineTo(width, cy - 65);
      ctx.stroke();

      // Middle Center Bus Line
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(width, cy);
      ctx.stroke();

      // Bottom Bus Line
      ctx.beginPath();
      ctx.moveTo(0, cy + 65);
      ctx.lineTo(width, cy + 65);
      ctx.stroke();

      // Diagonal Circuit Connectors from Cube to Left & Right Borders
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(0, cy - 35);
      ctx.lineTo(cx - 35, cy - 15);
      ctx.lineTo(cx + 35, cy - 15);
      ctx.lineTo(width, cy - 35);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, cy + 35);
      ctx.lineTo(cx - 35, cy + 15);
      ctx.lineTo(cx + 35, cy + 15);
      ctx.lineTo(width, cy + 35);
      ctx.stroke();

      ctx.setLineDash([]); // Reset dash

      // 2. Animated Pulse Packets Flowing Left ↔ Right
      const pulseLeftToRight = (time * 70) % width;
      const pulseRightToLeft = width - ((time * 60) % width);

      // Pulse on middle bus
      ctx.beginPath();
      ctx.arc(pulseLeftToRight, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = busActive;
      ctx.fill();

      // Pulse on top bus
      ctx.beginPath();
      ctx.arc(pulseRightToLeft, cy - 65, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = busActive;
      ctx.fill();

      // Pulse on bottom bus
      ctx.beginPath();
      ctx.arc(pulseLeftToRight, cy + 65, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = busActive;
      ctx.fill();

      // 3. Central 3D Cube Rotation
      const rotY = time * 0.45;
      const rotX = 0.5 + Math.sin(time * 0.5) * 0.1;
      const floatY = Math.sin(time * 0.9) * 4;

      const projOuter = outerVertices.map(([vx, vy, vz]) =>
        project(vx, vy + floatY, vz, rotX, rotY, cx, cy)
      );

      const projInner = innerVertices.map(([vx, vy, vz]) =>
        project(vx, vy + floatY, vz, -rotX * 1.1, -rotY * 1.3, cx, cy)
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
        ctx.fillStyle = fillFace;
        ctx.fill();
      });

      // Outer Edges
      const edges = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7],
      ];

      ctx.lineWidth = 1.3;
      ctx.strokeStyle = mainStroke;
      edges.forEach(([i, j]) => {
        ctx.beginPath();
        ctx.moveTo(projOuter[i].px, projOuter[i].py);
        ctx.lineTo(projOuter[j].px, projOuter[j].py);
        ctx.stroke();
      });

      // Inner Core Edges
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = coreStroke;
      edges.forEach(([i, j]) => {
        ctx.beginPath();
        ctx.moveTo(projInner[i].px, projInner[i].py);
        ctx.lineTo(projInner[j].px, projInner[j].py);
        ctx.stroke();
      });

      // Outer Vertices Glow Nodes
      projOuter.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.px, p.py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = coreStroke;
        ctx.fill();
      });

      // Left & Right Bus Connection Nodes
      [0, width].forEach((edgeX) => {
        [cy - 65, cy, cy + 65].forEach((nodeY) => {
          ctx.beginPath();
          ctx.arc(edgeX, nodeY, 2, 0, Math.PI * 2);
          ctx.fillStyle = coreStroke;
          ctx.fill();
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
      className={`relative w-full h-full min-h-[220px] lg:min-h-[300px] flex flex-col items-center justify-center pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full max-w-[280px] max-h-[340px] object-contain"
      />
    </div>
  );
}

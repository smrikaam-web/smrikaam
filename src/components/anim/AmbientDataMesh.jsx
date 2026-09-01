import React, { useEffect, useRef } from 'react';

/**
 * AmbientDataMesh Component:
 * Renders a lightweight, high-performance ambient engineering background with:
 * - Subtle architectural coordinate lines & grid
 * - Slow-moving abstract data nodes (25-35 nodes) with connecting bus lines
 * - Subtle parallax response to cursor position
 * - Strict monochrome palette (white/grey/dark-grey)
 * - Zero React re-renders via requestAnimationFrame canvas loop
 * - Automatic pause/fallback for prefers-reduced-motion
 */
export default function AmbientDataMesh({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let animationFrameId;
    let width = (canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    // Mouse tracking for subtle parallax
    let targetMouseX = 0.5;
    let targetMouseY = 0.5;
    let currentMouseX = 0.5;
    let currentMouseY = 0.5;

    const handleMouseMove = (e) => {
      targetMouseX = e.clientX / window.innerWidth;
      targetMouseY = e.clientY / window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Initialize 28 data nodes
    const nodeCount = 28;
    const nodes = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.5 + 1.0,
        baseAlpha: Math.random() * 0.12 + 0.08,
        pulseSpeed: Math.random() * 0.02 + 0.008,
        pulseOffset: Math.random() * Math.PI * 2
      });
    }

    // Static geometrical blueprint rectangles
    const shapes = [
      { x: 0.15, y: 0.25, w: 180, h: 90, rotation: 0.02, speed: 0.0003 },
      { x: 0.75, y: 0.18, w: 140, h: 140, rotation: -0.015, speed: -0.0002 },
      { x: 0.82, y: 0.70, w: 220, h: 110, rotation: 0.01, speed: 0.00025 }
    ];

    let time = 0;

    const render = () => {
      time += 1;

      // Smooth mouse interpolation for parallax
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;
      const offsetX = (currentMouseX - 0.5) * 24;
      const offsetY = (currentMouseY - 0.5) * 24;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw subtle architectural coordinate grid
      const gridSize = 120;
      const startX = (offsetX * 0.3) % gridSize;
      const startY = (offsetY * 0.3) % gridSize;

      ctx.strokeStyle = 'rgba(180, 180, 180, 0.035)';
      ctx.lineWidth = 1;

      for (let x = startX; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = startY; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Small crosshairs at grid intersections
      ctx.fillStyle = 'rgba(200, 200, 200, 0.08)';
      for (let x = startX; x < width; x += gridSize * 2) {
        for (let y = startY; y < height; y += gridSize * 2) {
          ctx.fillRect(x - 3, y - 0.5, 6, 1);
          ctx.fillRect(x - 0.5, y - 3, 1, 6);
        }
      }

      // 2. Draw drifting geometric outlines
      shapes.forEach((shape) => {
        const cx = shape.x * width + offsetX * 0.5;
        const cy = shape.y * height + offsetY * 0.5;
        const rot = shape.rotation + time * shape.speed;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);
        ctx.strokeStyle = 'rgba(180, 180, 180, 0.04)';
        ctx.lineWidth = 1;
        ctx.strokeRect(-shape.w / 2, -shape.h / 2, shape.w, shape.h);
        
        // Small corner ticks
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.09)';
        const tick = 6;
        ctx.strokeRect(-shape.w / 2, -shape.h / 2, tick, tick);
        ctx.strokeRect(shape.w / 2 - tick, shape.h / 2 - tick, tick, tick);
        ctx.restore();
      });

      // 3. Update & Draw Data Nodes and Connecting Bus Lines
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        if (!prefersReducedMotion) {
          node.x += node.vx;
          node.y += node.vy;

          // Wrap edges smoothly
          if (node.x < 0) node.x = width;
          if (node.x > width) node.x = 0;
          if (node.y < 0) node.y = height;
          if (node.y > height) node.y = 0;
        }

        const currentX = node.x + offsetX * 0.8;
        const currentY = node.y + offsetY * 0.8;
        const alpha = node.baseAlpha + Math.sin(time * node.pulseSpeed + node.pulseOffset) * 0.04;

        // Draw node
        ctx.beginPath();
        ctx.arc(currentX, currentY, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 200, 200, ${Math.max(0.04, alpha)})`;
        ctx.fill();

        // Connect nearby nodes with subtle thin lines (bus paths)
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const otherX = other.x + offsetX * 0.8;
          const otherY = other.y + offsetY * 0.8;
          const dx = currentX - otherX;
          const dy = currentY - otherY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 160) {
            const lineAlpha = (1 - dist / 160) * 0.07;
            ctx.beginPath();
            ctx.moveTo(currentX, currentY);
            ctx.lineTo(otherX, otherY);
            ctx.strokeStyle = `rgba(180, 180, 180, ${lineAlpha})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none select-none z-0 ${className}`}
      aria-hidden="true"
    />
  );
}

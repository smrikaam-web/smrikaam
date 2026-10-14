import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain,
  BarChart2,
  TrendingUp,
  Cloud,
  Cpu,
  Wifi,
  Code2,
  Lock,
  ShieldCheck,
  Database,
  Target,
  Mountain,
  Eye,
  ArrowUpRight,
  ArrowDown,
} from 'lucide-react';

/**
 * Smrikaam3DCoreSection
 *
 * High-precision architectural engineering intelligence core visual system.
 * Single unified JSX structure with responsive Tailwind modifiers:
 * - Desktop (>= 1024px): 100% Original Spatial composition (Left/Center/Right 3-column + SVG Trace network).
 * - Mobile/Tablet (< 1024px): Content-driven vertical flow (Who We Are -> Capabilities -> 3D Visual -> What We Build -> Purpose Cards).
 */
export default function Smrikaam3DCoreSection() {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isDark, setIsDark] = useState(() =>
    typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : true
  );

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const mobileCanvasRef = useRef(null);

  // Theme observer: updates state instantly when html.dark is toggled in NavBar/ControlBar
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  // Left: 6 Engineering Capabilities (Pills with circuit paths)
  const capabilities = [
    { id: 'cap-0', title: 'AI / ML', mobileTitle: 'AI / ML', icon: Brain },
    { id: 'cap-1', title: 'Data & Analytics', mobileTitle: 'DATA & ANALYTICS', icon: BarChart2 },
    { id: 'cap-2', title: 'Cloud & DevOps', mobileTitle: 'CLOUD & DEVOPS', icon: Cloud },
    { id: 'cap-3', title: 'IIoT & Connected Systems', mobileTitle: 'IIoT', icon: Cpu },
    { id: 'cap-4', title: 'Software Engineering', mobileTitle: 'SOFTWARE', icon: Code2 },
    { id: 'cap-5', title: 'Data & App Security', mobileTitle: 'SECURITY', icon: Lock },
  ];

  // Right: 6 What We Build (Circular framed nodes)
  const buildItems = [
    {
      id: 'build-0',
      title: 'DATA ANALYTICS & BI',
      mobileTitle: 'DATA ANALYTICS',
      desc: 'Transform raw data into meaningful insights with advanced analytics and visual intelligence.',
      icon: TrendingUp,
    },
    {
      id: 'build-1',
      title: 'DATA ENGINEERING',
      mobileTitle: 'DATA ENGINEERING',
      desc: 'Build robust data platforms, pipelines and architecture for reliable and scalable data flows.',
      icon: Database,
    },
    {
      id: 'build-2',
      title: 'DEVOPS & CLOUD ENGINEERING',
      mobileTitle: 'DEVOPS',
      desc: 'Modernize infrastructure, automate deployments and build cloud-native systems that scale seamlessly.',
      icon: Cloud,
    },
    {
      id: 'build-3',
      title: 'INDUSTRIAL IOT',
      mobileTitle: 'INDUSTRIAL IoT',
      desc: 'Connect machines, collect real-time data and unlock operational intelligence at the edge.',
      icon: Wifi,
    },
    {
      id: 'build-4',
      title: 'GENERATIVE & AGENTIC AI',
      mobileTitle: 'GENERATIVE AI',
      desc: 'Build GenAI applications and intelligent agents that automate, augment and accelerate decisions.',
      icon: Brain,
    },
    {
      id: 'build-5',
      title: 'DATA GOVERNANCE & COMPLIANCE',
      mobileTitle: 'DATA GOVERNANCE',
      desc: 'Ensure data quality, security, privacy and compliance across your enterprise ecosystem.',
      icon: ShieldCheck,
    },
  ];

  // Bottom: 3 Core Strategic Purpose Nodes
  const pillars = [
    {
      id: 'goal',
      title: 'OUR GOAL',
      desc: 'Create innovative solutions that drive business growth and operational excellence.',
      icon: Target,
    },
    {
      id: 'mission',
      title: 'OUR MISSION',
      desc: 'Deliver secure, scalable and intelligent solutions through engineering excellence and continuous innovation.',
      icon: Mountain,
    },
    {
      id: 'vision',
      title: 'OUR VISION',
      desc: 'To be a global leader in engineering intelligence and enterprise transformation.',
      icon: Eye,
    },
  ];

  const mousePosRef = useRef({ x: 0, y: 0 });
  const cubeSpinBoostRef = useRef(0);

  // Handle Mouse Parallax
  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mousePosRef.current = { x, y };
  };

  const handleCubeClick = () => {
    cubeSpinBoostRef.current = 1.0;
  };

  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth < 1024 : false));

  // Shared 3D Hypercube render function (used by both desktop and mobile loops)
  const renderHypercube = (ctx, width, height, mX, mY, time, spinBoost = 0) => {
    ctx.clearRect(0, 0, width, height);
    const cx = width / 2;
    const cy = height / 2;
    const dark = document.documentElement.classList.contains('dark');

    const strokeMain = dark ? 'rgba(255, 255, 255, 0.75)' : 'rgba(20, 20, 20, 0.75)';
    const strokeCore = dark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.95)';
    const strokeFaint = dark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(20, 20, 20, 0.14)';
    const strokeStrut = dark ? 'rgba(255, 255, 255, 0.28)' : 'rgba(20, 20, 20, 0.22)';
    const faceOuter = dark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)';
    const faceInner = dark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)';
    const glowAura = dark
      ? `rgba(255, 255, 255, ${0.06 + spinBoost * 0.08})`
      : `rgba(0, 0, 0, ${0.04 + spinBoost * 0.06})`;
    const nodeColor = dark ? '#ffffff' : '#000000';

    const scaleFactor = Math.min(width, height) / 380;
    const sOuter = 72 * scaleFactor;
    const sInner = 36 * scaleFactor;
    const makeBox = (s) => [[-s,-s,-s],[s,-s,-s],[s,s,-s],[-s,s,-s],[-s,-s,s],[s,-s,s],[s,s,s],[-s,s,s]];
    const outerV = makeBox(sOuter);
    const innerV = makeBox(sInner);

    const project = (x, y, z, rotX, rotY, pcx, pcy) => {
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const x1 = x * cosY + z * sinY, z1 = -x * sinY + z * cosY;
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      const y2 = y * cosX - z1 * sinX, z2 = y * sinX + z1 * cosX;
      const sc = 440 / (350 + z2);
      return { px: pcx + x1 * sc, py: pcy + y2 * sc, depth: z2 };
    };

    // Axes & rings
    ctx.save(); ctx.translate(cx, cy);
    ctx.beginPath();
    ctx.moveTo(-160 * scaleFactor, 0); ctx.lineTo(160 * scaleFactor, 0);
    ctx.moveTo(0, -160 * scaleFactor); ctx.lineTo(0, 160 * scaleFactor);
    ctx.strokeStyle = strokeFaint; ctx.lineWidth = 1; ctx.setLineDash([2, 4]); ctx.stroke(); ctx.setLineDash([]);
    [100, 140, 175].forEach((r) => {
      ctx.beginPath(); ctx.arc(0, 0, r * scaleFactor, 0, Math.PI * 2);
      ctx.strokeStyle = strokeFaint; ctx.lineWidth = 1; ctx.setLineDash([1, 6]); ctx.stroke(); ctx.setLineDash([]);
    });
    ctx.restore();

    // Aura
    const glowRad = (130 + Math.sin(time * 2) * 12 + spinBoost * 20) * scaleFactor;
    const grad = ctx.createRadialGradient(cx, cy, 10 * scaleFactor, cx, cy, glowRad);
    grad.addColorStop(0, glowAura); grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(cx, cy, glowRad, 0, Math.PI * 2); ctx.fill();

    const rotY = time * 0.4 + mX * 0.4;
    const rotX = time * 0.25 + mY * 0.4;
    const floatY = Math.sin(time * 1.5) * (6 * scaleFactor);
    const pO = outerV.map(([x, y, z]) => project(x, y, z, rotX, rotY, cx, cy + floatY));
    const pI = innerV.map(([x, y, z]) => project(x, y, z, rotX, rotY, cx, cy + floatY));
    const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
    const faces = [[0,1,2,3],[4,5,6,7],[0,1,5,4],[2,3,7,6],[0,3,7,4],[1,2,6,5]];

    faces.forEach((f) => { ctx.beginPath(); ctx.moveTo(pO[f[0]].px, pO[f[0]].py); for (let i=1;i<4;i++) ctx.lineTo(pO[f[i]].px, pO[f[i]].py); ctx.closePath(); ctx.fillStyle = faceOuter; ctx.fill(); });
    edges.forEach(([i,j]) => { ctx.beginPath(); ctx.moveTo(pO[i].px, pO[i].py); ctx.lineTo(pO[j].px, pO[j].py); ctx.strokeStyle = strokeMain; ctx.lineWidth = Math.max(1.0, 1.4 * scaleFactor); ctx.stroke(); });
    for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.moveTo(pO[i].px, pO[i].py); ctx.lineTo(pI[i].px, pI[i].py); ctx.strokeStyle = strokeStrut; ctx.lineWidth = Math.max(0.8, 1.1 * scaleFactor); ctx.setLineDash([2, 2]); ctx.stroke(); ctx.setLineDash([]); }
    faces.forEach((f) => { ctx.beginPath(); ctx.moveTo(pI[f[0]].px, pI[f[0]].py); for (let i=1;i<4;i++) ctx.lineTo(pI[f[i]].px, pI[f[i]].py); ctx.closePath(); ctx.fillStyle = faceInner; ctx.fill(); });
    edges.forEach(([i,j]) => { ctx.beginPath(); ctx.moveTo(pI[i].px, pI[i].py); ctx.lineTo(pI[j].px, pI[j].py); ctx.strokeStyle = strokeCore; ctx.lineWidth = Math.max(1.4, 2.2 * scaleFactor); ctx.stroke(); });
    pO.forEach((pt) => { ctx.beginPath(); ctx.arc(pt.px, pt.py, Math.max(1.8, 2.5 * scaleFactor), 0, Math.PI * 2); ctx.fillStyle = nodeColor; ctx.fill(); });
    pI.forEach((pt) => { ctx.beginPath(); ctx.arc(pt.px, pt.py, Math.max(2.0, 3 * scaleFactor), 0, Math.PI * 2); ctx.fillStyle = nodeColor; ctx.fill(); });
    ctx.beginPath(); ctx.arc(cx, cy + floatY, Math.max(2.5, 4 * scaleFactor), 0, Math.PI * 2); ctx.fillStyle = nodeColor; ctx.fill();
  };

  // DESKTOP 3D Canvas Animation Loop (only runs when NOT mobile)
  useEffect(() => {
    if (isMobile) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrameId;
    let time = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 380, h = 380;

    const setup = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      w = rect.width > 0 ? rect.width : (canvas.offsetWidth || 380);
      h = rect.height > 0 ? rect.height : (canvas.offsetHeight || 380);
      const targetW = Math.round(w * dpr);
      const targetH = Math.round(h * dpr);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };
    setup();
    window.addEventListener('resize', setup);
    const ro = new ResizeObserver(setup);
    ro.observe(canvas);

    const loop = () => {
      if (cubeSpinBoostRef.current > 0.001) {
        cubeSpinBoostRef.current *= 0.94;
      } else {
        cubeSpinBoostRef.current = 0;
      }
      time += 0.009 + cubeSpinBoostRef.current * 0.02;

      renderHypercube(
        ctx,
        w,
        h,
        mousePosRef.current.x,
        mousePosRef.current.y,
        time,
        cubeSpinBoostRef.current
      );
      animationFrameId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', setup);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMobile]);

  // MOBILE 3D Canvas Animation Loop (only runs when IS mobile — separate ref, no mousePos dependency)
  useEffect(() => {
    if (!isMobile) return;
    const canvas = mobileCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrameId;
    let time = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 140, h = 140;

    const setup = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      w = rect.width > 0 ? rect.width : (canvas.offsetWidth || 140);
      h = rect.height > 0 ? rect.height : (canvas.offsetHeight || 140);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    // Delay setup slightly to ensure DOM has laid out
    const initTimer = setTimeout(() => {
      setup();
      const loop = () => {
        time += 0.009;
        renderHypercube(ctx, w, h, 0, 0, time);
        animationFrameId = requestAnimationFrame(loop);
      };
      loop();
    }, 100);
    window.addEventListener('resize', setup);
    const ro = new ResizeObserver(setup);
    ro.observe(canvas);

    return () => {
      clearTimeout(initTimer);
      ro.disconnect();
      window.removeEventListener('resize', setup);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isMobile, isDark]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Desktop scaling ref and state (Active ONLY for desktop)
  const viewportRef = useRef(null);
  const [canvasScale, setCanvasScale] = useState(1);

  useEffect(() => {
    if (isMobile || !viewportRef.current) return;
    const updateScale = () => {
      if (!viewportRef.current) return;
      const width = viewportRef.current.clientWidth;
      const s = Math.min(1, width / 1440);
      setCanvasScale(s > 0 ? s : 1);
    };

    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(viewportRef.current);
    window.addEventListener('resize', updateScale);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, [isMobile]);

  // Mobile layout refs and measured coordinates
  const mobileFrameRef = useRef(null);
  const leftAnchorRefs = useRef([]);
  const rightAnchorRefs = useRef([]);
  const centerVisualRef = useRef(null);
  const hubRef = useRef(null);
  const cardAnchorRefs = useRef([]);
  const impactAnchorRefs = useRef([]);
  const [mobileAnchors, setMobileAnchors] = useState(null);

  useEffect(() => {
    if (!isMobile) return;

    const measureMobile = () => {
      if (!mobileFrameRef.current) return;
      const frameRect = mobileFrameRef.current.getBoundingClientRect();
      if (frameRect.width <= 0) return;

      const leftPoints = leftAnchorRefs.current.map((el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          x: r.right - frameRect.left,
          y: r.top + r.height / 2 - frameRect.top,
        };
      });

      const rightPoints = rightAnchorRefs.current.map((el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          x: r.left - frameRect.left,
          y: r.top + r.height / 2 - frameRect.top,
        };
      });

      let center = null;
      if (centerVisualRef.current) {
        const cr = centerVisualRef.current.getBoundingClientRect();
        center = {
          left: cr.left - frameRect.left + 4,
          right: cr.right - frameRect.left - 4,
          top: cr.top - frameRect.top,
          bottom: cr.bottom - frameRect.top,
          width: cr.width - 8,
          height: cr.height,
          centerX: cr.left + cr.width / 2 - frameRect.left,
          centerY: cr.top + cr.height / 2 - frameRect.top,
        };
      }

      let hub = null;
      if (hubRef.current) {
        const hr = hubRef.current.getBoundingClientRect();
        hub = {
          centerX: hr.left + hr.width / 2 - frameRect.left,
          top: hr.top - frameRect.top,
          bottom: hr.bottom - frameRect.top,
        };
      }

      const cards = cardAnchorRefs.current.map((el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          centerX: r.left + r.width / 2 - frameRect.left,
          top: r.top - frameRect.top,
          bottom: r.bottom - frameRect.top,
          leftEdge: r.left - frameRect.left,
          rightEdge: r.right - frameRect.left,
          centerY: r.top + r.height / 2 - frameRect.top,
        };
      });

      const impactPoints = impactAnchorRefs.current.map((el) => {
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          centerX: r.left + r.width / 2 - frameRect.left,
          top: r.top - frameRect.top,
        };
      });

      setMobileAnchors({
        frameWidth: frameRect.width,
        frameHeight: frameRect.height,
        leftPoints,
        rightPoints,
        center,
        hub,
        cards,
        impactPoints,
      });
    };

    const timer = setTimeout(measureMobile, 60);
    const ro = new ResizeObserver(measureMobile);
    if (mobileFrameRef.current) {
      ro.observe(mobileFrameRef.current);
    }
    window.addEventListener('resize', measureMobile);
    return () => {
      clearTimeout(timer);
      ro.disconnect();
      window.removeEventListener('resize', measureMobile);
    };
  }, [isMobile]);

  // Desktop stroke calculations
  const safeScale = Math.max(0.15, canvasScale);
  const strokeMultiplier = 1 / safeScale;
  const baseStrokeWidth = 1.2 * strokeMultiplier;
  const hoverStrokeWidth = 2.4 * strokeMultiplier;
  const dotRadius = 3.2 * strokeMultiplier;
  const hoverDotRadius = 4.8 * strokeMultiplier;
  const photonRadius = 2.8 * strokeMultiplier;
  const hoverPhotonRadius = 4.0 * strokeMultiplier;
  const dashStrokeWidth = 1.5 * strokeMultiplier;
  const dashArray = `${4 * strokeMultiplier} ${4 * strokeMultiplier}`;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="smrikaam-core relative w-full bg-[var(--color-bg)] text-[var(--color-text)] py-8 md:py-16 px-3 sm:px-6 md:px-10 lg:px-14 overflow-hidden select-none transition-colors duration-300"
      aria-label="SMRIKAAM Engineering Intelligence Core"
    >
      {/* Background Architectural Grid & Radial Atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-radial from-[var(--color-accent)]/8 to-transparent blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.06] dark:opacity-[0.08]"
          style={{
            backgroundImage:
              'linear-gradient(var(--color-border-strong) 1px, transparent 1px), linear-gradient(90deg, var(--color-border-strong) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      {isMobile ? (
        /* ============================================================ */
        /* DELIBERATELY ENGINEERED MOBILE COMPOSITION FRAME (<1024px)   */
        /* Layer order: Background -> SVG -> 3D -> Content -> Controls */
        /* ============================================================ */
        <div
          ref={mobileFrameRef}
          className="mobile-core-frame relative w-full max-w-[640px] mx-auto px-1 sm:px-3 py-3 overflow-hidden select-none"
        >
          {/* LAYER 2: UNIFIED DYNAMIC SVG CONNECTOR NETWORK (z-10) */}
          {mobileAnchors && mobileAnchors.center && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              style={{ shapeRendering: 'geometricPrecision', overflow: 'visible' }}
              aria-hidden="true"
            >
              {/* 1. LEFT capability -> CENTER 3D VISUAL */}
              {capabilities.map((cap, idx) => {
                const startPt = mobileAnchors.leftPoints[idx];
                const center = mobileAnchors.center;
                if (!startPt || !center) return null;
                const targetY = center.top + ((idx + 0.5) / 6) * center.height;
                const targetX = center.left;
                const midX = (startPt.x + targetX) / 2;
                const isHovered = hoveredNode === cap.id;
                const pathD = `M ${startPt.x} ${startPt.y} C ${midX} ${startPt.y}, ${midX} ${targetY}, ${targetX} ${targetY}`;
                return (
                  <g key={`m-cap-${cap.id}`}>
                    <path
                      d={pathD}
                      stroke={isHovered ? 'var(--color-accent)' : 'var(--color-text-muted)'}
                      strokeWidth={isHovered ? 2.2 : 1.3}
                      fill="none"
                      opacity={isHovered ? 1 : 0.85}
                      vectorEffect="non-scaling-stroke"
                    />
                    <circle
                      cx={startPt.x}
                      cy={startPt.y}
                      r={isHovered ? 3.5 : 2.5}
                      fill={isHovered ? 'var(--color-accent)' : 'var(--color-text)'}
                    />
                    <circle
                      cx={targetX}
                      cy={targetY}
                      r={isHovered ? 3.0 : 2.0}
                      fill={isHovered ? 'var(--color-accent)' : 'var(--color-text-muted)'}
                    />
                    <circle r={2} fill="var(--color-accent)">
                      <animateMotion path={pathD} dur={`${2.0 + idx * 0.25}s`} repeatCount="indefinite" />
                    </circle>
                  </g>
                );
              })}

              {/* 2. CENTER 3D VISUAL -> RIGHT build items */}
              {buildItems.map((item, idx) => {
                const endPt = mobileAnchors.rightPoints[idx];
                const center = mobileAnchors.center;
                if (!endPt || !center) return null;
                const startY = center.top + ((idx + 0.5) / 6) * center.height;
                const startX = center.right;
                const midX = (startX + endPt.x) / 2;
                const isHovered = hoveredNode === item.id;
                const pathD = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endPt.y}, ${endPt.x} ${endPt.y}`;
                return (
                  <g key={`m-build-${item.id}`}>
                    <path
                      d={pathD}
                      stroke={isHovered ? 'var(--color-accent)' : 'var(--color-text-muted)'}
                      strokeWidth={isHovered ? 2.2 : 1.3}
                      fill="none"
                      opacity={isHovered ? 1 : 0.85}
                      vectorEffect="non-scaling-stroke"
                    />
                    <circle
                      cx={startX}
                      cy={startY}
                      r={isHovered ? 3.0 : 2.0}
                      fill={isHovered ? 'var(--color-accent)' : 'var(--color-text-muted)'}
                    />
                    <circle
                      cx={endPt.x}
                      cy={endPt.y}
                      r={isHovered ? 3.5 : 2.5}
                      fill={isHovered ? 'var(--color-accent)' : 'var(--color-text)'}
                    />
                    <circle r={2} fill="var(--color-accent)">
                      <animateMotion path={pathD} dur={`${2.0 + idx * 0.25}s`} repeatCount="indefinite" />
                    </circle>
                  </g>
                );
              })}

              {/* 3. CENTER 3D VISUAL -> CONNECTION HUB */}
              {mobileAnchors.hub && (
                <g key="m-center-to-hub">
                  <line
                    x1={mobileAnchors.center.centerX}
                    y1={mobileAnchors.center.bottom}
                    x2={mobileAnchors.hub.centerX}
                    y2={mobileAnchors.hub.top}
                    stroke="var(--color-text-muted)"
                    strokeWidth="1.3"
                    opacity="0.85"
                    vectorEffect="non-scaling-stroke"
                  />
                  <circle cx={mobileAnchors.center.centerX} cy={mobileAnchors.center.bottom} r={2.5} fill="var(--color-text)" />
                  <circle cx={mobileAnchors.hub.centerX} cy={mobileAnchors.hub.top} r={2.5} fill="var(--color-text)" />
                  <circle r={2} fill="var(--color-accent)">
                    <animateMotion
                      path={`M ${mobileAnchors.center.centerX} ${mobileAnchors.center.bottom} L ${mobileAnchors.hub.centerX} ${mobileAnchors.hub.top}`}
                      dur="2.2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              )}

              {/* 4. CONNECTION HUB -> THREE BOTTOM CARDS (Central Trunk & 3 Branches) */}
              {mobileAnchors.hub && mobileAnchors.cards && mobileAnchors.cards[0] && mobileAnchors.cards[2] && (
                (() => {
                  const railY = mobileAnchors.cards[0].top - 16;
                  const hubBottom = mobileAnchors.hub.bottom;
                  const hubX = mobileAnchors.hub.centerX;
                  return (
                    <g key="m-hub-to-cards">
                      {/* Central Trunk from Hub to Rail */}
                      <line
                        x1={hubX}
                        y1={hubBottom}
                        x2={hubX}
                        y2={railY}
                        stroke="var(--color-text-muted)"
                        strokeWidth="1.3"
                        opacity="0.85"
                        vectorEffect="non-scaling-stroke"
                      />
                      <circle cx={hubX} cy={hubBottom} r={2.5} fill="var(--color-text)" />

                      {/* Horizontal Distribution Rail */}
                      <line
                        x1={mobileAnchors.cards[0].centerX}
                        y1={railY}
                        x2={mobileAnchors.cards[2].centerX}
                        y2={railY}
                        stroke="var(--color-text-muted)"
                        strokeWidth="1.3"
                        opacity="0.85"
                        vectorEffect="non-scaling-stroke"
                      />
                      <circle cx={hubX} cy={railY} r={2.5} fill="var(--color-text)" />

                      {/* 3 Branches dropping into each card top-center */}
                      {mobileAnchors.cards.map((card, idx) => {
                        if (!card) return null;
                        const dropPath = `M ${hubX} ${hubBottom} L ${hubX} ${railY} L ${card.centerX} ${railY} L ${card.centerX} ${card.top}`;
                        return (
                          <g key={`m-card-drop-${idx}`}>
                            <line
                              x1={card.centerX}
                              y1={railY}
                              x2={card.centerX}
                              y2={card.top}
                              stroke="var(--color-text-muted)"
                              strokeWidth="1.3"
                              opacity="0.85"
                              vectorEffect="non-scaling-stroke"
                            />
                            <circle cx={card.centerX} cy={railY} r={2} fill="var(--color-text)" />
                            <circle cx={card.centerX} cy={card.top} r={2.5} fill="var(--color-text)" />
                            <circle r={2} fill="var(--color-accent)">
                              <animateMotion path={dropPath} dur={`${2.2 + idx * 0.3}s`} repeatCount="indefinite" />
                            </circle>
                          </g>
                        );
                      })}

                      {/* Horizontal Dashed Bridges between cards */}
                      {mobileAnchors.cards[0] && mobileAnchors.cards[1] && (
                        <line
                          x1={mobileAnchors.cards[0].rightEdge}
                          y1={mobileAnchors.cards[0].centerY}
                          x2={mobileAnchors.cards[1].leftEdge}
                          y2={mobileAnchors.cards[1].centerY}
                          stroke="var(--color-text-muted)"
                          strokeWidth="1.2"
                          strokeDasharray="3 3"
                          opacity="0.65"
                          vectorEffect="non-scaling-stroke"
                        />
                      )}
                      {mobileAnchors.cards[1] && mobileAnchors.cards[2] && (
                        <line
                          x1={mobileAnchors.cards[1].rightEdge}
                          y1={mobileAnchors.cards[1].centerY}
                          x2={mobileAnchors.cards[2].leftEdge}
                          y2={mobileAnchors.cards[2].centerY}
                          stroke="var(--color-text-muted)"
                          strokeWidth="1.2"
                          strokeDasharray="3 3"
                          opacity="0.65"
                          vectorEffect="non-scaling-stroke"
                        />
                      )}
                    </g>
                  );
                })()
              )}

              {/* 5. THREE CARDS (GOAL, MISSION, VISION) -> BUSINESS IMPACT BAR */}
              {mobileAnchors.cards && mobileAnchors.impactPoints && (
                mobileAnchors.cards.map((card, idx) => {
                  const impact = mobileAnchors.impactPoints[idx];
                  if (!card || !impact) return null;
                  const midY = (card.bottom + impact.top) / 2;
                  const impactPath = `M ${card.centerX} ${card.bottom} C ${card.centerX} ${midY}, ${impact.centerX} ${midY}, ${impact.centerX} ${impact.top}`;
                  return (
                    <g key={`m-card-to-impact-${idx}`}>
                      <path
                        d={impactPath}
                        stroke="var(--color-text-muted)"
                        strokeWidth="1.3"
                        fill="none"
                        opacity="0.85"
                        vectorEffect="non-scaling-stroke"
                      />
                      <circle cx={card.centerX} cy={card.bottom} r={2.5} fill="var(--color-text)" />
                      <circle cx={impact.centerX} cy={impact.top} r={2.5} fill="var(--color-accent)" />
                      <circle r={2} fill="var(--color-accent)">
                        <animateMotion path={impactPath} dur={`${2.0 + idx * 0.3}s`} repeatCount="indefinite" />
                      </circle>
                    </g>
                  );
                })
              )}
            </svg>
          )}

          {/* LAYER 3: UPPER NARRATIVE HEADERS (z-20) */}
          <div className="grid grid-cols-2 gap-3 mb-4 items-start w-full relative z-20">
            <div className="space-y-1">
              <div className="text-[10px] sm:text-xs text-[var(--color-text-muted)] font-mono uppercase tracking-[0.2em] font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[var(--color-accent)] inline-block" />
                <span>WHO WE ARE</span>
              </div>
              <h2 className="font-heading text-xs sm:text-sm font-bold uppercase text-[var(--color-text)] tracking-tight leading-tight">
                Engineering Intelligence Across AI, Data, Cloud &amp; IIoT.
              </h2>
            </div>

            <div className="space-y-1 text-right">
              <div className="text-[10px] sm:text-xs text-[var(--color-text-muted)] font-mono uppercase tracking-[0.2em] font-semibold flex items-center justify-end gap-1.5">
                <span>WHAT WE BUILD</span>
                <span className="w-1.5 h-1.5 bg-[var(--color-accent)] inline-block" />
              </div>
              <h2 className="font-heading text-xs sm:text-sm font-bold uppercase text-[var(--color-text)] tracking-tight leading-tight">
                Technology. Engineered End to End.
              </h2>
            </div>
          </div>

          {/* LAYER 3: MAIN 3-COLUMN COMPOSITION (z-20) */}
          <div className="grid grid-cols-[30%_40%_30%] gap-2 sm:gap-3 items-center w-full relative z-20 my-2">
            {/* LEFT COLUMN: 6 Capability Rows */}
            <div className="space-y-1.5">
              {capabilities.map((cap, idx) => {
                const Icon = cap.icon;
                const isHovered = hoveredNode === cap.id;
                return (
                  <div
                    key={cap.id}
                    ref={(el) => (leftAnchorRefs.current[idx] = el)}
                    data-anchor={`left-${idx + 1}`}
                    onMouseEnter={() => setHoveredNode(cap.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    className={`p-1.5 rounded border transition-all duration-200 cursor-pointer flex items-center justify-between shadow-xs ${
                      isHovered
                        ? 'border-[var(--color-accent)] bg-[var(--color-surface)] shadow-md'
                        : 'border-[var(--color-border-strong)]/80 bg-[var(--color-surface)]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <div className="w-4 h-4 rounded-full border border-[var(--color-border)] flex items-center justify-center text-[var(--color-accent)] bg-[var(--color-bg)] shrink-0">
                        <Icon className="w-2.5 h-2.5" strokeWidth={1.8} />
                      </div>
                      <span className="font-heading text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--color-text)] leading-none truncate">
                        {cap.mobileTitle || cap.title}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CENTER COLUMN: 3D Engineering Core (Canvas Wireframe) */}
            <div className="flex items-center justify-center">
              <div
                ref={centerVisualRef}
                data-anchor="core"
                className="w-[140px] h-[140px] sm:w-[170px] sm:h-[170px] relative flex items-center justify-center overflow-hidden mx-auto rounded-xl border border-[var(--color-border-strong)]/60 bg-[var(--color-surface)]/40 backdrop-blur-xs shadow-md"
              >
                <canvas
                  ref={mobileCanvasRef}
                  className="w-full h-full object-contain pointer-events-auto block"
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
            </div>

            {/* RIGHT COLUMN: 6 Build Items */}
            <div className="space-y-1.5">
              {buildItems.map((item, idx) => {
                const Icon = item.icon;
                const isHovered = hoveredNode === item.id;
                return (
                  <div
                    key={item.id}
                    ref={(el) => (rightAnchorRefs.current[idx] = el)}
                    data-anchor={`right-${idx + 1}`}
                    onMouseEnter={() => setHoveredNode(item.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    className={`p-1.5 rounded border transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-xs ${
                      isHovered
                        ? 'border-[var(--color-accent)] bg-[var(--color-surface)] shadow-md'
                        : 'border-[var(--color-border-strong)]/80 bg-[var(--color-surface)]'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full border border-[var(--color-border-strong)] flex items-center justify-center shrink-0 bg-[var(--color-surface-subtle)] text-[var(--color-text)]">
                      <Icon className="w-2.5 h-2.5" strokeWidth={1.8} />
                    </div>
                    <span className="font-heading text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[var(--color-text)] leading-none flex-1 min-w-0 truncate">
                      {item.mobileTitle || item.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* LAYER 5: CONTROLS — CONNECTION HUB (z-30) */}
          <div ref={hubRef} data-anchor="hub" className="flex justify-center my-4 relative z-30">
            <Link
              to="/services"
              className="inline-flex items-center justify-between px-4 py-2 border border-[var(--button-secondary-border)] bg-[var(--button-secondary-bg)] text-[var(--button-secondary-text)] hover:border-[var(--color-accent)] text-[10px] font-semibold uppercase tracking-wider rounded transition-all duration-200 shadow-xs"
            >
              <span>EXPLORE SERVICES</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-1.5" />
            </Link>
          </div>

          {/* THREE HORIZONTAL CARDS (z-20) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full relative z-20 my-2 pt-2">
            {pillars.map((pillar, idx) => {
              const PillarIcon = pillar.icon;
              const isHovered = hoveredNode === pillar.id;
              return (
                <div
                  key={pillar.id}
                  ref={(el) => (cardAnchorRefs.current[idx] = el)}
                  data-anchor={pillar.id}
                  onMouseEnter={() => setHoveredNode(pillar.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className={`p-2.5 rounded-lg border transition-all duration-200 flex flex-col items-center text-center cursor-pointer shadow-xs ${
                    isHovered
                      ? 'border-[var(--color-accent)] bg-[var(--color-surface)] shadow-md'
                      : 'border-[var(--color-border-strong)]/80 bg-[var(--color-surface)]'
                  }`}
                >
                  <div className="w-6 h-6 rounded-full border border-[var(--color-border-strong)] flex items-center justify-center mb-1.5 bg-[var(--color-surface-subtle)] text-[var(--color-accent)] shrink-0">
                    <PillarIcon className="w-3.5 h-3.5" strokeWidth={1.8} />
                  </div>
                  <h4 className="font-heading text-xs sm:text-sm font-bold uppercase tracking-wider text-[var(--color-text)] mb-1">
                    {pillar.title}
                  </h4>
                  <p className="text-[10px] sm:text-xs text-[var(--color-text-secondary)] leading-[1.35] line-clamp-3 font-normal">
                    {pillar.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* BUSINESS IMPACT BAR (z-20) */}
          <div className="flex justify-center w-full overflow-hidden relative z-20 mt-4 mb-2">
            <div
              data-anchor="impact"
              className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-1.5 sm:gap-2 px-3.5 py-1.5 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface)] shadow-xs text-[9.5px] sm:text-[10.5px] tracking-wider uppercase text-[var(--color-text)] font-semibold w-full max-w-[500px]"
            >
              <span ref={(el) => (impactAnchorRefs.current[0] = el)} className="text-center truncate">
                INTELLIGENT SYSTEMS
              </span>
              <span className="text-[var(--color-text-muted)] shrink-0">→</span>
              <span ref={(el) => (impactAnchorRefs.current[1] = el)} className="text-center truncate">
                OPERATIONAL EXCELLENCE
              </span>
              <span className="text-[var(--color-text-muted)] shrink-0">→</span>
              <span ref={(el) => (impactAnchorRefs.current[2] = el)} className="text-center truncate">
                BUSINESS IMPACT
              </span>
            </div>
          </div>

        </div>
      ) : (
        /* ============================================================ */
        /* MASTER RESPONSIVE CANVAS VIEWPORT (1440px × 1040px)          */
        /* 100% UNTOUCHED ORIGINAL DESKTOP MASTER DESIGN                */
        /* ============================================================ */
        <div
          ref={viewportRef}
          className="core-viewport relative w-full max-w-[1440px] mx-auto overflow-hidden"
          style={{ height: `${1040 * canvasScale}px` }}
        >
          <div
            className="core-scale-wrapper absolute left-1/2 top-0"
            style={{
              width: '1440px',
              height: '1040px',
              transformOrigin: 'top center',
              transform: `translateX(-50%) scale(${canvasScale})`,
            }}
          >
            <div
              className="core-canvas relative w-[1440px] h-[1040px] overflow-hidden"
              style={{
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                textRendering: 'optimizeLegibility',
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
              }}
            >
              {/* SVG CONNECTION NETWORK — MATHEMATICALLY LOCKED TO ANCHORS */}
              <svg
                className="absolute inset-0 w-[1440px] h-[1040px] pointer-events-none z-10"
                viewBox="0 0 1440 1040"
                fill="none"
                aria-hidden="true"
                style={{
                  shapeRendering: 'geometricPrecision',
                  overflow: 'visible',
                }}
              >
                {/* Left Trace Lines */}
                {[
                  { id: 'cap-0', dotX: 392, dotY: 259, path: 'M 392 259 L 450 259 L 570 260 L 640 260' },
                  { id: 'cap-1', dotX: 392, dotY: 311, path: 'M 392 311 L 450 311 L 560 305 L 630 305' },
                  { id: 'cap-2', dotX: 392, dotY: 363, path: 'M 392 363 L 450 363 L 550 350 L 620 350' },
                  { id: 'cap-3', dotX: 392, dotY: 415, path: 'M 392 415 L 450 415 L 550 395 L 620 395' },
                  { id: 'cap-4', dotX: 392, dotY: 467, path: 'M 392 467 L 450 467 L 560 440 L 630 440' },
                  { id: 'cap-5', dotX: 392, dotY: 519, path: 'M 392 519 L 450 519 L 570 485 L 640 485' },
                ].map((trace) => {
                  const isHovered = hoveredNode === trace.id;
                  const hasAnyHover = hoveredNode !== null;
                  return (
                    <g key={trace.id}>
                      <path
                        d={trace.path}
                        stroke={isHovered ? 'var(--color-accent)' : 'var(--color-text-muted)'}
                        strokeWidth={isHovered ? hoverStrokeWidth : baseStrokeWidth}
                        strokeDasharray={isHovered ? 'none' : dashArray}
                        opacity={hasAnyHover && !isHovered ? 0.2 : 0.85}
                        className="transition-all duration-300"
                      />
                      <circle
                        cx={trace.dotX}
                        cy={trace.dotY}
                        r={isHovered ? hoverDotRadius : dotRadius}
                        fill={isHovered ? 'var(--color-accent)' : 'var(--color-text)'}
                        opacity={hasAnyHover && !isHovered ? 0.25 : 1}
                      />
                      <circle r={isHovered ? hoverPhotonRadius : photonRadius} fill="var(--color-accent)">
                        <animateMotion
                          path={trace.path}
                          dur={`${2.4 + Math.random() * 0.6}s`}
                          repeatCount="indefinite"
                        />
                      </circle>
                    </g>
                  );
                })}

                {/* Right Trace Lines */}
                {[
                  { id: 'build-0', dotX: 978, dotY: 147, path: 'M 800 260 L 860 260 L 920 147 L 978 147' },
                  { id: 'build-1', dotX: 978, dotY: 217, path: 'M 810 305 L 870 305 L 920 217 L 978 217' },
                  { id: 'build-2', dotX: 978, dotY: 287, path: 'M 820 350 L 880 350 L 920 287 L 978 287' },
                  { id: 'build-3', dotX: 978, dotY: 357, path: 'M 820 395 L 880 395 L 920 357 L 978 357' },
                  { id: 'build-4', dotX: 978, dotY: 427, path: 'M 810 440 L 870 440 L 920 427 L 978 427' },
                  { id: 'build-5', dotX: 978, dotY: 497, path: 'M 800 485 L 860 485 L 920 497 L 978 497' },
                ].map((trace) => {
                  const isHovered = hoveredNode === trace.id;
                  const hasAnyHover = hoveredNode !== null;
                  return (
                    <g key={trace.id}>
                      <path
                        d={trace.path}
                        stroke={isHovered ? 'var(--color-accent)' : 'var(--color-text-muted)'}
                        strokeWidth={isHovered ? hoverStrokeWidth : baseStrokeWidth}
                        strokeDasharray={isHovered ? 'none' : dashArray}
                        opacity={hasAnyHover && !isHovered ? 0.2 : 0.85}
                        className="transition-all duration-300"
                      />
                      <circle
                        cx={trace.dotX}
                        cy={trace.dotY}
                        r={isHovered ? hoverDotRadius : dotRadius}
                        fill={isHovered ? 'var(--color-accent)' : 'var(--color-text)'}
                        opacity={hasAnyHover && !isHovered ? 0.25 : 1}
                      />
                      <circle r={isHovered ? hoverPhotonRadius : photonRadius} fill="var(--color-accent)">
                        <animateMotion
                          path={trace.path}
                          dur={`${2.4 + Math.random() * 0.6}s`}
                          repeatCount="indefinite"
                        />
                      </circle>
                    </g>
                  );
                })}

                {/* Bottom Traces */}
                {[
                  { id: 'pillar-0', dotX: 270, dotY: 720, path: 'M 720 560 L 720 630 L 270 630 L 270 720' },
                  { id: 'pillar-1', dotX: 720, dotY: 720, path: 'M 720 560 L 720 720' },
                  { id: 'pillar-2', dotX: 1170, dotY: 720, path: 'M 720 560 L 720 630 L 1170 630 L 1170 720' },
                ].map((trace) => {
                  const isHovered = hoveredNode === trace.id;
                  const hasAnyHover = hoveredNode !== null;
                  return (
                    <g key={trace.id}>
                      <path
                        d={trace.path}
                        stroke={isHovered ? 'var(--color-accent)' : 'var(--color-text-muted)'}
                        strokeWidth={isHovered ? hoverStrokeWidth : baseStrokeWidth}
                        strokeDasharray={isHovered ? 'none' : dashArray}
                        opacity={hasAnyHover && !isHovered ? 0.2 : 0.85}
                        className="transition-all duration-300"
                      />
                      <circle
                        cx={trace.dotX}
                        cy={trace.dotY}
                        r={isHovered ? hoverDotRadius : dotRadius}
                        fill={isHovered ? 'var(--color-accent)' : 'var(--color-text)'}
                        opacity={hasAnyHover && !isHovered ? 0.25 : 1}
                      />
                      <circle r={isHovered ? hoverPhotonRadius : photonRadius} fill="var(--color-accent)">
                        <animateMotion
                          path={trace.path}
                          dur="2.8s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    </g>
                  );
                })}

                {/* Bottom Tree Split Junction Nodes */}
                <circle cx="720" cy="630" r={dotRadius} fill="var(--color-text)" opacity="0.8" />
                <circle cx="270" cy="630" r={dotRadius} fill="var(--color-text)" opacity="0.8" />
                <circle cx="1170" cy="630" r={dotRadius} fill="var(--color-text)" opacity="0.8" />

                {/* Horizontal Dashed Connectors Between Cards */}
                <line x1="468" y1="808" x2="522" y2="808" stroke="var(--color-text-muted)" strokeWidth={dashStrokeWidth} strokeDasharray={dashArray} opacity="0.6" />
                <line x1="918" y1="808" x2="972" y2="808" stroke="var(--color-text-muted)" strokeWidth={dashStrokeWidth} strokeDasharray={dashArray} opacity="0.6" />
              </svg>

              {/* Upper-Left Narrative Header (X: 72px, Top: 20px, Width: 360px) */}
              <div className="absolute left-[72px] top-[20px] w-[360px] z-20 space-y-1.5">
                <div className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-[0.2em] font-semibold flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[var(--color-accent)]" />
                  <span>WHO WE ARE</span>
                </div>
                <h2 className="font-heading text-3xl font-bold uppercase text-[var(--color-text)] tracking-tight leading-[1.08]">
                  Engineering Intelligence Across AI, Data, Cloud &amp; IIoT.
                </h2>
                <p className="text-[13px] text-[var(--color-text-secondary)] leading-[1.6] font-normal pt-1">
                  SMRIKAAM brings deep engineering rigor to enterprise data pipelines, autonomous agent systems, and industrial edge telemetry.
                </p>
                <div className="pt-2 text-[10px] text-[var(--color-text-muted)] font-mono tracking-widest uppercase">
                  CORE PLATFORM CAPABILITIES
                </div>
              </div>

              {/* 6 Capability Pills — Absolute Fixed Master Placement (X: 72px, Width: 320px) */}
              {capabilities.map((cap, idx) => {
                const Icon = cap.icon;
                const isHovered = hoveredNode === cap.id;
                const topPos = 240 + idx * 52;
                return (
                  <div
                    key={cap.id}
                    tabIndex={0}
                    onMouseEnter={() => setHoveredNode(cap.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    onFocus={() => setHoveredNode(cap.id)}
                    onBlur={() => setHoveredNode(null)}
                    style={{
                      position: 'absolute',
                      left: '72px',
                      top: `${topPos}px`,
                      width: '320px',
                      height: '38px',
                    }}
                    className={`flex items-center px-3.5 rounded-full border border-[var(--color-border-strong)]/80 bg-[var(--color-surface)] shadow-xs transition-all duration-200 cursor-pointer z-20 ${
                      isHovered
                        ? 'border-[var(--color-accent)] bg-[var(--color-surface)] shadow-md translate-x-1'
                        : 'hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-subtle)]'
                    }`}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="w-6 h-6 rounded-full border border-[var(--color-border)] flex items-center justify-center text-[var(--color-accent)] bg-[var(--color-bg)] shrink-0">
                        <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
                      </div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text)] truncate">
                        {cap.title}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Center Visual: 3D Core Canvas (Dead Center: X=720px, Y=370px) */}
              <div className="absolute top-[370px] left-[720px] -translate-x-1/2 -translate-y-1/2 w-[440px] h-[440px] flex items-center justify-center z-10 pointer-events-none">
                <div className="w-[380px] h-[380px] relative flex items-center justify-center overflow-hidden mx-auto">
                  <canvas
                    ref={canvasRef}
                    onClick={handleCubeClick}
                    className="w-full h-full object-contain pointer-events-auto cursor-pointer"
                    title="SMRIKAAM 3D Engineering Core"
                  />
                </div>
              </div>

              {/* Upper-Right Narrative Header (X: 972px, Top: 20px, Width: 396px) */}
              <div className="absolute left-[972px] top-[20px] w-[396px] z-20 space-y-1.5">
                <div className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-[0.2em] font-semibold flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[var(--color-accent)]" />
                  <span>WHAT WE BUILD</span>
                </div>
                <h2 className="font-heading text-3xl font-bold uppercase text-[var(--color-text)] tracking-tight leading-[1.08]">
                  Technology. Engineered End to End.
                </h2>
              </div>

              {/* 6 Build Items — Absolute Fixed Master Placement (X: 972px, Width: 396px) */}
              {buildItems.map((item, idx) => {
                const Icon = item.icon;
                const isHovered = hoveredNode === item.id;
                const topPos = 125 + idx * 70;
                return (
                  <div
                    key={item.id}
                    tabIndex={0}
                    onMouseEnter={() => setHoveredNode(item.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    onFocus={() => setHoveredNode(item.id)}
                    onBlur={() => setHoveredNode(null)}
                    style={{
                      position: 'absolute',
                      left: '972px',
                      top: `${topPos}px`,
                      width: '396px',
                      height: '56px',
                    }}
                    className={`flex items-start gap-3.5 transition-all duration-200 cursor-pointer p-1.5 rounded-lg z-20 ${
                      isHovered ? '-translate-x-1 bg-[var(--color-surface-subtle)]/80' : 'hover:bg-[var(--color-surface-subtle)]/40'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-full border border-[var(--color-border-strong)] shrink-0 flex items-center justify-center bg-[var(--color-surface)] text-[var(--color-text)] transition-transform duration-200"
                      style={{ transform: isHovered ? 'scale(1.1)' : 'scale(1)' }}
                    >
                      <Icon className="w-4 h-4" strokeWidth={1.8} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-[var(--color-text)] mb-0.5">
                        {item.title}
                      </h3>
                      <p className="text-[13px] text-[var(--color-text-secondary)] leading-[1.5] font-normal">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}

              {/* Explore Services Button */}
              <div
                style={{
                  position: 'absolute',
                  left: '972px',
                  top: '555px',
                  width: '396px',
                }}
                className="z-20"
              >
                <Link
                  to="/services"
                  className="inline-flex items-center justify-between px-5 py-2.5 border border-[var(--button-secondary-border)] bg-[var(--button-secondary-bg)] text-[var(--button-secondary-text)] hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-subtle)] text-xs font-semibold uppercase tracking-widest transition-all duration-200 group"
                >
                  <span>EXPLORE SERVICES</span>
                  <ArrowUpRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>

              {/* OPTION A: FIXED MASTER CARD COORDINATES */}
              {pillars.map((pillar, idx) => {
                const PillarIcon = pillar.icon;
                const isHovered = hoveredNode === pillar.id;
                const leftCoords = [72, 522, 972];
                return (
                  <div
                    key={pillar.id}
                    tabIndex={0}
                    onMouseEnter={() => setHoveredNode(pillar.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    onFocus={() => setHoveredNode(pillar.id)}
                    onBlur={() => setHoveredNode(null)}
                    style={{
                      position: 'absolute',
                      left: `${leftCoords[idx]}px`,
                      top: '720px',
                      width: '396px',
                      height: '175px',
                    }}
                    className={`p-5 rounded-xl border transition-all duration-200 flex flex-col items-center text-center cursor-pointer z-20 ${
                      isHovered
                        ? 'border-[var(--color-accent)] bg-[var(--color-surface)] shadow-lg'
                        : 'border-[var(--color-border-strong)]/80 bg-[var(--color-surface)] shadow-xs hover:border-[var(--color-border-strong)]'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-full border border-[var(--color-border-strong)] flex items-center justify-center mb-3 bg-[var(--color-surface)] text-[var(--color-accent)] transition-transform duration-200">
                      <PillarIcon className="w-5 h-5" strokeWidth={1.8} />
                    </div>
                    <h4 className="font-heading text-base font-bold uppercase tracking-wider text-[var(--color-text)] mb-1.5">
                      {pillar.title}
                    </h4>
                    <p className="text-[13px] text-[var(--color-text-secondary)] leading-[1.5] font-normal">
                      {pillar.desc}
                    </p>
                  </div>
                );
              })}

              {/* Bouncing Arrow Indicator (Centered at X=720px, Top=915px) */}
              <div
                style={{
                  position: 'absolute',
                  left: '720px',
                  top: '915px',
                  transform: 'translateX(-50%)',
                }}
                className="flex flex-col items-center justify-center text-[var(--color-text-muted)] z-20"
              >
                <ArrowDown className="w-4 h-4 animate-bounce" />
              </div>

              {/* Business Impact Ribbon (Centered at X=720px, Top=950px) */}
              <div
                style={{
                  position: 'absolute',
                  left: '720px',
                  top: '950px',
                  transform: 'translateX(-50%)',
                }}
                className="flex justify-center z-20"
              >
                <div className="inline-flex items-center justify-center gap-4 px-6 py-2.5 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm text-[11px] tracking-widest uppercase text-[var(--color-text)] font-semibold whitespace-nowrap">
                  <span>INTELLIGENT SYSTEMS</span>
                  <span className="text-[var(--color-text-muted)]">→</span>
                  <span>OPERATIONAL EXCELLENCE</span>
                  <span className="text-[var(--color-text-muted)]">→</span>
                  <span>BUSINESS IMPACT</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

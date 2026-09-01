import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

export default function ServicesInteractiveSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [isHovered, setIsHovered] = useState(false);
  const stageRef = useRef(null);

  const services = [
    {
      id: 'data-analytics',
      num: '01',
      title: 'Data Analytics & BI',
      tagline: 'Real-time telemetry dashboards, executive KPIs, and automated operational reporting.',
      description: 'Transform siloed legacy data into real-time operational visibility with high-performance BI frameworks, executive dashboards, and embedded analytics engines.',
      capabilities: ['Executive KPI Views', 'Real-Time Telemetry', 'Automated Financial Reporting', 'Embedded Analytics'],
      tech: ['PowerBI', 'Tableau', 'Looker', 'BigQuery'],
      image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200&auto=format&fit=crop',
      caption: 'DATA → INSIGHT → DECISION — Enterprise Telemetry Control Environment',
      link: '/services'
    },
    {
      id: 'iiot',
      num: '02',
      title: 'Industrial IoT',
      tagline: 'Edge machine connectivity, Modbus/OPC-UA/MQTT telemetry, and OEE tracking.',
      description: 'Connect shop-floor machinery, capture sensor telemetry, and achieve predictive maintenance with real-time OEE tracking across industrial operations.',
      capabilities: ['OPC-UA / Modbus Ingestion', 'Edge Sensor Integration', 'Predictive Maintenance', 'Live Floor Wallboards'],
      tech: ['MQTT', 'Node-RED', 'TimescaleDB', 'InfluxDB'],
      image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200&auto=format&fit=crop',
      caption: 'CONNECTED MACHINES — Smart Factory Floor & OEE Automation',
      link: '/services'
    },
    {
      id: 'data-engineering',
      num: '03',
      title: 'Data Engineering',
      tagline: 'Ingestion pipelines, schema normalization, and automated cloud warehouse loads.',
      description: 'Build high-throughput data pipelines, automated ELT workflows, and modern lakehouse architectures engineered for zero data loss and sub-second queries.',
      capabilities: ['ETL / ELT Pipelines', 'Lakehouse Architecture', 'Schema Drift Control', 'CDC Telemetry Sync'],
      tech: ['dbt', 'Apache Spark', 'Snowflake', 'Databricks'],
      image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=1200&auto=format&fit=crop',
      caption: 'DATA PLATFORMS — High-Throughput Engineering Infrastructure',
      link: '/services'
    },
    {
      id: 'gen-ai',
      num: '04',
      title: 'Generative & Agentic AI',
      tagline: 'Context-aware LLM agents, automated document parsing, and predictive models.',
      description: 'Deploy autonomous AI agents, domain-tuned LLMs, and agentic RAG pipelines that automate complex technical workflows with enterprise guardrails.',
      capabilities: ['Agentic RAG Pipelines', 'Document OCR & NLP', 'Custom Fine-Tuned Models', 'Enterprise Guardrails'],
      tech: ['LangChain', 'LlamaIndex', 'Gemini API'],
      image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop',
      caption: 'HUMAN + ARTIFICIAL INTELLIGENCE — Autonomous Agentic AI Systems',
      link: '/services'
    },
    {
      id: 'devops-cloud',
      num: '05',
      title: 'DevOps & Cloud',
      tagline: 'Infrastructure as Code, CI/CD pipelines, and zero-downtime cloud migration.',
      description: 'Engineer zero-downtime cloud landing zones, automated Infrastructure as Code (IaC), and resilient CI/CD delivery pipelines across AWS, Google Cloud, and Azure.',
      capabilities: ['Cloud Landing Zones', 'Infrastructure as Code', 'Zero-Downtime Migration', 'Kubernetes / Docker'],
      tech: ['AWS', 'Google Cloud', 'Azure', 'Terraform', 'Kubernetes'],
      image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop',
      caption: 'CLOUD INFRASTRUCTURE — Distributed Multi-Cloud System Architecture',
      link: '/services'
    },
    {
      id: 'data-governance',
      num: '06',
      title: 'Data Governance',
      tagline: 'Lineage tracking, data cataloguing, security auditing, and DPDP compliance.',
      description: 'Establish enterprise data trust with automated lineage mapping, granular role-based access controls, data cataloguing, and regulatory compliance auditing.',
      capabilities: ['Automated Lineage Mapping', 'Data Cataloging', 'Role-Based Access Control', 'DPDP Compliance Audit'],
      tech: ['Collibra', 'Apache Atlas', 'Privacera', 'Great Expectations'],
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1200&auto=format&fit=crop',
      caption: 'TRUST & COMPLIANCE — Enterprise Lineage & Security Control',
      link: '/services'
    }
  ];

  // Preload images to eliminate flickers
  useEffect(() => {
    services.forEach((srv) => {
      const img = new Image();
      img.src = srv.image;
    });
  }, []);

  // Handle Cursor Position Tracking across Stage
  const handleMouseMove = (e) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setMousePos({ x, y });
  };

  const activeService = services[activeIdx];

  // Calculate subtle 3D parallax transformation
  const rotateX = isHovered ? (0.5 - mousePos.y) * 4 : 0;
  const rotateY = isHovered ? (mousePos.x - 0.5) * 4 : 0;
  const translateX = isHovered ? (mousePos.x - 0.5) * 12 : 0;
  const translateY = isHovered ? (mousePos.y - 0.5) * 12 : 0;

  return (
    <section className="bg-[#FFFFFF] py-20 px-6 md:px-16 border-t border-b border-[#E5E5E5] text-[#111111]">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-16 border-b border-[#E5E5E5] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="font-mono text-xs text-[#111111] uppercase tracking-[0.2em] mb-2 font-bold">
              ENGINEERING CAPABILITIES
            </div>
            <h2 className="font-heading text-3xl md:text-5xl font-extrabold uppercase text-[#111111] tracking-tight">
              CONNECTED TECHNOLOGY SYSTEM
            </h2>
          </div>
          <p className="text-[#555555] text-sm md:text-base max-w-md font-normal leading-relaxed">
            Six integrated enterprise capabilities engineered for high-throughput data platforms, AI autonomy, and industrial automation.
          </p>
        </div>

        {/* Split Desktop / Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Interactive Service Navigation List */}
          <div className="lg:col-span-6 flex flex-col">
            {services.map((srv, idx) => {
              const isActive = activeIdx === idx;
              return (
                <div
                  key={srv.id}
                  onMouseEnter={() => setActiveIdx(idx)}
                  onClick={() => setActiveIdx(idx)}
                  className={`group relative border-b border-[#E5E5E5] py-6 cursor-pointer transition-all duration-300 ${
                    isActive ? 'bg-[#F8F8F8] px-4 -mx-4' : 'hover:bg-[#F8F8F8]/50'
                  }`}
                >
                  {/* Active Black Line */}
                  <div
                    className={`absolute left-0 bottom-0 right-0 h-[2px] bg-[#111111] transition-all duration-500 ease-out origin-left ${
                      isActive ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
                    }`}
                  />

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 md:gap-6">
                      {/* Number with Color & Motion Transition */}
                      <span
                        className={`font-mono text-sm md:text-base font-bold transition-all duration-300 pt-0.5 ${
                          isActive
                            ? 'text-[#111111] translate-x-1'
                            : 'text-[#555555] group-hover:text-[#111111]'
                        }`}
                      >
                        {srv.num}
                      </span>

                      {/* Title & Tagline */}
                      <div>
                        <h3
                          className={`font-heading text-xl md:text-2xl font-bold uppercase tracking-wide transition-colors duration-300 ${
                            isActive
                              ? 'text-[#111111]'
                              : 'text-[#222222] group-hover:text-[#111111]'
                          }`}
                        >
                          {srv.title}
                        </h3>

                        {/* Collapsed short tagline */}
                        <p className="text-xs md:text-sm text-[#444444] mt-1 font-medium leading-relaxed max-w-xl">
                          {srv.tagline}
                        </p>
                      </div>
                    </div>

                    {/* Magnetic Arrow Icon */}
                    <div
                      className={`transform transition-all duration-300 shrink-0 pt-1 ${
                        isActive
                          ? 'translate-x-2 text-[#111111]'
                          : 'text-[#555555] group-hover:translate-x-1.5 group-hover:text-[#111111]'
                      }`}
                    >
                      <ArrowUpRight className="w-5 h-5" strokeWidth={2} />
                    </div>
                  </div>

                  {/* Expanded Content View when active */}
                  {isActive && (
                    <div className="mt-4 pl-9 md:pl-12 pt-3 border-t border-[#E5E5E5]/60 animate-fadeIn">
                      <p className="text-sm text-[#333333] leading-relaxed mb-4 font-normal">
                        {srv.description}
                      </p>

                      {/* Key Capabilities */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {srv.capabilities.map((cap, cIdx) => (
                          <span
                            key={cIdx}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FFFFFF] border border-[#E5E5E5] text-xs font-mono text-[#111111] font-semibold"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#111111]" />
                            {cap}
                          </span>
                        ))}
                      </div>

                      {/* Mobile Inline Real-World Photograph */}
                      <div className="block lg:hidden my-4">
                        <div className="relative overflow-hidden rounded-none aspect-video bg-[#F8F8F8]">
                          <img
                            src={srv.image}
                            alt={srv.title}
                            className="w-full h-full object-cover transition-opacity duration-500"
                          />
                        </div>
                        <div className="font-mono text-xs text-[#555555] uppercase mt-1 tracking-wider font-semibold">
                          {srv.caption}
                        </div>
                      </div>

                      {/* Explore Link */}
                      <Link
                        to={srv.link}
                        className="inline-flex items-center gap-2 font-mono text-xs uppercase font-bold text-[#111111] hover:text-[#000000] transition-colors group/link pt-1"
                      >
                        <span>EXPLORE CAPABILITY</span>
                        <ArrowRight className="w-4 h-4 transform group-hover/link:translate-x-1.5 transition-transform" />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column: High-End Cinematic Stage with Parallax & Lighting */}
          <div className="lg:col-span-6 sticky top-28 hidden lg:block">
            <div
              ref={stageRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => {
                setIsHovered(false);
                setMousePos({ x: 0.5, y: 0.5 });
              }}
              className="relative overflow-hidden rounded-sm border border-[#E5E5E5] bg-[#F8F8F8] p-2 aspect-[4/3] shadow-sm flex flex-col justify-between"
              style={{ perspective: '1000px' }}
            >
              {/* Layer 1: Parallax Photography Canvas */}
              <div
                className="relative w-full h-full overflow-hidden transition-transform duration-300 ease-out"
                style={{
                  transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(${translateX}px, ${translateY}px, 0px)`
                }}
              >
                {services.map((srv, idx) => (
                  <img
                    key={srv.id}
                    src={srv.image}
                    alt={srv.title}
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={{
                      opacity: activeIdx === idx ? 1 : 0,
                      transform: activeIdx === idx ? 'scale(1.0)' : 'scale(1.06)'
                    }}
                  />
                ))}

                {/* Layer 2: Neutral Black/White Cursor Lighting Overlay */}
                <div
                  className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(255, 255, 255, 0.08) 0%, transparent 65%), linear-gradient(${
                      mousePos.x * 180
                    }deg, rgba(255, 255, 255, 0.03), rgba(0, 0, 0, 0.15))`,
                    mixBlendMode: 'overlay',
                    opacity: isHovered ? 1 : 0.4
                  }}
                />

                {/* Layer 3: Micro Film Grain & Micro Lighting Texture */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay"
                  style={{
                    backgroundImage: 'radial-gradient(#FFFFFF 1px, transparent 1px)',
                    backgroundSize: '8px 8px'
                  }}
                />

                {/* Layer 4: Minimal Editorial Metadata Overlay */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none z-20">
                  <div className="bg-[#111111]/90 backdrop-blur-md px-3 py-1 text-[10px] font-mono text-[#FFFFFF] tracking-widest font-bold">
                    SMRIKAAM
                  </div>
                  <div className="bg-[#111111]/90 backdrop-blur-md px-3 py-1 text-[10px] font-mono text-[#FFFFFF] tracking-widest font-bold">
                    SYSTEMS READY
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 right-4 pointer-events-none z-20">
                  <div className="bg-[#111111]/90 backdrop-blur-md p-3 border-l-2 border-[#FFFFFF]">
                    <div className="font-heading text-sm font-bold text-[#FFFFFF] uppercase tracking-wide">
                      {activeService.title}
                    </div>
                    <div className="font-mono text-[10px] text-[#999999] uppercase tracking-wider truncate mt-0.5">
                      {activeService.caption}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

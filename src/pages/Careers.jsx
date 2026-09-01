import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ArrowUpRight, Activity, Cpu, CheckCircle2, Zap } from 'lucide-react';
import BlueprintWrapper from '../components/BlueprintWrapper';
import TextReveal from '../components/anim/TextReveal';
import BannerDrawBorder from '../components/anim/BannerDrawBorder';
import Reveal from '../components/anim/Reveal';

export default function Careers() {
  const perks = [
    'Real Projects from Day 1',
    'Industrial AI Exposure',
    'Modern Tech Stack',
    'Direct Mentorship',
    'Fast Career Growth',
    'Flexible Work Culture',
    'Learning Support',
    'Enterprise-Scale Projects'
  ];

  const techStack = [
    'Python', 'Azure', 'AWS', 'Snowflake', 'LangChain', 'LlamaIndex',
    'Airflow', 'Grafana', 'Docker', 'Kubernetes', 'TensorFlow', 'PyTorch'
  ];

  const hiringSteps = [
    { num: '1', name: 'Apply', desc: 'Submit resume & portfolio' },
    { num: '2', name: 'Technical Challenge', desc: 'Practical hands-on task' },
    { num: '3', name: 'Technical Discussion', desc: 'Deep dive with lead engineers' },
    { num: '4', name: 'Culture Conversation', desc: 'Meet leadership team' },
    { num: '5', name: 'Offer', desc: 'Join SMRIKAAM Technologies' }
  ];

  return (
    <div className="relative z-10 pt-28 pb-32 px-6 md:px-16 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="page-title-surface relative border border-border p-8 md:p-12 mb-16 overflow-hidden">
        <BannerDrawBorder />
        <div className="flex items-center justify-between mb-4">
          <div className="font-mono text-[10px] md:text-[11px] text-[var(--color-accent)] uppercase tracking-[0.2em] font-semibold">
            CAREERS &amp; ENGINEERING OPPORTUNITIES
          </div>
          <div className="font-mono text-[10px] md:text-[11px] text-[var(--color-text-muted)] border border-[var(--color-border)] px-3 py-1 bg-black/[0.02] dark:bg-white/[0.03]">
            COIMBATORE &amp; REMOTE
          </div>
        </div>

        <TextReveal
          text="BUILD WHAT'S NEXT WITH SMRIKAAM."
          as="h1"
          className="font-heading text-3xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-[var(--color-text)] leading-[0.96] mb-4"
        />
        <p className="text-[15px] sm:text-[16px] md:text-[18px] text-[var(--color-text-secondary)] max-w-3xl border-l-2 border-[var(--color-accent)] pl-4 font-normal leading-[1.6]">
          Work on Industrial IoT platforms, enterprise AI systems, cloud analytics, machine learning pipelines, and next-generation operational intelligence solutions for real-world clients.
        </p>
      </div>

      {/* Live Operations Widget */}
      <BlueprintWrapper className="p-8 mb-16 shadow-lg">
        <div className="flex items-center justify-between border-b border-border pb-4 mb-6 font-mono text-xs">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent" />
            <span className="font-semibold text-text">OPERATIONS DEMO</span>
          </div>
          <div className="flex gap-4 text-text-muted">
            <span>UPTIME: <strong className="text-accent font-bold">99.9%</strong></span>
            <span>LATENCY: <strong className="text-accent font-bold">142ms</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center font-mono">
          <div className="p-4 subtle-readable-surface border border-border">
            <div className="text-xs text-text-muted mb-1 font-semibold">OEE INDEX</div>
            <div className="font-heading font-bold text-3xl text-accent">92.4%</div>
          </div>
          <div className="p-4 subtle-readable-surface border border-border">
            <div className="text-xs text-text-muted mb-1 font-semibold">ACTIVE MODELS</div>
            <div className="font-heading font-bold text-3xl text-text">27</div>
          </div>
          <div className="p-4 subtle-readable-surface border border-border">
            <div className="text-xs text-text-muted mb-1 font-semibold">DATA STREAMS</div>
            <div className="font-heading font-bold text-3xl text-text">1.2k/s</div>
          </div>
          <div className="p-4 subtle-readable-surface border border-border">
            <div className="text-xs text-text-muted mb-1 font-semibold">CLUSTER</div>
            <div className="font-heading font-bold text-3xl text-accent">LIVE</div>
          </div>
        </div>
      </BlueprintWrapper>

      {/* Why Engineers Choose SMRIKAAM */}
      <div className="mb-16">
        <div className="font-mono text-[13px] text-accent uppercase tracking-[0.18em] mb-2 font-medium">
          CULTURE &amp; GROWTH
        </div>
        <h2 className="font-heading text-3xl font-semibold uppercase text-text mb-8 border-b border-border pb-4">
          WHY ENGINEERS CHOOSE SMRIKAAM
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {perks.map((perk, idx) => (
            <BlueprintWrapper key={idx} className="p-4 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-accent shrink-0" strokeWidth={1.5} />
              <span className="font-sans text-[14px] font-medium text-text uppercase">{perk}</span>
            </BlueprintWrapper>
          ))}
        </div>
      </div>

      {/* Open Positions */}
      <div className="mb-16">
        <div className="font-mono text-[13px] text-accent uppercase tracking-[0.18em] mb-2 font-medium">
          JOIN US • OPEN POSITIONS
        </div>
        <h2 className="font-heading text-3xl font-semibold uppercase text-text mb-8 border-b border-border pb-4">
          ACTIVE OPPORTUNITIES
        </h2>

        <div className="space-y-8">
          {/* Position 1 */}
          <BlueprintWrapper className="p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <span className="tag tag-accent mb-2 text-[13px] font-normal">FULL-TIME · COIMBATORE / REMOTE</span>
                <h3 className="font-heading text-2xl font-semibold uppercase text-text">
                  Data &amp; AI Engineer (Fresher)
                </h3>
              </div>
              <Link to="/contact" className="btn btn-primary font-semibold text-[14px] uppercase tracking-wider">
                Apply Now <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} />
              </Link>
            </div>

            <p className="text-base md:text-[17px] font-normal text-text leading-[1.7] mb-6">
              We are looking for IT and Computer Science graduates with strong Python skills and curiosity about Machine Learning and Generative AI. Work on live enterprise projects involving analytics dashboards, data pipelines, and LLM-powered applications.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-bg border border-border font-mono text-[14px]">
              <div>
                <div className="text-accent font-medium mb-2">MUST HAVE:</div>
                <div className="flex flex-wrap gap-1.5">
                  {['Python', 'ML fundamentals', 'Pandas / NumPy', 'SQL basics', 'Git'].map((s, i) => (
                    <span key={i} className="tag tag-neutral text-[13px] font-normal">+ {s}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-text font-medium mb-2">GOOD TO HAVE:</div>
                <div className="flex flex-wrap gap-1.5">
                  {['ChatGPT APIs', 'Azure / AWS basics', 'Streamlit', 'Jupyter'].map((s, i) => (
                    <span key={i} className="tag tag-neutral text-[13px] font-normal">+ {s}</span>
                  ))}
                </div>
              </div>
            </div>
          </BlueprintWrapper>

          {/* Position 2 */}
          <BlueprintWrapper className="p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <span className="tag tag-accent mb-2 text-[13px] font-normal">FULL-TIME · COIMBATORE / REMOTE</span>
                <h3 className="font-heading text-2xl font-semibold uppercase text-text">
                  Senior Data &amp; AI Engineer
                </h3>
              </div>
              <Link to="/contact" className="btn btn-primary font-semibold text-[14px] uppercase tracking-wider">
                Apply Now <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} />
              </Link>
            </div>

            <p className="text-base md:text-[17px] font-normal text-text leading-[1.7] mb-6">
              Lead enterprise AI, data engineering, and cloud transformation projects involving ML systems, Industrial IoT, operational intelligence, and enterprise-scale analytics platforms.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-bg border border-border font-mono text-[14px]">
              <div>
                <div className="text-accent font-medium mb-2">MUST HAVE:</div>
                <div className="flex flex-wrap gap-1.5">
                  {['Production-grade Python', 'ML/DL frameworks', 'LangChain / RAG', 'SQL', 'ETL pipelines', 'Cloud platforms'].map((s, i) => (
                    <span key={i} className="tag tag-neutral text-[13px] font-normal">+ {s}</span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-text font-medium mb-2">GOOD TO HAVE:</div>
                <div className="flex flex-wrap gap-1.5">
                  {['Docker', 'Kubernetes', 'Grafana', 'MQTT / Modbus', 'FastAPI'].map((s, i) => (
                    <span key={i} className="tag tag-neutral text-[13px] font-normal">+ {s}</span>
                  ))}
                </div>
              </div>
            </div>
          </BlueprintWrapper>
        </div>
      </div>

      {/* Tech Stack Pills */}
      <div className="mb-16">
        <div className="font-mono text-[13px] text-accent uppercase tracking-[0.18em] mb-2 font-medium">
          TOOLING & TECHNOLOGIES
        </div>
        <h2 className="font-heading text-2xl font-semibold uppercase text-text mb-6">
          MODERN TECH STACK
        </h2>

        <div className="flex flex-wrap gap-2">
          {techStack.map((tech, i) => (
            <span key={i} className="tag tag-accent text-[13px] font-normal py-1.5 px-3">
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* 5-Step Hiring Process */}
      <div className="mb-16">
        <div className="font-mono text-[13px] text-accent uppercase tracking-[0.18em] mb-2 font-medium">
          HIRING FLOW
        </div>
        <h2 className="font-heading text-3xl font-semibold uppercase text-text mb-8 border-b border-border pb-4">
          OUR HIRING PROCESS
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {hiringSteps.map((step, idx) => (
            <BlueprintWrapper key={idx} className="p-6 text-center">
              <div className="font-heading font-bold text-3xl text-accent mb-2">{step.num}</div>
              <div className="font-heading font-semibold text-base uppercase text-text mb-1">{step.name}</div>
              <div className="font-mono text-[13px] font-normal text-text-muted">{step.desc}</div>
            </BlueprintWrapper>
          ))}
        </div>
      </div>

      {/* CTA */}
      <BlueprintWrapper className="p-8 md:p-12 text-center bg-bg/95 backdrop-blur-md">
        <h2 className="font-heading text-3xl font-semibold uppercase text-text mb-4">
          READY TO BUILD WHAT'S NEXT?
        </h2>
        <p className="text-text-muted text-[15px] font-normal max-w-2xl mx-auto mb-8">
          Join SMRIKAAM Technologies and help shape the future of Industrial AI, operational intelligence, and enterprise automation.
        </p>
        <Link to="/contact" className="btn btn-primary font-semibold uppercase tracking-wider text-[14px]">
          Apply Now <ArrowUpRight className="w-4 h-4 ml-1" strokeWidth={1.5} />
        </Link>
      </BlueprintWrapper>
    </div>
  );
}

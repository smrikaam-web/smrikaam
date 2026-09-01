import React, { useState } from 'react';
import { Send, CheckCircle2, AlertTriangle, MapPin, Mail, Phone, ArrowUpRight, Cpu, Users, Layers, Handshake } from 'lucide-react';
import api from '../api';
import BlueprintWrapper from '../components/BlueprintWrapper';
import TextReveal from '../components/anim/TextReveal';
import BannerDrawBorder from '../components/anim/BannerDrawBorder';
import Reveal from '../components/anim/Reveal';

export default function Contact() {
  const [formData, setFormData] = useState({
    full_name: '',
    company_name: '',
    email: '',
    phone: '',
    requirement_type: 'Technology Transformation',
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const engagementPaths = [
    {
      title: 'Technology Transformation',
      subtitle: 'AI / Data / Cloud / IIoT',
      icon: Cpu,
      desc: 'Modernize legacy IT, establish IIoT edge telemetry, or build enterprise AI lakehouses.'
    },
    {
      title: 'Staffing Services',
      subtitle: 'Specialist Technology Talent',
      icon: Users,
      desc: 'Hire vetted temporary engineers, permanent leads, or dedicated transformation pods.'
    },
    {
      title: 'Accelerator Demo',
      subtitle: 'BitXhift / MigrateMax / ParseMaster / LinkGenX',
      icon: Layers,
      desc: 'Schedule a 48-hour pilot run using our reusable engineering IP assets.'
    },
    {
      title: 'Strategic Partnership',
      subtitle: 'Business / Tech Collaboration',
      icon: Handshake,
      desc: 'Explore joint solution delivery, co-engineering, or regional channel partnerships.'
    }
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await api.post('/contact', {
        ...formData,
        service_of_interest: formData.requirement_type
      });
      setSuccessMsg(res.data.message || 'Thank you. Our engineering leads will connect with you shortly.');
      setFormData({
        full_name: '',
        company_name: '',
        email: '',
        phone: '',
        requirement_type: 'Technology Transformation',
        message: ''
      });
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to submit inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative z-10 pt-28 pb-24 px-6 md:px-16 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div id="overview" data-scroll-label="CONTACT" className="page-title-surface relative border border-border p-6 sm:p-8 md:p-12 mb-12 overflow-hidden">
        <BannerDrawBorder />
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="text-[10px] md:text-[11px] text-[var(--color-accent)] uppercase tracking-[0.2em] font-semibold">
            ENGAGEMENT &amp; GET IN TOUCH
          </div>
          <div className="text-[10px] md:text-[11px] text-[var(--color-text-muted)] border border-[var(--color-border)] px-3 py-1 bg-black/[0.02] dark:bg-white/[0.03]">
            COIMBATORE, INDIA
          </div>
        </div>
        <TextReveal
          text="LET'S SOLVE SOMETHING IMPORTANT."
          as="h1"
          className="font-heading text-3xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-[var(--color-text)] leading-[0.96] mb-4"
        />
        <p className="text-[15px] sm:text-[16px] md:text-[18px] text-[var(--color-text-secondary)] max-w-3xl border-l-2 border-[var(--color-accent)] pl-4 font-normal leading-[1.6]">
          Connect directly with SMRIKAAM engineering leads in Coimbatore. Select your engagement path below to start a conversation.
        </p>
      </div>

      {/* 4 Clear Engagement Paths */}
      <div id="paths" data-scroll-label="ENGAGEMENT PATHS" className="mb-12">
        <div className="text-xs text-accent uppercase tracking-[0.2em] mb-2 font-semibold">
          FOUR PATHS TO ENGAGE
        </div>
        <h2 className="font-heading text-2xl font-bold uppercase text-text mb-6">
          SELECT YOUR ENGAGEMENT MODEL
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {engagementPaths.map((path, idx) => {
            const Icon = path.icon;
            const isSelected = formData.requirement_type === path.title;
            return (
              <BlueprintWrapper
                key={idx}
                className={`p-6 cursor-pointer transition-all ${
                  isSelected ? 'border-accent bg-accent/5' : 'hover:border-accent/50'
                }`}
                onClick={() => setFormData({ ...formData, requirement_type: path.title })}
              >
                <div className="w-10 h-10 bg-accent/10 border border-accent/30 flex items-center justify-center text-accent mb-4">
                  <Icon className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <h3 className="font-heading text-lg font-bold uppercase text-text mb-1">
                  {path.title}
                </h3>
                <div className="text-[10px] text-accent font-semibold mb-2">{path.subtitle}</div>
                <p className="text-xs text-text-muted leading-relaxed">{path.desc}</p>
              </BlueprintWrapper>
            );
          })}
        </div>
      </div>

      {/* Form & Sidebar Grid */}
      <div id="form" data-scroll-label="INQUIRY FORM" className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Contact Form */}
        <div className="lg:col-span-7">
          <Reveal>
            <BlueprintWrapper pulseCorners={true} className="p-6 sm:p-8 md:p-12 bg-bg/95 backdrop-blur-md">
              <h2 className="font-heading text-2xl font-bold uppercase text-text mb-6">
                ENGAGEMENT FORM
              </h2>

              {successMsg && (
                <div className="mb-6 p-4 border border-emerald-500 bg-emerald-50 text-emerald-800 text-xs flex items-center gap-3 font-normal">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="mb-6 p-4 border border-rose-500 bg-rose-50 text-rose-800 text-xs flex items-center gap-3 font-normal">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="field">
                    <label htmlFor="full_name">Name *</label>
                    <input
                      type="text"
                      id="full_name"
                      name="full_name"
                      required
                      value={formData.full_name}
                      onChange={handleChange}
                      className="input"
                      placeholder="e.g. Ramesh Kumar"
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="company_name">Company *</label>
                    <input
                      type="text"
                      id="company_name"
                      name="company_name"
                      required
                      value={formData.company_name}
                      onChange={handleChange}
                      className="input"
                      placeholder="e.g. Apex Auto Components"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="field">
                    <label htmlFor="email">Work Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="input"
                      placeholder="ramesh@apexauto.in"
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="phone">Phone *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="input"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="requirement_type">Requirement Type *</label>
                  <select
                    id="requirement_type"
                    name="requirement_type"
                    value={formData.requirement_type}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="Technology Transformation">Technology Transformation (AI / Data / Cloud / IIoT)</option>
                    <option value="Staffing Services">Staffing Services (Technology Talent Augmentation)</option>
                    <option value="Accelerator Demo">Accelerator Demo (BitXhift / MigrateMax / ParseMaster / LinkGenX)</option>
                    <option value="Strategic Partnership">Strategic Partnership (Business / Technology Partnership)</option>
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="message">Requirement Details *</label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    className="input"
                    placeholder="Describe your technical requirement, data goals, machinery lines, or staffing needs..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary w-full justify-center mt-4 font-bold uppercase tracking-wider py-3"
                >
                  {submitting ? 'CONNECTING...' : 'START A CONVERSATION'} <ArrowUpRight className="w-4 h-4 ml-1" strokeWidth={1.5} />
                </button>
              </form>
            </BlueprintWrapper>
          </Reveal>
        </div>

        {/* Contact Info Sidebar */}
        <div className="lg:col-span-5 space-y-8">
          <Reveal index={1}>
            <BlueprintWrapper className="p-6 sm:p-8 bg-bg/95 backdrop-blur-md">
              <div className="text-[11px] text-accent uppercase tracking-widest mb-2 font-semibold">HEADQUARTERS</div>
              <h3 className="font-heading text-2xl font-semibold uppercase text-text mb-4">COIMBATORE HQ</h3>

              <div className="space-y-4 text-[15px] text-text-muted leading-[1.55]">
                <a
                  href="https://maps.app.goo.gl/kViWRBkDBqauRi8z7?g_st=ac"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open SMRIKAAM Technologies location in Google Maps"
                  className="flex items-start gap-3 group/map hover:text-accent transition-colors block cursor-pointer"
                >
                  <MapPin className="w-5 h-5 text-accent shrink-0 mt-1 group-hover/map:scale-110 transition-transform" strokeWidth={1.5} />
                  <div>
                    <div className="font-semibold text-text group-hover/map:text-accent transition-colors">SMRIKAAM Technologies LLP</div>
                    <div className="text-text-muted group-hover/map:text-text transition-colors">2WVM+H7X, Nataraj Nagar, P and T Colony</div>
                    <div className="text-text-muted group-hover/map:text-text transition-colors">Koundampalayam, Coimbatore, Tamil Nadu 641030, India</div>
                  </div>
                </a>

                <div className="flex items-center gap-3 border-t border-border pt-4">
                  <Mail className="w-5 h-5 text-accent shrink-0" strokeWidth={1.5} />
                  <a href="mailto:contact@smrikaam.com" className="hover:text-accent font-normal text-text-muted hover:text-text transition-colors text-[15px]">
                    contact@smrikaam.com
                  </a>
                </div>

                <div className="flex items-center gap-3 border-t border-border pt-4">
                  <Phone className="w-5 h-5 text-accent shrink-0" strokeWidth={1.5} />
                  <a href="tel:+919150684601" className="hover:text-accent font-normal text-text-muted hover:text-text transition-colors text-[15px]">
                    +91 91506 84601
                  </a>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <a
                  href="https://wa.me/919150684601"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary w-full justify-center text-[14px] font-medium uppercase tracking-wider"
                >
                  CHAT ON WHATSAPP &rarr;
                </a>
              </div>
            </BlueprintWrapper>
          </Reveal>

          <Reveal index={2}>
            <BlueprintWrapper className="p-6 sm:p-8 bg-bg/90">
              <div className="text-[11px] text-accent uppercase tracking-widest mb-2 font-semibold">GUARANTEED SLA</div>
              <h4 className="font-heading text-xl font-semibold text-text mb-2">24 BUSINESS HOUR RESPONSE</h4>
              <p className="text-[15px] font-normal text-text-muted leading-[1.55]">
                Our engineering lead will evaluate your requirement details and prepare an initial technical architecture feasibility report prior to our first call.
              </p>
            </BlueprintWrapper>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

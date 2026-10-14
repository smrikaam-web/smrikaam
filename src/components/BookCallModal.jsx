import React, { useState, useEffect } from 'react';
import {
  X, Calendar, Clock, Send, CheckCircle2, AlertTriangle, Phone,
  Mail, Building, User, Briefcase, ChevronDown, Cpu
} from 'lucide-react';
import api from '../api';
import BlueprintWrapper from './BlueprintWrapper';

export function openBookCallModal(options = {}) {
  window.dispatchEvent(new CustomEvent('open-book-call-modal', { detail: options }));
}

export default function BookCallModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    jobTitle: '',
    service: 'Artificial Intelligence & Machine Learning',
    preferredDate: '',
    preferredTime: '10:00 AM - 12:00 PM',
    message: '',
    source: 'Book a Call Modal'
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handleOpen = (e) => {
      const detail = e.detail || {};
      setFormData((prev) => ({
        ...prev,
        service: detail.service || prev.service || 'Artificial Intelligence & Machine Learning',
        source: detail.source || 'Book a Call Modal'
      }));
      setSuccessMsg('');
      setErrorMsg('');
      setIsOpen(true);
    };

    window.addEventListener('open-book-call-modal', handleOpen);
    return () => window.removeEventListener('open-book-call-modal', handleOpen);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!formData.name || !formData.name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!formData.company || !formData.company.trim()) {
      setErrorMsg('Please enter your company name.');
      return;
    }
    if (!formData.email || !formData.email.trim() || !formData.email.includes('@')) {
      setErrorMsg('Please enter a valid work email address.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.post('/book-a-call', {
        name: formData.name.trim(),
        company: formData.company.trim(),
        email: formData.email.trim(),
        phone: formData.phone ? formData.phone.trim() : '',
        jobTitle: formData.jobTitle ? formData.jobTitle.trim() : '',
        service: formData.service || 'Artificial Intelligence & Machine Learning',
        preferredDate: formData.preferredDate || '',
        preferredTime: formData.preferredTime || '',
        message: formData.message ? formData.message.trim() : 'Book a Call Request',
        source: formData.source || 'Book a Call Modal'
      });

      setSuccessMsg(res.data?.message || 'Your strategy call request has been received. Our engineering leads will connect with you within 24 business hours.');
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        jobTitle: '',
        service: 'Artificial Intelligence & Machine Learning',
        preferredDate: '',
        preferredTime: '10:00 AM - 12:00 PM',
        message: '',
        source: 'Book a Call Modal'
      });
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message || 'Failed to submit call request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="relative w-full max-w-2xl my-auto">
        <BlueprintWrapper pulseCorners={true} className="bg-[var(--color-surface)] border border-[var(--color-border)] p-5 sm:p-8 md:p-10 shadow-2xl overflow-hidden text-[var(--color-text)] relative">
          {/* Close Button */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)] bg-black/10 dark:bg-white/10 hover:border-[var(--color-accent)] transition-all cursor-pointer z-20"
            aria-label="Close Book a Call Modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-6 md:mb-8 text-left pr-8">
            <div className="font-mono text-[10px] sm:text-[11px] text-[var(--color-accent)] uppercase tracking-[0.2em] font-semibold mb-1.5">
              SCHEDULE A TECHNICAL SESSION
            </div>
            <h2 id="modal-title" className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[var(--color-text)]">
              BOOK A STRATEGY CALL
            </h2>
            <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1.5 leading-relaxed max-w-xl">
              Connect directly with SMRIKAAM lead solution architects in Coimbatore. Select your preferred slot and project details.
            </p>
          </div>

          {/* Success Alert */}
          {successMsg ? (
            <div className="py-8 px-4 text-center border border-black dark:border-white bg-black/[0.03] dark:bg-white/[0.05] rounded-none space-y-4">
              <CheckCircle2 className="w-12 h-12 text-black dark:text-white mx-auto" />
              <h3 className="font-heading text-lg font-bold uppercase text-black dark:text-white">
                SESSION SCHEDULED
              </h3>
              <p className="text-sm text-[var(--color-text)] max-w-md mx-auto leading-relaxed">
                {successMsg}
              </p>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="btn btn-primary px-8 py-2.5 font-bold uppercase tracking-wider text-xs cursor-pointer mt-2"
              >
                CLOSE WINDOW
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-0">
              {errorMsg && (
                <div className="mb-5 p-3 border-l-4 border-neutral-600 dark:border-neutral-400 bg-black/[0.03] dark:bg-white/[0.05] text-xs text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-neutral-600 dark:text-neutral-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
                {/* 1. Full Name */}
                <div className="field">
                  <label htmlFor="modal-name" className="block text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5 text-left">
                    Full Name *
                  </label>
                  <div className="relative flex items-center w-full">
                    <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none z-10" />
                    <input
                      type="text"
                      id="modal-name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Ananya Sharma"
                      className="input has-icon-left h-10 w-full text-xs bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* 2. Company Name */}
                <div className="field">
                  <label htmlFor="modal-company" className="block text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5 text-left">
                    Company Name *
                  </label>
                  <div className="relative flex items-center w-full">
                    <Building className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none z-10" />
                    <input
                      type="text"
                      id="modal-company"
                      name="company"
                      required
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="e.g. Apex Enterprise"
                      className="input has-icon-left h-10 w-full text-xs bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* 3. Work Email */}
                <div className="field">
                  <label htmlFor="modal-email" className="block text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5 text-left">
                    Work Email *
                  </label>
                  <div className="relative flex items-center w-full">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none z-10" />
                    <input
                      type="email"
                      id="modal-email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="ananya@company.com"
                      className="input has-icon-left h-10 w-full text-xs bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* 4. Phone Number */}
                <div className="field">
                  <label htmlFor="modal-phone" className="block text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5 text-left">
                    Phone Number
                  </label>
                  <div className="relative flex items-center w-full">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none z-10" />
                    <input
                      type="tel"
                      id="modal-phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="input has-icon-left h-10 w-full text-xs bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* 5. Job Title / Role */}
                <div className="field">
                  <label htmlFor="modal-jobTitle" className="block text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5 text-left">
                    Job Title / Role
                  </label>
                  <div className="relative flex items-center w-full">
                    <Briefcase className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none z-10" />
                    <input
                      type="text"
                      id="modal-jobTitle"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleChange}
                      placeholder="e.g. CTO / Lead Architect"
                      className="input has-icon-left h-10 w-full text-xs bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* 6. Service Area of Interest */}
                <div className="field">
                  <label htmlFor="modal-service" className="block text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5 text-left">
                    Service Area of Interest *
                  </label>
                  <div className="relative flex items-center w-full">
                    <Cpu className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none z-10" />
                    <select
                      id="modal-service"
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      className="input has-icon-left has-icon-right h-10 w-full text-xs bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none transition-colors appearance-none cursor-pointer"
                    >
                      <option value="Artificial Intelligence & Machine Learning">Artificial Intelligence & ML</option>
                      <option value="Industrial IoT (IIoT)">Industrial IoT (IIoT) & Edge</option>
                      <option value="Enterprise Data Engineering">Enterprise Data Engineering</option>
                      <option value="Generative AI & LLM Systems">Generative AI & LLM Systems</option>
                      <option value="DevOps & Cloud Infrastructure">DevOps & Cloud Infrastructure</option>
                      <option value="Data Governance & Security">Data Governance & Security</option>
                      <option value="Integration Services">Integration Services</option>
                      <option value="ServiceNow Solutions">ServiceNow Solutions</option>
                      <option value="Technology Advisory">Technology Advisory</option>
                      <option value="Staffing Services">Staffing & Pod Augmentation</option>
                      <option value="Accelerator Demo">BitXhift / MigrateMax / ParseMaster Demo</option>
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none z-10" />
                  </div>
                </div>

                {/* 7. Preferred Date */}
                <div className="field">
                  <label htmlFor="modal-date" className="block text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5 text-left">
                    Preferred Date
                  </label>
                  <div className="relative flex items-center w-full">
                    <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none z-10" />
                    <input
                      type="date"
                      id="modal-date"
                      name="preferredDate"
                      min={new Date().toISOString().split('T')[0]}
                      value={formData.preferredDate}
                      onChange={handleChange}
                      className="input has-icon-left h-10 w-full text-xs bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none transition-colors cursor-pointer"
                    />
                  </div>
                </div>

                {/* 8. Preferred Time Slot */}
                <div className="field">
                  <label htmlFor="modal-time" className="block text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5 text-left">
                    Preferred Time Slot
                  </label>
                  <div className="relative flex items-center w-full">
                    <Clock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none z-10" />
                    <select
                      id="modal-time"
                      name="preferredTime"
                      value={formData.preferredTime}
                      onChange={handleChange}
                      className="input has-icon-left has-icon-right h-10 w-full text-xs bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none transition-colors appearance-none cursor-pointer"
                    >
                      <option value="10:00 AM - 12:00 PM">10:00 AM - 12:00 PM IST</option>
                      <option value="02:00 PM - 04:00 PM">02:00 PM - 04:00 PM IST</option>
                      <option value="04:00 PM - 06:00 PM">04:00 PM - 06:00 PM IST</option>
                      <option value="07:00 PM - 09:00 PM">07:00 PM - 09:00 PM IST (US / EU)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none z-10" />
                  </div>
                </div>
              </div>

              {/* 9. Project Details / Requirement Focus */}
              <div className="field mt-4 md:mt-5">
                <label htmlFor="modal-message" className="block text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-muted)] mb-1.5 text-left">
                  Project Details / Requirement Focus
                </label>
                <textarea
                  id="modal-message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Describe your current tech stack, machinery count, data goals, or transformation timeline..."
                  className="input w-full p-3 text-xs bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none transition-colors leading-relaxed resize-y"
                />
              </div>

              {/* 10. Submit Button */}
              <div className="mt-6 md:mt-8 flex justify-center">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary w-full sm:w-auto min-w-[280px] h-11 px-8 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      SUBMITTING REQUEST...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      CONFIRM &amp; BOOK SESSION <Send className="w-4 h-4" />
                    </span>
                  )}
                </button>
              </div>
            </form>
          )}
        </BlueprintWrapper>
      </div>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Linkedin, Instagram, Facebook, ChevronDown } from 'lucide-react';
import Logo from './Logo';
import { useCMS } from '../context/CMSContext';

export default function Footer() {
  const { services: cmsPublishedServices } = useCMS() || {};
  const [openSection, setOpenSection] = useState(null);

  const toggleSection = (key) => {
    setOpenSection((prev) => (prev === key ? null : key));
  };

  const defaultServices = [
    { name: 'Artificial Intelligence & Machine Learning', path: '/services/ai-ml' },
    { name: 'Industrial IoT (IIoT)', path: '/services/industrial-iot-iiot' },
    { name: 'Data Engineering & Modernization', path: '/services/data-engineering' },
    { name: 'Generative AI & Agentic AI', path: '/services/generative-agentic-ai' },
    { name: 'DevOps & Cloud Infrastructure', path: '/services/devops-cloud' },
    { name: 'Data Governance & Quality', path: '/services/data-governance' },
    { name: 'Integration Services', path: '/services/integration-services' },
    { name: 'ServiceNow Solutions', path: '/services/servicenow-solutions' },
    { name: 'Advisory Services', path: '/services/advisory-services' },
    { name: 'AI Workflow Automation', path: '/services/ai-workflow-automation' },
    { name: 'Staffing Services', path: '/staffing' }
  ];

  const servicesList = useMemo(() => {
    if (Array.isArray(cmsPublishedServices) && cmsPublishedServices.length > 0) {
      const list = cmsPublishedServices.map((s) => ({
        name: s.title || s.name,
        path: `/services/${s.slug}`
      }));
      return [...list, { name: 'Staffing Services', path: '/staffing' }];
    }
    return defaultServices;
  }, [cmsPublishedServices]);

  const acceleratorsList = [
    { name: 'BitXhift', path: '/products/bitxhift' },
    { name: 'MigrateMax', path: '/products/migratemax' },
    { name: 'ParseMaster', path: '/products/parsemaster' },
    { name: 'LinkGenX', path: '/products/linkgenx' }
  ];

  const industriesList = [
    { name: 'Manufacturing', path: '/industries/manufacturing' },
    { name: 'Energy & Utilities', path: '/industries/energy-utilities' },
    { name: 'Retail & E-Commerce', path: '/industries/retail-ecommerce' },
    { name: 'BFSI', path: '/industries/bfsi' },
    { name: 'Healthcare', path: '/industries/healthcare' },
    { name: 'Logistics', path: '/industries/logistics' },
    { name: 'Telecom', path: '/industries/telecom' },
    { name: 'Infrastructure', path: '/industries/infrastructure' },
    { name: 'Oil & Gas', path: '/industries/oil-gas' },
    { name: 'Media', path: '/industries/media' },
    { name: 'Electrical', path: '/industries/electrical' }
  ];

  const companyList = [
    { name: 'About Us', path: '/about' },
    { name: 'Case Studies', path: '/case-studies' },
    { name: 'Careers', path: '/careers' },
    { name: 'Contact', path: '/contact' }
  ];

  return (
    <footer className="relative z-10 border-t border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur-md pt-8 pb-8 text-[var(--color-text)]">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 mb-6">
        
        {/* Column 1: Brand + Contact Info */}
        <div className="lg:col-span-4 space-y-3">
          <Link to="/" className="inline-block mb-1">
            <Logo height={38} />
          </Link>

          <p className="text-[13px] font-normal text-[var(--color-text-secondary)] leading-[1.5] max-w-sm">
            Transforming factories, operations, and enterprise systems with AI-powered analytics, Industrial IoT, cloud engineering, and intelligent automation.
          </p>

          <div className="space-y-1.5 text-[12px] text-[var(--color-text-secondary)] border-t border-[var(--color-border)] pt-3">
            <div className="flex items-center gap-2.5">
              <Mail className="w-3.5 h-3.5 text-[var(--color-text)] shrink-0" strokeWidth={1.5} aria-hidden="true" />
              <a href="mailto:contact@smrikaam.com" className="hover:text-[var(--color-text)] transition-colors">
                contact@smrikaam.com
              </a>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-3.5 h-3.5 text-[var(--color-text)] shrink-0" strokeWidth={1.5} aria-hidden="true" />
              <a href="tel:+919150684601" className="hover:text-[var(--color-text)] transition-colors">
                +91-9150684601
              </a>
            </div>
            <a
              href="https://maps.app.goo.gl/kViWRBkDBqauRi8z7?g_st=ac"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open SMRIKAAM Technologies location in Google Maps"
              className="flex items-start gap-2.5 pt-0.5 group/footermap hover:text-[var(--color-text)] transition-colors cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5 text-[var(--color-text)] shrink-0 mt-0.5 group-hover/footermap:scale-110 transition-transform" strokeWidth={1.5} aria-hidden="true" />
              <div className="leading-[1.4]">
                <span className="font-semibold block text-[var(--color-text)]">SMRIKAAM Technologies LLP</span>
                <span className="text-[var(--color-text-secondary)] group-hover/footermap:text-[var(--color-text)] transition-colors">Coimbatore, Tamil Nadu, India</span>
              </div>
            </a>
          </div>
        </div>

        {/* Column 2: Services Navigation */}
        <div className="lg:col-span-2 border-b md:border-b-0 border-[var(--color-border)] pb-3 md:pb-0">
          <button
            type="button"
            onClick={() => toggleSection('services')}
            className="w-full flex items-center justify-between md:cursor-default text-xs font-semibold tracking-wider text-[var(--color-text)] uppercase mb-2 md:border-b md:border-[var(--color-border)] md:pb-1 text-left"
          >
            <span>Services</span>
            <ChevronDown className={`w-4 h-4 md:hidden transition-transform ${openSection === 'services' ? 'rotate-180' : ''}`} />
          </button>
          <ul className={`space-y-1.5 text-[12px] ${openSection === 'services' ? 'block' : 'hidden md:block'}`}>
            {servicesList.map((item, idx) => (
              <li key={idx}>
                <Link to={item.path} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors block py-0.5 md:py-0">
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Accelerators Navigation */}
        <div className="lg:col-span-2 border-b md:border-b-0 border-[var(--color-border)] pb-3 md:pb-0">
          <button
            type="button"
            onClick={() => toggleSection('accelerators')}
            className="w-full flex items-center justify-between md:cursor-default text-xs font-semibold tracking-wider text-[var(--color-text)] uppercase mb-2 md:border-b md:border-[var(--color-border)] md:pb-1 text-left"
          >
            <span>Accelerators</span>
            <ChevronDown className={`w-4 h-4 md:hidden transition-transform ${openSection === 'accelerators' ? 'rotate-180' : ''}`} />
          </button>
          <ul className={`space-y-1.5 text-[12px] ${openSection === 'accelerators' ? 'block' : 'hidden md:block'}`}>
            {acceleratorsList.map((item, idx) => (
              <li key={idx}>
                <Link to={item.path} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors block py-0.5 md:py-0">
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4: Industries Navigation */}
        <div className="lg:col-span-2 border-b md:border-b-0 border-[var(--color-border)] pb-3 md:pb-0">
          <button
            type="button"
            onClick={() => toggleSection('industries')}
            className="w-full flex items-center justify-between md:cursor-default text-xs font-semibold tracking-wider text-[var(--color-text)] uppercase mb-2 md:border-b md:border-[var(--color-border)] md:pb-1 text-left"
          >
            <span>Industries</span>
            <ChevronDown className={`w-4 h-4 md:hidden transition-transform ${openSection === 'industries' ? 'rotate-180' : ''}`} />
          </button>
          <ul className={`space-y-1 text-[11px] leading-[1.4] ${openSection === 'industries' ? 'block' : 'hidden md:block'}`}>
            {industriesList.map((item, idx) => (
              <li key={idx}>
                <Link to={item.path} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors block py-0.5 md:py-0">
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 5: Company & Cities */}
        <div className="lg:col-span-2 space-y-4">
          <div className="border-b md:border-b-0 border-[var(--color-border)] pb-3 md:pb-0">
            <button
              type="button"
              onClick={() => toggleSection('company')}
              className="w-full flex items-center justify-between md:cursor-default text-xs font-semibold tracking-wider text-[var(--color-text)] uppercase mb-2 md:border-b md:border-[var(--color-border)] md:pb-1 text-left"
            >
              <span>Company</span>
              <ChevronDown className={`w-4 h-4 md:hidden transition-transform ${openSection === 'company' ? 'rotate-180' : ''}`} />
            </button>
            <ul className={`space-y-1 text-[11px] leading-[1.4] ${openSection === 'company' ? 'block' : 'hidden md:block'}`}>
              {companyList.map((item, idx) => (
                <li key={idx}>
                  <Link to={item.path} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors block py-0.5 md:py-0">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-b md:border-b-0 border-[var(--color-border)] pb-3 md:pb-0">
            <button
              type="button"
              onClick={() => toggleSection('cities')}
              className="w-full flex items-center justify-between md:cursor-default text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1 text-left"
            >
              <span>CITIES WE SERVE</span>
              <ChevronDown className={`w-3.5 h-3.5 md:hidden transition-transform ${openSection === 'cities' ? 'rotate-180' : ''}`} />
            </button>
            <div className={`text-[11px] text-[var(--color-text-secondary)] leading-[1.35] ${openSection === 'cities' ? 'block' : 'hidden md:block'}`}>
              Coimbatore • Chennai • Bangalore • Hyderabad • Mumbai • Pune • Delhi / NCR
            </div>
          </div>

          <div>
            <div className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
              FOLLOW US
            </div>
            <div className="flex items-center gap-1.5">
              <a
                href="https://www.linkedin.com/company/143362970/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="SMRIKAAM on LinkedIn"
                className="w-7 h-7 border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)] transition-colors"
              >
                <Linkedin className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://x.com/smrikaam_tech"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="SMRIKAAM on X"
                className="w-7 h-7 border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)] transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/smrikaam_tech"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="SMRIKAAM on Instagram"
                className="w-7 h-7 border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)] transition-colors"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61593678981066"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="SMRIKAAM on Facebook"
                className="w-7 h-7 border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text)] hover:bg-[var(--color-surface-subtle)] transition-colors"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal & Copyright Strip */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 pt-4 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[var(--color-text-muted)] gap-2">
        <div>
          &copy; 2026 SMRIKAAM Technologies LLP. All rights reserved.
        </div>
        <div className="flex gap-4">
          <Link to="/contact" className="hover:text-[var(--color-text)] transition-colors">Privacy Policy</Link>
          <Link to="/contact" className="hover:text-[var(--color-text)] transition-colors">Terms of Service</Link>
          <Link to="/contact" className="hover:text-[var(--color-text)] transition-colors">Security</Link>
        </div>
      </div>
    </footer>
  );
}




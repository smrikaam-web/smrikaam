import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Layout & Components
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import BottomControlBar from './components/BottomControlBar';
import FixedScene3D from './components/FixedScene3D';
import IntroLoader from './components/IntroLoader';
import VerticalScrollRail from './components/VerticalScrollRail';
import BookCallModal from './components/BookCallModal';

// Animation System Imports
import PageTransition from './components/anim/PageTransition';

// CMS Context
import { CMSProvider } from './context/CMSContext';

// Public Pages
import Home from './pages/Home';
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Accelerators from './pages/Accelerators';
import Industries from './pages/Industries';
import IndustryDetail from './pages/IndustryDetail';
import CaseStudies from './pages/CaseStudies';
import CaseStudyDetail from './pages/CaseStudyDetail';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import Staffing from './pages/Staffing';
import About from './pages/About';
import Locations from './pages/Locations';
import Careers from './pages/Careers';
import Contact from './pages/Contact';
import GonePage from './pages/GonePage';

// Admin CMS Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout, { ADMIN_ROUTE_BASE } from './pages/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import ReportsManagerPage from './pages/admin/ReportsManagerPage';
import MediaLibraryView from './components/admin/MediaLibraryView';
import PublishingLifecyclePage from './pages/admin/PublishingLifecyclePage';
import SettingsPage from './pages/admin/SettingsPage';
import InboxPage from './pages/admin/InboxPage';
import AdminBookCallPage from './pages/admin/AdminBookCallPage';
import AdminBlogManager from './pages/admin/AdminBlogManager';
import AdminContentManager from './components/admin/AdminContentManager';
import RequireAuth from './components/RequireAuth';

// Field configs for Central CMS
const BLOG_FIELDS = [
  { name: 'title', label: 'Article Title', required: true, placeholder: 'e.g. Architecting Low-Latency IIoT Telemetry' },
  { name: 'slug', label: 'Slug (Auto-generated if empty)', placeholder: 'iiot-telemetry-architecture' },
  { name: 'category', label: 'Category', placeholder: 'e.g. Industrial IoT, Data Engineering, Generative AI' },
  { name: 'excerpt', label: 'Short Excerpt / Description', type: 'textarea', rows: 3, placeholder: 'Brief summary of the article...' },
  { name: 'content', label: 'Article Content (Rich Markdown)', type: 'richtext', required: true },
  { name: 'cover_image_url', label: 'Featured Image URL', placeholder: 'https://images.unsplash.com/...' },
  { name: 'tags', label: 'Tags', type: 'array', placeholder: 'IIoT, Telemetry, Cloud, Python' },
  { name: 'author', label: 'Author', placeholder: 'SMRIKAAM Engineering Team' },
  { name: 'meta_title', label: 'SEO Title Tag', placeholder: 'SEO Title for search engines' },
  { name: 'meta_description', label: 'SEO Meta Description', placeholder: 'Description for search engine snippets' },
  {
    name: 'status', label: 'Publishing Status', type: 'select', options: [
      { label: 'Published (Live on website)', value: 'published' },
      { label: 'Draft (Admin only)', value: 'draft' },
      { label: 'Archived', value: 'archived' }
    ]
  }
];

const SERVICE_FIELDS = [
  { name: 'title', label: 'Service Name', required: true, placeholder: 'e.g. Industrial IoT (IIoT)' },
  { name: 'slug', label: 'Slug', placeholder: 'industrial-iot-iiot' },
  { name: 'tagline', label: 'Tagline', placeholder: 'Edge machine connectivity and real-time telemetry.' },
  { name: 'summary', label: 'Short Summary', type: 'textarea', rows: 2, required: true },
  { name: 'description', label: 'Full Detailed Description', type: 'richtext', required: true },
  { name: 'cover_image_url', label: 'Hero Image URL', placeholder: 'https://images.unsplash.com/...' },
  { name: 'capabilities', label: 'Capabilities List', type: 'array', placeholder: 'OPC-UA Ingestion, Predictive Models, Floor Wallboards' },
  { name: 'technology', label: 'Technology Stack', type: 'array', placeholder: 'MQTT, TimescaleDB, Python, OPC-UA' },
  { name: 'industryApplications', label: 'Industry Applications', type: 'array', placeholder: 'Manufacturing, Energy, Heavy Industry' },
  { name: 'problemStatement', label: 'Problem Statement', type: 'textarea', rows: 2 },
  { name: 'solutionStatement', label: 'Solution Statement', type: 'textarea', rows: 2 },
  { name: 'outcomes', label: 'Business Outcomes', placeholder: '35% downtime reduction across connected machines.' },
  {
    name: 'status', label: 'Publishing Status', type: 'select', options: [
      { label: 'Published (Live on website)', value: 'published' },
      { label: 'Draft (Admin only)', value: 'draft' },
      { label: 'Archived', value: 'archived' }
    ]
  }
];

const ACCELERATOR_FIELDS = [
  { name: 'name', label: 'Product Name', required: true, placeholder: 'e.g. BitXhift' },
  { name: 'slug', label: 'Slug', placeholder: 'bitxhift' },
  { name: 'category', label: 'Category', placeholder: 'Industrial IoT' },
  { name: 'tagline', label: 'Tagline', placeholder: 'Industrial IoT & Edge Intelligence Accelerator' },
  { name: 'shortDescription', label: 'Short Description', type: 'textarea', rows: 2, required: true },
  { name: 'fullDescription', label: 'Full Description', type: 'richtext' },
  { name: 'cover_image_url', label: 'Cover / Hero Image URL', placeholder: 'https://images.unsplash.com/...' },
  { name: 'problem', label: 'Problem Solved', type: 'textarea', rows: 3 },
  { name: 'solution', label: 'Solution Provided', type: 'textarea', rows: 3 },
  { name: 'howItWorks', label: 'How It Works Pipeline', type: 'textarea', rows: 2 },
  { name: 'architecture', label: 'Architecture Overview', placeholder: 'Edge Containers + TimescaleDB + MQTT Event Bus' },
  { name: 'keyFeatures', label: 'Key Capabilities / Features', type: 'array', placeholder: 'Live OEE, Anomaly Detection, Energy Optimization' },
  { name: 'technology', label: 'Technology Stack', type: 'array', placeholder: 'MQTT, OPC-UA, Docker, TimescaleDB' },
  { name: 'useCases', label: 'Primary Use Cases', type: 'array', placeholder: 'CNC Telemetry, Vibration Detection' },
  { name: 'businessOutcomes', label: 'Business Outcomes', placeholder: '35% downtime reduction within 48 hours.' },
  { name: 'pdf_url', label: 'Attachment Document / PDF URL', placeholder: '/uploads/whitepaper.pdf' },
  {
    name: 'status', label: 'Publishing Status', type: 'select', options: [
      { label: 'Published (Live on website)', value: 'published' },
      { label: 'Draft (Admin only)', value: 'draft' },
      { label: 'Archived', value: 'archived' }
    ]
  }
];

const INDUSTRY_FIELDS = [
  { name: 'name', label: 'Industry Name', required: true, placeholder: 'e.g. Manufacturing' },
  { name: 'slug', label: 'Slug', placeholder: 'manufacturing' },
  { name: 'summary', label: 'Summary', type: 'textarea', rows: 2, required: true },
  { name: 'content', label: 'Detailed Description', type: 'richtext', required: true },
  { name: 'cover_image_url', label: 'Hero Image URL', placeholder: 'https://images.unsplash.com/...' },
  { name: 'businessProblems', label: 'Key Business Problems', type: 'array', placeholder: 'Machine downtime, Paper shift logs' },
  { name: 'solutions', label: 'Engineering Solutions', type: 'array', placeholder: 'Edge telemetry, OEE Wallboards' },
  { name: 'technology', label: 'Technologies Used', type: 'array', placeholder: 'OPC-UA, TimescaleDB, Python' },
  { name: 'useCases', label: 'Use Cases', type: 'array', placeholder: 'Automotive Lines, CNC Tooling' },
  {
    name: 'status', label: 'Publishing Status', type: 'select', options: [
      { label: 'Published (Live on website)', value: 'published' },
      { label: 'Draft (Admin only)', value: 'draft' },
      { label: 'Archived', value: 'archived' }
    ]
  }
];

const CASE_STUDY_FIELDS = [
  { name: 'title', label: 'Case Study Title', required: true, placeholder: 'e.g. Smart Factory Transformation for Automotive OEM' },
  { name: 'client_name', label: 'Client / Organization', required: true, placeholder: 'Tier-1 Automotive Manufacturer' },
  { name: 'slug', label: 'Slug', placeholder: 'smart-factory-manufacturing-transformation' },
  { name: 'industry', label: 'Industry Sector', placeholder: 'Manufacturing' },
  { name: 'location', label: 'Location / Region', placeholder: 'Coimbatore, Tamil Nadu' },
  { name: 'accelerator', label: 'Accelerator Used', placeholder: 'BitXhift IIoT Platform' },
  { name: 'relatedService', label: 'Related Service', placeholder: 'Industrial IoT (IIoT)' },
  { name: 'challenge', label: 'Business Challenge', type: 'textarea', rows: 3, required: true },
  { name: 'solution', label: 'Engineering Solution', type: 'textarea', rows: 3, required: true },
  { name: 'implementation', label: 'Implementation Details', type: 'textarea', rows: 3 },
  { name: 'results', label: 'Quantifiable Results', type: 'textarea', rows: 3 },
  { name: 'technologies', label: 'Technologies Used', type: 'array', placeholder: 'MQTT, OPC-UA, TimescaleDB, Python' },
  { name: 'cover_image_url', label: 'Hero Image URL', placeholder: 'https://images.unsplash.com/...' },
  { name: 'pdf_url', label: 'Downloadable PDF / DOCX Case Study URL', placeholder: '/uploads/case-study.pdf' },
  {
    name: 'status', label: 'Publishing Status', type: 'select', options: [
      { label: 'Published (Live on website)', value: 'published' },
      { label: 'Draft (Admin only)', value: 'draft' },
      { label: 'Archived', value: 'archived' }
    ]
  }
];

const STAFFING_FIELDS = [
  { name: 'title', label: 'Engagement Model / Role', required: true, placeholder: 'e.g. Temporary Staffing' },
  { name: 'slug', label: 'Slug', placeholder: 'temporary-staffing' },
  { name: 'subtitle', label: 'Subtitle / Tagline', placeholder: 'On-demand specialists for surge capacity and short-term programs.' },
  { name: 'desc', label: 'Detailed Description', type: 'textarea', rows: 3, required: true },
  { name: 'bullets', label: 'Key Capabilities / Deliverables', type: 'array', placeholder: '48–72h turnaround, Fully compliant' },
  {
    name: 'status', label: 'Publishing Status', type: 'select', options: [
      { label: 'Published (Live on website)', value: 'published' },
      { label: 'Draft (Admin only)', value: 'draft' },
      { label: 'Archived', value: 'archived' }
    ]
  }
];

const LOCATION_FIELDS = [
  { name: 'name', label: 'Location Name', required: true, placeholder: 'e.g. COIMBATORE HQ' },
  { name: 'slug', label: 'Slug', placeholder: 'coimbatore-hq' },
  { name: 'type', label: 'Location Type / Tag', placeholder: 'PRIMARY TECHNOLOGY & DELIVERY CENTER' },
  { name: 'address', label: 'Full Address', type: 'textarea', rows: 2, required: true, placeholder: 'No. 19, Nataraj Nagar, Koundampalayam, Coimbatore, Tamil Nadu 641030, India' },
  { name: 'email', label: 'Contact Email', placeholder: 'contact@smrikaam.com' },
  { name: 'phone', label: 'Contact Phone', placeholder: '+91 91506 84601' },
  { name: 'description', label: 'Location Description', type: 'textarea', rows: 2 },
  { name: 'capabilities', label: 'Engineering Capabilities / Divisions', type: 'array', placeholder: 'Industrial IoT Lab, Data Center, AI Lab' },
  {
    name: 'status', label: 'Publishing Status', type: 'select', options: [
      { label: 'Published (Live on website)', value: 'published' },
      { label: 'Draft (Admin only)', value: 'draft' },
      { label: 'Archived', value: 'archived' }
    ]
  }
];

function PublicLayout({ children }) {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    let title = 'SMRIKAAM Technologies | AI, Industrial IoT & Data Analytics';
    try {
      const seg = path.split('/').filter(Boolean);
      if (seg.length === 0) title = 'SMRIKAAM | Enterprise Technology & Engineering';
      else if (seg[0] === 'services') title = seg[1] ? 'Service | SMRIKAAM Technologies' : 'Services | SMRIKAAM Technologies';
      else if (seg[0] === 'products' || seg[0] === 'accelerators') title = seg[1] ? 'Product | SMRIKAAM Technologies' : 'Products & Accelerators | SMRIKAAM Technologies';
      else if (seg[0] === 'industries') title = seg[1] ? 'Industry | SMRIKAAM Technologies' : 'Industries | SMRIKAAM Technologies';
      else if (seg[0] === 'case-studies') title = seg[1] ? 'Case Study | SMRIKAAM Technologies' : 'Case Studies | SMRIKAAM Technologies';
      else if (seg[0] === 'blog') title = seg[1] ? 'Blog | SMRIKAAM Technologies' : 'Blog | SMRIKAAM Technologies';
      else if (seg[0] === 'about') title = 'About | SMRIKAAM Technologies';
      else if (seg[0] === 'contact') title = 'Contact | SMRIKAAM Technologies';
      else if (seg[0] === 'locations') title = 'Locations | SMRIKAAM Technologies';
      else if (seg[0] === 'careers') title = 'Careers | SMRIKAAM Technologies';
      else if (seg[0] === 'staffing') title = 'Staffing | SMRIKAAM Technologies';
    } catch (e) { /* keep default */ }
    if (document.title !== title) document.title = title;
  }, [location.pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Scroll Progress Bar Tracking
    const progressBar = document.getElementById('scroll-progress-bar');
    let scrollRaf = null;

    const handleScroll = () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        if (progressBar) {
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = totalHeight > 0 ? window.scrollY / totalHeight : 0;
          progressBar.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`;
        }
        scrollRaf = null;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // 2. Cursor Spotlight & Magnetic CTA
    if (window.matchMedia('(hover: hover)').matches) {
      let mouseRaf = null;
      let lastX = -999;
      let lastY = -999;

      const handleMouseMove = (e) => {
        lastX = e.clientX;
        lastY = e.clientY;

        if (!mouseRaf) {
          mouseRaf = requestAnimationFrame(() => {
            document.documentElement.style.setProperty('--cursor-x', `${lastX}px`);
            document.documentElement.style.setProperty('--cursor-y', `${lastY}px`);

            const targetBtn = e.target && e.target.closest ? e.target.closest('.btn-primary, .btn-secondary') : null;
            if (targetBtn) {
              const rect = targetBtn.getBoundingClientRect();
              const dx = (lastX - (rect.left + rect.width / 2)) * 0.12;
              const dy = (lastY - (rect.top + rect.height / 2)) * 0.12;
              const clampedX = Math.max(-3, Math.min(3, dx));
              const clampedY = Math.max(-3, Math.min(3, dy));
              targetBtn.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
            }

            mouseRaf = null;
          });
        }
      };

      const handleMouseOut = (e) => {
        const targetBtn = e.target && e.target.closest ? e.target.closest('.btn-primary, .btn-secondary') : null;
        if (targetBtn) {
          targetBtn.style.transform = '';
        }
      };

      window.addEventListener('mousemove', handleMouseMove, { passive: true });
      window.addEventListener('mouseout', handleMouseOut, { passive: true });

      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseout', handleMouseOut);
        if (scrollRaf) cancelAnimationFrame(scrollRaf);
        if (mouseRaf) cancelAnimationFrame(mouseRaf);
      };
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollRaf) cancelAnimationFrame(scrollRaf);
    };
  }, []);

  return (
    <div className="app-root-overflow relative min-h-screen bg-bg text-text selection:bg-accent selection:text-[var(--accent-contrast)]">
      {/* 2px Scroll Progress Bar */}
      <div id="scroll-progress-bar" className="scroll-progress-bar" style={{ transform: 'scaleX(0)' }} aria-hidden="true" />
      {/* Ambient Cursor Spotlight Layer */}
      <div className="cursor-spotlight-layer hidden md:block" aria-hidden="true" />
      <IntroLoader />
      <FixedScene3D />
      <NavBar />
      <VerticalScrollRail />
      <main className="relative z-10 xl:pl-12">{children}</main>
      <Footer />
      <BottomControlBar />
    </div>
  );
}

export default function App() {
  return (
    <CMSProvider>
      <BrowserRouter>
        <PageTransition>
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
            <Route path="/services/:slug" element={<PublicLayout><ServiceDetail /></PublicLayout>} />
            <Route path="/products" element={<PublicLayout><Products /></PublicLayout>} />
            <Route path="/products/:slug" element={<PublicLayout><ProductDetail /></PublicLayout>} />
            <Route path="/accelerators" element={<PublicLayout><Products /></PublicLayout>} />
            <Route path="/accelerators/:slug" element={<PublicLayout><ProductDetail /></PublicLayout>} />
            <Route path="/industries" element={<PublicLayout><Industries /></PublicLayout>} />
            <Route path="/industries/:slug" element={<PublicLayout><IndustryDetail /></PublicLayout>} />
            <Route path="/case-studies" element={<PublicLayout><CaseStudies /></PublicLayout>} />
            <Route path="/case-studies/:slug" element={<PublicLayout><CaseStudyDetail /></PublicLayout>} />
            <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
            <Route path="/blog/:slug" element={<PublicLayout><BlogDetail /></PublicLayout>} />
            <Route path="/staffing" element={<PublicLayout><Staffing /></PublicLayout>} />
            <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
            <Route path="/locations" element={<PublicLayout><Locations /></PublicLayout>} />
            <Route path="/careers" element={<PublicLayout><Careers /></PublicLayout>} />
            <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />

            {/* REMOVED SERVICE PAGES (410 GONE) */}
            <Route path="/services/integration-services/sap.html" element={<PublicLayout><GonePage /></PublicLayout>} />
            <Route path="/services/integration-services/api.html" element={<PublicLayout><GonePage /></PublicLayout>} />

            {/* ADMIN CMS ROUTES */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path={`${ADMIN_ROUTE_BASE}/login`} element={<AdminLogin />} />
            <Route path="/smk-console-x9k2m7/login" element={<Navigate to={`${ADMIN_ROUTE_BASE}/login`} replace />} />
            <Route path="/smk-console-x9k2m7/*" element={<Navigate to={ADMIN_ROUTE_BASE} replace />} />

            <Route
              path={ADMIN_ROUTE_BASE}
              element={
                <RequireAuth>
                  <AdminLayout />
                </RequireAuth>
              }
            >
              <Route index element={<Navigate to={`${ADMIN_ROUTE_BASE}/dashboard`} replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route
                path="blogs"
                element={<AdminContentManager resource="posts" title="Blog Articles" fields={BLOG_FIELDS} />}
              />
              <Route
                path="posts"
                element={<Navigate to={`${ADMIN_ROUTE_BASE}/blogs`} replace />}
              />
              <Route
                path="services"
                element={<AdminContentManager resource="services" title="Services" fields={SERVICE_FIELDS} />}
              />
              <Route
                path="accelerators"
                element={<AdminContentManager resource="accelerators" title="Products" fields={ACCELERATOR_FIELDS} />}
              />
              <Route
                path="products"
                element={<Navigate to={`${ADMIN_ROUTE_BASE}/accelerators`} replace />}
              />
              <Route
                path="industries"
                element={<AdminContentManager resource="industries" title="Industries" fields={INDUSTRY_FIELDS} />}
              />
              <Route
                path="case-studies"
                element={<AdminContentManager resource="case-studies" title="Case Studies" fields={CASE_STUDY_FIELDS} />}
              />
              <Route
                path="staffing"
                element={<AdminContentManager resource="staffing" title="Staffing Models & Roles" fields={STAFFING_FIELDS} />}
              />
              <Route
                path="locations"
                element={<AdminContentManager resource="locations" title="Locations & Facilities" fields={LOCATION_FIELDS} />}
              />
              <Route path="reports" element={<ReportsManagerPage />} />
              <Route path="media" element={<MediaLibraryView />} />
              <Route path="drafts" element={<PublishingLifecyclePage viewType="draft" />} />
              <Route path="published" element={<PublishingLifecyclePage viewType="published" />} />
              <Route path="trash" element={<PublishingLifecyclePage viewType="trash" />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="inbox" element={<InboxPage />} />
              <Route path="book-a-call" element={<AdminBookCallPage />} />
            </Route>

            {/* Protected Admin Routes for /admin */}
            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <AdminLayout />
                </RequireAuth>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="book-a-call" element={<AdminBookCallPage />} />
              <Route path="enquiries" element={<AdminBookCallPage />} />
              <Route path="blogs" element={<AdminBlogManager />} />
              <Route path="services" element={<AdminContentManager resource="services" title="Services" fields={SERVICE_FIELDS} />} />
              <Route path="accelerators" element={<AdminContentManager resource="accelerators" title="Products" fields={ACCELERATOR_FIELDS} />} />
              <Route path="products" element={<Navigate to="/admin/accelerators" replace />} />
              <Route path="industries" element={<AdminContentManager resource="industries" title="Industries" fields={INDUSTRY_FIELDS} />} />
              <Route path="case-studies" element={<AdminContentManager resource="case-studies" title="Case Studies" fields={CASE_STUDY_FIELDS} />} />
              <Route path="staffing" element={<AdminContentManager resource="staffing" title="Staffing Models & Roles" fields={STAFFING_FIELDS} />} />
              <Route path="locations" element={<AdminContentManager resource="locations" title="Locations & Facilities" fields={LOCATION_FIELDS} />} />
              <Route path="reports" element={<ReportsManagerPage />} />
              <Route path="media" element={<MediaLibraryView />} />
              <Route path="drafts" element={<PublishingLifecyclePage viewType="draft" />} />
              <Route path="published" element={<PublishingLifecyclePage viewType="published" />} />
              <Route path="trash" element={<PublishingLifecyclePage viewType="trash" />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="inbox" element={<InboxPage />} />
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PageTransition>
      </BrowserRouter>
      <BookCallModal />
    </CMSProvider>
  );
}

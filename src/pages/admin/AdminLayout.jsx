import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Cpu, Zap, Factory, Briefcase, FileBarChart,
  Image as ImageIcon, CheckCircle, Clock, Trash2, Settings, LogOut, Menu, X,
  Users, MapPin, PhoneCall, Globe, ExternalLink, User
} from 'lucide-react';
import api from '../../api';
import Logo from '../../components/Logo';

import { ADMIN_ROUTE_BASE } from '../../constants/admin';
export { ADMIN_ROUTE_BASE };

const routeTitles = {
  [`${ADMIN_ROUTE_BASE}/dashboard`]: 'Dashboard',
  [`${ADMIN_ROUTE_BASE}/book-a-call`]: 'Book a Call / Demo Leads',
  [`${ADMIN_ROUTE_BASE}/visitors`]: 'Visitor Intelligence',
  [`${ADMIN_ROUTE_BASE}/blogs`]: 'Blog Articles',
  [`${ADMIN_ROUTE_BASE}/services`]: 'Services',
  [`${ADMIN_ROUTE_BASE}/accelerators`]: 'Products & Accelerators',
  [`${ADMIN_ROUTE_BASE}/industries`]: 'Industries',
  [`${ADMIN_ROUTE_BASE}/case-studies`]: 'Case Studies',
  [`${ADMIN_ROUTE_BASE}/reports`]: 'Flash Reports',
  [`${ADMIN_ROUTE_BASE}/staffing`]: 'Staffing Solutions',
  [`${ADMIN_ROUTE_BASE}/locations`]: 'Global Locations',
  [`${ADMIN_ROUTE_BASE}/media`]: 'Media & Documents',
  [`${ADMIN_ROUTE_BASE}/drafts`]: 'Draft Publications',
  [`${ADMIN_ROUTE_BASE}/published`]: 'Live Publications',
  [`${ADMIN_ROUTE_BASE}/trash`]: 'Trash Bin',
  [`${ADMIN_ROUTE_BASE}/settings`]: 'Site Settings',
};

export default function AdminLayout() {
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function fetchData() {
      try {
        const [userRes, statsRes] = await Promise.all([
          api.get('/auth/me').catch(() => null),
          api.get('/stats').catch(() => null)
        ]);

        if (userRes?.data?.user) {
          setUser(userRes.data.user);
        } else {
          setUser(null);
        }

        if (statsRes?.data?.newBookCalls !== undefined) {
          setUnreadCount(statsRes.data.newBookCalls);
        }
      } catch (err) {
        setUser(null);
      }
    }
    fetchData();
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      localStorage.removeItem('smrikaam_admin_token');
      navigate(`${ADMIN_ROUTE_BASE}/login`);
    }
  };

  const navSections = [
    {
      title: 'OVERVIEW',
      items: [
        { label: 'Dashboard', path: `${ADMIN_ROUTE_BASE}/dashboard`, icon: LayoutDashboard }
      ]
    },
    {
      title: 'LEADS & ENQUIRIES',
      items: [
        { label: 'Book a Call', path: `${ADMIN_ROUTE_BASE}/book-a-call`, icon: PhoneCall, badge: unreadCount },
        { label: 'Visitor Intelligence', path: `${ADMIN_ROUTE_BASE}/visitors`, icon: Globe }
      ]
    },
    {
      title: 'CONTENT',
      items: [
        { label: 'Blog Articles', path: `${ADMIN_ROUTE_BASE}/blogs`, icon: FileText },
        { label: 'Services', path: `${ADMIN_ROUTE_BASE}/services`, icon: Cpu },
        { label: 'Products', path: `${ADMIN_ROUTE_BASE}/accelerators`, icon: Zap },
        { label: 'Industries', path: `${ADMIN_ROUTE_BASE}/industries`, icon: Factory },
        { label: 'Case Studies', path: `${ADMIN_ROUTE_BASE}/case-studies`, icon: Briefcase },
        { label: 'Flash Reports', path: `${ADMIN_ROUTE_BASE}/reports`, icon: FileBarChart },
        { label: 'Staffing', path: `${ADMIN_ROUTE_BASE}/staffing`, icon: Users },
        { label: 'Locations', path: `${ADMIN_ROUTE_BASE}/locations`, icon: MapPin }
      ]
    },
    {
      title: 'ASSETS',
      items: [
        { label: 'Media & Documents', path: `${ADMIN_ROUTE_BASE}/media`, icon: ImageIcon }
      ]
    },
    {
      title: 'PUBLISHING',
      items: [
        { label: 'Drafts', path: `${ADMIN_ROUTE_BASE}/drafts`, icon: Clock },
        { label: 'Published', path: `${ADMIN_ROUTE_BASE}/published`, icon: CheckCircle },
        { label: 'Trash', path: `${ADMIN_ROUTE_BASE}/trash`, icon: Trash2 }
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { label: 'Site Settings', path: `${ADMIN_ROUTE_BASE}/settings`, icon: Settings }
      ]
    }
  ];

  const isActive = (path) => location.pathname === path;
  const currentTitle = routeTitles[location.pathname] || 'Admin Workspace';

  return (
    <div className="admin-theme min-h-screen flex flex-col md:flex-row bg-[#FFFFFF] text-[#111111] font-sans">
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-[#E5E5E5] z-30">
        <Logo height={32} isLightBackground={true} />
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-2 border border-[#E5E5E5] text-[#111111] hover:bg-[#F7F7F7] transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Left Sidebar Nav */}
      <aside
        className={`w-full md:w-64 bg-white border-r border-[#E5E5E5] p-5 flex flex-col justify-between shrink-0 fixed md:static inset-y-0 left-0 z-40 transform transition-transform duration-200 overflow-y-auto ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="pb-5 mb-5 border-b border-[#E5E5E5] flex items-center justify-between">
            <div>
              <Logo height={34} isLightBackground={true} />
              <div className="font-mono text-[10px] text-[#888888] uppercase tracking-[0.18em] font-semibold mt-2.5">
                ADMIN CENTRAL v2.0
              </div>
            </div>
            <button
              onClick={() => setMobileNavOpen(false)}
              className="md:hidden text-[#666666] hover:text-[#111111]"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Sections */}
          <nav className="space-y-6">
            {navSections.map((sec) => (
              <div key={sec.title}>
                <div className="font-mono text-[10px] font-bold text-[#888888] uppercase tracking-[0.15em] px-3 mb-2">
                  {sec.title}
                </div>
                <div className="space-y-1">
                  {sec.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileNavOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 text-xs font-mono uppercase tracking-wider transition-colors ${
                          active
                            ? 'bg-[#111111] text-[#FFFFFF] font-bold'
                            : 'text-[#333333] hover:text-[#111111] hover:bg-[#F7F7F7]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge > 0 && (
                          <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full font-mono ${
                            active ? 'bg-white text-[#111111]' : 'bg-[#111111] text-white'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* User profile & Logout */}
        <div className="pt-5 mt-6 border-t border-[#E5E5E5]">
          {user && (
            <div className="mb-3 px-1">
              <div className="font-mono text-xs font-bold text-[#111111]">{user.name}</div>
              <div className="font-mono text-[10px] text-[#666666] truncate">{user.email}</div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="admin-btn w-full justify-center text-xs py-2 text-[#555555] hover:text-[#111111] hover:border-[#111111] cursor-pointer flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.5} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area with Compact Top Bar */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#FFFFFF]">
        {/* Compact Top Bar */}
        <header className="h-14 bg-white border-b border-[#E5E5E5] px-6 hidden md:flex items-center justify-between shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-[#888888] uppercase tracking-wider">
              SMRIKAAM ADMIN /
            </span>
            <span className="font-mono text-xs font-bold text-[#111111] uppercase tracking-wider">
              {currentTitle}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs font-mono text-[#555555] hover:text-[#111111] px-2.5 py-1 border border-[#E5E5E5] hover:border-[#111111] transition-colors"
              title="Open public website in a new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Live Site</span>
            </a>

            {user && (
              <div className="flex items-center gap-2 pl-3 border-l border-[#E5E5E5]">
                <div className="w-6 h-6 rounded-full bg-[#111111] text-white flex items-center justify-center text-[10px] font-mono font-bold">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="font-mono text-xs text-[#111111] font-medium hidden lg:inline">
                  {user.name}
                </div>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="p-1.5 text-[#666666] hover:text-[#111111] hover:bg-[#F7F7F7] transition-colors cursor-pointer"
              title="Sign Out"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </header>

        {/* Main Workspace */}
        <main className="flex-grow p-4 sm:p-6 md:p-8 overflow-y-auto bg-[#FFFFFF] min-w-0 w-full max-w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

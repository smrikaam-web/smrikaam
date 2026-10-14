import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Cpu, Zap, Factory, Briefcase, FileBarChart,
  Image as ImageIcon, CheckCircle, Clock, Trash2, Settings, LogOut, Menu, X,
  Users, MapPin, PhoneCall
} from 'lucide-react';
import api from '../../api';
import Logo from '../../components/Logo';

import { ADMIN_ROUTE_BASE } from '../../constants/admin';
export { ADMIN_ROUTE_BASE };

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
        { label: 'Book a Call', path: `${ADMIN_ROUTE_BASE}/book-a-call`, icon: PhoneCall, badge: unreadCount }
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

  return (
    <div className="admin-theme min-h-screen flex flex-col md:flex-row bg-[var(--admin-bg)] text-[var(--admin-text-primary)] font-sans">
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[var(--admin-surface)] border-b border-[var(--admin-border)] z-30">
        <Logo height={32} dark />
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-2 border border-[var(--admin-border)] text-white hover:bg-[var(--admin-surface-hover)] transition-colors"
        >
          {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Nav */}
      <aside
        className={`w-full md:w-64 bg-[var(--admin-surface)] border-r border-[var(--admin-border)] p-5 flex flex-col justify-between shrink-0 fixed md:static inset-y-0 left-0 z-40 transform transition-transform duration-200 overflow-y-auto ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="pb-5 mb-5 border-b border-[var(--admin-border)] flex items-center justify-between">
            <div>
              <Logo height={36} dark />
              <div className="font-mono text-[10px] text-white uppercase tracking-[0.2em] font-semibold mt-2">
                SMRIKAAM CMS v2.0 • CENTRAL
              </div>
            </div>
            <button
              onClick={() => setMobileNavOpen(false)}
              className="md:hidden text-[var(--admin-text-secondary)] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Sections */}
          <nav className="space-y-6">
            {navSections.map((sec) => (
              <div key={sec.title}>
                <div className="font-mono text-[10px] font-bold text-[var(--admin-text-secondary)] uppercase tracking-[0.15em] px-3 mb-2">
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
                            ? 'bg-[var(--admin-surface-hover)] text-white border-l-4 border-white font-bold'
                            : 'text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] hover:bg-[var(--admin-surface-hover)]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge > 0 && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-white text-black rounded-full font-mono">
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
        <div className="pt-5 mt-6 border-t border-[var(--admin-border)]">
          {user && (
            <div className="mb-3 px-1">
              <div className="font-mono text-xs font-bold text-[var(--admin-text-primary)]">{user.name}</div>
              <div className="font-mono text-[10px] text-[var(--admin-text-secondary)] truncate">{user.email}</div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="admin-btn w-full justify-center text-xs py-2 text-neutral-400 hover:text-white hover:border-white/50 cursor-pointer"
          >
            <LogOut className="w-4 h-4 inline mr-1.5" strokeWidth={1.5} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-grow p-4 sm:p-6 md:p-10 overflow-y-auto bg-[var(--admin-bg)] min-w-0 w-full max-w-full">
        <Outlet />
      </main>
    </div>
  );
}

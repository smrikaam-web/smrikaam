import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, FileText, Cpu, Zap, Factory, Briefcase, FileBarChart,
  Image as ImageIcon, CheckCircle, Clock, Trash2, Settings, LogOut, Menu, X,
  Users, MapPin
} from 'lucide-react';
import api from '../../api';
import Logo from '../../components/Logo';

export const ADMIN_ROUTE_BASE = '/smrikaam-admin';

export default function AdminLayout() {
  const [user, setUser] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await api.get('/auth/me');
        if (res.data?.user) {
          setUser(res.data.user);
        } else {
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      }
    }
    fetchUser();
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
    <div className="admin-theme min-h-screen flex flex-col md:flex-row bg-[#0b0e14] text-[#f4f4f4] font-sans">
      {/* Mobile Topbar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#141924] border-b border-[rgba(255,255,255,0.15)] z-30">
        <Logo height={32} dark />
        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-2 border border-[rgba(255,255,255,0.2)] text-white"
        >
          {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Nav */}
      <aside
        className={`w-full md:w-64 bg-[#141924] border-r border-[rgba(255,255,255,0.15)] p-5 flex flex-col justify-between shrink-0 fixed md:static inset-y-0 left-0 z-40 transform transition-transform duration-200 overflow-y-auto ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="pb-5 mb-5 border-b border-[rgba(255,255,255,0.15)] flex items-center justify-between">
            <div>
              <Logo height={36} dark />
              <div className="font-mono text-[10px] text-[#4fd1c5] uppercase tracking-widest mt-2">
                SMRIKAAM CMS v2.0 • CENTRAL
              </div>
            </div>
            <button
              onClick={() => setMobileNavOpen(false)}
              className="md:hidden text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Sections */}
          <nav className="space-y-6">
            {navSections.map((sec) => (
              <div key={sec.title}>
                <div className="font-mono text-[10px] font-bold text-[#9aa3b5] uppercase tracking-widest px-3 mb-2">
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
                        className={`flex items-center gap-3 px-3 py-2 text-xs font-mono uppercase tracking-wider transition-colors ${
                          active
                            ? 'bg-[#1c2333] text-[#4fd1c5] border-l-4 border-[#4fd1c5] font-bold'
                            : 'text-[#9aa3b5] hover:text-[#f4f4f4] hover:bg-[#1c2333]'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* User profile & Logout */}
        <div className="pt-5 mt-6 border-t border-[rgba(255,255,255,0.15)]">
          {user && (
            <div className="mb-3 px-1">
              <div className="font-mono text-xs font-bold text-[#f4f4f4]">{user.name}</div>
              <div className="font-mono text-[10px] text-[#9aa3b5] truncate">{user.email}</div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="admin-btn w-full justify-center text-xs py-2 text-rose-400 hover:text-rose-300 hover:border-rose-500/50"
          >
            <LogOut className="w-4 h-4 inline mr-1.5" strokeWidth={1.5} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-grow p-6 md:p-10 overflow-y-auto bg-[#0b0e14] min-w-0">
        <Outlet />
      </main>
    </div>
  );
}

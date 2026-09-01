import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Cpu, Zap, Factory, Briefcase, FileBarChart,
  Plus, CheckCircle, Clock, Trash2, ArrowUpRight, Activity, Image as ImageIcon
} from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import { ADMIN_ROUTE_BASE } from './AdminLayout';
import BlueprintWrapper from '../../components/BlueprintWrapper';

export default function DashboardPage() {
  const { refreshTrigger } = useCMS();
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalServices: 0,
    totalAccelerators: 0,
    totalIndustries: 0,
    totalCaseStudies: 0,
    totalReports: 0,
    totalMedia: 0,
    published: 0,
    drafts: 0,
    trash: 0
  });

  const [activityLogs, setActivityLogs] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('smrikaam_admin_token');
      const headers = { Authorization: `Bearer ${token || ''}` };

      const [statsRes, logsRes, postsRes] = await Promise.all([
        fetch('/api/stats', { headers }).then((r) => r.json()),
        fetch('/api/activity-logs', { headers }).then((r) => r.json()),
        fetch('/api/posts/admin/all?limit=5', { headers }).then((r) => r.json())
      ]);

      if (statsRes && !statsRes.error) setStats(statsRes);
      if (Array.isArray(logsRes)) setActivityLogs(logsRes);
      if (Array.isArray(postsRes)) setRecentPosts(postsRes);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [refreshTrigger]);

  const statCards = [
    { label: 'Blog Posts', count: stats.totalPosts, icon: FileText, path: `${ADMIN_ROUTE_BASE}/blogs`, color: 'text-blue-400' },
    { label: 'Services', count: stats.totalServices, icon: Cpu, path: `${ADMIN_ROUTE_BASE}/services`, color: 'text-teal-400' },
    { label: 'Accelerators', count: stats.totalAccelerators, icon: Zap, path: `${ADMIN_ROUTE_BASE}/accelerators`, color: 'text-amber-400' },
    { label: 'Industries', count: stats.totalIndustries, icon: Factory, path: `${ADMIN_ROUTE_BASE}/industries`, color: 'text-purple-400' },
    { label: 'Case Studies', count: stats.totalCaseStudies, icon: Briefcase, path: `${ADMIN_ROUTE_BASE}/case-studies`, color: 'text-emerald-400' },
    { label: 'Flash Reports', count: stats.totalReports, icon: FileBarChart, path: `${ADMIN_ROUTE_BASE}/reports`, color: 'text-rose-400' }
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="border-b border-[rgba(255,255,255,0.15)] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-xs text-[#4fd1c5] uppercase tracking-widest mb-1">
            CONTROL ROOM — OVERVIEW
          </div>
          <h1 className="font-heading text-3xl font-bold uppercase text-[#f4f4f4]">
            CMS DASHBOARD
          </h1>
        </div>

        {/* Quick Create Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link to={`${ADMIN_ROUTE_BASE}/blogs`} className="btn btn-primary text-xs py-2 px-3">
            <Plus className="w-3.5 h-3.5 mr-1" /> New Blog
          </Link>
          <Link to={`${ADMIN_ROUTE_BASE}/reports`} className="btn btn-primary text-xs py-2 px-3">
            <Plus className="w-3.5 h-3.5 mr-1" /> New Flash Report
          </Link>
          <Link to={`${ADMIN_ROUTE_BASE}/services`} className="admin-btn text-xs py-2 px-3">
            <Plus className="w-3.5 h-3.5 mr-1" /> Service
          </Link>
          <Link to={`${ADMIN_ROUTE_BASE}/media`} className="admin-btn text-xs py-2 px-3">
            <ImageIcon className="w-3.5 h-3.5 mr-1" /> Upload Media
          </Link>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {statCards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.label}
              to={c.path}
              className="bg-[#141924] border border-[rgba(255,255,255,0.15)] p-4 hover:border-[#4fd1c5] transition-colors group block"
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-4 h-4 ${c.color}`} />
                <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#4fd1c5] transition-colors" />
              </div>
              <div className="font-heading text-2xl font-bold text-[#f4f4f4]">
                {loading ? '—' : c.count}
              </div>
              <div className="font-mono text-[10px] text-[#9aa3b5] uppercase tracking-wider mt-1">
                {c.label}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Lifecycle Status Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to={`${ADMIN_ROUTE_BASE}/published`}
          className="bg-[#141924] border border-emerald-500/30 p-4 flex items-center justify-between hover:bg-[#1c2333] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="font-heading text-xl font-bold text-emerald-300">
                {loading ? '—' : stats.published}
              </div>
              <div className="font-mono text-[10px] text-gray-400 uppercase tracking-wider">
                Total Published Items
              </div>
            </div>
          </div>
          <span className="font-mono text-xs text-emerald-400">View All →</span>
        </Link>

        <Link
          to={`${ADMIN_ROUTE_BASE}/drafts`}
          className="bg-[#141924] border border-amber-500/30 p-4 flex items-center justify-between hover:bg-[#1c2333] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="font-heading text-xl font-bold text-amber-300">
                {loading ? '—' : stats.drafts}
              </div>
              <div className="font-mono text-[10px] text-gray-400 uppercase tracking-wider">
                Drafts in Progress
              </div>
            </div>
          </div>
          <span className="font-mono text-xs text-amber-400">View Drafts →</span>
        </Link>

        <Link
          to={`${ADMIN_ROUTE_BASE}/trash`}
          className="bg-[#141924] border border-rose-500/30 p-4 flex items-center justify-between hover:bg-[#1c2333] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-rose-950/80 border border-rose-500/50 flex items-center justify-center text-rose-400">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-heading text-xl font-bold text-rose-300">
                {loading ? '—' : stats.trash}
              </div>
              <div className="font-mono text-[10px] text-gray-400 uppercase tracking-wider">
                Trash &amp; Soft Deleted
              </div>
            </div>
          </div>
          <span className="font-mono text-xs text-rose-400">View Trash →</span>
        </Link>
      </div>

      {/* 2-Column Split: Recent Activity + Recently Updated */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Column 1: Real-time Activity Log (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.15)] pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#4fd1c5]" />
              <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-[#f4f4f4]">
                RECENT ACTIVITY AUDIT
              </h2>
            </div>
            <span className="font-mono text-[10px] text-gray-400">
              AUTO-AUDIT LOGS
            </span>
          </div>

          <div className="space-y-2.5">
            {activityLogs.length === 0 ? (
              <div className="p-6 bg-[#141924] border border-[rgba(255,255,255,0.1)] text-center font-mono text-xs text-gray-400">
                NO RECENT ACTIVITY LOGGED.
              </div>
            ) : (
              activityLogs.slice(0, 7).map((log) => (
                <div
                  key={log.id}
                  className="bg-[#141924] border border-[rgba(255,255,255,0.1)] p-3.5 flex items-start justify-between gap-4 font-mono text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-[#f4f4f4]">{log.title}</div>
                    <div className="text-[11px] text-[#9aa3b5]">{log.description}</div>
                  </div>
                  <div className="px-2 py-0.5 bg-[#1c2333] border border-[rgba(255,255,255,0.15)] text-[10px] text-[#4fd1c5] shrink-0 font-bold">
                    {log.date}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Recently Updated Articles & Content (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.15)] pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-[#f4f4f4]">
                RECENT BLOG POSTS
              </h2>
            </div>
            <Link
              to={`${ADMIN_ROUTE_BASE}/blogs`}
              className="font-mono text-[10px] text-[#4fd1c5] hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentPosts.length === 0 ? (
              <div className="p-6 bg-[#141924] border border-[rgba(255,255,255,0.1)] text-center font-mono text-xs text-gray-400">
                NO POSTS FOUND.
              </div>
            ) : (
              recentPosts.slice(0, 5).map((post) => (
                <Link
                  key={post.id}
                  to={`${ADMIN_ROUTE_BASE}/blogs`}
                  className="bg-[#141924] border border-[rgba(255,255,255,0.1)] p-3 block hover:border-[#4fd1c5] transition-colors"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 mb-1">
                    <span className="text-[#4fd1c5]">{post.category || 'General'}</span>
                    <span>{new Date(post.updated_at || post.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="font-semibold text-xs text-[#f4f4f4] truncate">
                    {post.title}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Cpu, Zap, Factory, Briefcase, FileBarChart,
  Plus, CheckCircle, Clock, Trash2, ArrowUpRight, Activity, Image as ImageIcon, PhoneCall
} from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import { ADMIN_ROUTE_BASE } from '../../constants/admin';

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
    trash: 0,
    totalBookCalls: 0,
    newBookCalls: 0,
    contactedBookCalls: 0,
    inProgressBookCalls: 0,
    convertedBookCalls: 0,
    closedBookCalls: 0
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
    { label: 'Blog Posts', count: stats.totalPosts, icon: FileText, path: `${ADMIN_ROUTE_BASE}/blogs` },
    { label: 'Services', count: stats.totalServices, icon: Cpu, path: `${ADMIN_ROUTE_BASE}/services` },
    { label: 'Accelerators', count: stats.totalAccelerators, icon: Zap, path: `${ADMIN_ROUTE_BASE}/accelerators` },
    { label: 'Industries', count: stats.totalIndustries, icon: Factory, path: `${ADMIN_ROUTE_BASE}/industries` },
    { label: 'Case Studies', count: stats.totalCaseStudies, icon: Briefcase, path: `${ADMIN_ROUTE_BASE}/case-studies` },
    { label: 'Flash Reports', count: stats.totalReports, icon: FileBarChart, path: `${ADMIN_ROUTE_BASE}/reports` }
  ];

  return (
    <div className="space-y-8 text-[#111111]">
      {/* Top Header */}
      <div className="border-b border-[#E5E5E5] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-xs text-[#888888] uppercase tracking-widest mb-1 font-semibold">
            CONTROL ROOM — OVERVIEW
          </div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold uppercase text-[#111111] tracking-tight">
            CMS DASHBOARD
          </h1>
        </div>

        {/* Quick Create Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link to={`${ADMIN_ROUTE_BASE}/blogs`} className="admin-btn-primary text-xs py-2 px-3 inline-flex items-center">
            <Plus className="w-3.5 h-3.5 mr-1" /> New Blog
          </Link>
          <Link to={`${ADMIN_ROUTE_BASE}/reports`} className="admin-btn-primary text-xs py-2 px-3 inline-flex items-center">
            <Plus className="w-3.5 h-3.5 mr-1" /> New Flash Report
          </Link>
          <Link to={`${ADMIN_ROUTE_BASE}/services`} className="admin-btn text-xs py-2 px-3 inline-flex items-center">
            <Plus className="w-3.5 h-3.5 mr-1" /> Service
          </Link>
          <Link to={`${ADMIN_ROUTE_BASE}/media`} className="admin-btn text-xs py-2 px-3 inline-flex items-center">
            <ImageIcon className="w-3.5 h-3.5 mr-1" /> Upload Media
          </Link>
        </div>
      </div>

      {/* Book a Call & Lead KPI Section */}
      <div className="bg-white border border-[#E5E5E5] p-5">
        <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-[#111111]" />
            <span className="font-heading text-sm md:text-base font-bold uppercase text-[#111111]">
              BOOK A CALL &amp; ENQUIRY METRICS
            </span>
          </div>
          <Link
            to={`${ADMIN_ROUTE_BASE}/book-a-call`}
            className="font-mono text-xs text-[#555555] hover:text-[#111111] hover:underline flex items-center gap-1"
          >
            Manage Enquiries &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            to={`${ADMIN_ROUTE_BASE}/book-a-call`}
            className="bg-[#F7F7F7] border border-[#E5E5E5] p-3 hover:border-[#111111] transition-colors"
          >
            <div className="font-mono text-[10px] text-[#666666] uppercase font-semibold">TOTAL REQUESTS</div>
            <div className="font-heading text-2xl font-bold text-[#111111] mt-1">
              {loading ? '—' : stats.totalBookCalls || 0}
            </div>
          </Link>

          <Link
            to={`${ADMIN_ROUTE_BASE}/book-a-call`}
            className="bg-[#F7F7F7] border border-[#E5E5E5] p-3 hover:border-[#111111] transition-colors"
          >
            <div className="font-mono text-[10px] text-[#666666] uppercase font-semibold">NEW / UNREAD</div>
            <div className="font-heading text-2xl font-bold text-[#111111] mt-1">
              {loading ? '—' : stats.newBookCalls || 0}
            </div>
          </Link>

          <Link
            to={`${ADMIN_ROUTE_BASE}/book-a-call`}
            className="bg-[#F7F7F7] border border-[#E5E5E5] p-3 hover:border-[#111111] transition-colors"
          >
            <div className="font-mono text-[10px] text-[#666666] uppercase font-semibold">CONTACTED</div>
            <div className="font-heading text-2xl font-bold text-[#111111] mt-1">
              {loading ? '—' : stats.contactedBookCalls || 0}
            </div>
          </Link>

          <Link
            to={`${ADMIN_ROUTE_BASE}/book-a-call`}
            className="bg-[#F7F7F7] border border-[#E5E5E5] p-3 hover:border-[#111111] transition-colors"
          >
            <div className="font-mono text-[10px] text-[#666666] uppercase font-semibold">IN PROGRESS</div>
            <div className="font-heading text-2xl font-bold text-[#111111] mt-1">
              {loading ? '—' : stats.inProgressBookCalls || 0}
            </div>
          </Link>

          <Link
            to={`${ADMIN_ROUTE_BASE}/book-a-call`}
            className="bg-[#F7F7F7] border border-[#E5E5E5] p-3 hover:border-[#111111] transition-colors"
          >
            <div className="font-mono text-[10px] text-[#666666] uppercase font-semibold">CONVERTED</div>
            <div className="font-heading text-2xl font-bold text-[#111111] mt-1">
              {loading ? '—' : (stats.convertedBookCalls || 0) + (stats.qualifiedBookCalls || 0)}
            </div>
          </Link>

          <Link
            to={`${ADMIN_ROUTE_BASE}/book-a-call`}
            className="bg-[#F7F7F7] border border-[#E5E5E5] p-3 hover:border-[#111111] transition-colors"
          >
            <div className="font-mono text-[10px] text-[#666666] uppercase font-semibold">CLOSED</div>
            <div className="font-heading text-2xl font-bold text-[#888888] mt-1">
              {loading ? '—' : stats.closedBookCalls || 0}
            </div>
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
              className="bg-white border border-[#E5E5E5] p-4 hover:border-[#111111] transition-colors group block"
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-4 h-4 text-[#111111]" />
                <ArrowUpRight className="w-3.5 h-3.5 text-[#888888] group-hover:text-[#111111] transition-colors" />
              </div>
              <div className="font-heading text-2xl font-bold text-[#111111]">
                {loading ? '—' : c.count}
              </div>
              <div className="font-mono text-[10px] text-[#666666] uppercase tracking-wider mt-1 font-semibold">
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
          className="bg-white border border-[#E5E5E5] p-4 flex items-center justify-between hover:bg-[#F7F7F7] hover:border-[#111111] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#111111] flex items-center justify-center text-white">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="font-heading text-xl font-bold text-[#111111]">
                {loading ? '—' : stats.published}
              </div>
              <div className="font-mono text-[10px] text-[#666666] uppercase tracking-wider font-semibold">
                Total Published Items
              </div>
            </div>
          </div>
          <span className="font-mono text-xs text-[#555555] font-semibold">View All →</span>
        </Link>

        <Link
          to={`${ADMIN_ROUTE_BASE}/drafts`}
          className="bg-white border border-[#E5E5E5] p-4 flex items-center justify-between hover:bg-[#F7F7F7] hover:border-[#111111] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#F7F7F7] border border-[#E5E5E5] flex items-center justify-center text-[#111111]">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="font-heading text-xl font-bold text-[#111111]">
                {loading ? '—' : stats.drafts}
              </div>
              <div className="font-mono text-[10px] text-[#666666] uppercase tracking-wider font-semibold">
                Drafts in Progress
              </div>
            </div>
          </div>
          <span className="font-mono text-xs text-[#555555] font-semibold">View Drafts →</span>
        </Link>

        <Link
          to={`${ADMIN_ROUTE_BASE}/trash`}
          className="bg-white border border-[#E5E5E5] p-4 flex items-center justify-between hover:bg-[#F7F7F7] hover:border-[#111111] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#F7F7F7] border border-[#E5E5E5] flex items-center justify-center text-[#888888]">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-heading text-xl font-bold text-[#111111]">
                {loading ? '—' : stats.trash}
              </div>
              <div className="font-mono text-[10px] text-[#666666] uppercase tracking-wider font-semibold">
                Trash &amp; Soft Deleted
              </div>
            </div>
          </div>
          <span className="font-mono text-xs text-[#555555] font-semibold">View Trash →</span>
        </Link>
      </div>

      {/* 2-Column Split: Recent Activity + Recently Updated */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Column 1: Real-time Activity Log (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#111111]" />
              <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-[#111111]">
                RECENT ACTIVITY AUDIT
              </h2>
            </div>
            <span className="font-mono text-[10px] text-[#888888]">
              AUTO-AUDIT LOGS
            </span>
          </div>

          <div className="space-y-2.5">
            {activityLogs.length === 0 ? (
              <div className="p-6 bg-white border border-[#E5E5E5] text-center font-mono text-xs text-[#888888]">
                NO RECENT ACTIVITY LOGGED.
              </div>
            ) : (
              activityLogs.slice(0, 7).map((log) => (
                <div
                  key={log.id}
                  className="bg-white border border-[#E5E5E5] p-3.5 flex items-start justify-between gap-4 font-mono text-xs hover:border-[#111111] transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-[#111111]">{log.title}</div>
                    <div className="text-[11px] text-[#666666]">{log.description}</div>
                  </div>
                  <div className="px-2 py-0.5 bg-[#F7F7F7] border border-[#E5E5E5] text-[10px] text-[#111111] shrink-0 font-bold">
                    {log.date}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Recently Updated Articles & Content (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#111111]" />
              <h2 className="font-mono text-sm font-bold uppercase tracking-wider text-[#111111]">
                RECENT BLOG POSTS
              </h2>
            </div>
            <Link
              to={`${ADMIN_ROUTE_BASE}/blogs`}
              className="font-mono text-[10px] text-[#555555] hover:text-[#111111] hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentPosts.length === 0 ? (
              <div className="p-6 bg-white border border-[#E5E5E5] text-center font-mono text-xs text-[#888888]">
                NO POSTS FOUND.
              </div>
            ) : (
              recentPosts.slice(0, 5).map((post) => (
                <Link
                  key={post.id}
                  to={`${ADMIN_ROUTE_BASE}/blogs`}
                  className="bg-white border border-[#E5E5E5] p-3 block hover:border-[#111111] transition-colors"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#888888] mb-1">
                    <span className="text-[#111111] font-semibold">{post.category || 'General'}</span>
                    <span>{new Date(post.updated_at || post.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="font-semibold text-xs text-[#111111] truncate">
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

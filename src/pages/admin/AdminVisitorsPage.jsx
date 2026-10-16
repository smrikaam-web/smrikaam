import React, { useState, useEffect } from 'react';
import {
  Users, Building2, Globe, FileText, Download, Trash2, Search,
  RefreshCw, CheckCircle2, Shield, Clock, ArrowRight, ExternalLink,
  X, MessageSquare, ChevronRight, Filter, PhoneCall, Check,
  Loader2, Laptop, Smartphone, Link2, Copy, AlertCircle
} from 'lucide-react';
import api from '../../api';

export default function AdminVisitorsPage() {
  const [visitors, setVisitors] = useState([]);
  const [stats, setStats] = useState({
    totalVisitors: 0,
    corporateNetworks: 0,
    voluntaryLeads: 0,
    activeToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [networkFilter, setNetworkFilter] = useState('all');

  // Detail Modal / Drawer state
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState(false);
  const [deletingVisitor, setDeletingVisitor] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Purge Modal state
  const [purgeModalOpen, setPurgeModalOpen] = useState(false);
  const [retentionDays, setRetentionDays] = useState(90);
  const [purging, setPurging] = useState(false);

  const fetchVisitors = async () => {
    setLoading(true);
    try {
      const res = await api.get('/visitors/admin', {
        params: {
          search: searchQuery,
          status: statusFilter,
          networkType: networkFilter,
          limit: 100
        }
      });
      if (res.data) {
        setVisitors(Array.isArray(res.data.visitors) ? res.data.visitors : []);
        if (res.data.stats) setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load visitor intelligence:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, [statusFilter, networkFilter]);

  // Open visitor detail drawer
  const handleOpenDetail = async (v) => {
    setSelectedVisitor(v);
    setAdminNotes(v.admin_notes || '');
    setNoteSuccess(false);
    setDetailLoading(true);
    try {
      const res = await api.get(`/visitors/admin/${v.id}`);
      if (res.data) {
        setSelectedVisitor(res.data);
        setAdminNotes(res.data.admin_notes || '');
      }
    } catch (err) {
      console.error('Failed to fetch detailed profile:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  // Update lead status
  const handleUpdateStatus = async (visitorId, newStatus) => {
    try {
      await api.patch(`/visitors/admin/${visitorId}`, { lead_status: newStatus });
      setVisitors((prev) =>
        prev.map((v) => (v.id === visitorId ? { ...v, lead_status: newStatus } : v))
      );
      if (selectedVisitor?.id === visitorId) {
        setSelectedVisitor((prev) => ({ ...prev, lead_status: newStatus }));
      }
    } catch (err) {
      alert('Failed to update lead status');
    }
  };

  // Delete individual visitor under GDPR / DPDP right-to-erasure
  const handleDeleteVisitor = async (visitorId) => {
    if (!window.confirm(`Permanently delete visitor record ${visitorId} and all associated session history? This action complies with privacy erasure controls and cannot be undone.`)) {
      return;
    }
    setDeletingVisitor(true);
    try {
      await api.delete(`/visitors/admin/${visitorId}`);
      setVisitors((prev) => prev.filter((v) => v.id !== visitorId));
      if (selectedVisitor?.id === visitorId) {
        setSelectedVisitor(null);
      }
    } catch (err) {
      alert('Failed to delete visitor record.');
    } finally {
      setDeletingVisitor(false);
    }
  };

  // Save admin notes
  const handleSaveNotes = async () => {
    if (!selectedVisitor) return;
    setSavingNotes(true);
    setNoteSuccess(false);
    try {
      await api.patch(`/visitors/admin/${selectedVisitor.id}`, { admin_notes: adminNotes });
      setSelectedVisitor((prev) => ({ ...prev, admin_notes: adminNotes }));
      setVisitors((prev) =>
        prev.map((v) => (v.id === selectedVisitor.id ? { ...v, admin_notes: adminNotes } : v))
      );
      setNoteSuccess(true);
      setTimeout(() => setNoteSuccess(false), 2500);
    } catch (err) {
      alert('Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    window.open('/api/visitors/admin-export/csv', '_blank');
  };

  // Purge Old Anonymous Data
  const handleExecutePurge = async () => {
    setPurging(true);
    try {
      const res = await api.post('/visitors/admin/purge', { retentionDays });
      alert(`Purge completed: ${res.data.purgedVisitors || 0} visitors and ${res.data.purgedSessions || 0} sessions older than ${retentionDays} days removed.`);
      setPurgeModalOpen(false);
      fetchVisitors();
    } catch (err) {
      alert('Purge failed');
    } finally {
      setPurging(false);
    }
  };

  const copyToClipboard = (text, idKey) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(idKey);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="space-y-6 text-[#111111]">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5E5] pb-5">
        <div>
          <div className="font-mono text-xs text-[#888888] uppercase tracking-widest font-semibold mb-1">
            LEAD ENGINE // VISITOR INTELLIGENCE
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#111111]">
            ACCOUNT &amp; JOURNEY RADAR
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={fetchVisitors}
            className="admin-btn text-xs py-2 px-3 flex items-center gap-1.5 cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> REFRESH
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="admin-btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer uppercase font-mono font-bold"
          >
            <Download className="w-3.5 h-3.5" /> EXPORT CSV
          </button>

          <button
            type="button"
            onClick={() => setPurgeModalOpen(true)}
            className="admin-btn text-xs py-2 px-3 text-[#555555] hover:text-[#111111] cursor-pointer uppercase font-mono"
            title="Configure Retention & Purge Old Telemetry"
          >
            <Trash2 className="w-3.5 h-3.5" /> RETENTION
          </button>
        </div>
      </div>

      {/* Accuracy & Legal Notice Card */}
      <div className="bg-[#F7F7F7] border-l-4 border-[#111111] border border-r-[#E5E5E5] border-t-[#E5E5E5] border-b-[#E5E5E5] p-3.5 text-xs font-mono text-[#333333] flex items-start gap-3">
        <Shield className="w-4 h-4 text-[#111111] shrink-0 mt-0.5" />
        <div>
          <span className="text-[#111111] font-bold uppercase">PRIVACY &amp; TRANSPARENCY MANDATE: </span>
          <span>
            Anonymous visitors are tracked using random pseudonymous tokens without device fingerprinting. Personal details (Name, Email, Phone) are captured strictly when voluntary forms are submitted and linked only with explicit consent. Identities are never inferred from IP addresses or cookies.
          </span>
        </div>
      </div>

      {/* KPI Metrics Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 space-y-1 bg-white border border-[#E5E5E5]">
          <div className="flex items-center justify-between text-[#666666] text-xs font-mono font-semibold">
            <span>TOTAL VISITORS</span>
            <Users className="w-4 h-4 text-[#111111]" />
          </div>
          <div className="text-2xl font-bold font-heading text-[#111111]">{stats.totalVisitors}</div>
          <div className="text-[10px] text-[#888888] font-mono">Pseudonymous visitor profiles</div>
        </div>

        <div className="p-4 space-y-1 bg-white border border-[#E5E5E5]">
          <div className="flex items-center justify-between text-[#666666] text-xs font-mono font-semibold">
            <span>CORPORATE NETWORKS</span>
            <Building2 className="w-4 h-4 text-[#111111]" />
          </div>
          <div className="text-2xl font-bold font-heading text-[#111111]">{stats.corporateNetworks}</div>
          <div className="text-[10px] text-[#888888] font-mono">Identified corporate/campus domains</div>
        </div>

        <div className="p-4 space-y-1 bg-white border border-[#E5E5E5]">
          <div className="flex items-center justify-between text-[#666666] text-xs font-mono font-semibold">
            <span>VOLUNTARY LEADS</span>
            <CheckCircle2 className="w-4 h-4 text-[#111111]" />
          </div>
          <div className="text-2xl font-bold font-heading text-[#111111]">{stats.voluntaryLeads}</div>
          <div className="text-[10px] text-[#888888] font-mono">Linked consented inbound submissions</div>
        </div>

        <div className="p-4 space-y-1 bg-white border border-[#E5E5E5]">
          <div className="flex items-center justify-between text-[#666666] text-xs font-mono font-semibold">
            <span>ACTIVE TODAY</span>
            <Clock className="w-4 h-4 text-[#111111]" />
          </div>
          <div className="text-2xl font-bold font-heading text-[#111111]">{stats.activeToday}</div>
          <div className="text-[10px] text-[#888888] font-mono">Activity in last 24 hours</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#F7F7F7] p-3.5 border border-[#E5E5E5] font-mono text-xs">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['all', 'New', 'Engaged', 'Qualified', 'Customer', 'Unqualified'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 uppercase tracking-wider transition-colors cursor-pointer border text-xs font-semibold ${
                statusFilter === st
                  ? 'bg-[#111111] text-white border-[#111111]'
                  : 'bg-white text-[#555555] hover:text-[#111111] border-[#E5E5E5] hover:border-[#111111]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative flex-grow max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#888888] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchVisitors()}
            placeholder="Search visitor ID, session, voluntary contact, referral, page..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#E5E5E5] text-xs text-[#111111] focus:border-[#111111] focus:outline-none placeholder-[#888888] font-mono"
          />
        </div>
      </div>

      {/* Visitors Intelligence Dashboard Table */}
      <div className="overflow-hidden bg-white border border-[#E5E5E5]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-[#E5E5E5] bg-[#F7F7F7] text-[#111111] uppercase tracking-wider font-bold">
                <th className="p-3.5 whitespace-nowrap">Visitor / Session ID</th>
                <th className="p-3.5 whitespace-nowrap">Known Contact</th>
                <th className="p-3.5 whitespace-nowrap">Referral &amp; Device</th>
                <th className="p-3.5 whitespace-nowrap">Consent &amp; Network</th>
                <th className="p-3.5 whitespace-nowrap">Activity (Visits / Pvs)</th>
                <th className="p-3.5 whitespace-nowrap">Lead Status</th>
                <th className="p-3.5 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#888888]">
                    Scanning visitor telemetry and resolving sessions...
                  </td>
                </tr>
              ) : visitors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#888888]">
                    No visitor intelligence records found matching filters.
                  </td>
                </tr>
              ) : (
                visitors.map((v) => {
                  const isAnonymous = !v.voluntary_name && !v.voluntary_email;
                  return (
                    <tr key={v.id} className="hover:bg-[#F7F7F7] transition-colors">
                      {/* Visitor & Session ID */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#111111]" title={v.id}>
                            {v.id.slice(0, 10)}…
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(v.id, `v_${v.id}`)}
                            className="text-[#888888] hover:text-[#111111] transition-colors cursor-pointer"
                            title="Copy Visitor ID"
                          >
                            {copiedId === `v_${v.id}` ? (
                              <Check className="w-3 h-3 text-[#111111]" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <div className="text-[10px] text-[#888888] mt-1 flex items-center gap-1">
                          <span>SESS:</span>
                          {v.latestSessionId ? (
                            <span title={v.latestSessionId}>
                              {v.latestSessionId.slice(0, 8)}…
                            </span>
                          ) : (
                            <span>—</span>
                          )}
                        </div>
                      </td>

                      {/* Known Contact (Voluntary Only) */}
                      <td className="p-3.5 whitespace-nowrap">
                        {isAnonymous ? (
                          <div>
                            <span className="inline-block px-1.5 py-0.5 text-[9px] font-bold uppercase border border-[#E5E5E5] bg-[#F7F7F7] text-[#666666]">
                              ANONYMOUS
                            </span>
                            <div className="text-[10px] text-[#888888] mt-0.5">No contact submitted</div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-bold text-[#111111] flex items-center gap-1">
                              {v.voluntary_name || 'Known Contact'}
                            </div>
                            <div className="text-[11px] text-[#333333] mt-0.5">
                              {v.voluntary_email || '—'}
                            </div>
                            {v.voluntary_phone && (
                              <div className="text-[10px] text-[#666666] mt-0.5">
                                📞 {v.voluntary_phone}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Referral Source & Device/Browser */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-bold text-[#111111] truncate max-w-[140px]" title={v.referral_source || 'Direct'}>
                          {v.referral_source || 'Direct'}
                        </div>
                        <div className="text-[10px] text-[#666666] mt-0.5 flex items-center gap-1">
                          <span>{v.device_category || 'Desktop'}</span>
                          <span>•</span>
                          <span>{v.browser_category || 'Other'}</span>
                        </div>
                      </td>

                      {/* Consent & Network */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.5 text-[9px] font-bold uppercase border ${
                              v.consent_status === 'Consented & Linked'
                                ? 'bg-[#111111] text-white border-[#111111]'
                                : v.consent_status === 'Accepted' || v.consent_status === 'Consented'
                                ? 'bg-[#F7F7F7] text-[#111111] border-[#111111]'
                                : v.is_opted_out || v.consent_status === 'Opted Out' || v.consent_status === 'Rejected'
                                ? 'bg-[#F7F7F7] text-[#888888] border-[#E5E5E5] line-through'
                                : 'bg-white text-[#666666] border-[#E5E5E5]'
                            }`}
                          >
                            {v.consent_status || 'Pending'}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#666666] mt-1 truncate max-w-[130px]" title={v.network_org || 'Anonymous'}>
                          {v.voluntary_company || v.network_org || 'Anonymous'}
                        </div>
                      </td>

                      {/* Activity (First Visit, Last Visit, Pageviews) */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="text-[#111111] font-bold">
                          {v.total_visits || 1} visit{v.total_visits > 1 ? 's' : ''} • {v.total_pageviews || 1} pvs
                        </div>
                        <div className="text-[10px] text-[#666666] mt-0.5">
                          Last: {v.last_seen ? new Date(v.last_seen).toLocaleDateString() : 'Recent'}
                        </div>
                        <div className="text-[10px] text-[#888888]">
                          First: {v.first_seen ? new Date(v.first_seen).toLocaleDateString() : 'Recent'}
                        </div>
                      </td>

                      {/* Lead Status Select */}
                      <td className="p-3.5 whitespace-nowrap">
                        <select
                          value={v.lead_status || 'New'}
                          onChange={(e) => handleUpdateStatus(v.id, e.target.value)}
                          className="bg-white border border-[#E5E5E5] text-[#111111] text-[11px] px-2 py-1 rounded-none focus:outline-none focus:border-[#111111] font-mono cursor-pointer"
                        >
                          <option value="New">New</option>
                          <option value="Prospect">Prospect</option>
                          <option value="Engaged">Engaged</option>
                          <option value="Qualified">Qualified</option>
                          <option value="Customer">Customer</option>
                          <option value="Unqualified">Unqualified</option>
                        </select>
                        {v.voluntary_lead_id && (
                          <div className="text-[9px] text-[#666666] mt-1 flex items-center gap-1 font-mono">
                            <Link2 className="w-2.5 h-2.5 text-[#111111]" />
                            <span>LEAD #{v.voluntary_lead_id.slice(0, 6)}</span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(v)}
                            className="admin-btn text-xs py-1 px-2.5 text-[#111111] border-[#E5E5E5] hover:border-[#111111] cursor-pointer inline-flex items-center gap-1 font-mono"
                            title="Inspect Journey & Details"
                          >
                            JOURNEY <ChevronRight className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteVisitor(v.id)}
                            className="admin-btn text-xs py-1 px-2 text-[#888888] hover:text-[#111111] border-[#E5E5E5] hover:border-[#111111] cursor-pointer"
                            title="Delete Visitor (Right to Erasure)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL / JOURNEY DRAWER */}
      {selectedVisitor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-6 bg-white border border-[#E5E5E5] shadow-2xl">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
                <div>
                  <div className="font-mono text-[10px] text-[#888888] uppercase tracking-widest font-semibold">
                    VISITOR INTELLIGENCE // DOSSIER
                  </div>
                  <h3 className="font-heading text-xl font-bold uppercase text-[#111111] mt-0.5">
                    {selectedVisitor.voluntary_name || selectedVisitor.voluntary_company || selectedVisitor.network_org || 'Anonymous Visitor'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedVisitor(null)}
                  className="text-[#666666] hover:text-[#111111] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Complete Metadata Attributes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#F7F7F7] p-4 border border-[#E5E5E5] font-mono text-xs">
                <div>
                  <span className="text-[#888888] block text-[10px] uppercase font-semibold">VISITOR ID</span>
                  <span className="font-bold text-[#111111] mt-0.5 block truncate" title={selectedVisitor.id}>
                    {selectedVisitor.id}
                  </span>
                </div>
                <div>
                  <span className="text-[#888888] block text-[10px] uppercase font-semibold">LATEST SESSION ID</span>
                  <span className="font-bold text-[#111111] mt-0.5 block truncate" title={selectedVisitor.latestSessionId || 'None'}>
                    {selectedVisitor.latestSessionId || 'None'}
                  </span>
                </div>
                <div>
                  <span className="text-[#888888] block text-[10px] uppercase font-semibold">REFERRAL SOURCE</span>
                  <span className="font-bold text-[#111111] mt-0.5 block truncate">
                    {selectedVisitor.referral_source || 'Direct'}
                  </span>
                </div>
                <div>
                  <span className="text-[#888888] block text-[10px] uppercase font-semibold">DEVICE &amp; BROWSER</span>
                  <span className="font-bold text-[#111111] mt-0.5 block">
                    {selectedVisitor.device_category || 'Desktop'} / {selectedVisitor.browser_category || 'Other'}
                  </span>
                </div>
                <div>
                  <span className="text-[#888888] block text-[10px] uppercase font-semibold">CONSENT STATUS</span>
                  <span className="font-bold text-[#111111] mt-0.5 block">
                    {selectedVisitor.consent_status || 'Pending'}
                  </span>
                </div>
                <div>
                  <span className="text-[#888888] block text-[10px] uppercase font-semibold">ANONYMIZED SUBNET</span>
                  <span className="font-bold text-[#111111] mt-0.5 block">
                    {selectedVisitor.anonymized_ip || '0.0.0.0'}
                  </span>
                </div>
                <div>
                  <span className="text-[#888888] block text-[10px] uppercase font-semibold">FIRST VISIT</span>
                  <span className="font-bold text-[#111111] mt-0.5 block">
                    {selectedVisitor.first_seen ? new Date(selectedVisitor.first_seen).toLocaleString() : 'Recent'}
                  </span>
                </div>
                <div>
                  <span className="text-[#888888] block text-[10px] uppercase font-semibold">LAST VISIT</span>
                  <span className="font-bold text-[#111111] mt-0.5 block">
                    {selectedVisitor.last_seen ? new Date(selectedVisitor.last_seen).toLocaleString() : 'Recent'}
                  </span>
                </div>
                <div>
                  <span className="text-[#888888] block text-[10px] uppercase font-semibold">TOTAL PAGEVIEWS</span>
                  <span className="font-bold text-[#111111] mt-0.5 block">
                    {selectedVisitor.total_pageviews || 1} Views
                  </span>
                </div>
              </div>

              {/* Voluntary Contact Data Card */}
              <div className="bg-white border border-[#E5E5E5] p-4 font-mono text-xs space-y-2">
                <div className="font-bold text-[#111111] uppercase tracking-widest text-[10px] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#111111]" />
                    {selectedVisitor.voluntary_email ? 'VERIFIED VOLUNTARY CONTACT' : 'VOLUNTARY IDENTIFICATION STATUS'}
                  </span>
                  <span className="text-[#888888] font-normal">
                    {selectedVisitor.voluntary_email ? 'CONSENTED LINK' : 'UNIDENTIFIED'}
                  </span>
                </div>

                {selectedVisitor.voluntary_email ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#E5E5E5]">
                    <div>
                      <span className="text-[#888888] text-[10px] block font-semibold">NAME</span>
                      <span className="text-[#111111] font-bold">{selectedVisitor.voluntary_name || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[#888888] text-[10px] block font-semibold">EMAIL</span>
                      <span className="text-[#111111] font-bold">{selectedVisitor.voluntary_email}</span>
                    </div>
                    <div>
                      <span className="text-[#888888] text-[10px] block font-semibold">PHONE</span>
                      <span className="text-[#111111] font-bold">{selectedVisitor.voluntary_phone || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[#888888] text-[10px] block font-semibold">COMPANY</span>
                      <span className="text-[#111111] font-bold">{selectedVisitor.voluntary_company || '—'}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[#666666] text-xs font-mono pt-1">
                    Visitor has not submitted a contact or booking form. Identity is not inferred from cookies or IP addresses.
                  </p>
                )}
              </div>

              {/* Associated Lead Card (If Linked) */}
              {selectedVisitor.associatedLead && (
                <div className="bg-white border border-[#E5E5E5] p-4 font-mono text-xs space-y-2">
                  <div className="font-bold text-[#111111] uppercase tracking-widest text-[10px] flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-[#111111]" /> ASSOCIATED LEAD RECORD
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 border-t border-[#E5E5E5]">
                    <div>
                      <span className="text-[#888888] text-[10px] block font-semibold">LEAD ID</span>
                      <span className="text-[#111111] font-bold truncate block">{selectedVisitor.associatedLead.id}</span>
                    </div>
                    <div>
                      <span className="text-[#888888] text-[10px] block font-semibold">REQUIREMENT</span>
                      <span className="text-[#111111] font-bold block">{selectedVisitor.associatedLead.requirement_type || 'General'}</span>
                    </div>
                    <div>
                      <span className="text-[#888888] text-[10px] block font-semibold">SUBMITTED AT</span>
                      <span className="text-[#111111] font-bold block">
                        {new Date(selectedVisitor.associatedLead.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {selectedVisitor.associatedLead.message && (
                    <div className="text-[#333333] bg-[#F7F7F7] p-2 border border-[#E5E5E5] text-[11px] mt-2">
                      "{selectedVisitor.associatedLead.message}"
                    </div>
                  )}
                </div>
              )}

              {/* Journey Trail History */}
              <div className="space-y-3">
                <h4 className="font-mono text-xs font-bold text-[#111111] uppercase tracking-wider">
                  VISITED PAGES // SESSION TRAIL
                </h4>
                {selectedVisitor.sessions && selectedVisitor.sessions.length > 0 ? (
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {selectedVisitor.sessions.map((sess, idx) => (
                      <div key={sess.id || idx} className="bg-[#F7F7F7] border border-[#E5E5E5] p-3 text-xs font-mono space-y-2">
                        <div className="flex items-center justify-between text-[#666666] text-[10px] border-b border-[#E5E5E5] pb-1.5">
                          <span>
                            SESSION #{selectedVisitor.sessions.length - idx} • {new Date(sess.started_at).toLocaleString()}
                          </span>
                          <span>
                            {sess.device_category || 'Desktop'} / {sess.browser_category || 'Browser'}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {(Array.isArray(sess.pages_viewed) ? sess.pages_viewed : []).map((page, pIdx) => (
                            <div key={pIdx} className="flex items-center justify-between text-[#333333] text-[11px] border-l-2 border-[#111111] pl-2">
                              <span className="font-bold text-[#111111]">{page.path}</span>
                              <span className="text-[#888888] text-[10px]">
                                {page.duration ? `${page.duration}s` : 'viewed'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#888888] font-mono">No detailed session trail recorded.</p>
                )}
              </div>

              {/* Internal Notes Editor */}
              <div className="space-y-2 border-t border-[#E5E5E5] pt-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono text-[#111111] uppercase tracking-wider font-bold">
                    INTERNAL ACCOUNT NOTES
                  </label>
                  {noteSuccess && (
                    <span className="text-[#111111] font-mono text-xs flex items-center gap-1 font-bold">
                      <Check className="w-3.5 h-3.5 text-[#111111]" /> Saved!
                    </span>
                  )}
                </div>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal intelligence: outreach attempts, company context, target tech stack..."
                  className="w-full p-2.5 bg-white border border-[#E5E5E5] text-xs text-[#111111] focus:border-[#111111] focus:outline-none font-sans"
                />
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => handleDeleteVisitor(selectedVisitor.id)}
                    disabled={deletingVisitor}
                    className="admin-btn text-xs py-1.5 px-3 text-[#555555] hover:text-[#111111] border-[#E5E5E5] hover:border-[#111111] cursor-pointer flex items-center gap-1.5 font-mono"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> DELETE RECORD (RIGHT TO ERASURE)
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    className="admin-btn-primary text-xs py-1.5 px-4 font-bold uppercase tracking-wider cursor-pointer"
                  >
                    {savingNotes ? 'SAVING...' : 'SAVE NOTES'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DATA RETENTION PURGE MODAL */}
      {purgeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md">
            <div className="p-6 space-y-5 bg-white border border-[#E5E5E5] shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
                <h3 className="font-heading text-lg font-bold uppercase text-[#111111]">
                  DATA RETENTION CONTROLS
                </h3>
                <button
                  type="button"
                  onClick={() => setPurgeModalOpen(false)}
                  className="text-[#666666] hover:text-[#111111] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-[#555555] font-mono leading-relaxed">
                In compliance with data minimization, purge anonymous visitor records and pageview journeys older than the specified retention window. Voluntary form leads are automatically preserved.
              </p>

              <div>
                <label className="block text-xs font-mono text-[#666666] uppercase mb-1 font-semibold">
                  PURGE DATA OLDER THAN:
                </label>
                <select
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(parseInt(e.target.value, 10))}
                  className="w-full p-2 bg-white border border-[#E5E5E5] text-xs text-[#111111] font-mono focus:border-[#111111] focus:outline-none cursor-pointer"
                >
                  <option value={30}>30 Days</option>
                  <option value={60}>60 Days</option>
                  <option value={90}>90 Days (Recommended)</option>
                  <option value={180}>180 Days</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={() => setPurgeModalOpen(false)}
                  className="admin-btn text-xs py-1.5 px-3.5 text-[#555555] hover:text-[#111111] border-[#E5E5E5]"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={handleExecutePurge}
                  disabled={purging}
                  className="admin-btn-primary text-xs py-1.5 px-4 font-bold uppercase tracking-wider cursor-pointer"
                >
                  {purging ? 'PURGING...' : 'EXECUTE PURGE'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


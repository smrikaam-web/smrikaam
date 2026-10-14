import React, { useState, useEffect, useMemo } from 'react';
import {
  PhoneCall, Search, Filter, RefreshCw, Eye, Trash2, CheckCircle2,
  Clock, AlertCircle, Calendar, User, Building, Mail, Phone, Briefcase,
  Tag, AlertTriangle, ShieldCheck, MessageSquare, ChevronRight, X, UserCheck
} from 'lucide-react';
import api from '../../api';
import BlueprintWrapper from '../../components/BlueprintWrapper';

export default function AdminBookCallPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [serviceFilter, setServiceFilter] = useState('ALL');

  // Detail Modal Form State
  const [detailForm, setDetailForm] = useState({
    status: 'NEW',
    priority: 'MEDIUM',
    assigned_to: '',
    admin_notes: ''
  });
  const [savingDetail, setSavingDetail] = useState(false);
  const [modalFeedback, setModalFeedback] = useState({ type: '', msg: '' });

  const [lastRefreshed, setLastRefreshed] = useState(null);

  const fetchRequests = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const res = await api.get('/book-a-call');
      setRequests(res.data || []);
      setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('Failed to fetch book a call requests', err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(false);

    // 1. Auto-poll every 15 seconds to pick up new submissions in real-time
    const interval = setInterval(() => {
      fetchRequests(true);
    }, 15000);

    // 2. Auto-sync immediately whenever the admin switches back to this tab
    const handleFocus = () => {
      fetchRequests(true);
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const openDetailModal = (req) => {
    setSelectedRequest(req);
    setDetailForm({
      status: req.status || 'NEW',
      priority: req.priority || 'MEDIUM',
      assigned_to: req.assigned_to || req.assignedTo || '',
      admin_notes: req.admin_notes || req.adminNotes || ''
    });
    setModalFeedback({ type: '', msg: '' });

    // Mark as read if status is NEW
    if (req.status === 'NEW' || req.status === 'unread' || !req.status) {
      handleQuickStatusChange(req.id, 'CONTACTED');
    }
  };

  const handleQuickStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/book-a-call/${id}`, { status: newStatus, is_read: true });
      setRequests((prev) =>
        prev.map((item) => (String(item.id) === String(id) ? { ...item, status: newStatus, is_read: true } : item))
      );
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleSaveDetail = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setSavingDetail(true);
    setModalFeedback({ type: '', msg: '' });

    try {
      const res = await api.patch(`/book-a-call/${selectedRequest.id}`, {
        status: detailForm.status,
        priority: detailForm.priority,
        assigned_to: detailForm.assigned_to,
        admin_notes: detailForm.admin_notes,
        is_read: true
      });

      const updated = res.data?.item || {
        ...selectedRequest,
        ...detailForm,
        is_read: true,
        updated_at: new Date().toISOString()
      };

      setRequests((prev) => prev.map((r) => (String(r.id) === String(selectedRequest.id) ? updated : r)));
      setSelectedRequest(updated);
      setModalFeedback({ type: 'success', msg: 'Request status and admin notes saved successfully.' });
    } catch (err) {
      setModalFeedback({ type: 'error', msg: err.response?.data?.error || err.message || 'Failed to save changes.' });
    } finally {
      setSavingDetail(false);
    }
  };

  const handleDeleteRequest = async (id) => {
    if (!window.confirm('Are you sure you want to delete this enquiry record? This action cannot be undone.')) return;
    try {
      await api.delete(`/book-a-call/${id}`);
      setRequests((prev) => prev.filter((r) => String(r.id) !== String(id)));
      if (selectedRequest && String(selectedRequest.id) === String(id)) {
        setSelectedRequest(null);
      }
    } catch (err) {
      alert('Failed to delete request record.');
    }
  };

  // Metrics KPI calculations
  const stats = useMemo(() => {
    const total = requests.length;
    const countNew = requests.filter((r) => r.status === 'NEW' || r.status === 'unread' || !r.status).length;
    const countContacted = requests.filter((r) => r.status === 'CONTACTED').length;
    const countInProgress = requests.filter((r) => r.status === 'IN_PROGRESS').length;
    const countQualified = requests.filter((r) => r.status === 'QUALIFIED' || r.status === 'CONVERTED').length;
    const countClosed = requests.filter((r) => r.status === 'CLOSED').length;

    return { total, countNew, countContacted, countInProgress, countQualified, countClosed };
  }, [requests]);

  // Available unique services for filter
  const uniqueServices = useMemo(() => {
    const set = new Set();
    requests.forEach((r) => {
      if (r.requirement_type || r.service) set.add(r.requirement_type || r.service);
    });
    return Array.from(set);
  }, [requests]);

  // Filtered requests list
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      // Search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const nameMatch = (r.full_name || r.name || '').toLowerCase().includes(query);
        const emailMatch = (r.email || '').toLowerCase().includes(query);
        const companyMatch = (r.company_name || r.company || '').toLowerCase().includes(query);
        const phoneMatch = (r.phone || '').toLowerCase().includes(query);
        const messageMatch = (r.message || '').toLowerCase().includes(query);

        if (!nameMatch && !emailMatch && !companyMatch && !phoneMatch && !messageMatch) {
          return false;
        }
      }

      // Status
      if (statusFilter !== 'ALL') {
        const s = r.status || 'NEW';
        if (statusFilter === 'NEW' && (s !== 'NEW' && s !== 'unread')) return false;
        if (statusFilter !== 'NEW' && s !== statusFilter) return false;
      }

      // Priority
      if (priorityFilter !== 'ALL') {
        const p = r.priority || 'MEDIUM';
        if (p !== priorityFilter) return false;
      }

      // Service
      if (serviceFilter !== 'ALL') {
        const serv = r.requirement_type || r.service;
        if (serv !== serviceFilter) return false;
      }

      return true;
    });
  }, [requests, searchTerm, statusFilter, priorityFilter, serviceFilter]);

  const getStatusBadge = (status) => {
    const s = status ? status.toUpperCase() : 'NEW';
    switch (s) {
      case 'NEW':
      case 'UNREAD':
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-white text-black border border-white">NEW</span>;
      case 'CONTACTED':
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-white/10 text-white border border-[var(--admin-border)]">CONTACTED</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-white/10 text-white border border-[var(--admin-border)]">IN PROGRESS</span>;
      case 'QUALIFIED':
      case 'CONVERTED':
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-transparent text-white border border-white font-bold">QUALIFIED</span>;
      case 'CLOSED':
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-transparent text-neutral-400 border border-neutral-700">CLOSED</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-transparent text-neutral-300 border border-[var(--admin-border)]">{s}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    const p = priority ? priority.toUpperCase() : 'MEDIUM';
    switch (p) {
      case 'URGENT':
      case 'HIGH':
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-white text-black border border-white">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-white/10 text-white border border-[var(--admin-border)]">MED</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-transparent text-neutral-400 border border-neutral-700">LOW</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">{p}</span>;
    }
  };

  return (
    <div className="space-y-6 admin-theme">
      {/* Header */}
      <div className="border-b border-[rgba(255,255,255,0.15)] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-xs text-white uppercase tracking-widest mb-1 flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-white" />
            SMRIKAAM LEAD MANAGEMENT &amp; INQUIRIES
          </div>
          <h1 className="font-heading text-3xl font-bold uppercase text-white">
            BOOK A CALL &amp; ENQUIRIES
          </h1>
        </div>

        <div className="flex items-center gap-3 self-start md:self-center">
          {lastRefreshed && (
            <span className="text-[11px] font-mono text-white hidden sm:inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Synced {lastRefreshed}
            </span>
          )}
          <button
            onClick={() => fetchRequests(false)}
            disabled={loading}
            className="admin-btn text-xs py-2 px-4 flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Submissions
          </button>
        </div>
      </div>

      {/* KPI Cards Header Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => setStatusFilter('ALL')}
          className={`bg-[#111111] border p-4 cursor-pointer transition-colors ${
            statusFilter === 'ALL' ? 'border-white bg-white/10' : 'border-[rgba(255,255,255,0.15)] hover:border-white/50'
          }`}
        >
          <div className="font-mono text-[10px] text-[#666666] uppercase tracking-wider mb-1">TOTAL ENQUIRIES</div>
          <div className="font-heading text-2xl font-bold text-white">{stats.total}</div>
        </div>

        <div
          onClick={() => setStatusFilter('NEW')}
          className={`bg-[#111111] border p-4 cursor-pointer transition-colors ${
            statusFilter === 'NEW' ? 'border-white bg-white/10' : 'border-[rgba(255,255,255,0.15)] hover:border-white/50'
          }`}
        >
          <div className="font-mono text-[10px] text-white uppercase tracking-wider mb-1">NEW / UNREAD</div>
          <div className="font-heading text-2xl font-bold text-white">{stats.countNew}</div>
        </div>

        <div
          onClick={() => setStatusFilter('CONTACTED')}
          className={`bg-[#111111] border p-4 cursor-pointer transition-colors ${
            statusFilter === 'CONTACTED' ? 'border-white bg-white/10' : 'border-[rgba(255,255,255,0.15)] hover:border-white/50'
          }`}
        >
          <div className="font-mono text-[10px] text-white uppercase tracking-wider mb-1">CONTACTED</div>
          <div className="font-heading text-2xl font-bold text-white">{stats.countContacted}</div>
        </div>

        <div
          onClick={() => setStatusFilter('IN_PROGRESS')}
          className={`bg-[#111111] border p-4 cursor-pointer transition-colors ${
            statusFilter === 'IN_PROGRESS' ? 'border-white bg-white/10' : 'border-[rgba(255,255,255,0.15)] hover:border-white/50'
          }`}
        >
          <div className="font-mono text-[10px] text-white uppercase tracking-wider mb-1">IN PROGRESS</div>
          <div className="font-heading text-2xl font-bold text-white">{stats.countInProgress}</div>
        </div>

        <div
          onClick={() => setStatusFilter('QUALIFIED')}
          className={`bg-[#111111] border p-4 cursor-pointer transition-colors ${
            statusFilter === 'QUALIFIED' ? 'border-white bg-white/10' : 'border-[rgba(255,255,255,0.15)] hover:border-white/50'
          }`}
        >
          <div className="font-mono text-[10px] text-white uppercase tracking-wider mb-1">QUALIFIED / CONVERTED</div>
          <div className="font-heading text-2xl font-bold text-white">{stats.countQualified}</div>
        </div>

        <div
          onClick={() => setStatusFilter('CLOSED')}
          className={`bg-[#111111] border p-4 cursor-pointer transition-colors ${
            statusFilter === 'CLOSED' ? 'border-neutral-400 bg-white/10' : 'border-[rgba(255,255,255,0.15)] hover:border-white/50'
          }`}
        >
          <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider mb-1">CLOSED</div>
          <div className="font-heading text-2xl font-bold text-neutral-400">{stats.countClosed}</div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-[#111111] border border-[rgba(255,255,255,0.15)] p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search bar */}
          <div className="md:col-span-5 relative">
            <input
              type="text"
              placeholder="Search by Name, Company, Email, Phone, or Message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-input pl-9 text-xs w-full"
            />
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#666666]" />
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="admin-input text-xs w-full"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">NEW / Unread</option>
              <option value="CONTACTED">CONTACTED</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="QUALIFIED">QUALIFIED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="md:col-span-2">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="admin-input text-xs w-full"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High / Urgent</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Service Filter */}
          <div className="md:col-span-3">
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="admin-input text-xs w-full truncate"
            >
              <option value="ALL">All Service Areas</option>
              {uniqueServices.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table / List */}
      {loading ? (
        <div className="font-mono text-sm text-[#666666] py-16 text-center">
          LOADING_DATABASE_ENQUIRIES...
        </div>
      ) : (
        <BlueprintWrapper dark className="admin-surface">
          <div className="admin-table-wrapper overflow-x-auto">
            <table className="admin-table w-full text-left">
              <thead>
                <tr>
                  <th className="w-24">State</th>
                  <th className="w-16">Prio</th>
                  <th>Full Name &amp; Role</th>
                  <th>Company &amp; Work Email</th>
                  <th>Service &amp; Preferred Slot</th>
                  <th>Source</th>
                  <th>Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center font-mono text-xs text-[#666666] py-12">
                      NO BOOK A CALL REQUESTS MATCH THE SELECTED FILTERS.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => {
                    const isNew = req.status === 'NEW' || req.status === 'unread' || !req.status;
                    return (
                      <tr
                        key={req.id}
                        className={`transition-colors ${
                          isNew ? 'bg-white/5 font-semibold' : 'hover:bg-white/5'
                        }`}
                      >
                        <td>{getStatusBadge(req.status)}</td>
                        <td>{getPriorityBadge(req.priority)}</td>
                        <td>
                          <div className="text-white font-bold text-xs">{req.full_name || req.name}</div>
                          {req.job_title && <div className="text-[11px] text-[#666666] font-mono">{req.job_title}</div>}
                        </td>
                        <td>
                          <div className="text-xs text-white font-medium">{req.company_name || req.company || 'N/A'}</div>
                          <div className="font-mono text-[11px] text-white">{req.email}</div>
                          {req.phone && <div className="font-mono text-[10px] text-[#666666]">{req.phone}</div>}
                        </td>
                        <td>
                          <div className="text-xs text-white font-medium truncate max-w-[200px]">
                            {req.requirement_type || req.service}
                          </div>
                          {(req.preferred_date || req.preferredDate) && (
                            <div className="font-mono text-[10px] text-white flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3" />
                              {req.preferred_date || req.preferredDate} ({req.preferred_time || req.preferredTime || '10:00 AM'})
                            </div>
                          )}
                        </td>
                        <td className="font-mono text-[11px] text-[#666666]">
                          {req.source || 'Public Form'}
                        </td>
                        <td className="font-mono text-xs text-[#666666] whitespace-nowrap">
                          {new Date(req.created_at).toLocaleDateString()}
                        </td>
                        <td className="text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openDetailModal(req)}
                              className="admin-btn text-xs py-1 px-2.5 flex items-center gap-1 cursor-pointer"
                              title="View & Edit Details"
                            >
                              <Eye className="w-3.5 h-3.5 text-white" /> Review
                            </button>
                            <button
                              onClick={() => handleDeleteRequest(req.id)}
                              className="p-1.5 text-neutral-400 hover:text-white hover:bg-white/10 border border-transparent hover:border-white/30 transition-colors cursor-pointer"
                              title="Delete Record"
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
        </BlueprintWrapper>
      )}

      {/* DETAIL VIEW & EDIT MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl my-auto bg-[#111111] border border-[rgba(255,255,255,0.2)] p-6 md:p-8 text-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.15)] pb-4 mb-6">
              <div>
                <div className="font-mono text-xs text-white uppercase tracking-widest mb-1 flex items-center gap-2">
                  <UserCheck className="w-4 h-4" /> ENQUIRY &amp; CALL REQUEST SPECIFICATION
                </div>
                <h2 className="font-heading text-2xl font-bold uppercase text-white">
                  {selectedRequest.full_name || selectedRequest.name} — {selectedRequest.company_name || selectedRequest.company}
                </h2>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-2 text-neutral-400 hover:text-white border border-[rgba(255,255,255,0.2)] hover:border-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Contact & Request Specs */}
              <div className="space-y-4 bg-[#000000] border border-[rgba(255,255,255,0.1)] p-4 text-xs">
                <div className="font-mono text-[11px] text-white font-bold uppercase tracking-wider border-b border-[rgba(255,255,255,0.1)] pb-2 mb-3">
                  CONTACT INFORMATION
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-white text-sm">{selectedRequest.full_name || selectedRequest.name}</div>
                      {selectedRequest.job_title && <div className="text-gray-400 font-mono text-[11px]">{selectedRequest.job_title}</div>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-gray-400 shrink-0" />
                    <div className="text-gray-200 font-semibold">{selectedRequest.company_name || selectedRequest.company || 'N/A'}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-white shrink-0" />
                    <a href={`mailto:${selectedRequest.email}`} className="text-white hover:underline font-mono">
                      {selectedRequest.email}
                    </a>
                  </div>

                  {selectedRequest.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-white shrink-0" />
                      <a href={`tel:${selectedRequest.phone}`} className="text-white hover:underline font-mono">
                        {selectedRequest.phone}
                      </a>
                    </div>
                  )}
                </div>

                <div className="font-mono text-[11px] text-white font-bold uppercase tracking-wider border-b border-[rgba(255,255,255,0.1)] pt-4 pb-2 mb-3">
                  REQUEST DETAILS
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-gray-400 font-mono">Service Area:</span>
                    <div className="font-bold text-white mt-0.5">{selectedRequest.requirement_type || selectedRequest.service}</div>
                  </div>

                  {(selectedRequest.preferred_date || selectedRequest.preferredDate) && (
                    <div>
                      <span className="text-gray-400 font-mono">Preferred Slot:</span>
                      <div className="font-mono text-white font-bold">
                        {selectedRequest.preferred_date || selectedRequest.preferredDate} @ {selectedRequest.preferred_time || selectedRequest.preferredTime || '10:00 AM'}
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="text-gray-400 font-mono">Channel Source:</span>
                    <div className="font-mono text-gray-300">{selectedRequest.source || 'Public Website'}</div>
                  </div>

                  <div>
                    <span className="text-gray-400 font-mono">Submitted Date:</span>
                    <div className="font-mono text-gray-300">{new Date(selectedRequest.created_at).toLocaleString()}</div>
                  </div>
                </div>

                <div className="border-t border-[rgba(255,255,255,0.1)] pt-3">
                  <span className="text-gray-400 font-mono">Message / Requirements:</span>
                  <p className="mt-1 p-3 bg-[#111111] border border-[rgba(255,255,255,0.1)] text-gray-200 leading-relaxed font-normal whitespace-pre-wrap max-h-36 overflow-y-auto">
                    {selectedRequest.message || 'No additional message text provided.'}
                  </p>
                </div>
              </div>

              {/* Right Column: Admin Management & Notes Form */}
              <form onSubmit={handleSaveDetail} className="space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="font-mono text-[11px] text-white font-bold uppercase tracking-wider border-b border-[rgba(255,255,255,0.1)] pb-2">
                    ADMIN LEAD STATUS &amp; ASSIGNMENT
                  </div>

                  {modalFeedback.msg && (
                    <div
                      className={`p-3 text-xs flex items-center gap-2 border-l-4 ${
                        modalFeedback.type === 'success'
                          ? 'border-white bg-white/10 text-white'
                          : 'border-white bg-neutral-900 text-white'
                      }`}
                    >
                      {modalFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-white" /> : <AlertTriangle className="w-4 h-4 shrink-0 text-white" />}
                      <span>{modalFeedback.msg}</span>
                    </div>
                  )}

                  {/* Status Dropdown */}
                  <div>
                    <label htmlFor="admin-status" className="block text-[11px] font-mono text-gray-400 uppercase tracking-wider mb-1">
                      Lead Pipeline Status *
                    </label>
                    <select
                      id="admin-status"
                      value={detailForm.status}
                      onChange={(e) => setDetailForm({ ...detailForm, status: e.target.value })}
                      className="admin-input text-xs w-full font-bold"
                    >
                      <option value="NEW">NEW (Unread / Needs Contact)</option>
                      <option value="CONTACTED">CONTACTED (Follow-up Email/Call Sent)</option>
                      <option value="IN_PROGRESS">IN PROGRESS (Discovery Session Scheduled)</option>
                      <option value="QUALIFIED">QUALIFIED (Architecture Report Sent)</option>
                      <option value="CONVERTED">CONVERTED (Engaged Client)</option>
                      <option value="CLOSED">CLOSED (Archived / Unqualified)</option>
                    </select>
                  </div>

                  {/* Priority Dropdown */}
                  <div>
                    <label htmlFor="admin-priority" className="block text-[11px] font-mono text-gray-400 uppercase tracking-wider mb-1">
                      Lead Priority *
                    </label>
                    <select
                      id="admin-priority"
                      value={detailForm.priority}
                      onChange={(e) => setDetailForm({ ...detailForm, priority: e.target.value })}
                      className="admin-input text-xs w-full font-semibold"
                    >
                      <option value="URGENT">URGENT (24-Hour SLA Target)</option>
                      <option value="HIGH">HIGH (Enterprise Opportunity)</option>
                      <option value="MEDIUM">MEDIUM (Standard Inquiry)</option>
                      <option value="LOW">LOW (General Inquiry)</option>
                    </select>
                  </div>

                  {/* Assigned To */}
                  <div>
                    <label htmlFor="admin-assigned" className="block text-[11px] font-mono text-gray-400 uppercase tracking-wider mb-1">
                      Assigned Engineering Lead / Owner
                    </label>
                    <input
                      type="text"
                      id="admin-assigned"
                      placeholder="e.g. Ramesh Kumar — Lead Architect"
                      value={detailForm.assigned_to}
                      onChange={(e) => setDetailForm({ ...detailForm, assigned_to: e.target.value })}
                      className="admin-input text-xs w-full"
                    />
                  </div>

                  {/* Internal Admin Notes */}
                  <div>
                    <label htmlFor="admin-notes" className="block text-[11px] font-mono text-gray-400 uppercase tracking-wider mb-1">
                      Internal Admin &amp; Discovery Notes
                    </label>
                    <textarea
                      id="admin-notes"
                      rows={5}
                      placeholder="Log call notes, technical requirements, follow-up dates, proposed budget..."
                      value={detailForm.admin_notes}
                      onChange={(e) => setDetailForm({ ...detailForm, admin_notes: e.target.value })}
                      className="admin-input text-xs w-full"
                    />
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="pt-4 border-t border-[rgba(255,255,255,0.1)] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedRequest(null)}
                    className="admin-btn text-xs py-2 px-4"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={savingDetail}
                    className="btn btn-primary text-xs py-2 px-6 font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                  >
                    {savingDetail ? 'SAVING...' : 'SAVE LEAD STATUS & NOTES'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

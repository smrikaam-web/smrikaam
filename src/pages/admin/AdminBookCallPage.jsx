import React, { useState, useEffect, useMemo } from 'react';
import {
  PhoneCall, Search, Filter, RefreshCw, Eye, Trash2, CheckCircle2,
  Clock, AlertCircle, Calendar, User, Building, Mail, Phone, Briefcase,
  Tag, AlertTriangle, ShieldCheck, MessageSquare, ChevronRight, X, UserCheck
} from 'lucide-react';
import api from '../../api';

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
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-[#111111] text-white border border-[#111111]">NEW</span>;
      case 'CONTACTED':
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-[#F7F7F7] text-[#111111] border border-[#E5E5E5]">CONTACTED</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-[#F7F7F7] text-[#111111] border border-[#E5E5E5]">IN PROGRESS</span>;
      case 'QUALIFIED':
      case 'CONVERTED':
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-white text-[#111111] border border-[#111111] font-bold">QUALIFIED</span>;
      case 'CLOSED':
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-[#F7F7F7] text-[#888888] border border-[#E5E5E5]">CLOSED</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-white text-[#555555] border border-[#E5E5E5]">{s}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    const p = priority ? priority.toUpperCase() : 'MEDIUM';
    switch (p) {
      case 'URGENT':
      case 'HIGH':
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-[#111111] text-white border border-[#111111]">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-[#F7F7F7] text-[#111111] border border-[#E5E5E5]">MED</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-white text-[#888888] border border-[#E5E5E5]">LOW</span>;
      default:
        return <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-[#888888]">{p}</span>;
    }
  };

  return (
    <div className="space-y-6 text-[#111111]">
      {/* Header */}
      <div className="border-b border-[#E5E5E5] pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-xs text-[#888888] uppercase tracking-widest mb-1 flex items-center gap-2 font-semibold">
            <PhoneCall className="w-4 h-4 text-[#111111]" />
            SMRIKAAM LEAD MANAGEMENT &amp; INQUIRIES
          </div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold uppercase text-[#111111] tracking-tight">
            BOOK A CALL &amp; ENQUIRIES
          </h1>
        </div>

        <div className="flex items-center gap-3 self-start md:self-center">
          {lastRefreshed && (
            <span className="text-[11px] font-mono text-[#666666] hidden sm:inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#111111] animate-pulse" />
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
          className={`bg-white border p-4 cursor-pointer transition-colors ${
            statusFilter === 'ALL' ? 'border-[#111111] bg-[#F7F7F7]' : 'border-[#E5E5E5] hover:border-[#111111]'
          }`}
        >
          <div className="font-mono text-[10px] text-[#666666] uppercase tracking-wider mb-1 font-semibold">TOTAL ENQUIRIES</div>
          <div className="font-heading text-2xl font-bold text-[#111111]">{stats.total}</div>
        </div>

        <div
          onClick={() => setStatusFilter('NEW')}
          className={`bg-white border p-4 cursor-pointer transition-colors ${
            statusFilter === 'NEW' ? 'border-[#111111] bg-[#F7F7F7]' : 'border-[#E5E5E5] hover:border-[#111111]'
          }`}
        >
          <div className="font-mono text-[10px] text-[#666666] uppercase tracking-wider mb-1 font-semibold">NEW / UNREAD</div>
          <div className="font-heading text-2xl font-bold text-[#111111]">{stats.countNew}</div>
        </div>

        <div
          onClick={() => setStatusFilter('CONTACTED')}
          className={`bg-white border p-4 cursor-pointer transition-colors ${
            statusFilter === 'CONTACTED' ? 'border-[#111111] bg-[#F7F7F7]' : 'border-[#E5E5E5] hover:border-[#111111]'
          }`}
        >
          <div className="font-mono text-[10px] text-[#666666] uppercase tracking-wider mb-1 font-semibold">CONTACTED</div>
          <div className="font-heading text-2xl font-bold text-[#111111]">{stats.countContacted}</div>
        </div>

        <div
          onClick={() => setStatusFilter('IN_PROGRESS')}
          className={`bg-white border p-4 cursor-pointer transition-colors ${
            statusFilter === 'IN_PROGRESS' ? 'border-[#111111] bg-[#F7F7F7]' : 'border-[#E5E5E5] hover:border-[#111111]'
          }`}
        >
          <div className="font-mono text-[10px] text-[#666666] uppercase tracking-wider mb-1 font-semibold">IN PROGRESS</div>
          <div className="font-heading text-2xl font-bold text-[#111111]">{stats.countInProgress}</div>
        </div>

        <div
          onClick={() => setStatusFilter('QUALIFIED')}
          className={`bg-white border p-4 cursor-pointer transition-colors ${
            statusFilter === 'QUALIFIED' ? 'border-[#111111] bg-[#F7F7F7]' : 'border-[#E5E5E5] hover:border-[#111111]'
          }`}
        >
          <div className="font-mono text-[10px] text-[#666666] uppercase tracking-wider mb-1 font-semibold">QUALIFIED</div>
          <div className="font-heading text-2xl font-bold text-[#111111]">{stats.countQualified}</div>
        </div>

        <div
          onClick={() => setStatusFilter('CLOSED')}
          className={`bg-white border p-4 cursor-pointer transition-colors ${
            statusFilter === 'CLOSED' ? 'border-[#111111] bg-[#F7F7F7]' : 'border-[#E5E5E5] hover:border-[#111111]'
          }`}
        >
          <div className="font-mono text-[10px] text-[#888888] uppercase tracking-wider mb-1 font-semibold">CLOSED</div>
          <div className="font-heading text-2xl font-bold text-[#888888]">{stats.countClosed}</div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-[#F7F7F7] border border-[#E5E5E5] p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search bar */}
          <div className="md:col-span-5 relative">
            <input
              type="text"
              placeholder="Search by Name, Company, Email, Phone, or Message..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-[#E5E5E5] text-[#111111] pl-9 pr-3 py-2 text-xs w-full focus:border-[#111111] focus:outline-none placeholder-[#888888] font-mono"
            />
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#888888]" />
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-[#E5E5E5] text-[#111111] p-2 text-xs w-full focus:border-[#111111] focus:outline-none font-mono cursor-pointer"
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
              className="bg-white border border-[#E5E5E5] text-[#111111] p-2 text-xs w-full focus:border-[#111111] focus:outline-none font-mono cursor-pointer"
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
              className="bg-white border border-[#E5E5E5] text-[#111111] p-2 text-xs w-full truncate focus:border-[#111111] focus:outline-none font-mono cursor-pointer"
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
        <div className="font-mono text-sm text-[#888888] py-16 text-center">
          LOADING_DATABASE_ENQUIRIES...
        </div>
      ) : (
        <div className="bg-white border border-[#E5E5E5]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-[#E5E5E5] bg-[#F7F7F7] text-[#111111] uppercase tracking-wider font-bold">
                  <th className="p-3.5 w-24">State</th>
                  <th className="p-3.5 w-16">Prio</th>
                  <th className="p-3.5">Full Name &amp; Role</th>
                  <th className="p-3.5">Company &amp; Work Email</th>
                  <th className="p-3.5">Service &amp; Preferred Slot</th>
                  <th className="p-3.5">Source</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center font-mono text-xs text-[#888888] py-12">
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
                          isNew ? 'bg-[#F7F7F7] font-semibold' : 'hover:bg-[#F7F7F7]'
                        }`}
                      >
                        <td className="p-3.5">{getStatusBadge(req.status)}</td>
                        <td className="p-3.5">{getPriorityBadge(req.priority)}</td>
                        <td className="p-3.5">
                          <div className="text-[#111111] font-bold text-xs">{req.full_name || req.name}</div>
                          {req.job_title && <div className="text-[11px] text-[#666666] font-mono">{req.job_title}</div>}
                        </td>
                        <td className="p-3.5">
                          <div className="text-xs text-[#111111] font-medium">{req.company_name || req.company || 'N/A'}</div>
                          <div className="font-mono text-[11px] text-[#333333]">{req.email}</div>
                          {req.phone && <div className="font-mono text-[10px] text-[#666666]">{req.phone}</div>}
                        </td>
                        <td className="p-3.5">
                          <div className="text-xs text-[#111111] font-medium truncate max-w-[200px]">
                            {req.requirement_type || req.service}
                          </div>
                          {(req.preferred_date || req.preferredDate) && (
                            <div className="font-mono text-[10px] text-[#555555] flex items-center gap-1 mt-0.5">
                              <Calendar className="w-3 h-3 text-[#111111]" />
                              {req.preferred_date || req.preferredDate} ({req.preferred_time || req.preferredTime || '10:00 AM'})
                            </div>
                          )}
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-[#666666]">
                          {req.source || 'Public Form'}
                        </td>
                        <td className="p-3.5 font-mono text-xs text-[#666666] whitespace-nowrap">
                          {new Date(req.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openDetailModal(req)}
                              className="admin-btn text-xs py-1 px-2.5 flex items-center gap-1 cursor-pointer"
                              title="View & Edit Details"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#111111]" /> Review
                            </button>
                            <button
                              onClick={() => handleDeleteRequest(req.id)}
                              className="p-1.5 text-[#888888] hover:text-[#111111] hover:bg-[#F7F7F7] border border-transparent hover:border-[#E5E5E5] transition-colors cursor-pointer"
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
        </div>
      )}

      {/* DETAIL VIEW & EDIT MODAL */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl my-auto bg-white border border-[#E5E5E5] p-6 md:p-8 text-[#111111] shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4 mb-6">
              <div>
                <div className="font-mono text-xs text-[#888888] uppercase tracking-widest mb-1 flex items-center gap-2 font-semibold">
                  <UserCheck className="w-4 h-4 text-[#111111]" /> ENQUIRY &amp; CALL REQUEST SPECIFICATION
                </div>
                <h2 className="font-heading text-xl md:text-2xl font-bold uppercase text-[#111111]">
                  {selectedRequest.full_name || selectedRequest.name} — {selectedRequest.company_name || selectedRequest.company}
                </h2>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-1.5 text-[#666666] hover:text-[#111111] border border-[#E5E5E5] hover:border-[#111111] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Contact & Request Specs */}
              <div className="space-y-4 bg-[#F7F7F7] border border-[#E5E5E5] p-4 text-xs font-mono">
                <div className="text-[11px] text-[#111111] font-bold uppercase tracking-wider border-b border-[#E5E5E5] pb-2 mb-3">
                  CONTACT INFORMATION
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-[#666666] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-[#111111] text-sm">{selectedRequest.full_name || selectedRequest.name}</div>
                      {selectedRequest.job_title && <div className="text-[#666666] font-mono text-[11px]">{selectedRequest.job_title}</div>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-[#666666] shrink-0" />
                    <div className="text-[#333333] font-semibold">{selectedRequest.company_name || selectedRequest.company || 'N/A'}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#111111] shrink-0" />
                    <a href={`mailto:${selectedRequest.email}`} className="text-[#111111] hover:underline font-mono">
                      {selectedRequest.email}
                    </a>
                  </div>

                  {selectedRequest.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-[#111111] shrink-0" />
                      <a href={`tel:${selectedRequest.phone}`} className="text-[#111111] hover:underline font-mono">
                        {selectedRequest.phone}
                      </a>
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-[#111111] font-bold uppercase tracking-wider border-b border-[#E5E5E5] pt-4 pb-2 mb-3">
                  REQUEST DETAILS
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-[#666666]">Service Area:</span>
                    <div className="font-bold text-[#111111] mt-0.5">{selectedRequest.requirement_type || selectedRequest.service}</div>
                  </div>

                  {(selectedRequest.preferred_date || selectedRequest.preferredDate) && (
                    <div>
                      <span className="text-[#666666]">Preferred Slot:</span>
                      <div className="text-[#111111] font-bold">
                        {selectedRequest.preferred_date || selectedRequest.preferredDate} @ {selectedRequest.preferred_time || selectedRequest.preferredTime || '10:00 AM'}
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="text-[#666666]">Channel Source:</span>
                    <div className="text-[#333333]">{selectedRequest.source || 'Public Website'}</div>
                  </div>

                  <div>
                    <span className="text-[#666666]">Submitted Date:</span>
                    <div className="text-[#333333]">{new Date(selectedRequest.created_at).toLocaleString()}</div>
                  </div>
                </div>

                <div className="border-t border-[#E5E5E5] pt-3">
                  <span className="text-[#666666]">Message / Requirements:</span>
                  <p className="mt-1 p-3 bg-white border border-[#E5E5E5] text-[#333333] leading-relaxed font-sans whitespace-pre-wrap max-h-36 overflow-y-auto">
                    {selectedRequest.message || 'No additional message text provided.'}
                  </p>
                </div>
              </div>

              {/* Right Column: Admin Management & Notes Form */}
              <form onSubmit={handleSaveDetail} className="space-y-4 flex flex-col justify-between">
                <div className="space-y-4 font-mono">
                  <div className="text-[11px] text-[#111111] font-bold uppercase tracking-wider border-b border-[#E5E5E5] pb-2">
                    ADMIN LEAD STATUS &amp; ASSIGNMENT
                  </div>

                  {modalFeedback.msg && (
                    <div
                      className={`p-3 text-xs flex items-center gap-2 border-l-4 ${
                        modalFeedback.type === 'success'
                          ? 'border-[#111111] bg-[#F7F7F7] text-[#111111]'
                          : 'border-[#111111] bg-[#F7F7F7] text-[#111111]'
                      }`}
                    >
                      {modalFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-[#111111]" /> : <AlertTriangle className="w-4 h-4 shrink-0 text-[#111111]" />}
                      <span>{modalFeedback.msg}</span>
                    </div>
                  )}

                  {/* Status Dropdown */}
                  <div>
                    <label htmlFor="admin-status" className="block text-[11px] text-[#666666] uppercase tracking-wider mb-1 font-semibold">
                      Lead Pipeline Status *
                    </label>
                    <select
                      id="admin-status"
                      value={detailForm.status}
                      onChange={(e) => setDetailForm({ ...detailForm, status: e.target.value })}
                      className="bg-white border border-[#E5E5E5] text-[#111111] p-2 text-xs w-full font-bold focus:border-[#111111] focus:outline-none cursor-pointer"
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
                    <label htmlFor="admin-priority" className="block text-[11px] text-[#666666] uppercase tracking-wider mb-1 font-semibold">
                      Lead Priority *
                    </label>
                    <select
                      id="admin-priority"
                      value={detailForm.priority}
                      onChange={(e) => setDetailForm({ ...detailForm, priority: e.target.value })}
                      className="bg-white border border-[#E5E5E5] text-[#111111] p-2 text-xs w-full font-semibold focus:border-[#111111] focus:outline-none cursor-pointer"
                    >
                      <option value="URGENT">URGENT (24-Hour SLA Target)</option>
                      <option value="HIGH">HIGH (Enterprise Opportunity)</option>
                      <option value="MEDIUM">MEDIUM (Standard Inquiry)</option>
                      <option value="LOW">LOW (General Inquiry)</option>
                    </select>
                  </div>

                  {/* Assigned To */}
                  <div>
                    <label htmlFor="admin-assigned" className="block text-[11px] text-[#666666] uppercase tracking-wider mb-1 font-semibold">
                      Assigned Engineering Lead / Owner
                    </label>
                    <input
                      type="text"
                      id="admin-assigned"
                      placeholder="e.g. Ramesh Kumar — Lead Architect"
                      value={detailForm.assigned_to}
                      onChange={(e) => setDetailForm({ ...detailForm, assigned_to: e.target.value })}
                      className="bg-white border border-[#E5E5E5] text-[#111111] p-2 text-xs w-full focus:border-[#111111] focus:outline-none"
                    />
                  </div>

                  {/* Internal Admin Notes */}
                  <div>
                    <label htmlFor="admin-notes" className="block text-[11px] text-[#666666] uppercase tracking-wider mb-1 font-semibold">
                      Internal Admin &amp; Discovery Notes
                    </label>
                    <textarea
                      id="admin-notes"
                      rows={5}
                      placeholder="Log call notes, technical requirements, follow-up dates, proposed budget..."
                      value={detailForm.admin_notes}
                      onChange={(e) => setDetailForm({ ...detailForm, admin_notes: e.target.value })}
                      className="bg-white border border-[#E5E5E5] text-[#111111] p-2.5 text-xs w-full focus:border-[#111111] focus:outline-none font-sans"
                    />
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="pt-4 border-t border-[#E5E5E5] flex items-center justify-end gap-3 font-mono">
                  <button
                    type="button"
                    onClick={() => setSelectedRequest(null)}
                    className="admin-btn text-xs py-2 px-4 cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={savingDetail}
                    className="admin-btn-primary text-xs py-2 px-6 font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
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

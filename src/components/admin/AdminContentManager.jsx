import React, { useState, useEffect } from 'react';
import {
  Plus, Edit2, Trash2, CheckCircle, Clock, Archive, X, Save,
  Search, Eye, Upload, FileText, CheckSquare, Square, RotateCcw,
  Sparkles, Download
} from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import BlueprintWrapper from '../BlueprintWrapper';
import RichEditor from './RichEditor';

export default function AdminContentManager({ resource, title, fields, defaultStatusFilter = 'all' }) {
  const { fetchAdmin, createItem, updateItem, updateStatus, deleteItem, restoreItem, bulkAction, importDocx, uploadPdf } = useCMS();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(defaultStatusFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [importingDoc, setImportingDoc] = useState(false);

  // Preview state
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAdmin(resource, {
        status: statusFilter,
        search: searchQuery
      });
      setItems(Array.isArray(data) ? data : []);
      setSelectedIds([]);
    } catch (err) {
      console.error(`Error loading ${resource}:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [resource, statusFilter, searchQuery]);

  const openCreateModal = () => {
    const initial = {};
    fields.forEach((f) => {
      if (f.type === 'array') initial[f.name] = [];
      else if (f.type === 'json') initial[f.name] = [];
      else if (f.name === 'status') initial[f.name] = 'published';
      else initial[f.name] = '';
    });
    setFormData(initial);
    setEditingItem(null);
    setErrorMsg('');
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    const data = { ...item };
    setFormData(data);
    setEditingItem(item);
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (name, commaSeparated) => {
    const arr = commaSeparated.split(',').map((s) => s.trim()).filter(Boolean);
    setFormData((prev) => ({ ...prev, [name]: arr }));
  };

  const handleSave = async (targetStatus) => {
    setSaving(true);
    setErrorMsg('');

    try {
      const payload = { ...formData };
      if (targetStatus) {
        payload.status = targetStatus;
      }

      // Auto-generate slug if empty
      if (!payload.slug && (payload.title || payload.name)) {
        payload.slug = (payload.title || payload.name)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }

      if (editingItem) {
        await updateItem(resource, editingItem.id, payload);
      } else {
        await createItem(resource, payload);
      }

      setModalOpen(false);
      loadData();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message || 'Failed to save record.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateStatus(resource, id, newStatus);
      loadData();
    } catch (err) {
      alert('Status update failed');
    }
  };

  const handleDelete = async (id, permanent = false) => {
    const promptText = permanent
      ? 'Permanently delete this item? This action cannot be undone.'
      : 'Move this item to Trash?';
    if (!window.confirm(promptText)) return;

    try {
      await deleteItem(resource, id, permanent);
      loadData();
    } catch (err) {
      alert('Delete action failed');
    }
  };

  const handleRestore = async (id) => {
    try {
      await restoreItem(resource, id);
      loadData();
    } catch (err) {
      alert('Restore action failed');
    }
  };

  // Bulk Actions
  const toggleSelectAll = () => {
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map((i) => i.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulk = async (action) => {
    if (selectedIds.length === 0) return;
    try {
      await bulkAction(resource, selectedIds, action);
      loadData();
    } catch (err) {
      alert('Bulk action failed');
    }
  };

  // Document Import (DOCX / PDF)
  const handleDocxImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportingDoc(true);
    setErrorMsg('');

    try {
      if (file.name.endsWith('.docx') || file.name.endsWith('.doc')) {
        const result = await importDocx(file);
        setFormData((prev) => ({
          ...prev,
          title: prev.title || result.title,
          content: `${prev.content ? prev.content + '\n\n' : ''}${result.content}`,
          cover_image_url: prev.cover_image_url || (result.images?.[0]?.url || '')
        }));
      } else if (file.name.endsWith('.pdf')) {
        const result = await uploadPdf(file);
        setFormData((prev) => ({
          ...prev,
          pdf_url: result.url,
          title: prev.title || file.name.replace('.pdf', '')
        }));
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Document extraction failed.');
    } finally {
      setImportingDoc(false);
      e.target.value = '';
    }
  };

  const renderStatusBadge = (status) => {
    if (status === 'published') {
      return (
        <span className="admin-badge-published flex items-center gap-1 w-fit">
          <CheckCircle className="w-3 h-3" /> Published
        </span>
      );
    } else if (status === 'draft') {
      return (
        <span className="admin-badge-draft flex items-center gap-1 w-fit">
          <Clock className="w-3 h-3" /> Draft
        </span>
      );
    } else if (status === 'trash') {
      return (
        <span className="bg-rose-950/80 text-rose-300 border border-rose-500/50 px-2 py-0.5 text-[11px] font-mono flex items-center gap-1 w-fit">
          <Trash2 className="w-3 h-3" /> In Trash
        </span>
      );
    }
    return (
      <span className="admin-badge-archived flex items-center gap-1 w-fit">
        <Archive className="w-3 h-3" /> Archived
      </span>
    );
  };

  return (
    <div className="admin-theme space-y-6">
      {/* Header Bar */}
      <div className="border-b border-[rgba(255,255,255,0.15)] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-xs text-[#4fd1c5] uppercase tracking-widest mb-1">
            CONTENT MANAGEMENT — {resource.toUpperCase()}
          </div>
          <h1 className="font-heading text-3xl font-bold uppercase text-[#f4f4f4]">
            MANAGE {title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={openCreateModal} className="btn btn-primary text-xs font-bold">
            <Plus className="w-4 h-4" strokeWidth={1.5} /> CREATE NEW {title.slice(0, -1).toUpperCase()}
          </button>
        </div>
      </div>

      {/* Filter, Search & Bulk Actions Bar */}
      <div className="bg-[#141924] border border-[rgba(255,255,255,0.15)] p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
          {['all', 'published', 'draft', 'archived', 'trash'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                statusFilter === st
                  ? 'bg-[#4fd1c5] text-[#0b0e14] font-bold'
                  : 'bg-[#1c2333] text-gray-300 hover:text-white'
              }`}
            >
              {st === 'all' ? 'All Records' : st.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${title.toLowerCase()}...`}
            className="input w-full pl-9 py-1.5 text-xs bg-[#1c2333] border-[rgba(255,255,255,0.2)] text-[#f4f4f4]"
          />
        </div>
      </div>

      {/* Bulk Actions Banner */}
      {selectedIds.length > 0 && (
        <div className="bg-[#1c2333] border border-[#4fd1c5]/40 p-3 flex items-center justify-between font-mono text-xs text-[#f4f4f4]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#4fd1c5]">{selectedIds.length}</span> items selected
          </div>
          <div className="flex items-center gap-2">
            {statusFilter !== 'published' && (
              <button
                type="button"
                onClick={() => handleBulk('publish')}
                className="px-2.5 py-1 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-500/50"
              >
                Bulk Publish
              </button>
            )}
            {statusFilter !== 'draft' && (
              <button
                type="button"
                onClick={() => handleBulk('unpublish')}
                className="px-2.5 py-1 bg-amber-900/60 hover:bg-amber-800 text-amber-200 border border-amber-500/50"
              >
                Bulk Unpublish
              </button>
            )}
            {statusFilter === 'trash' ? (
              <button
                type="button"
                onClick={() => handleBulk('restore')}
                className="px-2.5 py-1 bg-blue-900/60 hover:bg-blue-800 text-blue-200 border border-blue-500/50"
              >
                Bulk Restore
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleBulk('trash')}
                className="px-2.5 py-1 bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-500/50"
              >
                Move to Trash
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content Table */}
      {loading ? (
        <div className="font-mono text-sm text-[#9aa3b5] py-16 text-center">
          LOADING_{resource.toUpperCase()}...
        </div>
      ) : (
        <BlueprintWrapper dark className="admin-surface">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="w-10">
                    <button type="button" onClick={toggleSelectAll} className="text-gray-400 hover:text-white">
                      {selectedIds.length === items.length && items.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-[#4fd1c5]" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th>Title / Name</th>
                  <th>Slug / Route</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center font-mono text-xs text-[#9aa3b5] py-12">
                      NO RECORDS FOUND FOR CURRENT FILTER.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const isSelected = selectedIds.includes(item.id);
                    return (
                      <tr key={item.id} className={isSelected ? 'bg-[#1c2333]/80' : ''}>
                        <td>
                          <button type="button" onClick={() => toggleSelect(item.id)} className="text-gray-400 hover:text-white">
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-[#4fd1c5]" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                        <td>
                          <div className="font-semibold text-[#f4f4f4]">
                            {item.title || item.name || 'Untitled'}
                          </div>
                          {item.category && (
                            <span className="font-mono text-[10px] text-[#4fd1c5] bg-[#1c2333] px-1.5 py-0.5 mt-0.5 inline-block">
                              {item.category}
                            </span>
                          )}
                        </td>
                        <td className="font-mono text-xs text-[#9aa3b5]">
                          /{resource === 'posts' ? 'blog' : resource}/{item.slug}
                        </td>
                        <td>{renderStatusBadge(item.status)}</td>
                        <td className="font-mono text-xs text-[#9aa3b5]">
                          {new Date(item.updated_at || item.created_at).toLocaleDateString()}
                        </td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {item.status === 'trash' ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleRestore(item.id)}
                                  className="admin-btn text-xs py-1 px-2 text-emerald-400 hover:text-emerald-200 border-emerald-500/40"
                                  title="Restore"
                                >
                                  <RotateCcw className="w-3.5 h-3.5 inline mr-1" /> Restore
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(item.id, true)}
                                  className="admin-btn text-xs py-1 px-2 text-rose-400 hover:text-rose-200 border-rose-500/40"
                                  title="Permanently Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <>
                                <select
                                  value={item.status}
                                  onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                  className="bg-[#1c2333] text-xs font-mono text-[#f4f4f4] border border-[rgba(255,255,255,0.25)] px-2 py-1 focus:border-[#4fd1c5]"
                                >
                                  <option value="draft">Draft</option>
                                  <option value="published">Publish</option>
                                  <option value="archived">Archive</option>
                                </select>

                                <button
                                  type="button"
                                  onClick={() => openEditModal(item)}
                                  className="admin-btn p-1.5 text-[#f4f4f4]"
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDelete(item.id, false)}
                                  className="admin-btn p-1.5 text-rose-400 hover:text-rose-200 border-rose-500/40"
                                  title="Move to Trash"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
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

      {/* Editor Modal */}
      {modalOpen && (
        <div className="dialog-backdrop">
          <BlueprintWrapper dark className="dialog admin-dialog max-w-4xl w-full">
            <div className="dialog-title flex items-center justify-between border-b border-[rgba(255,255,255,0.15)] pb-4">
              <span className="font-heading text-xl text-[#f4f4f4] uppercase">
                {editingItem ? `EDIT ${title.slice(0, -1)}` : `CREATE NEW ${title.slice(0, -1)}`}
              </span>

              {/* Import DOCX / PDF helper */}
              <div className="flex items-center gap-2">
                <label className="admin-btn text-xs py-1.5 px-3 cursor-pointer bg-[#1c2333] hover:bg-[#273248] text-[#4fd1c5] border-[#4fd1c5]/40 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{importingDoc ? 'EXTRACTING...' : 'IMPORT DOCX / PDF'}</span>
                  <input
                    type="file"
                    accept=".docx,.doc,.pdf"
                    onChange={handleDocxImport}
                    disabled={importingDoc}
                    className="hidden"
                  />
                </label>

                <button onClick={() => setModalOpen(false)} className="text-[#9aa3b5] hover:text-[#f4f4f4]">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="my-4 p-3 bg-rose-950/90 border border-rose-500 text-rose-200 font-mono text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={(e) => e.preventDefault()} className="dialog-body space-y-4 max-h-[65vh] overflow-y-auto pr-2 my-4">
              {fields.map((field) => {
                const val = formData[field.name];

                if (field.type === 'richtext' || field.name === 'content') {
                  return (
                    <div key={field.name} className="field">
                      <label className="text-xs font-mono text-[#9aa3b5] uppercase mb-1 block">
                        {field.label} {field.required ? '*' : ''}
                      </label>
                      <RichEditor
                        value={val || ''}
                        onChange={(newVal) => handleInputChange(field.name, newVal)}
                        placeholder="Write detailed markdown article or documentation..."
                      />
                    </div>
                  );
                }

                if (field.type === 'textarea') {
                  return (
                    <div key={field.name} className="field">
                      <label className="text-xs font-mono text-[#9aa3b5] uppercase mb-1 block">
                        {field.label} {field.required ? '*' : ''}
                      </label>
                      <textarea
                        rows={field.rows || 4}
                        required={field.required}
                        value={val || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        className="input w-full bg-[#1c2333] border-[rgba(255,255,255,0.25)] text-[#f4f4f4]"
                        placeholder={field.placeholder || ''}
                      />
                    </div>
                  );
                }

                if (field.type === 'array') {
                  const arrString = Array.isArray(val) ? val.join(', ') : (val || '');
                  return (
                    <div key={field.name} className="field">
                      <label className="text-xs font-mono text-[#9aa3b5] uppercase mb-1 block">
                        {field.label} (Comma-separated)
                      </label>
                      <input
                        type="text"
                        value={arrString}
                        onChange={(e) => handleArrayChange(field.name, e.target.value)}
                        className="input w-full bg-[#1c2333] border-[rgba(255,255,255,0.25)] text-[#f4f4f4]"
                        placeholder={field.placeholder || 'e.g. Item 1, Item 2, Item 3'}
                      />
                    </div>
                  );
                }

                if (field.type === 'select') {
                  return (
                    <div key={field.name} className="field">
                      <label className="text-xs font-mono text-[#9aa3b5] uppercase mb-1 block">
                        {field.label}
                      </label>
                      <select
                        value={val || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        className="input w-full bg-[#1c2333] border-[rgba(255,255,255,0.25)] text-[#f4f4f4]"
                      >
                        {field.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                }

                return (
                  <div key={field.name} className="field">
                    <label className="text-xs font-mono text-[#9aa3b5] uppercase mb-1 block">
                      {field.label} {field.required ? '*' : ''}
                    </label>
                    <input
                      type={field.type || 'text'}
                      required={field.required}
                      value={val || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className="input w-full bg-[#1c2333] border-[rgba(255,255,255,0.25)] text-[#f4f4f4]"
                      placeholder={field.placeholder || ''}
                    />
                    {field.help && <span className="font-mono text-[10px] text-[#9aa3b5] block mt-0.5">{field.help}</span>}
                  </div>
                );
              })}
            </form>

            <div className="dialog-actions border-t border-[rgba(255,255,255,0.15)] pt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSave('draft')}
                  disabled={saving}
                  className="admin-btn text-xs"
                >
                  <Save className="w-3.5 h-3.5 inline mr-1" /> SAVE DRAFT
                </button>
                <button
                  type="button"
                  onClick={() => handleSave('published')}
                  disabled={saving}
                  className="btn btn-primary text-xs font-bold"
                >
                  <CheckCircle className="w-3.5 h-3.5 inline mr-1" /> {saving ? 'PUBLISHING...' : 'PUBLISH ITEM'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="admin-btn text-xs text-gray-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </BlueprintWrapper>
        </div>
      )}
    </div>
  );
}

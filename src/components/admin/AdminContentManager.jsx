import React, { useState, useEffect } from 'react';
import {
  Plus, Edit2, Trash2, CheckCircle, Clock, Archive, X, Save,
  Search, Eye, Upload, FileText, CheckSquare, Square, RotateCcw,
  Sparkles, Download
} from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import BlueprintWrapper from '../BlueprintWrapper';
import RichEditor from './RichEditor';
import { cleanSlug } from '../../utils/slug';

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

      // Auto-generate or sanitize slug
      if (!payload.slug && (payload.title || payload.name)) {
        payload.slug = cleanSlug(payload.title || payload.name);
      } else if (payload.slug) {
        payload.slug = cleanSlug(payload.slug);
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
        <span className="bg-transparent text-neutral-400 border border-neutral-700 px-2 py-0.5 text-[11px] font-mono flex items-center gap-1 w-fit">
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
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="border-b border-[#E5E5E5] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-xs text-[#666666] uppercase tracking-widest mb-1 font-semibold">
            CONTENT MANAGEMENT &mdash; {resource.toUpperCase()}
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#111111]">
            MANAGE {title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openCreateModal}
            className="text-xs font-bold py-2.5 px-5 flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer bg-[#111111] text-white hover:bg-[#333333] border border-[#111111] transition-colors"
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} /> CREATE NEW {title.slice(0, -1).toUpperCase()}
          </button>
        </div>
      </div>

      {/* Filter, Search & Bulk Actions Bar */}
      <div className="bg-[#F7F7F7] border border-[#E5E5E5] p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
          {['all', 'published', 'draft', 'archived', 'trash'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#111111] text-white border border-[#111111] font-bold'
                  : 'bg-white text-[#666666] border border-[#E5E5E5] hover:text-[#111111] hover:bg-[#F7F7F7]'
              }`}
            >
              {st === 'all' ? 'All Records' : st.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#888888] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${title.toLowerCase()}...`}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#E5E5E5] text-[#111111] placeholder:text-[#888888] focus:border-[#111111] focus:outline-none"
          />
        </div>
      </div>

      {/* Bulk Actions Banner */}
      {selectedIds.length > 0 && (
        <div className="bg-[#F7F7F7] border border-[#E5E5E5] p-3 flex items-center justify-between font-mono text-xs text-[#111111]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#111111]">{selectedIds.length}</span> items selected
          </div>
          <div className="flex items-center gap-2">
            {statusFilter !== 'published' && (
              <button
                type="button"
                onClick={() => handleBulk('publish')}
                className="px-2.5 py-1 bg-[#111111] hover:bg-[#333333] text-white border border-[#111111] font-bold transition-colors cursor-pointer"
              >
                Bulk Publish
              </button>
            )}
            {statusFilter !== 'draft' && (
              <button
                type="button"
                onClick={() => handleBulk('unpublish')}
                className="px-2.5 py-1 bg-white hover:bg-[#F7F7F7] text-[#111111] border border-[#E5E5E5] transition-colors cursor-pointer"
              >
                Bulk Unpublish
              </button>
            )}
            {statusFilter === 'trash' ? (
              <button
                type="button"
                onClick={() => handleBulk('restore')}
                className="px-2.5 py-1 bg-white hover:bg-[#F7F7F7] text-[#111111] border border-[#E5E5E5] font-bold transition-colors cursor-pointer"
              >
                Bulk Restore
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleBulk('trash')}
                className="px-2.5 py-1 bg-white hover:bg-[#F7F7F7] text-[#666666] hover:text-[#111111] border border-[#E5E5E5] transition-colors cursor-pointer"
              >
                Move to Trash
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content Table */}
      {loading ? (
        <div className="font-mono text-xs text-[#666666] py-16 text-center bg-white border border-[#E5E5E5]">
          LOADING_{resource.toUpperCase()}...
        </div>
      ) : (
        <div className="bg-white border border-[#E5E5E5] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-[#E5E5E5] bg-[#F7F7F7] text-[#333333] uppercase tracking-wider font-semibold">
                  <th className="w-10 p-3.5">
                    <button type="button" onClick={toggleSelectAll} className="text-[#888888] hover:text-[#111111]">
                      {selectedIds.length === items.length && items.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-[#111111]" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="p-3.5">Title / Name</th>
                  <th className="p-3.5">Slug / Route</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Updated</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5] bg-white">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center font-mono text-xs text-[#666666] py-12">
                      NO RECORDS FOUND FOR CURRENT FILTER.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const isSelected = selectedIds.includes(item.id);
                    return (
                      <tr key={item.id} className={`hover:bg-[#F7F7F7] transition-colors ${isSelected ? 'bg-[#F7F7F7]' : ''}`}>
                        <td className="p-3.5">
                          <button type="button" onClick={() => toggleSelect(item.id)} className="text-[#888888] hover:text-[#111111]">
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-[#111111]" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-[#111111] font-sans text-sm">
                            {item.title || item.name || 'Untitled'}
                          </div>
                          {item.category && (
                            <span className="font-mono text-[10px] text-[#333333] bg-[#F7F7F7] border border-[#E5E5E5] px-1.5 py-0.5 mt-0.5 inline-block">
                              {item.category}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 font-mono text-xs text-[#666666]">
                          /{resource === 'posts' ? 'blog' : resource}/{cleanSlug(item.slug)}
                        </td>
                        <td className="p-3.5">{renderStatusBadge(item.status)}</td>
                        <td className="p-3.5 font-mono text-xs text-[#666666]">
                          {new Date(item.updated_at || item.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {item.status === 'trash' ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleRestore(item.id)}
                                  className="text-xs py-1 px-2.5 bg-white text-[#111111] hover:bg-[#F7F7F7] border border-[#E5E5E5] transition-colors cursor-pointer"
                                  title="Restore"
                                >
                                  <RotateCcw className="w-3.5 h-3.5 inline mr-1" /> Restore
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(item.id, true)}
                                  className="text-xs p-1.5 bg-white text-[#666666] hover:text-[#111111] hover:border-[#111111] border border-[#E5E5E5] transition-colors cursor-pointer"
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
                                  className="bg-white text-xs font-mono text-[#111111] border border-[#E5E5E5] px-2 py-1 focus:border-[#111111] focus:outline-none cursor-pointer"
                                >
                                  <option value="draft">Draft</option>
                                  <option value="published">Publish</option>
                                  <option value="archived">Archive</option>
                                </select>

                                <button
                                  type="button"
                                  onClick={() => openEditModal(item)}
                                  className="text-xs p-1.5 bg-white text-[#111111] hover:bg-[#F7F7F7] border border-[#E5E5E5] transition-colors cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDelete(item.id, false)}
                                  className="text-xs p-1.5 bg-white text-[#666666] hover:text-[#111111] hover:border-[#111111] border border-[#E5E5E5] transition-colors cursor-pointer"
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
        </div>
      )}

      {/* Editor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-[#E5E5E5] shadow-2xl max-w-4xl w-full p-6 sm:p-8 space-y-6 relative max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4 shrink-0">
              <span className="font-heading text-xl text-[#111111] font-bold uppercase">
                {editingItem ? `EDIT ${title.slice(0, -1)}` : `CREATE NEW ${title.slice(0, -1)}`}
              </span>

              {/* Import DOCX / PDF helper */}
              <div className="flex items-center gap-2">
                <label className="text-xs py-1.5 px-3 cursor-pointer bg-white hover:bg-[#F7F7F7] text-[#111111] border border-[#E5E5E5] font-mono flex items-center gap-1.5 transition-colors">
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

                <button onClick={() => setModalOpen(false)} className="text-[#888888] hover:text-[#111111] transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-[#F7F7F7] border-l-4 border-[#111111] border border-[#E5E5E5] text-[#111111] font-mono text-xs shrink-0">
                {errorMsg}
              </div>
            )}

            <form onSubmit={(e) => e.preventDefault()} className="space-y-4 overflow-y-auto pr-2 flex-grow">
              {fields.map((field) => {
                const val = formData[field.name];

                if (field.type === 'richtext' || field.name === 'content') {
                  return (
                    <div key={field.name} className="space-y-1">
                      <label className="text-xs font-mono text-[#333333] uppercase font-semibold block">
                        {field.label} {field.required ? '*' : ''}
                      </label>
                      <div className="border border-[#E5E5E5] bg-white p-1">
                        <RichEditor
                          value={val || ''}
                          onChange={(newVal) => handleInputChange(field.name, newVal)}
                          placeholder="Write detailed markdown article or documentation..."
                        />
                      </div>
                    </div>
                  );
                }

                if (field.type === 'textarea') {
                  return (
                    <div key={field.name} className="space-y-1">
                      <label className="text-xs font-mono text-[#333333] uppercase font-semibold block">
                        {field.label} {field.required ? '*' : ''}
                      </label>
                      <textarea
                        rows={field.rows || 4}
                        required={field.required}
                        value={val || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        className="w-full p-2.5 bg-white border border-[#E5E5E5] text-[#111111] text-xs font-sans placeholder:text-[#888888] focus:border-[#111111] focus:outline-none"
                        placeholder={field.placeholder || ''}
                      />
                    </div>
                  );
                }

                if (field.type === 'array') {
                  const arrString = Array.isArray(val) ? val.join(', ') : (val || '');
                  return (
                    <div key={field.name} className="space-y-1">
                      <label className="text-xs font-mono text-[#333333] uppercase font-semibold block">
                        {field.label} (Comma-separated)
                      </label>
                      <input
                        type="text"
                        value={arrString}
                        onChange={(e) => handleArrayChange(field.name, e.target.value)}
                        className="w-full p-2.5 bg-white border border-[#E5E5E5] text-[#111111] text-xs font-mono placeholder:text-[#888888] focus:border-[#111111] focus:outline-none"
                        placeholder={field.placeholder || 'e.g. Item 1, Item 2, Item 3'}
                      />
                    </div>
                  );
                }

                if (field.type === 'select') {
                  return (
                    <div key={field.name} className="space-y-1">
                      <label className="text-xs font-mono text-[#333333] uppercase font-semibold block">
                        {field.label}
                      </label>
                      <select
                        value={val || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        className="w-full p-2.5 bg-white border border-[#E5E5E5] text-[#111111] text-xs font-mono focus:border-[#111111] focus:outline-none cursor-pointer"
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
                  <div key={field.name} className="space-y-1">
                    <label className="text-xs font-mono text-[#333333] uppercase font-semibold block">
                      {field.label} {field.required ? '*' : ''}
                    </label>
                    <input
                      type={field.type || 'text'}
                      required={field.required}
                      value={val || ''}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                      className="w-full p-2.5 bg-white border border-[#E5E5E5] text-[#111111] text-xs font-mono placeholder:text-[#888888] focus:border-[#111111] focus:outline-none"
                      placeholder={field.placeholder || ''}
                    />
                    {field.help && <span className="font-mono text-[10px] text-[#666666] block mt-0.5">{field.help}</span>}
                  </div>
                );
              })}
            </form>

            <div className="border-t border-[#E5E5E5] pt-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSave('draft')}
                  disabled={saving}
                  className="text-xs py-2 px-4 bg-white text-[#111111] hover:bg-[#F7F7F7] border border-[#E5E5E5] font-mono transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 inline mr-1" /> SAVE DRAFT
                </button>
                <button
                  type="button"
                  onClick={() => handleSave('published')}
                  disabled={saving}
                  className="text-xs py-2 px-5 font-bold uppercase tracking-wider cursor-pointer bg-[#111111] text-white hover:bg-[#333333] border border-[#111111] transition-colors"
                >
                  <CheckCircle className="w-3.5 h-3.5 inline mr-1" /> {saving ? 'PUBLISHING...' : 'PUBLISH ITEM'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-xs px-4 py-2 bg-white text-[#666666] hover:text-[#111111] border border-[#E5E5E5] font-mono transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

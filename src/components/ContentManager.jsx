import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, Clock, Archive, X, Save } from 'lucide-react';
import api from '../api';
import BlueprintWrapper from './BlueprintWrapper';

export default function ContentManager({ resource, title, fields }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/${resource}/admin/all`);
      setItems(res.data || []);
    } catch (err) {
      console.error(`Failed to fetch ${resource}`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [resource]);

  const openCreateModal = () => {
    const initial = {};
    fields.forEach((f) => {
      if (f.type === 'array') initial[f.name] = '';
      else if (f.type === 'json') initial[f.name] = '[]';
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
    fields.forEach((f) => {
      if (f.type === 'array' && Array.isArray(data[f.name])) {
        data[f.name] = data[f.name].join(', ');
      } else if (f.type === 'json' && typeof data[f.name] === 'object') {
        data[f.name] = JSON.stringify(data[f.name], null, 2);
      }
    });
    setFormData(data);
    setEditingItem(item);
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleInputChange = (e, field) => {
    setFormData({ ...formData, [field.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');

    try {
      const payload = { ...formData };
      fields.forEach((f) => {
        if (f.type === 'array' && typeof payload[f.name] === 'string') {
          payload[f.name] = payload[f.name]
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        } else if (f.type === 'json' && typeof payload[f.name] === 'string') {
          try {
            payload[f.name] = JSON.parse(payload[f.name]);
          } catch (err) {
            throw new Error(`Invalid JSON format in ${f.label}`);
          }
        }
      });

      if (editingItem) {
        await api.put(`/${resource}/admin/${editingItem.id}`, payload);
      } else {
        await api.post(`/${resource}/admin`, payload);
      }

      setModalOpen(false);
      fetchItems();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message || 'Failed to save item.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/${resource}/admin/${id}/status`, { status: newStatus });
      fetchItems();
    } catch (err) {
      alert(err.response?.data?.error || 'Status update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.delete(`/${resource}/admin/${id}`);
      fetchItems();
    } catch (err) {
      alert(err.response?.data?.error || 'Delete failed');
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
    }
    return (
      <span className="admin-badge-archived flex items-center gap-1 w-fit">
        <Archive className="w-3 h-3" /> Archived
      </span>
    );
  };

  return (
    <div className="admin-theme">
      <div className="border-b border-[rgba(255,255,255,0.15)] pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="font-mono text-xs text-[#4fd1c5] uppercase tracking-widest mb-1">
            CONTENT MANAGER — {resource.toUpperCase()}
          </div>
          <h1 className="font-heading text-3xl font-bold uppercase text-[#f4f4f4]">
            MANAGE {title}
          </h1>
        </div>

        <button onClick={openCreateModal} className="btn btn-primary text-xs font-bold">
          <Plus className="w-4 h-4" strokeWidth={1.5} /> Create New {title.slice(0, -1)}
        </button>
      </div>

      {loading ? (
        <div className="font-mono text-sm text-[#9aa3b5] py-12 text-center">LOADING_{resource.toUpperCase()}...</div>
      ) : (
        <BlueprintWrapper dark className="admin-surface">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title / Name</th>
                  <th>Slug</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center font-mono text-xs text-[#9aa3b5] py-8">
                      NO ITEMS FOUND. CLICK "CREATE NEW" TO ADD ONE.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id}>
                      <td className="font-semibold text-[#f4f4f4]">
                        {item.title || item.name || item.city || 'Untitled'}
                      </td>
                      <td className="font-mono text-xs text-[#4fd1c5]">{item.slug}</td>
                      <td>{renderStatusBadge(item.status)}</td>
                      <td className="font-mono text-xs text-[#9aa3b5]">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
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
                            onClick={() => openEditModal(item)}
                            className="admin-btn p-1.5 text-[#f4f4f4]"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDelete(item.id)}
                            className="admin-btn p-1.5 text-rose-400 hover:text-rose-200 border-rose-500/40"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </BlueprintWrapper>
      )}

      {/* Editor Modal */}
      {modalOpen && (
        <div className="dialog-backdrop">
          <BlueprintWrapper dark className="dialog admin-dialog max-w-2xl">
            <div className="dialog-title flex items-center justify-between border-b border-[rgba(255,255,255,0.15)] pb-4">
              <span className="font-heading text-xl text-[#f4f4f4] uppercase">
                {editingItem ? `EDIT ${title.slice(0, -1)}` : `CREATE NEW ${title.slice(0, -1)}`}
              </span>
              <button onClick={() => setModalOpen(false)} className="text-[#9aa3b5] hover:text-[#f4f4f4]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="my-4 p-3 bg-rose-950/90 border border-rose-500 text-rose-200 font-mono text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="dialog-body space-y-4 max-h-[60vh] overflow-y-auto pr-2 my-4">
              {fields.map((field) => (
                <div key={field.name} className="field">
                  <label className="text-xs font-mono text-[#9aa3b5] uppercase">
                    {field.label} {field.required ? '*' : ''}
                  </label>

                  {field.type === 'textarea' ? (
                    <textarea
                      required={field.required}
                      rows={5}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(e, field)}
                      className="input bg-[#1c2333] border-[rgba(255,255,255,0.25)] text-[#f4f4f4]"
                      placeholder={field.placeholder || ''}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(e, field)}
                      className="input bg-[#1c2333] border-[rgba(255,255,255,0.25)] text-[#f4f4f4]"
                    >
                      {field.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type || 'text'}
                      required={field.required}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleInputChange(e, field)}
                      className="input bg-[#1c2333] border-[rgba(255,255,255,0.25)] text-[#f4f4f4]"
                      placeholder={field.placeholder || ''}
                    />
                  )}
                  {field.help && <span className="font-mono text-[10px] text-[#9aa3b5]">{field.help}</span>}
                </div>
              ))}
            </form>

            <div className="dialog-actions border-t border-[rgba(255,255,255,0.15)] pt-4">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="admin-btn text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="btn btn-primary text-xs font-bold"
              >
                {saving ? 'SAVING...' : 'SAVE ITEM'} <Save className="w-4 h-4 inline ml-1" />
              </button>
            </div>
          </BlueprintWrapper>
        </div>
      )}
    </div>
  );
}

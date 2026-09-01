import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Trash2, RotateCcw, Edit2, Search } from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import BlueprintWrapper from '../../components/BlueprintWrapper';

export default function PublishingLifecyclePage({ viewType = 'published' }) {
  const { fetchAdmin, updateStatus, deleteItem, restoreItem } = useCMS();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadAll = async () => {
    setLoading(true);
    try {
      const collections = [
        { name: 'posts', label: 'Blog Article' },
        { name: 'services', label: 'Service' },
        { name: 'accelerators', label: 'Accelerator' },
        { name: 'industries', label: 'Industry' },
        { name: 'caseStudies', label: 'Case Study' },
        { name: 'reports', label: 'Flash Report' }
      ];

      const allFetched = await Promise.all(
        collections.map(async (col) => {
          const res = await fetchAdmin(col.name === 'caseStudies' ? 'case-studies' : col.name, {
            status: viewType
          });
          return (Array.isArray(res) ? res : []).map((item) => ({
            ...item,
            _collection: col.name === 'caseStudies' ? 'case-studies' : col.name,
            _typeLabel: col.label
          }));
        })
      );

      const flattened = allFetched.flat();
      flattened.sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at));
      setItems(flattened);
    } catch (err) {
      console.error('Failed to load lifecycle items', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [viewType]);

  const handlePublish = async (collection, id) => {
    try {
      await updateStatus(collection, id, 'published');
      loadAll();
    } catch (err) {
      alert('Failed to publish');
    }
  };

  const handleUnpublish = async (collection, id) => {
    try {
      await updateStatus(collection, id, 'draft');
      loadAll();
    } catch (err) {
      alert('Failed to unpublish');
    }
  };

  const handleRestore = async (collection, id) => {
    try {
      await restoreItem(collection, id);
      loadAll();
    } catch (err) {
      alert('Failed to restore item');
    }
  };

  const handlePermanentDelete = async (collection, id) => {
    if (!window.confirm('Permanently delete this record? This action cannot be reversed.')) return;
    try {
      await deleteItem(collection, id, true);
      loadAll();
    } catch (err) {
      alert('Permanent delete failed');
    }
  };

  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (item.title || item.name || '').toLowerCase().includes(q) ||
      (item._typeLabel || '').toLowerCase().includes(q) ||
      (item.slug || '').toLowerCase().includes(q)
    );
  });

  const getTitle = () => {
    if (viewType === 'draft') return 'DRAFTS & IN-PROGRESS CONTENT';
    if (viewType === 'trash') return 'TRASH & SOFT-DELETED ASSETS';
    return 'PUBLISHED & LIVE CONTENT';
  };

  const getSubtitle = () => {
    if (viewType === 'draft') return 'Content saved as drafts that are not visible on public pages.';
    if (viewType === 'trash') return 'Deleted items. You can restore them to Drafts or permanently destroy them.';
    return 'Content currently live and accessible to visitors across all devices.';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-[rgba(255,255,255,0.15)] pb-6">
        <div className="font-mono text-xs text-[#4fd1c5] uppercase tracking-widest mb-1">
          PUBLISHING LIFECYCLE — {viewType.toUpperCase()}
        </div>
        <h1 className="font-heading text-3xl font-bold uppercase text-[#f4f4f4]">
          {getTitle()}
        </h1>
        <p className="font-mono text-xs text-gray-400 mt-1">
          {getSubtitle()}
        </p>
      </div>

      {/* Search Filter */}
      <div className="bg-[#141924] border border-[rgba(255,255,255,0.15)] p-4 flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search within this list..."
            className="input w-full pl-9 py-1.5 text-xs bg-[#1c2333] border-[rgba(255,255,255,0.2)] text-[#f4f4f4]"
          />
        </div>

        <div className="font-mono text-xs text-gray-400">
          Showing <span className="text-[#4fd1c5] font-bold">{filteredItems.length}</span> records
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 font-mono text-xs text-gray-400">
          LOADING_{viewType.toUpperCase()}_ITEMS...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 font-mono text-xs text-gray-400 bg-[#141924] border border-[rgba(255,255,255,0.15)] p-8">
          NO ITEMS FOUND IN {viewType.toUpperCase()}.
        </div>
      ) : (
        <BlueprintWrapper dark className="admin-surface">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title / Name</th>
                  <th>Content Type</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={`${item._collection}_${item.id}`}>
                    <td>
                      <div className="font-semibold text-[#f4f4f4]">
                        {item.title || item.name || 'Untitled'}
                      </div>
                      {item.slug && (
                        <div className="font-mono text-[10px] text-gray-400">
                          /{item._collection}/{item.slug}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className="bg-[#1c2333] text-[#4fd1c5] px-2 py-0.5 text-xs font-mono">
                        {item._typeLabel}
                      </span>
                    </td>
                    <td>
                      {item.status === 'published' ? (
                        <span className="admin-badge-published flex items-center gap-1 w-fit">
                          <CheckCircle className="w-3 h-3" /> Published
                        </span>
                      ) : item.status === 'draft' ? (
                        <span className="admin-badge-draft flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3" /> Draft
                        </span>
                      ) : (
                        <span className="bg-rose-950/80 text-rose-300 border border-rose-500/50 px-2 py-0.5 text-[11px] font-mono flex items-center gap-1 w-fit">
                          <Trash2 className="w-3 h-3" /> In Trash
                        </span>
                      )}
                    </td>
                    <td className="font-mono text-xs text-gray-400">
                      {new Date(item.updated_at || item.created_at).toLocaleDateString()}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {viewType === 'trash' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleRestore(item._collection, item.id)}
                              className="admin-btn text-xs py-1 text-emerald-400 hover:text-emerald-200 border-emerald-500/40"
                            >
                              <RotateCcw className="w-3.5 h-3.5 inline mr-1" /> Restore
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePermanentDelete(item._collection, item.id)}
                              className="admin-btn text-xs py-1 text-rose-400 hover:text-rose-200 border-rose-500/40"
                            >
                              <Trash2 className="w-3.5 h-3.5 inline mr-1" /> Delete Permanently
                            </button>
                          </>
                        ) : viewType === 'draft' ? (
                          <button
                            type="button"
                            onClick={() => handlePublish(item._collection, item.id)}
                            className="btn btn-primary text-xs py-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5 inline mr-1" /> Publish Now
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleUnpublish(item._collection, item.id)}
                            className="admin-btn text-xs py-1 text-amber-300 hover:text-amber-200 border-amber-500/40"
                          >
                            Unpublish to Draft
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </BlueprintWrapper>
      )}
    </div>
  );
}

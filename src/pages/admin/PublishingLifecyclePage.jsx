import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Trash2, RotateCcw, Edit2, Search } from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import BlueprintWrapper from '../../components/BlueprintWrapper';
import { cleanSlug } from '../../utils/slug';

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
      <div className="border-b border-[#E5E5E5] pb-6">
        <div className="font-mono text-xs text-[#666666] uppercase tracking-widest mb-1 font-semibold">
          PUBLISHING LIFECYCLE &mdash; {viewType.toUpperCase()}
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#111111]">
          {getTitle()}
        </h1>
        <p className="font-mono text-xs text-[#666666] mt-1">
          {getSubtitle()}
        </p>
      </div>

      {/* Search Filter */}
      <div className="bg-[#F7F7F7] border border-[#E5E5E5] p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#888888] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search within this list..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#E5E5E5] text-[#111111] placeholder:text-[#888888] focus:border-[#111111] focus:outline-none"
          />
        </div>

        <div className="font-mono text-xs text-[#666666]">
          Showing <span className="text-[#111111] font-bold">{filteredItems.length}</span> records
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 font-mono text-xs text-[#666666] bg-white border border-[#E5E5E5]">
          LOADING_{viewType.toUpperCase()}_ITEMS...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 font-mono text-xs text-[#666666] bg-white border border-[#E5E5E5] p-8">
          NO ITEMS FOUND IN {viewType.toUpperCase()}.
        </div>
      ) : (
        <div className="bg-white border border-[#E5E5E5] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-[#E5E5E5] bg-[#F7F7F7] text-[#333333] uppercase tracking-wider font-semibold">
                  <th className="p-3.5">Title / Name</th>
                  <th className="p-3.5">Content Type</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Last Updated</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5] bg-white">
                {filteredItems.map((item) => (
                  <tr key={`${item._collection}_${item.id}`} className="hover:bg-[#F7F7F7] transition-colors">
                    <td className="p-3.5">
                      <div className="font-semibold text-[#111111] font-sans text-sm">
                        {item.title || item.name || 'Untitled'}
                      </div>
                      {item.slug && (
                        <div className="font-mono text-[10px] text-[#666666]">
                          /{item._collection === 'posts' ? 'blog' : item._collection}/{cleanSlug(item.slug)}
                        </div>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className="bg-[#F7F7F7] text-[#333333] border border-[#E5E5E5] px-2 py-0.5 text-xs font-mono">
                        {item._typeLabel}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {item.status === 'published' ? (
                        <span className="admin-badge-published flex items-center gap-1 w-fit">
                          <CheckCircle className="w-3 h-3" /> Published
                        </span>
                      ) : item.status === 'draft' ? (
                        <span className="admin-badge-draft flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3" /> Draft
                        </span>
                      ) : (
                        <span className="bg-transparent text-[#666666] border border-[#E5E5E5] px-2 py-0.5 text-[11px] font-mono flex items-center gap-1 w-fit">
                          <Trash2 className="w-3 h-3" /> In Trash
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 font-mono text-xs text-[#666666]">
                      {new Date(item.updated_at || item.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {viewType === 'trash' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleRestore(item._collection, item.id)}
                              className="text-xs py-1 px-2.5 bg-white text-[#111111] hover:bg-[#F7F7F7] border border-[#E5E5E5] font-mono transition-colors cursor-pointer inline-flex items-center"
                            >
                              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Restore
                            </button>
                            <button
                              type="button"
                              onClick={() => handlePermanentDelete(item._collection, item.id)}
                              className="text-xs py-1 px-2.5 bg-white text-[#666666] hover:text-[#111111] hover:border-[#111111] border border-[#E5E5E5] font-mono transition-colors cursor-pointer inline-flex items-center"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Permanently
                            </button>
                          </>
                        ) : viewType === 'draft' ? (
                          <button
                            type="button"
                            onClick={() => handlePublish(item._collection, item.id)}
                            className="text-xs py-1.5 px-4 bg-[#111111] text-white hover:bg-[#333333] border border-[#111111] font-bold uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" /> Publish Now
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleUnpublish(item._collection, item.id)}
                            className="text-xs py-1 px-2.5 bg-white text-[#111111] hover:bg-[#F7F7F7] border border-[#E5E5E5] font-mono transition-colors cursor-pointer"
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
        </div>
      )}
    </div>
  );
}

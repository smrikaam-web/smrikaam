import React, { useState, useEffect } from 'react';
import { Upload, Search, Trash2, Copy, Check, Eye, FileText, Image as ImageIcon, File, X, RefreshCw } from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import BlueprintWrapper from '../BlueprintWrapper';

export default function MediaLibraryView() {
  const { uploadMedia } = useCMS();
  const [mediaList, setMediaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/media?type=${filterType}&search=${encodeURIComponent(searchQuery)}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('smrikaam_admin_token') || ''}`
        }
      });
      const data = await res.json();
      setMediaList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch media', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [filterType, searchQuery]);

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setErrorMsg('');

    try {
      for (let i = 0; i < files.length; i++) {
        await uploadMedia(files[i]);
      }
      fetchMedia();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'File upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this media item?')) return;
    try {
      await fetch(`/api/media/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('smrikaam_admin_token') || ''}`
        }
      });
      fetchMedia();
    } catch (err) {
      alert('Failed to delete media item.');
    }
  };

  const copyToClipboard = (url, id) => {
    const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(255,255,255,0.15)] pb-6">
        <div>
          <div className="font-mono text-xs text-[#4fd1c5] uppercase tracking-widest mb-1">
            ASSETS — PERSISTENT STORAGE
          </div>
          <h1 className="font-heading text-3xl font-bold uppercase text-[#f4f4f4]">
            MEDIA &amp; DOCUMENT LIBRARY
          </h1>
        </div>

        <label className="btn btn-primary text-xs font-bold cursor-pointer inline-flex items-center gap-2">
          <Upload className="w-4 h-4" />
          <span>{uploading ? 'UPLOADING...' : 'UPLOAD NEW ASSETS'}</span>
          <input
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-950/90 border border-rose-500 text-rose-200 font-mono text-xs">
          {errorMsg}
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#141924] p-4 border border-[rgba(255,255,255,0.15)]">
        {/* Type Tabs */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
          {['all', 'image', 'pdf', 'document'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors ${
                filterType === t
                  ? 'bg-[#4fd1c5] text-[#0b0e14] font-bold'
                  : 'bg-[#1c2333] text-gray-300 hover:text-white'
              }`}
            >
              {t === 'all' ? 'All Files' : t === 'image' ? 'Images' : t === 'pdf' ? 'PDFs' : 'DOC/DOCX'}
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
            placeholder="Search media..."
            className="input w-full pl-9 py-1.5 text-xs bg-[#1c2333] border-[rgba(255,255,255,0.2)] text-[#f4f4f4]"
          />
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="text-center py-16 font-mono text-xs text-gray-400">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#4fd1c5]" />
          LOADING_MEDIA_LIBRARY...
        </div>
      ) : mediaList.length === 0 ? (
        <div className="text-center py-16 font-mono text-xs text-gray-400 bg-[#141924] border border-[rgba(255,255,255,0.15)] p-8">
          NO MEDIA ASSETS FOUND. CLICK "UPLOAD NEW ASSETS" TO ADD IMAGES, PDFS, OR DOCX FILES.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mediaList.map((item) => (
            <BlueprintWrapper
              key={item.id}
              dark
              className="bg-[#141924] border border-[rgba(255,255,255,0.15)] p-3 flex flex-col justify-between group hover:border-[#4fd1c5] transition-colors"
            >
              {/* Media Thumbnail */}
              <div className="h-36 w-full bg-[#0b0e14] border border-[rgba(255,255,255,0.1)] flex items-center justify-center overflow-hidden relative mb-3">
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt={item.originalName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : item.type === 'pdf' ? (
                  <div className="flex flex-col items-center gap-1.5 text-rose-400">
                    <FileText className="w-10 h-10" />
                    <span className="font-mono text-[10px] uppercase tracking-wider">PDF DOCUMENT</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-blue-400">
                    <File className="w-10 h-10" />
                    <span className="font-mono text-[10px] uppercase tracking-wider">WORD DOC</span>
                  </div>
                )}

                {/* Hover overlay preview trigger */}
                <button
                  type="button"
                  onClick={() => setPreviewItem(item)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                  title="Click to Preview"
                >
                  <Eye className="w-6 h-6 text-[#4fd1c5]" />
                </button>
              </div>

              {/* Metadata */}
              <div>
                <div className="font-mono text-xs font-bold text-[#f4f4f4] truncate mb-1" title={item.originalName}>
                  {item.originalName || item.filename}
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 mb-3">
                  <span>{formatFileSize(item.size)}</span>
                  <span>{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-[rgba(255,255,255,0.12)]">
                <button
                  type="button"
                  onClick={() => copyToClipboard(item.url, item.id)}
                  className="admin-btn text-[11px] py-1 flex-1 justify-center"
                  title="Copy URL"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#4fd1c5] inline mr-1" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 inline mr-1" /> Copy Link
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="admin-btn text-[11px] py-1 px-2 text-rose-400 hover:text-rose-200 border-rose-500/40"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </BlueprintWrapper>
          ))}
        </div>
      )}

      {/* Media Preview Modal */}
      {previewItem && (
        <div className="dialog-backdrop">
          <BlueprintWrapper dark className="dialog admin-dialog max-w-2xl">
            <div className="dialog-title flex items-center justify-between border-b border-[rgba(255,255,255,0.15)] pb-3">
              <span className="font-heading text-lg text-[#f4f4f4] uppercase truncate max-w-md">
                PREVIEW — {previewItem.originalName}
              </span>
              <button onClick={() => setPreviewItem(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 max-h-[65vh] overflow-y-auto flex flex-col items-center justify-center bg-[#0b0e14] p-4 border border-[rgba(255,255,255,0.15)]">
              {previewItem.type === 'image' ? (
                <img
                  src={previewItem.url}
                  alt={previewItem.originalName}
                  className="max-h-[50vh] max-w-full object-contain"
                />
              ) : previewItem.type === 'pdf' ? (
                <iframe
                  src={previewItem.url}
                  title={previewItem.originalName}
                  className="w-full h-96 border-0"
                />
              ) : (
                <div className="text-center py-12 space-y-3 font-mono">
                  <File className="w-16 h-16 text-blue-400 mx-auto" />
                  <div className="text-sm text-gray-200">{previewItem.originalName}</div>
                  <div className="text-xs text-gray-400">Word Document ({formatFileSize(previewItem.size)})</div>
                  <a
                    href={previewItem.url}
                    download
                    className="btn btn-primary text-xs inline-block mt-4"
                  >
                    DOWNLOAD DOCUMENT
                  </a>
                </div>
              )}
            </div>

            <div className="dialog-actions border-t border-[rgba(255,255,255,0.15)] pt-3 flex items-center justify-between">
              <span className="font-mono text-xs text-gray-400">
                URL: <code className="text-[#4fd1c5]">{previewItem.url}</code>
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(previewItem.url, previewItem.id)}
                className="btn btn-primary text-xs"
              >
                Copy Link
              </button>
            </div>
          </BlueprintWrapper>
        </div>
      )}
    </div>
  );
}

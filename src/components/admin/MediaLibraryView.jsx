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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5E5] pb-6">
        <div>
          <div className="font-mono text-xs text-[#666666] uppercase tracking-widest mb-1 font-semibold">
            ASSETS &mdash; PERSISTENT STORAGE
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#111111]">
            MEDIA &amp; DOCUMENT LIBRARY
          </h1>
        </div>

        <label className="text-xs font-bold py-2.5 px-5 cursor-pointer inline-flex items-center gap-2 uppercase tracking-wider bg-[#111111] text-white hover:bg-[#333333] border border-[#111111] transition-colors">
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
        <div className="p-3 bg-[#F7F7F7] border-l-4 border-[#111111] border border-[#E5E5E5] text-[#111111] font-mono text-xs">
          {errorMsg}
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#F7F7F7] p-4 border border-[#E5E5E5]">
        {/* Type Tabs */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
          {['all', 'image', 'pdf', 'document'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                filterType === t
                  ? 'bg-[#111111] text-white border border-[#111111] font-bold'
                  : 'bg-white text-[#666666] border border-[#E5E5E5] hover:text-[#111111] hover:bg-[#F7F7F7]'
              }`}
            >
              {t === 'all' ? 'All Files' : t === 'image' ? 'Images' : t === 'pdf' ? 'PDFs' : 'DOC/DOCX'}
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
            placeholder="Search media..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#E5E5E5] text-[#111111] placeholder:text-[#888888] focus:border-[#111111] focus:outline-none"
          />
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="text-center py-16 font-mono text-xs text-[#666666] bg-white border border-[#E5E5E5]">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#111111]" />
          LOADING_MEDIA_LIBRARY...
        </div>
      ) : mediaList.length === 0 ? (
        <div className="text-center py-16 font-mono text-xs text-[#666666] bg-white border border-[#E5E5E5] p-8">
          NO MEDIA ASSETS FOUND. CLICK &quot;UPLOAD NEW ASSETS&quot; TO ADD IMAGES, PDFS, OR DOCX FILES.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mediaList.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-[#E5E5E5] p-3 flex flex-col justify-between group hover:border-[#111111] transition-colors shadow-sm"
            >
              {/* Media Thumbnail */}
              <div className="h-36 w-full bg-[#F7F7F7] border border-[#E5E5E5] flex items-center justify-center overflow-hidden relative mb-3">
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt={item.originalName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : item.type === 'pdf' ? (
                  <div className="flex flex-col items-center gap-1.5 text-[#111111]">
                    <FileText className="w-10 h-10 text-[#111111]" />
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#666666]">PDF DOCUMENT</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-[#111111]">
                    <File className="w-10 h-10 text-[#111111]" />
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#666666]">WORD DOC</span>
                  </div>
                )}

                {/* Hover overlay preview trigger */}
                <button
                  type="button"
                  onClick={() => setPreviewItem(item)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                  title="Click to Preview"
                >
                  <Eye className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* Metadata */}
              <div>
                <div className="font-mono text-xs font-bold text-[#111111] truncate mb-1" title={item.originalName}>
                  {item.originalName || item.filename}
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-[#666666] mb-3">
                  <span>{formatFileSize(item.size)}</span>
                  <span>{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={() => copyToClipboard(item.url, item.id)}
                  className="text-[11px] py-1.5 flex-1 justify-center bg-white text-[#111111] hover:bg-[#F7F7F7] border border-[#E5E5E5] font-mono transition-colors cursor-pointer inline-flex items-center"
                  title="Copy URL"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#111111] inline mr-1" /> Copied
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
                  className="text-[11px] py-1.5 px-2 bg-white text-[#666666] hover:text-[#111111] hover:border-[#111111] border border-[#E5E5E5] font-mono transition-colors cursor-pointer inline-flex items-center"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Media Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-[#E5E5E5] shadow-2xl max-w-2xl w-full p-6 space-y-4 relative">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
              <span className="font-heading text-lg text-[#111111] font-bold uppercase truncate max-w-md">
                PREVIEW &mdash; {previewItem.originalName}
              </span>
              <button onClick={() => setPreviewItem(null)} className="text-[#888888] hover:text-[#111111] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 max-h-[65vh] overflow-y-auto flex flex-col items-center justify-center bg-[#F7F7F7] p-4 border border-[#E5E5E5]">
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
                  <File className="w-16 h-16 text-[#111111] mx-auto" />
                  <div className="text-sm text-[#111111] font-semibold">{previewItem.originalName}</div>
                  <div className="text-xs text-[#666666]">Word Document ({formatFileSize(previewItem.size)})</div>
                  <a
                    href={previewItem.url}
                    download
                    className="text-xs py-2 px-5 font-bold uppercase tracking-wider inline-block mt-4 bg-[#111111] text-white hover:bg-[#333333] border border-[#111111] transition-colors"
                  >
                    DOWNLOAD DOCUMENT
                  </a>
                </div>
              )}
            </div>

            <div className="border-t border-[#E5E5E5] pt-3 flex items-center justify-between">
              <span className="font-mono text-xs text-[#666666]">
                URL: <code className="text-[#111111] bg-[#F7F7F7] px-1.5 py-0.5 border border-[#E5E5E5]">{previewItem.url}</code>
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(previewItem.url, previewItem.id)}
                className="text-xs py-1.5 px-4 font-mono font-bold uppercase bg-[#111111] text-white hover:bg-[#333333] border border-[#111111] transition-colors cursor-pointer"
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

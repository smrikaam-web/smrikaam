import React, { useState, useEffect } from 'react';
import {
  Plus, Edit2, Trash2, CheckCircle, Clock, Archive, X, Save,
  Search, Eye, Upload, FileText, ArrowLeft, Image as ImageIcon,
  Sparkles, ExternalLink, AlertCircle, Check, Tag, FileCheck,
  FileCode, Layers, ShieldCheck, Loader2
} from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import BlueprintWrapper from '../../components/BlueprintWrapper';
import RichEditor from '../../components/admin/RichEditor';
import { cleanSlug } from '../../utils/slug';

const PREDEFINED_CATEGORIES = [
  'Industrial IoT (IIoT)',
  'Generative AI & LLM Systems',
  'Enterprise Data Engineering',
  'DevOps & Cloud Infrastructure',
  'Artificial Intelligence & Machine Learning',
  'Data Governance & Security',
  'Integration Services',
  'ServiceNow Solutions',
  'Technology Advisory',
  'Staffing & Pod Augmentation'
];

export default function AdminBlogManager() {
  const { fetchAdmin, createItem, updateItem, updateStatus, deleteItem, importSmartDocument, uploadMedia } = useCMS();

  const [view, setView] = useState('list'); // 'list' | 'editor' | 'preview'
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPostId, setEditingPostId] = useState(null);

  // Filter & Search states for list view
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form state for editor
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'Industrial IoT (IIoT)',
    excerpt: '',
    content: '',
    cover_image_url: '',
    tags: [],
    author: 'SMRIKAAM Engineering Team',
    meta_title: '',
    meta_description: '',
    status: 'draft', // ALWAYS DRAFT ON IMPORT
    sourceType: '',
    sourceFileName: ''
  });

  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [imgLoadError, setImgLoadError] = useState(false);

  // Smart Importer Modal & Processing States
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [importStep, setImportStep] = useState(0); // 0: Idle, 1: Reading, 2: Extracting, 3: Structuring, 4: Complete
  const [importingFile, setImportingFile] = useState(false);
  const [importAuditData, setImportAuditData] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  // Load all posts for admin table
  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await fetchAdmin('posts', {
        status: statusFilter,
        search: searchQuery
      });
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading admin posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [statusFilter, searchQuery]);

  // Open Create Mode
  const handleOpenCreate = () => {
    setFormData({
      title: '',
      slug: '',
      category: 'Industrial IoT (IIoT)',
      excerpt: '',
      content: '',
      cover_image_url: '',
      tags: ['IIoT', 'Cloud', 'Engineering'],
      author: 'SMRIKAAM Engineering Team',
      meta_title: '',
      meta_description: '',
      status: 'draft',
      sourceType: '',
      sourceFileName: ''
    });
    setEditingPostId(null);
    setErrorMsg('');
    setFieldErrors({});
    setSuccessMsg('');
    setImgLoadError(false);
    setView('editor');
  };

  // Open Edit Mode
  const handleOpenEdit = (post) => {
    let parsedTags = [];
    if (Array.isArray(post.tags)) {
      parsedTags = post.tags;
    } else if (typeof post.tags === 'string' && post.tags.trim()) {
      parsedTags = post.tags.split(',').map((t) => t.trim()).filter(Boolean);
    }

    setFormData({
      title: post.title || '',
      slug: cleanSlug(post.slug) || '',
      category: post.category || post.category_id || 'Industrial IoT (IIoT)',
      excerpt: post.excerpt || '',
      content: post.content || '',
      cover_image_url: post.cover_image_url || '',
      tags: parsedTags,
      author: post.author || 'SMRIKAAM Engineering Team',
      meta_title: post.meta_title || '',
      meta_description: post.meta_description || '',
      status: post.status || 'draft',
      sourceType: post.sourceType || '',
      sourceFileName: post.sourceFileName || ''
    });
    setEditingPostId(post.id);
    setErrorMsg('');
    setFieldErrors({});
    setSuccessMsg('');
    setImgLoadError(false);
    setView('editor');
  };

  // Handle title change & auto slug generation
  const handleTitleChange = (val) => {
    setFormData((prev) => {
      const next = { ...prev, title: val };
      const autoSlug = cleanSlug(val);
      if (!prev.slug || prev.slug === cleanSlug(prev.title)) {
        next.slug = autoSlug;
      }
      return next;
    });

    if (fieldErrors.title) {
      setFieldErrors((prev) => ({ ...prev, title: null }));
    }
  };

  // Tag Handling
  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const cleaned = tagInput.replace(',', '').trim();
      if (cleaned && !formData.tags.includes(cleaned)) {
        setFormData((prev) => ({ ...prev, tags: [...prev.tags, cleaned] }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // Smart Document Importer Handler
  const processSmartImport = async (file) => {
    if (!file) return;

    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.pdf', '.docx', '.doc'].includes(ext)) {
      setErrorMsg('Unsupported file format. Please upload a PDF or DOCX file.');
      return;
    }

    setImportingFile(true);
    setErrorMsg('');
    setImportStep(1); // Reading

    try {
      setTimeout(() => setImportStep(2), 600); // Extracting
      setTimeout(() => setImportStep(3), 1200); // Structuring

      const res = await importSmartDocument(file);
      if (res && res.data) {
        const d = res.data;
        setImportStep(4); // Complete
        setImportAuditData(d);

        // Populate formData in draft mode (NEVER AUTO-PUBLISH)
        setFormData({
          title: d.title || '',
          slug: cleanSlug(d.slug || d.title || ''),
          category: d.category || '',
          excerpt: d.excerpt || '',
          content: d.content || '',
          cover_image_url: d.cover_image_url || '',
          tags: d.tags || [],
          author: d.author || '', // Do NOT invent author if missing
          meta_title: d.meta_title || '',
          meta_description: d.meta_description || '',
          status: 'draft', // FORCE DRAFT MODE
          sourceType: d.sourceType || ext.replace('.', '').toUpperCase(),
          sourceFileName: file.name
        });

        setEditingPostId(null);
        setImportModalOpen(false);
        setAuditModalOpen(true);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message || 'Failed to parse document.');
    } finally {
      setImportingFile(false);
      setImportStep(0);
    }
  };

  // Upload Featured Image
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setErrorMsg('');
    try {
      const res = await uploadMedia(file);
      if (res && res.url) {
        setFormData((prev) => ({ ...prev, cover_image_url: res.url }));
        setImgLoadError(false);
        setSuccessMsg('Featured image uploaded successfully.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message || 'Image upload failed.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Clean Markdown helper
  const cleanContentString = (raw) => {
    if (!raw) return '';
    return raw
      .replace(/\r\n/g, '\n')
      .replace(/^#{1,6}\s*$/gm, '')
      .replace(/^>\s*$/gm, '')
      .replace(/^[-*+]\s*$/gm, '')
      .replace(/^\d+\.\s*$/gm, '')
      .replace(/!\[[^\]]*\]\(\s*\)/g, '')
      .replace(/!\[[^\]]*\]\((undefined|null)\)/g, '')
      .replace(/\b(Article content coming soon|Transforming factories, operations, and enterprise systems|No description available|Content unavailable|undefined|null|N\/A)\b/gi, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  // Save / Publish Action with Strict Validation
  const handleSave = async (targetStatus) => {
    setErrorMsg('');
    setSuccessMsg('');
    const errors = {};

    const cleanTitle = (formData.title || '').trim();
    const lowerTitle = cleanTitle.toLowerCase();
    if (!cleanTitle) {
      errors.title = 'Article title is required.';
    } else if (lowerTitle === 'it_blog_article' || lowerTitle === 'untitled' || lowerTitle === 'new blog') {
      errors.title = 'Please enter a genuine descriptive title from the source document.';
    }

    const cleanedBody = cleanContentString(formData.content);
    if (!cleanedBody || cleanedBody.length < 20) {
      errors.content = 'Article content is required.';
    }

    // Strict validation when publishing
    if (targetStatus === 'published') {
      if (!cleanedBody || cleanedBody.length < 50) {
        errors.content = 'Cannot publish: The article does not contain enough readable content to create a published article.';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMsg('Please fix the required fields marked below.');
      return;
    }

    setSaving(true);

    try {
      const finalStatus = targetStatus || formData.status || 'draft';
      const autoSlug = cleanSlug(cleanTitle);
      const finalSlug = cleanSlug(formData.slug) || autoSlug;

      const payload = {
        ...formData,
        title: cleanTitle,
        content: cleanedBody,
        excerpt: (formData.excerpt || '').trim(),
        slug: finalSlug,
        status: finalStatus,
        tags: formData.tags
      };

      if (editingPostId) {
        await updateItem('posts', editingPostId, payload);
        setSuccessMsg(`Article updated successfully (${finalStatus.toUpperCase()}).`);
      } else {
        const created = await createItem('posts', payload);
        if (created?.id) setEditingPostId(created.id);
        setSuccessMsg(
          finalStatus === 'published'
            ? 'Article successfully published!'
            : 'Article draft saved successfully.'
        );
      }

      setFormData((prev) => ({
        ...prev,
        content: cleanedBody,
        status: finalStatus,
        slug: finalSlug
      }));
      await loadPosts();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || err.message || 'Failed to save article.');
    } finally {
      setSaving(false);
    }
  };

  // Delete article
  const handleDeletePost = async (id, permanent = false) => {
    const promptMsg = permanent ? 'Permanently delete this article? This cannot be undone.' : 'Move article to trash?';
    if (!window.confirm(promptMsg)) return;

    try {
      await deleteItem('posts', id, permanent);
      loadPosts();
    } catch (err) {
      alert('Delete failed');
    }
  };

  // Quick Toggle Status (Publish / Unpublish)
  const handleToggleStatus = async (post) => {
    const targetStatus = post.status === 'published' ? 'draft' : 'published';
    try {
      await updateStatus('posts', post.id, targetStatus);
      await loadPosts();
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Failed to update status.');
    }
  };

  // Filtered post list
  const filteredPosts = posts.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const titleMatch = (p.title || '').toLowerCase().includes(q);
      const catMatch = (p.category || '').toLowerCase().includes(q);
      return titleMatch || catMatch;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* VIEW 1: ARTICLE LIST VIEW */}
      {view === 'list' && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5E5] pb-5">
            <div>
              <div className="font-mono text-xs text-[#666666] uppercase tracking-widest font-semibold mb-1">
                ARTICLE MANAGEMENT
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#111111]">
                BLOG ARTICLES &amp; INSIGHTS
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setImportModalOpen(true)}
                className="text-xs font-mono font-bold py-2.5 px-4 flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer bg-white text-[#111111] border border-[#E5E5E5] hover:bg-[#F7F7F7] transition-colors"
              >
                <Upload className="w-4 h-4" /> IMPORT DOCX / PDF
              </button>

              <button
                onClick={handleOpenCreate}
                className="text-xs font-bold py-2.5 px-5 flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer bg-[#111111] text-white hover:bg-[#333333] border border-[#111111] transition-colors"
              >
                <Plus className="w-4 h-4" /> CREATE NEW ARTICLE
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#F7F7F7] p-4 border border-[#E5E5E5]">
            {/* Status Tabs */}
            <div className="flex flex-wrap items-center gap-1">
              {['all', 'published', 'draft', 'archived'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                    statusFilter === st
                      ? 'bg-[#111111] text-white border border-[#111111] font-bold'
                      : 'bg-white text-[#666666] border border-[#E5E5E5] hover:text-[#111111] hover:bg-[#F7F7F7]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative flex-grow max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#888888] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or category..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#E5E5E5] text-xs text-[#111111] placeholder:text-[#888888] focus:border-[#111111] focus:outline-none"
              />
            </div>
          </div>

          {/* Table View */}
          <div className="bg-white border border-[#E5E5E5] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E5E5] bg-[#F7F7F7] text-[#333333] uppercase tracking-wider font-semibold">
                    <th className="p-3.5">Article</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Source</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5] bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-[#666666]">
                        Loading blog articles...
                      </td>
                    </tr>
                  ) : filteredPosts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-[#666666]">
                        No blog articles found. Click &quot;IMPORT DOCX / PDF&quot; or &quot;CREATE NEW ARTICLE&quot; above to get started.
                      </td>
                    </tr>
                  ) : (
                    filteredPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-[#F7F7F7] transition-colors">
                        <td className="p-3.5 max-w-xs sm:max-w-md">
                          <div className="flex items-start gap-3">
                            {post.cover_image_url ? (
                              <img
                                src={post.cover_image_url}
                                alt=""
                                className="w-12 h-9 object-cover shrink-0 border border-[#E5E5E5] rounded-none"
                              />
                            ) : (
                              <div className="w-12 h-9 bg-[#F7F7F7] border border-[#E5E5E5] flex items-center justify-center shrink-0 text-[#888888]">
                                <ImageIcon className="w-4 h-4" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-sans font-bold text-sm text-[#111111] truncate">
                                {post.title}
                              </div>
                              <div className="text-[11px] text-[#666666] truncate mt-0.5">
                                {post.excerpt || cleanSlug(post.slug)}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5 whitespace-nowrap text-[#666666]">
                          <span className="px-2 py-0.5 bg-[#F7F7F7] border border-[#E5E5E5] text-[11px] text-[#333333]">
                            {post.category || 'General'}
                          </span>
                        </td>

                        <td className="p-3.5 whitespace-nowrap">
                          {post.sourceType ? (
                            <span className="px-2 py-0.5 bg-[#F7F7F7] text-[#111111] border border-[#E5E5E5] text-[10px] font-bold uppercase rounded-none flex items-center gap-1 w-max">
                              <FileCode className="w-3 h-3 text-[#111111]" /> {post.sourceType}
                            </span>
                          ) : (
                            <span className="text-[#888888] text-[11px]">Manual</span>
                          )}
                        </td>

                        <td className="p-3.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(post)}
                            title={post.status === 'published' ? 'Click to unpublish (switch to draft)' : 'Click to publish article'}
                            className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-none cursor-pointer transition-colors ${
                              post.status === 'published'
                                ? 'bg-[#111111] text-white border border-[#111111] hover:bg-[#333333]'
                                : post.status === 'draft'
                                ? 'bg-[#F7F7F7] text-[#333333] border border-[#E5E5E5] hover:border-[#111111]'
                                : 'bg-white text-[#666666] border border-[#E5E5E5]'
                            }`}
                          >
                            {post.status || 'draft'}
                          </button>
                        </td>

                        <td className="p-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(post)}
                              className="text-xs py-1 px-2.5 bg-white text-[#111111] hover:bg-[#F7F7F7] border border-[#E5E5E5] cursor-pointer transition-colors"
                              title={post.status === 'published' ? 'Unpublish to Draft' : 'Publish Article'}
                            >
                              {post.status === 'published' ? 'Unpublish' : 'Publish'}
                            </button>

                            <button
                              onClick={() => handleOpenEdit(post)}
                              className="text-xs py-1 px-2.5 bg-white text-[#111111] hover:bg-[#F7F7F7] border border-[#E5E5E5] cursor-pointer transition-colors inline-flex items-center"
                              title="Edit Article"
                            >
                              <Edit2 className="w-3.5 h-3.5 inline mr-1" /> Edit
                            </button>

                            {post.slug && (
                              <a
                                href={`/blog/${cleanSlug(post.slug)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs p-1.5 bg-white text-[#666666] hover:text-[#111111] hover:bg-[#F7F7F7] border border-[#E5E5E5] transition-colors inline-flex items-center"
                                title="View Public Article"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}

                            <button
                              onClick={() => handleDeletePost(post.id, false)}
                              className="text-xs p-1.5 bg-white text-[#666666] hover:text-[#111111] hover:border-[#111111] border border-[#E5E5E5] cursor-pointer transition-colors inline-flex items-center"
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
          </div>
        </div>
      )}

      {/* VIEW 2: PROFESSIONAL 2-COLUMN ARTICLE STUDIO EDITOR */}
      {view === 'editor' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Action Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5E5] pb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView('list')}
                className="text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer text-[#111111] bg-white border border-[#E5E5E5] hover:bg-[#F7F7F7] transition-colors font-mono"
              >
                <ArrowLeft className="w-4 h-4" /> BACK TO BLOGS
              </button>

              <span className="text-[#E5E5E5]">|</span>

              <span className="font-heading text-lg font-bold uppercase text-[#111111]">
                {editingPostId ? 'EDIT ARTICLE' : 'CREATE NEW ARTICLE'}
              </span>

              <span
                className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-none ${
                  formData.status === 'published'
                    ? 'bg-[#111111] text-white border border-[#111111]'
                    : 'bg-[#F7F7F7] text-[#333333] border border-[#E5E5E5]'
                }`}
              >
                {formData.status.toUpperCase()}
              </span>
            </div>

            {/* Header Right Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setImportModalOpen(true)}
                className="text-xs py-1.5 px-3 cursor-pointer bg-white hover:bg-[#F7F7F7] text-[#111111] border border-[#E5E5E5] flex items-center gap-1.5 font-mono transition-colors"
              >
                <Upload className="w-3.5 h-3.5" /> IMPORT DOCX / PDF
              </button>

              <button
                onClick={() => setView('preview')}
                className="text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer bg-white hover:bg-[#F7F7F7] text-[#111111] border border-[#E5E5E5] font-mono transition-colors"
              >
                <Eye className="w-3.5 h-3.5" /> PREVIEW
              </button>

              <button
                type="button"
                onClick={() => handleSave('draft')}
                disabled={saving}
                className="text-xs py-1.5 px-4 cursor-pointer bg-white hover:bg-[#F7F7F7] text-[#111111] border border-[#E5E5E5] font-mono transition-colors"
              >
                <Save className="w-3.5 h-3.5 inline mr-1" /> SAVE DRAFT
              </button>

              <button
                type="button"
                onClick={() => handleSave('published')}
                disabled={saving}
                className="text-xs py-1.5 px-5 font-bold uppercase tracking-wider cursor-pointer bg-[#111111] text-white hover:bg-[#333333] border border-[#111111] transition-colors"
              >
                <CheckCircle className="w-3.5 h-3.5 inline mr-1" />
                {saving ? 'PUBLISHING...' : editingPostId ? 'UPDATE ARTICLE' : 'PUBLISH ARTICLE'}
              </button>
            </div>
          </div>

          {/* Feedback Banners */}
          {errorMsg && (
            <div className="p-3 bg-[#F7F7F7] border-l-4 border-[#111111] border border-[#E5E5E5] text-[#111111] font-mono text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#111111]" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-[#F7F7F7] border-l-4 border-[#111111] border border-[#E5E5E5] text-[#111111] font-mono text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-[#111111]" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 2-Column CMS Studio Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
            {/* LEFT COLUMN: Main Writing Canvas (2 Cols) */}
            <div className="lg:col-span-2 space-y-6">
              {/* 1. Article Title */}
              <div className="bg-white border border-[#E5E5E5] p-5 space-y-2">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#333333] font-semibold">
                  ARTICLE TITLE *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter article title..."
                  className={`w-full bg-white border ${
                    fieldErrors.title ? 'border-red-500' : 'border-[#E5E5E5]'
                  } p-3.5 text-xl sm:text-2xl font-heading font-bold uppercase tracking-tight text-[#111111] focus:border-[#111111] focus:outline-none transition-colors`}
                />
                {fieldErrors.title && (
                  <span className="text-xs font-mono text-red-600 block">{fieldErrors.title}</span>
                )}
              </div>

              {/* 2. Category & Short Description */}
              <div className="bg-white border border-[#E5E5E5] p-5 space-y-4">
                {/* Category Select */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#333333] mb-1.5 font-semibold">
                    CATEGORY
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full p-2.5 bg-white border border-[#E5E5E5] text-xs font-mono text-[#111111] focus:border-[#111111] focus:outline-none cursor-pointer"
                  >
                    {PREDEFINED_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Short Description */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#333333] mb-1.5 font-semibold">
                    SHORT DESCRIPTION / EXCERPT
                  </label>
                  <textarea
                    rows={3}
                    value={formData.excerpt}
                    onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Enter a concise executive summary or brief excerpt of the article..."
                    className="w-full p-3 bg-white border border-[#E5E5E5] text-xs font-sans text-[#111111] leading-relaxed focus:border-[#111111] focus:outline-none placeholder:text-[#888888]"
                  />
                </div>
              </div>

              {/* 3. Main Article Content Editor */}
              <div className="bg-white border border-[#E5E5E5] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#333333] font-semibold">
                    ARTICLE CONTENT *
                  </label>
                  <span className="text-[10px] font-mono text-[#666666]">
                    MARKDOWN POWERED
                  </span>
                </div>

                {fieldErrors.content && (
                  <span className="text-xs font-mono text-red-600 block mb-2">{fieldErrors.content}</span>
                )}

                {/* Visual Start Indicator */}
                <div className="border border-[#E5E5E5] bg-white p-1">
                  <RichEditor
                    value={formData.content}
                    onChange={(val) => {
                      setFormData((prev) => ({ ...prev, content: val }));
                      if (fieldErrors.content) setFieldErrors((prev) => ({ ...prev, content: null }));
                    }}
                    placeholder="Start writing your article here..."
                  />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Settings & Publishing Sidebar (1 Col) */}
            <div className="space-y-6">
              {/* 1. PUBLISHING CONTROL CARD */}
              <div className="bg-white border border-[#E5E5E5] p-5 space-y-4">
                <h3 className="font-mono text-xs font-bold text-[#111111] uppercase tracking-widest border-b border-[#E5E5E5] pb-2.5">
                  PUBLISHING CONTROL
                </h3>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[#666666] mb-1">
                    PUBLISHING STATUS
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                    className="w-full p-2 bg-white border border-[#E5E5E5] text-xs font-mono text-[#111111] focus:border-[#111111] focus:outline-none cursor-pointer"
                  >
                    <option value="draft">Draft (Private / Admin)</option>
                    <option value="published">Published (Live on Website)</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleSave('published')}
                    disabled={saving}
                    className="w-full py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer bg-[#111111] text-white hover:bg-[#333333] border border-[#111111] transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {saving ? 'SAVING...' : editingPostId ? 'UPDATE &amp; PUBLISH' : 'PUBLISH NOW'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSave('draft')}
                    disabled={saving}
                    className="w-full py-2 text-xs uppercase font-mono justify-center cursor-pointer bg-white text-[#111111] hover:bg-[#F7F7F7] border border-[#E5E5E5] transition-colors"
                  >
                    <Save className="w-3.5 h-3.5 inline mr-1" /> SAVE AS DRAFT
                  </button>
                </div>
              </div>

              {/* 2. FEATURED IMAGE CARD */}
              <div className="bg-white border border-[#E5E5E5] p-5 space-y-3">
                <h3 className="font-mono text-xs font-bold text-[#111111] uppercase tracking-widest border-b border-[#E5E5E5] pb-2.5">
                  FEATURED IMAGE
                </h3>

                {/* Live Image Preview Box */}
                <div className="w-full h-40 bg-[#F7F7F7] border border-[#E5E5E5] relative overflow-hidden flex items-center justify-center">
                  {formData.cover_image_url && !imgLoadError ? (
                    <img
                      src={formData.cover_image_url}
                      alt="Featured Preview"
                      onError={() => setImgLoadError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4 space-y-1 text-[#888888]">
                      <ImageIcon className="w-8 h-8 mx-auto opacity-40 text-[#111111]" />
                      <p className="text-[11px] font-mono text-[#666666]">
                        {imgLoadError ? 'Unable to load image URL' : 'No featured image'}
                      </p>
                      <p className="text-[10px] text-[#888888]">
                        Add an image URL below or upload a file to preview.
                      </p>
                    </div>
                  )}
                </div>

                {/* Image URL Input */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[#666666] mb-1">
                    IMAGE URL
                  </label>
                  <input
                    type="text"
                    value={formData.cover_image_url}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, cover_image_url: e.target.value }));
                      setImgLoadError(false);
                    }}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full p-2 bg-white border border-[#E5E5E5] text-xs font-mono text-[#111111] placeholder:text-[#888888] focus:border-[#111111] focus:outline-none"
                  />
                </div>

                {/* Image Upload Action */}
                <label className="w-full py-1.5 text-xs justify-center cursor-pointer flex items-center gap-1.5 border border-dashed border-[#E5E5E5] bg-white text-[#111111] hover:bg-[#F7F7F7] font-mono transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingImage ? 'UPLOADING...' : 'UPLOAD IMAGE FILE'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
              </div>

              {/* 3. METADATA CARD (Author & Interactive Tags) */}
              <div className="bg-white border border-[#E5E5E5] p-5 space-y-4">
                <h3 className="font-mono text-xs font-bold text-[#111111] uppercase tracking-widest border-b border-[#E5E5E5] pb-2.5">
                  ARTICLE METADATA
                </h3>

                {/* Author */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[#666666] mb-1">
                    AUTHOR
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
                    placeholder="SMRIKAAM Engineering Team"
                    className="w-full p-2 bg-white border border-[#E5E5E5] text-xs font-mono text-[#111111] placeholder:text-[#888888] focus:border-[#111111] focus:outline-none"
                  />
                </div>

                {/* Interactive Tag Chips */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[#666666] mb-1.5">
                    TAGS
                  </label>

                  {/* Render Tag Chips */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {formData.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono bg-[#F7F7F7] border border-[#E5E5E5] text-[#111111] rounded-none"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(idx)}
                          className="hover:text-black cursor-pointer ml-0.5 text-[#666666]"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Type tag and press Enter..."
                    className="w-full p-2 bg-white border border-[#E5E5E5] text-xs font-mono text-[#111111] placeholder:text-[#888888] focus:border-[#111111] focus:outline-none"
                  />
                </div>
              </div>

              {/* 4. SEO SETTINGS CARD */}
              <div className="bg-white border border-[#E5E5E5] p-5 space-y-4">
                <h3 className="font-mono text-xs font-bold text-[#111111] uppercase tracking-widest border-b border-[#E5E5E5] pb-2.5">
                  SEO &amp; URL SLUG
                </h3>

                {/* Slug */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[#666666] mb-1">
                    URL SLUG
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: cleanSlug(e.target.value) }))}
                    onBlur={(e) => setFormData((prev) => ({ ...prev, slug: cleanSlug(e.target.value) }))}
                    placeholder="e.g. content-writing-services-in-coimbatore"
                    className="w-full p-2 bg-white border border-[#E5E5E5] text-xs font-mono text-[#111111] placeholder:text-[#888888] focus:border-[#111111] focus:outline-none"
                  />
                  <span className="block text-[9px] font-mono text-[#666666] mt-0.5">
                    Live URL: /blog/{cleanSlug(formData.slug) || 'article-slug'}
                  </span>
                </div>

                {/* Meta Title */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[#666666] mb-1">
                    SEO TITLE TAG
                  </label>
                  <input
                    type="text"
                    value={formData.meta_title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, meta_title: e.target.value }))}
                    placeholder="SEO Title for search engines"
                    className="w-full p-2 bg-white border border-[#E5E5E5] text-xs font-mono text-[#111111] placeholder:text-[#888888] focus:border-[#111111] focus:outline-none"
                  />
                </div>

                {/* Meta Description */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[#666666] mb-1">
                    META DESCRIPTION
                  </label>
                  <textarea
                    rows={2}
                    value={formData.meta_description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, meta_description: e.target.value }))}
                    placeholder="Brief description snippet for Google search..."
                    className="w-full p-2 bg-white border border-[#E5E5E5] text-xs font-sans text-[#111111] placeholder:text-[#888888] focus:border-[#111111] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: FULL ARTICLE PREVIEW MODE */}
      {view === 'preview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Preview Header Bar */}
          <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
            <button
              onClick={() => setView('editor')}
              className="text-xs py-1.5 px-4 flex items-center gap-1.5 cursor-pointer text-[#111111] bg-white hover:bg-[#F7F7F7] border border-[#E5E5E5] font-mono transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> &larr; BACK TO EDITOR
            </button>

            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-[#666666]">PREVIEW MODE</span>
              <button
                type="button"
                onClick={() => handleSave('published')}
                disabled={saving}
                className="text-xs py-1.5 px-5 font-bold uppercase tracking-wider cursor-pointer bg-[#111111] text-white hover:bg-[#333333] border border-[#111111] transition-colors"
              >
                <CheckCircle className="w-3.5 h-3.5 inline mr-1" />
                {saving ? 'PUBLISHING...' : editingPostId ? 'UPDATE ARTICLE' : 'PUBLISH ARTICLE'}
              </button>
            </div>
          </div>

          {/* Rendered Article Wrapper */}
          <div className="bg-white border border-[#E5E5E5] p-6 sm:p-10 max-w-4xl mx-auto space-y-8">
            {/* Category & Date */}
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="px-2.5 py-1 bg-[#111111] text-white border border-[#111111] uppercase font-bold">
                {formData.category || 'GENERAL'}
              </span>
              <span className="text-[#666666]">
                {formData.author || 'SMRIKAAM Team'} &bull; {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight text-[#111111] leading-tight">
              {formData.title || 'Untitled Article'}
            </h1>

            {/* Excerpt */}
            {formData.excerpt && (
              <p className="text-base sm:text-lg text-[#666666] leading-relaxed italic border-l-2 border-[#111111] pl-4">
                {formData.excerpt}
              </p>
            )}

            {/* Featured Image */}
            {formData.cover_image_url && (
              <div className="w-full overflow-hidden border border-[#E5E5E5]">
                <img
                  src={formData.cover_image_url}
                  alt={formData.title}
                  className="w-full h-auto max-h-[450px] object-cover"
                />
              </div>
            )}

            {/* Article Content */}
            <div className="pt-4 border-t border-[#E5E5E5]">
              <RichEditor
                value={formData.content}
                onChange={() => {}}
                placeholder="No article content provided."
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: SMART DOCUMENT UPLOAD DIALOG */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg">
            <div className="bg-white border border-[#E5E5E5] shadow-2xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
                <div>
                  <div className="font-mono text-[10px] text-[#666666] uppercase tracking-widest font-semibold">
                    INTELLIGENT IMPORTER
                  </div>
                  <h3 className="font-heading text-xl font-bold uppercase text-[#111111]">
                    IMPORT BLOG ARTICLE
                  </h3>
                </div>
                <button
                  onClick={() => setImportModalOpen(false)}
                  className="text-[#888888] hover:text-[#111111] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drag & Drop Upload Zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) processSmartImport(file);
                }}
                className={`p-8 border-2 border-dashed text-center transition-all cursor-pointer ${
                  dragOver
                    ? 'border-[#111111] bg-[#F7F7F7]'
                    : 'border-[#E5E5E5] hover:border-[#111111] bg-[#F7F7F7]'
                }`}
              >
                {importingFile ? (
                  <div className="py-6 space-y-3">
                    <Loader2 className="w-10 h-10 text-[#111111] animate-spin mx-auto" />
                    <div className="font-mono text-xs text-[#111111] font-bold uppercase tracking-wider">
                      {importStep === 1 && '1. READING DOCUMENT...'}
                      {importStep === 2 && '2. EXTRACTING CONTENT & IMAGES...'}
                      {importStep === 3 && '3. STRUCTURING DRAFT ARTICLE...'}
                      {importStep === 4 && '4. PARSING COMPLETE!'}
                    </div>
                    <p className="text-[11px] text-[#666666]">
                      Analyzing title, headings, paragraph structure, and media streams...
                    </p>
                  </div>
                ) : (
                  <label className="block space-y-3 cursor-pointer">
                    <Upload className="w-10 h-10 text-[#111111] mx-auto opacity-70" />
                    <div>
                      <p className="text-sm font-sans font-bold text-[#111111]">
                        Drag &amp; Drop PDF or DOCX file here
                      </p>
                      <p className="text-xs text-[#666666] mt-1 font-mono">
                        Supports Microsoft Word (.docx) and Adobe PDF (.pdf)
                      </p>
                    </div>

                    <div className="pt-2">
                      <span className="text-xs py-2 px-5 font-bold uppercase tracking-wider inline-flex items-center gap-1.5 bg-[#111111] text-white hover:bg-[#333333] border border-[#111111] transition-colors">
                        <FileText className="w-4 h-4" /> SELECT PDF / DOCX FILE
                      </span>
                    </div>

                    <input
                      type="file"
                      accept=".pdf,.docx,.doc"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) processSmartImport(file);
                      }}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 border-t border-[#E5E5E5] pt-4">
                <button
                  type="button"
                  onClick={() => setImportModalOpen(false)}
                  className="text-xs px-4 py-2 bg-white text-[#111111] hover:bg-[#F7F7F7] border border-[#E5E5E5] font-mono transition-colors"
                >
                  CANCEL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: IMPORT AUDIT REPORT & REVIEW CONFIRMATION */}
      {auditModalOpen && importAuditData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl">
            <div className="bg-white border border-[#E5E5E5] shadow-2xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[#111111]" />
                  <div>
                    <div className="font-mono text-[10px] text-[#666666] uppercase tracking-widest font-semibold">
                      IMPORT COMPLETE
                    </div>
                    <h3 className="font-heading text-xl font-bold uppercase text-[#111111]">
                      DOCUMENT AUDIT REPORT
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setAuditModalOpen(false)}
                  className="text-[#888888] hover:text-[#111111] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Audit Metadata Summary Grid */}
              <div className="grid grid-cols-2 gap-4 font-mono text-xs bg-[#F7F7F7] p-4 border border-[#E5E5E5]">
                <div>
                  <span className="text-[#666666] block text-[10px] uppercase">DOCUMENT SOURCE</span>
                  <span className="font-bold text-[#111111] flex items-center gap-1 mt-0.5">
                    <FileCode className="w-3.5 h-3.5 text-[#111111]" /> {importAuditData.sourceFileName}
                  </span>
                </div>

                <div>
                  <span className="text-[#666666] block text-[10px] uppercase">SECTIONS &amp; STRUCTURE</span>
                  <span className="font-bold text-[#111111] mt-0.5 block">{importAuditData.sectionsCount || 1} Sections &bull; {importAuditData.paragraphsCount || 1} Paragraphs</span>
                </div>

                <div>
                  <span className="text-[#666666] block text-[10px] uppercase">TITLE DETECTED</span>
                  <span className="font-bold text-[#111111] truncate mt-0.5 block">{importAuditData.title}</span>
                </div>

                <div>
                  <span className="text-[#666666] block text-[10px] uppercase">AUTHOR DETECTED</span>
                  <span className="font-bold text-[#111111] mt-0.5 block">{importAuditData.author || 'Omitted (None in source)'}</span>
                </div>

                <div>
                  <span className="text-[#666666] block text-[10px] uppercase">SUGGESTED CATEGORY</span>
                  <span className="font-bold text-[#111111] mt-0.5 block">{importAuditData.category || 'Omitted'}</span>
                </div>

                <div>
                  <span className="text-[#666666] block text-[10px] uppercase">IMAGES EXTRACTED</span>
                  <span className="font-bold text-[#111111] mt-0.5 block">{importAuditData.extractedImages?.length || 0} Media Assets Saved</span>
                </div>

                <div className="col-span-2 border-t border-[#E5E5E5] pt-2 mt-1 flex items-center justify-between">
                  <span className="text-[#666666] text-[10px] uppercase">INITIAL PUBLISHING STATE</span>
                  <span className="font-bold text-[#111111] uppercase">DRAFT (PENDING REVIEW)</span>
                </div>
              </div>

              {/* Safety Banner */}
              <div className="p-3 bg-[#F7F7F7] border-l-4 border-[#111111] border border-[#E5E5E5] text-[#111111] text-xs font-mono flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-[#111111]" />
                <span>Article is saved in <strong>DRAFT MODE</strong>. Review and edit content before publishing.</span>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between border-t border-[#E5E5E5] pt-4">
                <button
                  type="button"
                  onClick={() => setAuditModalOpen(false)}
                  className="text-xs px-4 py-2 bg-white text-[#111111] hover:bg-[#F7F7F7] border border-[#E5E5E5] font-mono transition-colors"
                >
                  CANCEL
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuditModalOpen(false);
                    setView('editor');
                  }}
                  className="text-xs py-2.5 px-6 font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer bg-[#111111] text-white hover:bg-[#333333] border border-[#111111] transition-colors"
                >
                  <Edit2 className="w-4 h-4" /> REVIEW &amp; EDIT ARTICLE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

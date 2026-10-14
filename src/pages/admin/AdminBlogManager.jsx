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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--admin-border)] pb-5">
            <div>
              <div className="font-mono text-xs text-white uppercase tracking-widest font-semibold mb-1">
                ARTICLE MANAGEMENT
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[var(--admin-text-primary)]">
                BLOG ARTICLES & INSIGHTS
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setImportModalOpen(true)}
                className="admin-btn text-xs font-mono font-bold py-2.5 px-4 flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer bg-[var(--admin-surface)] text-white border border-neutral-700 hover:bg-[var(--admin-surface-hover)]"
              >
                <Upload className="w-4 h-4" /> IMPORT DOCX / PDF
              </button>

              <button
                onClick={handleOpenCreate}
                className="btn btn-primary text-xs font-bold py-2.5 px-5 flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
              >
                <Plus className="w-4 h-4" /> CREATE NEW ARTICLE
              </button>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[var(--admin-surface)] p-4 border border-[var(--admin-border)]">
            {/* Status Tabs */}
            <div className="flex flex-wrap items-center gap-1">
              {['all', 'published', 'draft', 'archived'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                    statusFilter === st
                      ? 'bg-white/10 text-white border border-white/40 font-bold'
                      : 'text-[var(--admin-text-secondary)] hover:text-white hover:bg-[var(--admin-surface-hover)]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative flex-grow max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-secondary)] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or category..."
                className="w-full pl-9 pr-3 py-1.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] text-xs text-[var(--admin-text-primary)] focus:border-white focus:outline-none"
              />
            </div>
          </div>

          {/* Table View */}
          <BlueprintWrapper dark className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-text-secondary)] uppercase tracking-wider">
                    <th className="p-3.5">Article</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Source</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--admin-border)]">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-[var(--admin-text-secondary)]">
                        Loading blog articles...
                      </td>
                    </tr>
                  ) : filteredPosts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-[var(--admin-text-secondary)]">
                        No blog articles found. Click "IMPORT DOCX / PDF" or "CREATE NEW ARTICLE" above to get started.
                      </td>
                    </tr>
                  ) : (
                    filteredPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-[var(--admin-surface-hover)] transition-colors">
                        <td className="p-3.5 max-w-xs sm:max-w-md">
                          <div className="flex items-start gap-3">
                            {post.cover_image_url ? (
                              <img
                                src={post.cover_image_url}
                                alt=""
                                className="w-12 h-9 object-cover shrink-0 border border-[var(--admin-border)] rounded-sm"
                              />
                            ) : (
                              <div className="w-12 h-9 bg-[var(--admin-bg)] border border-[var(--admin-border)] flex items-center justify-center shrink-0 text-[var(--admin-text-secondary)]">
                                <ImageIcon className="w-4 h-4" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-sans font-bold text-sm text-[var(--admin-text-primary)] truncate">
                                {post.title}
                              </div>
                              <div className="text-[11px] text-[var(--admin-text-secondary)] truncate mt-0.5">
                                {post.excerpt || cleanSlug(post.slug)}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5 whitespace-nowrap text-[var(--admin-text-secondary)]">
                          <span className="px-2 py-0.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] text-[11px]">
                            {post.category || 'General'}
                          </span>
                        </td>

                        <td className="p-3.5 whitespace-nowrap">
                          {post.sourceType ? (
                            <span className="px-2 py-0.5 bg-white/10 text-white border border-neutral-700 text-[10px] font-bold uppercase rounded-sm flex items-center gap-1 w-max">
                              <FileCode className="w-3 h-3" /> {post.sourceType}
                            </span>
                          ) : (
                            <span className="text-[var(--admin-text-secondary)] text-[11px]">Manual</span>
                          )}
                        </td>

                        <td className="p-3.5 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-sm ${
                              post.status === 'published'
                                ? 'bg-white/10 text-white border border-white/40'
                                : post.status === 'draft'
                                ? 'bg-transparent text-neutral-300 border border-neutral-600'
                                : 'bg-transparent text-neutral-400 border border-neutral-700'
                            }`}
                          >
                            {post.status || 'draft'}
                          </span>
                        </td>

                        <td className="p-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(post)}
                              className="admin-btn text-xs py-1 px-2.5 text-white hover:text-neutral-200 border-neutral-600 cursor-pointer"
                              title="Edit Article"
                            >
                              <Edit2 className="w-3.5 h-3.5 inline mr-1" /> Edit
                            </button>

                            {post.slug && (
                              <a
                                href={`/blog/${cleanSlug(post.slug)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="admin-btn text-xs p-1.5 text-[var(--admin-text-secondary)] hover:text-white"
                                title="View Public Article"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}

                            <button
                              onClick={() => handleDeletePost(post.id, false)}
                              className="admin-btn text-xs p-1.5 text-neutral-400 hover:text-white border-neutral-700 cursor-pointer"
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
        </div>
      )}

      {/* VIEW 2: PROFESSIONAL 2-COLUMN ARTICLE STUDIO EDITOR */}
      {view === 'editor' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Action Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--admin-border)] pb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView('list')}
                className="admin-btn text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer text-[var(--admin-text-secondary)] hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" /> BACK TO BLOGS
              </button>

              <span className="text-[var(--admin-border)]">|</span>

              <span className="font-heading text-lg font-bold uppercase text-[var(--admin-text-primary)]">
                {editingPostId ? 'EDIT ARTICLE' : 'CREATE NEW ARTICLE'}
              </span>

              <span
                className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-sm ${
                  formData.status === 'published'
                    ? 'bg-white/10 text-white border border-white/40'
                    : 'bg-transparent text-neutral-300 border border-neutral-600'
                }`}
              >
                {formData.status.toUpperCase()}
              </span>
            </div>

            {/* Header Right Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setImportModalOpen(true)}
                className="admin-btn text-xs py-1.5 px-3 cursor-pointer bg-[var(--admin-surface)] hover:bg-[var(--admin-surface-hover)] text-white border border-neutral-700 flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" /> IMPORT DOCX / PDF
              </button>

              <button
                onClick={() => setView('preview')}
                className="admin-btn text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" /> PREVIEW
              </button>

              <button
                type="button"
                onClick={() => handleSave('draft')}
                disabled={saving}
                className="admin-btn text-xs py-1.5 px-4 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 inline mr-1" /> SAVE DRAFT
              </button>

              <button
                type="button"
                onClick={() => handleSave('published')}
                disabled={saving}
                className="btn btn-primary text-xs py-1.5 px-5 font-bold uppercase tracking-wider cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5 inline mr-1" />
                {saving ? 'PUBLISHING...' : editingPostId ? 'UPDATE ARTICLE' : 'PUBLISH ARTICLE'}
              </button>
            </div>
          </div>

          {/* Feedback Banners */}
          {errorMsg && (
            <div className="p-3 bg-black border-l-4 border-neutral-500 text-white font-mono text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-white" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-black border-l-4 border-white text-white font-mono text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-white" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 2-Column CMS Studio Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
            {/* LEFT COLUMN: Main Writing Canvas (2 Cols) */}
            <div className="lg:col-span-2 space-y-6">
              {/* 1. Article Title */}
              <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] p-5 space-y-2">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[var(--admin-text-secondary)] font-semibold">
                  ARTICLE TITLE *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter article title..."
                  className={`w-full bg-[var(--admin-bg)] border ${
                    fieldErrors.title ? 'border-neutral-500' : 'border-[var(--admin-border)]'
                  } p-3.5 text-xl sm:text-2xl font-heading font-bold uppercase tracking-tight text-[var(--admin-text-primary)] focus:border-white focus:outline-none transition-colors`}
                />
                {fieldErrors.title && (
                  <span className="text-xs font-mono text-neutral-400 block">{fieldErrors.title}</span>
                )}
              </div>

              {/* 2. Category & Short Description */}
              <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] p-5 space-y-4">
                {/* Category Select */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[var(--admin-text-secondary)] mb-1.5 font-semibold">
                    CATEGORY
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                    className="w-full p-2.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] text-xs font-mono text-[var(--admin-text-primary)] focus:border-white focus:outline-none cursor-pointer"
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
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[var(--admin-text-secondary)] mb-1.5 font-semibold">
                    SHORT DESCRIPTION / EXCERPT
                  </label>
                  <textarea
                    rows={3}
                    value={formData.excerpt}
                    onChange={(e) => setFormData((prev) => ({ ...prev, excerpt: e.target.value }))}
                    placeholder="Enter a concise executive summary or brief excerpt of the article..."
                    className="w-full p-3 bg-[var(--admin-bg)] border border-[var(--admin-border)] text-xs font-sans text-[var(--admin-text-primary)] leading-relaxed focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              {/* 3. Main Article Content Editor */}
              <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[var(--admin-text-secondary)] font-semibold">
                    ARTICLE CONTENT *
                  </label>
                  <span className="text-[10px] font-mono text-white">
                    MARKDOWN POWERED
                  </span>
                </div>

                {fieldErrors.content && (
                  <span className="text-xs font-mono text-neutral-400 block mb-2">{fieldErrors.content}</span>
                )}

                {/* Visual Start Indicator */}
                <div className="border border-[var(--admin-border)] bg-[var(--admin-bg)] p-1">
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
              <BlueprintWrapper dark className="p-5 space-y-4">
                <h3 className="font-mono text-xs font-bold text-white uppercase tracking-widest border-b border-[var(--admin-border)] pb-2.5">
                  PUBLISHING CONTROL
                </h3>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--admin-text-secondary)] mb-1">
                    PUBLISHING STATUS
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                    className="w-full p-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] text-xs font-mono text-[var(--admin-text-primary)] focus:border-white focus:outline-none cursor-pointer"
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
                    className="btn btn-primary w-full py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {saving ? 'SAVING...' : editingPostId ? 'UPDATE & PUBLISH' : 'PUBLISH NOW'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSave('draft')}
                    disabled={saving}
                    className="admin-btn w-full py-2 text-xs uppercase font-mono justify-center cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5 inline mr-1" /> SAVE AS DRAFT
                  </button>
                </div>
              </BlueprintWrapper>

              {/* 2. FEATURED IMAGE CARD */}
              <BlueprintWrapper dark className="p-5 space-y-3">
                <h3 className="font-mono text-xs font-bold text-white uppercase tracking-widest border-b border-[var(--admin-border)] pb-2.5">
                  FEATURED IMAGE
                </h3>

                {/* Live Image Preview Box */}
                <div className="w-full h-40 bg-[var(--admin-bg)] border border-[var(--admin-border)] relative overflow-hidden flex items-center justify-center">
                  {formData.cover_image_url && !imgLoadError ? (
                    <img
                      src={formData.cover_image_url}
                      alt="Featured Preview"
                      onError={() => setImgLoadError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4 space-y-1 text-[var(--admin-text-secondary)]">
                      <ImageIcon className="w-8 h-8 mx-auto opacity-40" />
                      <p className="text-[11px] font-mono">
                        {imgLoadError ? 'Unable to load image URL' : 'No featured image'}
                      </p>
                      <p className="text-[10px] text-[var(--admin-text-secondary)] opacity-70">
                        Add an image URL below or upload a file to preview.
                      </p>
                    </div>
                  )}
                </div>

                {/* Image URL Input */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--admin-text-secondary)] mb-1">
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
                    className="w-full p-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] text-xs font-mono text-[var(--admin-text-primary)] focus:border-white focus:outline-none"
                  />
                </div>

                {/* Image Upload Action */}
                <label className="admin-btn w-full py-1.5 text-xs justify-center cursor-pointer flex items-center gap-1.5 border-dashed">
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
              </BlueprintWrapper>

              {/* 3. METADATA CARD (Author & Interactive Tags) */}
              <BlueprintWrapper dark className="p-5 space-y-4">
                <h3 className="font-mono text-xs font-bold text-white uppercase tracking-widest border-b border-[var(--admin-border)] pb-2.5">
                  ARTICLE METADATA
                </h3>

                {/* Author */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--admin-text-secondary)] mb-1">
                    AUTHOR
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData((prev) => ({ ...prev, author: e.target.value }))}
                    placeholder="SMRIKAAM Engineering Team"
                    className="w-full p-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] text-xs font-mono text-[var(--admin-text-primary)] focus:border-white focus:outline-none"
                  />
                </div>

                {/* Interactive Tag Chips */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--admin-text-secondary)] mb-1.5">
                    TAGS
                  </label>

                  {/* Render Tag Chips */}
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {formData.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono bg-[var(--admin-bg)] border border-[var(--admin-border)] text-white rounded-sm"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(idx)}
                          className="hover:text-neutral-400 cursor-pointer ml-0.5"
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
                    className="w-full p-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] text-xs font-mono text-[var(--admin-text-primary)] focus:border-white focus:outline-none"
                  />
                </div>
              </BlueprintWrapper>

              {/* 4. SEO SETTINGS CARD */}
              <BlueprintWrapper dark className="p-5 space-y-4">
                <h3 className="font-mono text-xs font-bold text-white uppercase tracking-widest border-b border-[var(--admin-border)] pb-2.5">
                  SEO & URL SLUG
                </h3>

                {/* Slug */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--admin-text-secondary)] mb-1">
                    URL SLUG
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData((prev) => ({ ...prev, slug: cleanSlug(e.target.value) }))}
                    onBlur={(e) => setFormData((prev) => ({ ...prev, slug: cleanSlug(e.target.value) }))}
                    placeholder="e.g. content-writing-services-in-coimbatore"
                    className="w-full p-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] text-xs font-mono text-[var(--admin-text-primary)] focus:border-white focus:outline-none"
                  />
                  <span className="block text-[9px] font-mono text-[var(--admin-text-secondary)] mt-0.5">
                    Live URL: /blog/{cleanSlug(formData.slug) || 'article-slug'}
                  </span>
                </div>

                {/* Meta Title */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--admin-text-secondary)] mb-1">
                    SEO TITLE TAG
                  </label>
                  <input
                    type="text"
                    value={formData.meta_title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, meta_title: e.target.value }))}
                    placeholder="SEO Title for search engines"
                    className="w-full p-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] text-xs font-mono text-[var(--admin-text-primary)] focus:border-white focus:outline-none"
                  />
                </div>

                {/* Meta Description */}
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-[var(--admin-text-secondary)] mb-1">
                    META DESCRIPTION
                  </label>
                  <textarea
                    rows={2}
                    value={formData.meta_description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, meta_description: e.target.value }))}
                    placeholder="Brief description snippet for Google search..."
                    className="w-full p-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] text-xs font-sans text-[var(--admin-text-primary)] focus:border-white focus:outline-none"
                  />
                </div>
              </BlueprintWrapper>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: FULL ARTICLE PREVIEW MODE */}
      {view === 'preview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Preview Header Bar */}
          <div className="flex items-center justify-between border-b border-[var(--admin-border)] pb-4">
            <button
              onClick={() => setView('editor')}
              className="admin-btn text-xs py-1.5 px-4 flex items-center gap-1.5 cursor-pointer text-white hover:text-white/80 border-[var(--admin-border)]"
            >
              <ArrowLeft className="w-4 h-4" /> ← BACK TO EDITOR
            </button>

            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-[var(--admin-text-secondary)]">PREVIEW MODE</span>
              <button
                type="button"
                onClick={() => handleSave('published')}
                disabled={saving}
                className="btn btn-primary text-xs py-1.5 px-5 font-bold uppercase tracking-wider cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5 inline mr-1" />
                {saving ? 'PUBLISHING...' : editingPostId ? 'UPDATE ARTICLE' : 'PUBLISH ARTICLE'}
              </button>
            </div>
          </div>

          {/* Rendered Article Wrapper */}
          <BlueprintWrapper dark className="p-6 sm:p-10 max-w-4xl mx-auto space-y-8">
            {/* Category & Date */}
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="px-2.5 py-1 bg-white/10 text-white border border-white/40 uppercase font-bold">
                {formData.category || 'GENERAL'}
              </span>
              <span className="text-[var(--admin-text-secondary)]">
                {formData.author || 'SMRIKAAM Team'} • {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            {/* Title */}
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight text-[var(--admin-text-primary)] leading-tight">
              {formData.title || 'Untitled Article'}
            </h1>

            {/* Excerpt */}
            {formData.excerpt && (
              <p className="text-base sm:text-lg text-[var(--admin-text-secondary)] leading-relaxed italic border-l-2 border-white pl-4">
                {formData.excerpt}
              </p>
            )}

            {/* Featured Image */}
            {formData.cover_image_url && (
              <div className="w-full overflow-hidden border border-[var(--admin-border)]">
                <img
                  src={formData.cover_image_url}
                  alt={formData.title}
                  className="w-full h-auto max-h-[450px] object-cover"
                />
              </div>
            )}

            {/* Article Content */}
            <div className="pt-4 border-t border-[var(--admin-border)]">
              <RichEditor
                value={formData.content}
                onChange={() => {}}
                placeholder="No article content provided."
              />
            </div>
          </BlueprintWrapper>
        </div>
      )}

      {/* MODAL 1: SMART DOCUMENT UPLOAD DIALOG */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg">
            <BlueprintWrapper dark className="p-6 sm:p-8 space-y-6 border border-[var(--admin-border)] shadow-2xl">
              <div className="flex items-center justify-between border-b border-[var(--admin-border)] pb-4">
                <div>
                  <div className="font-mono text-[10px] text-white uppercase tracking-widest font-semibold">
                    INTELLIGENT IMPORTER
                  </div>
                  <h3 className="font-heading text-xl font-bold uppercase text-[var(--admin-text-primary)]">
                    IMPORT BLOG ARTICLE
                  </h3>
                </div>
                <button
                  onClick={() => setImportModalOpen(false)}
                  className="text-[var(--admin-text-secondary)] hover:text-white"
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
                    ? 'border-white bg-white/10'
                    : 'border-[var(--admin-border)] hover:border-white bg-[var(--admin-bg)]'
                }`}
              >
                {importingFile ? (
                  <div className="py-6 space-y-3">
                    <Loader2 className="w-10 h-10 text-white animate-spin mx-auto" />
                    <div className="font-mono text-xs text-white font-bold uppercase tracking-wider">
                      {importStep === 1 && '1. READING DOCUMENT...'}
                      {importStep === 2 && '2. EXTRACTING CONTENT & IMAGES...'}
                      {importStep === 3 && '3. STRUCTURING DRAFT ARTICLE...'}
                      {importStep === 4 && '4. PARSING COMPLETE!'}
                    </div>
                    <p className="text-[11px] text-[var(--admin-text-secondary)]">
                      Analyzing title, headings, paragraph structure, and media streams...
                    </p>
                  </div>
                ) : (
                  <label className="block space-y-3 cursor-pointer">
                    <Upload className="w-10 h-10 text-white mx-auto opacity-80" />
                    <div>
                      <p className="text-sm font-sans font-bold text-[var(--admin-text-primary)]">
                        Drag & Drop PDF or DOCX file here
                      </p>
                      <p className="text-xs text-[var(--admin-text-secondary)] mt-1 font-mono">
                        Supports Microsoft Word (.docx) and Adobe PDF (.pdf)
                      </p>
                    </div>

                    <div className="pt-2">
                      <span className="btn btn-primary text-xs py-2 px-5 font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
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
              <div className="flex justify-end gap-3 border-t border-[var(--admin-border)] pt-4">
                <button
                  type="button"
                  onClick={() => setImportModalOpen(false)}
                  className="admin-btn text-xs px-4 py-2 text-[var(--admin-text-secondary)] hover:text-white"
                >
                  CANCEL
                </button>
              </div>
            </BlueprintWrapper>
          </div>
        </div>
      )}

      {/* MODAL 2: IMPORT AUDIT REPORT & REVIEW CONFIRMATION */}
      {auditModalOpen && importAuditData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl">
            <BlueprintWrapper dark className="p-6 sm:p-8 space-y-6 border border-white/40 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[var(--admin-border)] pb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-white" />
                  <div>
                    <div className="font-mono text-[10px] text-white uppercase tracking-widest font-semibold">
                      IMPORT COMPLETE
                    </div>
                    <h3 className="font-heading text-xl font-bold uppercase text-[var(--admin-text-primary)]">
                      DOCUMENT AUDIT REPORT
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setAuditModalOpen(false)}
                  className="text-[var(--admin-text-secondary)] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Audit Metadata Summary Grid */}
              <div className="grid grid-cols-2 gap-4 font-mono text-xs bg-[var(--admin-bg)] p-4 border border-[var(--admin-border)]">
                <div>
                  <span className="text-[var(--admin-text-secondary)] block text-[10px] uppercase">DOCUMENT SOURCE</span>
                  <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                    <FileCode className="w-3.5 h-3.5 text-white" /> {importAuditData.sourceFileName}
                  </span>
                </div>

                <div>
                  <span className="text-[var(--admin-text-secondary)] block text-[10px] uppercase">SECTIONS &amp; STRUCTURE</span>
                  <span className="font-bold text-white mt-0.5 block">{importAuditData.sectionsCount || 1} Sections • {importAuditData.paragraphsCount || 1} Paragraphs</span>
                </div>

                <div>
                  <span className="text-[var(--admin-text-secondary)] block text-[10px] uppercase">TITLE DETECTED</span>
                  <span className="font-bold text-white truncate mt-0.5 block">{importAuditData.title}</span>
                </div>

                <div>
                  <span className="text-[var(--admin-text-secondary)] block text-[10px] uppercase">AUTHOR DETECTED</span>
                  <span className="font-bold text-white mt-0.5 block">{importAuditData.author || 'Omitted (None in source)'}</span>
                </div>

                <div>
                  <span className="text-[var(--admin-text-secondary)] block text-[10px] uppercase">SUGGESTED CATEGORY</span>
                  <span className="font-bold text-white mt-0.5 block">{importAuditData.category || 'Omitted'}</span>
                </div>

                <div>
                  <span className="text-[var(--admin-text-secondary)] block text-[10px] uppercase">IMAGES EXTRACTED</span>
                  <span className="font-bold text-white mt-0.5 block">{importAuditData.extractedImages?.length || 0} Media Assets Saved</span>
                </div>

                <div className="col-span-2 border-t border-[var(--admin-border)] pt-2 mt-1 flex items-center justify-between">
                  <span className="text-[var(--admin-text-secondary)] text-[10px] uppercase">INITIAL PUBLISHING STATE</span>
                  <span className="font-bold text-white uppercase">DRAFT (PENDING REVIEW)</span>
                </div>
              </div>

              {/* Safety Banner */}
              <div className="p-3 bg-white/5 border-l-4 border-white text-white text-xs font-mono flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-white" />
                <span>Article is saved in <strong>DRAFT MODE</strong>. Review and edit content before publishing.</span>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between border-t border-[var(--admin-border)] pt-4">
                <button
                  type="button"
                  onClick={() => setAuditModalOpen(false)}
                  className="admin-btn text-xs px-4 py-2 text-[var(--admin-text-secondary)] hover:text-white"
                >
                  CANCEL
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuditModalOpen(false);
                    setView('editor');
                  }}
                  className="btn btn-primary text-xs py-2.5 px-6 font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" /> REVIEW &amp; EDIT ARTICLE
                </button>
              </div>
            </BlueprintWrapper>
          </div>
        </div>
      )}
    </div>
  );
}

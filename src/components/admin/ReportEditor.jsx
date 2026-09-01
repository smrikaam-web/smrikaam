import React, { useState, useEffect } from 'react';
import { Save, Upload, X, CheckCircle, Eye, Sparkles, Plus, Trash2 } from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import BlueprintWrapper from '../BlueprintWrapper';

export default function ReportEditor({ report, onSave, onCancel }) {
  const { uploadMedia } = useCMS();
  const [formData, setFormData] = useState({
    reportType: 'Weekly',
    category: 'Services',
    title: '',
    problemStatement: '',
    solutionStatement: '',
    techStack: ['IIoT', 'Python', 'MQTT', 'Cloud'],
    date: new Date().toISOString().split('T')[0],
    cover_image_url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200&auto=format&fit=crop',
    relatedContent: 'Industrial IoT (IIoT)',
    status: 'published'
  });

  const [techInput, setTechInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [previewModal, setPreviewModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (report) {
      setFormData({
        reportType: report.reportType || 'Weekly',
        category: report.category || 'Services',
        title: report.title || '',
        problemStatement: report.problemStatement || '',
        solutionStatement: report.solutionStatement || '',
        techStack: Array.isArray(report.techStack) ? report.techStack : (report.techStack ? report.techStack.split(',') : []),
        date: report.date || new Date().toISOString().split('T')[0],
        cover_image_url: report.cover_image_url || '',
        relatedContent: report.relatedContent || '',
        status: report.status || 'published'
      });
    }
  }, [report]);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setErrorMsg('');
    try {
      const result = await uploadMedia(file);
      setFormData((prev) => ({ ...prev, cover_image_url: result.url }));
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const addTechTag = (e) => {
    e.preventDefault();
    if (!techInput.trim()) return;
    if (!formData.techStack.includes(techInput.trim())) {
      setFormData((prev) => ({ ...prev, techStack: [...prev.techStack, techInput.trim()] }));
    }
    setTechInput('');
  };

  const removeTechTag = (tag) => {
    setFormData((prev) => ({ ...prev, techStack: prev.techStack.filter((t) => t !== tag) }));
  };

  const handleSubmit = (targetStatus) => {
    if (!formData.title.trim()) {
      setErrorMsg('Report title is required.');
      return;
    }
    if (!formData.problemStatement.trim()) {
      setErrorMsg('Problem statement is required.');
      return;
    }
    if (!formData.solutionStatement.trim()) {
      setErrorMsg('Solution statement is required.');
      return;
    }

    const payload = {
      ...formData,
      status: targetStatus || formData.status
    };

    onSave(payload);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.15)] pb-4">
        <div>
          <div className="font-mono text-xs text-[#4fd1c5] uppercase tracking-widest mb-1">
            FLASH REPORT EDITOR — HOMEPAGE WORKBENCH
          </div>
          <h2 className="font-heading text-2xl font-bold uppercase text-[#f4f4f4]">
            {report ? 'EDIT FLASH REPORT' : 'CREATE NEW FLASH REPORT'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreviewModal(true)}
            className="admin-btn text-xs"
          >
            <Eye className="w-3.5 h-3.5 inline mr-1" /> Preview Card
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="admin-btn text-xs text-gray-400 hover:text-white"
          >
            Cancel
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-950/90 border border-rose-500 text-rose-200 font-mono text-xs">
          {errorMsg}
        </div>
      )}

      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        {/* Row 1: Report Type + Category + Date */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-[#9aa3b5] mb-1.5">
              Report Type *
            </label>
            <select
              value={formData.reportType}
              onChange={(e) => setFormData({ ...formData, reportType: e.target.value })}
              className="input w-full bg-[#1c2333] border-[rgba(255,255,255,0.2)] text-[#f4f4f4]"
            >
              <option value="Weekly">Weekly Report</option>
              <option value="Monthly">Monthly Report</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#9aa3b5] mb-1.5">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input w-full bg-[#1c2333] border-[rgba(255,255,255,0.2)] text-[#f4f4f4]"
            >
              <option value="Services">Services</option>
              <option value="Accelerators">Accelerators</option>
              <option value="Industries">Industries</option>
              <option value="Case Studies">Case Studies</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#9aa3b5] mb-1.5">
              Publish Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="input w-full bg-[#1c2333] border-[rgba(255,255,255,0.2)] text-[#f4f4f4]"
            />
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-mono uppercase text-[#9aa3b5] mb-1.5">
            Report Title *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Edge Telemetry & OPC-UA Ingestion Benchmark"
            className="input w-full bg-[#1c2333] border-[rgba(255,255,255,0.2)] text-[#f4f4f4]"
          />
        </div>

        {/* Problem Statement (One-line) */}
        <div>
          <label className="block text-xs font-mono uppercase text-[#9aa3b5] mb-1.5">
            Problem Statement (One concise sentence) *
          </label>
          <input
            type="text"
            required
            value={formData.problemStatement}
            onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
            placeholder="e.g. Legacy machines lack real-time operational visibility."
            className="input w-full bg-[#1c2333] border-[rgba(255,255,255,0.2)] text-[#f4f4f4]"
          />
        </div>

        {/* Solution Statement (One-line) */}
        <div>
          <label className="block text-xs font-mono uppercase text-[#9aa3b5] mb-1.5">
            Solution Statement (One concise sentence) *
          </label>
          <input
            type="text"
            required
            value={formData.solutionStatement}
            onChange={(e) => setFormData({ ...formData, solutionStatement: e.target.value })}
            placeholder="e.g. Connected telemetry provides live machine intelligence."
            className="input w-full bg-[#1c2333] border-[rgba(255,255,255,0.2)] text-[#f4f4f4]"
          />
        </div>

        {/* Tech Stack Tags */}
        <div>
          <label className="block text-xs font-mono uppercase text-[#9aa3b5] mb-1.5">
            Technology Stack Tags
          </label>
          <div className="flex flex-wrap items-center gap-2 mb-2 p-2 bg-[#1c2333] border border-[rgba(255,255,255,0.2)]">
            {formData.techStack.map((tech) => (
              <span
                key={tech}
                className="bg-[#273248] text-[#4fd1c5] px-2.5 py-1 text-xs font-mono flex items-center gap-1.5"
              >
                {tech}
                <button
                  type="button"
                  onClick={() => removeTechTag(tech)}
                  className="hover:text-rose-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addTechTag(e)}
                placeholder="Add tech..."
                className="bg-transparent text-xs font-mono text-white focus:outline-none w-28 px-1"
              />
              <button
                type="button"
                onClick={addTechTag}
                className="text-xs text-[#4fd1c5] hover:text-white"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Image Upload & URL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-[#9aa3b5] mb-1.5">
              Report Image URL
            </label>
            <input
              type="text"
              value={formData.cover_image_url}
              onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
              placeholder="https://..."
              className="input w-full bg-[#1c2333] border-[rgba(255,255,255,0.2)] text-[#f4f4f4]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#9aa3b5] mb-1.5">
              Upload Image from Device
            </label>
            <label className="admin-btn w-full justify-center text-xs py-2.5 cursor-pointer">
              <Upload className="w-4 h-4 mr-1.5" />
              <span>{uploading ? 'UPLOADING...' : 'CHOOSE IMAGE FILE'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Related Content */}
        <div>
          <label className="block text-xs font-mono uppercase text-[#9aa3b5] mb-1.5">
            Related Page / Section Reference
          </label>
          <input
            type="text"
            value={formData.relatedContent}
            onChange={(e) => setFormData({ ...formData, relatedContent: e.target.value })}
            placeholder="e.g. Industrial IoT (IIoT)"
            className="input w-full bg-[#1c2333] border-[rgba(255,255,255,0.2)] text-[#f4f4f4]"
          />
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between pt-6 border-t border-[rgba(255,255,255,0.15)]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSubmit('draft')}
              className="admin-btn text-xs"
            >
              <Save className="w-3.5 h-3.5 inline mr-1" /> SAVE DRAFT
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('published')}
              className="btn btn-primary text-xs font-bold"
            >
              <CheckCircle className="w-3.5 h-3.5 inline mr-1" /> PUBLISH FLASH REPORT
            </button>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="admin-btn text-xs text-gray-400 hover:text-white"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Preview Modal */}
      {previewModal && (
        <div className="dialog-backdrop">
          <BlueprintWrapper dark className="dialog admin-dialog max-w-xl">
            <div className="dialog-title flex items-center justify-between border-b border-[rgba(255,255,255,0.15)] pb-3">
              <span className="font-heading text-lg text-[#f4f4f4] uppercase">
                HOMEPAGE FLASH REPORT CARD PREVIEW
              </span>
              <button onClick={() => setPreviewModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-[#0b0e14] my-4 border border-[rgba(255,255,255,0.15)]">
              {formData.cover_image_url && (
                <div className="h-44 w-full overflow-hidden border-b border-[rgba(255,255,255,0.15)] mb-4">
                  <img
                    src={formData.cover_image_url}
                    alt={formData.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] text-[#4fd1c5] uppercase tracking-widest font-bold">
                  {formData.reportType.toUpperCase()} REPORT • {formData.category.toUpperCase()}
                </span>
                <span className="font-mono text-[10px] text-gray-400">
                  {formData.date}
                </span>
              </div>

              <h3 className="font-mono text-base font-bold uppercase text-[#f4f4f4] mb-3">
                {formData.title || 'Untitled Report'}
              </h3>

              <div className="space-y-1.5 border-t border-[rgba(255,255,255,0.12)] pt-2.5 text-xs font-mono">
                <div className="text-gray-300">
                  <strong className="text-[#9aa3b5]">PROBLEM:</strong> {formData.problemStatement || '—'}
                </div>
                <div className="text-[#f4f4f4]">
                  <strong className="text-[#4fd1c5]">SOLUTION:</strong> {formData.solutionStatement || '—'}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[rgba(255,255,255,0.12)] flex flex-wrap gap-1.5">
                {formData.techStack.map((tech) => (
                  <span key={tech} className="bg-[#1c2333] border border-[rgba(255,255,255,0.15)] px-2 py-0.5 text-[10px] font-mono text-[#4fd1c5]">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="dialog-actions border-t border-[rgba(255,255,255,0.15)] pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewModal(false)}
                className="btn btn-primary text-xs"
              >
                Close Preview
              </button>
            </div>
          </BlueprintWrapper>
        </div>
      )}
    </div>
  );
}

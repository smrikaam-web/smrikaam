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
    cover_image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop',
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
      <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-4">
        <div>
          <div className="font-mono text-xs text-[#666666] uppercase tracking-widest mb-1 font-semibold">
            FLASH REPORT EDITOR &mdash; HOMEPAGE WORKBENCH
          </div>
          <h2 className="font-heading text-2xl font-bold uppercase text-[#111111]">
            {report ? 'EDIT FLASH REPORT' : 'CREATE NEW FLASH REPORT'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreviewModal(true)}
            className="text-xs py-1.5 px-3 bg-white text-[#111111] hover:bg-[#F7F7F7] border border-[#E5E5E5] font-mono cursor-pointer transition-colors"
          >
            <Eye className="w-3.5 h-3.5 inline mr-1" /> Preview Card
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="text-xs py-1.5 px-3 bg-white text-[#666666] hover:text-[#111111] border border-[#E5E5E5] font-mono cursor-pointer transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 bg-[#F7F7F7] border-l-4 border-[#111111] border border-[#E5E5E5] text-[#111111] font-mono text-xs">
          {errorMsg}
        </div>
      )}

      <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
        {/* Row 1: Report Type + Category + Date */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-[#333333] mb-1.5 font-semibold">
              Report Type *
            </label>
            <select
              value={formData.reportType}
              onChange={(e) => setFormData({ ...formData, reportType: e.target.value })}
              className="w-full p-2.5 bg-white border border-[#E5E5E5] text-[#111111] text-xs font-mono focus:border-[#111111] focus:outline-none cursor-pointer"
            >
              <option value="Weekly">Weekly Report</option>
              <option value="Monthly">Monthly Report</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#333333] mb-1.5 font-semibold">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-2.5 bg-white border border-[#E5E5E5] text-[#111111] text-xs font-mono focus:border-[#111111] focus:outline-none cursor-pointer"
            >
              <option value="Services">Services</option>
              <option value="Accelerators">Accelerators</option>
              <option value="Industries">Industries</option>
              <option value="Case Studies">Case Studies</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#333333] mb-1.5 font-semibold">
              Publish Date *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full p-2.5 bg-white border border-[#E5E5E5] text-[#111111] text-xs font-mono focus:border-[#111111] focus:outline-none"
            />
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-mono uppercase text-[#333333] mb-1.5 font-semibold">
            Report Title *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Edge Telemetry & OPC-UA Ingestion Benchmark"
            className="w-full p-2.5 bg-white border border-[#E5E5E5] text-[#111111] text-xs font-mono placeholder:text-[#888888] focus:border-[#111111] focus:outline-none"
          />
        </div>

        {/* Problem Statement (One-line) */}
        <div>
          <label className="block text-xs font-mono uppercase text-[#333333] mb-1.5 font-semibold">
            Problem Statement (One concise sentence) *
          </label>
          <input
            type="text"
            required
            value={formData.problemStatement}
            onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
            placeholder="e.g. Legacy machines lack real-time operational visibility."
            className="w-full p-2.5 bg-white border border-[#E5E5E5] text-[#111111] text-xs font-mono placeholder:text-[#888888] focus:border-[#111111] focus:outline-none"
          />
        </div>

        {/* Solution Statement (One-line) */}
        <div>
          <label className="block text-xs font-mono uppercase text-[#333333] mb-1.5 font-semibold">
            Solution Statement (One concise sentence) *
          </label>
          <input
            type="text"
            required
            value={formData.solutionStatement}
            onChange={(e) => setFormData({ ...formData, solutionStatement: e.target.value })}
            placeholder="e.g. Connected telemetry provides live machine intelligence."
            className="w-full p-2.5 bg-white border border-[#E5E5E5] text-[#111111] text-xs font-mono placeholder:text-[#888888] focus:border-[#111111] focus:outline-none"
          />
        </div>

        {/* Tech Stack Tags */}
        <div>
          <label className="block text-xs font-mono uppercase text-[#333333] mb-1.5 font-semibold">
            Technology Stack Tags
          </label>
          <div className="flex flex-wrap items-center gap-2 mb-2 p-2.5 bg-[#F7F7F7] border border-[#E5E5E5]">
            {formData.techStack.map((tech) => (
              <span
                key={tech}
                className="bg-white text-[#111111] border border-[#E5E5E5] px-2.5 py-1 text-xs font-mono flex items-center gap-1.5 shadow-xs"
              >
                {tech}
                <button
                  type="button"
                  onClick={() => removeTechTag(tech)}
                  className="hover:text-red-600 text-[#666666] cursor-pointer"
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
                className="bg-white border border-[#E5E5E5] text-xs font-mono text-[#111111] placeholder:text-[#888888] focus:border-[#111111] focus:outline-none w-28 px-2 py-1"
              />
              <button
                type="button"
                onClick={addTechTag}
                className="text-xs p-1 bg-white border border-[#E5E5E5] text-[#111111] hover:bg-[#F7F7F7] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Image Upload & URL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase text-[#333333] mb-1.5 font-semibold">
              Report Image URL
            </label>
            <input
              type="text"
              value={formData.cover_image_url}
              onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
              placeholder="https://..."
              className="w-full p-2.5 bg-white border border-[#E5E5E5] text-[#111111] text-xs font-mono placeholder:text-[#888888] focus:border-[#111111] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-[#333333] mb-1.5 font-semibold">
              Upload Image from Device
            </label>
            <label className="w-full justify-center text-xs py-2.5 cursor-pointer bg-white text-[#111111] hover:bg-[#F7F7F7] border border-dashed border-[#E5E5E5] font-mono flex items-center transition-colors">
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
          <label className="block text-xs font-mono uppercase text-[#333333] mb-1.5 font-semibold">
            Related Page / Section Reference
          </label>
          <input
            type="text"
            value={formData.relatedContent}
            onChange={(e) => setFormData({ ...formData, relatedContent: e.target.value })}
            placeholder="e.g. Industrial IoT (IIoT)"
            className="w-full p-2.5 bg-white border border-[#E5E5E5] text-[#111111] text-xs font-mono placeholder:text-[#888888] focus:border-[#111111] focus:outline-none"
          />
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between pt-6 border-t border-[#E5E5E5]">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSubmit('draft')}
              className="text-xs py-2 px-4 bg-white text-[#111111] hover:bg-[#F7F7F7] border border-[#E5E5E5] font-mono transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 inline mr-1" /> SAVE DRAFT
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('published')}
              className="text-xs py-2 px-5 font-bold uppercase tracking-wider cursor-pointer bg-[#111111] text-white hover:bg-[#333333] border border-[#111111] transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5 inline mr-1" /> PUBLISH FLASH REPORT
            </button>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="text-xs px-4 py-2 bg-white text-[#666666] hover:text-[#111111] border border-[#E5E5E5] font-mono transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Preview Modal */}
      {previewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-[#E5E5E5] shadow-2xl max-w-xl w-full p-6 space-y-4 relative">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
              <span className="font-heading text-lg text-[#111111] font-bold uppercase">
                HOMEPAGE FLASH REPORT CARD PREVIEW
              </span>
              <button onClick={() => setPreviewModal(false)} className="text-[#888888] hover:text-[#111111] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-[#F7F7F7] my-4 border border-[#E5E5E5]">
              {formData.cover_image_url && (
                <div className="h-44 w-full overflow-hidden border-b border-[#E5E5E5] mb-4">
                  <img
                    src={formData.cover_image_url}
                    alt={formData.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] text-[#111111] uppercase tracking-widest font-bold">
                  {formData.reportType.toUpperCase()} REPORT &bull; {formData.category.toUpperCase()}
                </span>
                <span className="font-mono text-[10px] text-[#666666]">
                  {formData.date}
                </span>
              </div>

              <h3 className="font-heading text-base font-bold uppercase text-[#111111] mb-3">
                {formData.title || 'Untitled Report'}
              </h3>

              <div className="space-y-1.5 border-t border-[#E5E5E5] pt-2.5 text-xs font-mono">
                <div className="text-[#666666]">
                  <strong className="text-[#111111]">PROBLEM:</strong> {formData.problemStatement || '—'}
                </div>
                <div className="text-[#111111]">
                  <strong className="text-[#111111]">SOLUTION:</strong> {formData.solutionStatement || '—'}
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#E5E5E5] flex flex-wrap gap-1.5">
                {formData.techStack.map((tech) => (
                  <span key={tech} className="bg-white border border-[#E5E5E5] px-2 py-0.5 text-[10px] font-mono text-[#111111]">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-t border-[#E5E5E5] pt-3 flex justify-end">
              <button
                type="button"
                onClick={() => setPreviewModal(false)}
                className="text-xs py-2 px-5 font-bold uppercase tracking-wider cursor-pointer bg-[#111111] text-white hover:bg-[#333333] border border-[#111111] transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

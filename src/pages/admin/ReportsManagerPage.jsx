import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, Clock, Eye, Calendar, Sparkles, X } from 'lucide-react';
import { useCMS } from '../../context/CMSContext';
import ReportEditor from '../../components/admin/ReportEditor';
import BlueprintWrapper from '../../components/BlueprintWrapper';

export default function ReportsManagerPage() {
  const { fetchAdmin, createItem, updateItem, updateStatus, deleteItem } = useCMS();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingReport, setEditingReport] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [filterType, setFilterType] = useState('all');

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await fetchAdmin('reports', {
        type: filterType !== 'all' ? filterType : undefined
      });
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [filterType]);

  const handleSave = async (payload) => {
    try {
      if (editingReport) {
        await updateItem('reports', editingReport.id, payload);
      } else {
        await createItem('reports', payload);
      }
      setEditingReport(null);
      setIsCreating(false);
      loadReports();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save report.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this flash report?')) return;
    try {
      await deleteItem('reports', id, false);
      loadReports();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    try {
      await updateStatus('reports', id, newStatus);
      loadReports();
    } catch (err) {
      alert('Status toggle failed');
    }
  };

  if (isCreating || editingReport) {
    return (
      <ReportEditor
        report={editingReport}
        onSave={handleSave}
        onCancel={() => {
          setEditingReport(null);
          setIsCreating(false);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(255,255,255,0.15)] pb-6">
        <div>
          <div className="font-mono text-xs text-[#4fd1c5] uppercase tracking-widest mb-1">
            HOMEPAGE WORKBENCH — FLASH REPORTS
          </div>
          <h1 className="font-heading text-3xl font-bold uppercase text-[#f4f4f4]">
            MANAGE FLASH REPORTS
          </h1>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="btn btn-primary text-xs font-bold flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> CREATE NEW FLASH REPORT
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-[#141924] p-3 border border-[rgba(255,255,255,0.15)]">
        {['all', 'weekly', 'monthly'].map((ft) => (
          <button
            key={ft}
            onClick={() => setFilterType(ft)}
            className={`px-3 py-1 text-xs font-mono uppercase tracking-wider transition-colors ${
              filterType === ft
                ? 'bg-[#4fd1c5] text-[#0b0e14] font-bold'
                : 'bg-[#1c2333] text-gray-300 hover:text-white'
            }`}
          >
            {ft === 'all' ? 'All Reports' : `${ft} Reports`}
          </button>
        ))}
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="text-center py-16 font-mono text-xs text-gray-400">
          LOADING_FLASH_REPORTS...
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 font-mono text-xs text-gray-400 bg-[#141924] border border-[rgba(255,255,255,0.15)] p-8">
          NO FLASH REPORTS FOUND. CLICK "CREATE NEW FLASH REPORT" TO PUBLISH ONE TO THE HOMEPAGE.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reports.map((report) => (
            <BlueprintWrapper
              key={report.id}
              dark
              className="bg-[#141924] border border-[rgba(255,255,255,0.15)] p-4 flex flex-col justify-between hover:border-[#4fd1c5] transition-colors"
            >
              <div>
                {/* Image */}
                {report.cover_image_url && (
                  <div className="h-36 w-full overflow-hidden border-b border-[rgba(255,255,255,0.15)] -mx-4 -mt-4 mb-3 w-[calc(100%+2rem)]">
                    <img
                      src={report.cover_image_url}
                      alt={report.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Top Badge & Date */}
                <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                  <span className="text-[#4fd1c5] font-bold uppercase bg-[#1c2333] px-2 py-0.5 border border-[#4fd1c5]/30">
                    {report.reportType} • {report.category}
                  </span>
                  <span className="text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {report.date}
                  </span>
                </div>

                <h3 className="font-mono text-sm font-bold uppercase text-[#f4f4f4] mb-2">
                  {report.title}
                </h3>

                <div className="space-y-1 text-xs font-mono text-gray-300 border-t border-[rgba(255,255,255,0.1)] pt-2 mb-3">
                  <div>
                    <strong className="text-gray-400">P:</strong> {report.problemStatement}
                  </div>
                  <div>
                    <strong className="text-[#4fd1c5]">S:</strong> {report.solutionStatement}
                  </div>
                </div>

                {/* Tech Stack Pills */}
                {Array.isArray(report.techStack) && report.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {report.techStack.map((tech) => (
                      <span key={tech} className="bg-[#1c2333] px-1.5 py-0.5 text-[10px] font-mono text-gray-300">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-3 border-t border-[rgba(255,255,255,0.12)]">
                <button
                  type="button"
                  onClick={() => handleStatusToggle(report.id, report.status)}
                  className={`px-2.5 py-1 text-[11px] font-mono uppercase font-bold border ${
                    report.status === 'published'
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                      : 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                  }`}
                >
                  {report.status === 'published' ? 'Published' : 'Draft'}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditingReport(report)}
                    className="admin-btn p-1.5 text-white"
                    title="Edit Report"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(report.id)}
                    className="admin-btn p-1.5 text-rose-400 hover:text-rose-200 border-rose-500/40"
                    title="Delete Report"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </BlueprintWrapper>
          ))}
        </div>
      )}
    </div>
  );
}

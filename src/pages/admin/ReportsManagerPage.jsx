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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E5E5] pb-6">
        <div>
          <div className="font-mono text-xs text-[#666666] uppercase tracking-widest mb-1 font-semibold">
            HOMEPAGE WORKBENCH &mdash; FLASH REPORTS
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#111111]">
            MANAGE FLASH REPORTS
          </h1>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="text-xs font-bold py-2.5 px-5 flex items-center gap-1.5 uppercase tracking-wider cursor-pointer bg-[#111111] text-white hover:bg-[#333333] border border-[#111111] transition-colors"
        >
          <Plus className="w-4 h-4" /> CREATE NEW FLASH REPORT
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-[#F7F7F7] p-3 border border-[#E5E5E5]">
        {['all', 'weekly', 'monthly'].map((ft) => (
          <button
            key={ft}
            onClick={() => setFilterType(ft)}
            className={`px-3 py-1 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
              filterType === ft
                ? 'bg-[#111111] text-white border border-[#111111] font-bold'
                : 'bg-white text-[#666666] border border-[#E5E5E5] hover:text-[#111111] hover:bg-[#F7F7F7]'
            }`}
          >
            {ft === 'all' ? 'All Reports' : `${ft} Reports`}
          </button>
        ))}
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="text-center py-16 font-mono text-xs text-[#666666] bg-white border border-[#E5E5E5]">
          LOADING_FLASH_REPORTS...
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 font-mono text-xs text-[#666666] bg-white border border-[#E5E5E5] p-8">
          NO FLASH REPORTS FOUND. CLICK &quot;CREATE NEW FLASH REPORT&quot; TO PUBLISH ONE TO THE HOMEPAGE.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white border border-[#E5E5E5] p-5 flex flex-col justify-between hover:border-[#111111] transition-colors shadow-sm"
            >
              <div>
                {/* Image */}
                {report.cover_image_url && (
                  <div className="h-36 w-full overflow-hidden border-b border-[#E5E5E5] -mx-5 -mt-5 mb-4 w-[calc(100%+2.5rem)]">
                    <img
                      src={report.cover_image_url}
                      alt={report.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Top Badge & Date */}
                <div className="flex items-center justify-between text-[10px] font-mono mb-2">
                  <span className="text-[#111111] font-bold uppercase bg-[#F7F7F7] px-2 py-0.5 border border-[#E5E5E5]">
                    {report.reportType} &bull; {report.category}
                  </span>
                  <span className="text-[#666666] flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {report.date}
                  </span>
                </div>

                <h3 className="font-heading text-base font-bold uppercase text-[#111111] mb-2">
                  {report.title}
                </h3>

                <div className="space-y-1 text-xs font-mono text-[#333333] border-t border-[#E5E5E5] pt-2 mb-3">
                  <div>
                    <strong className="text-[#666666]">P:</strong> {report.problemStatement}
                  </div>
                  <div>
                    <strong className="text-[#111111]">S:</strong> {report.solutionStatement}
                  </div>
                </div>

                {/* Tech Stack Pills */}
                {Array.isArray(report.techStack) && report.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {report.techStack.map((tech) => (
                      <span key={tech} className="bg-[#F7F7F7] border border-[#E5E5E5] px-1.5 py-0.5 text-[10px] font-mono text-[#333333]">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-3 border-t border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={() => handleStatusToggle(report.id, report.status)}
                  className={`px-2.5 py-1 text-[11px] font-mono uppercase font-bold border cursor-pointer transition-colors ${
                    report.status === 'published'
                      ? 'bg-[#111111] text-white border-[#111111]'
                      : 'bg-[#F7F7F7] text-[#333333] border-[#E5E5E5]'
                  }`}
                >
                  {report.status === 'published' ? 'Published' : 'Draft'}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditingReport(report)}
                    className="text-xs p-1.5 bg-white text-[#111111] hover:bg-[#F7F7F7] border border-[#E5E5E5] transition-colors cursor-pointer"
                    title="Edit Report"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(report.id)}
                    className="text-xs p-1.5 bg-white text-[#666666] hover:text-[#111111] hover:border-[#111111] border border-[#E5E5E5] transition-colors cursor-pointer"
                    title="Delete Report"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

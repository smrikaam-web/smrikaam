import React, { useEffect, useState } from 'react';
import { Mail, CheckCircle2, Clock } from 'lucide-react';
import api from '../../api';
import BlueprintWrapper from '../../components/BlueprintWrapper';

export default function InboxPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/contact/admin/all');
      setSubmissions(res.data || []);
    } catch (err) {
      console.error('Failed to fetch contact submissions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const toggleReadStatus = async (id, currentRead) => {
    try {
      await api.patch(`/contact/admin/${id}/read`, { is_read: !currentRead });
      fetchSubmissions();
    } catch (err) {
      alert('Failed to update read state');
    }
  };

  return (
    <div className="admin-theme">
      <div className="border-b border-[rgba(255,255,255,0.15)] pb-6 mb-8">
        <div className="font-mono text-xs text-[#4fd1c5] uppercase tracking-widest mb-1">
          CONTACT INBOX — SUBMISSIONS
        </div>
        <h1 className="font-heading text-3xl font-bold uppercase text-[#f4f4f4]">
          INCOMING TECHNICAL INQUIRIES
        </h1>
      </div>

      {loading ? (
        <div className="font-mono text-sm text-[#9aa3b5] py-12 text-center">LOADING_SUBMISSIONS...</div>
      ) : (
        <BlueprintWrapper dark className="admin-surface">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>State</th>
                  <th>Full Name</th>
                  <th>Company &amp; Contact</th>
                  <th>Industry / Service</th>
                  <th>Message</th>
                  <th>Received</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center font-mono text-xs text-[#9aa3b5] py-8">
                      NO INQUIRIES SUBMITTED YET.
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub) => (
                    <tr
                      key={sub.id}
                      className={sub.is_read ? 'opacity-80' : 'bg-[#1c2333]/40 font-semibold'}
                    >
                      <td>
                        {sub.is_read ? (
                          <span className="admin-badge-archived">READ</span>
                        ) : (
                          <span className="admin-badge-published">NEW</span>
                        )}
                      </td>
                      <td className="text-[#f4f4f4] font-bold">{sub.full_name}</td>
                      <td>
                        <div className="text-xs text-[#f4f4f4]">{sub.company_name || 'N/A'}</div>
                        <div className="font-mono text-[11px] text-[#4fd1c5]">{sub.email}</div>
                        {sub.phone && <div className="font-mono text-[10px] text-[#9aa3b5]">{sub.phone}</div>}
                      </td>
                      <td className="text-xs text-[#f4f4f4]">
                        <div>{sub.industry || 'General'}</div>
                        <div className="font-mono text-[10px] text-[#9aa3b5]">{sub.service_of_interest || '-'}</div>
                      </td>
                      <td className="text-xs text-[#f4f4f4] max-w-xs break-words">
                        {sub.message}
                      </td>
                      <td className="font-mono text-xs text-[#9aa3b5]">
                        {new Date(sub.created_at).toLocaleString()}
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => toggleReadStatus(sub.id, sub.is_read)}
                          className="admin-btn text-xs"
                        >
                          {sub.is_read ? 'Mark Unread' : 'Mark Read'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </BlueprintWrapper>
      )}
    </div>
  );
}

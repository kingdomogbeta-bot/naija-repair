import { useState, useEffect } from 'react';
import { getAllReports, processRefund, updateReport, markAllReportsRead } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, Wallet, RefreshCw } from 'lucide-react';

export default function AdminReports() {
  const { getToken } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [refundingId, setRefundingId] = useState(null);
  const [refundAmounts, setRefundAmounts] = useState({});

  useEffect(() => { load(); markAllReportsRead(getToken()).catch(() => {}); }, []);

  const load = async () => {
    try {
      const token = getToken();
      const res = await getAllReports(token);
      setReports(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (report) => {
    const amount = refundAmounts[report._id] ?? report.refundAmount;
    if (!amount || amount <= 0) return alert('Enter a valid refund amount');
    if (!confirm(`Issue ₦${Number(amount).toLocaleString()} refund to ${report.reporterEmail}?\n\nThis will:\n• Deduct from tasker wallet (even if negative)\n• Credit user wallet\n• Send notification to user`)) return;
    setRefundingId(report._id);
    try {
      const token = getToken();
      await processRefund(token, report._id, Number(amount));
      await load();
    } catch (e) {
      alert(e.message || 'Refund failed');
    } finally {
      setRefundingId(null);
    }
  };

  const handleDismiss = async (report) => {
    if (!confirm('Dismiss this report?')) return;
    try {
      const token = getToken();
      await updateReport(token, report._id, { status: 'dismissed' });
      await load();
    } catch (e) {
      alert('Failed to dismiss');
    }
  };

  const filtered = filter === 'all' ? reports : reports.filter(r => r.status === filter);
  const counts = { all: reports.length, pending: 0, refunded: 0, dismissed: 0 };
  reports.forEach(r => { if (counts[r.status] !== undefined) counts[r.status]++; });

  const statusColor = {
    pending: 'bg-yellow-100 text-yellow-700',
    reviewed: 'bg-blue-100 text-blue-700',
    refunded: 'bg-green-100 text-green-700',
    dismissed: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">User Reports</h2>
        <p className="text-gray-500 text-sm">Review complaints and issue refunds to user wallets</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'pending', 'refunded', 'dismissed'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-semibold capitalize text-sm transition-all ${filter === f ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            {f} ({counts[f] ?? 0})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading reports...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No {filter === 'all' ? '' : filter} reports</div>
      ) : (
        <div className="space-y-4">
          {filtered.map(report => (
            <div key={report._id} className={`bg-white rounded-2xl shadow-sm border-l-4 p-5 ${
              report.status === 'pending' ? 'border-yellow-400' :
              report.status === 'refunded' ? 'border-green-500' :
              report.status === 'dismissed' ? 'border-gray-300' : 'border-blue-400'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900">{report.service || 'Booking Report'}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusColor[report.status] || 'bg-gray-100 text-gray-600'}`}>
                      {report.status}
                    </span>
                    {report.refundStatus === 'issued' && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Refunded</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{new Date(report.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-teal-600">₦{(report.refundAmount || 0).toLocaleString()}</p>
                  <p className="text-xs text-gray-400">booking amount</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-sm">
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Reported by</p>
                  <p className="font-semibold text-gray-900">{report.reporterName || report.reporterEmail}</p>
                  <p className="text-gray-500 text-xs">{report.reporterEmail}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400 mb-1">Tasker</p>
                  <p className="font-semibold text-gray-900">{report.taskerName || '—'}</p>
                  <p className="text-gray-500 text-xs">{report.taskerEmail || '—'}</p>
                </div>
              </div>

              <div className="bg-red-50 rounded-xl p-3 mb-4">
                <p className="text-xs text-gray-500 mb-1">Issue reported</p>
                <p className="text-sm text-gray-800">{report.reason || report.description}</p>
              </div>

              {report.status !== 'refunded' && report.status !== 'dismissed' && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-sm text-gray-600 whitespace-nowrap">Refund ₦</span>
                    <input
                      type="number"
                      value={refundAmounts[report._id] ?? report.refundAmount ?? ''}
                      onChange={e => setRefundAmounts(prev => ({ ...prev, [report._id]: e.target.value }))}
                      placeholder="Amount"
                      className="flex-1 border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <button
                    onClick={() => handleRefund(report)}
                    disabled={refundingId === report._id}
                    className="px-5 py-2 bg-teal-600 text-white rounded-lg font-semibold text-sm hover:bg-teal-700 disabled:bg-gray-300 whitespace-nowrap"
                  >
                    {refundingId === report._id ? 'Processing...' : <span className="flex items-center gap-1"><Wallet className="w-4 h-4" /> Issue Refund</span>}
                  </button>
                  <button
                    onClick={() => handleDismiss(report)}
                    className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-200 whitespace-nowrap"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {report.status === 'refunded' && (
                <div className="bg-green-50 rounded-xl p-3 text-sm text-green-700 font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> ₦{(report.refundAmount || 0).toLocaleString()} refunded to {report.reporterEmail}'s wallet on {new Date(report.reviewedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

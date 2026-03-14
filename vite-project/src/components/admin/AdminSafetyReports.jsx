import { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { getAllSafetyReports, updateSafetyReport } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminSafetyReports() {
  const { getToken } = useAuth();
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const token = getToken();
      const data = await getAllSafetyReports(token);
      const reports = data.data || data;
      setReports(reports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = getToken();
      await updateSafetyReport(token, id, { status });
      await loadReports();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const filteredReports = filter === 'all' ? reports : reports.filter(r => r.status === filter);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Safety Reports</h2>
        <p className="text-gray-600">Monitor and respond to safety issues</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        {['all', 'pending', 'emergency', 'resolved', 'dismissed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 sm:px-4 py-2 rounded-lg font-semibold capitalize text-sm ${
              filter === f
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f} ({reports.filter(r => f === 'all' || r.status === f).length})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading reports...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No reports found</div>
          ) : (
            filteredReports.map(report => (
              <div
                key={report._id || report.id}
                className={`bg-white rounded-xl shadow-md p-4 sm:p-6 border-l-4 ${
                  report.status === 'emergency'
                    ? 'border-red-600'
                    : report.status === 'pending'
                    ? 'border-yellow-500'
                    : report.status === 'resolved'
                    ? 'border-green-600'
                    : 'border-gray-400'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start justify-between gap-3 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      className={`w-6 h-6 ${
                        report.status === 'emergency' ? 'text-red-600' : 'text-yellow-500'
                      }`}
                    />
                    <div>
                      <h3 className="font-bold text-base sm:text-lg">
                        {report.status === 'emergency' ? 'EMERGENCY REPORT' : 'Safety Issue'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(report.createdAt || report.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${
                      report.status === 'emergency'
                        ? 'bg-red-100 text-red-700'
                        : report.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : report.status === 'resolved'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {report.status}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Booking ID:</p>
                    <p className="text-gray-900">#{report.bookingId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Reporter:</p>
                    <p className="text-gray-900">{report.userEmail || report.reporterEmail || report.taskerEmail}</p>
                    {report.userPhone && (
                      <a href={`tel:${report.userPhone}`} className="text-teal-600 font-semibold hover:underline text-sm">📞 {report.userPhone}</a>
                    )}
                  </div>
                  {report.taskerName && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Tasker Involved:</p>
                      <p className="text-gray-900">{report.taskerName}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Issue:</p>
                    <p className="text-gray-900">{report.description || report.issue}</p>
                  </div>
                  {report.location && typeof report.location === 'object' && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Location:</p>
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 text-gray-900 flex-wrap">
                        <MapPin className="w-4 h-4 text-teal-600" />
                        <span className="text-xs sm:text-sm">
                          {report.location.lat.toFixed(6)}, {report.location.lng.toFixed(6)}
                        </span>
                        <a
                          href={`https://www.google.com/maps?q=${report.location.lat},${report.location.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-teal-600 hover:underline text-sm"
                        >
                          View on Map
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {report.status === 'pending' || report.status === 'emergency' ? (
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
                    <button
                      onClick={() => updateStatus(report._id || report.id, 'resolved')}
                      className="w-full sm:flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 text-sm"
                    >
                      <CheckCircle className="w-4 h-4" /> Mark Resolved
                    </button>
                    <button
                      onClick={() => updateStatus(report._id || report.id, 'dismissed')}
                      className="w-full sm:flex-1 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 text-sm"
                    >
                      <XCircle className="w-4 h-4" /> Dismiss
                    </button>
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

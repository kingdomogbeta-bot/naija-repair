import { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, Phone, CheckCircle, XCircle } from 'lucide-react';

export default function AdminSafetyReports() {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = () => {
    const data = JSON.parse(localStorage.getItem('naija_safety_reports') || '[]');
    setReports(data.sort((a, b) => b.timestamp - a.timestamp));
  };

  const updateStatus = (id, status) => {
    const updated = reports.map(r => r.id === id ? { ...r, status } : r);
    localStorage.setItem('naija_safety_reports', JSON.stringify(updated));
    setReports(updated);
  };

  const filteredReports = filter === 'all' ? reports : reports.filter(r => r.status === filter);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Safety Reports</h2>
        <p className="text-gray-600">Monitor and respond to safety issues</p>
      </div>

      <div className="flex gap-3 mb-6">
        {['all', 'pending', 'emergency', 'resolved', 'dismissed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-semibold capitalize ${
              filter === f
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {f} ({reports.filter(r => f === 'all' || r.status === f).length})
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No reports found</div>
        ) : (
          filteredReports.map(report => (
            <div
              key={report.id}
              className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${
                report.status === 'emergency'
                  ? 'border-red-600'
                  : report.status === 'pending'
                  ? 'border-yellow-500'
                  : report.status === 'resolved'
                  ? 'border-green-600'
                  : 'border-gray-400'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    className={`w-6 h-6 ${
                      report.status === 'emergency' ? 'text-red-600' : 'text-yellow-500'
                    }`}
                  />
                  <div>
                    <h3 className="font-bold text-lg">
                      {report.status === 'emergency' ? 'EMERGENCY REPORT' : 'Safety Issue'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(report.timestamp).toLocaleString()}
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
                  <p className="text-sm font-semibold text-gray-700">Tasker:</p>
                  <p className="text-gray-900">{report.taskerEmail}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Issue:</p>
                  <p className="text-gray-900">{report.issue}</p>
                </div>
                {report.location && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Location:</p>
                    <div className="flex items-center gap-2 text-gray-900">
                      <MapPin className="w-4 h-4 text-teal-600" />
                      <span className="text-sm">
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
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => updateStatus(report.id, 'resolved')}
                    className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" /> Mark Resolved
                  </button>
                  <button
                    onClick={() => updateStatus(report.id, 'dismissed')}
                    className="flex-1 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" /> Dismiss
                  </button>
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

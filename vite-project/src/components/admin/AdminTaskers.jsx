import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { resolveTaskerPhoto, setTaskerFallbackOnError } from '../../utils/taskerPhoto';
import { useAuth } from '../../context/AuthContext';
import { useTaskers } from '../../context/TaskersContext';
import { approveTaskerVerification, rejectTaskerVerification } from '../../services/api';
import { buildApiUrl } from '../../config/api';
import { Eye, ShieldOff, ShieldCheck, RefreshCw, Star, CheckCircle, XCircle, Clock, ExternalLink, X, FileText, AlertTriangle } from 'lucide-react';

const PRIMARY = '#0d9488';
const SECONDARY = '#0f172a';

const resolveVerificationPhoto = (url) => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  const publicId = url.replace(/^\/uploads\//, '');
  return 'https://res.cloudinary.com/doenyjrti/image/upload/' + publicId;
};

export default function AdminTaskers() {
  const { getAllTaskers, refreshTaskers } = useTaskers();
  const { getToken } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTasker, setSelectedTasker] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const allTaskers = getAllTaskers();
  const filteredTaskers = allTaskers.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefresh = async () => {
    setLoading(true);
    await refreshTaskers();
    setLoading(false);
  };

  const handleSuspend = async (tasker) => {
    if (!tasker._id && !tasker.isBackendTasker) { alert('Cannot modify virtual tasker'); return; }
    const isSuspended = tasker.suspended;
    if (!confirm(`${isSuspended ? 'Unsuspend' : 'Suspend'} ${tasker.name}?`)) return;
    try {
      const token = getToken();
      const url = isSuspended ? `/taskers/unsuspend/${tasker._id}` : `/taskers/suspend/${tasker._id}`;
      const body = isSuspended ? undefined : JSON.stringify({ reason: 'Admin action' });
      const res = await fetch(buildApiUrl(url), {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body
      });
      const data = await res.json();
      if (data.success) { await handleRefresh(); }
      else alert(data.message || 'Failed');
    } catch { alert('Failed'); }
  };

  const handleVerification = async (tasker, action) => {
    if (!tasker._id && !tasker.isBackendTasker) { alert('Cannot verify virtual tasker'); return; }
    try {
      const token = getToken();
      if (action === 'approve') {
        await approveTaskerVerification(token, tasker._id);
      } else {
        const reason = prompt('Rejection reason:');
        if (!reason) return;
        await rejectTaskerVerification(token, tasker._id, reason);
      }
      await handleRefresh();
    } catch (error) { alert(error.message); }
  };

  const stats = [
    { label: 'Total Taskers', value: allTaskers.length, bg: PRIMARY },
    { label: 'Active', value: allTaskers.filter(t => !t.suspended).length, bg: SECONDARY },
    { label: 'Pending NIN', value: allTaskers.filter(t => t.verificationStatus === 'pending').length, bg: '#f59e0b' },
    { label: 'Suspended', value: allTaskers.filter(t => t.suspended).length, bg: '#ef4444' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium" style={{ color: '#64748b' }}>{s.label}</p>
              <p className="text-3xl font-black mt-1" style={{ color: SECONDARY }}>{s.value}</p>
            </div>
            <div className="w-10 h-10 rounded-xl flex-shrink-0" style={{ background: s.bg }} />
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {/* Toolbar */}
        <div className="flex items-center gap-3 p-5" style={{ borderBottom: '1px solid #f1f5f9' }}>
          <input
            type="text"
            placeholder="Search taskers..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-sm focus:outline-none focus:border-teal-500"
          />
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: PRIMARY }}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {/* Cards grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: PRIMARY, borderTopColor: 'transparent' }} />
            <span className="text-sm font-medium" style={{ color: '#64748b' }}>Loading taskers...</span>
          </div>
        ) : filteredTaskers.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm" style={{ color: '#94a3b8' }}>No taskers found</p>
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="mt-3 text-sm font-semibold" style={{ color: PRIMARY }}>Clear search</button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
            {filteredTaskers.map(tasker => (
              <div
                key={tasker.id}
                className="rounded-2xl border overflow-hidden"
                style={{
                  borderColor: tasker.suspended ? '#fecaca' : tasker.verificationStatus === 'pending' ? '#fde68a' : '#e2e8f0',
                  background: tasker.suspended ? '#fff5f5' : '#fff'
                }}
              >
                {/* Pending banner */}
                {tasker.verificationStatus === 'pending' && (
                  <div className="flex items-center gap-2 px-4 py-2 text-xs font-semibold" style={{ background: '#fef3c7', color: '#92400e' }}>
                    <Clock className="w-3.5 h-3.5" />
                    NIN Submitted — Awaiting Review
                  </div>
                )}

                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="relative flex-shrink-0">
                      <img
                        src={resolveTaskerPhoto(tasker)}
                        alt={tasker.name}
                        onError={e => setTaskerFallbackOnError(e, tasker)}
                        className="w-14 h-14 rounded-xl object-cover"
                      />
                      {tasker.verified && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: PRIMARY }}>
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate" style={{ color: SECONDARY }}>{tasker.name}</p>
                      <p className="text-xs truncate" style={{ color: '#64748b' }}>{tasker.email}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {tasker.suspended && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#fee2e2', color: '#dc2626' }}>Suspended</span>
                        )}
                        {tasker.verificationStatus === 'pending' && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#fef3c7', color: '#d97706' }}>Pending</span>
                        )}
                        {!tasker._id && !tasker.isBackendTasker && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#ede9fe', color: '#7c3aed' }}>Virtual</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rating */}
                  {tasker.reviewCount > 0 && (
                    <div className="flex items-center gap-1 mb-3">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-bold" style={{ color: SECONDARY }}>{tasker.rating}</span>
                      <span className="text-xs" style={{ color: '#94a3b8' }}>({tasker.reviewCount} reviews)</span>
                    </div>
                  )}

                  {/* Services */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {tasker.services.slice(0, 2).map((s, i) => (
                      <span key={i} className="text-xs font-medium px-2 py-0.5 rounded-lg" style={{ background: '#f0fdfa', color: PRIMARY }}>{s}</span>
                    ))}
                    {tasker.services.length > 2 && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-lg" style={{ background: '#f1f5f9', color: '#64748b' }}>+{tasker.services.length - 2}</span>
                    )}
                  </div>

                  {/* Verification docs preview */}
                  {tasker.verificationStatus === 'pending' && (tasker.ninPhotoUrl || tasker.passportPhotoUrl) && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold mb-1.5 flex items-center gap-1" style={{ color: '#92400e' }}>
                        <FileText className="w-3 h-3" /> Verification Docs
                      </p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {tasker.ninPhotoUrl && (
                          <img src={resolveVerificationPhoto(tasker.ninPhotoUrl)} alt="NIN" className="w-full h-16 object-cover rounded-lg border-2" style={{ borderColor: '#fde68a' }} onError={e => e.target.style.display = 'none'} />
                        )}
                        {tasker.passportPhotoUrl && (
                          <img src={resolveVerificationPhoto(tasker.passportPhotoUrl)} alt="Passport" className="w-full h-16 object-cover rounded-lg border-2" style={{ borderColor: '#fde68a' }} onError={e => e.target.style.display = 'none'} />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid #f1f5f9' }}>
                    <span className="text-sm font-black" style={{ color: PRIMARY }}>₦{tasker.hourlyRate?.toLocaleString()}/hr</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedTasker(tasker)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-white"
                        style={{ background: SECONDARY }}
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </button>
                      {(tasker._id || tasker.isBackendTasker) && (
                        <button
                          onClick={() => handleSuspend(tasker)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-white"
                          style={{ background: tasker.suspended ? '#16a34a' : '#dc2626' }}
                        >
                          {tasker.suspended ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
                          {tasker.suspended ? 'Unsuspend' : 'Suspend'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedTasker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between p-5" style={{ borderBottom: '2px solid #0d9488' }}>
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 rounded-full" style={{ background: PRIMARY }} />
                <h2 className="text-lg font-bold" style={{ color: SECONDARY }}>Tasker Details</h2>
              </div>
              <button onClick={() => setSelectedTasker(null)} className="p-2 rounded-xl hover:bg-gray-100">
                <X className="w-5 h-5" style={{ color: '#64748b' }} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Profile */}
              <div className="flex items-center gap-4">
                <img
                  src={resolveTaskerPhoto(selectedTasker)}
                  alt={selectedTasker.name}
                  onError={e => setTaskerFallbackOnError(e, selectedTasker)}
                  className="w-20 h-20 rounded-2xl object-cover"
                />
                <div>
                  <h3 className="text-xl font-bold" style={{ color: SECONDARY }}>{selectedTasker.name}</h3>
                  <p className="text-sm" style={{ color: '#64748b' }}>{selectedTasker.email}</p>
                  <p className="text-sm" style={{ color: '#64748b' }}>{selectedTasker.phone}</p>
                  {selectedTasker.suspended && (
                    <span className="inline-flex items-center gap-1 mt-1 text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#fee2e2', color: '#dc2626' }}>
                      <AlertTriangle className="w-3 h-3" /> Suspended
                    </span>
                  )}
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Rating', value: `${selectedTasker.rating} ★` },
                  { label: 'Reviews', value: selectedTasker.reviewCount },
                  { label: 'Completed Tasks', value: selectedTasker.completedTasks },
                  { label: 'Hourly Rate', value: `₦${selectedTasker.hourlyRate?.toLocaleString()}` },
                ].map((item, i) => (
                  <div key={i} className="rounded-xl p-4" style={{ background: '#f8fafc' }}>
                    <p className="text-xs font-medium" style={{ color: '#64748b' }}>{item.label}</p>
                    <p className="text-xl font-black mt-1" style={{ color: SECONDARY }}>{item.value}</p>
                  </div>
                ))}
              </div>

              {/* Services */}
              <div>
                <p className="text-sm font-bold mb-2" style={{ color: SECONDARY }}>Services</p>
                <div className="flex flex-wrap gap-2">
                  {selectedTasker.services.map((s, i) => (
                    <span key={i} className="text-xs font-medium px-3 py-1 rounded-full" style={{ background: '#f0fdfa', color: PRIMARY }}>{s}</span>
                  ))}
                </div>
              </div>

              {/* Bio */}
              {selectedTasker.bio && (
                <div>
                  <p className="text-sm font-bold mb-1" style={{ color: SECONDARY }}>Bio</p>
                  <p className="text-sm" style={{ color: '#64748b' }}>{selectedTasker.bio}</p>
                </div>
              )}

              {/* Verification docs */}
              {selectedTasker.verificationStatus === 'pending' && selectedTasker.nin && (
                <div className="rounded-2xl p-4" style={{ background: '#fffbeb', border: '2px solid #fde68a' }}>
                  <p className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: SECONDARY }}>
                    <FileText className="w-4 h-4" style={{ color: '#d97706' }} /> Verification Documents
                  </p>
                  <p className="text-xs mb-3" style={{ color: '#64748b' }}>NIN: <span className="font-mono font-bold" style={{ color: SECONDARY }}>{selectedTasker.nin}</span></p>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {selectedTasker.ninPhotoUrl && (
                      <div>
                        <p className="text-xs mb-1" style={{ color: '#64748b' }}>NIN Card</p>
                        <img src={resolveVerificationPhoto(selectedTasker.ninPhotoUrl)} alt="NIN" className="w-full h-40 object-cover rounded-xl cursor-pointer" style={{ border: '2px solid #fde68a' }} onClick={() => window.open(resolveVerificationPhoto(selectedTasker.ninPhotoUrl), '_blank')} />
                      </div>
                    )}
                    {selectedTasker.passportPhotoUrl && (
                      <div>
                        <p className="text-xs mb-1" style={{ color: '#64748b' }}>Passport Photo</p>
                        <img src={resolveVerificationPhoto(selectedTasker.passportPhotoUrl)} alt="Passport" className="w-full h-40 object-cover rounded-xl cursor-pointer" style={{ border: '2px solid #fde68a' }} onClick={() => window.open(resolveVerificationPhoto(selectedTasker.passportPhotoUrl), '_blank')} />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { handleVerification(selectedTasker, 'approve'); setSelectedTasker(null); }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white"
                      style={{ background: PRIMARY }}
                    >
                      <CheckCircle className="w-4 h-4" /> Approve
                    </button>
                    <button
                      onClick={() => { handleVerification(selectedTasker, 'reject'); setSelectedTasker(null); }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white"
                      style={{ background: '#dc2626' }}
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              )}

              {/* Meta info */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl p-3" style={{ background: '#f8fafc' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Joined</p>
                  <p className="font-semibold mt-0.5" style={{ color: SECONDARY }}>
                    {selectedTasker.createdAt ? new Date(selectedTasker.createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
                <div className="rounded-xl p-3" style={{ background: '#f8fafc' }}>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>Status</p>
                  <p className="font-semibold mt-0.5" style={{ color: selectedTasker.suspended ? '#dc2626' : PRIMARY }}>
                    {selectedTasker.suspended ? 'Suspended' : 'Active'}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2" style={{ borderTop: '1px solid #f1f5f9' }}>
                <button
                  onClick={() => { navigate(`/tasker/${selectedTasker.id}`); setSelectedTasker(null); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: PRIMARY }}
                >
                  <ExternalLink className="w-4 h-4" /> View Profile
                </button>
                {(selectedTasker._id || selectedTasker.isBackendTasker) && (
                  <button
                    onClick={() => { handleSuspend(selectedTasker); setSelectedTasker(null); }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white"
                    style={{ background: selectedTasker.suspended ? '#16a34a' : '#dc2626' }}
                  >
                    {selectedTasker.suspended ? <ShieldCheck className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                    {selectedTasker.suspended ? 'Unsuspend' : 'Suspend'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

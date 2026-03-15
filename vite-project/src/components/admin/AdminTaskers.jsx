import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { resolveTaskerPhoto, setTaskerFallbackOnError } from '../../utils/taskerPhoto';
import { useAuth } from '../../context/AuthContext';
import { useTaskers } from '../../context/TaskersContext';
import { approveTaskerVerification, rejectTaskerVerification } from '../../services/api';
import { buildApiUrl, API_CONFIG } from '../../config/api';

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

  // Get all taskers from context (includes virtual + real)
  const allTaskers = getAllTaskers();
  console.log('AdminTaskers - all taskers from context:', allTaskers.length, allTaskers.map(t => ({ id: t.id, name: t.name, isBackend: !!t.isBackendTasker })));
  
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
    if (tasker.suspended) {
      if (confirm(`Unsuspend ${tasker.name}?`)) {
        if (tasker._id || tasker.isBackendTasker) {
          try {
            const token = getToken();
            const response = await fetch(buildApiUrl(`/taskers/unsuspend/${tasker._id}`), {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            const data = await response.json();
            if (data.success) {
              await handleRefresh();
              alert('Tasker unsuspended successfully');
            } else {
              alert(data.message || 'Failed to unsuspend tasker');
            }
          } catch (error) {
            alert('Failed to unsuspend tasker');
          }
        } else {
          alert('Cannot modify virtual tasker status');
        }
      }
    } else {
      if (confirm(`Suspend ${tasker.name}?`)) {
        if (tasker._id || tasker.isBackendTasker) {
          try {
            const token = getToken();
            const response = await fetch(buildApiUrl(`/taskers/suspend/${tasker._id}`), {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ reason: 'Admin action' })
            });
            const data = await response.json();
            if (data.success) {
              await handleRefresh();
              alert('Tasker suspended successfully');
            } else {
              alert(data.message || 'Failed to suspend tasker');
            }
          } catch (error) {
            alert('Failed to suspend tasker');
          }
        } else {
          alert('Cannot modify virtual tasker status');
        }
      }
    }
  };

  const handleVerification = async (tasker, action) => {
    if (!tasker._id && !tasker.isBackendTasker) {
      alert('Cannot verify virtual tasker');
      return;
    }
    
    try {
      const token = getToken();
      if (action === 'approve') {
        await approveTaskerVerification(token, tasker._id);
        alert('Verification approved');
      } else {
        const reason = prompt('Rejection reason:');
        if (reason) {
          await rejectTaskerVerification(token, tasker._id, reason);
          alert('Verification rejected');
        }
      }
      await handleRefresh();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleView = (tasker) => {
    setSelectedTasker(tasker);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search taskers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">Total Taskers</p>
            <p className="text-2xl font-bold text-blue-900">{allTaskers.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600 font-medium">Active</p>
            <p className="text-2xl font-bold text-green-900">{allTaskers.filter(t => !t.suspended).length}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-300">
            <p className="text-sm text-yellow-700 font-medium">⏳ Pending NIN</p>
            <p className="text-2xl font-bold text-yellow-900">{allTaskers.filter(t => t.verificationStatus === 'pending').length}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-red-600 font-medium">Suspended</p>
            <p className="text-2xl font-bold text-red-900">{allTaskers.filter(t => t.suspended).length}</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-3 bg-white rounded-2xl px-6 py-4 shadow-lg">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
              <p className="text-gray-700 font-medium">Loading taskers...</p>
            </div>
          </div>
        ) : filteredTaskers.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl p-12 shadow-lg max-w-md mx-auto">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">No taskers found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search terms</p>
              <button 
                onClick={() => setSearchTerm('')}
                className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Clear Search
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTaskers.map((tasker) => (
            <div key={tasker.id} className={`group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border ${
              tasker.suspended ? 'border-red-200 bg-red-50' : 'border-gray-200 hover:border-teal-200'
            } ${
              !tasker._id && !tasker.isBackendTasker ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50' : ''
            }`}>
              {/* Pending NIN review banner - full width, very visible */}
              {tasker.verificationStatus === 'pending' && (
                <div className="bg-yellow-400 text-yellow-900 px-4 py-2 flex items-center gap-2 font-semibold text-sm">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  ⏳ NIN Submitted — Awaiting Review
                </div>
              )}
              {/* Header with Photo and Basic Info */}
              <div className="relative p-6 pb-4">
                <div className="flex items-start gap-4">
                  <div className="relative flex-shrink-0">
                    <img
                      src={resolveTaskerPhoto(tasker)}
                      alt={tasker.name}
                      onError={(event) => setTaskerFallbackOnError(event, tasker)}
                      className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white shadow-lg group-hover:ring-teal-100 transition-all"
                    />
                    {tasker.verified && (
                      <div className="absolute -bottom-2 -right-2 bg-teal-500 rounded-full p-2 shadow-lg">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg mb-1">{tasker.name}</h3>
                        <p className="text-sm text-gray-600">{tasker.email}</p>
                      </div>
                      <div className="flex flex-col gap-1">
                        {!tasker._id && !tasker.isBackendTasker && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                            🎭 Virtual
                          </span>
                        )}
                        {tasker.suspended && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                            ⚠️ Suspended
                          </span>
                        )}
                        {tasker.verificationStatus === 'pending' && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                            ⏳ Pending
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Rating and Reviews */}
                    <div className="flex items-center gap-2 mb-3">
                      {tasker.reviewCount > 0 ? (
                        <>
                          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                            <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="font-bold text-gray-900 text-sm">{tasker.rating}</span>
                          </div>
                          <span className="text-sm text-gray-600">({tasker.reviewCount} reviews)</span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">New professional</span>
                      )}
                    </div>
                    
                    {/* Completed Tasks */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                      </svg>
                      <span className="font-medium">{tasker.completedTasks} tasks completed</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Pending verification docs preview on card */}
              {tasker.verificationStatus === 'pending' && (tasker.ninPhotoUrl || tasker.passportPhotoUrl) && (
                <div className="px-6 pb-4">
                  <p className="text-xs font-semibold text-yellow-700 mb-2">📄 Verification Documents</p>
                  <div className="grid grid-cols-2 gap-2">
                    {tasker.ninPhotoUrl && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">NIN Card</p>
                        <img
                          src={resolveVerificationPhoto(tasker.ninPhotoUrl)}
                          alt="NIN"
                          className="w-full h-24 object-cover rounded-lg border-2 border-yellow-300"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    )}
                    {tasker.passportPhotoUrl && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Passport</p>
                        <img
                          src={resolveVerificationPhoto(tasker.passportPhotoUrl)}
                          alt="Passport"
                          className="w-full h-24 object-cover rounded-lg border-2 border-yellow-300"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Services */}
              <div className="px-6 pb-4">
                <div className="flex flex-wrap gap-2">
                  {tasker.services.slice(0, 3).map((service, idx) => (
                    <span key={idx} className="bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg text-xs font-semibold">
                      {service}
                    </span>
                  ))}
                  {tasker.services.length > 3 && (
                    <span className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-semibold">
                      +{tasker.services.length - 3}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Bio */}
              {tasker.bio && (
                <div className="px-6 pb-4">
                  <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{tasker.bio}</p>
                </div>
              )}
              
              {/* Footer with Rate and Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600 font-medium">Hourly rate</span>
                  <span className="text-xl font-bold text-teal-600">₦{tasker.hourlyRate.toLocaleString()}</span>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleView(tasker)}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    👁️ View Details
                  </button>
                  {(tasker._id || tasker.isBackendTasker) ? (
                    <button 
                      onClick={() => handleSuspend(tasker)}
                      className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                        tasker.suspended 
                          ? 'bg-green-600 text-white hover:bg-green-700' 
                          : 'bg-red-600 text-white hover:bg-red-700'
                      }`}
                    >
                      {tasker.suspended ? '✅ Unsuspend' : '🚫 Suspend'}
                    </button>
                  ) : (
                    <button 
                      disabled
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-xl text-sm font-semibold cursor-not-allowed border border-blue-200"
                    >
                      🎭 Virtual Tasker
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          </div>
        )}
      </div>

      {/* Tasker Details Modal */}
      {selectedTasker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Tasker Details</h2>
                <button
                  onClick={() => setSelectedTasker(null)}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <img
                    src={resolveTaskerPhoto(selectedTasker)}
                    alt={selectedTasker.name}
                    onError={(event) => setTaskerFallbackOnError(event, selectedTasker)}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedTasker.name}</h3>
                    <p className="text-gray-600">{selectedTasker.email}</p>
                    <p className="text-gray-600">{selectedTasker.phone}</p>
                    {selectedTasker.suspended && (
                      <span className="inline-block mt-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                        ⚠️ Account Suspended
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Rating</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedTasker.rating} ⭐</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Reviews</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedTasker.reviewCount}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Completed Tasks</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedTasker.completedTasks}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Hourly Rate</p>
                    <p className="text-2xl font-bold text-gray-900">₦{selectedTasker.hourlyRate.toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Services</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTasker.services.map((service, idx) => (
                      <span key={idx} className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Bio</h4>
                  <p className="text-gray-700">{selectedTasker.bio}</p>
                </div>

                {selectedTasker.verificationStatus === 'pending' && selectedTasker.nin && (
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Verification Documents</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600">NIN</p>
                        <p className="font-mono font-medium text-gray-900">{selectedTasker.nin}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedTasker.ninPhotoUrl && (
                          <div>
                            <p className="text-sm text-gray-600 mb-2">NIN Card Photo</p>
                            <img 
                              src={resolveVerificationPhoto(selectedTasker.ninPhotoUrl)}
                              alt="NIN Card" 
                              className="w-full h-48 rounded-lg object-cover border-2 border-gray-200 cursor-pointer hover:border-teal-500"
                              onClick={() => window.open(resolveVerificationPhoto(selectedTasker.ninPhotoUrl), '_blank')}
                            />
                          </div>
                        )}
                        {selectedTasker.passportPhotoUrl && (
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Live Passport Photo</p>
                            <img 
                              src={resolveVerificationPhoto(selectedTasker.passportPhotoUrl)}
                              alt="Passport" 
                              className="w-full h-48 rounded-lg object-cover border-2 border-gray-200 cursor-pointer hover:border-teal-500"
                              onClick={() => window.open(resolveVerificationPhoto(selectedTasker.passportPhotoUrl), '_blank')}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => {
                          handleVerification(selectedTasker, 'approve');
                          setSelectedTasker(null);
                        }}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                      >
                        Approve Verification
                      </button>
                      <button
                        onClick={() => {
                          handleVerification(selectedTasker, 'reject');
                          setSelectedTasker(null);
                        }}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                      >
                        Reject Verification
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Joined Date</p>
                    <p className="font-medium text-gray-900">
                      {(selectedTasker._id || selectedTasker.isBackendTasker) ? (
                        selectedTasker.createdAt ? 
                          new Date(selectedTasker.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) :
                          selectedTasker.joinedDate ? 
                            new Date(selectedTasker.joinedDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) :
                            'Unknown'
                      ) : (
                        <span className="text-blue-600 font-semibold">Virtual Tasker</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Verified</p>
                    <p className="font-medium text-gray-900">{selectedTasker.verified ? '✓ Yes' : '❌ No'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Availability</p>
                    <p className="font-medium text-gray-900">{selectedTasker.availability}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status</p>
                    <p className={`font-medium ${selectedTasker.suspended ? 'text-red-600' : 'text-green-600'}`}>
                      {selectedTasker.suspended ? 'Suspended' : 'Active'}
                    </p>
                  </div>
                  {(selectedTasker._id || selectedTasker.isBackendTasker) && (
                    <>
                      <div>
                        <p className="text-gray-600">Tasker Type</p>
                        <p className="font-medium text-gray-900">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            🏢 Registered
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Account ID</p>
                        <p className="font-mono text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">
                          {selectedTasker._id || selectedTasker.id}
                        </p>
                      </div>
                    </>
                  )}
                  {!selectedTasker._id && !selectedTasker.isBackendTasker && (
                    <>
                      <div>
                        <p className="text-gray-600">Tasker Type</p>
                        <p className="font-medium text-gray-900">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                            🎭 Virtual Demo
                          </span>
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Demo Since</p>
                        <p className="font-medium text-gray-900">
                          {selectedTasker.joinedDate ? 
                            new Date(selectedTasker.joinedDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) :
                            'Platform Launch'
                          }
                        </p>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      navigate(`/tasker/${selectedTasker.id}`);
                      setSelectedTasker(null);
                    }}
                    className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-medium"
                  >
                    View Public Profile
                  </button>
                  <button
                    onClick={() => {
                      handleSuspend(selectedTasker);
                      setSelectedTasker(null);
                    }}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium ${
                      selectedTasker.suspended
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {selectedTasker.suspended ? 'Unsuspend Account' : 'Suspend Account'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

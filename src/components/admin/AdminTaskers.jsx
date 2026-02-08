import { useState } from 'react';
import { useTaskers } from '../../context/TaskersContext';
import { useNavigate } from 'react-router-dom';

export default function AdminTaskers() {
  const { taskers, updateTasker } = useTaskers();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTasker, setSelectedTasker] = useState(null);
  const navigate = useNavigate();

  const handleSuspend = (tasker) => {
    const action = tasker.suspended ? 'unsuspend' : 'suspend';
    if (confirm(`Are you sure you want to ${action} ${tasker.name}?`)) {
      updateTasker(tasker.id, { suspended: !tasker.suspended });
    }
  };

  const handleView = (tasker) => {
    setSelectedTasker(tasker);
  };

  const filteredTaskers = taskers.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search taskers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTaskers.map((tasker) => (
            <div key={tasker.id} className={`border rounded-xl p-4 hover:shadow-md transition-shadow ${
              tasker.suspended ? 'bg-red-50 border-red-200' : ''
            }`}>
              <div className="flex items-center gap-3 mb-3">
                <img src={tasker.photoUrl} alt={tasker.name} className="w-16 h-16 rounded-full object-cover" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{tasker.name}</h3>
                  <p className="text-sm text-gray-600">{tasker.location || tasker.email}</p>
                  {tasker.suspended && (
                    <span className="text-xs text-red-600 font-medium">⚠️ Suspended</span>
                  )}
                </div>
                {tasker.verified && <span className="text-teal-600">✓</span>}
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <span className="text-yellow-400">⭐</span>
                <span className="font-semibold">{tasker.rating}</span>
                <span className="text-sm text-gray-500">({tasker.reviewCount})</span>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {tasker.services.slice(0, 3).map((service, idx) => (
                  <span key={idx} className="px-2 py-1 bg-teal-50 text-teal-700 text-xs rounded">
                    {service}
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => handleView(tasker)}
                  className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100"
                >
                  View
                </button>
                <button 
                  onClick={() => handleSuspend(tasker)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm ${
                    tasker.suspended 
                      ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                      : 'bg-red-50 text-red-600 hover:bg-red-100'
                  }`}
                >
                  {tasker.suspended ? 'Unsuspend' : 'Suspend'}
                </button>
              </div>
            </div>
          ))}
        </div>
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
                  <img src={selectedTasker.photoUrl} alt={selectedTasker.name} className="w-24 h-24 rounded-full object-cover" />
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

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Joined Date</p>
                    <p className="font-medium text-gray-900">{new Date(selectedTasker.joinedDate).toLocaleDateString()}</p>
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

import { useState } from 'react';
import { Shield, Upload, X, CheckCircle, Clock } from 'lucide-react';

export default function TaskerVerification({ taskerEmail, currentStatus, onClose }) {
  const [formData, setFormData] = useState({
    nin: '',
    idType: 'nin',
    idNumber: '',
    idDocument: null,
    proofOfAddress: null,
    profilePhoto: null
  });
  const [previews, setPreviews] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result }));
        setPreviews(prev => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = (field) => {
    setFormData(prev => ({ ...prev, [field]: null }));
    setPreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[field];
      return newPreviews;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const verificationRequest = {
      id: Date.now().toString(),
      taskerEmail,
      ...formData,
      status: 'pending',
      submittedAt: new Date().toISOString()
    };

    const existing = JSON.parse(localStorage.getItem('naija_verification_requests') || '[]');
    existing.push(verificationRequest);
    localStorage.setItem('naija_verification_requests', JSON.stringify(existing));

    setSubmitted(true);
  };

  if (currentStatus === 'pending') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8">
          <div className="text-center">
            <div className="bg-yellow-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Verification Pending</h3>
            <p className="text-gray-600 mb-6">Your verification documents are under review. We'll notify you once approved.</p>
            <button onClick={onClose} className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStatus === 'verified') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8">
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Already Verified</h3>
            <p className="text-gray-600 mb-6">Your account is already verified.</p>
            <button onClick={onClose} className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8">
          <div className="text-center">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Submitted Successfully!</h3>
            <p className="text-gray-600 mb-6">Your verification documents have been submitted. We'll review and get back to you within 24-48 hours.</p>
            <button onClick={onClose} className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 my-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-teal-100 rounded-full p-2">
              <Shield className="w-6 h-6 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Get Verified</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-gray-600 mb-6">Submit your documents to get verified and build trust with clients.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ID Type</label>
            <select
              value={formData.idType}
              onChange={(e) => setFormData(prev => ({ ...prev, idType: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            >
              <option value="nin">National Identity Number (NIN)</option>
              <option value="drivers_license">Driver's License</option>
              <option value="voters_card">Voter's Card</option>
              <option value="passport">International Passport</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {formData.idType === 'nin' ? 'NIN' : 'ID Number'}
            </label>
            <input
              type="text"
              value={formData.idNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, idNumber: e.target.value }))}
              placeholder={formData.idType === 'nin' ? 'Enter your 11-digit NIN' : 'Enter ID number'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ID Document (Front)</label>
            {previews.idDocument ? (
              <div className="relative">
                <img src={previews.idDocument} alt="ID" className="w-full h-48 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => removeFile('idDocument')}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-teal-500">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Upload ID Document</span>
                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'idDocument')} className="hidden" required />
              </label>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Proof of Address</label>
            {previews.proofOfAddress ? (
              <div className="relative">
                <img src={previews.proofOfAddress} alt="Address" className="w-full h-48 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => removeFile('proofOfAddress')}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-teal-500">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Upload Utility Bill or Bank Statement</span>
                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'proofOfAddress')} className="hidden" required />
              </label>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
            {previews.profilePhoto ? (
              <div className="relative">
                <img src={previews.profilePhoto} alt="Profile" className="w-full h-48 object-cover rounded-lg" />
                <button
                  type="button"
                  onClick={() => removeFile('profilePhoto')}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-teal-500">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Upload Clear Photo of Yourself</span>
                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'profilePhoto')} className="hidden" required />
              </label>
            )}
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700">
              Submit for Verification
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

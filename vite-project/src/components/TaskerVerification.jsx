import { useState, useRef, useCallback } from 'react';
import { submitTaskerVerification } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTaskers } from '../context/TaskersContext';

export default function TaskerVerification({ tasker, onSuccess }) {
  const { getToken, updateProfile } = useAuth();
  const { refreshTaskers } = useTaskers();
  const [showForm, setShowForm] = useState(false);
  const [nin, setNin] = useState('');
  const [ninPhoto, setNinPhoto] = useState(null);
  const [livePhoto, setLivePhoto] = useState(null);
  const [ninPreview, setNinPreview] = useState('');
  const [livePreview, setLivePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [facingMode, setFacingMode] = useState('user');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const handleNinPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setNinPhoto(file);
      setNinPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const startCamera = useCallback(async (mode = facingMode) => {
    setError('');
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: mode
        } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => videoRef.current.play();
      }
      setShowCamera(true);
    } catch (err) {
      console.error('Camera error:', err);
      setError('Unable to access camera. Please check permissions.');
    }
  }, [facingMode]);

  const flipCamera = useCallback(async () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    await startCamera(newMode);
  }, [facingMode, startCamera]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  }, []);

  const capturePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas) {
      setError('Camera not ready');
      return;
    }

    try {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'live-photo.jpg', { type: 'image/jpeg' });
          setLivePhoto(file);
          setLivePreview(URL.createObjectURL(file));
          stopCamera();
        } else {
          setError('Failed to capture photo');
        }
      }, 'image/jpeg', 0.95);
    } catch (err) {
      console.error('Capture error:', err);
      setError('Failed to capture photo');
    }
  }, [stopCamera]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!nin || nin.length !== 11) {
      setError('Please enter a valid 11-digit NIN');
      return;
    }

    if (!ninPhoto) {
      setError('Please upload NIN photo');
      return;
    }

    if (!livePhoto) {
      setError('Please take a live photo');
      return;
    }

    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }
      await submitTaskerVerification(token, nin, ninPhoto, livePhoto);
      // Update local user state so UI shows "Under Review" immediately
      updateProfile({ verificationStatus: 'pending' });
      setShowForm(false);
      await refreshTaskers();
      if (onSuccess) await onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (tasker?.verificationStatus === 'pending') {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
          <h3 className="text-lg font-bold text-yellow-900">Under Review</h3>
        </div>
      </div>
    );
  }

  if (tasker?.verificationStatus === 'rejected' && !showForm) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <h3 className="text-lg font-bold text-red-900">Verification Rejected</h3>
        </div>
        <p className="text-red-800 mb-4">Reason: {tasker.verificationRejectionReason || 'Not specified'}</p>
        <button
          onClick={() => setShowForm(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-medium"
        >
          Resubmit Verification
        </button>
      </div>
    );
  }

  if (tasker?.verified) {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <h3 className="text-lg font-bold text-green-900">Verified Account</h3>
        </div>
      </div>
    );
  }

  if (!showForm) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-500 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-3">
          <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <h3 className="text-lg font-bold text-yellow-900">Verification Required</h3>
        </div>
        <p className="text-yellow-800 mb-4">Get verified to build trust with customers and increase your bookings</p>
        <button
          onClick={() => setShowForm(true)}
          className="bg-yellow-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-yellow-600 transition-all shadow-md"
        >
          Start Verification
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Identity Verification</h3>
          <p className="text-sm text-gray-500 mt-1">Complete verification to access all features</p>
        </div>
        <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-gray-50 rounded-xl p-6">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            National Identification Number (NIN)
          </label>
          <input
            type="text"
            value={nin}
            onChange={(e) => setNin(e.target.value.replace(/\D/g, '').slice(0, 11))}
            placeholder="Enter your 11-digit NIN"
            maxLength="11"
            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all text-lg tracking-wider"
          />
          <p className="text-xs text-gray-500 mt-2">Your NIN will be kept confidential and secure</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-6">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            NIN Document Photo
          </label>
          <div className="flex flex-col sm:flex-row gap-4">
            {ninPreview && (
              <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-teal-500">
                <img src={ninPreview} alt="NIN" className="w-full h-full object-cover" />
              </div>
            )}
            <label className="flex-1 cursor-pointer group">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-teal-500 hover:bg-teal-50 transition-all">
                <svg className="w-12 h-12 text-gray-400 group-hover:text-teal-500 mx-auto mb-2 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm font-medium text-gray-700 group-hover:text-teal-600">Upload NIN Photo</p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleNinPhotoChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-6">
          <label className="block text-sm font-semibold text-gray-900 mb-3">
            Live Photo Verification
          </label>
          <div className="flex flex-col sm:flex-row gap-4">
            {livePreview && (
              <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-teal-500">
                <img src={livePreview} alt="Live" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setLivePreview('')}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={startCamera}
              className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-teal-500 hover:bg-teal-50 transition-all group"
            >
              <svg className="w-12 h-12 text-gray-400 group-hover:text-teal-500 mx-auto mb-2 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm font-medium text-gray-700 group-hover:text-teal-600">Take Live Photo</p>
              <p className="text-xs text-gray-500 mt-1">Use your camera</p>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Take a clear photo of your face for verification</p>
        </div>

      {/* Fullscreen Camera Overlay */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          {/* Video fills entire screen */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="flex-1 w-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Face guide oval overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-72 h-96 sm:w-80 sm:h-[420px] rounded-full border-4 border-white border-opacity-70" />
          </div>

          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-safe pt-4 pb-3 bg-gradient-to-b from-black/60 to-transparent">
            <button
              onClick={stopCamera}
              className="bg-black/50 text-white rounded-full p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <p className="text-white text-sm font-medium">Position your face in the oval</p>
            {/* Flip camera button */}
            <button
              onClick={flipCamera}
              className="bg-black/50 text-white rounded-full p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Bottom capture button */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center pb-safe pb-8 pt-4 bg-gradient-to-t from-black/60 to-transparent">
            <button
              onClick={capturePhoto}
              className="w-20 h-20 rounded-full bg-white border-4 border-teal-500 flex items-center justify-center shadow-xl active:scale-95 transition-transform"
            >
              <div className="w-14 h-14 rounded-full bg-teal-500" />
            </button>
          </div>
        </div>
      )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-4 rounded-xl font-bold text-lg hover:from-teal-700 hover:to-teal-800 disabled:from-gray-400 disabled:to-gray-500 transition-all shadow-lg hover:shadow-xl"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </span>
          ) : 'Submit Verification'}
        </button>
      </form>
    </div>
  );
}

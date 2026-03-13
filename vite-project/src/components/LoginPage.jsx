import { useState, useRef } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { loginUser, loginTasker } from '../services/api';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showAppealModal, setShowAppealModal] = useState(false);
  const [suspendedTasker, setSuspendedTasker] = useState(null);
  const [idType, setIdType] = useState('nin');
  const [idNumber, setIdNumber] = useState('');
  const [idImage, setIdImage] = useState(null);
  const [selfieImage, setSelfieImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const { settings } = useSettings();
  const auth = useAuth();
  const navigate = useNavigate();

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      setShowCamera(true);
    } catch (err) {
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      setSelfieImage(canvas.toDataURL('image/jpeg'));
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-100 py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400 via-emerald-400 to-cyan-500 rounded-full blur-sm opacity-60"></div>
                <div className="relative bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-600 rounded-full w-14 h-14 flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                  </svg>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight leading-none" style={{ fontFamily: '"Montserrat", sans-serif' }}>
                  <span className="bg-gradient-to-r from-teal-500 to-emerald-500 bg-clip-text text-transparent">Naija</span>
                  <span className="text-gray-400 mx-0.5">•</span>
                  <span className="bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent">Repair</span>
                </span>
                <span className="text-[9px] font-bold text-teal-500/70 tracking-wider uppercase">Expert Services</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Log in to your account</p>
          </div>

          <div className="space-y-4 mb-6">
            <button className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 rounded-xl py-3 font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            <button className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 rounded-xl py-3 font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Continue with Apple
            </button>
          </div>

          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="mx-4 text-gray-400 text-sm font-medium">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form
            className="space-y-5"
            onSubmit={async e => {
              e.preventDefault();
              
              try {
                const userData = await loginUser({ email, password });
                auth.login(userData);
                
                if (userData.role === 'admin') {
                  navigate('/admin');
                } else {
                  navigate('/user-home');
                }
              } catch (userError) {
                try {
                  const taskerData = await loginTasker({ email, password });
                  
                  if (taskerData.suspended) {
                    setSuspendedTasker(taskerData);
                    setShowAppealModal(true);
                    return;
                  }
                  
                  auth.login({ ...taskerData, role: 'tasker' });
                  navigate('/tasker-dashboard');
                } catch (taskerError) {
                  alert(taskerError.message || 'Login failed. Please check your credentials.');
                }
              }
            }}
          >
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Email Address</label>
              <input 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all" 
                type="email" 
                placeholder="you@example.com" 
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Password</label>
              <div className="relative">
                <input 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Enter your password" 
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={rememberMe} 
                  onChange={e => setRememberMe(e.target.checked)} 
                  className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500" 
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link to="/" className="text-sm text-teal-600 hover:text-teal-700 font-medium">Forgot password?</Link>
            </div>
            <button type="submit" className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all">Log In</button>
          </form>

          <div className="text-center mt-6 text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-teal-600 font-semibold hover:text-teal-700">Sign Up</Link>
          </div>
        </div>
      </div>

      {showAppealModal && suspendedTasker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 my-8">
            <div className="text-center mb-6">
              <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Account Suspended</h3>
              <p className="text-gray-600 text-sm">Submit verification documents to appeal your suspension.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ID Type</label>
                <select
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="nin">NIN (National Identity Number)</option>
                  <option value="voters">Voter's Card</option>
                  <option value="drivers">Driver's License</option>
                  <option value="passport">International Passport</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ID Number</label>
                <input
                  type="text"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  placeholder="Enter your ID number"
                  className="w-full border-2 border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload ID Document</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'id')}
                  className="w-full border-2 border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                {idImage && <img src={idImage} alt="ID" className="mt-2 w-full h-32 object-cover rounded-lg" />}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Take Live Selfie</label>
                {!selfieImage && !showCamera && (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="w-full px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Open Camera
                  </button>
                )}
                {showCamera && (
                  <div className="space-y-2">
                    <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg" />
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                      >
                        Capture Photo
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                {selfieImage && (
                  <div className="space-y-2">
                    <img src={selfieImage} alt="Selfie" className="w-full h-48 object-cover rounded-lg" />
                    <button
                      type="button"
                      onClick={() => setSelfieImage(null)}
                      className="w-full px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Retake Photo
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { 
                  setShowAppealModal(false); 
                  setSuspendedTasker(null); 
                  setIdType('nin');
                  setIdNumber('');
                  setIdImage(null);
                  setSelfieImage(null);
                  stopCamera();
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!idNumber.trim() || !idImage || !selfieImage) {
                    alert('Please fill all fields and upload required documents.');
                    return;
                  }
                  const appeals = JSON.parse(localStorage.getItem('naija_suspension_appeals') || '[]');
                  appeals.push({
                    id: Date.now().toString(),
                    taskerEmail: suspendedTasker.email,
                    taskerName: suspendedTasker.name,
                    idType,
                    idNumber,
                    idImage,
                    selfieImage,
                    timestamp: new Date().toISOString(),
                    status: 'pending'
                  });
                  localStorage.setItem('naija_suspension_appeals', JSON.stringify(appeals));
                  alert('Appeal submitted successfully. Our team will review it within 24-48 hours.');
                  setShowAppealModal(false);
                  setSuspendedTasker(null);
                  setIdType('nin');
                  setIdNumber('');
                  setIdImage(null);
                  setSelfieImage(null);
                }}
                disabled={!idNumber.trim() || !idImage || !selfieImage}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Appeal
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default LoginPage;

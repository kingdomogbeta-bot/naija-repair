import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTaskers } from "../context/TaskersContext";
import { useSettings } from "../context/SettingsContext";
import { SERVICE_NAMES } from "../config/services";
import { NIGERIA_STATES, STATE_LGAS } from "../data/locations";
import CountryCodeSelect from "./CountryCodeSelect";
import OTPVerification from "./OTPVerification";
import { sendOTP, registerTasker, googleAuthLogin } from "../services/api";
import { useGoogleLogin } from "@react-oauth/google";

function BecomeTaskerPage() {
  const { settings } = useSettings();
  const [step, setStep] = useState('form');
  const [showPassword, setShowPassword] = useState(false);
  const [countryCode, setCountryCode] = useState("+234");
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [bio, setBio] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [state, setState] = useState('Lagos');
  const [lga, setLga] = useState('Ikeja');
  const [address, setAddress] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const auth = useAuth();
  const { addTasker } = useTaskers();
  const navigate = useNavigate();

  const [googlePending, setGooglePending] = useState(null);

  const handleGoogleSignup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        }).then(r => r.json());
        await sendOTP(userInfo.email);
        setGooglePending({ email: userInfo.email, name: userInfo.name, picture: userInfo.picture });
        setEmail(userInfo.email);
        setStep('otp');
      } catch (err) {
        alert(err.message || 'Google sign up failed');
      }
    },
    onError: () => alert('Google sign up failed. Please try again.')
  });

  const toggleService = (serviceName) => {
    setSelectedServices(prev => 
      prev.includes(serviceName) 
        ? prev.filter(name => name !== serviceName)
        : [...prev, serviceName]
    );
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (selectedServices.length === 0) {
      alert('Please select at least one service');
      return;
    }

    setError('');
    // Switch to OTP page instantly — don't wait for email
    setStep('otp');

    // Send OTP in background
    sendOTP(email).catch(err => {
      console.error('OTP send failed:', err.message);
    });
  };

  const handleOTPVerified = async (otp) => {
    setLoading(true);
    setError('');

    try {
      if (googlePending) {
        // Google tasker signup — create a user account with tasker role redirect
        const userData = await googleAuthLogin(googlePending.email, googlePending.name, googlePending.picture);
        auth.login({ ...userData, role: userData.role || 'user' });
        setStep('success');
        setTimeout(() => navigate('/tasker-dashboard'), 2000);
        return;
      }
      const taskerData = {
        name: `${firstName} ${lastName}`.trim(),
        email,
        phone: `${countryCode}${phone}`,
        password,
        bio,
        services: selectedServices,
        hourlyRate: 3000,
        location: `${state}, ${lga}`,
        state,
        lga,
        address,
        serviceStates: [state],
        serviceLGAs: [lga],
        otp
      };

      const response = await registerTasker(taskerData);
      console.log('Registration response:', response);

      const newTasker = {
        id: response._id,
        name: taskerData.name,
        email,
        phone: taskerData.phone,
        bio,
        services: selectedServices,
        photoUrl: '',
        rating: 0,
        reviewCount: 0,
        completedTasks: 0,
        hourlyRate: 3000,
        verified: response.verified || false,
        approved: response.approved || false,
        joinedDate: new Date().toISOString(),
        isNew: true,
        location: 'Lagos',
        availability: 'available'
      };

      addTasker(newTasker);
      auth.login({ ...response, token: response.token });
      setStep('success');
      setTimeout(() => navigate('/tasker-dashboard'), 2000);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-100 py-6 sm:py-12 px-4 flex items-center justify-center">
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8">
          <div className="flex flex-col items-center mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400 via-emerald-400 to-cyan-500 rounded-full blur-md opacity-60"></div>
                <div className="relative bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-600 rounded-full w-14 h-14 flex items-center justify-center shadow-2xl">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                  </svg>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight leading-none" style={{ fontFamily: '"Montserrat", sans-serif' }}>
                  <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent">Naija</span>
                  <span className="text-gray-700 mx-0.5">•</span>
                  <span className="bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent">Repair</span>
                </span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 text-center">Become a Tasker</h1>
            <p className="text-gray-600 text-sm sm:text-base text-center">Start earning by helping others</p>
          </div>

          {step === 'otp' ? (
            <OTPVerification
              email={email}
              onVerified={handleOTPVerified}
              onResend={async () => {
                try {
                  await sendOTP(email);
                  alert('OTP resent successfully!');
                } catch (err) {
                  alert('Failed to resend OTP');
                }
              }}
              onBack={() => setStep('form')}
            />
          ) : step === 'success' ? (
            <div className="text-center py-8">
              <div className="bg-teal-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {settings.autoApproveTaskers ? 'Welcome Aboard!' : 'Application Submitted!'}
              </h2>
              <p className="text-gray-600 mb-6">
                {settings.autoApproveTaskers 
                  ? 'Your tasker account is now active. Start accepting jobs!' 
                  : 'We\'ll review your application and contact you soon.'}
              </p>
              <Link to="/tasker-dashboard" className="inline-block bg-teal-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-teal-700 transition-all">
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmitForm}>
              {/* Google signup button */}
              <button
                type="button"
                onClick={handleGoogleSignup}
                className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 rounded-xl py-3 font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="mx-4 text-gray-400 text-sm font-medium">or fill in manually</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium text-sm">First Name</label>
                  <input value={firstName} onChange={e => setFirstName(e.target.value)} required className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all" type="text" placeholder="John" />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 font-medium text-sm">Last Name</label>
                  <input value={lastName} onChange={e => setLastName(e.target.value)} required className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all" type="text" placeholder="Doe" />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium text-sm">Email Address</label>
                <input value={email} onChange={e => setEmail(e.target.value)} required className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all" type="email" placeholder="you@example.com" />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="w-full sm:w-32">
                  <label className="block text-gray-700 mb-2 font-medium text-sm">Code</label>
                  <CountryCodeSelect value={countryCode} onChange={e => setCountryCode(e.target.value)} />
                </div>
                <div className="flex-1">
                  <label className="block text-gray-700 mb-2 font-medium text-sm">Phone Number</label>
                  <input value={phone} onChange={e => setPhone(e.target.value)} required className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all" type="tel" placeholder="8012345678" />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium text-sm">Password</label>
                <div className="relative">
                  <input
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
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

              <div>
                <label className="block text-gray-700 mb-3 font-medium text-sm">Services You Offer *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SERVICE_NAMES.map(serviceName => (
                    <label
                      key={serviceName}
                      className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        selectedServices.includes(serviceName)
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 hover:border-teal-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedServices.includes(serviceName)}
                        onChange={() => toggleService(serviceName)}
                        className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      />
                      <span className="font-medium text-gray-900 text-sm">{serviceName}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Select all services you can provide</p>
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium text-sm">About Your Experience</label>
                <textarea 
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  required 
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all" 
                  rows={4} 
                  placeholder="Tell us about your skills, experience, and what makes you a great tasker..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2 font-medium text-sm">State</label>
                  <select value={state} onChange={e => { setState(e.target.value); setLga(''); }} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all">
                    {NIGERIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2 font-medium text-sm">LGA</label>
                  <select value={lga} onChange={e => setLga(e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all">
                    {(STATE_LGAS[state] || []).map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium text-sm">Address</label>
                <input value={address} onChange={e => setAddress(e.target.value)} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all" type="text" placeholder="Your full address" />
              </div>

              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">{error}</div>}

              <button type="submit" disabled={loading} className="w-full bg-teal-600 text-white py-4 rounded-xl font-semibold hover:bg-teal-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50">
                {loading ? 'Please wait...' : 'Continue'}
              </button>
            </form>
          )}

          {step === 'form' && (
            <div className="text-center mt-6 text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-teal-600 font-semibold hover:text-teal-700">Log In</Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default BecomeTaskerPage;

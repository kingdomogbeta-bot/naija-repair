import { useState, useEffect, useRef } from 'react';
import { MapPin, AlertTriangle, Phone, X, Navigation, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sendEmergencyAlert, createSafetyReport } from '../services/api';

export default function SafetyTracker({ booking, onClose }) {
  const { getToken } = useAuth();
  const [location, setLocation] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [error, setError] = useState('');
  const [reportModal, setReportModal] = useState(false);
  const [reportText, setReportText] = useState('');
  const [locationHistory, setLocationHistory] = useState([]);
  const watchIdRef = useRef(null);

  useEffect(() => {
    const savedTracking = localStorage.getItem(`naija_tracking_${booking.id}`);
    if (savedTracking) {
      const data = JSON.parse(savedTracking);
      setLocationHistory(data.history || []);
      if (data.active) startTracking();
    }
  }, [booking.id]);

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }

    setTracking(true);
    setError('');

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: Date.now(),
          accuracy: position.coords.accuracy
        };
        setLocation(newLocation);
        
        setLocationHistory(prev => {
          const updated = [...prev, newLocation];
          localStorage.setItem(`naija_tracking_${booking.id}`, JSON.stringify({
            active: true,
            history: updated,
            bookingId: booking.id,
            taskerEmail: booking.taskerEmail
          }));
          return updated;
        });
      },
      (err) => setError('Unable to get location'),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );
  };

  const stopTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setTracking(false);
    localStorage.removeItem(`naija_tracking_${booking.id}`);
  };

  const shareLocation = () => {
    if (!location) return;
    const message = `My location: https://www.google.com/maps?q=${location.lat},${location.lng}`;
    navigator.clipboard.writeText(message);
    alert('Location copied to clipboard!');
  };

  const reportIssue = async () => {
    if (!reportText.trim()) return;

    try {
      const token = getToken();
      await createSafetyReport(token, {
        bookingId: booking._id || booking.id,
        taskerId: booking.taskerId,
        taskerName: booking.taskerName,
        type: 'issue',
        description: reportText,
        location: location ? { lat: location.lat, lng: location.lng } : null
      });

      alert('Report submitted. Admin will be notified.');
      setReportModal(false);
      setReportText('');
    } catch (error) {
      alert('Failed to submit report: ' + error.message);
    }
  };

  const handleEmergency = async () => {
    if (!confirm('🚨 EMERGENCY ALERT - This will notify admin and your emergency contact. Continue?')) return;

    try {
      const token = getToken();
      await sendEmergencyAlert(token, {
        bookingId: booking._id || booking.id,
        location: location ? { lat: location.lat, lng: location.lng } : null,
        message: 'EMERGENCY - User triggered panic button'
      });

      alert('Emergency alert sent! Admin has been notified.');
    } catch (error) {
      alert('Failed to send emergency alert: ' + error.message);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" 
      style={{ zIndex: 9999 }}
      onClick={onClose}
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold">Safety Tracker</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 p-4 rounded-xl">
            <p className="text-sm text-gray-700">
              <strong>Booking #{booking.id}</strong> - {booking.taskerName}
            </p>
            <p className="text-xs text-gray-600 mt-1">{booking.service}</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={tracking ? stopTracking : startTracking}
              className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 ${
                tracking
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-teal-600 hover:bg-teal-700 text-white'
              }`}
            >
              <Navigation className="w-5 h-5" />
              {tracking ? 'Stop Live Tracking' : 'Start Live Tracking'}
            </button>

            {location && (
              <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-teal-600 mt-1" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Current Location</p>
                    <p className="text-sm text-gray-600">
                      {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Accuracy: ±{Math.round(location.accuracy)}m
                    </p>
                  </div>
                </div>
                <button
                  onClick={shareLocation}
                  className="w-full py-2 bg-white border-2 border-teal-600 text-teal-600 rounded-lg font-semibold hover:bg-teal-50"
                >
                  Share Location
                </button>
              </div>
            )}

            {locationHistory.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <p className="font-semibold text-gray-900">Location History</p>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {locationHistory.slice(-10).reverse().map((loc, idx) => (
                    <div key={idx} className="text-xs text-gray-600 bg-white p-2 rounded">
                      {new Date(loc.timestamp).toLocaleTimeString()} - {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setReportModal(true)}
              className="py-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-5 h-5" />
              Report Issue
            </button>
            <button
              onClick={handleEmergency}
              className="py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 animate-pulse"
            >
              <AlertCircle className="w-5 h-5" />
              🚨 PANIC BUTTON
            </button>
          </div>
        </div>
      </div>

      {reportModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" 
          style={{ zIndex: 10000 }}
          onClick={() => setReportModal(false)}
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4">Report Safety Issue</h3>
            <textarea
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Describe the issue..."
              className="w-full border-2 border-gray-300 rounded-xl p-3 h-32 resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setReportModal(false)}
                className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 rounded-xl font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={reportIssue}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

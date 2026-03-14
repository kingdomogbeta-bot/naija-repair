import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTaskers } from '../context/TaskersContext';
import { useAuth } from '../context/AuthContext';
import { useMessages } from '../context/MessagesContext';
import { useFavorites } from '../context/FavoritesContext';
import { useReviews } from '../context/ReviewsContext';
import { Heart } from 'lucide-react';
import { resolveTaskerPhoto, setTaskerFallbackOnError } from '../utils/taskerPhoto';

export default function TaskerProfile() {
  const { id } = useParams();
  const { taskers } = useTaskers();
  const { user } = useAuth();
  const { sendMessage } = useMessages();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { reviews, getTaskerReviews } = useReviews();
  const navigate = useNavigate();
  const [showBooking, setShowBooking] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [taskerReviews, setTaskerReviews] = useState([]);

  const tasker = taskers.find(t => t.id === id);
  const isTaskerFavorite = isFavorite(id);

  useEffect(() => {
    if (id) {
      // Get reviews for this specific tasker
      const fetchTaskerReviews = async () => {
        try {
          const response = await fetch(`https://naija-repair-api.onrender.com/api/reviews/tasker/${id}`);
          if (response.ok) {
            const data = await response.json();
            setTaskerReviews(data.data || []);
          }
        } catch (error) {
          console.error('Failed to fetch tasker reviews:', error);
          setTaskerReviews([]);
        }
      };
      fetchTaskerReviews();
    }
  }, [id]);

  if (!tasker) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tasker not found</h2>
          <Link to="/services" className="text-teal-600 hover:text-teal-700">Browse all taskers</Link>
        </div>
      </div>
    );
  }

  const handleBookNow = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/book/${tasker.id}`);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!messageText.trim()) return;
    
    sendMessage({
      from: user.email,
      to: tasker.email,
      content: messageText,
      taskerId: tasker.id,
      taskerName: tasker.name,
    });
    setMessageText('');
    setShowMessage(false);
    navigate('/messages');
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/services" className="inline-flex items-center text-teal-600 hover:text-teal-700 mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Services
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-start gap-6 mb-8">
                <div className="relative">
                  <img
                    src={resolveTaskerPhoto(tasker)}
                    alt={tasker.name}
                    onError={(event) => setTaskerFallbackOnError(event, tasker)}
                    className="w-32 h-32 rounded-2xl object-cover"
                  />
                  {tasker.verified && (
                    <div className="absolute -bottom-2 -right-2 bg-teal-500 rounded-full p-2 shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{tasker.name}</h1>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`w-5 h-5 ${i < Math.floor(tasker.rating) ? 'text-yellow-400' : 'text-gray-300'} fill-current`} viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                      </div>
                      <span className="font-bold text-gray-900">{tasker.rating}</span>
                      <span className="text-gray-500">({taskerReviews.length} reviews)</span>
                    </div>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-600">{tasker.completedTasks} tasks completed</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tasker.services.map((service, idx) => (
                      <span key={idx} className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm font-medium">{service}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t pt-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
                <p className="text-gray-700 leading-relaxed">{tasker.bio}</p>
              </div>

              <div className="border-t pt-6 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Skills & Experience</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-teal-100 rounded-lg p-2">
                      <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Verified Identity</p>
                      <p className="text-sm text-gray-600">Background checked</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 rounded-lg p-2">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Quick Response</p>
                      <p className="text-sm text-gray-600">Replies within 1 hour</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Only show reviews section if there are actual reviews */}
              {taskerReviews && taskerReviews.length > 0 && (
                <div className="border-t pt-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Reviews ({taskerReviews.length})</h2>
                  <div className="space-y-6">
                    {taskerReviews.map(review => (
                      <div key={review._id} className="border-b pb-6 last:border-0">
                        <div className="flex items-start gap-4">
                          <img 
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(review.userName || 'User')}&background=0d9488&color=fff`} 
                            alt={review.userName || 'User'} 
                            className="w-12 h-12 rounded-full" 
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <p className="font-semibold text-gray-900">{review.userName || 'Anonymous User'}</p>
                                <p className="text-sm text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                              </div>
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <svg key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'} fill-current`} viewBox="0 0 20 20">
                                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                  </svg>
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-700">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <div className="text-center mb-6 pb-6 border-b">
                <p className="text-sm text-gray-500 mb-2">Starting from</p>
                <p className="text-4xl font-bold text-gray-900 mb-1">₦{tasker.hourlyRate.toLocaleString()}</p>
                <p className="text-gray-600">per hour</p>
              </div>
              <div className="space-y-3 mb-6">
                <button 
                  onClick={handleBookNow}
                  className="w-full bg-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-teal-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
                >
                  Book Now
                </button>
                <button 
                  onClick={() => user ? setShowMessage(true) : navigate('/login')}
                  className="w-full border-2 border-teal-600 text-teal-600 py-3 rounded-xl font-semibold hover:bg-teal-50 transition-all"
                >
                  💬 Send Message
                </button>
                <button
                  onClick={() => user ? toggleFavorite(id) : navigate('/login')}
                  className={`w-full border-2 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                    isTaskerFavorite
                      ? 'bg-red-50 border-red-500 text-red-600 hover:bg-red-100'
                      : 'border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-600 hover:bg-red-50'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isTaskerFavorite ? 'fill-current' : ''}`} />
                  {isTaskerFavorite ? 'Saved' : 'Save'}
                </button>
              </div>
              
              <div className="pt-6 border-t space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Lagos, Nigeria</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Joined {new Date(tasker.joinedDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-green-600 font-semibold">{tasker.availability}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{tasker.completedTasks} tasks completed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Book {tasker.name}</h3>
            <p className="text-gray-600 mb-6">You'll be redirected to complete your booking details.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => navigate('/services')}
                className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 transition-all"
              >
                Continue
              </button>
              <button 
                onClick={() => setShowBooking(false)}
                className="flex-1 border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:border-gray-300 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Message {tasker.name}</h3>
            <form onSubmit={handleSendMessage}>
              <textarea
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                placeholder="Type your message..."
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent mb-4"
                rows={4}
                required
              />
              <div className="flex gap-3">
                <button 
                  type="submit"
                  className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 transition-all"
                >
                  Send
                </button>
                <button 
                  type="button"
                  onClick={() => setShowMessage(false)}
                  className="flex-1 border-2 border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:border-gray-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

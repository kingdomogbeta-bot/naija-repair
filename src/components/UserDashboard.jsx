import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTaskers } from '../context/TaskersContext';
import { useBookings } from '../context/BookingsContext';
import { MapPin } from 'lucide-react';

export default function UserHome() {
  const { user } = useAuth();
  const { taskers } = useTaskers();
  const { bookings } = useBookings();

  const topTaskers = taskers
    .filter(t => !t.suspended && t.reviewCount > 0)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);

  const nearbyTaskers = taskers
    .filter(t => !t.suspended)
    .sort(() => Math.random() - 0.5)
    .slice(0, 8);

  const userBookings = bookings.filter(b => b.createdByEmail === user?.email);
  const upcomingCount = userBookings.filter(b => b.status === 'upcoming').length;
  const completedCount = userBookings.filter(b => b.status === 'completed').length;

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-cyan-50">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600/10 to-cyan-600/10 animate-pulse"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-4">
              Welcome back, <span className="bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">{user?.name?.split(' ')[0]}</span>! 👋
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Your trusted platform for quality home services across Nigeria
            </p>
          </div>

          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-3xl shadow-2xl p-8 md:p-12 mb-12 text-white relative overflow-hidden animate-fade-in">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Need a service?</h2>
              <p className="text-teal-100 text-lg mb-6 max-w-2xl">
                Browse our wide range of professional services and book verified taskers in minutes
              </p>
              <Link
                to="/services"
                className="inline-block bg-white text-teal-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-teal-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Browse Services →
              </Link>
            </div>
          </div>

          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <MapPin className="w-8 h-8 text-teal-600" />
                <h2 className="text-3xl font-bold text-gray-900">Taskers Near You</h2>
              </div>
              <Link to="/find-taskers" className="text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-2">
                View All
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {nearbyTaskers.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-md">
                <p className="text-gray-500">No taskers available in your area</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {nearbyTaskers.map((tasker, idx) => (
                  <Link
                    key={tasker.id}
                    to={`/tasker/${tasker.id}`}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-5 transform hover:-translate-y-2"
                  >
                    <div className="relative mb-4">
                      <img src={tasker.photoUrl} alt={tasker.name} className="w-full h-40 rounded-xl object-cover" />
                      {tasker.verified && (
                        <div className="absolute top-2 right-2 bg-teal-500 rounded-full p-1.5">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-teal-600" />
                        <span className="text-xs font-semibold text-gray-700">{(Math.random() * 5 + 0.5).toFixed(1)} km</span>
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2">{tasker.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                        <span className="ml-1 font-semibold text-gray-900 text-sm">{tasker.rating}</span>
                      </div>
                      <span className="text-gray-500 text-xs">({tasker.reviewCount})</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {tasker.services.slice(0, 1).map((service, i) => (
                        <span key={i} className="bg-teal-50 text-teal-700 px-2 py-1 rounded-full text-xs font-medium">
                          {service}
                        </span>
                      ))}
                      {tasker.services.length > 1 && (
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                          +{tasker.services.length - 1}
                        </span>
                      )}
                    </div>
                    <div className="pt-3 border-t border-gray-100">
                      <span className="text-xl font-bold text-teal-600">₦{tasker.hourlyRate.toLocaleString()}<span className="text-xs text-gray-500">/hr</span></span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Top Rated Taskers</h2>
              <Link to="/find-taskers" className="text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-2">
                View All
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {topTaskers.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-md">
                <p className="text-gray-500">No taskers available yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topTaskers.map((tasker, idx) => (
                  <Link
                    key={tasker.id}
                    to={`/tasker/${tasker.id}`}
                    className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 transform hover:-translate-y-2 animate-slide-up"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative">
                        <img src={tasker.photoUrl} alt={tasker.name} className="w-20 h-20 rounded-full object-cover ring-4 ring-teal-100" />
                        {tasker.verified && (
                          <div className="absolute -bottom-1 -right-1 bg-teal-500 rounded-full p-1">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg">{tasker.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                            </svg>
                            <span className="ml-1 font-semibold text-gray-900">{tasker.rating}</span>
                          </div>
                          <span className="text-gray-500 text-sm">({tasker.reviewCount})</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {tasker.services.slice(0, 2).map((service, i) => (
                        <span key={i} className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-medium">
                          {service}
                        </span>
                      ))}
                      {tasker.services.length > 2 && (
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">
                          +{tasker.services.length - 2}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-2xl font-bold text-teal-600">₦{tasker.hourlyRate.toLocaleString()}<span className="text-sm text-gray-500">/hr</span></span>
                      <span className="text-sm text-gray-600">{tasker.completedTasks} tasks</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
          animation-fill-mode: both;
        }
      `}</style>
    </main>
  );
}

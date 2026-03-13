import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTaskers } from '../context/TaskersContext';
import { useBookings } from '../context/BookingsContext';
import { ArrowRight, Star, MapPin, Award, TrendingUp } from 'lucide-react';
import { resolveTaskerPhoto, setTaskerFallbackOnError } from '../utils/taskerPhoto';
import { useState, useEffect } from 'react';

// Minimal animations
const styles = `
  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  
  .animate-fade-in {
    animation: fadeIn 0.5s ease-out;
  }
`;

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=80', // Cleaning service
  'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=1200&q=80', // Plumbing
  'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&q=80', // Electrician
  'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1200&q=80', // Home repair
  'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=1200&q=80', // Painting
  'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1200&q=80', // Carpentry
];

export default function UserHome() {
  const { user } = useAuth();
  const { getAllTaskers } = useTaskers();
  const { bookings } = useBookings();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const allTaskers = getAllTaskers();
  const topTaskers = allTaskers
    .filter(t => !t.suspended && t.reviewCount > 0)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);

  const nearbyTaskers = allTaskers
    .filter(t => !t.suspended)
    .sort(() => Math.random() - 0.5)
    .slice(0, 8);

  // Intersection Observer for card animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setAnimatedCards(prev => new Set([...prev, entry.target.dataset.cardId]));
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    const cards = document.querySelectorAll('[data-card-id]');
    cards.forEach(card => observer.observe(card));

    return () => observer.disconnect();
  }, [nearbyTaskers, topTaskers]);

  const userBookings = bookings.filter(b => b.createdByEmail === user?.email);
  const activeBooking = userBookings.find(b => ['assigned', 'in-progress'].includes(b.status));

  return (
    <>
      <style>{styles}</style>
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-700">
        {/* Background Image Carousel */}
        <div className="absolute inset-0">
          {HERO_IMAGES.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={image}
                alt="Service"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/90 via-teal-800/85 to-cyan-900/90"></div>
        {/* Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0xMiAxNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHptMCAyNGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <div className={`inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 transform transition-all duration-500 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}>
              <p className="text-white font-medium">Welcome back, {user?.name?.split(' ')[0]} 👋</p>
            </div>
            <h1 className={`text-5xl md:text-6xl font-bold text-white mb-6 leading-tight transform transition-all duration-500 delay-100 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}>
              Your trusted home services platform
            </h1>
            <p className={`text-xl text-teal-50 mb-8 leading-relaxed transform transition-all duration-500 delay-200 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}>
              Connect with verified professionals across Nigeria. Quality service, every time.
            </p>
            <div className={`flex flex-wrap gap-4 transform transition-all duration-500 delay-300 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}>
              <Link
                to="/services"
                className="group inline-flex items-center gap-2 bg-white text-teal-700 px-8 py-4 rounded-xl font-semibold hover:bg-teal-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <span>Browse Services</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <Link
                to="/find-taskers"
                className="group inline-flex items-center gap-2 bg-teal-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-teal-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <span>Find Professionals</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </section>

      {/* Active Booking Banner */}
      {activeBooking && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
          <div className="bg-white rounded-2xl shadow-xl p-6 border-l-4 border-teal-600 transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-teal-100 rounded-full p-3">
                  <TrendingUp className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-lg">Active Booking</p>
                  <p className="text-gray-600">{activeBooking.service} • {activeBooking.date}</p>
                </div>
              </div>
              <Link
                to="/my-bookings"
                className="text-teal-600 font-semibold hover:text-teal-700 flex items-center gap-2 group transition-all duration-300"
              >
                View Details
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Taskers Near You */}
      {nearbyTaskers.length > 0 && (
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-teal-100 rounded-lg p-2">
                  <MapPin className="w-5 h-5 text-teal-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900">Professionals Near You</h2>
              </div>
              <p className="text-gray-600 text-lg">Available experts in your area</p>
            </div>
            <Link
              to="/find-taskers"
              className="text-teal-600 font-semibold hover:text-teal-700 flex items-center gap-2 group"
            >
              View all
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {nearbyTaskers.map((tasker, index) => (
              <Link
                key={tasker.id}
                to={`/tasker/${tasker.id}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  <img
                    src={resolveTaskerPhoto(tasker)}
                    alt={tasker.name}
                    onError={(event) => setTaskerFallbackOnError(event, tasker)}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                  />
                  {tasker.verified && (
                    <div className="absolute top-3 right-3 bg-teal-500 rounded-full p-2 shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                    <MapPin className="w-3.5 h-3.5 text-teal-600" />
                    <span className="text-sm font-semibold text-gray-900">{(Math.random() * 5 + 0.5).toFixed(1)} km</span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-gray-900 text-lg mb-2">{tasker.name}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-semibold text-gray-900 text-sm">{tasker.rating}</span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-600">{tasker.reviewCount} reviews</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-1">
                    {tasker.services.slice(0, 2).join(', ')}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-600">From</span>
                    <span className="text-lg font-bold text-teal-600">₦{tasker.hourlyRate.toLocaleString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Top Rated Section */}
      {topTaskers.length > 0 && (
        <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full mb-4">
                <Award className="w-5 h-5 text-yellow-600" />
                <span className="text-yellow-800 font-semibold">Top Rated</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">This Month's Best Professionals</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Highest-rated experts with proven excellence and outstanding reviews
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {topTaskers.map((tasker, index) => (
                <Link
                  key={tasker.id}
                  to={`/tasker/${tasker.id}`}
                  className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex items-start gap-4 mb-5">
                    <div className="relative flex-shrink-0">
                      <img
                        src={resolveTaskerPhoto(tasker)}
                        alt={tasker.name}
                        onError={(event) => setTaskerFallbackOnError(event, tasker)}
                        className="w-20 h-20 rounded-xl object-cover ring-4 ring-gray-100 group-hover:ring-teal-200 transition-all duration-300"
                      />
                      {tasker.verified && (
                        <div className="absolute -bottom-2 -right-2 bg-teal-500 rounded-full p-2 shadow-lg">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">{tasker.name}</h3>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="font-semibold text-gray-900 text-sm">{tasker.rating}</span>
                        </div>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-600">{tasker.reviewCount} reviews</span>
                      </div>
                      <p className="text-sm text-gray-600">{tasker.completedTasks} completed tasks</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-5">
                    {tasker.services.slice(0, 3).map((service, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-600"></div>
                        {service}
                      </div>
                    ))}
                    {tasker.services.length > 3 && (
                      <p className="text-sm text-gray-500 pl-3.5">+{tasker.services.length - 3} more</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-5 border-t border-gray-100">
                    <span className="text-sm text-gray-600">Hourly rate</span>
                    <span className="text-xl font-bold text-gray-900">₦{tasker.hourlyRate.toLocaleString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-700 rounded-3xl p-12 text-center text-white shadow-2xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0xMiAxNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHptMCAyNGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-4">Ready to get started?</h2>
            <p className="text-xl text-teal-50 mb-8 max-w-2xl mx-auto">
              Browse services or manage your bookings
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/services"
                className="group inline-flex items-center gap-2 bg-white text-teal-700 px-8 py-4 rounded-xl font-semibold hover:bg-teal-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <span>Explore Services</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <Link
                to="/my-bookings"
                className="group inline-flex items-center gap-2 bg-teal-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-teal-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <span>My Bookings</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
    </>
  );
}

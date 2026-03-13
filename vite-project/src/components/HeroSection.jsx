import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Subtle professional animations
const styles = `
  @keyframes slideUp {
    0% { transform: translateY(20px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
  
  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  
  .animate-slide-up {
    animation: slideUp 0.6s ease-out;
  }
  
  .animate-fade-in {
    animation: fadeIn 0.6s ease-out;
  }
`;

function HeroSection() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/find-taskers?search=${encodeURIComponent(searchQuery)}`);
    }
  };
  return (
    <>
      <style>{styles}</style>
      <section className="relative bg-gradient-to-br from-teal-50 via-white to-teal-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className={`transform transition-all duration-1000 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
            }`}>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
                <span className={`block transform transition-all duration-500 ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}>
                  Everyday life
                </span>
                <span className={`block text-teal-600 transform transition-all duration-500 delay-200 ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}>
                  made easier
                </span>
              </h1>
              <p className={`text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed transform transition-all duration-500 delay-300 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}>
                Connect with skilled Taskers for home repairs, cleaning, moving, and more. Book trusted help in minutes.
              </p>
              <form onSubmit={handleSearch} className={`mb-8 transform transition-all duration-500 delay-400 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}>
                <div className="relative max-w-2xl group">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="What service do you need? (e.g., plumber, cleaner, electrician)"
                    className="w-full px-6 py-4 pr-32 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-lg group-hover:shadow-xl transition-all duration-300"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-2 bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  >
                    Search
                  </button>
                </div>
              </form>
              <div className={`flex flex-col sm:flex-row gap-4 transform transition-all duration-500 delay-500 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}>
                <Link
                  to="/services"
                  className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-teal-600 rounded-xl shadow-lg hover:bg-teal-700 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  <span>Book a Tasker</span>
                  <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  to="/become-tasker"
                  className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-teal-700 bg-white border-2 border-teal-200 rounded-xl hover:border-teal-400 hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                >
                  <span>Become a Tasker</span>
                </Link>
            </div>
          </div>
          <div className={`relative transform transition-all duration-600 delay-200 ${
            isVisible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
          }`}>
            <div className="relative group">
              <img
                src="https://images.pexels.com/photos/5691608/pexels-photo-5691608.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Professional tasker at work"
                className="rounded-2xl shadow-2xl w-full object-cover h-[500px] group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              <div className={`absolute -bottom-6 -left-6 bg-white rounded-xl shadow-2xl p-4 transform transition-all duration-600 delay-600 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="bg-teal-100 rounded-full p-3">
                    <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">50,000+</p>
                    <p className="text-sm text-gray-600">Tasks completed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent"></div>
    </section>
    </>
  );
}

export default HeroSection;

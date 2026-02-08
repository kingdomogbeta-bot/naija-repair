import { Link } from 'react-router-dom';

function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-teal-50 via-white to-teal-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-up">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
              Everyday life
              <span className="block text-teal-600">made easier</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              Connect with skilled Taskers for home repairs, cleaning, moving, and more. Book trusted help in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/services"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-teal-600 rounded-xl shadow-lg hover:bg-teal-700 hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Book a Tasker
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                to="/become-tasker"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-teal-700 bg-white border-2 border-teal-200 rounded-xl hover:border-teal-400 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Become a Tasker
              </Link>
            </div>
          </div>
          <div className="relative animate-fade-in">
            <div className="absolute -top-4 -right-4 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
            <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{animationDelay: '2s'}}></div>
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/5691608/pexels-photo-5691608.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Professional tasker at work"
                className="rounded-2xl shadow-2xl w-full object-cover h-[500px]"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 animate-scale-in">
                <div className="flex items-center gap-3">
                  <div className="bg-teal-100 rounded-full p-3">
                    <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">50,000+</p>
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
  );
}

export default HeroSection;

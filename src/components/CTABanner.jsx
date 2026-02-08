import { Link } from 'react-router-dom';

function CTABanner() {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-teal-700 to-teal-800"></div>
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to get started?</h2>
        <p className="text-xl text-teal-100 mb-10 max-w-2xl mx-auto">Join thousands of happy customers and Taskers using NAIJA-REPAIR for all their home service needs.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/services"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-teal-700 bg-white rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transform transition-all duration-200"
          >
            Book a Service
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <Link
            to="/become-tasker"
            className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-teal-800 border-2 border-white/30 rounded-xl hover:bg-teal-900 hover:border-white/50 transform hover:scale-105 transition-all duration-200"
          >
            Become a Tasker
          </Link>
        </div>
      </div>
    </section>
  );
}

export default CTABanner;

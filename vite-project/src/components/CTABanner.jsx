import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const styles = `
  @keyframes fadeIn {
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  
  .animate-fade-in {
    animation: fadeIn 0.6s ease-out;
  }
`;

function CTABanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.dataset.section === 'cta') {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.3 }
    );

    const section = document.querySelector('[data-section="cta"]');
    if (section) observer.observe(section);

    return () => observer.disconnect();
  }, []);
  return (
    <>
      <style>{styles}</style>
      <section className="relative py-20 overflow-hidden" data-section="cta">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-600 via-teal-700 to-teal-800"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className={`text-4xl md:text-5xl font-bold text-white mb-6 transform transition-all duration-600 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>Ready to get started?</h2>
          <p className={`text-xl text-teal-100 mb-10 max-w-2xl mx-auto transform transition-all duration-600 delay-200 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>Join thousands of happy customers and Taskers using NAIJA-REPAIR for all their home service needs.</p>
          <div className={`flex flex-col sm:flex-row gap-4 justify-center transform transition-all duration-600 delay-300 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <Link
              to="/services"
              className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-teal-700 bg-white rounded-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <span>Book a Service</span>
              <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              to="/become-tasker"
              className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-teal-800 border-2 border-white/30 rounded-xl hover:bg-teal-900 hover:border-white/50 transform hover:-translate-y-1 transition-all duration-300"
            >
              <span>Become a Tasker</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default CTABanner;

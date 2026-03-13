import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getServices } from '../config/services';

// Subtle animations
const styles = `
  @keyframes fadeInScale {
    0% { transform: scale(0.95); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }
  
  .animate-fade-in-scale {
    animation: fadeInScale 0.5s ease-out;
  }
`;

function ServicesSection() {
  const [services, setServices] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [animatedCards, setAnimatedCards] = useState(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target.dataset.section === 'services') {
              setIsVisible(true);
            }
            if (entry.target.dataset.cardId) {
              setAnimatedCards(prev => new Set([...prev, entry.target.dataset.cardId]));
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    const section = document.querySelector('[data-section="services"]');
    const cards = document.querySelectorAll('[data-card-id^="service-"]');
    
    if (section) observer.observe(section);
    cards.forEach(card => observer.observe(card));

    return () => observer.disconnect();
  }, [services]);

  useEffect(() => {
    const loadServices = async () => {
      const servicesData = await getServices();
      setServices(Array.isArray(servicesData) ? servicesData.slice(0, 8) : []);
    };
    loadServices();
    window.addEventListener('storage', loadServices);
    const interval = setInterval(loadServices, 1000);
    return () => {
      window.removeEventListener('storage', loadServices);
      clearInterval(interval);
    };
  }, []);

  const displayServices = services;

  return (
    <>
      <style>{styles}</style>
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white" data-section="services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 transform transition-all duration-600 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Services</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Professional services delivered by verified experts across Nigeria</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayServices.map((service, index) => (
              <Link
                key={index}
                to="/services"
                data-card-id={`service-${index}`}
                className={`group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${
                  animatedCards.has(`service-${index}`) 
                    ? 'translate-y-0 opacity-100' 
                    : 'translate-y-8 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 transform scale-0 group-hover:scale-100 transition-transform duration-300">
                    <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">{service.name}</h3>
                  <p className="text-sm text-gray-600">{service.description}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className={`text-center mt-12 transform transition-all duration-600 delay-300 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <Link
              to="/services"
              className="group inline-flex items-center bg-teal-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <span>Browse All Services</span>
              <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default ServicesSection;

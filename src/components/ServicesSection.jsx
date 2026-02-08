import { Link } from 'react-router-dom';
import { SERVICES } from '../config/services';

function ServicesSection() {
  const displayServices = SERVICES.slice(0, 8);

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Services</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Professional services delivered by verified experts across Nigeria</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayServices.map((service, index) => (
            <Link
              key={index}
              to="/services"
              className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={service.image} 
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{service.name}</h3>
                <p className="text-sm text-gray-600">{service.description}</p>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link
            to="/services"
            className="inline-flex items-center bg-teal-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-teal-700 transition-all shadow-lg hover:shadow-xl"
          >
            Browse All Services
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ServicesSection;

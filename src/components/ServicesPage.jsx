import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SERVICES, SERVICE_CATEGORIES } from '../config/services';

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredServices = selectedCategory === 'All' 
    ? SERVICES 
    : SERVICES.filter(s => s.category === selectedCategory);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Services</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional services delivered by verified experts across Nigeria. Quality work guaranteed.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {SERVICE_CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                selectedCategory === category
                  ? 'bg-teal-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map(service => (
            <div
              key={service.id}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-teal-600 text-white px-4 py-2 rounded-full font-bold shadow-lg">
                  From {service.startingPrice}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{service.name}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{service.description}</p>
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">What's Included:</h4>
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-700 text-sm">
                        <svg className="w-5 h-5 text-teal-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link
                  to={service.specialService === 'dry-cleaning' ? '/dry-cleaning-booking' : '/find-taskers'}
                  className="block w-full bg-teal-600 text-white text-center py-3 rounded-xl font-semibold hover:bg-teal-700 transition-all shadow-md hover:shadow-lg"
                >
                  {service.specialService === 'dry-cleaning' ? 'Book Dry Cleaning' : 'Book Now'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

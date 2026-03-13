import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getServices, getServiceCategories } from '../config/services';

export default function ServicesPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      setLoading(true);
      const servicesData = await getServices();
      const categoriesData = getServiceCategories();
      setServices(Array.isArray(servicesData) ? servicesData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setLoading(false);
    };
    loadServices();
  }, []);

  let filteredServices = selectedCategory === 'All' 
    ? services 
    : services.filter(s => s.category === selectedCategory);

  if (priceFilter === 'low') filteredServices = filteredServices.filter(s => parseInt(s.startingPrice.replace(/[^0-9]/g, '')) < 3000);
  if (priceFilter === 'medium') {
    filteredServices = filteredServices.filter(s => {
      const price = parseInt(s.startingPrice.replace(/[^0-9]/g, ''));
      return price >= 3000 && price <= 5000;
    });
  }
  if (priceFilter === 'high') filteredServices = filteredServices.filter(s => parseInt(s.startingPrice.replace(/[^0-9]/g, '')) > 5000);

  if (sortBy === 'price-low') filteredServices.sort((a, b) => parseInt(a.startingPrice.replace(/[^0-9]/g, '')) - parseInt(b.startingPrice.replace(/[^0-9]/g, '')));
  if (sortBy === 'price-high') filteredServices.sort((a, b) => parseInt(b.startingPrice.replace(/[^0-9]/g, '')) - parseInt(a.startingPrice.replace(/[^0-9]/g, '')));

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Services</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional services delivered by verified experts across Nigeria. Quality work guaranteed.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map(category => (
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

        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-white rounded-xl shadow-md p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Price:</span>
            <select value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)} className="border-2 border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="all">All Prices</option>
              <option value="low">Under ₦3,000</option>
              <option value="medium">₦3,000 - ₦5,000</option>
              <option value="high">Over ₦5,000</option>
            </select>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Sort:</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border-2 border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="popular">Most Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
          <p className="text-sm text-gray-600">{filteredServices.length} services</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
                <div className="h-56 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                  <div className="space-y-2 mb-6">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No services found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters</p>
            <button onClick={() => { setSelectedCategory('All'); setPriceFilter('all'); }} className="bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-700">
              Clear Filters
            </button>
          </div>
        ) : (
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
                    to={service.specialService === 'dry-cleaning' ? '/dry-cleaning-booking' : `/find-taskers?service=${encodeURIComponent(service.name)}`}
                    className="block w-full bg-teal-600 text-white text-center py-3 rounded-xl font-semibold hover:bg-teal-700 transition-all shadow-md hover:shadow-lg"
                  >
                    {service.specialService === 'dry-cleaning' ? 'Book Dry Cleaning' : 'Book Now'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

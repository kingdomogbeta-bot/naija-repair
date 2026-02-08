import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTaskers } from '../context/TaskersContext';
import { SERVICE_NAMES } from '../config/services';

export default function FindTaskersPage() {
  const { taskers } = useTaskers();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState('All');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [minRating, setMinRating] = useState(0);

  const services = ['All', ...SERVICE_NAMES];

  let filteredTaskers = taskers.filter(tasker => {
    const matchesSearch = tasker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tasker.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesService = selectedService === 'All' || tasker.services.includes(selectedService);
    const matchesRating = tasker.rating >= minRating;
    const notSuspended = !tasker.suspended;
    
    let matchesPrice = true;
    if (priceRange === 'low') matchesPrice = tasker.hourlyRate < 3000;
    else if (priceRange === 'medium') matchesPrice = tasker.hourlyRate >= 3000 && tasker.hourlyRate <= 5000;
    else if (priceRange === 'high') matchesPrice = tasker.hourlyRate > 5000;

    return matchesSearch && matchesService && matchesRating && matchesPrice && notSuspended;
  });

  if (sortBy === 'rating') {
    filteredTaskers.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'price-low') {
    filteredTaskers.sort((a, b) => a.hourlyRate - b.hourlyRate);
  } else if (sortBy === 'price-high') {
    filteredTaskers.sort((a, b) => b.hourlyRate - a.hourlyRate);
  } else if (sortBy === 'reviews') {
    filteredTaskers.sort((a, b) => b.reviewCount - a.reviewCount);
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Find Taskers</h1>
          <p className="text-gray-600">Browse skilled professionals ready to help</p>
        </div>

        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name or service..."
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 pl-12 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <svg className="w-6 h-6 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">Filters</h3>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
                <select
                  value={selectedService}
                  onChange={e => setSelectedService(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {services.map(service => (
                    <option key={service} value={service}>{service}</option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <div className="space-y-2">
                  {[
                    { value: 'all', label: 'All Prices' },
                    { value: 'low', label: 'Under ₦3,000/hr' },
                    { value: 'medium', label: '₦3,000 - ₦5,000/hr' },
                    { value: 'high', label: 'Over ₦5,000/hr' },
                  ].map(option => (
                    <label key={option.value} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="price"
                        value={option.value}
                        checked={priceRange === option.value}
                        onChange={e => setPriceRange(e.target.value)}
                        className="w-4 h-4 text-teal-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Rating</label>
                <div className="space-y-2">
                  {[4.5, 4.0, 3.5, 0].map(rating => (
                    <label key={rating} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="rating"
                        value={rating}
                        checked={minRating === rating}
                        onChange={() => setMinRating(rating)}
                        className="w-4 h-4 text-teal-600"
                      />
                      <span className="ml-2 text-sm text-gray-700 flex items-center">
                        {rating > 0 ? (
                          <>
                            {rating}+ <svg className="w-4 h-4 text-yellow-400 fill-current ml-1" viewBox="0 0 20 20">
                              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                            </svg>
                          </>
                        ) : 'All Ratings'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedService('All');
                  setPriceRange('all');
                  setMinRating(0);
                  setSearchQuery('');
                }}
                className="w-full text-teal-600 hover:text-teal-700 font-medium text-sm"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">{filteredTaskers.length} tasker{filteredTaskers.length !== 1 ? 's' : ''} found</p>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="border-2 border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="rating">Highest Rated</option>
                <option value="reviews">Most Reviews</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {filteredTaskers.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500 text-lg">No taskers found</p>
                <p className="text-gray-400 text-sm">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTaskers.map(tasker => (
                  <Link
                    key={tasker.id}
                    to={`/tasker/${tasker.id}`}
                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all p-6 border-2 border-transparent hover:border-teal-200"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative">
                        <img src={tasker.photoUrl} alt={tasker.name} className="w-20 h-20 rounded-xl object-cover" />
                        {tasker.verified && (
                          <div className="absolute -bottom-1 -right-1 bg-teal-500 rounded-full p-1">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        {tasker.isNew && (
                          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">NEW</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg mb-1">{tasker.name}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          {tasker.reviewCount > 0 ? (
                            <>
                              <div className="flex items-center">
                                <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                </svg>
                                <span className="ml-1 font-semibold text-gray-900">{tasker.rating}</span>
                              </div>
                              <span className="text-gray-500 text-sm">({tasker.reviewCount})</span>
                              <span className="text-gray-400">•</span>
                            </>
                          ) : (
                            <>
                              <span className="text-gray-500 text-sm">No reviews yet</span>
                              <span className="text-gray-400">•</span>
                            </>
                          )}
                          <span className="text-gray-600 text-sm">{tasker.completedTasks} tasks</span>
                        </div>
                        <p className="text-2xl font-bold text-teal-600">₦{tasker.hourlyRate.toLocaleString()}<span className="text-sm text-gray-500">/hr</span></p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {tasker.services.slice(0, 3).map((service, idx) => (
                        <span key={idx} className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-xs font-medium">{service}</span>
                      ))}
                      {tasker.services.length > 3 && (
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium">+{tasker.services.length - 3} more</span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2">{tasker.bio}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

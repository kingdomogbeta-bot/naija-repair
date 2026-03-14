import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTaskers } from '../context/TaskersContext';
import { getServices } from '../config/services';
import { useSettings } from '../context/SettingsContext';
import { resolveTaskerPhoto, setTaskerFallbackOnError } from '../utils/taskerPhoto';
import { Search, SlidersHorizontal, Star, MapPin, Briefcase, Award, TrendingUp } from 'lucide-react';

export default function FindTaskersPage() {
  const { getAllTaskers } = useTaskers();
  const { settings } = useSettings();
  const [searchParams] = useSearchParams();
  const serviceFromUrl = searchParams.get('service');
  const searchFromUrl = searchParams.get('search');
  
  const [searchQuery, setSearchQuery] = useState(searchFromUrl || '');
  const [selectedService, setSelectedService] = useState(serviceFromUrl || 'All');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [minRating, setMinRating] = useState(0);
  const [serviceNames, setServiceNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setLoading(true);
    const loadServices = async () => {
      const servicesData = await getServices();
      setServiceNames(Array.isArray(servicesData) ? servicesData.map(s => s.name) : []);
      setTimeout(() => setLoading(false), 500);
    };
    loadServices();
  }, []);

  const services = ['All', ...serviceNames];
  const allTaskers = getAllTaskers();

  let filteredTaskers = allTaskers.filter(tasker => {
    const matchesSearch = tasker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tasker.services.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesService = selectedService === 'All' || tasker.services.some(s => {
      if (!s || !selectedService) return false;
      const a = s.toString().toLowerCase().trim();
      const b = selectedService.toString().toLowerCase().trim();
      return a === b || a.includes(b) || b.includes(a);
    });
    // New real taskers have rating 0 — don't filter them out by rating
    const effectiveMinRating = tasker.isBackendTasker && tasker.reviewCount === 0 ? 0 : (settings.minTaskerRating || minRating);
    const matchesRating = tasker.rating >= effectiveMinRating;
    const notSuspended = !tasker.suspended;
    const isApproved = true; // show all non-suspended taskers
    
    let matchesPrice = true;
    if (priceRange === 'low') matchesPrice = tasker.hourlyRate < 3000;
    else if (priceRange === 'medium') matchesPrice = tasker.hourlyRate >= 3000 && tasker.hourlyRate <= 5000;
    else if (priceRange === 'high') matchesPrice = tasker.hourlyRate > 5000;

    return matchesSearch && matchesService && matchesRating && matchesPrice && notSuspended && isApproved;
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
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-700">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0xMiAxNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHptMCAyNGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <TrendingUp className="w-5 h-5 text-white" />
              <span className="text-white font-medium">Find Your Perfect Professional</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Discover verified experts for any task
            </h1>
            <p className="text-xl text-teal-50 mb-8 leading-relaxed">
              Browse profiles, compare rates, and book with confidence. Quality professionals at your fingertips.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl">
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name, service, or skill..."
                className="w-full pl-16 pr-6 py-5 border-0 rounded-2xl focus:outline-none focus:ring-4 focus:ring-white/30 text-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden flex items-center gap-2 px-5 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-teal-300 hover:shadow-md transition-all"
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="font-medium">Filters</span>
          </button>
          <div className="ml-auto">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-5 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent font-medium"
            >
              <option value="rating">⭐ Highest Rated</option>
              <option value="reviews">💬 Most Reviews</option>
              <option value="price-low">💰 Price: Low to High</option>
              <option value="price-high">💰 Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:block ${showFilters ? 'block' : 'hidden'}`}>
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-teal-600" />
                  Filters
                </h3>
                <button
                  onClick={() => {
                    setSelectedService('All');
                    setPriceRange('all');
                    setMinRating(0);
                    setSearchQuery('');
                  }}
                  className="text-sm text-teal-600 hover:text-teal-700 font-semibold"
                >
                  Clear all
                </button>
              </div>

              {/* Service Filter */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <label className="block text-sm font-semibold text-gray-900 mb-3">Service Category</label>
                <select
                  value={selectedService}
                  onChange={e => setSelectedService(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                >
                  {services.map(service => (
                    <option key={service} value={service}>{service}</option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6 pb-6 border-b border-gray-200">
                <label className="block text-sm font-semibold text-gray-900 mb-3">Hourly Rate</label>
                <div className="space-y-3">
                  {[
                    { value: 'all', label: 'Any price', icon: '💰' },
                    { value: 'low', label: 'Under ₦3,000', icon: '💵' },
                    { value: 'medium', label: '₦3,000 - ₦5,000', icon: '💴' },
                    { value: 'high', label: 'Over ₦5,000', icon: '💎' },
                  ].map(option => (
                    <label key={option.value} className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="price"
                        value={option.value}
                        checked={priceRange === option.value}
                        onChange={e => setPriceRange(e.target.value)}
                        className="w-5 h-5 text-teal-600 focus:ring-teal-500"
                      />
                      <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 font-medium">
                        {option.icon} {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">Minimum Rating</label>
                <div className="space-y-3">
                  {[4.5, 4.0, 3.5, 0].map(rating => (
                    <label key={rating} className="flex items-center cursor-pointer group">
                      <input
                        type="radio"
                        name="rating"
                        value={rating}
                        checked={minRating === rating}
                        onChange={() => setMinRating(rating)}
                        className="w-5 h-5 text-teal-600 focus:ring-teal-500"
                      />
                      <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 font-medium flex items-center gap-1">
                        {rating > 0 ? (
                          <>
                            {rating}+ <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          </>
                        ) : '⭐ All ratings'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1,2,3,4].map(i => (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-24 h-24 bg-gray-200 rounded-2xl"></div>
                      <div className="flex-1">
                        <div className="h-6 bg-gray-200 rounded mb-3 w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : filteredTaskers.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 text-center shadow-lg">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No professionals found</h3>
                <p className="text-gray-600 mb-8 text-lg">Try adjusting your filters or search terms</p>
                <button 
                  onClick={() => { 
                    setSelectedService('All'); 
                    setPriceRange('all'); 
                    setMinRating(0); 
                    setSearchQuery(''); 
                  }} 
                  className="bg-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-teal-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredTaskers.map(tasker => (
                  <Link
                    key={tasker.id}
                    to={`/tasker/${tasker.id}`}
                    className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 hover:border-teal-200"
                  >
                    <div className="flex items-start gap-4 mb-5">
                      <div className="relative flex-shrink-0">
                        <img
                          src={resolveTaskerPhoto(tasker)}
                          alt={tasker.name}
                          onError={(event) => setTaskerFallbackOnError(event, tasker)}
                          className="w-24 h-24 rounded-2xl object-cover ring-4 ring-gray-100 group-hover:ring-teal-100 transition-all"
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
                        <h3 className="font-bold text-gray-900 text-xl mb-2">{tasker.name}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          {tasker.reviewCount > 0 ? (
                            <>
                              <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="font-bold text-gray-900 text-sm">{tasker.rating}</span>
                              </div>
                              <span className="text-sm text-gray-600">({tasker.reviewCount} reviews)</span>
                            </>
                          ) : (
                            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">New professional</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Briefcase className="w-4 h-4 text-teal-600" />
                          <span className="font-medium">{tasker.completedTasks} tasks completed</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-5">
                      {tasker.services.slice(0, 3).map((service, idx) => (
                        <span key={idx} className="bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg text-xs font-semibold">
                          {service}
                        </span>
                      ))}
                      {tasker.services.length > 3 && (
                        <span className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-semibold">
                          +{tasker.services.length - 3}
                        </span>
                      )}
                    </div>

                    {tasker.bio && (
                      <p className="text-sm text-gray-600 mb-5 line-clamp-2 leading-relaxed">{tasker.bio}</p>
                    )}

                    <div className="flex items-center justify-between pt-5 border-t-2 border-gray-100">
                      <span className="text-sm text-gray-600 font-medium">Starting at</span>
                      <span className="text-2xl font-bold text-teal-600">₦{tasker.hourlyRate.toLocaleString()}<span className="text-sm font-normal text-gray-500">/hr</span></span>
                    </div>
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

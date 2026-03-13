import { MapPin, Clock, Award, Languages } from 'lucide-react';

export default function AdvancedFilters({ filters, onFilterChange }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Location
        </label>
        <select
          value={filters.location || 'all'}
          onChange={(e) => onFilterChange({ ...filters, location: e.target.value })}
          className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="all">All Locations</option>
          <option value="Lagos">Lagos</option>
          <option value="Abuja">Abuja</option>
          <option value="Port Harcourt">Port Harcourt</option>
          <option value="Kano">Kano</option>
          <option value="Ibadan">Ibadan</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Availability
        </label>
        <div className="space-y-2">
          {[
            { value: 'all', label: 'Any Time' },
            { value: 'today', label: 'Available Today' },
            { value: 'weekend', label: 'Weekend Available' },
            { value: 'urgent', label: 'Same-Day Service' }
          ].map(option => (
            <label key={option.value} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="availability"
                value={option.value}
                checked={filters.availability === option.value}
                onChange={(e) => onFilterChange({ ...filters, availability: e.target.value })}
                className="w-4 h-4 text-teal-600"
              />
              <span className="ml-2 text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Award className="w-4 h-4" />
          Experience Level
        </label>
        <div className="space-y-2">
          {[
            { value: 'all', label: 'All Levels' },
            { value: 'beginner', label: 'Beginner (0-2 years)' },
            { value: 'intermediate', label: 'Intermediate (2-5 years)' },
            { value: 'expert', label: 'Expert (5+ years)' }
          ].map(option => (
            <label key={option.value} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="experience"
                value={option.value}
                checked={filters.experience === option.value}
                onChange={(e) => onFilterChange({ ...filters, experience: e.target.value })}
                className="w-4 h-4 text-teal-600"
              />
              <span className="ml-2 text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Languages className="w-4 h-4" />
          Languages
        </label>
        <div className="space-y-2">
          {['English', 'Yoruba', 'Igbo', 'Hausa'].map(lang => (
            <label key={lang} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.languages?.includes(lang) || false}
                onChange={(e) => {
                  const languages = filters.languages || [];
                  const newLanguages = e.target.checked
                    ? [...languages, lang]
                    : languages.filter(l => l !== lang);
                  onFilterChange({ ...filters, languages: newLanguages });
                }}
                className="w-4 h-4 text-teal-600 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{lang}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={filters.verifiedOnly || false}
            onChange={(e) => onFilterChange({ ...filters, verifiedOnly: e.target.checked })}
            className="w-4 h-4 text-teal-600 rounded"
          />
          <span className="ml-2 text-sm font-medium text-gray-700">Verified Taskers Only</span>
        </label>
      </div>

      <div>
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={filters.backgroundCheck || false}
            onChange={(e) => onFilterChange({ ...filters, backgroundCheck: e.target.checked })}
            className="w-4 h-4 text-teal-600 rounded"
          />
          <span className="ml-2 text-sm font-medium text-gray-700">Background Check Passed</span>
        </label>
      </div>
    </div>
  );
}

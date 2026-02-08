import { useState } from 'react';
import { Calendar, Repeat } from 'lucide-react';

export default function RecurringBooking({ bookingData, onUpdate }) {
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState('weekly');
  const [endDate, setEndDate] = useState('');
  const [occurrences, setOccurrences] = useState(4);

  const handleToggle = (enabled) => {
    setIsRecurring(enabled);
    onUpdate({
      isRecurring: enabled,
      frequency: enabled ? frequency : null,
      endDate: enabled ? endDate : null,
      occurrences: enabled ? occurrences : null
    });
  };

  const handleFrequencyChange = (freq) => {
    setFrequency(freq);
    onUpdate({
      isRecurring,
      frequency: freq,
      endDate,
      occurrences
    });
  };

  return (
    <div className="border-2 border-gray-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Repeat className="w-5 h-5 text-teal-600" />
          <span className="font-semibold text-gray-900">Recurring Task</span>
        </div>
        <button
          onClick={() => handleToggle(!isRecurring)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isRecurring ? 'bg-teal-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isRecurring ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {isRecurring && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
            <div className="grid grid-cols-3 gap-2">
              {['weekly', 'biweekly', 'monthly'].map(freq => (
                <button
                  key={freq}
                  onClick={() => handleFrequencyChange(freq)}
                  className={`p-2 border-2 rounded-lg text-sm font-medium transition-all ${
                    frequency === freq
                      ? 'border-teal-500 bg-teal-50 text-teal-700'
                      : 'border-gray-200 text-gray-700 hover:border-teal-200'
                  }`}
                >
                  {freq === 'weekly' ? 'Weekly' : freq === 'biweekly' ? 'Bi-weekly' : 'Monthly'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Number of Occurrences</label>
            <select
              value={occurrences}
              onChange={(e) => {
                setOccurrences(parseInt(e.target.value));
                onUpdate({ isRecurring, frequency, endDate, occurrences: parseInt(e.target.value) });
              }}
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {[4, 8, 12, 16, 20, 24].map(num => (
                <option key={num} value={num}>{num} times</option>
              ))}
            </select>
          </div>

          <div className="bg-teal-50 rounded-lg p-3">
            <p className="text-sm text-teal-800">
              <Calendar className="w-4 h-4 inline mr-1" />
              This task will repeat {frequency} for {occurrences} times
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

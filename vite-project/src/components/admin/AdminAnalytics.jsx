import { useBookings } from '../../context/BookingsContext';
import { useTaskers } from '../../context/TaskersContext';
import { resolveTaskerPhoto, setTaskerFallbackOnError } from '../../utils/taskerPhoto';

export default function AdminAnalytics() {
  const { bookings } = useBookings();
  const { taskers } = useTaskers();

  const serviceStats = [
    { name: 'Plumbing', count: 234, percentage: 35 },
    { name: 'Cleaning', count: 189, percentage: 28 },
    { name: 'Electrical', count: 156, percentage: 23 },
    { name: 'Gardening', count: 92, percentage: 14 },
  ];

  const cityStats = [
    { name: 'Lagos', percentage: 45 },
    { name: 'Abuja', percentage: 25 },
    { name: 'Port Harcourt', percentage: 15 },
    { name: 'Others', percentage: 15 },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Service Popularity</h3>
          <div className="space-y-4">
            {serviceStats.map((service, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{service.name}</span>
                  <span className="text-sm text-gray-600">{service.count} bookings</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-teal-600 h-2 rounded-full" 
                    style={{ width: `${service.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Bookings by City</h3>
          <div className="space-y-4">
            {cityStats.map((city, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{city.name}</span>
                  <span className="text-sm text-gray-600">{city.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${city.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Top Performing Taskers</h3>
          <div className="space-y-3">
            {taskers.slice(0, 5).map((tasker, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-xl font-bold text-gray-400">#{idx + 1}</span>
                <img
                  src={resolveTaskerPhoto(tasker)}
                  alt={tasker.name}
                  onError={(event) => setTaskerFallbackOnError(event, tasker)}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{tasker.name}</p>
                  <p className="text-sm text-gray-600">{tasker.completedTasks} tasks</p>
                </div>
                <span className="text-yellow-400">⭐ {tasker.rating}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Platform Metrics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-gray-700">Average Rating</span>
              <span className="text-xl font-bold text-blue-600">4.8 ⭐</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <span className="text-gray-700">Completion Rate</span>
              <span className="text-xl font-bold text-green-600">92%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="text-gray-700">Avg Response Time</span>
              <span className="text-xl font-bold text-yellow-600">2.5 hrs</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <span className="text-gray-700">Customer Satisfaction</span>
              <span className="text-xl font-bold text-purple-600">95%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

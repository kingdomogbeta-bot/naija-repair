import { Heart, Star, MapPin, MessageCircle } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';
import { useTaskers } from '../context/TaskersContext';
import { Link } from 'react-router-dom';

const FavoritesPage = () => {
  const { favorites, removeFavorite } = useFavorites();
  const { taskers } = useTaskers();

  const favoriteTaskers = taskers.filter(t => {
    const tid = String(t._id || t.id);
    return favorites.some(f => String(f) === tid);
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Favorites</h1>
          <p className="text-gray-600">Taskers you've saved for later</p>
        </div>

        {favoriteTaskers.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No favorites yet</h3>
            <p className="text-gray-600 mb-6">Start adding taskers to your favorites</p>
            <Link
              to="/services"
              className="inline-block px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              Browse Taskers
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteTaskers.map((tasker) => (
              <div key={tasker._id || tasker.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex gap-4">
                    <img
                      src={tasker.photo || tasker.photoUrl || '/default-avatar.png'}
                      alt={tasker.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{tasker.name}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{tasker.rating}</span>
                        <span className="text-sm text-gray-500">({tasker.reviewCount || tasker.reviews || 0})</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFavorite(tasker._id || tasker.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Heart className="w-5 h-5 fill-current" />
                  </button>
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{tasker.bio}</p>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <MapPin className="w-4 h-4" />
                  <span>{tasker.location}</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {(tasker.skills || tasker.services || []).slice(0, 3).map((skill, idx) => (
                    <span key={idx} className="px-2 py-1 bg-teal-50 text-teal-700 text-xs rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/tasker/${tasker._id || tasker.id}`}
                    className="flex-1 px-4 py-2 bg-teal-600 text-white text-center rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
                  >
                    View Profile
                  </Link>
                  <Link
                    to={`/messages?userId=${tasker._id || tasker.id}`}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;

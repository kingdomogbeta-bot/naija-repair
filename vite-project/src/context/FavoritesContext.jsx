import { createContext, useContext, useState, useEffect } from 'react';
import { getFavorites as apiFetchFavorites, addFavorite as apiAddFavorite, removeFavorite as apiRemoveFavorite } from '../services/api';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const { getToken, user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const token = getToken();
      const response = await apiFetchFavorites(token);
      if (response.success) {
        setFavorites(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    }
  };

  const addFavorite = async (taskerId) => {
    try {
      const token = getToken();
      await apiAddFavorite(token, taskerId);
      setFavorites(prev => [...prev, taskerId]);
    } catch (error) {
      console.error('Failed to add favorite:', error);
    }
  };

  const removeFavorite = async (taskerId) => {
    try {
      const token = getToken();
      await apiRemoveFavorite(token, taskerId);
      setFavorites(prev => prev.filter(id => id !== taskerId));
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  const toggleFavorite = async (taskerId) => {
    if (favorites.includes(taskerId)) {
      await removeFavorite(taskerId);
    } else {
      await addFavorite(taskerId);
    }
  };

  const isFavorite = (taskerId) => {
    return favorites.includes(taskerId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

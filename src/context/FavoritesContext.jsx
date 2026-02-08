import { createContext, useContext, useState, useEffect } from 'react';

const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = (taskerId) => {
    if (!favorites.includes(taskerId)) {
      setFavorites(prev => [...prev, taskerId]);
    }
  };

  const removeFavorite = (taskerId) => {
    setFavorites(prev => prev.filter(id => id !== taskerId));
  };

  const toggleFavorite = (taskerId) => {
    if (favorites.includes(taskerId)) {
      removeFavorite(taskerId);
    } else {
      addFavorite(taskerId);
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

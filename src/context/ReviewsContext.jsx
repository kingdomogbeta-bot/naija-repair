import { createContext, useContext, useState, useEffect } from 'react';

const ReviewsContext = createContext();

export const useReviews = () => useContext(ReviewsContext);

export const ReviewsProvider = ({ children }) => {
  const [reviews, setReviews] = useState(() => {
    const saved = localStorage.getItem('reviews');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('reviews', JSON.stringify(reviews));
  }, [reviews]);

  const addReview = (review) => {
    const newReview = {
      id: Date.now().toString(),
      ...review,
      createdAt: new Date().toISOString()
    };
    setReviews(prev => [newReview, ...prev]);
    return newReview;
  };

  const getTaskerReviews = (taskerId) => {
    return reviews.filter(r => r.taskerId === taskerId);
  };

  const getUserReviews = (userId) => {
    return reviews.filter(r => r.userId === userId);
  };

  const getBookingReview = (bookingId) => {
    return reviews.find(r => r.bookingId === bookingId);
  };

  return (
    <ReviewsContext.Provider value={{ reviews, addReview, getTaskerReviews, getUserReviews, getBookingReview }}>
      {children}
    </ReviewsContext.Provider>
  );
};

import { createContext, useContext, useState, useEffect } from 'react';
import { getUserReviews as apiGetUserReviews, createReview as apiCreateReview, getBookingReview as apiGetBookingReview, deleteReview as apiDeleteReview } from '../services/api';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

const ReviewsContext = createContext();

export const useReviews = () => useContext(ReviewsContext);

export const ReviewsProvider = ({ children }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const { getToken, user } = useAuth();
  const { socket } = useSocket();

  const fetchReviews = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = getToken();
      const response = await apiGetUserReviews(token);
      if (response.success) {
        setReviews(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    socket.on('new_review', () => {
      fetchReviews();
    });

    return () => {
      socket.off('new_review');
    };
  }, [socket]);

  const addReview = async (reviewData) => {
    try {
      const token = getToken();
      const response = await apiCreateReview(token, reviewData);
      if (response.success) {
        setReviews(prev => [response.data, ...prev]);
        return response.data;
      }
    } catch (error) {
      console.error('Failed to create review:', error);
      throw error;
    }
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

  const deleteReview = async (reviewId) => {
    try {
      const token = getToken();
      const response = await apiDeleteReview(token, reviewId);
      if (response.success) {
        setReviews(prev => prev.filter(r => r._id !== reviewId));
      }
    } catch (error) {
      console.error('Failed to delete review:', error);
      throw error;
    }
  };

  return (
    <ReviewsContext.Provider value={{ 
      reviews, 
      loading,
      addReview, 
      getTaskerReviews, 
      getUserReviews, 
      getBookingReview,
      deleteReview,
      refreshReviews: fetchReviews
    }}>
      {children}
    </ReviewsContext.Provider>
  );
};

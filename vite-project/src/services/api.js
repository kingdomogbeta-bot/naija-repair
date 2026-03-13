// Main API URL for production
const API_URL = 'https://naija-repair-api.onrender.com/api';
// Email service URL
const EMAIL_API_URL = 'https://naija-repair-api2.onrender.com';

// Debug function to test API connection
const testAPIConnection = async () => {
  try {
    const response = await fetch(`${API_URL.replace('/api', '')}/api/health`);
    console.log('API Health Check:', response.status, await response.json());
  } catch (error) {
    console.error('API Connection Failed:', error);
  }
};

// Test connection on load
testAPIConnection();

export const sendOTP = async (email) => {
  console.log('Attempting to send OTP to:', email);
  console.log('Email API URL:', `${EMAIL_API_URL}/api/email/send-otp`);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
    const response = await fetch(`${EMAIL_API_URL}/api/email/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    const data = await response.json();
    console.log('Response data:', data);
    
    if (!response.ok) throw new Error(data.message || 'Failed to send OTP');
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Request timed out after 30 seconds');
      throw new Error('Request timed out. Please try again.');
    }
    console.error('sendOTP error:', error);
    throw error;
  }
};

export const verifyOTP = async (email, otp) => {
  const response = await fetch(`${EMAIL_API_URL}/api/email/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Invalid OTP');
  return data;
};

export const registerUser = async (userData) => {
  const response = await fetch(`${API_URL}/users/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Registration failed');
  return data;
};

export const registerTasker = async (taskerData) => {
  const response = await fetch(`${API_URL}/taskers/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskerData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Registration failed');
  return data;
};

export const loginUser = async (credentials) => {
  const response = await fetch(`${API_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Login failed');
  return data;
};

export const loginTasker = async (credentials) => {
  const response = await fetch(`${API_URL}/taskers/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Login failed');
  return data;
};

export const getProfile = async (token) => {
  const response = await fetch(`${API_URL}/users/profile`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch profile');
  return data;
};

export const updateProfile = async (token, userData) => {
  const response = await fetch(`${API_URL}/users/profile`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update profile');
  return data;
};

export const updateTaskerProfile = async (token, taskerData) => {
  const response = await fetch(`${API_URL}/taskers/profile`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(taskerData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update profile');
  return data;
};

export const initializePayment = async (token, paymentData) => {
  const response = await fetch(`${API_URL}/payment/initialize`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(paymentData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Payment initialization failed');
  return data;
};

export const verifyPayment = async (reference) => {
  const response = await fetch(`${API_URL}/payment/verify/${reference}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Payment verification failed');
  return data;
};

export const getPaymentByBooking = async (token, bookingId) => {
  const response = await fetch(`${API_URL}/payment/booking/${bookingId}`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch payment');
  return data;
};

export const createBooking = async (token, bookingData) => {
  const response = await fetch(`${API_URL}/bookings/create`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bookingData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to create booking');
  return data;
};

export const getUserBookings = async (token) => {
  const response = await fetch(`${API_URL}/bookings/user`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch bookings');
  return data;
};

export const getTaskerBookings = async (token) => {
  const response = await fetch(`${API_URL}/bookings/tasker`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch tasker bookings');
  return data;
};

export const acceptBooking = async (token, bookingId) => {
  const response = await fetch(`${API_URL}/bookings/${bookingId}/accept`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to accept booking');
  return data;
};

export const declineBooking = async (token, bookingId, reason) => {
  const response = await fetch(`${API_URL}/bookings/${bookingId}/decline`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ reason })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to decline booking');
  return data;
};

export const startBooking = async (token, bookingId) => {
  const response = await fetch(`${API_URL}/bookings/${bookingId}/start`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to start booking');
  return data;
};

export const completeBooking = async (token, bookingId) => {
  const response = await fetch(`${API_URL}/bookings/${bookingId}/complete`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to complete booking');
  return data;
};

export const cancelBooking = async (token, bookingId, reason) => {
  const response = await fetch(`${API_URL}/bookings/${bookingId}/cancel`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ reason })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to cancel booking');
  return data;
};

export const deleteBooking = async (token, bookingId) => {
  const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to delete booking');
  return data;
};

export const updateBookingPaymentStatus = async (bookingId, paymentStatus) => {
  const response = await fetch(`${API_URL}/bookings/${bookingId}/payment-status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentStatus })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update payment status');
  return data;
};

export const createReview = async (token, reviewData) => {
  const response = await fetch(`${API_URL}/reviews/create`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(reviewData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to create review');
  return data;
};

export const getTaskerReviews = async (taskerId) => {
  const response = await fetch(`${API_URL}/reviews/tasker/${taskerId}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch reviews');
  return data;
};

export const getUserReviews = async (token) => {
  const response = await fetch(`${API_URL}/reviews/user`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch reviews');
  return data;
};

export const getBookingReview = async (bookingId) => {
  const response = await fetch(`${API_URL}/reviews/booking/${bookingId}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch review');
  return data;
};

export const deleteReview = async (token, reviewId) => {
  const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to delete review');
  return data;
};

export const createNotification = async (notificationData) => {
  const response = await fetch(`${API_URL}/notifications/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(notificationData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to create notification');
  return data;
};

export const getUserNotifications = async (token) => {
  const response = await fetch(`${API_URL}/notifications/user`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch notifications');
  return data;
};

export const markNotificationAsRead = async (token, notificationId) => {
  const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to mark as read');
  return data;
};

export const markAllNotificationsAsRead = async (token) => {
  const response = await fetch(`${API_URL}/notifications/read-all`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to mark all as read');
  return data;
};

export const deleteNotification = async (token, notificationId) => {
  const response = await fetch(`${API_URL}/notifications/${notificationId}`, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to delete notification');
  return data;
};

export const getUnreadNotificationCount = async (token) => {
  const response = await fetch(`${API_URL}/notifications/unread-count`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch count');
  return data;
};

export const sendMessage = async (token, messageData) => {
  const response = await fetch(`${API_URL}/messages/send`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(messageData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to send message');
  return data;
};

export const getConversation = async (token, userId) => {
  const response = await fetch(`${API_URL}/messages/conversation/${userId}`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch conversation');
  return data;
};

export const getAllConversations = async (token) => {
  const response = await fetch(`${API_URL}/messages/conversations`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch conversations');
  return data;
};

export const markMessagesAsRead = async (token, userId) => {
  const response = await fetch(`${API_URL}/messages/read/${userId}`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to mark as read');
  return data;
};

export const deleteMessage = async (token, messageId) => {
  const response = await fetch(`${API_URL}/messages/${messageId}`, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to delete message');
  return data;
};

export const getUnreadMessageCount = async (token) => {
  const response = await fetch(`${API_URL}/messages/unread-count`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch count');
  return data;
};

export const getSetting = async (key) => {
  const response = await fetch(`${API_URL}/settings/${key}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch setting');
  return data;
};

export const updateSetting = async (token, key, value) => {
  const response = await fetch(`${API_URL}/settings/update`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ key, value })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update setting');
  return data;
};

export const getAllSettings = async () => {
  const response = await fetch(`${API_URL}/settings/all`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch settings');
  return data;
};

export const suspendTasker = async (token, taskerId, reason) => {
  const response = await fetch(`${API_URL}/taskers/suspend/${taskerId}`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ reason })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to suspend tasker');
  return data;
};

export const unsuspendTasker = async (token, taskerId) => {
  const response = await fetch(`${API_URL}/taskers/unsuspend/${taskerId}`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to unsuspend tasker');
  return data;
};

export const deleteTaskerPhoto = async (token) => {
  const response = await fetch(`${API_URL}/taskers/delete-photo`, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to delete photo');
  return data;
};

export const uploadTaskerPhoto = async (token, file) => {
  const formData = new FormData();
  formData.append('photo', file);
  
  const response = await fetch(`${API_URL}/taskers/upload-photo`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to upload photo');
  return data;
};

export const deleteUserPhoto = async (token) => {
  const response = await fetch(`${API_URL}/users/delete-photo`, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to delete photo');
  return data;
};

export const uploadUserPhoto = async (token, file) => {
  const formData = new FormData();
  formData.append('photo', file);
  
  const response = await fetch(`${API_URL}/users/upload-photo`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to upload photo');
  return data;
};

export const submitSuspensionAppeal = async (appealData) => {
  const formData = new FormData();
  formData.append('taskerEmail', appealData.taskerEmail);
  formData.append('idType', appealData.idType);
  formData.append('idNumber', appealData.idNumber);
  formData.append('idImage', appealData.idImage);
  formData.append('selfieImage', appealData.selfieImage);
  
  const response = await fetch(`${API_URL}/taskers/submit-appeal`, {
    method: 'POST',
    body: formData
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to submit appeal');
  return data;
};

export const deleteTaskerAccount = async (token) => {
  const response = await fetch(`${API_URL}/taskers/account`, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to delete account');
  return data;
};

export const deleteUserAccount = async (token) => {
  const response = await fetch(`${API_URL}/users/account`, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to delete account');
  return data;
};

export const changePassword = async (token, currentPassword, newPassword) => {
  const response = await fetch(`${API_URL}/users/change-password`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ currentPassword, newPassword })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to change password');
  return data;
};

export const changeTaskerPassword = async (token, currentPassword, newPassword) => {
  const response = await fetch(`${API_URL}/taskers/change-password`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ currentPassword, newPassword })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to change password');
  return data;
};

export const getFavorites = async (token) => {
  const response = await fetch(`${API_URL}/favorites`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch favorites');
  return data;
};

export const addFavorite = async (token, taskerId) => {
  const response = await fetch(`${API_URL}/favorites`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ taskerId })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to add favorite');
  return data;
};

export const removeFavorite = async (token, taskerId) => {
  const response = await fetch(`${API_URL}/favorites/${taskerId}`, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to remove favorite');
  return data;
};

export const getUserPreferences = async (token) => {
  const response = await fetch(`${API_URL}/users/preferences`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch preferences');
  return data;
};

export const updateUserPreferences = async (token, preferences) => {
  const response = await fetch(`${API_URL}/users/preferences`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(preferences)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update preferences');
  return data;
};

export const getWallet = async (token, taskerEmail) => {
  const response = await fetch(`${API_URL}/wallet/${taskerEmail}`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch wallet');
  return data;
};

export const getTransactions = async (token, taskerEmail) => {
  const response = await fetch(`${API_URL}/wallet/${taskerEmail}/transactions`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch transactions');
  return data;
};

export const requestWithdrawal = async (token, withdrawalData) => {
  const response = await fetch(`${API_URL}/wallet/withdraw`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(withdrawalData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to request withdrawal');
  return data;
};

export const getWithdrawals = async (token, taskerEmail) => {
  const response = await fetch(`${API_URL}/wallet/${taskerEmail}/withdrawals`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to fetch withdrawals');
  return data;
};

export const getAllServices = async () => {
  const response = await fetch(`${API_URL}/services`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch services');
  return data;
};

export const createService = async (token, serviceData) => {
  const response = await fetch(`${API_URL}/services`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(serviceData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to create service');
  return data;
};

export const updateService = async (token, serviceId, serviceData) => {
  const response = await fetch(`${API_URL}/services/${serviceId}`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(serviceData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update service');
  return data;
};

export const deleteService = async (token, serviceId) => {
  const response = await fetch(`${API_URL}/services/${serviceId}`, {
    method: 'DELETE',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to delete service');
  return data;
};

export const createSafetyReport = async (token, reportData) => {
  const response = await fetch(`${API_URL}/safety/report`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(reportData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to create report');
  return data;
};

export const getAllSafetyReports = async (token) => {
  const response = await fetch(`${API_URL}/safety/reports`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch reports');
  return data;
};

export const updateSafetyReport = async (token, reportId, updates) => {
  const response = await fetch(`${API_URL}/safety/report/${reportId}`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update report');
  return data;
};

export const startTracking = async (token, trackingData) => {
  const response = await fetch(`${API_URL}/safety/tracking`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(trackingData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to start tracking');
  return data;
};

export const getTracking = async (token, bookingId) => {
  const response = await fetch(`${API_URL}/safety/tracking/${bookingId}`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch tracking');
  return data;
};

export const endTracking = async (token, bookingId) => {
  const response = await fetch(`${API_URL}/safety/tracking/${bookingId}/end`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to end tracking');
  return data;
};

export const submitAppeal = async (appealData) => {
  const response = await fetch(`${API_URL}/appeals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(appealData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to submit appeal');
  return data;
};

export const getAllAppeals = async (token) => {
  const response = await fetch(`${API_URL}/appeals`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch appeals');
  return data;
};

export const updateAppeal = async (token, appealId, updates) => {
  const response = await fetch(`${API_URL}/appeals/${appealId}`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update appeal');
  return data;
};

export const createReport = async (token, reportData) => {
  const response = await fetch(`${API_URL}/reports`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(reportData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to create report');
  return data;
};

export const getAllReports = async (token) => {
  const response = await fetch(`${API_URL}/reports`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch reports');
  return data;
};

export const updateReport = async (token, reportId, updates) => {
  const response = await fetch(`${API_URL}/reports/${reportId}`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update report');
  return data;
};

// Support API functions
export const createSupportTicket = async (token, ticketData) => {
  const response = await fetch(`${API_URL}/support/ticket`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(ticketData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to create support ticket');
  return data;
};

export const getUserSupportTickets = async (token) => {
  const response = await fetch(`${API_URL}/support/tickets`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch support tickets');
  return data;
};

export const getSupportTicket = async (token, ticketId) => {
  const response = await fetch(`${API_URL}/support/ticket/${ticketId}`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch support ticket');
  return data;
};

export const addMessageToSupportTicket = async (token, ticketId, message) => {
  const response = await fetch(`${API_URL}/support/ticket/${ticketId}/message`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to add message');
  return data;
};

// Admin support functions
export const getAllSupportTickets = async (token, filters = {}) => {
  const queryParams = new URLSearchParams(filters).toString();
  const response = await fetch(`${API_URL}/support/admin/tickets?${queryParams}`, {
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch support tickets');
  return data;
};

export const updateSupportTicketStatus = async (token, ticketId, updates) => {
  const response = await fetch(`${API_URL}/support/admin/ticket/${ticketId}/status`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update ticket status');
  return data;
};

export const adminReplyToSupportTicket = async (token, ticketId, message) => {
  const response = await fetch(`${API_URL}/support/admin/ticket/${ticketId}/reply`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ message })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to reply to ticket');
  return data;
};

export const updateBookingStatus = async (token, bookingId, status) => {
  const response = await fetch(`${API_URL}/bookings/${bookingId}/status`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update status');
  return data;
};

export const sendEmergencyAlert = async (token, alertData) => {
  const response = await fetch(`${API_URL}/safety/emergency`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(alertData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to send alert');
  return data;
};

export const submitTaskerVerification = async (token, nin, ninPhoto, passportPhoto) => {
  const formData = new FormData();
  formData.append('nin', nin);
  formData.append('ninPhoto', ninPhoto);
  formData.append('passportPhoto', passportPhoto);
  
  const response = await fetch(`${API_URL}/taskers/submit-verification`, {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to submit verification');
  return data;
};

export const approveTaskerVerification = async (token, taskerId) => {
  const response = await fetch(`${API_URL}/taskers/verify/approve/${taskerId}`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to approve verification');
  return data;
};

export const rejectTaskerVerification = async (token, taskerId, reason) => {
  const response = await fetch(`${API_URL}/taskers/verify/reject/${taskerId}`, {
    method: 'PUT',
    headers: { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ reason })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to reject verification');
  return data;
};

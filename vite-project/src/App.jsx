import './App.css';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import HowItWorks from './components/HowItWorks';
import ServicesSection from './components/ServicesSection';
import Testimonials from './components/Testimonials';
import CTABanner from './components/CTABanner';
import FAQSection from './components/FAQSection';
import BecomeTaskerSection from './components/BecomeTaskerSection';
import TrustSafetySection from './components/TrustSafetySection';
import Footer from './components/Footer';
import SupportChatWidget from './components/SupportChatWidget';
import ServicesPage from './components/ServicesPage';
import FindTaskersPage from './components/FindTaskersPage';
import BecomeTaskerPage from './components/BecomeTaskerPage';
import SignUpPage from './components/SignUpPage';
import LoginPage from './components/LoginPage';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { BookingsProvider } from './context/BookingsContext';
import { TaskersProvider } from './context/TaskersContext';
import { UsersProvider } from './context/UsersContext';
import { MessagesProvider } from './context/MessagesContext';
import { ReviewsProvider } from './context/ReviewsContext';
import { NotificationsProvider } from './context/NotificationsContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { SettingsProvider } from './context/SettingsContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AccountSettings from './components/AccountSettings';
import TaskerAccountSettings from './components/TaskerAccountSettings';
import MyBookings from './components/MyBookings';
import TaskerDashboard from './components/TaskerDashboard';
import TaskerProfile from './components/TaskerProfile';
import MessagesPage from './components/MessagesPage';
import BookingFlow from './components/BookingFlow';
import FavoritesPage from './components/FavoritesPage';
import PaymentPage from './components/PaymentPage';
import PaymentVerification from './components/PaymentVerification';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import DryCleaningBooking from './components/DryCleaningBooking';
import TaskerWallet from './components/TaskerWallet';
import MaintenancePage from './components/MaintenancePage';
import { useEffect, useState } from 'react';
import { useAuth } from './context/AuthContext';



function AppContent() {
  const location = useLocation();
  const { user } = useAuth();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isAdmin = user?.role === 'admin';
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [checkingMaintenance, setCheckingMaintenance] = useState(true);

  useEffect(() => {
    checkMaintenanceMode();
  }, []);

  const checkMaintenanceMode = async () => {
    try {
      const response = await fetch('https://naija-repair-api.onrender.com/api/settings/maintenanceMode');
      const data = await response.json();
      if (data.success && data.value === true) {
        setMaintenanceMode(true);
      }
    } catch (error) {
      console.error('Failed to check maintenance mode:', error);
    } finally {
      setCheckingMaintenance(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);



  const publicRoutes = ['/login', '/signup', '/'];
  const isPublicRoute = publicRoutes.includes(location.pathname) || location.pathname.startsWith('/payment');

  if (maintenanceMode && !isAdmin && !isPublicRoute) {
    return <MaintenancePage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {!isAdminRoute && <Header />}
      <Routes>
        <Route
          path="/"
          element={
            <>
              <HeroSection />
              <HowItWorks />
              <ServicesSection />
              <Testimonials />
              <CTABanner />
              <FAQSection />
              <BecomeTaskerSection />
              <TrustSafetySection />
            </>
          }
        />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/dry-cleaning-booking" element={<DryCleaningBooking />} />
        <Route path="/user-home" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
        <Route path="/find-taskers" element={<FindTaskersPage />} />
        <Route path="/become-tasker" element={<BecomeTaskerPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
        <Route path="/book/:taskerId" element={<ProtectedRoute><BookingFlow /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
        <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
        <Route path="/payment" element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
        <Route path="/payment/verify" element={<PaymentVerification />} />
        <Route path="/tasker/:id" element={<TaskerProfile />} />
        <Route path="/tasker-dashboard" element={<ProtectedRoute><TaskerDashboard /></ProtectedRoute>} />
        <Route path="/tasker-wallet" element={<ProtectedRoute><TaskerWallet /></ProtectedRoute>} />
        <Route path="/account-settings" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
        <Route path="/tasker-settings" element={<ProtectedRoute><TaskerAccountSettings /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      </Routes>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <SupportChatWidget />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <ToastProvider>
        <SettingsProvider>
          <AuthProvider>
            <SocketProvider>
              <BookingsProvider>
                <TaskersProvider>
                  <UsersProvider>
                    <MessagesProvider>
                      <ReviewsProvider>
                        <NotificationsProvider>
                          <FavoritesProvider>
                            <AppContent />
                          </FavoritesProvider>
                        </NotificationsProvider>
                      </ReviewsProvider>
                    </MessagesProvider>
                  </UsersProvider>
                </TaskersProvider>
              </BookingsProvider>
            </SocketProvider>
          </AuthProvider>
        </SettingsProvider>
      </ToastProvider>
    </Router>
  );
}

export default App

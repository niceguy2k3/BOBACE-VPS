import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer, Flip, Bounce, Slide, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/toast-custom.css';
import './styles/notifications.css';
import injectFirebaseConfigToServiceWorker from './utils/firebase-config-injector';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { AdminProvider } from './contexts/AdminContext';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Matches from './pages/Matches';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import UserProfile from './pages/UserProfile';
import Settings from './pages/Settings';
import Admirers from './pages/Admirers';
import NotificationsPage from './pages/NotificationsPage';
import Blindate from './pages/Blindate';
import ReportUser from './pages/ReportUser';
import NotFound from './pages/NotFound';

// New Pages
import About from './pages/About';
import Features from './pages/Features';
import Contact from './pages/Contact';
import Legal from './pages/Legal';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import CookiePolicy from './pages/CookiePolicy';
import EmailVerification from './pages/EmailVerification';
import PendingVerification from './pages/PendingVerification';
import ResendVerification from './pages/ResendVerification';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminUserDetail from './pages/admin/UserDetail';
import AdminBlindates from './pages/admin/Blindates';
import AdminMatches from './pages/admin/Matches';
import AdminReports from './pages/admin/Reports';
import AdminSafety from './pages/admin/Safety';
import AdminNotifications from './pages/admin/Notifications';
import AdminSystemNotifications from './pages/admin/SystemNotifications';
import AdminStatistics from './pages/admin/Statistics';
import AdminSettings from './pages/admin/Settings';
import UnderConstruction from './pages/admin/UnderConstruction';

// Components
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import AdminRoute from './components/AdminRoute';
import Navbar from './components/Navbar';
import NotificationPermission from './components/NotificationPermission';
import LocationPermission from './components/LocationPermission';
import PushNotificationManager from './components/PushNotificationManager';

function App() {
  // Preload notification sound và inject Firebase config khi ứng dụng khởi động
  React.useEffect(() => {
    if ('Audio' in window) {
      try {
        window.notificationSound = new Audio('/notification.mp3');
        window.notificationSound.load();
      } catch (error) {
        console.error('Error preloading notification sound:', error);
      }
    }
    
    // Inject Firebase config vào Service Worker
    if ('serviceWorker' in navigator) {
      try {
        injectFirebaseConfigToServiceWorker();
      } catch (error) {
        console.error('Error injecting Firebase config to Service Worker:', error);
      }
    }
    
    // Tối ưu hóa performance bằng cách tắt React.StrictMode trong production
    if (process.env.NODE_ENV === 'production') {
      console.log = () => {};
      console.info = () => {};
    }
  }, []);
  
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <AdminProvider>
            <div className="min-h-screen h-screen bg-gray-100 flex flex-col">
              <ToastContainer 
                position="top-center" 
                autoClose={3000} 
                hideProgressBar={false}
                newestOnTop={true}
                closeOnClick={true}
                rtl={false}
                pauseOnFocusLoss={false}
                draggable={true}
                transition={Flip}
                className="toast-container-custom"
                toastClassName="toast-custom"
                bodyClassName="toast-body-custom"
                progressClassName="toast-progress-custom"
                pauseOnHover={false}
                limit={3}
                theme="colored"
                icon={true}
                closeButton={true}
                style={{ marginTop: '70px', zIndex: 9999 }}
                enableMultiContainer={false}
                containerId="main-toast-container"
              />
              <Navbar />
              <NotificationPermission />
              <LocationPermission />
              <PushNotificationManager />
              <main className="w-full h-full flex-grow">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                <Route path="/pending-verification" element={<PublicRoute><PendingVerification /></PublicRoute>} />
                <Route path="/verify-email/:token" element={<PublicRoute><EmailVerification /></PublicRoute>} />
                <Route path="/resend-verification" element={<PublicRoute><ResendVerification /></PublicRoute>} />

                {/* New Public Pages */}
                <Route path="/about" element={<PublicRoute><About /></PublicRoute>} />
                <Route path="/features" element={<PublicRoute><Features /></PublicRoute>} />
                <Route path="/contact" element={<PublicRoute><Contact /></PublicRoute>} />
                <Route path="/legal" element={<PublicRoute><Legal /></PublicRoute>} />
                <Route path="/terms-of-service" element={<PublicRoute><TermsOfService /></PublicRoute>} />
                <Route path="/privacy-policy" element={<PublicRoute><PrivacyPolicy /></PublicRoute>} />
                <Route path="/cookie-policy" element={<PublicRoute><CookiePolicy /></PublicRoute>} />
                
                {/* Private Routes */}
                <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
                <Route path="/explore" element={<PrivateRoute><Explore /></PrivateRoute>} />
                <Route path="/matches" element={<PrivateRoute><Matches /></PrivateRoute>} />
                <Route path="/chat/:matchId" element={<PrivateRoute><Chat /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
                <Route path="/profile/:userId" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
                <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
                <Route path="/admirers" element={<PrivateRoute><Admirers /></PrivateRoute>} />
                <Route path="/blindate" element={<PrivateRoute><Blindate /></PrivateRoute>} />
                <Route path="/blindates/:blindateId" element={<PrivateRoute><Blindate /></PrivateRoute>} />
                <Route path="/notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />
                <Route path="/report/user/:userId" element={<PrivateRoute><ReportUser /></PrivateRoute>} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
                <Route path="/admin/users/:id" element={<AdminRoute><AdminUserDetail /></AdminRoute>} />
                <Route path="/admin/blindates" element={<AdminRoute><AdminBlindates /></AdminRoute>} />
                <Route path="/admin/matches" element={<AdminRoute><AdminMatches /></AdminRoute>} />
                <Route path="/admin/messages" element={<AdminRoute><UnderConstruction /></AdminRoute>} />
                <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />
                <Route path="/admin/safety" element={<AdminRoute><AdminSafety /></AdminRoute>} />
                <Route path="/admin/notifications" element={<AdminRoute><AdminNotifications /></AdminRoute>} />
                <Route path="/admin/system-notifications" element={<AdminRoute><AdminSystemNotifications /></AdminRoute>} />
                <Route path="/admin/statistics" element={<AdminRoute><AdminStatistics /></AdminRoute>} />
                <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
                
                {/* Fallback Routes */}
                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </main>
          </div>
          </AdminProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
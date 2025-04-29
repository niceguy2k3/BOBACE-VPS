import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loader from './Loader';

const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <Loader />;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  // Kiểm tra xem email đã được xác thực chưa
  if (currentUser && currentUser.emailVerified === false) {
    // Lưu email để sử dụng trong trang xác thực
    localStorage.setItem('pendingVerificationEmail', currentUser.email);
    return <Navigate to="/pending-verification" />;
  }
  
  return children;
};

export default PrivateRoute;
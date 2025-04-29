import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loader from './Loader';

const PublicRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <Loader />;
  }
  
  if (currentUser) {
    return <Navigate to="/home" />;
  }
  
  return children;
};

export default PublicRoute;
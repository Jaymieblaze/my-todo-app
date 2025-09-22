import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  // Don't render anything while loading authentication status
  if (loading) {
    return null; 
  }

  if (!user) {
    // If user is not logged in, redirect them to the login page
    return <Navigate to="/login" replace />;
  }

  // If user is logged in, render the children components (the protected page)
  return children;
};

export default ProtectedRoute;
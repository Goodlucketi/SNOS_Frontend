import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, isClient, appRole, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // super_admin lives in snoc_users, not clients — isClient will be false for them,
  // but appRole will correctly resolve, so they should NOT be sent to /register.
  if (!isClient && appRole !== 'super_admin') {
    // Logged in but no client row and not platform staff — needs onboarding
    return <Navigate to="/register" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;

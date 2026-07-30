import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Sends the user to the correct landing view inside /dashboard
 * based on their resolved role. Used for the index route and
 * any unmatched sub-path so nobody lands on a blank page.
 */
const RoleDashboardRedirect: React.FC = () => {
  const { isSuperAdmin, isOrgAdmin } = useAuth();

  if (isSuperAdmin) return <Navigate to="platform" replace />;
  if (isOrgAdmin) return <Navigate to="org-overview" replace />;
  return <Navigate to="userdash" replace />;
};

export default RoleDashboardRedirect;

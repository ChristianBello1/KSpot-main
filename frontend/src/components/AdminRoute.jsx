// components/AdminRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Assicurati di avere questo context

const AdminRoute = () => {
  const { user } = useAuth();
  
  if (!user || user.ruolo !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
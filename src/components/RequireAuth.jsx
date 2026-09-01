import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import api from '../api';
import { ADMIN_ROUTE_BASE } from '../pages/admin/AdminLayout';

export default function RequireAuth({ children }) {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await api.get('/auth/me');
        if (res.data && res.data.user) {
          setAuth(res.data.user);
        } else {
          setAuth(null);
        }
      } catch (err) {
        setAuth(null);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0e14] text-[#4fd1c5] font-mono text-sm flex items-center justify-center">
        VERIFYING_SECURE_ADMIN_SESSION...
      </div>
    );
  }

  if (!auth) {
    return <Navigate to={`${ADMIN_ROUTE_BASE}/login`} state={{ from: location }} replace />;
  }

  return children;
}

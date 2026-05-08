import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import AdminDashboard from './pages/AdminDashboard';
import MovementRequest from './pages/MovementRequest';
import Login from './pages/Login';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500">Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/request" element={<MovementRequest />} />
        <Route 
          path="/login" 
          element={session ? <Navigate to="/admin" replace /> : <Login />} 
        />
        
        {/* Protected Routes */}
        <Route 
          path="/admin" 
          element={session ? <AdminDashboard /> : <Navigate to="/login" replace />} 
        />
        
        {/* Default redirect */}
        <Route path="/" element={<Navigate to={session ? "/admin" : "/login"} replace />} />
        <Route path="*" element={<Navigate to={session ? "/admin" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

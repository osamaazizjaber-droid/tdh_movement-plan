import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate('/admin');
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8" 
         style={{ background: 'linear-gradient(135deg, #fff7f0 0%, #fff 60%, #fff3e8 100%)' }}
         dir="ltr">
      
      {/* Top orange bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: '#F47920' }} />

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo area */}
        <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
             style={{ backgroundColor: '#F47920' }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
        </div>
        <h2 className="mt-5 text-center text-3xl font-extrabold text-gray-900">
          Admin Dispatcher
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500">
          Terre des hommes — Movement Management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl shadow-orange-100/50 sm:rounded-2xl sm:px-10 border border-orange-100">
          <form className="space-y-5" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm transition-all"
                style={{ '--tw-ring-color': '#F47920' }}
                onFocus={e => e.target.style.borderColor = '#F47920'}
                onBlur={e => e.target.style.borderColor = '#d1d5db'}
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm transition-all"
                onFocus={e => e.target.style.borderColor = '#F47920'}
                onBlur={e => e.target.style.borderColor = '#d1d5db'}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white transition-all disabled:opacity-50 mt-2"
              style={{ backgroundColor: '#F47920' }}
              onMouseEnter={e => e.target.style.backgroundColor = '#d4611a'}
              onMouseLeave={e => e.target.style.backgroundColor = '#F47920'}
            >
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>
          
          <div className="mt-6 border-t border-gray-100 pt-5">
            <a href="/request" className="w-full flex justify-center py-2.5 px-4 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 bg-white hover:bg-gray-50 transition-colors">
              ← Return to Public Request Form
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

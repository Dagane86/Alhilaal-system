import React, { useState } from 'react';
import axios from 'axios';
import { User, Lock, Eye, EyeOff, LogIn, Loader2, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('https://al-hilaal-vercel-server.vercel.app/api/auth/login', { username, password });
      
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Username ama Password waa khalad!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[420px] bg-white rounded-[3rem] p-10 shadow-2xl shadow-blue-900/20">
        
        {/* Logo & Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-blue-200 animate-bounce-short">
            <Lock size={38} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Al-Hilaal</h1>
          <p className="text-slate-400 font-bold mt-2">Maamulka Dugsiga</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 font-bold text-sm animate-shake">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5" dir="rtl">
          <div className="relative group">
            <User className="absolute right-5 top-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={22} />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              required
              className="w-full pr-14 pl-6 py-5 bg-slate-50 rounded-2xl border-none ring-2 ring-slate-100 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700 placeholder:text-slate-300"
            />
          </div>

          <div className="relative group">
            <Lock className="absolute right-5 top-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={22} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password-ka"
              required
              className="w-full pr-14 pl-6 py-5 bg-slate-50 rounded-2xl border-none ring-2 ring-slate-100 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-slate-700 placeholder:text-slate-300"
            />
            <button
              type="button"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-xl shadow-lg shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:bg-blue-400"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                <LogIn size={24} />
                <span>Soo Gal</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center mt-8 text-slate-400 text-sm font-bold">
          &copy; 2026 Al-Hilaal School System
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { login, clearError } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [isAuthenticated, error, navigate, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) {
      toast.success('Welcome back! 🎉');
      navigate('/dashboard');
    }
  };

  return (
    <div className="animated-bg min-h-screen flex items-center justify-center p-3">
      <div className="relative z-10 w-full max-w-xs sm:max-w-sm">
        {/* Logo */}
        <div className="text-center mb-4">
          <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            MissionDesk
          </div>
          <p className="text-gray-400 text-[10px] tracking-wider mt-0.5">Plan. Manage. Achieve.</p>
        </div>

        {/* Login Card */}
        <div className="glass-card rounded-xl p-5 shadow-2xl">
          <div className="text-center mb-4">
            <h2 className="text-lg font-bold text-white">Welcome back!</h2>
            <p className="text-gray-400 text-[10px] mt-0.5">Login to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Email */}
            <div>
              <label className="block text-[10px] font-medium text-gray-300 mb-0.5">Email</label>
              <div className="relative">
                <EnvelopeIcon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input-glass-with-icon text-xs py-1.5 pl-7"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] font-medium text-gray-300 mb-0.5">Password</label>
              <div className="relative">
                <LockClosedIcon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-glass-with-icon text-xs py-1.5 pl-7 pr-7"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeSlashIcon className="w-3.5 h-3.5" /> : <EyeIcon className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={isLoading} className="btn-primary text-xs py-2">
              {isLoading ? 'Loading...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-[10px] text-gray-400 mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:text-secondary font-medium">
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
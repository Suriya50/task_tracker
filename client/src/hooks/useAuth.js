import { useSelector, useDispatch } from 'react-redux';
import { login, register, logout, clearError } from '../redux/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const handleLogin = async (email, password) => {
    const result = await dispatch(login({ email, password }));
    if (login.fulfilled.match(result)) {
      return { success: true, data: result.payload };
    }
    return { success: false, error: result.payload };
  };

  const handleRegister = async (userData) => {
    const result = await dispatch(register(userData));
    if (register.fulfilled.match(result)) {
      return { success: true, data: result.payload };
    }
    return { success: false, error: result.payload };
  };

  const handleLogout = async () => {
    await dispatch(logout());
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    clearError: clearAuthError,
  };
};
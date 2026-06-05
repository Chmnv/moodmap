import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const { token, user, logout: storeLogout } = useAuthStore();
  const navigate = useNavigate();

  const logout = useCallback(() => {
    storeLogout();
    navigate('/');
  }, [storeLogout, navigate]);

  return { token, user, isAuthenticated: !!token, logout };
}

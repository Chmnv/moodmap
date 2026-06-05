import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe } from '../api/spotify';
import { useAuthStore } from '../store/authStore';

export default function Callback() {
  const navigate = useNavigate();
  const { setToken, setUser } = useAuthStore();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (error || !token) {
      navigate('/?error=' + (error ?? 'missing_token'));
      return;
    }

    setToken(token);

    getMe()
      .then((user) => {
        setUser(user);
        navigate('/dashboard', { replace: true });
      })
      .catch(() => {
        navigate('/?error=profile_fetch_failed');
      });
  }, [navigate, setToken, setUser]);

  return (
    <div className="min-h-screen bg-spotify-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-spotify-green border-t-transparent rounded-full animate-spin" />
        <p className="text-spotify-text-secondary text-sm">Connecting your account…</p>
      </div>
    </div>
  );
}

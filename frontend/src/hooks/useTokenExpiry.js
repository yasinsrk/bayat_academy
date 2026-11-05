// src/hooks/useTokenExpiry.js
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { resetAuth } from '../features/auth/authSlice';
import { msUntilExpiry } from '../utils/tokenWatcher';

/**
 * Watches the access_token in localStorage and auto-logs-out
 * exactly when it expires (server-side check still applies on each request).
 */
export default function useTokenExpiry() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    let timeoutId;

    const scheduleLogout = () => {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const ms = msUntilExpiry(token);

      if (ms <= 0) {
        performLogout();
        return;
      }

      // Safety: browsers cap setTimeout at ~24.8 days. If token expires later,
      // schedule a re-check in 12h chunks.
      const delay = Math.min(ms, 12 * 60 * 60 * 1000);
      timeoutId = setTimeout(() => {
        if (ms > 12 * 60 * 60 * 1000) {
          scheduleLogout(); // re-check later
        } else {
          performLogout();
        }
      }, delay);
    };

    const performLogout = () => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      dispatch(resetAuth());
      toast.warning('نشست شما منقضی شد. لطفاً مجدداً وارد شوید.');
      navigate('/login');
    };

    scheduleLogout();

    // Re-check whenever localStorage changes (e.g., new login)
    const onStorage = (e) => {
      if (e.key === 'access_token') {
        clearTimeout(timeoutId);
        scheduleLogout();
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('storage', onStorage);
    };
  }, [dispatch, navigate]);
}
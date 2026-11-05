// src/hooks/useSavedViews.js
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API = '/api';

/**
 * useSavedViews('payments')
 *   → { views, loading, save, remove, setDefault, refresh }
 */
export default function useSavedViews(page) {
  const [views, setViews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const res = await axios.get(
        `${API}/accounts/saved-views/?page_type=${page}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // DRF ModelViewSet may return paginated or array
      const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
      setViews(data);
    } catch (e) {
      console.warn('[saved-views] fetch failed:', e?.message);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const save = async ({ name, filters, icon = '', color = '' }) => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.post(
        `${API}/accounts/saved-views/`,
        { page, name, filters, icon, color },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setViews((v) => [res.data, ...v]);
      toast.success('نمای ذخیره شد');
      return res.data;
    } catch (e) {
      const msg = e.response?.data?.name?.[0]
        || e.response?.data?.detail
        || 'خطا در ذخیره‌سازی';
      toast.error(msg);
      throw e;
    }
  };

  const remove = async (id) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${API}/accounts/saved-views/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setViews((v) => v.filter((x) => x.id !== id));
      toast.success('نمای ذخیره‌شده حذف شد');
    } catch (e) {
      toast.error('خطا در حذف');
      throw e;
    }
  };

  const setDefault = async (id) => {
    try {
      const token = localStorage.getItem('access_token');
      // Unset previous default, set new one
      const currentDefault = views.find((v) => v.is_default);
      if (currentDefault && currentDefault.id !== id) {
        await axios.patch(
          `${API}/accounts/saved-views/${currentDefault.id}/`,
          { is_default: false },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      await axios.patch(
        `${API}/accounts/saved-views/${id}/`,
        { is_default: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setViews((v) =>
        v.map((x) => ({ ...x, is_default: x.id === id }))
      );
      toast.success('نمای پیش‌فرض تنظیم شد');
    } catch (e) {
      toast.error('خطا در تنظیم پیش‌فرض');
      throw e;
    }
  };

  return { views, loading, save, remove, setDefault, refresh: fetch };
}
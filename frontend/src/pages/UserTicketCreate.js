import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  FaArrowLeft, FaPaperPlane, FaTag, FaExclamationCircle,
  FaPlus, FaTicketAlt
} from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function UserTicketCreate() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ category: '', title: '', message: '', priority: 'medium' });
  const [errors, setErrors] = useState({});
  const API_URL = '/api';

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/tickets/categories/`, { headers: { Authorization: `Bearer ${token}` } });
      let categoriesData = [];
      if (response.data?.results && Array.isArray(response.data.results)) categoriesData = response.data.results;
      else if (Array.isArray(response.data)) categoriesData = response.data;
      setCategories(categoriesData);
    } catch (error) {
      setCategories([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'عنوان الزامی است';
    if (!formData.message.trim()) newErrors.message = 'متن پیام الزامی است';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const submitData = { title: formData.title, message: formData.message, priority: formData.priority };
      if (formData.category) submitData.category = parseInt(formData.category);
      await axios.post(`${API_URL}/tickets/tickets/`, submitData, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      toast.success('تیکت با موفقیت ارسال شد');
      navigate('/my-tickets');
    } catch (error) {
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          const firstErrorKey = Object.keys(errorData)[0];
          if (firstErrorKey) {
            const errorMessage = Array.isArray(errorData[firstErrorKey]) ? errorData[firstErrorKey][0] : errorData[firstErrorKey];
            toast.error(errorMessage || 'خطا در ارسال تیکت');
            setErrors(errorData);
          }
        } else toast.error(errorData);
      } else toast.error('خطا در ارسال تیکت');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityConfig = (priority) => {
    const configs = {
      low: { label: 'کم', color: '#64748B' },
      medium: { label: 'متوسط', color: '#7C3AED' },
      high: { label: 'بالا', color: '#F59E0B' },
      urgent: { label: 'فوری', color: '#EF4444' },
    };
    return configs[priority] || configs.medium;
  };

  const safeCategories = Array.isArray(categories) ? categories : [];

  return (
    <>
      <Navbar />

      <div style={styles.pageContainer}>
        <div style={styles.content}>
          <div style={styles.container}>

            {/* ===== Back Button ===== */}
            <button
              onClick={() => navigate('/my-tickets')}
              style={styles.backBtn}
              className="utc-back-btn"
            >
              <FaArrowLeft />
              <span>بازگشت به تیکت‌ها</span>
            </button>

            {/* ===== Card ===== */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={styles.card}
              className="utc-card"
            >

              {/* ===== Header ===== */}
              <div style={styles.header}>
                <div style={styles.headerIconWrapper} className="utc-header-icon-wrapper">
                  <div style={styles.headerIconGlow}></div>
                  <FaTicketAlt style={styles.headerIcon} />
                </div>
                <h1 style={styles.title} className="utc-title">تیکت جدید</h1>
                <p style={styles.subtitle}>سوال یا مشکل خود را مطرح کنید</p>
              </div>

              {/* ===== Form ===== */}
              <form onSubmit={handleSubmit} style={styles.form}>

                {/* Category */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    <FaTag style={styles.labelIcon} /> دسته‌بندی
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    style={styles.select}
                    className="utc-select"
                  >
                    <option value="">انتخاب دسته‌بندی</option>
                    {safeCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    <FaExclamationCircle style={styles.labelIcon} /> اولویت
                  </label>
                  <div style={styles.priorityWrapper} className="utc-priority-wrapper">
                    {['low', 'medium', 'high', 'urgent'].map(p => {
                      const config = getPriorityConfig(p);
                      const isActive = formData.priority === p;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setFormData({ ...formData, priority: p })}
                          style={{
                            ...styles.priorityBtn,
                            ...(isActive ? {
                              borderColor: config.color,
                              background: `${config.color}12`,
                              color: config.color,
                              fontWeight: '700',
                              boxShadow: `0 4px 12px ${config.color}25`
                            } : {})
                          }}
                          className={isActive ? 'utc-priority-btn utc-priority-btn-active' : 'utc-priority-btn'}
                        >
                          {config.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Title */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>عنوان <span style={styles.required}>*</span></label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    style={{
                      ...styles.input,
                      borderColor: errors.title ? '#EF4444' : 'rgba(124,58,237,0.1)'
                    }}
                    className="utc-input"
                    placeholder="عنوان تیکت را وارد کنید"
                  />
                  {errors.title && <span style={styles.errorText}>{errors.title}</span>}
                </div>

                {/* Message */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>متن پیام <span style={styles.required}>*</span></label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    style={{
                      ...styles.textarea,
                      borderColor: errors.message ? '#EF4444' : 'rgba(124,58,237,0.1)'
                    }}
                    className="utc-textarea"
                    placeholder="مشکل خود را به طور کامل توضیح دهید..."
                    rows="6"
                  />
                  {errors.message && <span style={styles.errorText}>{errors.message}</span>}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  style={styles.submitBtn}
                  className="utc-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div style={styles.submitSpinner}></div>
                      در حال ارسال...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane />
                      ارسال تیکت
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

// ============================================
// STYLES (هماهنگ با تم سایت)
// ============================================
const styles = {
  pageContainer: { minHeight: '100vh', background: '#FFFFFF', fontFamily: 'Vazirmatn, sans-serif' },
  content: { padding: '100px 0 60px' },
  container: { maxWidth: '700px', margin: '0 auto', padding: '0 24px' },

  // ===== Back Button =====
  backBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    background: '#F5F3FF', border: '1px solid rgba(124,58,237,0.1)',
    color: 'rgba(26,26,46,0.6)', fontSize: '14px', cursor: 'pointer',
    fontFamily: 'Vazirmatn, sans-serif', marginBottom: '20px',
    fontWeight: '600', padding: '10px 16px', borderRadius: '12px',
    transition: 'background 0.3s ease, color 0.3s ease, border-color 0.3s ease, transform 0.3s ease',
  },

  // ===== Card =====
  card: {
    background: '#FFFFFF',
    borderRadius: '24px',
    border: '1px solid rgba(124,58,237,0.08)',
    padding: '40px 36px',
    boxShadow: '0 4px 24px rgba(124,58,237,0.06)',
  },

  // ===== Header =====
  header: { textAlign: 'center', marginBottom: '32px' },
  headerIconWrapper: {
    width: '80px', height: '80px', borderRadius: '22px',
    background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 18px',
    boxShadow: '0 8px 32px rgba(45,21,64,0.4)',
    border: '1px solid rgba(168,85,247,0.25)',
    position: 'relative',
  },
  headerIconGlow: {
    position: 'absolute', inset: '-4px', borderRadius: '26px',
    background: 'linear-gradient(135deg, #A78BFA, #7C3AED)',
    opacity: 0.35, filter: 'blur(12px)', zIndex: -1,
  },
  headerIcon: { fontSize: '30px', color: '#FFFFFF' },
  title: { fontSize: '26px', fontWeight: '800', color: '#1A1A2E', marginBottom: '6px', letterSpacing: '-0.5px' },
  subtitle: { fontSize: '14px', color: 'rgba(26,26,46,0.5)' },

  // ===== Form =====
  form: { display: 'flex', flexDirection: 'column', gap: '22px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: {
    display: 'flex', alignItems: 'center', gap: '8px',
    fontSize: '14px', fontWeight: '600',
    color: 'rgba(26,26,46,0.7)',
  },
  labelIcon: { fontSize: '14px', color: '#7C3AED' },
  required: { color: '#EF4444', fontWeight: '700' },

  input: {
    width: '100%', padding: '14px 16px',
    background: '#FAFAFC',
    border: '1.5px solid rgba(124,58,237,0.1)',
    borderRadius: '12px',
    fontSize: '14px', color: '#1A1A2E',
    fontFamily: 'Vazirmatn, sans-serif', outline: 'none',
    transition: 'border-color 0.3s ease, background 0.3s ease',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%', padding: '14px 16px',
    background: '#FAFAFC',
    border: '1.5px solid rgba(124,58,237,0.1)',
    borderRadius: '12px',
    fontSize: '14px', color: '#1A1A2E',
    fontFamily: 'Vazirmatn, sans-serif',
    resize: 'vertical', outline: 'none',
    transition: 'border-color 0.3s ease, background 0.3s ease',
    boxSizing: 'border-box',
    minHeight: '140px',
  },
  select: {
    width: '100%', padding: '14px 16px',
    background: '#FAFAFC',
    border: '1.5px solid rgba(124,58,237,0.1)',
    borderRadius: '12px',
    fontSize: '14px', color: '#1A1A2E',
    fontFamily: 'Vazirmatn, sans-serif', outline: 'none',
    cursor: 'pointer',
    transition: 'border-color 0.3s ease, background 0.3s ease',
    boxSizing: 'border-box',
  },

  // ===== Priority =====
  priorityWrapper: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  priorityBtn: {
    padding: '10px 22px', borderRadius: '50px',
    border: '1.5px solid rgba(124,58,237,0.1)',
    background: '#FAFAFC',
    color: 'rgba(26,26,46,0.6)',
    cursor: 'pointer', fontSize: '13px', fontWeight: '600',
    fontFamily: 'Vazirmatn, sans-serif',
    transition: 'all 0.25s ease',
  },

  errorText: { color: '#EF4444', fontSize: '12px', marginTop: '4px', fontWeight: '500' },

  // ===== Submit Button (تیره) =====
  submitBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '10px', padding: '16px',
    background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
    color: 'white',
    border: '1px solid rgba(168,85,247,0.2)',
    borderRadius: '14px',
    fontSize: '16px', fontWeight: '700', cursor: 'pointer',
    fontFamily: 'Vazirmatn, sans-serif',
    boxShadow: '0 4px 20px rgba(45,21,64,0.35)',
    marginTop: '8px',
    transition: 'background 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease, border-color 0.3s ease',
    minHeight: '54px',
  },
  submitSpinner: {
    width: '18px', height: '18px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
};

// ===== Hover + Responsive =====
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

  /* ===== Input Focus ===== */
  .utc-input:focus,
  .utc-textarea:focus,
  .utc-select:focus {
    border-color: rgba(124,58,237,0.5) !important;
    background: #FFFFFF !important;
    box-shadow: 0 0 0 4px rgba(124,58,237,0.06) !important;
  }

  /* ===== Back Button Hover ===== */
  .utc-back-btn:hover {
    background: linear-gradient(135deg, #2D1540 0%, #1A0828 100%) !important;
    color: #FFFFFF !important;
    border-color: rgba(168,85,247,0.5) !important;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(45,21,64,0.3);
  }

  /* ===== Priority Button Hover ===== */
  .utc-priority-btn:hover {
    background: #F5F3FF !important;
    border-color: rgba(124,58,237,0.3) !important;
    transform: translateY(-2px);
  }
  .utc-priority-btn-active:hover {
    transform: translateY(-2px);
  }

  /* ===== Submit Button Hover ===== */
  .utc-submit-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #3D1E57 0%, #2D1540 100%) !important;
    box-shadow: 0 12px 32px rgba(45,21,64,0.5) !important;
    border-color: rgba(168,85,247,0.5) !important;
    transform: translateY(-2px);
  }
  .utc-submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none !important;
  }

  /* ===== Responsive ===== */
  @media (max-width: 768px) {
    .utc-card { padding: 32px 24px !important; border-radius: 20px !important; }
    .utc-title { font-size: 22px !important; }
    .utc-header-icon-wrapper { width: 72px !important; height: 72px !important; border-radius: 20px !important; }
    .utc-header-icon-wrapper svg { font-size: 26px !important; }
    .utc-priority-wrapper { gap: 6px !important; }
  }

  @media (max-width: 480px) {
    .utc-card { padding: 26px 18px !important; border-radius: 18px !important; }
    .utc-title { font-size: 20px !important; }
    .utc-header-icon-wrapper { width: 64px !important; height: 64px !important; border-radius: 18px !important; margin-bottom: 14px !important; }
    .utc-header-icon-wrapper svg { font-size: 24px !important; }
    .utc-priority-wrapper {
      display: grid !important;
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 8px !important;
    }
    .utc-priority-btn {
      padding: 10px 12px !important;
      text-align: center !important;
      justify-content: center !important;
    }
    .utc-back-btn { font-size: 13px !important; padding: 9px 14px !important; }
  }
`;
document.head.appendChild(styleSheet);

export default UserTicketCreate;
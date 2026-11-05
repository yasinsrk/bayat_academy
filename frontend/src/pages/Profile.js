// src/pages/Profile.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaUser, FaEdit, FaSave, FaTimes,
  FaBookOpen, FaArrowLeft, FaTicketAlt,
  FaGraduationCap
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getProfile, updateProfile } from '../features/auth/authSlice';
import { fetchMyPackages } from '../features/packages/packageSlice';

function Profile() {
  const dispatch = useDispatch();
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
  const { myPackages } = useSelector((state) => state.packages);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ bio: '' });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [daysTogether, setDaysTogether] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getProfile());
      dispatch(fetchMyPackages());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (user) {
      setFormData({ bio: user.bio || '' });
      setAvatarPreview(user.avatar || null);

      if (user.date_joined) {
        const joinedDate = new Date(user.date_joined);
        const today = new Date();
        const diffTime = Math.abs(today - joinedDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setDaysTogether(diffDays);
      }
    }
  }, [user]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateProfile({ bio: formData.bio })).unwrap();
      toast.success('بیوگرافی با موفقیت به‌روز شد');
      setIsEditing(false);
    } catch (error) {
      toast.error(error?.message || 'خطا در به‌روزرسانی');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) setFormData({ bio: user.bio || '' });
  };

  if (!isAuthenticated) {
    return (
      <div style={styles.authContainer}>
        <div style={styles.authCard} className="profile-auth-card">
          <div style={styles.authIconWrapper}>
            <FaUser style={styles.authIcon} />
          </div>
          <h2 style={styles.authTitle}>لطفاً وارد شوید</h2>
          <p style={styles.authDesc}>برای مشاهده حساب کاربری خود ابتدا وارد شوید.</p>
          <Link to="/login" style={styles.authBtn} className="profile-auth-btn">ورود به حساب</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>در حال بارگذاری...</p>
      </div>
    );
  }

  const myPackagesList = Array.isArray(myPackages) ? myPackages : [];

  return (
    <div style={styles.pageContainer}>
      <div style={styles.content}>
        <div className="profile-container" style={styles.container}>
          <Link to="/" style={styles.backLink} className="profile-back-link">
            <FaArrowLeft /> بازگشت به صفحه اصلی
          </Link>

          <div className="profile-grid" style={styles.grid}>
            {/* ===== Sidebar ===== */}
            <div className="profile-sidebar" style={styles.sidebar}>
              <div style={styles.avatarSection}>
                <div style={styles.avatarWrapper}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="آواتار" style={styles.avatar} />
                  ) : (
                    <div style={styles.avatarPlaceholder}>
                      <FaUser style={styles.avatarIcon} />
                    </div>
                  )}
                  <div style={styles.avatarRing}></div>
                </div>
                <h2 style={styles.userName}>{user?.full_name || user?.username}</h2>
                <p style={styles.userEmail}>{user?.email}</p>
                <span style={styles.userBadge}>
                  {user?.is_instructor ? 'مدرس' : 'دانشجو'}
                </span>
              </div>

              {/* ===== کارت مسیر یادگیری (تیره) ===== */}
              {daysTogether > 0 && (
                <div style={styles.journeyCard}>
                  <div style={styles.journeyHeader}>
                    <FaGraduationCap style={styles.journeyIcon} />
                    <span style={styles.journeyLabel}>مسیر یادگیری</span>
                  </div>
                  <div style={styles.journeyBody}>
                    <div style={styles.journeyNumberWrapper}>
                      <span style={styles.journeyNumber}>{daysTogether}</span>
                      <span style={styles.journeyUnit}>روز</span>
                    </div>
                    <p style={styles.journeyText}>
                      در کنار هم، مسیر یادگیری را ادامه می‌دهیم
                    </p>
                  </div>
                </div>
              )}

              {/* ===== آمار ===== */}
              <div style={styles.stats}>
                <div style={styles.statItem}>
                  <span style={styles.statNumber}>{myPackagesList.length}</span>
                  <span style={styles.statLabel}>دوره خریداری شده</span>
                </div>
              </div>

              <div style={styles.sidebarMenu}>
                <Link to="/profile" className="profile-menu-item profile-menu-item-active" style={{...styles.menuItem, ...styles.menuItemActive}}>
                  <FaUser style={styles.menuIcon} /> اطلاعات شخصی
                </Link>
                <Link to="/my-packages" className="profile-menu-item" style={styles.menuItem}>
                  <FaBookOpen style={styles.menuIcon} /> دوره‌های من
                </Link>
                <Link to="/my-tickets" className="profile-menu-item" style={styles.menuItem}>
                  <FaTicketAlt style={styles.menuIcon} /> تیکت‌های من
                </Link>
              </div>
            </div>

            {/* ===== Main Content ===== */}
            <div className="profile-main" style={styles.mainContent}>
              <div className="profile-header" style={styles.header}>
                <h1 className="profile-page-title" style={styles.pageTitle}>اطلاعات شخصی</h1>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="profile-edit-btn" style={styles.editBtn}>
                    <FaEdit style={styles.editIcon} /> ویرایش بیوگرافی
                  </button>
                )}
              </div>

              {isEditing ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={styles.editForm}
                >
                  <form onSubmit={handleSubmit}>
                    <div style={styles.readOnlyInfo}>
                      <div style={styles.readOnlyRow}>
                        <span style={styles.readOnlyLabel}>نام و نام خانوادگی</span>
                        <span style={styles.readOnlyValue}>{user?.full_name || 'ثبت نشده'}</span>
                      </div>
                      <div style={styles.readOnlyRow}>
                        <span style={styles.readOnlyLabel}>ایمیل</span>
                        <span style={styles.readOnlyValue}>{user?.email || 'ثبت نشده'}</span>
                      </div>
                      <div style={styles.readOnlyRow}>
                        <span style={styles.readOnlyLabel}>شماره موبایل</span>
                        <span style={styles.readOnlyValue}>{user?.phone || 'ثبت نشده'}</span>
                      </div>
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>بیوگرافی</label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        style={styles.textarea}
                        className="profile-textarea"
                        placeholder="درباره خودتان بنویسید..."
                        rows="4"
                      />
                    </div>

                    <div className="profile-form-actions" style={styles.formActions}>
                      <button type="submit" className="profile-save-btn" style={styles.saveBtn}>
                        <FaSave /> ذخیره تغییرات
                      </button>
                      <button type="button" onClick={handleCancel} className="profile-cancel-btn" style={styles.cancelBtn}>
                        <FaTimes /> انصراف
                      </button>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={styles.infoCard}
                >
                  {[
                    { label: 'نام و نام خانوادگی', value: user?.full_name || 'ثبت نشده' },
                    { label: 'ایمیل', value: user?.email || 'ثبت نشده' },
                    { label: 'شماره موبایل', value: user?.phone || 'ثبت نشده' },
                    { label: 'بیوگرافی', value: user?.bio || 'هنوز بیوگرافی ثبت نشده است' },
                    { label: 'نوع کاربر', value: user?.is_instructor ? 'مدرس' : 'دانشجو' },
                    { label: 'تاریخ عضویت', value: user?.date_joined ? new Date(user.date_joined).toLocaleDateString('fa-IR') : 'ثبت نشده' },
                  ].map((row, i) => (
                    <div key={i} className="profile-info-row" style={styles.infoRow}>
                      <span className="profile-info-label" style={styles.infoLabel}>{row.label}</span>
                      <span className="profile-info-value" style={styles.infoValue}>{row.value}</span>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* ===== Recent Purchases ===== */}
              <div style={styles.recentSection}>
                <h3 style={styles.recentTitle}>آخرین دوره‌های خریداری شده</h3>
                {myPackagesList.length === 0 ? (
                  <div style={styles.noPurchases}>
                    <p>شما هنوز هیچ دوره‌ای خریداری نکرده‌اید.</p>
                    <Link to="/packages" style={styles.browseBtn} className="profile-browse-btn">
                      مشاهده دوره‌ها
                    </Link>
                  </div>
                ) : (
                  <div style={styles.recentList}>
                    {myPackagesList.slice(0, 3).map((item) => (
                      <div key={item.id} className="profile-recent-item" style={styles.recentItem}>
                        <div className="profile-recent-image" style={styles.recentImage}>
                          {item.package_detail?.image ? (
                            <img src={item.package_detail.image} alt={item.package_detail.title} style={styles.recentImg} />
                          ) : (
                            <div style={styles.recentPlaceholder}>
                              <FaBookOpen style={styles.recentPlaceholderIcon} />
                            </div>
                          )}
                        </div>
                        <div style={styles.recentInfo}>
                          <h4 style={styles.recentTitleText}>{item.package_detail?.title}</h4>
                          <span style={styles.recentDate}>
                            {new Date(item.purchased_at).toLocaleDateString('fa-IR')}
                          </span>
                        </div>
                        <Link to={`/package/${item.package.id}`} style={styles.recentLink} className="profile-recent-link">
                          مشاهده
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// STYLES (هماهنگ با تم سایت)
// ============================================
const styles = {
  pageContainer: { minHeight: '100vh', background: '#FFFFFF', fontFamily: 'Vazirmatn, sans-serif' },
  content: { padding: '100px 0 60px' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '0 24px' },

  backLink: {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    color: 'rgba(26,26,46,0.5)', textDecoration: 'none',
    fontSize: '14px', fontWeight: '500', marginBottom: '20px',
    fontFamily: 'Vazirmatn, sans-serif',
    padding: '8px 14px', borderRadius: '10px',
    transition: 'color 0.3s ease, background 0.3s ease',
  },

  loading: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px', background: '#FFFFFF' },
  spinner: { width: '40px', height: '40px', border: '2px solid rgba(124,58,237,0.1)', borderTop: '2px solid #7C3AED', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  loadingText: { color: 'rgba(26,26,46,0.4)', fontSize: '14px' },

  // ===== Auth Required =====
  authContainer: { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px', background: '#FFFFFF' },
  authCard: {
    maxWidth: '440px', width: '100%', textAlign: 'center',
    padding: '48px 32px', background: '#FFFFFF', borderRadius: '24px',
    boxShadow: '0 4px 24px rgba(124,58,237,0.08)',
    border: '1px solid rgba(124,58,237,0.08)',
  },
  authIconWrapper: {
    width: '80px', height: '80px', borderRadius: '20px',
    background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 20px',
    boxShadow: '0 8px 24px rgba(45,21,64,0.4)',
    border: '1px solid rgba(168,85,247,0.25)',
  },
  authIcon: { fontSize: '32px', color: '#FFFFFF' },
  authTitle: { fontSize: '22px', fontWeight: '800', color: '#1A1A2E', marginBottom: '8px' },
  authDesc: { fontSize: '14px', color: 'rgba(26,26,46,0.5)', marginBottom: '24px', lineHeight: '1.7' },
  authBtn: {
    display: 'inline-block', padding: '14px 40px',
    background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
    color: 'white', borderRadius: '50px', textDecoration: 'none',
    fontWeight: '700', fontSize: '14px',
    boxShadow: '0 8px 24px rgba(45,21,64,0.4)',
    border: '1px solid rgba(168,85,247,0.25)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },

  // ===== Grid =====
  grid: { display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' },

  // ===== Sidebar =====
  sidebar: {
    background: '#FFFFFF', borderRadius: '20px',
    border: '1px solid rgba(124,58,237,0.08)',
    padding: '24px', height: 'fit-content',
    boxShadow: '0 4px 24px rgba(124,58,237,0.06)',
  },
  avatarSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' },
  avatarWrapper: { position: 'relative', width: '100px', height: '100px', marginBottom: '12px' },
  avatar: { width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid #F5F3FF', position: 'relative', zIndex: 2 },
  avatarRing: {
    position: 'absolute', inset: '-6px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #A78BFA, #7C3AED)',
    opacity: 0.2, filter: 'blur(8px)', zIndex: 1,
  },
  avatarPlaceholder: {
    width: '100%', height: '100%', borderRadius: '50%',
    background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative', zIndex: 2,
    border: '1px solid rgba(168,85,247,0.25)',
  },
  avatarIcon: { fontSize: '40px', color: 'white' },
  userName: { fontSize: '18px', fontWeight: '800', color: '#1A1A2E', marginBottom: '2px', textAlign: 'center' },
  userEmail: { fontSize: '13px', color: 'rgba(26,26,46,0.4)', marginBottom: '8px', textAlign: 'center', wordBreak: 'break-all' },
  userBadge: {
    fontSize: '12px', fontWeight: '600', padding: '4px 16px',
    borderRadius: '50px', background: 'rgba(124,58,237,0.08)', color: '#7C3AED',
  },

  // ===== کارت مسیر یادگیری (تیره مثل سایت) =====
  journeyCard: {
    background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
    borderRadius: '16px', padding: '18px 20px', marginBottom: '16px',
    position: 'relative', overflow: 'hidden',
    border: '1px solid rgba(168,85,247,0.2)',
    boxShadow: '0 8px 24px rgba(45,21,64,0.3)',
  },
  journeyHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' },
  journeyIcon: { fontSize: '16px', color: '#A78BFA' },
  journeyLabel: { fontSize: '12px', fontWeight: '600', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.5px' },
  journeyBody: { display: 'flex', flexDirection: 'column', gap: '8px' },
  journeyNumberWrapper: { display: 'flex', alignItems: 'baseline', gap: '6px' },
  journeyNumber: { fontSize: '32px', fontWeight: '800', color: '#FFFFFF', lineHeight: 1, letterSpacing: '-1px' },
  journeyUnit: { fontSize: '14px', fontWeight: '500', color: '#A78BFA' },
  journeyText: { fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.6', margin: 0 },

  // ===== Stats =====
  stats: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '16px 0',
    borderTop: '1px solid rgba(124,58,237,0.06)',
    borderBottom: '1px solid rgba(124,58,237,0.06)',
    marginBottom: '16px',
  },
  statItem: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  statNumber: { fontSize: '22px', fontWeight: '800', color: '#7C3AED' },
  statLabel: { fontSize: '11px', color: 'rgba(26,26,46,0.4)', marginTop: '2px' },

  // ===== Sidebar Menu =====
  sidebarMenu: { display: 'flex', flexDirection: 'column', gap: '4px' },
  menuItem: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 14px', borderRadius: '10px',
    color: 'rgba(26,26,46,0.5)', textDecoration: 'none',
    fontSize: '14px', fontWeight: '500',
    fontFamily: 'Vazirmatn, sans-serif',
    transition: 'background 0.3s ease, color 0.3s ease',
  },
  menuItemActive: { background: 'rgba(124,58,237,0.08)', color: '#7C3AED', fontWeight: '700' },
  menuIcon: { fontSize: '16px' },

  // ===== Main Content =====
  mainContent: {
    background: '#FFFFFF', borderRadius: '20px',
    border: '1px solid rgba(124,58,237,0.08)',
    padding: '28px', boxShadow: '0 4px 24px rgba(124,58,237,0.06)',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  pageTitle: { fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: '800', color: '#1A1A2E' },

  editBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '10px 20px', background: 'rgba(124,58,237,0.06)',
    border: '1px solid rgba(124,58,237,0.15)', borderRadius: '10px',
    color: '#7C3AED', cursor: 'pointer', fontSize: '14px',
    fontWeight: '700', fontFamily: 'Vazirmatn, sans-serif',
    transition: 'background 0.3s ease, border-color 0.3s ease, color 0.3s ease',
  },
  editIcon: { fontSize: '14px' },
  editForm: { marginBottom: '24px' },

  readOnlyInfo: {
    background: '#FAFAFC', borderRadius: '12px',
    padding: '16px 20px', marginBottom: '20px',
    border: '1px solid rgba(124,58,237,0.06)',
  },
  readOnlyRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', gap: '12px', flexWrap: 'wrap' },
  readOnlyLabel: { fontSize: '13px', color: 'rgba(26,26,46,0.5)', fontWeight: '500' },
  readOnlyValue: { fontSize: '13px', color: '#1A1A2E', fontWeight: '700' },

  formGroup: { marginBottom: '16px' },
  label: { display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '600', color: 'rgba(26,26,46,0.7)' },
  textarea: {
    width: '100%', padding: '14px 16px',
    background: '#FAFAFC', border: '1.5px solid rgba(124,58,237,0.1)',
    borderRadius: '12px', fontSize: '14px', color: '#1A1A2E',
    fontFamily: 'Vazirmatn, sans-serif', resize: 'vertical',
    outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.3s ease, background 0.3s ease',
  },

  formActions: { display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap' },

  // ✅ دکمه ذخیره - تیره
  saveBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
    color: 'white',
    border: '1px solid rgba(168,85,247,0.2)',
    borderRadius: '10px',
    fontSize: '14px', fontWeight: '700',
    cursor: 'pointer', fontFamily: 'Vazirmatn, sans-serif',
    boxShadow: '0 4px 16px rgba(45,21,64,0.35)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },
  cancelBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '12px 24px', background: '#F5F3FF',
    border: 'none', borderRadius: '10px',
    color: 'rgba(26,26,46,0.6)', cursor: 'pointer',
    fontSize: '14px', fontWeight: '600',
    fontFamily: 'Vazirmatn, sans-serif',
    transition: 'background 0.3s ease, color 0.3s ease',
  },

  // ===== Info Card =====
  infoCard: { marginBottom: '24px' },
  infoRow: {
    display: 'flex', justifyContent: 'space-between',
    padding: '14px 0', borderBottom: '1px solid rgba(124,58,237,0.06)',
    gap: '12px', flexWrap: 'wrap',
  },
  infoLabel: { fontSize: '14px', color: 'rgba(26,26,46,0.5)', fontWeight: '500', minWidth: '120px' },
  infoValue: { fontSize: '14px', color: '#1A1A2E', fontWeight: '600', wordBreak: 'break-word' },

  // ===== Recent Section =====
  recentSection: { borderTop: '1px solid rgba(124,58,237,0.06)', paddingTop: '20px' },
  recentTitle: { fontSize: '18px', fontWeight: '800', color: '#1A1A2E', marginBottom: '16px' },
  noPurchases: { textAlign: 'center', padding: '30px 0', color: 'rgba(26,26,46,0.4)' },

  // ✅ دکمه مشاهده دوره‌ها (Empty) - تیره
  browseBtn: {
    display: 'inline-block', marginTop: '12px', padding: '12px 28px',
    background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
    color: 'white', borderRadius: '50px', textDecoration: 'none',
    fontSize: '14px', fontWeight: '700',
    boxShadow: '0 4px 16px rgba(45,21,64,0.35)',
    border: '1px solid rgba(168,85,247,0.2)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },

  recentList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  recentItem: {
    display: 'flex', alignItems: 'center', gap: '14px',
    padding: '12px 16px', background: '#FAFAFC',
    borderRadius: '12px', flexWrap: 'wrap',
    border: '1px solid rgba(124,58,237,0.06)',
    transition: 'background 0.3s ease, border-color 0.3s ease',
  },
  recentImage: {
    width: '50px', height: '50px', borderRadius: '8px',
    overflow: 'hidden', flexShrink: 0,
    background: 'rgba(124,58,237,0.06)',
  },
  recentImg: { width: '100%', height: '100%', objectFit: 'cover' },
  recentPlaceholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  recentPlaceholderIcon: { fontSize: '20px', color: 'rgba(124,58,237,0.3)' },
  recentInfo: { flex: 1, minWidth: '120px' },
  recentTitleText: { fontSize: '14px', fontWeight: '700', color: '#1A1A2E', marginBottom: '2px' },
  recentDate: { fontSize: '12px', color: 'rgba(26,26,46,0.4)' },
  recentLink: {
    padding: '6px 16px', background: 'rgba(124,58,237,0.08)',
    border: '1px solid rgba(124,58,237,0.15)', borderRadius: '8px',
    color: '#7C3AED', textDecoration: 'none',
    fontSize: '12px', fontWeight: '700',
    transition: 'background 0.3s ease, color 0.3s ease, border-color 0.3s ease',
  },
};

// ============================================
// GLOBAL STYLES (Responsive)
// ============================================
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* ===== Textarea Focus ===== */
  .profile-textarea:focus {
    border-color: rgba(124,58,237,0.4) !important;
    background: #FFFFFF !important;
    box-shadow: 0 0 0 4px rgba(124,58,237,0.06) !important;
  }

  /* ===== Back Link Hover ===== */
  .profile-back-link:hover {
    color: #7C3AED !important;
    background: rgba(124,58,237,0.06);
  }

  /* ===== Menu Item Hover ===== */
  .profile-menu-item:hover {
    background: rgba(124,58,237,0.06);
    color: #7C3AED;
  }
  .profile-menu-item-active:hover {
    background: rgba(124,58,237,0.12) !important;
    color: #7C3AED !important;
  }

  /* ===== Edit Button Hover ===== */
  .profile-edit-btn:hover {
    background: rgba(124,58,237,0.12) !important;
    border-color: rgba(124,58,237,0.3) !important;
  }

  /* ===== Save Button Hover - تیره ===== */
  .profile-save-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(45,21,64,0.5) !important;
    border-color: rgba(168,85,247,0.5) !important;
    background: linear-gradient(135deg, #3D1E57 0%, #2D1540 100%) !important;
  }

  /* ===== Cancel Button Hover ===== */
  .profile-cancel-btn:hover {
    background: #EDE9FE !important;
    color: #7C3AED !important;
  }

  /* ===== Browse Button Hover - تیره ===== */
  .profile-browse-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(45,21,64,0.5) !important;
    border-color: rgba(168,85,247,0.5) !important;
    background: linear-gradient(135deg, #3D1E57 0%, #2D1540 100%) !important;
  }

  /* ===== Recent Item Hover ===== */
  .profile-recent-item:hover {
    background: #FFFFFF !important;
    border-color: rgba(124,58,237,0.2) !important;
  }

  /* ===== Recent Link Hover ===== */
  .profile-recent-link:hover {
    background: linear-gradient(135deg, #2D1540 0%, #1A0828 100%) !important;
    color: #FFFFFF !important;
    border-color: rgba(168,85,247,0.5) !important;
  }

  /* ===== Auth Button Hover - تیره ===== */
  .profile-auth-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(45,21,64,0.5) !important;
    border-color: rgba(168,85,247,0.5) !important;
    background: linear-gradient(135deg, #3D1E57 0%, #2D1540 100%) !important;
  }

  /* ===== Tablet ===== */
  @media (max-width: 900px) {
    .profile-grid {
      grid-template-columns: 1fr !important;
    }
    .profile-sidebar {
      width: 100% !important;
    }
  }

  /* ===== Mobile ===== */
  @media (max-width: 600px) {
    .profile-container {
      padding: 0 16px !important;
    }
    .profile-main {
      padding: 20px 16px !important;
    }
    .profile-sidebar {
      padding: 20px 16px !important;
    }
    .profile-page-title {
      font-size: 20px !important;
    }
    .profile-header {
      flex-direction: column !important;
      align-items: stretch !important;
    }
    .profile-edit-btn {
      justify-content: center !important;
    }
    .profile-form-actions {
      flex-direction: column !important;
    }
    .profile-save-btn,
    .profile-cancel-btn {
      width: 100% !important;
      justify-content: center !important;
    }
    .profile-info-row {
      flex-direction: column !important;
      gap: 4px !important;
    }
    .profile-info-label {
      min-width: auto !important;
    }
    .profile-recent-item {
      flex-direction: column !important;
      align-items: flex-start !important;
    }
    .profile-recent-image {
      width: 60px !important;
      height: 60px !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default Profile;
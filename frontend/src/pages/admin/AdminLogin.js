// src/pages/admin/AdminLogin.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../../features/auth/authSlice';
import { motion } from 'framer-motion';
import {
  FaUser, FaLock, FaEye, FaEyeSlash, FaShieldAlt,
  FaArrowRight, FaKey, FaCheckCircle,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import theme from '../../styles/adminTheme';
import Logo3d from '../../components/Logo3D'

function AdminLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  // ── Responsive state ──
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 900 : true
  );
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setIsDesktop(w >= 900);
      setIsMobile(w < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { username, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setError('لطفاً یوزرنیم و رمز عبور را وارد کنید');
      return;
    }

    try {
      const result = await dispatch(login({ username, password })).unwrap();

      if (!result.user.is_superuser) {
        setError('شما دسترسی ادمین ندارید');
        return;
      }

      toast.success(`خوش آمدید ${result.user.full_name || result.user.username}!`);
      navigate('/adminpanel/m1/admin/dashboard');
    } catch (err) {
      setError(err?.error || 'یوزرنیم یا رمز عبور اشتباه است');
    }
  };

  return (
    <div
      style={{
        ...S.container,
        gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr',
      }}
    >
      {/* ═══════ BRAND PANEL (desktop only) ═══════ */}
      {isDesktop && (
        <aside style={S.brandPanel}>
          <div style={S.brandGlow} />

          <div style={S.brandContent}>
            import Logo3d from '../../components/Logo3D'; // ایمپورت کامپوننت جدید شما

              // ... سایر ایمپورت‌ها و استایل‌ها

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                style={S.brandFeatures}
              >
                {[
                  { text: 'پنل مدیریت آکادمی بیات' },
                  { text: 'دسترسی فقط برای مدیران' },
                  { text: 'گزارش‌گیری زنده و دقیق' },
                ].map((item, i) => {
                  return (
                    <div key={i} style={S.brandFeatureRow}>
                      <div style={S.brandFeatureIcon}>
                        {/* استفاده از لوگوی سه بعدی به جای آیکون‌های قبلی */}
                        <Logo3d />
                      </div>
                      <span style={S.brandFeatureText}>{item.text}</span>
                    </div>
                  );
                })}
              </motion.div>


            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={S.brandFeatures}
            >
              {[
                { icon: FaShieldAlt, text: 'امنیت در سطح سازمانی' },
                { icon: FaKey, text: 'دسترسی فقط برای مدیران' },
                { icon: FaCheckCircle, text: 'گزارش‌گیری زنده و دقیق' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} style={S.brandFeatureRow}>
                    <div style={S.brandFeatureIcon}>
                      <Icon size={11} />
                    </div>
                    <span style={S.brandFeatureText}>{item.text}</span>
                  </div>
                );
              })}
            </motion.div>

            <div style={S.brandFooter}>
              © {new Date().getFullYear()} بیات آکادمی — تمامی حقوق محفوظ است
            </div>
          </div>
        </aside>
      )}

      {/* ═══════ FORM PANEL ═══════ */}
      <main
        style={{
          ...S.formPanel,
          padding: isMobile ? '24px 16px' : '40px 32px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            ...S.formCard,
            maxWidth: isDesktop ? 420 : 440,
          }}
        >
          {/* Mobile brand (only on mobile, inside form) */}
          {!isDesktop && (
            <div style={S.mobileBrand}>
              <div style={S.mobileBrandMark}>
                <span style={S.mobileBrandText}>ب</span>
              </div>
              <div style={S.mobileBrandTitle}>بیات آکادمی</div>
              <div style={S.mobileBrandSub}>پنل مدیریت</div>
            </div>
          )}

          <div style={S.formHeader}>
            <div
              style={{
                ...S.formIconWrap,
                width: isMobile ? 48 : 56,
                height: isMobile ? 48 : 56,
              }}
            >
              <FaShieldAlt size={isMobile ? 18 : 20} />
            </div>
            <h2 style={{ ...S.formTitle, fontSize: isMobile ? 19 : 22 }}>
              ورود به پنل ادمین
            </h2>
            <p style={S.formSubtitle}>
              برای دسترسی، اطلاعات حساب خود را وارد کنید
            </p>
          </div>

          <form onSubmit={handleSubmit} style={S.form}>
            {/* Username */}
            <div style={S.inputGroup}>
              <label style={S.inputLabel} htmlFor="username">
                یوزرنیم
              </label>
              <div
                style={{
                  ...S.inputWrapper,
                  ...(focusedField === 'username' ? S.inputWrapperFocused : {}),
                }}
              >
                <FaUser
                  size={12}
                  style={{
                    ...S.inputIcon,
                    color: focusedField === 'username'
                      ? theme.colors.accent
                      : theme.colors.textFaint,
                  }}
                />
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={username}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  style={S.input}
                  placeholder="یوزرنیم خود را وارد کنید"
                  autoComplete="username"
                  disabled={loading}
                  autoFocus={isDesktop}
                />
              </div>
            </div>

            {/* Password */}
            <div style={S.inputGroup}>
              <label style={S.inputLabel} htmlFor="password">
                رمز عبور
              </label>
              <div
                style={{
                  ...S.inputWrapper,
                  ...(focusedField === 'password' ? S.inputWrapperFocused : {}),
                }}
              >
                <FaLock
                  size={12}
                  style={{
                    ...S.inputIcon,
                    color: focusedField === 'password'
                      ? theme.colors.accent
                      : theme.colors.textFaint,
                  }}
                />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={password}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  style={{ ...S.input, paddingLeft: 44 }}
                  placeholder="رمز عبور خود را وارد کنید"
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={S.eyeBtn}
                  className="adm-login-eye"
                  tabIndex={-1}
                  aria-label={showPassword ? 'پنهان کردن رمز' : 'نمایش رمز'}
                >
                  {showPassword ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                style={S.errorBox}
              >
                <span style={S.errorIcon}>!</span>
                <span>{error}</span>
              </motion.div>
            )}

            <button
              type="submit"
              style={S.submitBtn}
              className="adm-login-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span style={S.spinner} />
                  در حال ورود...
                </>
              ) : (
                <>
                  ورود به پنل
                  <FaArrowRight size={11} />
                </>
              )}
            </button>
          </form>

          <div style={S.formFooter}>
            <a href="/" style={S.footerLink} className="adm-login-link">
              بازگشت به سایت
            </a>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════

const S = {
  container: {
    minHeight: '100vh',
    display: 'grid',
    background: theme.colors.surface,
    fontFamily: theme.font.family,
    // gridTemplateColumns set inline based on isDesktop
  },

  // ═══════════ BRAND PANEL ═══════════
  brandPanel: {
    position: 'relative',
    background: theme.colors.sidebarBg,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 48px',
    minHeight: '100vh',
  },
  brandGlow: {
    position: 'absolute',
    top: '20%',
    right: '-10%',
    width: 500,
    height: 500,
    borderRadius: '50%',
    background: `radial-gradient(circle, ${theme.colors.accent}33 0%, transparent 65%)`,
    pointerEvents: 'none',
  },
  brandContent: {
    position: 'relative',
    zIndex: 1,
    maxWidth: 420,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 40,
  },
  brandLogoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  brandLogoMark: {
    width: 48,
    height: 48,
    borderRadius: 14,
    background: `linear-gradient(135deg, ${theme.colors.accent} 0%, #7C5CE7 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: `0 8px 24px ${theme.colors.accentGlow}`,
  },
  brandLogoText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 800,
    lineHeight: 1,
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#FFFFFF',
    lineHeight: 1.2,
  },
  brandSub: {
    fontSize: 11,
    color: theme.colors.sidebarTextMuted,
    marginTop: 3,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    fontWeight: 600,
  },

  brandHeadline: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  brandHeadlineTitle: {
    fontSize: 34,
    fontWeight: 800,
    color: '#FFFFFF',
    margin: 0,
    lineHeight: 1.25,
    letterSpacing: '-0.5px',
  },
  brandHeadlineAccent: {
    background: `linear-gradient(135deg, ${theme.colors.accent} 0%, #7C5CE7 100%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  brandHeadlineDesc: {
    fontSize: 14,
    color: theme.colors.sidebarText,
    lineHeight: 1.85,
    margin: 0,
  },

  brandFeatures: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    padding: 20,
    background: 'rgba(255,255,255,0.03)',
    border: `1px solid ${theme.colors.sidebarBorder}`,
    borderRadius: 14,
  },
  brandFeatureRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  brandFeatureIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    background: `linear-gradient(135deg, ${theme.colors.accent}33 0%, #7C5CE733 100%)`,
    color: theme.colors.accent,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  brandFeatureText: {
    fontSize: 13,
    color: theme.colors.sidebarText,
    fontWeight: 500,
  },

  brandFooter: {
    fontSize: 11.5,
    color: theme.colors.sidebarTextMuted,
    marginTop: 'auto',
    paddingTop: 20,
  },

  // ═══════════ FORM PANEL ═══════════
  formPanel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: theme.colors.bg,
    minHeight: '100vh',
    width: '100%',
    boxSizing: 'border-box',
  },
  formCard: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 28,
  },

  // Mobile brand
  mobileBrand: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  mobileBrandMark: {
    width: 56,
    height: 56,
    borderRadius: 16,
    background: `linear-gradient(135deg, ${theme.colors.accent} 0%, #7C5CE7 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 8px 24px ${theme.colors.accentGlow}`,
  },
  mobileBrandText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 800,
    lineHeight: 1,
  },
  mobileBrandTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: theme.colors.text,
    marginTop: 6,
  },
  mobileBrandSub: {
    fontSize: 11,
    color: theme.colors.textSubtle,
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
    fontWeight: 600,
  },

  formHeader: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  formIconWrap: {
    borderRadius: 16,
    background: `linear-gradient(135deg, ${theme.colors.accent} 0%, #7C5CE7 100%)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    boxShadow: `0 8px 24px ${theme.colors.accentGlow}`,
  },
  formTitle: {
    fontWeight: 800,
    color: theme.colors.text,
    margin: 0,
    letterSpacing: '-0.4px',
  },
  formSubtitle: {
    fontSize: 13,
    color: theme.colors.textSubtle,
    margin: 0,
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },

  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 7,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: 700,
    color: theme.colors.textMuted,
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 12,
    transition: 'all 0.15s',
  },
  inputWrapperFocused: {
    borderColor: theme.colors.accent,
    boxShadow: `0 0 0 4px ${theme.colors.accent}15`,
  },
  inputIcon: {
    position: 'absolute',
    right: 14,
    transition: 'color 0.15s',
    pointerEvents: 'none',
    zIndex: 1,
  },
  input: {
    width: '100%',
    padding: '13px 42px 13px 16px',
    background: 'transparent',
    border: 'none',
    borderRadius: 12,
    fontSize: 13.5,
    color: theme.colors.text,
    fontFamily: theme.font.family,
    outline: 'none',
    boxSizing: 'border-box',
  },
  eyeBtn: {
    position: 'absolute',
    left: 12,
    background: 'none',
    border: 'none',
    color: theme.colors.textFaint,
    cursor: 'pointer',
    padding: 4,
    transition: 'color 0.15s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '11px 14px',
    background: theme.colors.dangerSoft,
    border: `1px solid ${theme.colors.danger}30`,
    borderRadius: 10,
    color: theme.colors.danger,
    fontSize: 12.5,
    fontWeight: 600,
  },
  errorIcon: {
    width: 18,
    height: 18,
    borderRadius: '50%',
    background: theme.colors.danger,
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 800,
    flexShrink: 0,
  },

  submitBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    padding: '14px',
    background: `linear-gradient(135deg, ${theme.colors.accent} 0%, #7C5CE7 100%)`,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'all 0.15s',
    fontFamily: theme.font.family,
    boxShadow: `0 6px 20px ${theme.colors.accentGlow}`,
    marginTop: 4,
  },
  spinner: {
    width: 14,
    height: 14,
    borderRadius: '50%',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid #FFFFFF',
    animation: 'adm-login-spin 0.8s linear infinite',
  },

  formFooter: {
    textAlign: 'center',
  },
  footerLink: {
    fontSize: 12.5,
    color: theme.colors.textSubtle,
    textDecoration: 'none',
    fontWeight: 600,
    transition: 'color 0.15s',
  },
};

// ═══════════════════════════════════════════════════════
// STYLES INJECTION
// ═══════════════════════════════════════════════════════

if (typeof document !== 'undefined' && !document.getElementById('admin-login-styles')) {
  const style = document.createElement('style');
  style.id = 'admin-login-styles';
  style.textContent = `
    @keyframes adm-login-spin {
      to { transform: rotate(360deg); }
    }

    .adm-login-eye:hover {
      color: ${theme.colors.accent} !important;
    }

    .adm-login-submit:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px ${theme.colors.accentGlow} !important;
    }
    .adm-login-submit:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }

    .adm-login-link:hover {
      color: ${theme.colors.accent} !important;
    }

    /* iOS zoom prevention */
    @media (max-width: 768px) {
      input {
        font-size: 16px !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export default AdminLogin;
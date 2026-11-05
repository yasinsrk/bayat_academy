import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../features/auth/authSlice';
import { motion } from 'framer-motion';
import {
  FaPhone, FaLock, FaEye, FaEyeSlash, FaArrowLeft, FaSignInAlt
} from 'react-icons/fa';
import { toast } from 'react-toastify';

// ✅ نقطه‌های تزئینی ثابت (بیرون کامپوننت)
const DOTS = [...Array(30)].map(() => Math.random() * 0.5 + 0.1);

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({ phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const { phone, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || !password) {
      toast.error('لطفاً شماره موبایل و رمز عبور را وارد کنید');
      return;
    }
    try {
      const result = await dispatch(login({ phone, password })).unwrap();
      toast.success(`خوش آمدید ${result.user.full_name || result.user.username}!`);
      navigate('/');
    } catch (err) {
      toast.error(err?.error || 'ورود ناموفق. لطفاً مجدداً تلاش کنید.');
    }
  };

  return (
    <div style={styles.pageContainer}>
      {/* ✅ هاله‌های نوری با CSS Animation (نه framer-motion) */}
      <div style={styles.glow1} className="login-glow1" />
      <div style={styles.glow2} className="login-glow2" />
      <div style={styles.glow3} className="login-glow3" />

      {/* ✅ نقطه‌های تزئینی ثابت */}
      <div style={styles.dotsGrid}>
        {DOTS.map((op, i) => (
          <span key={i} style={{ ...styles.dot, opacity: op }} />
        ))}
      </div>

      {/* ✅ کارت اصلی */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={styles.card}
        className="login-card"
      >
        <div style={styles.topBar} />

        <Link to="/" style={styles.backLink} className="login-back-link">
          <FaArrowLeft style={styles.backIcon} />
          <span>بازگشت</span>
        </Link>

        {/* ===== هدر ===== */}
        <div style={styles.header}>
          <div style={styles.iconWrapper} className="login-icon-wrapper">
            <div style={styles.iconGlow} />
            <FaSignInAlt style={styles.icon} />
          </div>

          <h2 style={styles.title}>
            خوش <span style={styles.titleGradient}>آمدید</span>
          </h2>

          <p style={styles.subtitle}>
            با شماره موبایل خود وارد شوید
          </p>
        </div>

        {/* ===== فرم ===== */}
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>شماره موبایل</label>
            <div style={styles.inputWrapper}>
              <FaPhone style={styles.inputIcon} />
              <input
                type="tel"
                name="phone"
                value={phone}
                onChange={handleChange}
                style={styles.input}
                className="login-input"
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                dir="ltr"
                autoComplete="tel"
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>رمز عبور</label>
            <div style={styles.inputWrapper}>
              <FaLock style={styles.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={password}
                onChange={handleChange}
                style={styles.input}
                className="login-input"
                placeholder="رمز عبور خود را وارد کنید"
                dir="ltr"
                autoComplete="current-password"
              />
              <button
                type="button"
                style={styles.eyeBtn}
                className="login-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="نمایش رمز"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {error && (
            <div style={styles.errorMessage}>
              {typeof error === 'string' ? error : 'ورود ناموفق'}
            </div>
          )}

          <button
            type="submit"
            style={styles.button}
            className="login-btn-submit"
            disabled={loading}
          >
            {loading ? (
              <>
                <span style={styles.spinnerSmall}></span>
                در حال ورود...
              </>
            ) : (
              'ورود به حساب کاربری'
            )}
          </button>
        </form>

        <div style={styles.links}>
        <Link to="/forgot-password" style={styles.forgotLink} className="login-forgot-link">
          رمز عبور خود را فراموش کرده‌اید؟
        </Link>
        </div>

        <p style={styles.footer}>
          حساب کاربری ندارید؟{' '}
          <Link to="/register" style={styles.link} className="login-register-link">ثبت‌نام کنید</Link>
        </p>
      </motion.div>
    </div>
  );
}

const styles = {
  pageContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '100px 24px 60px',
    backgroundColor: '#0A0415',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: 'Vazirmatn, sans-serif',
  },

  // ✅ هاله‌ها با blur کمتر (بهینه)
  glow1: {
    position: 'absolute',
    top: '10%',
    right: '15%',
    width: '400px',
    height: '400px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 70%)',
    filter: 'blur(50px)',
    pointerEvents: 'none',
    willChange: 'transform, opacity',
  },
  glow2: {
    position: 'absolute',
    bottom: '10%',
    left: '10%',
    width: '350px',
    height: '350px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)',
    filter: 'blur(50px)',
    pointerEvents: 'none',
    willChange: 'transform, opacity',
  },
  glow3: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(45,21,64,0.4) 0%, transparent 70%)',
    filter: 'blur(60px)',
    pointerEvents: 'none',
    willChange: 'transform, opacity',
  },

  // ✅ نقطه‌های تزئینی
  dotsGrid: {
    position: 'absolute',
    top: '5%',
    left: '5%',
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '20px',
    pointerEvents: 'none',
    zIndex: 1,
  },
  dot: {
    width: '3px',
    height: '3px',
    borderRadius: '50%',
    background: '#A78BFA',
  },

  // ✅ کارت (بدون backdrop-filter سنگین)
  card: {
    maxWidth: '440px',
    width: '100%',
    padding: '44px 36px 36px',
    background: 'rgba(20, 12, 40, 0.95)',  // ← شفافیت کمتر، بدون blur
    borderRadius: '28px',
    border: '1px solid rgba(168,85,247,0.2)',
    boxShadow: '0 30px 80px rgba(0,0,0,0.5), 0 0 60px rgba(124,58,237,0.15)',
    position: 'relative',
    zIndex: 2,
    overflow: 'hidden',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: '30%',
    right: '30%',
    height: '3px',
    background: 'linear-gradient(90deg, transparent, #A78BFA, transparent)',
    borderRadius: '0 0 10px 10px',
  },

  // ===== بازگشت =====
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    color: 'rgba(255,255,255,0.5)',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    marginBottom: '24px',
    fontFamily: 'Vazirmatn, sans-serif',
    padding: '8px 14px',
    borderRadius: '10px',
    transition: 'color 0.3s ease, background 0.3s ease, border-color 0.3s ease',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  backIcon: { fontSize: '14px' },

  // ===== هدر =====
  header: { textAlign: 'center', marginBottom: '32px' },
  iconWrapper: {
    width: '80px',
    height: '80px',
    borderRadius: '24px',
    background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    boxShadow: '0 12px 40px rgba(45,21,64,0.6)',
    border: '1px solid rgba(168,85,247,0.3)',
    position: 'relative',
  },
  iconGlow: {
    position: 'absolute',
    inset: '-4px',
    borderRadius: '28px',
    background: 'linear-gradient(135deg, #A78BFA, #7C3AED)',
    opacity: 0.35,
    filter: 'blur(10px)',
    zIndex: -1,
  },
  icon: { fontSize: '32px', color: '#FFFFFF' },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: '8px',
    letterSpacing: '-0.5px',
  },
  titleGradient: {
    background: 'linear-gradient(135deg, #A78BFA, #FFFFFF)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },

  // ===== فرم =====
  formGroup: { marginBottom: '20px' },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '13px',
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    right: '16px',
    color: 'rgba(167,139,250,0.6)',
    fontSize: '16px',
    pointerEvents: 'none',
    zIndex: 1,
  },
  input: {
    width: '100%',
    padding: '16px 48px 16px 48px',
    background: 'rgba(10,4,21,0.6)',
    border: '1.5px solid rgba(168,85,247,0.15)',
    borderRadius: '14px',
    fontSize: '15px',
    color: '#FFFFFF',
    transition: 'border-color 0.3s ease, background 0.3s ease',
    fontFamily: 'Vazirmatn, sans-serif',
    outline: 'none',
  },
  eyeBtn: {
    position: 'absolute',
    left: '14px',
    background: 'none',
    border: 'none',
    color: 'rgba(167,139,250,0.6)',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '4px',
    transition: 'color 0.3s ease',
    zIndex: 1,
  },
  errorMessage: {
    color: '#FCA5A5',
    marginBottom: '16px',
    padding: '12px 16px',
    background: 'rgba(239,68,68,0.1)',
    borderRadius: '12px',
    fontSize: '13px',
    textAlign: 'center',
    border: '1px solid rgba(239,68,68,0.2)',
  },
  button: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
    color: '#FFFFFF',
    border: '1px solid rgba(168,85,247,0.3)',
    borderRadius: '14px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
    boxShadow: '0 8px 30px rgba(45,21,64,0.4)',
    fontFamily: 'Vazirmatn, sans-serif',
    marginTop: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    minHeight: '54px',
  },
  spinnerSmall: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid #FFFFFF',
    borderRadius: '50%',
    animation: 'loginSpin 0.8s linear infinite',
  },

  // ===== لینک‌ها =====
  links: { textAlign: 'center', marginTop: '18px' },
  forgotLink: {
    color: 'rgba(255,255,255,0.5)',
    textDecoration: 'none',
    fontSize: '13px',
    fontFamily: 'Vazirmatn, sans-serif',
    transition: 'color 0.3s ease',
  },
  footer: {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '14px',
    color: 'rgba(255,255,255,0.5)',
    paddingTop: '20px',
    borderTop: '1px solid rgba(168,85,247,0.1)',
  },
  link: {
    color: '#A78BFA',
    textDecoration: 'none',
    fontWeight: '700',
    fontFamily: 'Vazirmatn, sans-serif',
    transition: 'color 0.3s ease',
  },
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes loginSpin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* ===== انیمیشن هاله‌ها با CSS (بهینه‌تر از JS) ===== */
  @keyframes loginPulse1 {
    0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.4; }
    50% { transform: translate3d(0, -20px, 0) scale(1.1); opacity: 0.6; }
  }
  @keyframes loginPulse2 {
    0%, 100% { transform: translate3d(0, 0, 0) scale(1.1); opacity: 0.3; }
    50% { transform: translate3d(0, 20px, 0) scale(1); opacity: 0.5; }
  }
  @keyframes loginPulse3 {
    0%, 100% { transform: translate3d(-50%, -50%, 0) scale(1); opacity: 0.3; }
    50% { transform: translate3d(-50%, -50%, 0) scale(1.05); opacity: 0.45; }
  }

  .login-glow1 { animation: loginPulse1 8s ease-in-out infinite; }
  .login-glow2 { animation: loginPulse2 10s ease-in-out infinite; }
  .login-glow3 { animation: loginPulse3 12s ease-in-out infinite; }

  /* ===== Input Focus ===== */
  .login-input:focus {
    border-color: rgba(168,85,247,0.6) !important;
    background: rgba(45,21,64,0.5) !important;
  }

  /* ===== Back Link Hover ===== */
  .login-back-link:hover {
    color: #A78BFA !important;
    background: rgba(168,85,247,0.1) !important;
    border-color: rgba(168,85,247,0.3) !important;
  }

  /* ===== Eye Button Hover ===== */
  .login-eye-btn:hover {
    color: #A78BFA !important;
  }

  /* ===== Submit Button Hover ===== */
  .login-btn-submit:hover:not(:disabled) {
    background: linear-gradient(135deg, #3D1E57 0%, #2D1540 100%) !important;
    box-shadow: 0 12px 40px rgba(45,21,64,0.6) !important;
    border-color: rgba(168,85,247,0.6) !important;
    transform: translate3d(0, -2px, 0);
  }
  .login-btn-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .login-btn-submit {
    transition: background 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease, transform 0.2s ease !important;
  }

  /* ===== Links Hover ===== */
  .login-forgot-link:hover { color: #A78BFA !important; }
  .login-register-link:hover { color: #C4B5FD !important; }

  /* ===== ریسپانسیو ===== */
  @media (max-width: 768px) {
    .login-card {
      padding: 36px 28px 30px !important;
      border-radius: 24px !important;
    }
    .login-icon-wrapper {
      width: 72px !important;
      height: 72px !important;
      border-radius: 20px !important;
    }
    .login-icon-wrapper svg {
      font-size: 28px !important;
    }
  }

  @media (max-width: 480px) {
    .login-card {
      padding: 32px 20px 26px !important;
      border-radius: 20px !important;
    }
    .login-icon-wrapper {
      width: 64px !important;
      height: 64px !important;
      border-radius: 18px !important;
    }
    .login-icon-wrapper svg {
      font-size: 24px !important;
    }
  }

  /* ===== حذف انیمیشن در کاربرانی که ترجیح میدن ===== */
  @media (prefers-reduced-motion: reduce) {
    .login-glow1, .login-glow2, .login-glow3 {
      animation: none !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default Login;
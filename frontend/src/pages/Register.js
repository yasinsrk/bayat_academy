import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaUser, FaPhone, FaEnvelope, FaLock, FaEye, FaEyeSlash,
  FaArrowLeft, FaUserPlus, FaKey, FaCheckCircle
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';
const DOTS = [...Array(30)].map(() => Math.random() * 0.5 + 0.1);

function Register() {
  const navigate = useNavigate();

  // Steps: 1 = form, 2 = OTP
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '', last_name: '', phone: '', email: '', password: '', password2: '',
  });
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const { first_name, last_name, phone, email, password, password2 } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) setFieldErrors({ ...fieldErrors, [e.target.name]: null });
  };

  // ── Step 1: Send OTP ──
  const handleSubmitForm = async (e) => {
    e.preventDefault();

    if (!first_name || !last_name) { toast.error('لطفاً نام و نام خانوادگی را وارد کنید'); return; }
    if (!phone || phone.length < 11) { toast.error('لطفاً شماره موبایل معتبر وارد کنید'); return; }
    if (!password || password.length < 8) { toast.error('رمز عبور باید حداقل ۸ کاراکتر باشد'); return; }
    if (password !== password2) { toast.error('رمز عبور با تکرار آن مطابقت ندارد'); return; }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/accounts/register/start/`, {
        phone, first_name, last_name,
        email: email || '',
        password,
      });
      toast.success('کد تأیید به شماره شما ارسال شد');
      setStep(2);
    } catch (err) {
      const data = err.response?.data;
      if (typeof data === 'object') {
        setFieldErrors(data);
        // Check for "already registered" specific error
        if (data.phone && Array.isArray(data.phone) && data.phone[0].includes('قبلاً')) {
          toast.error('این شماره قبلاً ثبت‌نام کرده است. لطفاً وارد شوید.');
        } else {
          const firstKey = Object.keys(data)[0];
          const msg = Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey];
          toast.error(msg || 'خطا در ثبت‌نام');
        }
      } else {
        toast.error(data?.error || 'خطا در ثبت‌نام');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP & create user ──
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      toast.error('لطفاً کد ۶ رقمی را وارد کنید');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/accounts/otp/verify/`, {
        phone, code: otp, purpose: 'verify',
      });

      // Save tokens
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      toast.success(`خوش آمدید ${res.data.user.first_name} ${res.data.user.last_name}!`);

      // Force reload so authSlice picks up localStorage
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (err) {
      toast.error(err.response?.data?.error || 'کد نامعتبر است');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToForm = () => {
    setStep(1);
    setOtp('');
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.glow1} className="register-glow1" />
      <div style={styles.glow2} className="register-glow2" />
      <div style={styles.glow3} className="register-glow3" />

      <div style={styles.dotsGrid}>
        {DOTS.map((op, i) => (
          <span key={i} style={{ ...styles.dot, opacity: op }} />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={styles.card}
        className="register-card"
      >
        <div style={styles.topBar} />

        <Link to="/" style={styles.backLink} className="register-back-link">
          <FaArrowLeft style={styles.backIcon} />
          <span>بازگشت</span>
        </Link>

        <div style={styles.header}>
          <div style={styles.iconWrapper} className="register-icon-wrapper">
            <div style={styles.iconGlow} />
            {step === 1 ? <FaUserPlus style={styles.icon} /> : <FaKey style={styles.icon} />}
          </div>

          <h2 style={styles.title}>
            <span style={styles.titleGradient}>
              {step === 1 ? 'ثبت‌نام' : 'تأیید شماره'}
            </span>
          </h2>

          <p style={styles.subtitle}>
            {step === 1 ? 'برای شروع یادگیری، ثبت‌نام کنید' : `کد ۶ رقمی به ${phone} ارسال شد`}
          </p>
        </div>

        {/* ═══ Step 1: Form ═══ */}
        {step === 1 && (
          <form onSubmit={handleSubmitForm}>
            <div style={styles.row} className="register-row">
              <div style={styles.halfGroup}>
                <label style={styles.label}>نام</label>
                <div style={styles.inputWrapper}>
                  <FaUser style={styles.inputIcon} />
                  <input type="text" name="first_name" value={first_name} onChange={handleChange} style={styles.input} className="register-input" placeholder="نام" autoComplete="given-name" />
                </div>
              </div>
              <div style={styles.halfGroup}>
                <label style={styles.label}>نام خانوادگی</label>
                <div style={styles.inputWrapper}>
                  <FaUser style={styles.inputIcon} />
                  <input type="text" name="last_name" value={last_name} onChange={handleChange} style={styles.input} className="register-input" placeholder="نام خانوادگی" autoComplete="family-name" />
                </div>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>شماره موبایل</label>
              <div style={styles.inputWrapper}>
                <FaPhone style={styles.inputIcon} />
                <input type="tel" name="phone" value={phone} onChange={handleChange} style={styles.input} className="register-input" placeholder="۰۹۱۲۳۴۵۶۷۸۹" dir="ltr" autoComplete="tel" />
              </div>
              {fieldErrors.phone && <span style={styles.fieldError}>{Array.isArray(fieldErrors.phone) ? fieldErrors.phone[0] : fieldErrors.phone}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>ایمیل <span style={styles.optional}>(اختیاری)</span></label>
              <div style={styles.inputWrapper}>
                <FaEnvelope style={styles.inputIcon} />
                <input type="email" name="email" value={email} onChange={handleChange} style={styles.input} className="register-input" placeholder="example@email.com" dir="ltr" autoComplete="email" />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>رمز عبور</label>
              <div style={styles.inputWrapper}>
                <FaLock style={styles.inputIcon} />
                <input type={showPassword ? 'text' : 'password'} name="password" value={password} onChange={handleChange} style={styles.input} className="register-input" placeholder="حداقل ۸ کاراکتر" dir="ltr" autoComplete="new-password" />
                <button type="button" style={styles.eyeBtn} className="register-eye-btn" onClick={() => setShowPassword(!showPassword)} aria-label="نمایش رمز">
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>تکرار رمز عبور</label>
              <div style={styles.inputWrapper}>
                <FaLock style={styles.inputIcon} />
                <input type={showPassword2 ? 'text' : 'password'} name="password2" value={password2} onChange={handleChange} style={styles.input} className="register-input" placeholder="رمز عبور را مجدداً وارد کنید" dir="ltr" autoComplete="new-password" />
                <button type="button" style={styles.eyeBtn} className="register-eye-btn" onClick={() => setShowPassword2(!showPassword2)} aria-label="نمایش رمز">
                  {showPassword2 ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button type="submit" style={styles.button} className="register-btn-submit" disabled={loading}>
              {loading ? (<><span style={styles.spinnerSmall}></span> در حال ارسال کد...</>) : 'ثبت‌نام و دریافت کد تأیید'}
            </button>
          </form>
        )}

        {/* ═══ Step 2: OTP ═══ */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP}>
            <div style={styles.formGroup}>
              <label style={styles.label}>کد تأیید ۶ رقمی</label>
              <div style={styles.inputWrapper}>
                <FaCheckCircle style={styles.inputIcon} />
                <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} style={styles.input} className="register-input" placeholder="۱۲۳۴۵۶" dir="ltr" maxLength={6} autoFocus />
              </div>
            </div>

            <button type="submit" style={styles.button} className="register-btn-submit" disabled={loading}>
              {loading ? (<><span style={styles.spinnerSmall}></span> در حال بررسی...</>) : 'تأیید و ساخت حساب'}
            </button>

            <button type="button" onClick={handleBackToForm} style={{ ...styles.button, background: 'transparent', border: '1px solid rgba(168,85,247,0.3)', marginTop: 10 }}>
              تغییر شماره موبایل
            </button>
          </form>
        )}

        <p style={styles.footer}>
          قبلاً ثبت‌نام کردید؟{' '}
          <Link to="/login" style={styles.link} className="register-login-link">ورود</Link>
        </p>
      </motion.div>
    </div>
  );
}

const styles = {
  pageContainer: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px 60px', backgroundColor: '#0A0415', position: 'relative', overflow: 'hidden', fontFamily: 'Vazirmatn, sans-serif' },
  glow1: { position: 'absolute', top: '10%', right: '15%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' },
  glow2: { position: 'absolute', bottom: '10%', left: '10%', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' },
  glow3: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,21,64,0.4) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' },
  dotsGrid: { position: 'absolute', top: '5%', left: '5%', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '20px', pointerEvents: 'none', zIndex: 1 },
  dot: { width: '3px', height: '3px', borderRadius: '50%', background: '#A78BFA' },
  card: { maxWidth: '520px', width: '100%', padding: '44px 36px 36px', background: 'rgba(20, 12, 40, 0.95)', borderRadius: '28px', border: '1px solid rgba(168,85,247,0.2)', boxShadow: '0 30px 80px rgba(0,0,0,0.5), 0 0 60px rgba(124,58,237,0.15)', position: 'relative', zIndex: 2, overflow: 'hidden' },
  topBar: { position: 'absolute', top: 0, left: '30%', right: '30%', height: '3px', background: 'linear-gradient(90deg, transparent, #A78BFA, transparent)', borderRadius: '0 0 10px 10px' },
  backLink: { display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '14px', fontWeight: '500', marginBottom: '24px', padding: '8px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' },
  backIcon: { fontSize: '14px' },
  header: { textAlign: 'center', marginBottom: '32px' },
  iconWrapper: { width: '80px', height: '80px', borderRadius: '24px', background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 12px 40px rgba(45,21,64,0.6)', border: '1px solid rgba(168,85,247,0.3)', position: 'relative' },
  iconGlow: { position: 'absolute', inset: '-4px', borderRadius: '28px', background: 'linear-gradient(135deg, #A78BFA, #7C3AED)', opacity: 0.35, filter: 'blur(10px)', zIndex: -1 },
  icon: { fontSize: '32px', color: '#FFFFFF' },
  title: { fontSize: '28px', fontWeight: '800', color: '#FFFFFF', marginBottom: '8px', letterSpacing: '-0.5px' },
  titleGradient: { background: 'linear-gradient(135deg, #A78BFA, #FFFFFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' },
  subtitle: { fontSize: '14px', color: 'rgba(255,255,255,0.5)', fontWeight: '500' },
  row: { display: 'flex', gap: '16px', marginBottom: '20px' },
  halfGroup: { flex: 1 },
  formGroup: { marginBottom: '20px' },
  label: { display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.7)' },
  optional: { color: 'rgba(255,255,255,0.35)', fontSize: '12px', fontWeight: '400' },
  inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  inputIcon: { position: 'absolute', right: '16px', color: 'rgba(167,139,250,0.6)', fontSize: '16px', pointerEvents: 'none', zIndex: 1 },
  input: { width: '100%', padding: '16px 48px', background: 'rgba(10,4,21,0.6)', border: '1.5px solid rgba(168,85,247,0.15)', borderRadius: '14px', fontSize: '15px', color: '#FFFFFF', outline: 'none', boxSizing: 'border-box', fontFamily: 'Vazirmatn, sans-serif' },
  eyeBtn: { position: 'absolute', left: '14px', background: 'none', border: 'none', color: 'rgba(167,139,250,0.6)', cursor: 'pointer', fontSize: '16px', padding: '4px', zIndex: 1 },
  fieldError: { display: 'block', color: '#FCA5A5', fontSize: '12px', marginTop: '6px', paddingRight: '4px' },
  button: { width: '100%', padding: '16px', background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)', color: '#FFFFFF', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '14px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 8px 30px rgba(45,21,64,0.4)', fontFamily: 'Vazirmatn, sans-serif', marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', minHeight: '54px' },
  spinnerSmall: { width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid #FFFFFF', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  footer: { textAlign: 'center', marginTop: '24px', fontSize: '14px', color: 'rgba(255,255,255,0.5)', paddingTop: '20px', borderTop: '1px solid rgba(168,85,247,0.1)' },
  link: { color: '#A78BFA', textDecoration: 'none', fontWeight: '700', fontFamily: 'Vazirmatn, sans-serif' },
};

export default Register;
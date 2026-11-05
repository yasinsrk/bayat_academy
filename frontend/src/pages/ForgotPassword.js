import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPhone, FaLock, FaArrowLeft, FaKey, FaCheckCircle } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

// ✅ Uses the environment variable we set up earlier
const API_URL = process.env.REACT_APP_API_URL || '/api';

export default function ForgotPassword() {
  const navigate = useNavigate();

  // Steps: 1 = Phone, 2 = Code, 3 = New Password
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetToken, setResetToken] = useState('');

  // ── Step 1: Send OTP ──
  const handleSendCode = async (e) => {
    e.preventDefault();
    if (!phone || phone.length < 11) {
      toast.error('لطفاً شماره موبایل معتبر وارد کنید');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/accounts/otp/send/`, {
        phone,
        purpose: 'reset'
      });
      toast.success('کد بازیابی ارسال شد');
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.error || error.response?.data?.phone?.[0] || 'خطا در ارسال کد');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ──
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!code || code.length < 6) {
      toast.error('لطفاً کد ۶ رقمی را وارد کنید');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/accounts/otp/verify/`, {
        phone,
        code,
        purpose: 'reset'
      });
      setResetToken(res.data.reset_token);
      toast.success('کد صحیح است. رمز جدید را وارد کنید');
      setStep(3);
    } catch (error) {
      toast.error(error.response?.data?.error || 'کد وارد شده نامعتبر است');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Set New Password ──
  const handleSetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error('رمز عبور باید حداقل ۸ کاراکتر باشد');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/accounts/password-reset/set/`, {
        reset_token: resetToken,
        new_password: newPassword,
      });
      toast.success('رمز عبور با موفقیت تغییر کرد');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.error || 'خطا در تغییر رمز عبور');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageContainer}>
      {/* Background Glows */}
      <div style={styles.glow1} className="login-glow1" />
      <div style={styles.glow2} className="login-glow2" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.card}
        className="login-card"
      >
        <div style={styles.topBar} />

        <Link to="/login" style={styles.backLink} className="login-back-link">
          <FaArrowLeft style={styles.backIcon} />
          <span>بازگشت به ورود</span>
        </Link>

        <div style={styles.header}>
          <div style={styles.iconWrapper} className="login-icon-wrapper">
            <div style={styles.iconGlow} />
            {step === 1 && <FaPhone style={styles.icon} />}
            {step === 2 && <FaKey style={styles.icon} />}
            {step === 3 && <FaCheckCircle style={styles.icon} />}
          </div>

          <h2 style={styles.title}>
            {step === 1 && 'بازیابی رمز عبور'}
            {step === 2 && 'کد تأیید'}
            {step === 3 && 'رمز عبور جدید'}
          </h2>
          <p style={styles.subtitle}>
            {step === 1 && 'شماره موبایل خود را وارد کنید'}
            {step === 2 && 'کد ارسال شده به موبایل خود را وارد کنید'}
            {step === 3 && 'رمز عبور جدید خود را وارد کنید'}
          </p>
        </div>

        {/* Step 1: Phone */}
        {step === 1 && (
          <form onSubmit={handleSendCode}>
            <div style={styles.inputWrapper}>
              <FaPhone style={styles.inputIcon} />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                dir="ltr"
                style={styles.input}
                className="login-input"
              />
            </div>
            <button type="submit" disabled={loading} style={styles.button} className="login-btn-submit">
              {loading ? 'در حال ارسال...' : 'ارسال کد'}
            </button>
          </form>
        )}

        {/* Step 2: OTP Code */}
        {step === 2 && (
          <form onSubmit={handleVerifyCode}>
            <div style={styles.inputWrapper}>
              <FaKey style={styles.inputIcon} />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="کد ۶ رقمی"
                dir="ltr"
                maxLength={6}
                style={styles.input}
                className="login-input"
              />
            </div>
            <button type="submit" disabled={loading} style={styles.button} className="login-btn-submit">
              {loading ? 'در حال بررسی...' : 'تأیید کد'}
            </button>
            <button type="button" onClick={() => setStep(1)} style={styles.linkBtn}>
              تغییر شماره موبایل
            </button>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <form onSubmit={handleSetPassword}>
            <div style={styles.inputWrapper}>
              <FaLock style={styles.inputIcon} />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="رمز عبور جدید"
                dir="ltr"
                style={styles.input}
                className="login-input"
              />
            </div>
            <button type="submit" disabled={loading} style={styles.button} className="login-btn-submit">
              {loading ? 'در حال ذخیره...' : 'تغییر رمز عبور'}
            </button>
          </form>
        )}

      </motion.div>
    </div>
  );
}

// Reusing Login styles for consistency
const styles = {
  pageContainer: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '100px 24px 60px', backgroundColor: '#0A0415', position: 'relative', overflow: 'hidden',
    fontFamily: 'Vazirmatn, sans-serif',
  },
  glow1: { position: 'absolute', top: '10%', right: '15%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' },
  glow2: { position: 'absolute', bottom: '10%', left: '10%', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.3) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none' },

  card: {
    maxWidth: '440px', width: '100%', padding: '44px 36px 36px',
    background: 'rgba(20, 12, 40, 0.95)', borderRadius: '28px',
    border: '1px solid rgba(168,85,247,0.2)',
    boxShadow: '0 30px 80px rgba(0,0,0,0.5), 0 0 60px rgba(124,58,237,0.15)',
    position: 'relative', zIndex: 2, overflow: 'hidden',
  },
  topBar: { position: 'absolute', top: 0, left: '30%', right: '30%', height: '3px', background: 'linear-gradient(90deg, transparent, #A78BFA, transparent)', borderRadius: '0 0 10px 10px' },
  backLink: { display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.5)', textDecoration: 'none', fontSize: '14px', fontWeight: '500', marginBottom: '24px', padding: '8px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', transition: 'all 0.3s' },
  backIcon: { fontSize: '14px' },

  header: { textAlign: 'center', marginBottom: '32px' },
  iconWrapper: { width: '80px', height: '80px', borderRadius: '24px', background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 12px 40px rgba(45,21,64,0.6)', border: '1px solid rgba(168,85,247,0.3)', position: 'relative' },
  iconGlow: { position: 'absolute', inset: '-4px', borderRadius: '28px', background: 'linear-gradient(135deg, #A78BFA, #7C3AED)', opacity: 0.35, filter: 'blur(10px)', zIndex: -1 },
  icon: { fontSize: '32px', color: '#FFFFFF' },
  title: { fontSize: '26px', fontWeight: '800', color: '#FFFFFF', marginBottom: '8px', letterSpacing: '-0.5px' },
  subtitle: { fontSize: '14px', color: 'rgba(255,255,255,0.5)', fontWeight: '500' },

  inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center', marginBottom: '16px' },
  inputIcon: { position: 'absolute', right: '16px', color: 'rgba(167,139,250,0.6)', fontSize: '16px', pointerEvents: 'none', zIndex: 1 },
  input: { width: '100%', padding: '16px 48px', background: 'rgba(10,4,21,0.6)', border: '1.5px solid rgba(168,85,247,0.15)', borderRadius: '14px', fontSize: '15px', color: '#FFFFFF', outline: 'none', boxSizing: 'border-box' },

  button: { width: '100%', padding: '16px', background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)', color: '#FFFFFF', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '14px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 8px 30px rgba(45,21,64,0.4)', fontFamily: 'Vazirmatn, sans-serif', marginTop: '8px' },
  linkBtn: { width: '100%', background: 'none', border: 'none', color: '#A78BFA', cursor: 'pointer', fontSize: '13px', marginTop: '16px', fontFamily: 'Vazirmatn, sans-serif' },
};
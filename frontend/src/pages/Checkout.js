// src/pages/Checkout.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  FaArrowRight, FaArrowLeft, FaLock, FaCreditCard,
  FaCheckCircle, FaShoppingBag, FaUser, FaPhone,
  FaEnvelope, FaClipboardList
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import PaymentService from '../services/paymentService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function Checkout() {
  const navigate = useNavigate();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        full_name: user.full_name || '',
        phone: user.phone || '',
        email: user.email || '',
      }));
    }
  }, [isAuthenticated, user]);

  if (cartItems.length === 0) {
    return (
      <>
        <Navbar />
        <div style={styles.container}>
          <div style={styles.emptyCard}>
            <FaShoppingBag style={styles.emptyIcon} />
            <h2 style={styles.emptyTitle}>سبد خرید خالی است</h2>
            <p style={styles.emptyDesc}>برای تسویه حساب ابتدا دوره‌ای را به سبد خرید اضافه کنید</p>
            <Link to="/packages" style={styles.emptyBtn} className="ck-empty-btn">
              مشاهده دوره‌ها
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const totalPrice = getTotalPrice();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.full_name) {
        toast.error('لطفاً نام و نام خانوادگی را وارد کنید');
        return;
      }
      if (!formData.phone) {
        toast.error('لطفاً شماره موبایل را وارد کنید');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const packageIds = cartItems.map(item => item.id);
      const result = await PaymentService.initiatePayment(
        packageIds,
        totalPrice,
        formData
      );

      if (result.payment_url) {
        window.location.href = result.payment_url;
      } else {
        toast.error(result.error || 'خطا در شروع پرداخت');
      }
    } catch (error) {
      toast.error(error?.error || 'خطا در پرداخت');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div style={styles.pageContainer}>
        <div style={styles.container}>
          {/* ===== Header ===== */}
          <div style={styles.header}>
            <Link to="/cart" style={styles.backLink} className="ck-back-link">
              <FaArrowLeft style={styles.backIcon} />
              بازگشت به سبد خرید
            </Link>
            <h1 style={styles.title} className="ck-title">تسویه حساب</h1>
            <p style={styles.subtitle}>اطلاعات خود را تکمیل کنید</p>
          </div>

          {/* ===== Steps ===== */}
          <div style={styles.steps} className="ck-steps">
            <div style={{...styles.step, ...(step >= 1 ? styles.stepActive : {})}} className="ck-step">
              <span style={styles.stepNumber} className={step >= 1 ? 'ck-step-number ck-step-number-active' : 'ck-step-number'}>1</span>
              <span style={styles.stepLabel}>اطلاعات</span>
            </div>
            <div style={styles.stepLine} />
            <div style={{...styles.step, ...(step >= 2 ? styles.stepActive : {})}} className="ck-step">
              <span style={styles.stepNumber} className={step >= 2 ? 'ck-step-number ck-step-number-active' : 'ck-step-number'}>2</span>
              <span style={styles.stepLabel}>پرداخت</span>
            </div>
            <div style={styles.stepLine} />
            <div style={{...styles.step, ...(step >= 3 ? styles.stepActive : {})}} className="ck-step">
              <span style={styles.stepNumber} className={step >= 3 ? 'ck-step-number ck-step-number-active' : 'ck-step-number'}>3</span>
              <span style={styles.stepLabel}>تایید</span>
            </div>
          </div>

          {/* ===== Content ===== */}
          <div style={styles.content} className="ck-content">
            {/* ===== Step 1: Info ===== */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                style={styles.stepContent}
              >
                <h2 style={styles.sectionTitle}>
                  <FaUser style={styles.sectionIcon} />
                  اطلاعات شخصی
                </h2>

                <div style={styles.form}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>نام و نام خانوادگی *</label>
                    <div style={styles.inputWrapper}>
                      <FaUser style={styles.inputIcon} />
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        style={styles.input}
                        className="ck-input"
                        placeholder="نام و نام خانوادگی"
                      />
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>شماره موبایل *</label>
                    <div style={styles.inputWrapper}>
                      <FaPhone style={styles.inputIcon} />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        style={styles.input}
                        className="ck-input"
                        placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>ایمیل</label>
                    <div style={styles.inputWrapper}>
                      <FaEnvelope style={styles.inputIcon} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        style={styles.input}
                        className="ck-input"
                        placeholder="example@email.com"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>آدرس</label>
                    <div style={styles.inputWrapper}>
                      <FaClipboardList style={styles.inputIcon} />
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        style={styles.textarea}
                        className="ck-textarea"
                        placeholder="آدرس خود را وارد کنید..."
                        rows="3"
                      />
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>توضیحات (اختیاری)</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      style={styles.textarea}
                      className="ck-textarea"
                      placeholder="توضیحات اضافی..."
                      rows="2"
                    />
                  </div>
                </div>

                <button onClick={handleNext} style={styles.nextBtn} className="ck-next-btn">
                  ادامه
                  <FaArrowRight style={styles.nextIcon} />
                </button>
              </motion.div>
            )}

            {/* ===== Step 2: Payment ===== */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                style={styles.stepContent}
              >
                <h2 style={styles.sectionTitle}>
                  <FaCreditCard style={styles.sectionIcon} />
                  انتخاب روش پرداخت
                </h2>

                <div style={styles.orderSummary}>
                  <h3 style={styles.summaryTitle}>📋 خلاصه سفارش</h3>
                  {cartItems.map((item) => (
                    <div key={item.id} style={styles.orderItem}>
                      <span style={styles.orderItemTitle}>{item.title}</span>
                      <span style={styles.orderItemPrice}>
                        {item.is_free ? '🎁 رایگان' :
                          `${(item.discounted_price || item.price)?.toLocaleString()} تومان`}
                      </span>
                    </div>
                  ))}
                  <div style={styles.orderTotal}>
                    <span style={styles.orderTotalLabel}>جمع کل:</span>
                    <span style={styles.orderTotalPrice}>{totalPrice.toLocaleString()} تومان</span>
                  </div>
                </div>

                <div style={styles.paymentMethods}>
                  <div style={styles.paymentMethod} className="ck-payment-method">
                    <input
                      type="radio"
                      name="payment"
                      id="zarinpal"
                      defaultChecked
                      style={styles.radio}
                    />
                    <label htmlFor="zarinpal" style={styles.paymentLabel}>
                      <span style={styles.paymentIcon}>💰</span>
                      <span style={styles.paymentName}>زرین‌پال</span>
                      <span style={styles.paymentDesc}>پرداخت امن با زرین‌پال</span>
                    </label>
                  </div>

                  <div style={styles.paymentMethod} className="ck-payment-method">
                    <input
                      type="radio"
                      name="payment"
                      id="wallet"
                      style={styles.radio}
                    />
                    <label htmlFor="wallet" style={styles.paymentLabel}>
                      <span style={styles.paymentIcon}>💳</span>
                      <span style={styles.paymentName}>کیف پول</span>
                      <span style={styles.paymentDesc}>استفاده از اعتبار کیف پول</span>
                    </label>
                  </div>
                </div>

                <div style={styles.paymentActions} className="ck-payment-actions">
                  <button onClick={handleBack} style={styles.backBtn} className="ck-back-btn-step">
                    <FaArrowLeft style={styles.backBtnIcon} />
                    بازگشت
                  </button>
                  <button onClick={handlePayment} style={styles.payBtn} className="ck-pay-btn" disabled={loading}>
                    <FaLock style={styles.payIcon} />
                    {loading ? 'در حال پردازش...' : `پرداخت ${totalPrice.toLocaleString()} تومان`}
                  </button>
                </div>
              </motion.div>
            )}

            {/* ===== Step 3: Confirm ===== */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={styles.stepContent}
              >
                <div style={styles.confirm}>
                  <FaCheckCircle style={styles.confirmIcon} />
                  <h2 style={styles.confirmTitle}>پرداخت موفقیت‌آمیز بود! 🎉</h2>
                  <p style={styles.confirmDesc}>
                    سفارش شما با موفقیت ثبت شد. لینک دوره‌ها به ایمیل شما ارسال خواهد شد.
                  </p>
                  <div style={styles.confirmDetails}>
                    <p><strong>شماره سفارش:</strong> #ORD-{Date.now().toString().slice(-8)}</p>
                    <p><strong>مبلغ پرداختی:</strong> {totalPrice.toLocaleString()} تومان</p>
                    <p><strong>تعداد دوره:</strong> {cartItems.length} دوره</p>
                  </div>
                  <Link to="/my-packages" style={styles.confirmBtn} className="ck-confirm-btn">
                    مشاهده دوره‌های من
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

// ===== Styles =====
const styles = {
  pageContainer: {
    minHeight: '100vh',
    background: '#FFFFFF',
    padding: '100px 0 60px',
    fontFamily: 'Vazirmatn, sans-serif',
  },
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '0 24px',
  },
  header: { marginBottom: '32px' },

  // ✅ Back Link
  backLink: {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    color: 'rgba(26,26,46,0.5)', textDecoration: 'none',
    fontSize: '14px', fontWeight: '600',
    marginBottom: '16px',
    padding: '8px 14px', borderRadius: '10px',
    transition: 'color 0.3s ease, background 0.3s ease',
    background: 'rgba(124,58,237,0.04)',
    border: '1px solid rgba(124,58,237,0.06)',
  },
  backIcon: { fontSize: '14px' },

  title: {
    fontSize: 'clamp(28px, 4vw, 36px)',
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: '6px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '15px',
    color: 'rgba(26,26,46,0.5)',
  },

  // ===== Steps =====
  steps: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '32px',
    gap: '8px',
  },
  step: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '50px',
    background: '#FAFAFC',
    border: '1px solid rgba(124,58,237,0.08)',
    color: 'rgba(26,26,46,0.4)',
    transition: 'all 0.3s ease',
  },
  stepNumber: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(124,58,237,0.08)',
    color: '#7C3AED',
    fontSize: '12px',
    fontWeight: '800',
    transition: 'all 0.3s ease',
  },
  stepActive: {
    background: '#F5F3FF',
    borderColor: 'rgba(124,58,237,0.2)',
    color: '#7C3AED',
    fontWeight: '700',
  },
  stepLabel: { fontSize: '13px', fontWeight: '600' },
  stepLine: { width: '40px', height: '2px', background: 'rgba(124,58,237,0.1)', borderRadius: '10px' },

  content: {
    background: '#FFFFFF',
    borderRadius: '24px',
    padding: '36px 32px',
    boxShadow: '0 4px 24px rgba(124,58,237,0.08)',
    border: '1px solid rgba(124,58,237,0.08)',
  },
  stepContent: { display: 'flex', flexDirection: 'column', gap: '24px' },

  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '18px',
    fontWeight: '800',
    color: '#1A1A2E',
  },
  sectionIcon: { fontSize: '20px', color: '#7C3AED' },

  form: { display: 'flex', flexDirection: 'column', gap: '18px' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '14px', fontWeight: '600', color: 'rgba(26,26,46,0.7)' },
  inputWrapper: { position: 'relative' },
  inputIcon: {
    position: 'absolute',
    right: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'rgba(167,139,250,0.6)',
    fontSize: '16px',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '14px 46px 14px 16px',
    background: '#FAFAFC',
    border: '1.5px solid rgba(124,58,237,0.1)',
    borderRadius: '12px',
    fontSize: '14px',
    color: '#1A1A2E',
    fontFamily: 'Vazirmatn, sans-serif',
    outline: 'none',
    transition: 'border-color 0.3s ease, background 0.3s ease',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '14px 16px',
    background: '#FAFAFC',
    border: '1.5px solid rgba(124,58,237,0.1)',
    borderRadius: '12px',
    fontSize: '14px',
    color: '#1A1A2E',
    fontFamily: 'Vazirmatn, sans-serif',
    resize: 'vertical',
    outline: 'none',
    transition: 'border-color 0.3s ease, background 0.3s ease',
    boxSizing: 'border-box',
  },

  // ✅ Next Button - تیره
  nextBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
    color: 'white',
    border: '1px solid rgba(168,85,247,0.2)',
    borderRadius: '14px',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 20px rgba(45,21,64,0.35)',
    fontFamily: 'Vazirmatn, sans-serif',
  },
  nextIcon: { fontSize: '16px' },

  // ===== Order Summary =====
  orderSummary: {
    padding: '20px 22px',
    background: '#FAFAFC',
    borderRadius: '16px',
    border: '1px solid rgba(124,58,237,0.08)',
  },
  summaryTitle: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: '14px',
  },
  orderItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid rgba(124,58,237,0.06)',
    fontSize: '14px',
    color: 'rgba(26,26,46,0.7)',
    gap: '12px',
  },
  orderItemTitle: { flex: 1, wordBreak: 'break-word', fontWeight: '500' },
  orderItemPrice: { fontWeight: '700', color: '#1A1A2E', whiteSpace: 'nowrap' },
  orderTotal: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '14px',
    marginTop: '8px',
    borderTop: '2px solid rgba(124,58,237,0.1)',
  },
  orderTotalLabel: { fontSize: '16px', fontWeight: '800', color: '#1A1A2E' },
  orderTotalPrice: { fontSize: '18px', fontWeight: '800', color: '#7C3AED' },

  // ===== Payment Methods =====
  paymentMethods: { display: 'flex', flexDirection: 'column', gap: '12px' },
  paymentMethod: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 18px',
    background: '#FAFAFC',
    borderRadius: '14px',
    border: '1.5px solid rgba(124,58,237,0.1)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  radio: {
    marginLeft: '14px',
    accentColor: '#7C3AED',
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  paymentLabel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    flexWrap: 'wrap',
  },
  paymentIcon: { fontSize: '24px' },
  paymentName: { fontSize: '14px', fontWeight: '700', color: '#1A1A2E' },
  paymentDesc: { fontSize: '12px', color: 'rgba(26,26,46,0.4)', marginRight: 'auto' },

  paymentActions: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  backBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '14px 24px',
    background: '#F5F3FF',
    border: '1px solid rgba(124,58,237,0.15)',
    borderRadius: '12px',
    color: 'rgba(26,26,46,0.6)',
    cursor: 'pointer', fontSize: '14px', fontWeight: '700',
    fontFamily: 'Vazirmatn, sans-serif',
    transition: 'all 0.3s ease',
  },
  backBtnIcon: { fontSize: '14px' },

  // ✅ Pay Button - تیره
  payBtn: {
    flex: 1,
    minWidth: '180px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    padding: '16px',
    background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
    color: 'white',
    border: '1px solid rgba(168,85,247,0.2)',
    borderRadius: '14px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 20px rgba(45,21,64,0.35)',
    fontFamily: 'Vazirmatn, sans-serif',
  },
  payIcon: { fontSize: '14px' },

  // ===== Confirm =====
  confirm: { textAlign: 'center', padding: '40px 20px' },
  confirmIcon: { fontSize: '64px', color: '#10B981', marginBottom: '16px' },
  confirmTitle: { fontSize: '24px', fontWeight: '800', color: '#1A1A2E', marginBottom: '10px' },
  confirmDesc: { fontSize: '15px', color: 'rgba(26,26,46,0.5)', marginBottom: '20px', lineHeight: '1.7' },
  confirmDetails: {
    textAlign: 'right',
    padding: '18px 22px',
    background: '#FAFAFC',
    borderRadius: '14px',
    marginBottom: '20px',
    fontSize: '14px',
    color: 'rgba(26,26,46,0.7)',
    border: '1px solid rgba(124,58,237,0.08)',
    display: 'flex', flexDirection: 'column', gap: '8px',
  },
  confirmBtn: {
    display: 'inline-block',
    padding: '14px 36px',
    background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
    color: 'white',
    borderRadius: '50px',
    textDecoration: 'none',
    fontWeight: '700',
    fontSize: '14px',
    boxShadow: '0 8px 24px rgba(45,21,64,0.35)',
    border: '1px solid rgba(168,85,247,0.2)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },

  // ===== Empty =====
  emptyCard: {
    textAlign: 'center',
    padding: '80px 20px',
    background: '#FFFFFF',
    borderRadius: '20px',
    boxShadow: '0 4px 24px rgba(124,58,237,0.08)',
    border: '1px solid rgba(124,58,237,0.08)',
    maxWidth: '520px',
    margin: '40px auto 0',
  },
  emptyIcon: { fontSize: '48px', marginBottom: '16px', color: '#7C3AED' },
  emptyTitle: { fontSize: '20px', fontWeight: '800', color: '#1A1A2E', marginBottom: '10px' },
  emptyDesc: { fontSize: '15px', color: 'rgba(26,26,46,0.5)', marginBottom: '24px', lineHeight: '1.7' },
  emptyBtn: {
    display: 'inline-block',
    padding: '14px 32px',
    background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
    color: '#FFFFFF',
    borderRadius: '50px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '700',
    boxShadow: '0 4px 16px rgba(45,21,64,0.35)',
    border: '1px solid rgba(168,85,247,0.2)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },
};

// ===== CSS =====
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  /* ===== Back Link Hover ===== */
  .ck-back-link:hover {
    color: #7C3AED !important;
    background: rgba(124,58,237,0.08) !important;
    border-color: rgba(124,58,237,0.2) !important;
  }

  /* ===== Input Focus ===== */
  .ck-input:focus,
  .ck-textarea:focus {
    border-color: rgba(124,58,237,0.4) !important;
    background: #FFFFFF !important;
    box-shadow: 0 0 0 4px rgba(124,58,237,0.06) !important;
  }

  /* ===== Next Button Hover ===== */
  .ck-next-btn:hover {
    background: linear-gradient(135deg, #3D1E57 0%, #2D1540 100%) !important;
    box-shadow: 0 8px 24px rgba(45,21,64,0.5) !important;
    border-color: rgba(168,85,247,0.5) !important;
    transform: translateY(-2px);
  }

  /* ===== Payment Method Hover ===== */
  .ck-payment-method:hover {
    background: #F5F3FF !important;
    border-color: rgba(124,58,237,0.3) !important;
  }

  /* ===== Back Step Button Hover ===== */
  .ck-back-btn-step:hover {
    background: linear-gradient(135deg, #2D1540 0%, #1A0828 100%) !important;
    color: #FFFFFF !important;
    border-color: rgba(168,85,247,0.5) !important;
    transform: translateY(-2px);
  }

  /* ===== Pay Button Hover ===== */
  .ck-pay-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, #3D1E57 0%, #2D1540 100%) !important;
    box-shadow: 0 8px 24px rgba(45,21,64,0.5) !important;
    border-color: rgba(168,85,247,0.5) !important;
    transform: translateY(-2px);
  }
  .ck-pay-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* ===== Confirm Button Hover ===== */
  .ck-confirm-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(45,21,64,0.5) !important;
    border-color: rgba(168,85,247,0.5) !important;
    background: linear-gradient(135deg, #3D1E57 0%, #2D1540 100%) !important;
  }

  /* ===== Empty Button Hover ===== */
  .ck-empty-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(45,21,64,0.5) !important;
    border-color: rgba(168,85,247,0.5) !important;
    background: linear-gradient(135deg, #3D1E57 0%, #2D1540 100%) !important;
  }

  /* ===== Step Number Active ===== */
  .ck-step-number-active {
    background: linear-gradient(135deg, #2D1540 0%, #1A0828 100%) !important;
    color: #FFFFFF !important;
    border: 1px solid rgba(168,85,247,0.3);
  }

  /* ===== Responsive ===== */
  @media (max-width: 640px) {
    .ck-content {
      padding: 26px 20px !important;
      border-radius: 20px !important;
    }
    .ck-title {
      font-size: 24px !important;
    }
    .ck-steps {
      flex-wrap: wrap !important;
      gap: 6px !important;
    }
    .ck-step {
      padding: 6px 12px !important;
      font-size: 12px !important;
    }
    .ck-step-number {
      width: 24px !important;
      height: 24px !important;
      font-size: 11px !important;
    }
    .ck-payment-actions {
      flex-direction: column !important;
    }
    .ck-back-btn-step,
    .ck-pay-btn {
      width: 100% !important;
    }
  }

  @media (max-width: 480px) {
    .ck-content {
      padding: 22px 16px !important;
      border-radius: 18px !important;
    }
    .ck-title { font-size: 22px !important; }
    .ck-back-link { font-size: 13px !important; }
  }
`;
document.head.appendChild(styleSheet);

export default Checkout;
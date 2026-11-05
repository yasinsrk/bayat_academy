// src/pages/PaymentVerify.js
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import PaymentService from '../services/paymentService';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function PaymentVerify() {
  const { clearCart } = useCart();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      const authority = searchParams.get('Authority');
      const statusParam = searchParams.get('Status');

      if (!authority) {
        setStatus('failed');
        setMessage('کد تراکنش یافت نشد');
        return;
      }

      try {
        const result = await PaymentService.verifyPayment(authority, statusParam);

        if (result.status === 'success') {
          setStatus('success');
          setMessage('پرداخت با موفقیت انجام شد');
          clearCart();
          toast.success('پرداخت موفق!');
        } else if (result.status === 'cancelled') {
          setStatus('failed');
          setMessage('پرداخت توسط شما لغو شد');
        } else {
          setStatus('failed');
          setMessage(result.message || 'پرداخت ناموفق بود');
        }
      } catch (error) {
        setStatus('failed');
        setMessage(error?.message || 'خطا در تایید پرداخت');
      }
    };

    verify();
  }, [searchParams]);

  return (
    <>
      <Navbar />

      <div style={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          style={styles.card}
          className="pv-card"
        >
          {status === 'loading' && (
            <>
              <div style={styles.iconWrapperLoading}>
                <FaSpinner style={styles.loadingIcon} />
              </div>
              <h2 style={styles.title} className="pv-title">در حال تایید پرداخت...</h2>
              <p style={styles.desc}>لطفاً چند لحظه صبر کنید</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div style={styles.iconWrapperSuccess}>
                <FaCheckCircle style={styles.iconSuccess} />
              </div>
              <h2 style={styles.title} className="pv-title">پرداخت موفق</h2>
              <p style={styles.desc}>{message}</p>
              <button
                onClick={() => navigate('/my-packages')}
                style={styles.btnSuccess}
                className="pv-btn"
              >
                مشاهده دوره‌های من
              </button>
            </>
          )}

          {status === 'failed' && (
            <>
              <div style={styles.iconWrapperFailed}>
                <FaTimesCircle style={styles.iconFailed} />
              </div>
              <h2 style={styles.title} className="pv-title">پرداخت ناموفق</h2>
              <p style={styles.desc}>{message}</p>
              <button
                onClick={() => navigate('/checkout')}
                style={styles.btn}
                className="pv-btn"
              >
                تلاش مجدد
              </button>
            </>
          )}
        </motion.div>
      </div>

      <Footer />
    </>
  );
}

const styles = {
  container: {
    minHeight: '80vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '100px 24px 60px',
    background: '#FFFFFF',
    fontFamily: 'Vazirmatn, sans-serif',
  },
  card: {
    maxWidth: '480px',
    width: '100%',
    padding: '48px 36px',
    background: '#FFFFFF',
    borderRadius: '24px',
    textAlign: 'center',
    boxShadow: '0 4px 24px rgba(124,58,237,0.08)',
    border: '1px solid rgba(124,58,237,0.08)',
  },

  // ===== Loading =====
  iconWrapperLoading: {
    width: '88px',
    height: '88px',
    borderRadius: '24px',
    background: '#F5F3FF',
    border: '1px solid rgba(124,58,237,0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  loadingIcon: {
    fontSize: '40px',
    color: '#7C3AED',
    animation: 'spin 1s linear infinite',
  },

  // ===== Success =====
  iconWrapperSuccess: {
    width: '88px',
    height: '88px',
    borderRadius: '24px',
    background: 'rgba(16,185,129,0.1)',
    border: '1px solid rgba(16,185,129,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  iconSuccess: { fontSize: '44px', color: '#10B981' },

  // ===== Failed =====
  iconWrapperFailed: {
    width: '88px',
    height: '88px',
    borderRadius: '24px',
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  iconFailed: { fontSize: '44px', color: '#EF4444' },

  // ===== Text =====
  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#1A1A2E',
    marginBottom: '10px',
    letterSpacing: '-0.5px',
  },
  desc: {
    fontSize: '15px',
    color: 'rgba(26,26,46,0.5)',
    marginBottom: '28px',
    lineHeight: '1.7',
  },

  // ===== Buttons =====
  // ✅ دکمه تیره
  btn: {
    padding: '14px 36px',
    background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
    color: 'white',
    border: '1px solid rgba(168,85,247,0.2)',
    borderRadius: '50px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'Vazirmatn, sans-serif',
    boxShadow: '0 8px 24px rgba(45,21,64,0.35)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },
  // ✅ دکمه موفق (سبز)
  btnSuccess: {
    padding: '14px 36px',
    background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'Vazirmatn, sans-serif',
    boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },
};

// ===== CSS =====
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* ===== Button Hover ===== */
  .pv-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(45,21,64,0.5);
  }

  /* ===== Responsive ===== */
  @media (max-width: 480px) {
    .pv-card {
      padding: 36px 24px !important;
      border-radius: 20px !important;
    }
    .pv-title {
      font-size: 20px !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default PaymentVerify;
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LoadingPage = ({ text = "در حال بارگذاری...", overlay = true }) => {
  const [dots, setDots] = useState('');

  // انیمیشن نقطه‌ها
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        style={styles.overlay}
      >
        {/* ===== کادر لودینگ ===== */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 10 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={styles.card}
        >
          {/* ===== نقطه‌های تزئینی گوشه کادر ===== */}
          <div style={styles.dotsCornerTop}>
            {[...Array(6)].map((_, i) => (
              <span key={i} style={{ ...styles.dot, opacity: 0.3 + (i * 0.12) }} />
            ))}
          </div>
          <div style={styles.dotsCornerBottom}>
            {[...Array(6)].map((_, i) => (
              <span key={i} style={{ ...styles.dot, opacity: 0.3 + (i * 0.12) }} />
            ))}
          </div>

          {/* ===== درخشش‌های داخل کادر ===== */}
          <div style={styles.cardGlow1}></div>
          <div style={styles.cardGlow2}></div>

          {/* ===== محتوا ===== */}
          <div style={styles.content}>
            {/* لوگو */}
            <div style={styles.logoWrapper}>
              <img
                src="/logo.png"
                alt="آکادمی بیات"
                style={styles.logoImage}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>

            {/* اسپینر */}
            <div style={styles.loaderWrapper}>
              <div style={styles.spinnerOuter}></div>
              <div style={styles.spinnerInner}></div>
              <div style={styles.spinnerCenter}></div>
            </div>

            {/* متن */}
            <h3 style={styles.loadingText}>
              {text}<span style={styles.dots}>{dots}</span>
            </h3>
            <p style={styles.subText}>آکادمی آموزش تخصصی میثم بیات</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const styles = {
  // ===== پس‌زمینه نیمه‌شفاف =====
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 4, 21, 0.5)', // نیمه‌شفاف تیره
    backdropFilter: 'blur(6px)',             // بلور پشت
    WebkitBackdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9998,
    fontFamily: 'Vazirmatn, sans-serif',
    padding: '20px',
  },

  // ===== کادر اصلی =====
  card: {
    position: 'relative',
    width: '100%',
    maxWidth: '340px',
    padding: '36px 28px 28px',
    borderRadius: '24px',
    backgroundColor: '#0F0820',
    backgroundImage: `
      radial-gradient(circle at 20% 0%, rgba(168, 85, 247, 0.15) 0%, transparent 60%),
      radial-gradient(circle at 80% 100%, rgba(236, 72, 153, 0.12) 0%, transparent 60%)
    `,
    border: '1.5px solid transparent',
    backgroundOrigin: 'border-box',
    backgroundClip: 'padding-box, border-box',
    // گرادینت برای بوردر
    boxShadow: `
      0 24px 60px rgba(0, 0, 0, 0.5),
      0 0 60px rgba(124, 58, 237, 0.25),
      inset 0 1px 0 rgba(255, 255, 255, 0.05)
    `,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  // ===== نقطه‌های تزئینی گوشه‌ها =====
  dotsCornerTop: {
    position: 'absolute',
    top: '14px',
    right: '16px',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '5px',
    pointerEvents: 'none',
  },
  dotsCornerBottom: {
    position: 'absolute',
    bottom: '14px',
    left: '16px',
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '5px',
    pointerEvents: 'none',
  },
  dot: {
    width: '3px',
    height: '3px',
    borderRadius: '50%',
    background: '#A78BFA',
  },

  // ===== درخشش‌های داخل =====
  cardGlow1: {
    position: 'absolute',
    top: '-50px',
    right: '-50px',
    width: '150px',
    height: '150px',
    background: 'radial-gradient(circle, rgba(168,85,247,0.35) 0%, transparent 70%)',
    filter: 'blur(30px)',
    pointerEvents: 'none',
  },
  cardGlow2: {
    position: 'absolute',
    bottom: '-50px',
    left: '-50px',
    width: '150px',
    height: '150px',
    background: 'radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%)',
    filter: 'blur(30px)',
    pointerEvents: 'none',
  },

  // ===== محتوا =====
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '18px',
    position: 'relative',
    zIndex: 2,
    width: '100%',
  },

  // ===== لوگو =====
  logoWrapper: {
    width: '60px',
    height: '60px',
    borderRadius: '18px',
    background: '#FFFFFF',
    padding: '8px',
    boxShadow: '0 8px 30px rgba(124,58,237,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },

  // ===== اسپینر =====
  loaderWrapper: {
    position: 'relative',
    width: '56px',
    height: '56px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '4px',
  },
  spinnerOuter: {
    position: 'absolute',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    border: '3px solid transparent',
    borderTopColor: '#A855F7',
    borderRightColor: '#EC4899',
    animation: 'loadingSpin 1s linear infinite',
  },
  spinnerInner: {
    position: 'absolute',
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    border: '3px solid transparent',
    borderBottomColor: '#7C3AED',
    borderLeftColor: '#EC4899',
    animation: 'loadingSpinReverse 1.4s linear infinite',
  },
  spinnerCenter: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #A855F7, #EC4899)',
    boxShadow: '0 0 16px rgba(168,85,247,0.9)',
    animation: 'loadingPulse 1.4s ease-in-out infinite',
  },

  // ===== متن‌ها =====
  loadingText: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#FFFFFF',
    margin: 0,
    letterSpacing: '-0.3px',
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    textAlign: 'center',
  },
  dots: {
    color: '#A78BFA',
    fontWeight: '800',
    minWidth: '18px',
    textAlign: 'left',
    display: 'inline-block',
  },
  subText: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.35)',
    margin: 0,
    fontWeight: '500',
    textAlign: 'center',
  },
};

// ===== انیمیشن‌ها =====
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes loadingSpin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes loadingSpinReverse {
    0% { transform: rotate(360deg); }
    100% { transform: rotate(0deg); }
  }
  @keyframes loadingPulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.35); opacity: 0.6; }
  }
`;
document.head.appendChild(styleSheet);

export default LoadingPage;
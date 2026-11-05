import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaInstagram, FaTelegram, FaWhatsapp, FaYoutube,
  FaEnvelope, FaPhone, FaHeadphones,
  FaGraduationCap, FaUserTie, FaComments, FaVideo,
  FaChevronUp
} from 'react-icons/fa';

function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer style={styles.footer}>
      <div style={styles.glowTop}></div>

      <div style={styles.container} className="footer-container">
        {/* Logo */}
        <div style={styles.logoSection}>
          <Link to="/" style={styles.logoLink}>
            <img
              src="/logo.png"
              alt="آکادمی بیات"
              style={styles.logoImg}
              className="footer-logo-img"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div style={styles.logoTexts}>
              <span style={styles.logoMain} className="footer-logo-main">میثم بیات</span>
              <span style={styles.logoSub} className="footer-logo-sub">آکادمی آموزش تخصصی</span>
            </div>
          </Link>
        </div>

        {/* 3 columns */}
        <div style={styles.columns} className="footer-columns">
          <div style={styles.column}>
            <h4 style={styles.colTitle}>خدمات ما</h4>
            <ul style={styles.list}>
              <li style={styles.listItem}>
                <FaGraduationCap style={styles.listIcon}/>
                <span>دوره‌های آموزشی</span>
              </li>
              <li style={styles.listItem}>
                <FaUserTie style={styles.listIcon}/>
                <span>مشاوره تخصصی</span>
              </li>
              <li style={styles.listItem}>
                <FaComments style={styles.listIcon}/>
                <span>پشتیبانی آنلاین</span>
              </li>
              <li style={styles.listItem}>
                <FaVideo style={styles.listIcon}/>
                <span>تولید محتوا</span>
              </li>
            </ul>
          </div>

          <div style={styles.column}>
            <h4 style={styles.colTitle}>دسترسی سریع</h4>
            <ul style={styles.list}>
              <li><Link to="/" style={styles.link} className="footer-link">صفحه اصلی</Link></li>
              <li><Link to="/packages" style={styles.link} className="footer-link">دوره‌های آموزشی</Link></li>
              <li><Link to="/about" style={styles.link} className="footer-link">درباره ما</Link></li>
            </ul>
          </div>

          <div style={styles.column}>
            <h4 style={styles.colTitle}>تماس با ما</h4>
            <ul style={styles.list}>
              <li style={styles.contactItem}>
                <FaPhone style={styles.contactIcon}/>
                <a href="tel:09191203500" style={styles.contactLink} className="footer-contact-link" dir="ltr">
                  ۰۹۱۹۱۲۰۳۵۰۰
                </a>
              </li>
              <li style={styles.contactItem}>
                <FaPhone style={styles.contactIcon}/>
                <a href="tel:02133643005" style={styles.contactLink} className="footer-contact-link" dir="ltr">
                  ۰۲۱۳۳۶۴۳۰۰۵
                </a>
              </li>
              <li style={styles.contactItem}>
                <FaEnvelope style={styles.contactIcon}/>
                <a href="mailto:bayatacademyy@gmail.com" style={styles.contactLink} className="footer-contact-link" dir="ltr">
                  bayatacademyy@gmail.com
                </a>
              </li>
              <li style={styles.contactItem}>
                <FaHeadphones style={styles.contactIcon}/>
                <span>پاسخگویی ۲۴ ساعته</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom row: back-to-top, social, enamad */}
        <div style={styles.socialBottomRow} className="social-bottom-row">

          {/* Back to top */}
          <div style={styles.scrollTopWrap} className="scroll-top-wrap">
            <button
              onClick={scrollToTop}
              style={styles.scrollTopBtn}
              className="scroll-top-btn"
              aria-label="بازگشت به بالا"
            >
              <span style={styles.scrollTopIconWrap}>
                <FaChevronUp size={14} color="#FFFFFF"/>
              </span>
              <span style={styles.scrollTopText}>
                بازگشت
                <br/>
                به بالا
              </span>
            </button>
          </div>

          {/* Social */}
          <div style={styles.socialFollowWrap} className="social-follow-wrap">
            <span style={styles.socialFollowText} className="social-follow-text">
              من را در شبکه های اجتماعی دنبال کنید
            </span>
            <div style={styles.socialFollowIcons} className="social-follow-icons">
              <a href="https://instagram.com/bayatacademyy" target="_blank" rel="noopener noreferrer" style={styles.socialCircleBtn} className="social-circle-btn" aria-label="اینستاگرام">
                <FaInstagram size={16}/>
              </a>
              <a href="https://t.me/meysamnet_ir" target="_blank" rel="noopener noreferrer" style={styles.socialCircleBtn} className="social-circle-btn" aria-label="تلگرام">
                <FaTelegram size={16}/>
              </a>
              <a href="https://wa.me/989191203500" target="_blank" rel="noopener noreferrer" style={styles.socialCircleBtn} className="social-circle-btn" aria-label="واتساپ">
                <FaWhatsapp size={16}/>
              </a>
              <a href="https://www.youtube.com/@BayatAcademyy" target="_blank" rel="noopener noreferrer" style={styles.socialCircleBtn} className="social-circle-btn" aria-label="یوتیوب">
                <FaYoutube size={16}/>
              </a>
            </div>
          </div>

          {/* Enamad */}
          <div style={styles.trustBadgesWrap} className="trust-badges-wrap">
            <div
              style={styles.trustBadge}
              className="trust-badge"
              dangerouslySetInnerHTML={{
                __html: `<a referrerpolicy='origin' target='_blank' href='https://trustseal.enamad.ir/?id=7881181&Code=uww00qhBdUjv2kCdtZrPY4st8Mz32hdr'><img referrerpolicy='origin' src='https://trustseal.enamad.ir/logo.aspx?id=7881181&Code=uww00qhBdUjv2kCdtZrPY4st8Mz32hdr' alt='' style='cursor:pointer; display:block; width:100%; height:auto;' code='uww00qhBdUjv2kCdtZrPY4st8Mz32hdr'></a>`
              }}
            />
          </div>
        </div>

        <div style={styles.divider}></div>

        <div style={styles.copyrightWrap}>
          <p style={styles.copyright} className="footer-copyright">
            © {new Date().getFullYear()} تمامی حقوق برای{' '}
            <span style={styles.copyrightBrand}>آکادمی بیات</span>{' '}
            محفوظ است.
          </p>
        </div>
      </div>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          style={styles.floatingScrollTop}
          className="floating-scroll-top"
          aria-label="بازگشت به بالا"
        >
          <FaChevronUp size={16} color="#FFFFFF"/>
        </button>
      )}
    </footer>
  );
}

const styles = {
  footer: {
    position: 'relative',
    backgroundColor: '#0D0620',
    padding: '60px 24px 30px',
    fontFamily: 'Vazirmatn, sans-serif',
    overflow: 'hidden',
  },
  glowTop: {
    position: 'absolute',
    top: '-200px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '700px',
    height: '400px',
    background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.25) 0%, transparent 70%)',
    filter: 'blur(60px)',
    pointerEvents: 'none',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 1,
  },

  logoSection: { display: 'flex', justifyContent: 'center', marginBottom: '48px' },
  logoLink: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textDecoration: 'none' },
  logoImg: { width: '60px', height: '60px', objectFit: 'contain', borderRadius: '16px', background: '#FFFFFF', padding: '6px', boxShadow: '0 8px 32px rgba(124,58,237,0.3)' },
  logoTexts: { display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.3 },
  logoMain: { fontSize: '20px', fontWeight: '800', color: '#FFFFFF', letterSpacing: '-0.3px' },
  logoSub: { fontSize: '12px', fontWeight: '500', color: '#A78BFA' },

  columns: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px', marginBottom: '40px' },
  column: { display: 'flex', flexDirection: 'column' },
  colTitle: { fontSize: '16px', fontWeight: '700', color: '#FFFFFF', marginBottom: '20px', paddingBottom: '10px' },
  list: { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' },
  listItem: { display: 'flex', alignItems: 'center', gap: '10px', color: 'rgba(255,255,255,0.55)', fontSize: '14px', fontWeight: '500' },
  listIcon: { fontSize: '14px', color: '#A78BFA', minWidth: '16px' },
  link: { color: 'rgba(255,255,255,0.55)', textDecoration: 'none', fontSize: '14px', fontWeight: '500', transition: 'all 0.3s ease', display: 'inline-block' },
  contactItem: { display: 'flex', alignItems: 'flex-start', gap: '10px', color: 'rgba(255,255,255,0.55)', fontSize: '14px', fontWeight: '500', lineHeight: '1.6' },
  contactLink: { color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'all 0.3s ease', wordBreak: 'break-all' },
  contactIcon: { fontSize: '14px', color: '#A78BFA', minWidth: '16px', marginTop: '4px' },

  socialBottomRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr 1fr',
    alignItems: 'center',
    gap: '24px',
    padding: '20px 24px',
    background: 'rgba(20, 12, 40, 0.6)',
    borderRadius: '24px',
    border: '1px solid rgba(124,58,237,0.15)',
    marginBottom: '30px',
  },

  scrollTopWrap: { display: 'flex', justifyContent: 'flex-start' },
  scrollTopBtn: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px 20px',
    background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
    border: 'none', borderRadius: '16px', cursor: 'pointer',
    fontFamily: 'Vazirmatn, sans-serif',
    boxShadow: '0 8px 24px rgba(124,58,237,0.35)',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap',
  },
  scrollTopIconWrap: {
    width: '32px', height: '32px', borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '1.5px solid rgba(255,255,255,0.3)',
    flexShrink: 0,
  },
  scrollTopText: { fontSize: '12px', fontWeight: '700', color: '#FFFFFF', lineHeight: 1.4, textAlign: 'right' },

  socialFollowWrap: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' },
  socialFollowText: { fontSize: '14px', fontWeight: '600', color: '#FFFFFF', whiteSpace: 'nowrap' },
  socialFollowIcons: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' },
  socialCircleBtn: {
    width: '44px', height: '44px', borderRadius: '50%',
    background: '#FFFFFF',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#0D0620', textDecoration: 'none',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    flexShrink: 0,
  },

  trustBadgesWrap: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' },
  trustBadge: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '8px',
    background: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
    transition: 'all 0.3s ease',
    textDecoration: 'none',
    cursor: 'pointer',
    maxWidth: '100px',
    width: '100%',
  },

  divider: { height: '1px', width: '100%', background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.3), transparent)', marginBottom: '24px' },

  copyrightWrap: { textAlign: 'center' },
  copyright: { fontSize: '13px', color: 'rgba(255,255,255,0.4)', fontWeight: '500', margin: 0, lineHeight: 1.8 },
  copyrightBrand: { color: '#A78BFA', fontWeight: '700' },

  floatingScrollTop: {
    position: 'fixed', bottom: '30px', left: '30px',
    width: '48px', height: '48px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
    border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(124,58,237,0.5)',
    zIndex: 100, transition: 'all 0.3s ease',
    animation: 'fadeInUp 0.3s ease',
  },
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes fadeInUp {
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  /* ===== Hover (desktop only) ===== */
  @media (hover: hover) {
    .footer-link:hover { color: #A78BFA !important; transform: translateX(-4px); }
    .footer-contact-link:hover { color: #A78BFA !important; }
    .social-circle-btn:hover {
      background: linear-gradient(135deg, #7C3AED, #EC4899) !important;
      color: #FFFFFF !important;
      transform: translateY(-3px);
      box-shadow: 0 8px 20px rgba(124,58,237,0.5);
    }
    .scroll-top-btn:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(124,58,237,0.5); }
    .floating-scroll-top:hover { transform: translateY(-4px) scale(1.1); box-shadow: 0 12px 32px rgba(124,58,237,0.7); }
    .trust-badge:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.25); }
  }

  /* ===== Tablet ===== */
  @media (max-width: 900px) {
    .footer-columns {
      grid-template-columns: 1fr !important;
      gap: 30px !important;
      text-align: center;
    }
    .footer-columns ul { align-items: center; }
    .footer-columns li { justify-content: center; }
  }

  /* ===== Mobile — stack everything ===== */
  @media (max-width: 768px) {
    .social-bottom-row {
      grid-template-columns: 1fr !important;
      gap: 20px !important;
      padding: 20px 16px !important;
      text-align: center;
    }
    .scroll-top-wrap { justify-content: center !important; }
    .social-follow-wrap { justify-content: center !important; flex-direction: column; gap: 12px !important; }
    .social-follow-icons { justify-content: center !important; }
    .trust-badges-wrap { justify-content: center !important; }

    .social-follow-text { font-size: 13px !important; white-space: normal !important; }

    .scroll-top-btn {
      padding: 10px 16px !important;
      gap: 10px !important;
    }
    .scroll-top-text { font-size: 11px !important; }

    /* Enamad logo smaller on mobile */
    .trust-badge { max-width: 80px !important; padding: 6px !important; }
  }

  /* ===== Small Mobile ===== */
  @media (max-width: 480px) {
    .footer-container { padding: 0 4px !important; }
    .footer-logo-img { width: 56px !important; height: 56px !important; }
    .footer-logo-main { font-size: 18px !important; }
    .footer-logo-sub { font-size: 11px !important; }
    .footer-copyright { font-size: 12px !important; padding: 0 8px; }

    .social-circle-btn { width: 42px !important; height: 42px !important; }

    .scroll-top-btn {
      padding: 8px 14px !important;
    }
    .scroll-top-icon-wrap { width: 28px !important; height: 28px !important; }

    .trust-badge { max-width: 70px !important; padding: 5px !important; }
  }

  @media (max-width: 360px) {
    .scroll-top-text { display: none !important; }
    .scroll-top-btn { padding: 10px !important; }
    .social-follow-icons { gap: 8px !important; }
    .social-circle-btn { width: 40px !important; height: 40px !important; }
  }
`;
document.head.appendChild(styleSheet);

export default Footer;
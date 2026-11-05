import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaUser, FaSignOutAlt, FaBars, FaTimes,
  FaBookOpen, FaShoppingCart, FaUserCircle,
  FaTicketAlt, FaChevronDown
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { getCartCount, openCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      await dispatch(logout(refreshToken)).unwrap();
      toast.success('با موفقیت خارج شدید');
      navigate('/login');
    } catch (error) {
      toast.error('خطا در خروج');
    }
    setIsOpen(false);
    setShowUserMenu(false);
  };

  const logoUrl = '/logo.png';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showUserMenu && !e.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showUserMenu]);

  return (
    <>
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          ...styles.navbar,
          background: scrolled ? 'rgba(255,255,255,0.98)' : '#FFFFFF',
          boxShadow: scrolled
            ? '0 4px 30px rgba(124,58,237,0.08)'
            : '0 1px 0 rgba(0,0,0,0.04)',
        }}
      >
        <div style={styles.container}>
          {/* ===== LOGO ===== */}
          <Link to="/" style={styles.logo}>
            <div style={styles.logoIconWrapper}>
              <img src={logoUrl} alt="آکادمی" style={styles.logoImage} />
            </div>
            <div style={styles.logoText}>
              <span style={styles.logoMain}>بیات</span>
              <span style={styles.logoSub}>آکادمی</span>
            </div>
          </Link>

          {/* ===== DESKTOP MENU ===== */}
          {!isMobile && (
            <div style={styles.desktopMenu}>
              <Link to="/" style={styles.navLink}>صفحه اصلی</Link>
              <Link to="/packages" style={styles.navLink}>دوره‌ها</Link>

              {isAuthenticated && (
                <>
                  <Link to="/my-packages" style={styles.navLink}>دوره‌های من</Link>
                  <Link to="/my-tickets" style={styles.navLink}>تیکت‌ها</Link>
                </>
              )}

              <Link to="/about" style={styles.navLink}>درباره ی ما</Link>

              <div style={styles.divider}></div>

              <button style={styles.iconBtn} onClick={openCart} className="icon-btn" aria-label="سبد خرید">
                <FaShoppingCart />
                {getCartCount() > 0 && (
                  <span style={styles.cartBadge}>{getCartCount()}</span>
                )}
              </button>

              {isAuthenticated ? (
                <div className="user-menu-container" style={styles.userMenuContainer}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    style={styles.userMenuBtn}
                    className="user-menu-btn"
                  >
                    <FaUserCircle style={styles.userMenuIcon} />
                    <span style={styles.userMenuName}>
                      {user?.full_name || user?.username}
                    </span>
                    <FaChevronDown style={styles.userMenuArrow} />
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        style={styles.userDropdown}
                      >
                        <Link to="/profile" style={styles.dropdownItem} className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                          <FaUser style={styles.dropdownIcon} /> حساب کاربری
                        </Link>
                        <Link to="/my-packages" style={styles.dropdownItem} className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                          <FaBookOpen style={styles.dropdownIcon} /> دوره‌های من
                        </Link>
                        <Link to="/my-tickets" style={styles.dropdownItem} className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                          <FaTicketAlt style={styles.dropdownIcon} /> تیکت‌ها
                        </Link>
                        <div style={styles.dropdownDivider}></div>
                        <button onClick={handleLogout} style={styles.dropdownLogout} className="dropdown-logout">
                          <FaSignOutAlt style={styles.dropdownIcon} /> خروج
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/login" style={styles.loginBtn} className="login-btn">ورود / ثبت نام</Link>
              )}
            </div>
          )}

          {/* ===== MOBILE ===== */}
          {isMobile && (
            <div style={styles.mobileIcons}>
              <button style={styles.iconBtn} onClick={openCart} className="icon-btn" aria-label="سبد خرید">
                <FaShoppingCart />
                {getCartCount() > 0 && (
                  <span style={styles.cartBadge}>{getCartCount()}</span>
                )}
              </button>
              <button
                style={styles.hamburger}
                className="hamburger"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="منو"
              >
                {isOpen ? <FaTimes /> : <FaBars />}
              </button>
            </div>
          )}
        </div>
      </motion.nav>

      {/* ===== MOBILE DROPDOWN ===== */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            style={styles.mobileMenu}
          >
            <Link to="/" style={styles.mobileLink} className="mobile-link" onClick={() => setIsOpen(false)}>صفحه اصلی</Link>
            <Link to="/packages" style={styles.mobileLink} className="mobile-link" onClick={() => setIsOpen(false)}>دوره‌ها</Link>

            {isAuthenticated && (
              <>
                <Link to="/my-packages" style={styles.mobileLink} className="mobile-link" onClick={() => setIsOpen(false)}>دوره‌های من</Link>
                <Link to="/my-tickets" style={styles.mobileLink} className="mobile-link" onClick={() => setIsOpen(false)}>تیکت‌ها</Link>
              </>
            )}

            <Link to="/about" style={styles.mobileLink} className="mobile-link" onClick={() => setIsOpen(false)}>درباره ی ما</Link>

            {isAuthenticated ? (
              <>
                <div style={styles.mobileDivider}></div>
                <Link to="/profile" style={styles.mobileLink} className="mobile-link" onClick={() => setIsOpen(false)}>حساب کاربری</Link>
                <button onClick={handleLogout} style={styles.mobileLogoutBtn} className="mobile-logout-btn">
                  <FaSignOutAlt /> خروج
                </button>
              </>
            ) : (
              <Link to="/login" style={styles.mobileLoginBtn} className="mobile-login-btn" onClick={() => setIsOpen(false)}>
                ورود / ثبت نام
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const styles = {
  navbar: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
    padding: '14px 0',
    transition: 'background 0.3s ease, box-shadow 0.3s ease',
    fontFamily: 'Vazirmatn, sans-serif',
  },
  container: {
    maxWidth: '1280px', margin: '0 auto', padding: '0 24px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  },

  // ===== LOGO =====
  logo: { display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' },
  logoIconWrapper: {
    width: '40px', height: '40px', borderRadius: '12px',
    overflow: 'hidden', display: 'flex', alignItems: 'center',
    justifyContent: 'center', background: '#F5F3FF',
  },
  logoImage: { width: '100%', height: '100%', objectFit: 'contain', padding: '4px' },
  logoText: { display: 'flex', flexDirection: 'column', lineHeight: 1.1 },
  logoMain: { fontSize: '15px', fontWeight: '800', color: '#1A1A2E', letterSpacing: '-0.3px' },
  logoSub: { fontSize: '11px', fontWeight: '500', color: '#7C3AED', letterSpacing: '0.5px' },

  // ===== DESKTOP MENU =====
  desktopMenu: { display: 'flex', alignItems: 'center', gap: '4px' },
  navLink: {
    color: '#1A1A2E', textDecoration: 'none', fontSize: '14px',
    fontWeight: '600', padding: '8px 16px', borderRadius: '10px',
    transition: 'background 0.3s ease, color 0.3s ease',
  },
  divider: { width: '1px', height: '24px', background: 'rgba(0,0,0,0.06)', margin: '0 8px' },

  // ===== ICON BUTTONS =====
  iconBtn: {
    position: 'relative', background: 'none', border: 'none',
    color: '#1A1A2E', fontSize: '18px', padding: '8px 12px',
    borderRadius: '10px', cursor: 'pointer',
    transition: 'background 0.3s ease, color 0.3s ease',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute', top: '2px', right: '4px',
    background: 'linear-gradient(135deg, #EC4899, #7C3AED)',
    color: '#FFFFFF', fontSize: '10px', fontWeight: '700',
    borderRadius: '50%', width: '18px', height: '18px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },

  // ===== LOGIN BUTTON (رنگ بخش خدمات ما) =====
  loginBtn: {
    padding: '10px 24px',
    borderRadius: '50px',
    background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
    color: '#FFFFFF',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '700',
    boxShadow: '0 4px 20px rgba(45,21,64,0.35)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease, background 0.3s ease',
    marginRight: '8px',
    border: '1px solid rgba(168,85,247,0.25)',
  },

  // ===== USER MENU =====
  userMenuContainer: { position: 'relative' },
  userMenuBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: '#F5F3FF', padding: '8px 14px', borderRadius: '50px',
    border: '1px solid rgba(124,58,237,0.1)', cursor: 'pointer',
    fontSize: '14px', color: '#1A1A2E',
    fontFamily: 'Vazirmatn, sans-serif', transition: 'background 0.3s ease',
  },
  userMenuIcon: { fontSize: '18px', color: '#7C3AED' },
  userMenuName: {
    fontSize: '13px', fontWeight: '600', maxWidth: '100px',
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    color: '#1A1A2E',
  },
  userMenuArrow: { fontSize: '10px', color: '#7C3AED' },
  userDropdown: {
    position: 'absolute', top: 'calc(100% + 8px)', left: '0',
    minWidth: '210px', background: '#FFFFFF', borderRadius: '14px',
    border: '1px solid rgba(0,0,0,0.06)',
    boxShadow: '0 8px 40px rgba(124,58,237,0.12)',
    padding: '6px', zIndex: 999,
  },
  dropdownItem: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 14px', borderRadius: '10px', color: '#1A1A2E',
    textDecoration: 'none', fontSize: '14px', fontWeight: '500',
    transition: 'background 0.3s ease, color 0.3s ease', cursor: 'pointer',
  },
  dropdownIcon: { fontSize: '15px', color: '#7C3AED' },
  dropdownDivider: { height: '1px', background: 'rgba(0,0,0,0.06)', margin: '4px 6px' },
  dropdownLogout: {
    display: 'flex', alignItems: 'center', gap: '10px',
    width: '100%', padding: '10px 14px', borderRadius: '10px',
    background: 'none', border: 'none', color: '#EC4899',
    fontSize: '14px', fontWeight: '500', cursor: 'pointer',
    fontFamily: 'Vazirmatn, sans-serif', transition: 'background 0.3s ease',
  },

  // ===== MOBILE =====
  mobileIcons: { display: 'flex', alignItems: 'center', gap: '4px' },
  hamburger: {
    background: '#F5F3FF', border: 'none', color: '#7C3AED',
    fontSize: '18px', padding: '8px', borderRadius: '10px',
    cursor: 'pointer', width: '40px', height: '40px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background 0.3s ease',
  },
  mobileMenu: {
    position: 'fixed', top: '76px', right: '16px', left: '16px',
    background: '#FFFFFF', padding: '16px',
    display: 'flex', flexDirection: 'column', gap: '4px',
    zIndex: 999, border: '1px solid rgba(0,0,0,0.06)',
    borderRadius: '16px', boxShadow: '0 8px 40px rgba(124,58,237,0.12)',
  },
  mobileLink: {
    color: '#1A1A2E', textDecoration: 'none', fontSize: '15px',
    fontWeight: '600', padding: '12px 14px', borderRadius: '10px',
    transition: 'background 0.3s ease, color 0.3s ease',
  },
  mobileDivider: { height: '1px', background: 'rgba(0,0,0,0.06)', margin: '4px 0' },
  mobileLogoutBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '10px', background: 'rgba(236,72,153,0.06)', color: '#EC4899',
    border: 'none', padding: '12px 14px', borderRadius: '10px',
    cursor: 'pointer', fontSize: '15px', fontWeight: '600', width: '100%',
    fontFamily: 'Vazirmatn, sans-serif', transition: 'background 0.3s ease',
  },
  mobileLoginBtn: {
    display: 'block', textAlign: 'center',
    background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
    color: '#FFFFFF', padding: '12px', borderRadius: '50px',
    textDecoration: 'none', fontSize: '15px', fontWeight: '700',
    boxShadow: '0 4px 20px rgba(45,21,64,0.35)',
    marginTop: '8px', border: '1px solid rgba(168,85,247,0.25)',
  },
};

// ===== HOVER STYLES =====
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  .nav-link:hover { color: #7C3AED !important; background: #F5F3FF; }
  .icon-btn:hover { color: #7C3AED !important; background: #F5F3FF; }
  .user-menu-btn:hover { background: #EDE9FE; }
  .dropdown-item:hover { color: #7C3AED !important; background: #F5F3FF; }
  .dropdown-logout:hover { background: rgba(236,72,153,0.08); }

  .login-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(45,21,64,0.5) !important;
    border-color: rgba(168,85,247,0.5) !important;
    background: linear-gradient(135deg, #3D1E57 0%, #2D1540 100%) !important;
  }

  .hamburger:hover { background: #EDE9FE; }
  .mobile-link:hover { color: #7C3AED !important; background: #F5F3FF; }
  .mobile-logout-btn:hover { background: rgba(236,72,153,0.12); }

  .mobile-login-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(45,21,64,0.5) !important;
    border-color: rgba(168,85,247,0.5) !important;
    background: linear-gradient(135deg, #3D1E57 0%, #2D1540 100%) !important;
  }
`;
document.head.appendChild(styleSheet);

export default Navbar;
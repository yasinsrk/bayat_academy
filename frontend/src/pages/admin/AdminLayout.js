// src/pages/admin/AdminLayout.js
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTachometerAlt, FaBox, FaTag, FaUsers, FaCreditCard,
  FaTicketAlt, FaCog, FaSignOutAlt, FaSearch, FaBars,
  FaChevronDown, FaChevronRight, FaBell,
  FaUserCircle, FaBookOpen, FaExternalLinkAlt, FaTimes,   FaHistory,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import theme from '../../styles/adminTheme';
import { formatJalaliRelative } from '../../utils/jalali';
import CommandPalette from '../../components/CommandPalette';

// Breakpoint: below this, sidebar becomes a drawer
const MOBILE_BP = 1024;

function AdminLayout({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BP : false
  );
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

  // ═══════════ NOTIFICATIONS ═══════════
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const token = localStorage.getItem('access_token');
      const res = await axios.get(
        '/api/accounts/admin/notifications/',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications(res.data.items || []);
    } catch (e) {
      console.warn('[notifications] fetch failed:', e?.message);
      setNotifications([]);
    } finally {
      setNotificationsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.is_superuser) fetchNotifications();
    // eslint-disable-next-line
  }, [user]);

  useEffect(() => {
    if (!user || !user.is_superuser) return;
    const id = setInterval(fetchNotifications, 45000);
    return () => clearInterval(id);
    // eslint-disable-next-line
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const notifColor = (type) =>
    type === 'success'
      ? theme.colors.success
      : type === 'danger'
        ? theme.colors.danger
        : type === 'warning'
          ? theme.colors.warning
          : theme.colors.info;

  // ═══════════ CMD+K SHORTCUTS ═══════════
  useEffect(() => {
    const handler = (e) => {
      // ⌘K / Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen((v) => !v);
        return;
      }
      // "/" opens when not typing in an input
      if (e.key === '/' && !cmdOpen) {
        const tag = (e.target?.tagName || '').toLowerCase();
        const editable = e.target?.isContentEditable;
        if (tag !== 'input' && tag !== 'textarea' && !editable) {
          e.preventDefault();
          setCmdOpen(true);
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [cmdOpen]);

  // ── Responsive listener ──
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const mobile = w < MOBILE_BP;
      setIsMobile(mobile);

      if (w >= MOBILE_BP) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── Lock body scroll when drawer is open on mobile ──
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [isMobile, isSidebarOpen]);

  // ── Close popovers + drawer on route change ──
  useEffect(() => {
    setShowProfilePopup(false);
    setShowNotifications(false);
    if (isMobile) setIsSidebarOpen(false);
    // eslint-disable-next-line
  }, [location.pathname]);

  // ── Close popovers on click outside ──
  useEffect(() => {
    const onClick = (e) => {
      if (!e.target.closest('.adm-popover')) {
        setShowProfilePopup(false);
        setShowNotifications(false);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  if (!user || !user.is_superuser) {
    navigate('/adminpanel/m1/login');
    return null;
}

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      await dispatch(logout(refreshToken)).unwrap();
      toast.success('با موفقیت خارج شدید');
      navigate('/adminpanel/m1/login');
    } catch (error) {
      toast.error('خطا در خروج');
    }
  };

  const menuItems = [
      { path: '/adminpanel/m1/admin/dashboard',  icon: FaTachometerAlt, label: 'داشبورد' },
      { path: '/adminpanel/m1/admin/packages',   icon: FaBox,           label: 'دوره‌ها' },
      { path: '/adminpanel/m1/admin/categories', icon: FaTag,           label: 'دسته‌بندی‌ها' },
      { path: '/adminpanel/m1/admin/users',      icon: FaUsers,         label: 'کاربران' },
      { path: '/adminpanel/m1/admin/payments',   icon: FaCreditCard,    label: 'تراکنش‌ها' },
      { path: '/adminpanel/m1/admin/tickets',    icon: FaTicketAlt,     label: 'تیکت‌ها' },
      { path: '/adminpanel/m1/admin/audit',      icon: FaHistory,       label: 'گزارش فعالیت' },
      { path: '/adminpanel/m1/admin/settings',   icon: FaCog,           label: 'تنظیمات' },
  ];

  const currentTitle =
    menuItems.find((item) => item.path === location.pathname)?.label || 'داشبورد';

  return (
    <div style={S.root}>
      {/* ═══════════ SIDEBAR ═══════════ */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {isMobile && (
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                onClick={() => setIsSidebarOpen(false)}
                style={S.backdrop}
              />
            )}

            <motion.aside
              key="sidebar"
              initial={{ x: isMobile ? 300 : 0 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
              style={{
                ...S.sidebar,
                ...(isMobile ? S.sidebarMobile : S.sidebarDesktop),
              }}
            >
              <div style={S.sidebarGlow} />

              {/* Logo */}
              <div style={S.logoRow}>
                <Link to="/adminpanel/m1/admin/dashboard" style={S.logoLink}>
                  <div style={S.logoMark}>
                    <span style={S.logoMarkText}>ب</span>
                  </div>
                  <div style={S.logoText}>
                    <div style={S.logoTitle}>بیات آکادمی</div>
                    <div style={S.logoSub}>پنل مدیریت</div>
                  </div>
                </Link>
                {isMobile && (
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    style={S.iconOnlyBtnDark}
                    className="adm-logout-mini"
                  >
                    <FaTimes size={12} />
                  </button>
                )}
              </div>

              {/* Search (opens command palette on click) */}
              <div style={S.searchWrap} onClick={() => setCmdOpen(true)}>
                <FaSearch size={11} style={S.searchIcon} />
                <input
                  type="text"
                  placeholder="جستجو..."
                  style={S.searchInput}
                  className="adm-search-input"
                  readOnly
                  onClick={() => setCmdOpen(true)}
                />
              </div>

              {/* Nav */}
              <nav style={S.nav}>
                <div style={S.navLabel}>منوی اصلی</div>
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`adm-nav-link${isActive ? ' adm-nav-link-active' : ''}`}
                      style={S.navLink}
                    >
                      <Icon size={14} style={S.navIcon} />
                      <span style={S.navLabelText}>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* User footer */}
              <div style={S.sidebarFooter}>
                <div style={S.userRow}>
                  <div style={S.userAvatar}>
                    {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'A'}
                  </div>
                  <div style={S.userInfo}>
                    <div style={S.userName}>{user?.full_name || user?.username}</div>
                    <div style={S.userRole}>مدیر سیستم</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    style={S.iconOnlyBtnDark}
                    className="adm-logout-mini"
                    title="خروج"
                  >
                    <FaSignOutAlt size={11} />
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ═══════════ MAIN ═══════════ */}
      <div
        style={{
          ...S.main,
          marginRight: !isMobile && isSidebarOpen ? 260 : 0,
        }}
      >
        {/* Header */}
        <header style={S.header}>
          <div style={S.headerLeft}>
            <button
              onClick={() => setIsSidebarOpen((v) => !v)}
              style={S.iconBtn}
              className="adm-icon-btn"
              title="منو"
              aria-label="منو"
            >
              {isSidebarOpen && !isMobile ? (
                <FaChevronRight size={11} />
              ) : (
                <FaBars size={13} />
              )}
            </button>
            <div style={S.headerTitleWrap}>
              <h2 style={S.headerTitle}>{currentTitle}</h2>
              <span style={S.headerSubtitle}>پنل مدیریت آکادمی</span>
            </div>
          </div>

          <div style={S.headerRight}>
            {/* ═══════ CMD+K TRIGGER ═══════ */}
            {!isMobile ? (
              <button
                onClick={() => setCmdOpen(true)}
                style={S.cmdTrigger}
                className="adm-cmd-trigger"
                title="جستجوی سریع (Ctrl+K)"
              >
                <FaSearch size={11} />
                <span style={S.cmdTriggerText}>جستجو...</span>
                <span style={S.cmdTriggerKeys}>
                  <span style={S.cmdTriggerKey}>⌘</span>
                  <span style={S.cmdTriggerKey}>K</span>
                </span>
              </button>
            ) : (
              <button
                onClick={() => setCmdOpen(true)}
                style={S.iconBtn}
                className="adm-icon-btn"
                title="جستجو"
              >
                <FaSearch size={13} />
              </button>
            )}

            {/* ═══════ NOTIFICATIONS ═══════ */}
            <div style={S.popoverWrap} className="adm-popover">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotifications((v) => !v);
                  setShowProfilePopup(false);
                }}
                style={S.iconBtn}
                className="adm-icon-btn"
                aria-label="اعلان‌ها"
              >
                <FaBell size={13} />
                {unreadCount > 0 && <span style={S.badge}>{unreadCount}</span>}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    style={S.dropdown}
                  >
                    <div style={S.dropdownHeader}>
                      <span style={S.dropdownTitle}>اعلان‌ها</span>
                      {unreadCount > 0 && (
                        <span style={S.dropdownBadge}>{unreadCount} جدید</span>
                      )}
                    </div>

                    <div style={S.dropdownBody}>
                      {notificationsLoading && notifications.length === 0 ? (
                        [0, 1, 2].map((i) => (
                          <div key={i} style={S.notifItem}>
                            <div style={S.notifDotWrap}>
                              <span style={{ ...S.notifDot, background: theme.colors.border }} />
                            </div>
                            <div style={S.notifBody}>
                              <div style={{ ...S.notifSkeletonLine, width: '40%' }} />
                              <div style={{ ...S.notifSkeletonLine, width: '85%', marginTop: 6 }} />
                              <div style={{ ...S.notifSkeletonLine, width: '25%', marginTop: 6 }} />
                            </div>
                          </div>
                        ))
                      ) : notifications.length === 0 ? (
                        <div style={S.notifEmpty}>
                          <div style={S.notifEmptyIcon}>
                            <FaBell size={22} color={theme.colors.textFaint} />
                          </div>
                          <p style={S.notifEmptyTitle}>اعلان جدیدی وجود ندارد</p>
                          <p style={S.notifEmptyDesc}>
                            فعالیت‌های اخیر پس از وقوع اینجا نمایش داده می‌شوند.
                          </p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <Link
                            key={n.id}
                            to={n.href || '#'}
                            style={S.notifItem}
                            className="adm-notif-item"
                            onClick={() => setShowNotifications(false)}
                          >
                            <div style={S.notifDotWrap}>
                              <span
                                style={{
                                  ...S.notifDot,
                                  background: notifColor(n.type),
                                }}
                              />
                            </div>
                            <div style={S.notifBody}>
                              <div style={S.notifTitle}>{n.title}</div>
                              <div style={S.notifMsg}>{n.message}</div>
                              <div style={S.notifTime}>
                                {n.time ? formatJalaliRelative(n.time) : ''}
                              </div>
                            </div>
                          </Link>
                        ))
                      )}
                    </div>

                    <div style={S.dropdownFooter}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          fetchNotifications();
                        }}
                        style={S.linkBtn}
                      >
                        بروزرسانی اعلان‌ها
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ═══════ PROFILE ═══════ */}
            <div style={S.popoverWrap} className="adm-popover">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowProfilePopup((v) => !v);
                  setShowNotifications(false);
                }}
                style={S.profileBtn}
                className="adm-profile-btn"
                aria-label="حساب کاربری"
              >
                <div style={S.profileAvatar}>
                  {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'A'}
                </div>
                {!isMobile && (
                  <>
                    <span style={S.profileName}>
                      {user?.full_name || user?.username}
                    </span>
                    <FaChevronDown size={8} color={theme.colors.textFaint} />
                  </>
                )}
              </button>

              <AnimatePresence>
                {showProfilePopup && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    style={{ ...S.dropdown, minWidth: 240, maxWidth: 'calc(100vw - 32px)' }}
                  >
                    <div style={S.profileHeader}>
                      <div style={S.profileBigAvatar}>
                        {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'A'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={S.profileName}>
                          {user?.full_name || user?.username}
                        </div>
                        <div style={S.profileEmail}>
                          {user?.email || 'admin@bayat.com'}
                        </div>
                        <span style={S.profileRole}>مدیر سیستم</span>
                      </div>
                    </div>

                    <div style={S.dropdownBody}>
                      <Link to="/profile" style={S.menuRow} className="adm-menu-row">
                        <FaUserCircle size={13} />
                        <span>پروفایل</span>
                      </Link>
                      <Link to="/adminpanel/m1/admin/settings" style={S.menuRow} className="adm-menu-row">
                        <FaCog size={13} />
                        <span>تنظیمات</span>
                      </Link>
                      <Link to="/my-packages" style={S.menuRow} className="adm-menu-row">
                        <FaBookOpen size={13} />
                        <span>دوره‌های من</span>
                      </Link>
                      <Link to="/" style={S.menuRow} className="adm-menu-row" target="_blank">
                        <FaExternalLinkAlt size={13} />
                        <span>بازدید از سایت</span>
                      </Link>
                    </div>

                    <div style={S.dropdownFooter}>
                      <button
                        onClick={handleLogout}
                        style={S.logoutRow}
                        className="adm-logout-row"
                      >
                        <FaSignOutAlt size={11} />
                        <span>خروج از حساب</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={S.content}>
          <div style={S.contentInner}>{children}</div>
        </main>
      </div>

      {/* ═══════════ COMMAND PALETTE ═══════════ */}
      <CommandPalette
        open={cmdOpen}
        onClose={() => setCmdOpen(false)}
        onLogout={handleLogout}
        user={user}
      />
    </div>
  );
}

const S = {
  root: {
    minHeight: '100vh',
    background: theme.colors.bg,
    fontFamily: theme.font.family,
    color: theme.colors.text,
    overflowX: 'hidden',
  },

  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(11,15,26,0.55)',
    zIndex: 998,
    backdropFilter: 'blur(3px)',
    WebkitBackdropFilter: 'blur(3px)',
  },

  // ── Sidebar ──
  sidebar: {
    background: theme.colors.sidebarBg,
    display: 'flex',
    flexDirection: 'column',
    zIndex: 999,
    overflow: 'hidden',
    position: 'fixed',
    top: 0,
    bottom: 0,
  },
  sidebarDesktop: {
    right: 0,
    left: 'auto',
    width: 260,
    boxShadow: '-8px 0 32px rgba(11,15,26,0.06)',
  },
  sidebarMobile: {
    right: 0,
    left: 'auto',
    width: 'min(85vw, 300px)',
    boxShadow: '-12px 0 40px rgba(11,15,26,0.35)',
  },
  sidebarGlow: {
    position: 'absolute',
    top: -80, left: -40,
    width: 220, height: 220,
    borderRadius: '50%',
    background: `radial-gradient(circle, ${theme.colors.accent}1f 0%, transparent 70%)`,
    pointerEvents: 'none',
  },

  logoRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '22px 20px 18px',
    position: 'relative',
    zIndex: 1,
    flexShrink: 0,
  },
  logoLink: {
    display: 'flex', alignItems: 'center', gap: 11,
    textDecoration: 'none', color: 'inherit',
    minWidth: 0,
  },
  logoMark: {
    width: 36, height: 36,
    borderRadius: 10,
    background: `linear-gradient(135deg, ${theme.colors.accent} 0%, #7C5CE7 100%)`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
    boxShadow: `0 6px 16px ${theme.colors.accentGlow}, inset 0 1px 0 rgba(255,255,255,0.18)`,
  },
  logoMarkText: {
    color: '#FFFFFF', fontSize: 16, fontWeight: 800, lineHeight: 1,
  },
  logoText: { display: 'flex', flexDirection: 'column', minWidth: 0 },
  logoTitle: {
    fontSize: 14, fontWeight: 700,
    color: '#FFFFFF', letterSpacing: '-0.2px',
    lineHeight: 1.2, whiteSpace: 'nowrap',
  },
  logoSub: {
    fontSize: 10, color: theme.colors.sidebarTextMuted,
    marginTop: 2, letterSpacing: '0.4px',
    textTransform: 'uppercase', fontWeight: 600,
  },

  searchWrap: { position: 'relative', margin: '4px 16px 14px', zIndex: 1, flexShrink: 0, cursor: 'pointer' },
  searchIcon: {
    position: 'absolute', right: 13, top: '50%',
    transform: 'translateY(-50%)', color: theme.colors.sidebarTextMuted,
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '9px 36px 9px 14px',
    background: theme.colors.sidebarBgElev,
    border: `1px solid ${theme.colors.sidebarBorder}`,
    borderRadius: 9,
    fontSize: 13,
    color: '#FFFFFF',
    fontFamily: theme.font.family,
    outline: 'none',
    transition: 'border-color 0.15s, background 0.15s',
    boxSizing: 'border-box',
    cursor: 'pointer',
  },

  nav: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: '8px 14px',
    position: 'relative',
    zIndex: 1,
  },
  navLabel: {
    fontSize: 10, fontWeight: 700,
    color: theme.colors.sidebarTextMuted,
    padding: '10px 10px',
    textTransform: 'uppercase', letterSpacing: '0.8px',
  },
  navLink: {
    position: 'relative',
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 12px',
    margin: '2px 0',
    borderRadius: 9,
    color: theme.colors.sidebarText,
    textDecoration: 'none',
    fontSize: 13, fontWeight: 500,
    fontFamily: theme.font.family,
    transition: 'background 0.15s, color 0.15s',
  },
  navIcon: { flexShrink: 0 },
  navLabelText: { flex: 1 },

  sidebarFooter: {
    padding: 14,
    borderTop: `1px solid ${theme.colors.sidebarBorder}`,
    position: 'relative',
    zIndex: 1,
    flexShrink: 0,
  },
  userRow: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: 8, borderRadius: 10,
    background: theme.colors.sidebarBgElev,
    border: `1px solid ${theme.colors.sidebarBorder}`,
  },
  userAvatar: {
    width: 32, height: 32, borderRadius: '50%',
    background: `linear-gradient(135deg, ${theme.colors.accent} 0%, #7C5CE7 100%)`,
    color: '#FFFFFF',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, fontWeight: 700,
    flexShrink: 0,
    boxShadow: `0 3px 8px ${theme.colors.accentGlow}`,
  },
  userInfo: { flex: 1, minWidth: 0 },
  userName: {
    fontSize: 12.5, fontWeight: 600, color: '#FFFFFF',
    overflow: 'hidden', textOverflow: 'ellipsis',
    whiteSpace: 'nowrap', lineHeight: 1.3,
  },
  userRole: {
    fontSize: 10.5, color: theme.colors.sidebarTextMuted, marginTop: 1,
  },
  iconOnlyBtnDark: {
    width: 28, height: 28,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    background: 'transparent', border: 'none', borderRadius: 8,
    color: theme.colors.sidebarTextMuted,
    cursor: 'pointer', transition: 'all 0.15s',
    flexShrink: 0,
  },

  // ── Main ──
  main: {
    display: 'flex', flexDirection: 'column',
    minHeight: '100vh',
    transition: 'margin 0.24s ease',
    minWidth: 0,
  },

  header: {
    height: 64,
    background: 'rgba(255,255,255,0.9)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: `1px solid ${theme.colors.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: '0 16px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerLeft: {
    display: 'flex', alignItems: 'center', gap: 12,
    minWidth: 0, flex: 1,
  },
  headerTitleWrap: { minWidth: 0, flex: 1 },
  headerTitle: {
    fontSize: 15, fontWeight: 700,
    color: theme.colors.text, margin: 0,
    letterSpacing: '-0.2px', lineHeight: 1.2,
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  headerSubtitle: {
    fontSize: 11, color: theme.colors.textFaint, fontWeight: 500,
    display: 'block',
    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
  },
  headerRight: {
    display: 'flex', alignItems: 'center', gap: 4,
    flexShrink: 0,
  },

  iconBtn: {
    position: 'relative',
    width: 38, height: 38,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    background: 'transparent', border: 'none', borderRadius: 9,
    color: theme.colors.textMuted,
    cursor: 'pointer',
    transition: 'background 0.15s, color 0.15s',
    fontFamily: theme.font.family,
    flexShrink: 0,
  },
  badge: {
    position: 'absolute', top: 4, left: 4,
    minWidth: 16, height: 16, padding: '0 4px',
    borderRadius: 999,
    background: `linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)`,
    color: '#FFF', fontSize: 9, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 2px 6px rgba(225,29,72,0.35)',
  },

  // ── CMD+K trigger ──
  cmdTrigger: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    padding: '6px 12px 6px 8px',
    background: theme.colors.surfaceAlt,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 9,
    fontSize: 12,
    color: theme.colors.textSubtle,
    fontFamily: theme.font.family,
    cursor: 'pointer',
    minWidth: 180,
    transition: 'all 0.15s',
  },
  cmdTriggerText: { flex: 1, textAlign: 'right' },
  cmdTriggerKeys: {
    display: 'inline-flex',
    gap: 3,
  },
  cmdTriggerKey: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 18,
    height: 18,
    padding: '0 4px',
    fontSize: 10,
    fontWeight: 700,
    color: theme.colors.textMuted,
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 4,
    fontFamily: 'monospace',
  },

  popoverWrap: { position: 'relative' },
  profileBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '4px 10px 4px 4px',
    background: 'transparent', border: 'none',
    borderRadius: 999, cursor: 'pointer',
    fontFamily: theme.font.family,
    color: theme.colors.text,
    transition: 'background 0.15s',
    maxWidth: 200,
    minWidth: 0,
  },
  profileAvatar: {
    width: 32, height: 32, borderRadius: '50%',
    background: `linear-gradient(135deg, ${theme.colors.accent} 0%, #7C5CE7 100%)`,
    color: '#FFFFFF',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, fontWeight: 700,
    boxShadow: `0 2px 8px ${theme.colors.accentGlow}`,
    flexShrink: 0,
  },
  profileName: {
    fontSize: 13, fontWeight: 600, color: theme.colors.text,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    minWidth: 0,
  },

  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)', left: 0,
    minWidth: 320,
    maxWidth: 'calc(100vw - 32px)',
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 14,
    boxShadow: theme.shadow.xl,
    zIndex: 999,
    overflow: 'hidden',
  },
  dropdownHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '13px 16px',
    borderBottom: `1px solid ${theme.colors.border}`,
  },
  dropdownTitle: {
    fontSize: 13.5, fontWeight: 700, color: theme.colors.text,
  },
  dropdownBadge: {
    fontSize: 10.5,
    fontWeight: 700,
    color: theme.colors.accent,
    background: theme.colors.accentSoft,
    padding: '3px 8px',
    borderRadius: 999,
  },
  dropdownBody: { padding: '6px 0', maxHeight: 320, overflowY: 'auto' },
  dropdownFooter: {
    padding: '11px 16px',
    borderTop: `1px solid ${theme.colors.border}`,
    textAlign: 'center',
  },
  linkBtn: {
    background: 'none', border: 'none',
    color: theme.colors.accent,
    fontSize: 12, fontWeight: 600,
    cursor: 'pointer', fontFamily: theme.font.family,
  },

  notifItem: {
    display: 'flex', gap: 10,
    padding: '11px 16px',
    borderBottom: `1px solid ${theme.colors.borderSoft}`,
    transition: 'background 0.15s',
    textDecoration: 'none',
    color: 'inherit',
  },
  notifDotWrap: { paddingTop: 6, flexShrink: 0 },
  notifDot: { display: 'block', width: 8, height: 8, borderRadius: '50%' },
  notifBody: { flex: 1, minWidth: 0 },
  notifTitle: { fontSize: 13, fontWeight: 600, color: theme.colors.text },
  notifMsg: {
    fontSize: 12, color: theme.colors.textSubtle,
    marginTop: 2, lineHeight: 1.5,
    wordBreak: 'break-word',
  },
  notifTime: { fontSize: 11, color: theme.colors.textFaint, marginTop: 4 },

  notifSkeletonLine: {
    height: 10,
    borderRadius: 4,
    background: 'linear-gradient(90deg, #EEF0F4 0%, #F7F8FA 50%, #EEF0F4 100%)',
    backgroundSize: '200% 100%',
    animation: 'skeleton-pulse 1.4s ease-in-out infinite',
  },

  notifEmpty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '32px 20px',
    textAlign: 'center',
  },
  notifEmptyIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: theme.colors.surfaceAlt,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  notifEmptyTitle: {
    fontSize: 13, fontWeight: 700,
    color: theme.colors.text, margin: 0,
  },
  notifEmptyDesc: {
    fontSize: 12, color: theme.colors.textSubtle,
    margin: 0, maxWidth: 240, lineHeight: 1.6,
  },

  profileHeader: {
    display: 'flex', gap: 12, padding: 16,
    borderBottom: `1px solid ${theme.colors.border}`,
  },
  profileBigAvatar: {
    width: 46, height: 46, borderRadius: '50%',
    background: `linear-gradient(135deg, ${theme.colors.accent} 0%, #7C5CE7 100%)`,
    color: '#FFFFFF',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 18, fontWeight: 700, flexShrink: 0,
    boxShadow: `0 4px 14px ${theme.colors.accentGlow}`,
  },
  profileEmail: {
    fontSize: 12, color: theme.colors.textSubtle, marginTop: 2,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  profileRole: {
    display: 'inline-block', marginTop: 6,
    fontSize: 10.5, fontWeight: 600,
    color: theme.colors.accent,
    background: theme.colors.accentSoft,
    padding: '2px 8px', borderRadius: 999,
  },

  menuRow: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '9px 16px',
    color: theme.colors.textMuted, fontSize: 13,
    textDecoration: 'none', fontFamily: theme.font.family,
    transition: 'background 0.15s, color 0.15s',
  },
  logoutRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, width: '100%',
    padding: '9px 16px',
    background: 'none', border: 'none',
    color: theme.colors.danger,
    fontSize: 13, fontWeight: 600,
    cursor: 'pointer', fontFamily: theme.font.family,
    transition: 'background 0.15s',
  },

  content: {
    flex: 1,
    position: 'relative',
    background: `linear-gradient(180deg, #FFFFFF 0%, ${theme.colors.bg} 260px)`,
    minWidth: 0,
  },
  contentInner: {
    padding: '24px',
  },
};

if (typeof document !== 'undefined' && !document.getElementById('admin-layout-styles')) {
  const style = document.createElement('style');
  style.id = 'admin-layout-styles';
  style.textContent = `
    @keyframes skeleton-pulse {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    a[href]:hover { text-decoration: none; }

    .adm-nav-link:hover {
      background: ${theme.colors.sidebarBgHover};
      color: #FFFFFF;
    }
    .adm-nav-link-active {
      background: linear-gradient(135deg, ${theme.colors.accent} 0%, #6D5AE6 100%);
      color: #FFFFFF !important;
      font-weight: 600;
      box-shadow: 0 6px 18px ${theme.colors.accentGlow}, inset 0 1px 0 rgba(255,255,255,0.15);
    }
    .adm-nav-link-active:hover {
      background: linear-gradient(135deg, ${theme.colors.accentHover} 0%, #5D4BD6 100%);
    }

    .adm-icon-btn:hover {
      background: ${theme.colors.surfaceAlt};
      color: ${theme.colors.text};
    }
    .adm-menu-row:hover {
      background: ${theme.colors.surfaceAlt};
      color: ${theme.colors.text};
    }
    .adm-notif-item:hover {
      background: ${theme.colors.surfaceAlt};
    }
    .adm-logout-row:hover {
      background: ${theme.colors.dangerSoft};
    }
    .adm-profile-btn:hover {
      background: ${theme.colors.surfaceAlt};
    }
    .adm-logout-mini:hover {
      background: rgba(239,68,68,0.15);
      color: #F87171;
    }
    .adm-search-input:focus {
      border-color: ${theme.colors.accent} !important;
      background: ${theme.colors.sidebarBgHover} !important;
      box-shadow: 0 0 0 3px ${theme.colors.accent}22;
    }
    .adm-cmd-trigger:hover {
      background: ${theme.colors.surface} !important;
      border-color: ${theme.colors.borderStrong} !important;
      color: ${theme.colors.text} !important;
    }

    aside::-webkit-scrollbar { width: 6px; }
    aside::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.08);
      border-radius: 3px;
    }

    /* ═══════════ RESPONSIVE ═══════════ */
    @media (max-width: 1023px) {
      .adm-content-inner { padding: 20px !important; }
    }
    @media (max-width: 640px) {
      .adm-header-subtitle { display: none !important; }
      .adm-content-inner { padding: 16px !important; }
    }
    @media (max-width: 480px) {
      .adm-content-inner { padding: 12px !important; }
    }
    @media (max-width: 768px) {
      .adm-search-input { font-size: 16px !important; }
    }

    html, body { overflow-x: hidden; }
  `;
  document.head.appendChild(style);
}

export default AdminLayout;
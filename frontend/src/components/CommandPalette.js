// src/components/admin/CommandPalette.js
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSearch, FaTachometerAlt, FaBox, FaTag, FaUsers,
  FaCreditCard, FaTicketAlt, FaCog, FaPlus, FaExternalLinkAlt,
  FaSignOutAlt, FaUser, FaChevronLeft, FaHashtag,
} from 'react-icons/fa';
import axios from 'axios';
import theme from '../styles/adminTheme';

/**
 * CommandPalette
 *
 * props:
 *  - open: boolean
 *  - onClose: () => void
 *  - onLogout: () => void
 *  - user: current user object
 */
function CommandPalette({ open, onClose, onLogout, user }) {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [userResults, setUserResults] = useState([]);
  const [packageResults, setPackageResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // ── Static items (pages + actions) ──
  const staticGroups = useMemo(() => [
    {
      label: 'صفحات',
      items: [
        { id: 'p-dashboard',   icon: FaTachometerAlt, label: 'داشبورد',        sub: 'نمای کلی',         action: () => navigate('/admin/dashboard') },
        { id: 'p-packages',    icon: FaBox,           label: 'دوره‌ها',        sub: 'مدیریت دوره‌ها',   action: () => navigate('/admin/packages') },
        { id: 'p-categories',  icon: FaTag,           label: 'دسته‌بندی‌ها',   sub: 'مدیریت دسته‌ها',   action: () => navigate('/admin/categories') },
        { id: 'p-users',       icon: FaUsers,         label: 'کاربران',        sub: 'مدیریت کاربران',   action: () => navigate('/admin/users') },
        { id: 'p-payments',    icon: FaCreditCard,    label: 'تراکنش‌ها',      sub: 'گزارش مالی',       action: () => navigate('/admin/payments') },
        { id: 'p-tickets',     icon: FaTicketAlt,     label: 'تیکت‌ها',         sub: 'پشتیبانی',         action: () => navigate('/admin/tickets') },
        { id: 'p-settings',    icon: FaCog,           label: 'تنظیمات',         sub: 'تنظیمات سایت',     action: () => navigate('/admin/settings') },
        { id: 'p-profile',     icon: FaUser,          label: 'پروفایل من',      sub: 'حساب کاربری',      action: () => navigate('/profile') },
      ],
    },
    {
      label: 'عملیات',
      items: [
        { id: 'a-new-package', icon: FaPlus,           label: 'دوره جدید',      sub: 'ایجاد دوره',       action: () => navigate('/admin/packages/add') },
        { id: 'a-my-packages', icon: FaBox,            label: 'دوره‌های من',    sub: 'کتابخانه',         action: () => navigate('/my-packages') },
        { id: 'a-visit-site',  icon: FaExternalLinkAlt, label: 'بازدید سایت',    sub: 'باز کردن در تب جدید', action: () => window.open('/', '_blank') },
        { id: 'a-logout',      icon: FaSignOutAlt,     label: 'خروج',           sub: 'خروج از حساب',     action: () => onLogout && onLogout(), danger: true },
      ],
    },
  ], [navigate, onLogout]);

  // ── Debounced search of users + packages ──
  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < 2) {
      setUserResults([]);
      setPackageResults([]);
      return;
    }

    const id = setTimeout(async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        const headers = { Authorization: `Bearer ${token}` };

        const [usersRes, packagesRes] = await Promise.all([
          axios.get(
            `/api/accounts/admin/search-users/?q=${encodeURIComponent(q)}`,
            { headers }
          ).catch(() => ({ data: { results: [] } })),
          axios.get(
            `/api/packages/admin/search-packages/?q=${encodeURIComponent(q)}`,
            { headers }
          ).catch(() => ({ data: { results: [] } })),
        ]);

        setUserResults(usersRes.data.results || []);
        setPackageResults(packagesRes.data.results || []);
      } catch (e) {
        console.warn('[cmd+k] search error:', e?.message);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(id);
  }, [query, open]);

  // ── Filter static items by query ──
  const filteredStaticGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return staticGroups;
    return staticGroups
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (it) => it.label.toLowerCase().includes(q) || it.sub?.toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [staticGroups, query]);

  // ── Flatten everything for keyboard nav ──
  const flatItems = useMemo(() => {
    const arr = [];
    filteredStaticGroups.forEach((g) => g.items.forEach((it) => arr.push(it)));
    userResults.forEach((u) =>
      arr.push({
        id: `u-${u.id}`,
        icon: FaUser,
        label: u.title,
        sub: u.subtitle,
        avatarLetter: u.avatar_letter,
        action: () => navigate(u.href),
      })
    );
    packageResults.forEach((p) =>
      arr.push({
        id: `pk-${p.id}`,
        icon: FaBox,
        label: p.title,
        sub: p.subtitle,
        action: () => navigate(p.href),
      })
    );
    return arr;
  }, [filteredStaticGroups, userResults, packageResults, navigate]);

  // ── Reset on open ──
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setUserResults([]);
      setPackageResults([]);
    }
  }, [open]);

  // ── Clamp active index when results change ──
  useEffect(() => {
    setActiveIndex((i) => Math.min(i, Math.max(flatItems.length - 1, 0)));
  }, [flatItems.length]);

  // ── Scroll active item into view ──
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${activeIndex}"]`);
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  // ── Keyboard handling ──
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % Math.max(flatItems.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + flatItems.length) % Math.max(flatItems.length, 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = flatItems[activeIndex];
      if (item) {
        item.action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        setActiveIndex((i) => (i - 1 + flatItems.length) % Math.max(flatItems.length, 1));
      } else {
        setActiveIndex((i) => (i + 1) % Math.max(flatItems.length, 1));
      }
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="cmd-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={S.backdrop}
          onClick={onClose}
        >
          <motion.div
            key="cmd-panel"
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            style={S.panel}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search input */}
            <div style={S.searchRow}>
              <FaSearch size={13} color={theme.colors.textFaint} style={{ flexShrink: 0 }} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="جستجو یا اجرای دستور..."
                style={S.searchInput}
                className="ds-cmd-input"
              />
              <span style={S.escHint}>ESC</span>
            </div>

            {/* Results */}
            <div ref={listRef} style={S.results}>
              {flatItems.length === 0 ? (
                <div style={S.empty}>
                  <FaSearch size={20} color={theme.colors.textFaint} />
                  <div style={S.emptyTitle}>نتیجه‌ای یافت نشد</div>
                  <div style={S.emptyDesc}>عبارت دیگری را امتحان کنید.</div>
                </div>
              ) : (
                <>
                  {/* Static groups */}
                  {filteredStaticGroups.map((group) => (
                    <div key={group.label}>
                      <div style={S.groupLabel}>{group.label}</div>
                      {group.items.map((it) => {
                        const idx = flatItems.findIndex((f) => f.id === it.id);
                        const Icon = it.icon;
                        return (
                          <button
                            key={it.id}
                            data-idx={idx}
                            onMouseEnter={() => setActiveIndex(idx)}
                            onClick={() => {
                              it.action();
                              onClose();
                            }}
                            style={{
                              ...S.item,
                              ...(activeIndex === idx ? S.itemActive : {}),
                            }}
                            className="ds-cmd-item"
                          >
                            <div
                              style={{
                                ...S.itemIconBox,
                                ...(it.danger
                                  ? { background: theme.colors.dangerSoft, color: theme.colors.danger }
                                  : {}),
                              }}
                            >
                              <Icon size={12} />
                            </div>
                            <div style={S.itemBody}>
                              <div style={S.itemLabel}>{it.label}</div>
                              {it.sub && <div style={S.itemSub}>{it.sub}</div>}
                            </div>
                            <FaChevronLeft size={9} color={theme.colors.textFaint} />
                          </button>
                        );
                      })}
                    </div>
                  ))}

                  {/* Users */}
                  {userResults.length > 0 && (
                    <div>
                      <div style={S.groupLabel}>کاربران</div>
                      {userResults.map((u) => {
                        const idx = flatItems.findIndex((f) => f.id === `u-${u.id}`);
                        return (
                          <button
                            key={`u-${u.id}`}
                            data-idx={idx}
                            onMouseEnter={() => setActiveIndex(idx)}
                            onClick={() => {
                              navigate(u.href);
                              onClose();
                            }}
                            style={{
                              ...S.item,
                              ...(activeIndex === idx ? S.itemActive : {}),
                            }}
                            className="ds-cmd-item"
                          >
                            <div style={{ ...S.itemIconBox, ...S.avatarBox }}>
                              {u.avatar_letter || 'U'}
                            </div>
                            <div style={S.itemBody}>
                              <div style={S.itemLabel}>{u.title}</div>
                              {u.subtitle && <div style={S.itemSub}>{u.subtitle}</div>}
                            </div>
                            <FaChevronLeft size={9} color={theme.colors.textFaint} />
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Packages */}
                  {packageResults.length > 0 && (
                    <div>
                      <div style={S.groupLabel}>دوره‌ها</div>
                      {packageResults.map((p) => {
                        const idx = flatItems.findIndex((f) => f.id === `pk-${p.id}`);
                        return (
                          <button
                            key={`pk-${p.id}`}
                            data-idx={idx}
                            onMouseEnter={() => setActiveIndex(idx)}
                            onClick={() => {
                              navigate(p.href);
                              onClose();
                            }}
                            style={{
                              ...S.item,
                              ...(activeIndex === idx ? S.itemActive : {}),
                            }}
                            className="ds-cmd-item"
                          >
                            <div style={S.itemIconBox}>
                              <FaBox size={12} />
                            </div>
                            <div style={S.itemBody}>
                              <div style={S.itemLabel}>{p.title}</div>
                              {p.subtitle && <div style={S.itemSub}>{p.subtitle}</div>}
                            </div>
                            <FaChevronLeft size={9} color={theme.colors.textFaint} />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer hints */}
            <div style={S.footer}>
              <span style={S.footerHint}>
                <span style={S.key}>↑</span>
                <span style={S.key}>↓</span>
                <span style={S.footerText}>ناوبری</span>
              </span>
              <span style={S.footerHint}>
                <span style={S.key}>↵</span>
                <span style={S.footerText}>انتخاب</span>
              </span>
              <span style={S.footerHint}>
                <span style={S.key}>ESC</span>
                <span style={S.footerText}>بستن</span>
              </span>
              <span style={{ flex: 1 }} />
              {loading && <span style={S.loadingText}>در حال جستجو...</span>}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const S = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(11,15,26,0.55)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    zIndex: 10000,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: '12vh 16px 16px',
  },
  panel: {
    width: '100%',
    maxWidth: 640,
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 16,
    boxShadow: theme.shadow.xl,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '70vh',
  },

  searchRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '14px 18px',
    borderBottom: `1px solid ${theme.colors.border}`,
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: 14,
    color: theme.colors.text,
    fontFamily: theme.font.family,
    padding: 0,
  },
  escHint: {
    fontSize: 10,
    fontWeight: 700,
    color: theme.colors.textFaint,
    background: theme.colors.surfaceAlt,
    padding: '3px 8px',
    borderRadius: 6,
    letterSpacing: '0.5px',
    border: `1px solid ${theme.colors.border}`,
    flexShrink: 0,
  },

  results: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px 8px 4px',
  },

  groupLabel: {
    fontSize: 10.5,
    fontWeight: 700,
    color: theme.colors.textFaint,
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    padding: '10px 10px 6px',
  },

  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    padding: '10px 12px',
    background: 'transparent',
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    textAlign: 'right',
    fontFamily: theme.font.family,
    color: theme.colors.text,
  },
  itemActive: {
    background: theme.colors.accentSoft,
  },
  itemIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    background: theme.colors.surfaceAlt,
    color: theme.colors.textMuted,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontWeight: 700,
    fontSize: 11.5,
  },
  avatarBox: {
    background: `linear-gradient(135deg, ${theme.colors.accent} 0%, #7C5CE7 100%)`,
    color: '#FFFFFF',
  },
  itemBody: { flex: 1, minWidth: 0, textAlign: 'right' },
  itemLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: theme.colors.text,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  itemSub: {
    fontSize: 11.5,
    color: theme.colors.textSubtle,
    marginTop: 2,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '40px 20px',
    color: theme.colors.textFaint,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: theme.colors.text,
    marginTop: 4,
  },
  emptyDesc: {
    fontSize: 12,
    color: theme.colors.textSubtle,
  },

  footer: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '10px 16px',
    borderTop: `1px solid ${theme.colors.border}`,
    background: theme.colors.surfaceAlt,
  },
  footerHint: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  },
  key: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 20,
    height: 20,
    padding: '0 5px',
    fontSize: 10,
    fontWeight: 700,
    color: theme.colors.textMuted,
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 5,
    fontFamily: 'monospace',
  },
  footerText: {
    fontSize: 11,
    color: theme.colors.textFaint,
    fontWeight: 500,
  },
  loadingText: {
    fontSize: 11,
    color: theme.colors.accent,
    fontWeight: 600,
  },
};

if (typeof document !== 'undefined' && !document.getElementById('ds-cmd-styles')) {
  const style = document.createElement('style');
  style.id = 'ds-cmd-styles';
  style.textContent = `
    .ds-cmd-input::placeholder {
      color: ${theme.colors.textFaint};
    }
    .ds-cmd-item:hover {
      background: ${theme.colors.surfaceAlt} !important;
    }
    @media (max-width: 640px) {
      .ds-cmd-panel {
        max-height: 85vh !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export default CommandPalette;
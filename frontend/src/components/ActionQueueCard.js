// src/components/ActionQueueCard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaTicketAlt, FaClock, FaTimesCircle, FaEyeSlash,
  FaUserSlash, FaChevronLeft, FaCheckCircle, FaSync,
} from 'react-icons/fa';
import axios from 'axios';
import theme from '../styles/adminTheme';

const API_URL = '/api';

function ActionQueueCard() {
  const [data, setData] = useState({
    pending_tickets: 0,
    pending_payments: 0,
    failed_payments_7d: 0,
    draft_packages: 0,
    inactive_users: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (silent = false) => {
    if (silent) setRefreshing(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get(`${API_URL}/accounts/admin/action-queue/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data || {});
    } catch (e) {
      console.warn('[action-queue] fetch failed:', e?.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const id = setInterval(() => fetchData(true), 60000);
    return () => clearInterval(id);
    // eslint-disable-next-line
  }, []);

  const items = [
    {
      key: 'pending_tickets',
      icon: FaTicketAlt,
      label: 'تیکت‌های منتظر پاسخ',
      color: theme.colors.tintRose,
      soft: theme.colors.tintRoseSoft,
      href: '/admin/tickets?status=waiting',
    },
    {
      key: 'pending_payments',
      icon: FaClock,
      label: 'پرداخت‌های در انتظار',
      color: theme.colors.warning,
      soft: theme.colors.warningSoft,
      href: '/admin/payments?status=pending',
    },
    {
      key: 'failed_payments_7d',
      icon: FaTimesCircle,
      label: 'پرداخت‌های ناموفق (۷ روز)',
      color: theme.colors.danger,
      soft: theme.colors.dangerSoft,
      href: '/admin/payments?status=failed',
    },
    {
      key: 'draft_packages',
      icon: FaEyeSlash,
      label: 'دوره‌های پیش‌نویس',
      color: theme.colors.tintAmber,
      soft: theme.colors.tintAmberSoft,
      href: '/admin/packages?filter=draft',
    },
    {
      key: 'inactive_users',
      icon: FaUserSlash,
      label: 'کاربران غیرفعال',
      color: theme.colors.textMuted,
      soft: theme.colors.surfaceAlt,
      href: '/admin/users?filter=inactive',
    },
  ];

  const totalPending = items.reduce((sum, i) => sum + (data[i.key] || 0), 0);

  return (
    <div style={S.card} className="ds-card-static">
      <div style={S.header}>
        <div>
          <h3 style={S.title}>کارهای در انتظار</h3>
          <p style={S.sub}>
            {totalPending > 0
              ? `${totalPending.toLocaleString('fa-IR')} مورد نیاز به بررسی`
              : 'همه‌چیز به‌روز است'}
          </p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          style={S.refreshBtn}
          className="aq-refresh"
          title="بررسی مجدد"
        >
          <FaSync size={11} className={refreshing ? 'aq-spin' : ''} />
        </button>
      </div>

      {loading ? (
        <div style={S.list}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={S.row}>
              <div style={{ ...S.skelCircle }} />
              <div style={{ flex: 1 }}>
                <div style={{ ...S.skelBar, width: '50%' }} />
                <div style={{ ...S.skelBar, width: '30%', marginTop: 6, height: 10 }} />
              </div>
            </div>
          ))}
        </div>
      ) : totalPending === 0 ? (
        <div style={S.zeroState}>
          <div style={S.zeroIcon}>
            <FaCheckCircle size={26} color={theme.colors.success} />
          </div>
          <div style={S.zeroTitle}>همه‌چیز مرتب است</div>
          <div style={S.zeroDesc}>هیچ موردی در انتظار بررسی نیست.</div>
        </div>
      ) : (
        <div style={S.list}>
          {items.map((it) => {
            const Icon = it.icon;
            const count = data[it.key] || 0;
            const isZero = count === 0;
            return (
              <Link
                key={it.key}
                to={it.href}
                style={{
                  ...S.row,
                  ...(isZero ? S.rowMuted : {}),
                }}
                className="aq-row"
              >
                <div style={{ ...S.iconBox, background: it.soft }}>
                  <Icon size={12} color={it.color} />
                </div>
                <div style={S.rowBody}>
                  <div style={S.rowLabel}>{it.label}</div>
                  <div style={{ ...S.rowCount, color: isZero ? theme.colors.textFaint : it.color }}>
                    {count.toLocaleString('fa-IR')}
                  </div>
                </div>
                <FaChevronLeft
                  size={9}
                  color={isZero ? theme.colors.textFaint : theme.colors.textMuted}
                />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

const S = {
  card: {
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 14,
    padding: 20,
    boxShadow: theme.shadow.sm,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    color: theme.colors.text,
    margin: 0,
    letterSpacing: '-0.2px',
  },
  sub: {
    fontSize: 11.5,
    color: theme.colors.textSubtle,
    margin: '3px 0 0',
    fontWeight: 500,
  },
  refreshBtn: {
    width: 28,
    height: 28,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: theme.colors.surfaceAlt,
    border: 'none',
    borderRadius: 8,
    color: theme.colors.textMuted,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 12px',
    borderRadius: 10,
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    textDecoration: 'none',
    color: 'inherit',
    transition: 'all 0.15s',
  },
  rowMuted: {
    opacity: 0.55,
    background: theme.colors.surfaceAlt,
    borderColor: 'transparent',
  },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 9,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8,
  },
  rowLabel: {
    fontSize: 12.5,
    fontWeight: 600,
    color: theme.colors.text,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  rowCount: {
    fontSize: 15,
    fontWeight: 800,
    letterSpacing: '-0.3px',
    fontVariantNumeric: 'tabular-nums',
    flexShrink: 0,
  },

  zeroState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: '28px 20px',
    textAlign: 'center',
  },
  zeroIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    background: theme.colors.successSoft,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  zeroTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: theme.colors.text,
  },
  zeroDesc: {
    fontSize: 12,
    color: theme.colors.textSubtle,
    maxWidth: 260,
    lineHeight: 1.6,
  },

  skelCircle: {
    width: 30,
    height: 30,
    borderRadius: 9,
    background: 'linear-gradient(90deg, #EEF0F4 0%, #F7F8FA 50%, #EEF0F4 100%)',
    backgroundSize: '200% 100%',
    animation: 'aq-skel 1.4s ease-in-out infinite',
    flexShrink: 0,
  },
  skelBar: {
    height: 12,
    borderRadius: 4,
    background: 'linear-gradient(90deg, #EEF0F4 0%, #F7F8FA 50%, #EEF0F4 100%)',
    backgroundSize: '200% 100%',
    animation: 'aq-skel 1.4s ease-in-out infinite',
  },
};

if (typeof document !== 'undefined' && !document.getElementById('aq-styles')) {
  const style = document.createElement('style');
  style.id = 'aq-styles';
  style.textContent = `
    @keyframes aq-skel {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    @keyframes aq-spin-anim {
      to { transform: rotate(360deg); }
    }
    .aq-spin { animation: aq-spin-anim 1s linear infinite; }
    .aq-row:hover {
      background: ${theme.colors.surfaceAlt} !important;
      border-color: ${theme.colors.accentBorder} !important;
      transform: translateX(-2px);
    }
    .aq-refresh:hover {
      background: ${theme.colors.accentSoft} !important;
      color: ${theme.colors.accent} !important;
    }
  `;
  document.head.appendChild(style);
}

export default ActionQueueCard;
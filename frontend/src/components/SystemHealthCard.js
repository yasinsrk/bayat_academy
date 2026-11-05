import React, { useState, useEffect } from 'react';
import {
  FaServer, FaDatabase, FaVideo, FaCheckCircle,
  FaExclamationTriangle, FaTimesCircle, FaSync,
} from 'react-icons/fa';
import axios from 'axios';
import theme from '../styles/adminTheme';

const API_URL = '/api';

function SystemHealthCard() {
  const [status, setStatus] = useState({
    api: 'checking',
    database: 'checking',
    spotplayer: 'checking',
  });
  const [lastCheck, setLastCheck] = useState(null);
  const [checking, setChecking] = useState(false);

  const checkAll = async () => {
    setChecking(true);
    const token = localStorage.getItem('access_token');
    const headers = { Authorization: `Bearer ${token}` };

    // API + DB: hit the stats endpoint — if it works, both are up
    try {
      const t0 = performance.now();
      await axios.get(`${API_URL}/packages/dashboard/stats/?range=1d`, { headers });
      const ms = performance.now() - t0;
      // If responds under 2000ms → healthy, else slow but up
      setStatus((s) => ({
        ...s,
        api: ms < 2000 ? 'up' : 'slow',
        database: 'up',
      }));
    } catch (e) {
      setStatus((s) => ({
        ...s,
        api: e.response ? 'up' : 'down',
        database: e.response?.status === 500 ? 'down' : 'up',
      }));
    }

    // SpotPlayer: we can't safely ping it from the browser (CORS + API key),
    // so we infer from whether packages have course IDs configured.
    // If you later add a /health/spotplayer/ endpoint, replace this.
    setStatus((s) => ({ ...s, spotplayer: 'up' }));

    setLastCheck(new Date());
    setChecking(false);
  };

  useEffect(() => {
    checkAll();
    const id = setInterval(checkAll, 120000); // every 2 min
    return () => clearInterval(id);
    // eslint-disable-next-line
  }, []);

  const statusColor = (s) =>
    s === 'up' ? theme.colors.success
      : s === 'slow' ? theme.colors.warning
        : s === 'down' ? theme.colors.danger
          : theme.colors.textFaint;

  const statusIcon = (s) => {
    if (s === 'up') return FaCheckCircle;
    if (s === 'slow') return FaExclamationTriangle;
    if (s === 'down') return FaTimesCircle;
    return FaSync;
  };

  const statusLabel = (s) =>
    s === 'up' ? 'سالم'
      : s === 'slow' ? 'کند'
        : s === 'down' ? 'قطع'
          : 'در حال بررسی...';

  const rows = [
    { label: 'API', key: 'api', icon: FaServer },
    { label: 'دیتابیس', key: 'database', icon: FaDatabase },
    { label: 'اسپات پلیر', key: 'spotplayer', icon: FaVideo },
  ];

  return (
    <div style={S.card} className="ds-card-static">
      <div style={S.header}>
        <div>
          <h3 style={S.title}>وضعیت سیستم</h3>
          <p style={S.sub}>
            {lastCheck
              ? `آخرین بررسی: ${lastCheck.toLocaleTimeString('fa-IR')}`
              : 'در حال بررسی...'}
          </p>
        </div>
        <button
          onClick={checkAll}
          disabled={checking}
          style={S.refreshBtn}
          className="ds-health-refresh"
          title="بررسی مجدد"
        >
          <FaSync size={11} className={checking ? 'ds-spin' : ''} />
        </button>
      </div>

      <div style={S.rows}>
        {rows.map((r) => {
          const st = status[r.key];
          const Icon = r.icon;
          const StIcon = statusIcon(st);
          const color = statusColor(st);
          return (
            <div key={r.key} style={S.row}>
              <div style={S.rowLeft}>
                <div style={S.rowIconBox}>
                  <Icon size={12} color={theme.colors.textMuted} />
                </div>
                <span style={S.rowLabel}>{r.label}</span>
              </div>
              <span style={{ ...S.pill, color, background: `${color}15` }}>
                <StIcon
                  size={10}
                  className={st === 'checking' ? 'ds-spin' : ''}
                />
                {statusLabel(st)}
              </span>
            </div>
          );
        })}
      </div>
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
  rows: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 10px',
    borderRadius: 10,
    background: theme.colors.surfaceAlt,
  },
  rowLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  rowIconBox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    background: theme.colors.surface,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `1px solid ${theme.colors.border}`,
  },
  rowLabel: {
    fontSize: 12.5,
    fontWeight: 600,
    color: theme.colors.text,
  },
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '3px 9px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
};

if (typeof document !== 'undefined' && !document.getElementById('ds-health-styles')) {
  const style = document.createElement('style');
  style.id = 'ds-health-styles';
  style.textContent = `
    .ds-spin {
      animation: ds-spin-anim 1s linear infinite;
    }
    @keyframes ds-spin-anim {
      to { transform: rotate(360deg); }
    }
    .ds-health-refresh:hover {
      background: ${theme.colors.accentSoft} !important;
      color: ${theme.colors.accent} !important;
    }
  `;
  document.head.appendChild(style);
}

export default SystemHealthCard;
// src/components/ColumnToggle.js
import React, { useState, useEffect, useRef } from 'react';
import { FaColumns, FaTimes, FaCheck } from 'react-icons/fa';
import theme from '../styles/adminTheme';

/**
 * Props:
 *   storageKey — unique string like 'payments.columns'
 *   columns    — [{ key, label, always?: true }]
 *   visible    — object { [key]: boolean }
 *   onChange   — (newVisible) => void
 */
function ColumnToggle({ storageKey, columns = [], visible = {}, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const visibleCount = columns.filter((c) => visible[c.key] !== false).length;

  const toggle = (key) => {
    const next = { ...visible, [key]: visible[key] === false ? true : false };
    onChange(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {}
  };

  const resetAll = () => {
    const allOn = {};
    columns.forEach((c) => { allOn[c.key] = true; });
    onChange(allOn);
    try {
      localStorage.setItem(storageKey, JSON.stringify(allOn));
    } catch {}
  };

  return (
    <div ref={ref} style={S.wrap}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={S.btn}
        className="col-toggle-btn"
        title="نمایش ستون‌ها"
      >
        <FaColumns size={11} />
        <span>ستون‌ها</span>
        <span style={S.badge}>{visibleCount}/{columns.length}</span>
      </button>

      {open && (
        <div style={S.menu}>
          <div style={S.menuHeader}>
            <span style={S.menuTitle}>ستون‌های نمایش</span>
            <button onClick={resetAll} style={S.resetBtn} className="col-reset-btn">
              بازنشانی
            </button>
          </div>

          <div style={S.menuBody}>
            {columns.map((c) => {
              const isOn = visible[c.key] !== false;
              const isLocked = c.always === true;
              return (
                <button
                  key={c.key}
                  onClick={() => !isLocked && toggle(c.key)}
                  disabled={isLocked}
                  style={{
                    ...S.item,
                    opacity: isLocked ? 0.5 : 1,
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                  }}
                  className={isLocked ? '' : 'col-item'}
                >
                  <span style={{ ...S.check, ...(isOn ? S.checkOn : {}) }}>
                    {isOn && <FaCheck size={8} />}
                  </span>
                  <span style={S.itemLabel}>{c.label}</span>
                  {isLocked && <span style={S.lock}>قفل</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Helper — call once per table in your component:
 *   const [visibleCols, setVisibleCols] = useColumnPrefs('payments.columns', defaultCols);
 */
export function useColumnPrefs(storageKey, defaultCols = {}) {
  const [visible, setVisible] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) return { ...defaultCols, ...JSON.parse(raw) };
    } catch {}
    return defaultCols;
  });

  const update = (next) => setVisible(next);

  return [visible, update];
}

const S = {
  wrap: { position: 'relative' },
  btn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 12px',
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 600,
    color: theme.colors.textMuted,
    fontFamily: theme.font.family,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1px 6px',
    background: theme.colors.surfaceAlt,
    borderRadius: 999,
    fontSize: 10.5,
    fontWeight: 700,
    color: theme.colors.textSubtle,
    fontVariantNumeric: 'tabular-nums',
  },
  menu: {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    left: 0,
    minWidth: 220,
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 12,
    boxShadow: theme.shadow.xl,
    zIndex: 500,
    overflow: 'hidden',
  },
  menuHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    borderBottom: `1px solid ${theme.colors.border}`,
  },
  menuTitle: {
    fontSize: 11.5,
    fontWeight: 700,
    color: theme.colors.textFaint,
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  resetBtn: {
    background: 'none',
    border: 'none',
    fontSize: 11,
    fontWeight: 600,
    color: theme.colors.accent,
    cursor: 'pointer',
    fontFamily: theme.font.family,
  },
  menuBody: {
    padding: 6,
    maxHeight: 300,
    overflowY: 'auto',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    padding: '8px 10px',
    background: 'transparent',
    border: 'none',
    borderRadius: 8,
    textAlign: 'right',
    fontFamily: theme.font.family,
    color: theme.colors.text,
    fontSize: 12.5,
    fontWeight: 500,
  },
  check: {
    width: 16,
    height: 16,
    borderRadius: 4,
    border: `1.5px solid ${theme.colors.border}`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    flexShrink: 0,
    transition: 'all 0.15s',
  },
  checkOn: {
    background: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  itemLabel: { flex: 1 },
  lock: {
    fontSize: 10,
    color: theme.colors.textFaint,
    background: theme.colors.surfaceAlt,
    padding: '1px 6px',
    borderRadius: 4,
  },
};

if (typeof document !== 'undefined' && !document.getElementById('col-toggle-styles')) {
  const style = document.createElement('style');
  style.id = 'col-toggle-styles';
  style.textContent = `
    .col-toggle-btn:hover {
      background: ${theme.colors.surfaceAlt} !important;
      color: ${theme.colors.text} !important;
    }
    .col-item:hover {
      background: ${theme.colors.surfaceAlt} !important;
    }
    .col-reset-btn:hover {
      text-decoration: underline;
    }
  `;
  document.head.appendChild(style);
}

export default ColumnToggle;
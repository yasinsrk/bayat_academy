// src/components/BulkActionsBar.js
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaCheckCircle, FaTimesCircle, FaClock, FaBan,
  FaTrash, FaTimes, FaExclamationTriangle,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import theme from '../styles/adminTheme';

/**
 * Props:
 *   selectedIds     — array of selected row IDs
 *   onClear         — callback to clear selection
 *   actions         — array of action configs:
 *                     { key, label, icon: Component, color, bg, onClick: async (ids) => void }
 *   resourceName    — string like 'تراکنش' for confirmation text
 *   onRefresh       — callback after an action to reload data
 */
function BulkActionsBar({ selectedIds = [], onClear, actions = [], resourceName = 'ردیف', onRefresh }) {
  const [busy, setBusy] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  if (selectedIds.length === 0) return null;

  const handleAction = async (action) => {
    // Actions that need confirmation first
    if (action.danger) {
      setConfirmAction(action);
      return;
    }
    await runAction(action);
  };

  const runAction = async (action) => {
    setBusy(action.key);
    try {
      await action.onClick(selectedIds);
      toast.success(`${action.label} برای ${selectedIds.length.toLocaleString('fa-IR')} ${resourceName} انجام شد`);
      onClear && onClear();
      onRefresh && onRefresh();
    } catch (e) {
      toast.error(e?.response?.data?.error || 'خطا در انجام عملیات');
    } finally {
      setBusy(null);
      setConfirmAction(null);
    }
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.18 }}
          style={S.wrap}
        >
          <div style={S.count}>
            <span style={S.countNum}>{selectedIds.length.toLocaleString('fa-IR')}</span>
            <span style={S.countLabel}>{resourceName} انتخاب شده</span>
          </div>

          <div style={S.divider} />

          <div style={S.actions}>
            {actions.map((a) => {
              const Icon = a.icon;
              const isLoading = busy === a.key;
              return (
                <button
                  key={a.key}
                  onClick={() => handleAction(a)}
                  disabled={!!busy}
                  style={{
                    ...S.actionBtn,
                    color: a.color,
                    background: a.bg,
                    opacity: busy && !isLoading ? 0.5 : 1,
                  }}
                  className="bulk-action-btn"
                >
                  <Icon size={11} />
                  <span>{isLoading ? 'در حال انجام...' : a.label}</span>
                </button>
              );
            })}

            <button onClick={onClear} style={S.clearBtn} className="bulk-clear-btn" title="لغو انتخاب">
              <FaTimes size={11} />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Confirm dialog for dangerous actions */}
      {confirmAction && (
        <div style={S.confirmBackdrop} onClick={() => setConfirmAction(null)}>
          <div style={S.confirmBox} onClick={(e) => e.stopPropagation()}>
            <div style={S.confirmIcon}>
              <FaExclamationTriangle size={22} color={theme.colors.danger} />
            </div>
            <h3 style={S.confirmTitle}>تایید عملیات</h3>
            <p style={S.confirmText}>
              آیا از انجام «{confirmAction.label}» روی {selectedIds.length.toLocaleString('fa-IR')} {resourceName} مطمئن هستید؟
              این عمل قابل بازگشت نیست.
            </p>
            <div style={S.confirmActions}>
              <button
                onClick={() => setConfirmAction(null)}
                style={S.confirmCancel}
                disabled={!!busy}
              >
                انصراف
              </button>
              <button
                onClick={() => runAction(confirmAction)}
                style={S.confirmDanger}
                disabled={!!busy}
              >
                {busy ? 'در حال انجام...' : 'بله، حذف کن'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const S = {
  wrap: {
    position: 'fixed',
    bottom: 24,
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 900,
    background: theme.colors.sidebarBg,
    border: `1px solid ${theme.colors.sidebarBorder}`,
    borderRadius: 14,
    padding: '10px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    boxShadow: '0 20px 40px -12px rgba(15,23,42,0.35), 0 8px 16px -4px rgba(15,23,42,0.2)',
    maxWidth: 'calc(100vw - 32px)',
    flexWrap: 'wrap',
  },
  count: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 6,
  },
  countNum: {
    fontSize: 18,
    fontWeight: 800,
    color: '#FFFFFF',
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '-0.3px',
  },
  countLabel: {
    fontSize: 12,
    color: theme.colors.sidebarText,
    fontWeight: 500,
  },
  divider: {
    width: 1,
    height: 24,
    background: theme.colors.sidebarBorder,
  },
  actions: {
    display: 'flex',
    gap: 6,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  actionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '7px 12px',
    border: 'none',
    borderRadius: 9,
    fontSize: 12,
    fontWeight: 600,
    fontFamily: theme.font.family,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s',
  },
  clearBtn: {
    width: 30,
    height: 30,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: `1px solid ${theme.colors.sidebarBorder}`,
    borderRadius: 9,
    color: theme.colors.sidebarText,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },

  // ── Confirm modal ──
  confirmBackdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(11,15,26,0.55)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  confirmBox: {
    width: '100%',
    maxWidth: 400,
    background: theme.colors.surface,
    borderRadius: 16,
    padding: 24,
    boxShadow: theme.shadow.xl,
    textAlign: 'center',
  },
  confirmIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    background: theme.colors.dangerSoft,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 12px',
  },
  confirmTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: theme.colors.text,
    margin: '0 0 8px',
  },
  confirmText: {
    fontSize: 13,
    color: theme.colors.textSubtle,
    margin: '0 0 20px',
    lineHeight: 1.7,
  },
  confirmActions: {
    display: 'flex',
    gap: 8,
  },
  confirmCancel: {
    flex: 1,
    padding: '10px',
    background: theme.colors.surfaceAlt,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    color: theme.colors.textMuted,
    fontFamily: theme.font.family,
    cursor: 'pointer',
  },
  confirmDanger: {
    flex: 1,
    padding: '10px',
    background: theme.colors.danger,
    border: 'none',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 700,
    color: '#FFFFFF',
    fontFamily: theme.font.family,
    cursor: 'pointer',
  },
};

if (typeof document !== 'undefined' && !document.getElementById('bulk-actions-styles')) {
  const style = document.createElement('style');
  style.id = 'bulk-actions-styles';
  style.textContent = `
    .bulk-action-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      filter: brightness(0.95);
    }
    .bulk-clear-btn:hover {
      background: rgba(255,255,255,0.08) !important;
      color: #FFFFFF !important;
    }
    @media (max-width: 640px) {
      .bulk-actions-wrap {
        left: 12px !important;
        right: 12px !important;
        transform: none !important;
        bottom: 12px !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export default BulkActionsBar;
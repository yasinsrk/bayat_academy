// src/components/SavedViewsBar.js
import React, { useState, useRef, useEffect } from 'react';
import {
  FaBookmark, FaRegBookmark, FaPlus, FaTrash, FaStar,
  FaRegStar, FaChevronDown, FaTimes,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import theme from '../styles/adminTheme';
import useSavedViews from '../hooks/useSavedViews';

/**
 * Props:
 *   page       — 'payments' | 'users' | 'packages' | 'tickets' | 'audit'
 *   currentFilters — the current filter object to save
 *   onApply    — callback(filters) to apply a saved view
 */
function SavedViewsBar({ page, currentFilters = {}, onApply }) {
  const { views, loading, save, remove, setDefault } = useSavedViews(page);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const barRef = useRef(null);

  // Close menus on click outside
  useEffect(() => {
    const onClick = (e) => {
      if (barRef.current && !barRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleSave = async () => {
    const name = newName.trim();
    if (!name) {
      toast.warning('نام را وارد کنید');
      return;
    }
    try {
      await save({
        name,
        filters: currentFilters,
        icon: '',
        color: '',
      });
      setNewName('');
      setShowSaveModal(false);
    } catch {}
  };

  const handleApply = (view) => {
    if (onApply) onApply(view.filters || {});
    setOpenMenuId(null);
  };

  if (loading && views.length === 0) {
    return (
      <div style={S.bar} ref={barRef}>
        <div style={{ ...S.skelPill, width: 100 }} />
        <div style={{ ...S.skelPill, width: 120 }} />
      </div>
    );
  }

  return (
    <>
      <div style={S.bar} ref={barRef}>
        <div style={S.barLabel}>
          <FaRegBookmark size={11} />
          <span>نماهای ذخیره‌شده</span>
        </div>

        {views.length === 0 && (
          <span style={S.emptyHint}>هنوز نمایی ذخیره نکرده‌اید</span>
        )}

        {views.map((v) => (
          <div
            key={v.id}
            style={{ ...S.pill, ...(v.is_default ? S.pillDefault : {}) }}
            className="sv-pill"
          >
            <button
              onClick={() => handleApply(v)}
              style={S.pillBtn}
              title={JSON.stringify(v.filters)}
            >
              {v.is_default && <FaStar size={9} style={{ color: '#F59E0B' }} />}
              <span>{v.name}</span>
            </button>

            <div style={S.pillMenuWrap}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenuId(openMenuId === v.id ? null : v.id);
                }}
                style={S.pillMenuBtn}
              >
                <FaChevronDown size={7} />
              </button>

              {openMenuId === v.id && (
                <div style={S.dropdown}>
                  <button
                    onClick={() => { setDefault(v.id); setOpenMenuId(null); }}
                    style={S.dropItem}
                    className="sv-drop-item"
                  >
                    <FaStar size={10} />
                    {v.is_default ? 'حذف از پیش‌فرض' : 'تنظیم به‌عنوان پیش‌فرض'}
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`حذف نمای «${v.name}»؟`)) {
                        remove(v.id);
                      }
                      setOpenMenuId(null);
                    }}
                    style={{ ...S.dropItem, color: theme.colors.danger }}
                    className="sv-drop-item"
                  >
                    <FaTrash size={10} />
                    حذف
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        <button
          onClick={() => setShowSaveModal(true)}
          style={S.addBtn}
          className="sv-add-btn"
        >
          <FaPlus size={9} />
          <span>ذخیره نمای فعلی</span>
        </button>
      </div>

      {/* Save modal */}
      {showSaveModal && (
        <div style={S.modalBackdrop} onClick={() => setShowSaveModal(false)}>
          <div style={S.modal} onClick={(e) => e.stopPropagation()}>
            <div style={S.modalHeader}>
              <h3 style={S.modalTitle}>ذخیره نمای جدید</h3>
              <button onClick={() => setShowSaveModal(false)} style={S.modalClose}>
                <FaTimes size={12} />
              </button>
            </div>

            <div style={S.modalBody}>
              <label style={S.label}>نام نما</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="مثلاً: پرداخت‌های ناموفق ۷ روز اخیر"
                style={S.input}
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
              />

              <div style={S.previewBox}>
                <div style={S.previewLabel}>فیلترهای فعلی که ذخیره می‌شوند:</div>
                <pre style={S.previewPre}>
                  {JSON.stringify(currentFilters, null, 2)}
                </pre>
              </div>
            </div>

            <div style={S.modalFooter}>
              <button onClick={() => setShowSaveModal(false)} style={S.cancelBtn}>
                انصراف
              </button>
              <button onClick={handleSave} style={S.saveBtn} className="sv-save-btn">
                ذخیره
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const S = {
  bar: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 14px',
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 12,
    flexWrap: 'wrap',
    boxShadow: theme.shadow.sm,
  },
  barLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 11.5,
    fontWeight: 700,
    color: theme.colors.textFaint,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginRight: 4,
  },
  emptyHint: {
    fontSize: 12,
    color: theme.colors.textFaint,
    fontStyle: 'italic',
  },
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    background: theme.colors.surfaceAlt,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 999,
    overflow: 'hidden',
    transition: 'all 0.15s',
  },
  pillDefault: {
    background: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  pillBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '5px 10px',
    background: 'transparent',
    border: 'none',
    fontSize: 12,
    fontWeight: 600,
    color: theme.colors.text,
    fontFamily: theme.font.family,
    cursor: 'pointer',
  },
  pillMenuWrap: { position: 'relative' },
  pillMenuBtn: {
    padding: '5px 8px',
    background: 'transparent',
    border: 'none',
    borderRight: `1px solid ${theme.colors.border}`,
    color: theme.colors.textMuted,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    minWidth: 180,
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 10,
    boxShadow: theme.shadow.lg,
    padding: 4,
    zIndex: 500,
  },
  dropItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    padding: '8px 10px',
    background: 'transparent',
    border: 'none',
    borderRadius: 7,
    fontSize: 12,
    fontWeight: 500,
    color: theme.colors.text,
    fontFamily: theme.font.family,
    cursor: 'pointer',
    textAlign: 'right',
  },
  addBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    background: theme.colors.accentSoft,
    border: `1px dashed ${theme.colors.accentBorder}`,
    borderRadius: 999,
    fontSize: 11.5,
    fontWeight: 600,
    color: theme.colors.accent,
    fontFamily: theme.font.family,
    cursor: 'pointer',
    marginRight: 'auto',
  },
  skelPill: {
    height: 26,
    borderRadius: 999,
    background: 'linear-gradient(90deg, #EEF0F4 0%, #F7F8FA 50%, #EEF0F4 100%)',
    backgroundSize: '200% 100%',
    animation: 'sv-skel 1.4s ease-in-out infinite',
  },

  // Modal
  modalBackdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(11,15,26,0.5)',
    backdropFilter: 'blur(6px)',
    WebkitBackdropFilter: 'blur(6px)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    width: '100%',
    maxWidth: 480,
    background: theme.colors.surface,
    borderRadius: 16,
    boxShadow: theme.shadow.xl,
    overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: `1px solid ${theme.colors.border}`,
  },
  modalTitle: {
    fontSize: 14.5,
    fontWeight: 700,
    color: theme.colors.text,
    margin: 0,
  },
  modalClose: {
    width: 28,
    height: 28,
    background: 'none',
    border: 'none',
    color: theme.colors.textFaint,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: theme.colors.textMuted,
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    background: theme.colors.surfaceAlt,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 10,
    fontSize: 13,
    color: theme.colors.text,
    fontFamily: theme.font.family,
    outline: 'none',
    boxSizing: 'border-box',
  },
  previewBox: {
    padding: 12,
    background: theme.colors.surfaceAlt,
    borderRadius: 10,
    border: `1px solid ${theme.colors.border}`,
  },
  previewLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: theme.colors.textFaint,
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    marginBottom: 6,
  },
  previewPre: {
    margin: 0,
    fontSize: 11,
    fontFamily: 'monospace',
    color: theme.colors.textMuted,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    direction: 'ltr',
    textAlign: 'left',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 8,
    padding: '12px 20px',
    borderTop: `1px solid ${theme.colors.border}`,
  },
  cancelBtn: {
    padding: '8px 20px',
    background: theme.colors.surfaceAlt,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 10,
    fontSize: 12.5,
    fontWeight: 600,
    color: theme.colors.textMuted,
    fontFamily: theme.font.family,
    cursor: 'pointer',
  },
  saveBtn: {
    padding: '8px 20px',
    background: `linear-gradient(135deg, ${theme.colors.accent} 0%, #7C5CE7 100%)`,
    border: 'none',
    borderRadius: 10,
    fontSize: 12.5,
    fontWeight: 600,
    color: '#FFFFFF',
    fontFamily: theme.font.family,
    cursor: 'pointer',
    boxShadow: `0 4px 14px ${theme.colors.accentGlow}`,
  },
};

if (typeof document !== 'undefined' && !document.getElementById('sv-styles')) {
  const style = document.createElement('style');
  style.id = 'sv-styles';
  style.textContent = `
    @keyframes sv-skel {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .sv-pill:hover {
      border-color: ${theme.colors.accentBorder} !important;
      background: ${theme.colors.accentSoft} !important;
    }
    .sv-add-btn:hover {
      background: ${theme.colors.accent} !important;
      color: #FFFFFF !important;
      border-color: ${theme.colors.accent} !important;
    }
    .sv-drop-item:hover {
      background: ${theme.colors.surfaceAlt} !important;
    }
    .sv-save-btn:hover {
      transform: translateY(-1px);
    }
  `;
  document.head.appendChild(style);
}

export default SavedViewsBar;
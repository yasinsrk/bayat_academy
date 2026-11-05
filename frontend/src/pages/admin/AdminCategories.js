// src/pages/admin/AdminCategories.js
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FaPlus, FaTrash, FaSearch, FaTimes, FaFolder,
  FaTag, FaBox, FaFolderOpen, FaChevronLeft, FaChevronRight,
  FaCheckCircle, FaExclamationTriangle, FaLayerGroup,
  FaArrowUp, FaInfoCircle,
} from 'react-icons/fa';
import AdminLayout from './AdminLayout';
import ExportMenu from '../../components/ExportMenu';
import BulkActionsBar from '../../components/BulkActionsBar';
import ColumnToggle, { useColumnPrefs } from '../../components/ColumnToggle';
import { toast } from 'react-toastify';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import theme from '../../styles/adminTheme';
import { formatJalali } from '../../utils/jalali';

const API = '/api/packages/categories';

const COLUMNS = [
  { key: 'name',     label: 'نام دسته', always: true },
  { key: 'packages', label: 'تعداد دوره‌ها' },
  { key: 'created',  label: 'تاریخ ایجاد' },
  { key: 'actions',  label: 'عملیات', always: true },
];

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [visibleCols, setVisibleCols] = useColumnPrefs('categories.columns', {
    name: true, packages: true, created: true, actions: true,
  });

  // Create modal
  const [showModal, setShowModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Fetch ──
  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const res = await axios.get(`${API}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let data = [];
      if (res.data?.results) data = res.data.results;
      else if (Array.isArray(res.data)) data = res.data;
      setCategories(data);
    } catch (e) {
      console.error(e);
      toast.error('خطا در دریافت دسته‌بندی‌ها');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Filtered ──
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const term = searchTerm.toLowerCase();
    return categories.filter((c) =>
      (c.name || '').toLowerCase().includes(term)
    );
  }, [categories, searchTerm]);

  // ── Stats ──
  const stats = useMemo(() => ({
    total: categories.length,
    used: categories.filter((c) => (c.packages?.length || 0) > 0).length,
    empty: categories.filter((c) => !(c.packages?.length || 0)).length,
    totalPackages: categories.reduce(
      (sum, c) => sum + (c.packages?.length || 0), 0
    ),
  }), [categories]);

  // ── Create ──
  const handleCreate = async () => {
    if (!newCategoryName.trim()) {
      toast.error('نام دسته‌بندی را وارد کنید');
      return;
    }
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${API}/`,
        { name: newCategoryName.trim() },
        { headers: { Authorization: `Bearer ${token}` } });
      toast.success('دسته‌بندی ایجاد شد');
      setNewCategoryName('');
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      const msg = err.response?.data?.name?.[0]
        || err.response?.data?.error
        || 'خطا در ایجاد دسته‌بندی';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Delete single ──
  const handleDelete = async (id, name) => {
    const cat = categories.find((c) => c.id === id);
    const count = cat?.packages?.length || 0;

    if (count > 0) {
      toast.error(`این دسته در ${count} دوره استفاده شده و قابل حذف نیست`);
      return;
    }

    if (!window.confirm(`دسته «${name}» حذف شود؟`)) return;

    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${API}/${id}/`,
        { headers: { Authorization: `Bearer ${token}` } });
      toast.success('دسته حذف شد');
      fetchCategories();
    } catch {
      toast.error('خطا در حذف');
    }
  };

  // ── Bulk ──
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const allIds = filteredCategories.map((c) => c.id);
    const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds.includes(id));
    if (allSelected) setSelectedIds([]);
    else setSelectedIds(allIds);
  };

  const clearSelection = () => setSelectedIds([]);

  const bulkDelete = async (ids) => {
    const token = localStorage.getItem('access_token');
    const res = await axios.post(`${API}/bulk/delete/`, { ids },
      { headers: { Authorization: `Bearer ${token}` } });

    const { deleted, skipped_count } = res.data;
    if (skipped_count > 0) {
      toast.warning(`${deleted} دسته حذف شد، ${skipped_count} دسته در حال استفاده بود`);
    }
  };

  // ── Export ──
  const exportData = useMemo(() => filteredCategories.map((c) => ({
    'نام': c.name,
    'تعداد دوره‌ها': c.packages?.length || 0,
    'تاریخ ایجاد': c.created_at,
  })), [filteredCategories]);

  if (loading) {
    return (
      <AdminLayout>
        <CategorySkeleton />
      </AdminLayout>
    );
  }

  const allSelected = filteredCategories.length > 0 &&
    filteredCategories.every((c) => selectedIds.includes(c.id));

  return (
    <AdminLayout>
      <div style={S.container}>

        {/* HEADER */}
        <div style={S.pageHeader} className="cat-page-header">
          <div>
            <h1 style={S.pageTitle}>مدیریت دسته‌بندی‌ها</h1>
            <p style={S.pageSubtitle}>
              سازمان‌دهی دوره‌ها در گروه‌های موضوعی
            </p>
          </div>
          <div style={S.headerActions}>
            <ColumnToggle
              storageKey="categories.columns"
              columns={COLUMNS}
              visible={visibleCols}
              onChange={setVisibleCols}
            />
            <ExportMenu data={exportData} filename="categories" title="گزارش دسته‌بندی‌ها" />
            <button onClick={() => setShowModal(true)} style={S.btnPrimary} className="cat-btn-primary">
              <FaPlus size={11} />
              <span>دسته جدید</span>
            </button>
          </div>
        </div>

        {/* STATS */}
        <div style={S.statsGrid} className="cat-stats-grid">
          <StatCard icon={FaLayerGroup} label="کل دسته‌ها" value={stats.total}
            color={theme.colors.tintIndigo} soft={theme.colors.tintIndigoSoft} />
          <StatCard icon={FaBox} label="دوره‌ها" value={stats.totalPackages}
            color={theme.colors.tintEmerald} soft={theme.colors.tintEmeraldSoft} />
          <StatCard icon={FaFolderOpen} label="در حال استفاده" value={stats.used}
            color={theme.colors.accent} soft={theme.colors.accentSoft} />
          <StatCard icon={FaFolder} label="خالی" value={stats.empty}
            color={theme.colors.textMuted} soft={theme.colors.surfaceAlt} />
        </div>

        {/* FILTERS */}
        <div style={S.filtersCard} className="cat-filters-card">
          <div style={S.searchWrapper}>
            <FaSearch size={11} style={S.searchIcon} />
            <input
              type="text"
              placeholder="جستجوی دسته‌بندی..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={S.searchInput}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} style={S.clearSearch} className="cat-clear-search">
                <FaTimes size={10} />
              </button>
            )}
          </div>
          <div style={S.filtersMeta}>
            <span style={S.filtersCount}>
              {filteredCategories.length.toLocaleString('fa-IR')} دسته‌بندی
              {searchTerm && ` از ${categories.length.toLocaleString('fa-IR')}`}
            </span>
          </div>
        </div>

        {/* TABLE */}
        <div style={S.tableCard} className="cat-table-card">
          {filteredCategories.length === 0 ? (
            <div style={S.empty}>
              <div style={S.emptyIconWrap}>
                <FaFolder size={22} color={theme.colors.textFaint} />
              </div>
              <h4 style={S.emptyTitle}>
                {searchTerm ? 'نتیجه‌ای یافت نشد' : 'هنوز دسته‌بندی‌ای ندارید'}
              </h4>
              <p style={S.emptyDesc}>
                {searchTerm
                  ? `هیچ دسته‌بندی با «${searchTerm}» مطابقت نداشت.`
                  : 'با ایجاد اولین دسته‌بندی، دوره‌ها را سازمان‌دهی کنید.'}
              </p>
              {!searchTerm && (
                <button onClick={() => setShowModal(true)} style={S.emptyCta} className="cat-empty-cta">
                  <FaPlus size={10} /> ایجاد دسته‌بندی
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div style={S.tableWrap} className="cat-desktop-table">
                <table style={S.table}>
                  <thead>
                    <tr>
                      <th style={{ ...S.th, width: 42 }}>
                        <input type="checkbox" checked={allSelected}
                          onChange={toggleSelectAll} style={S.checkbox} />
                      </th>
                      {visibleCols.name && <th style={S.th}>نام دسته</th>}
                      {visibleCols.packages && <th style={S.th}>تعداد دوره‌ها</th>}
                      {visibleCols.created && <th style={S.th}>تاریخ ایجاد</th>}
                      {visibleCols.actions && <th style={S.th}></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCategories.map((cat) => {
                      const count = cat.packages?.length || 0;
                      const isSelected = selectedIds.includes(cat.id);
                      return (
                        <tr key={cat.id}
                          style={{ ...S.tr, ...(isSelected ? S.trSelected : {}) }}
                          className="cat-row">
                          <td style={{ ...S.td, width: 42 }}>
                            <input type="checkbox" checked={isSelected}
                              onChange={() => toggleSelect(cat.id)} style={S.checkbox} />
                          </td>
                          {visibleCols.name && (
                            <td style={S.td}>
                              <div style={S.catCell}>
                                <div style={S.catIcon}>
                                  <FaFolder size={12} color={theme.colors.accent} />
                                </div>
                                <span style={S.catName}>{cat.name}</span>
                              </div>
                            </td>
                          )}
                          {visibleCols.packages && (
                            <td style={S.td}>
                              <span style={{
                                ...S.countBadge,
                                ...(count === 0 ? S.countBadgeEmpty : {}),
                              }}>
                                <FaBox size={9} />
                                {count.toLocaleString('fa-IR')} دوره
                              </span>
                            </td>
                          )}
                          {visibleCols.created && (
                            <td style={{ ...S.td, color: theme.colors.textSubtle }}>
                              {formatJalali(cat.created_at)}
                            </td>
                          )}
                          {visibleCols.actions && (
                            <td style={S.td}>
                              <div style={S.actionsGroup}>
                                <Link to={`/admin/packages?category=${cat.id}`}
                                  style={S.rowAction}
                                  className="cat-row-action"
                                  title="مشاهده دوره‌ها">
                                  <FaBox size={11} />
                                </Link>
                                <button
                                  onClick={() => handleDelete(cat.id, cat.name)}
                                  style={{
                                    ...S.rowAction,
                                    color: count > 0 ? theme.colors.textFaint : theme.colors.danger,
                                    cursor: count > 0 ? 'not-allowed' : 'pointer',
                                    opacity: count > 0 ? 0.4 : 1,
                                  }}
                                  className={count > 0 ? '' : 'cat-row-action-danger'}
                                  title={count > 0 ? 'دسته در حال استفاده' : 'حذف'}
                                  disabled={count > 0}>
                                  <FaTrash size={11} />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="cat-mobile-cards">
                {filteredCategories.map((cat) => {
                  const count = cat.packages?.length || 0;
                  const isSelected = selectedIds.includes(cat.id);
                  return (
                    <div key={cat.id}
                      style={{
                        ...S.mobileCard,
                        ...(isSelected ? S.mobileCardSelected : {}),
                      }}>
                      <div style={S.mobileCheckRow}>
                        <input type="checkbox" checked={isSelected}
                          onChange={() => toggleSelect(cat.id)} style={S.checkbox} />
                        <span style={S.mobileSelectedLabel}>انتخاب</span>
                      </div>
                      <div style={S.mobileTop}>
                        <div style={S.catCell}>
                          <div style={S.catIcon}>
                            <FaFolder size={12} color={theme.colors.accent} />
                          </div>
                          <span style={S.catName}>{cat.name}</span>
                        </div>
                        <span style={{
                          ...S.countBadge,
                          ...(count === 0 ? S.countBadgeEmpty : {}),
                        }}>
                          <FaBox size={9} />
                          {count.toLocaleString('fa-IR')}
                        </span>
                      </div>
                      {cat.created_at && (
                        <div style={S.mobileTime}>
                          ایجاد: {formatJalali(cat.created_at)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

      </div>

      {/* CREATE MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={S.modalBackdrop}
            onClick={() => setShowModal(false)}>
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ duration: 0.18 }}
              style={S.modal}
              onClick={(e) => e.stopPropagation()}>

              <div style={S.modalHeader}>
                <h3 style={S.modalTitle}>ایجاد دسته‌بندی جدید</h3>
                <button onClick={() => setShowModal(false)} style={S.modalClose}>
                  <FaTimes size={12} />
                </button>
              </div>

              <div style={S.modalBody}>
                <label style={S.label}>نام دسته‌بندی</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
                  placeholder="مثلاً: هوش مصنوعی"
                  style={S.input}
                  autoFocus
                  maxLength={100}
                />
                <div style={S.helperText}>
                  <FaInfoCircle size={10} />
                  نام دسته‌بندی باید یکتا باشد
                </div>
              </div>

              <div style={S.modalFooter}>
                <button onClick={() => setShowModal(false)} style={S.modalCancel}
                  disabled={isSubmitting}>
                  انصراف
                </button>
                <button onClick={handleCreate} style={S.modalSubmit}
                  className="cat-modal-submit"
                  disabled={isSubmitting || !newCategoryName.trim()}>
                  <FaPlus size={11} />
                  {isSubmitting ? 'در حال ایجاد...' : 'ایجاد دسته'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BULK ACTIONS */}
      <BulkActionsBar
        selectedIds={selectedIds}
        onClear={clearSelection}
        resourceName="دسته‌بندی"
        onRefresh={fetchCategories}
        actions={[
          {
            key: 'delete',
            label: 'حذف',
            icon: FaTrash,
            color: '#FFFFFF',
            bg: theme.colors.danger,
            danger: true,
            onClick: bulkDelete,
          },
        ]}
      />

    </AdminLayout>
  );
}

// ═══════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════

function StatCard({ icon: Icon, label, value, color, soft }) {
  return (
    <div style={S.statCard} className="cat-card-static">
      <div style={{ ...S.statIconBox, background: soft }}>
        <Icon size={14} color={color} />
      </div>
      <div style={S.statLabel}>{label}</div>
      <div style={S.statValue}>{(value || 0).toLocaleString('fa-IR')}</div>
    </div>
  );
}

function CategorySkeleton() {
  return (
    <div style={S.container}>
      <div style={S.pageHeader}>
        <div>
          <div style={{ ...S.skelBar, width: 200, height: 26 }} />
          <div style={{ ...S.skelBar, width: 240, height: 14, marginTop: 10 }} />
        </div>
        <div style={{ ...S.skelBar, width: 220, height: 38, borderRadius: 10 }} />
      </div>
      <div style={S.statsGrid} className="cat-stats-grid">
        {[0,1,2,3].map((i) => (
          <div key={i} style={S.statCard}>
            <div style={{ ...S.skelBar, width: 36, height: 36, borderRadius: 10 }} />
            <div style={{ ...S.skelBar, width: 70, height: 12, marginTop: 12 }} />
            <div style={{ ...S.skelBar, width: 100, height: 22, marginTop: 6 }} />
          </div>
        ))}
      </div>
      <div style={{ ...S.skelBar, width: '100%', height: 300, borderRadius: 14 }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════

const S = {
  container: { maxWidth: 1360, margin: '0 auto', display: 'flex',
    flexDirection: 'column', gap: 20, minWidth: 0 },

  pageHeader: { display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' },
  pageTitle: { fontSize: 24, fontWeight: 800, color: theme.colors.text,
    margin: 0, letterSpacing: '-0.4px' },
  pageSubtitle: { fontSize: 13, color: theme.colors.textSubtle, margin: '6px 0 0' },
  headerActions: { display: 'flex', gap: 8, flexWrap: 'wrap' },

  btnPrimary: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '9px 16px',
    background: `linear-gradient(135deg, ${theme.colors.accent} 0%, #7C5CE7 100%)`,
    border: 'none', borderRadius: 10,
    fontSize: 12.5, fontWeight: 700,
    color: '#FFFFFF', fontFamily: theme.font.family,
    cursor: 'pointer',
    boxShadow: `0 4px 14px ${theme.colors.accentGlow}`,
    whiteSpace: 'nowrap',
  },

  statsGrid: { display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 },
  statCard: {
    background: theme.colors.surface, border: `1px solid ${theme.colors.border}`,
    borderRadius: 14, padding: 18, boxShadow: theme.shadow.sm,
    display: 'flex', flexDirection: 'column', gap: 8,
  },
  statIconBox: { width: 36, height: 36, borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statLabel: { fontSize: 12, fontWeight: 500, color: theme.colors.textSubtle },
  statValue: { fontSize: 24, fontWeight: 800, color: theme.colors.text,
    letterSpacing: '-0.6px', fontVariantNumeric: 'tabular-nums', lineHeight: 1 },

  filtersCard: {
    background: theme.colors.surface, border: `1px solid ${theme.colors.border}`,
    borderRadius: 14, boxShadow: theme.shadow.sm, padding: 16,
    display: 'flex', flexDirection: 'column', gap: 12,
  },
  searchWrapper: { position: 'relative' },
  searchIcon: { position: 'absolute', right: 14, top: '50%',
    transform: 'translateY(-50%)', color: theme.colors.textFaint },
  searchInput: {
    width: '100%', padding: '11px 40px 11px 14px',
    background: theme.colors.surfaceAlt, border: `1px solid ${theme.colors.border}`,
    borderRadius: 10, fontSize: 13, color: theme.colors.text,
    fontFamily: theme.font.family, outline: 'none', boxSizing: 'border-box',
  },
  clearSearch: {
    position: 'absolute', left: 12, top: '50%',
    transform: 'translateY(-50%)',
    background: theme.colors.surface, border: 'none',
    width: 20, height: 20, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: theme.colors.textFaint, cursor: 'pointer',
  },
  filtersMeta: { display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', gap: 8 },
  filtersCount: { fontSize: 12, color: theme.colors.textSubtle, fontWeight: 500 },

  tableCard: {
    background: theme.colors.surface, border: `1px solid ${theme.colors.border}`,
    borderRadius: 14, boxShadow: theme.shadow.sm, overflow: 'hidden',
  },
  tableWrap: { overflowX: 'auto', WebkitOverflowScrolling: 'touch' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'right', padding: '12px 16px', fontSize: 10.5,
    fontWeight: 700, color: theme.colors.textFaint, textTransform: 'uppercase',
    letterSpacing: '0.5px', background: theme.colors.surfaceAlt,
    borderBottom: `1px solid ${theme.colors.border}`, whiteSpace: 'nowrap',
  },
  tr: { borderBottom: `1px solid ${theme.colors.borderSoft}`,
    transition: 'background 0.15s' },
  trSelected: { background: theme.colors.accentSoft },
  td: {
    padding: '12px 16px', fontSize: 13, color: theme.colors.text,
    fontFamily: theme.font.family, verticalAlign: 'middle', whiteSpace: 'nowrap',
  },
  checkbox: { width: 16, height: 16,
    accentColor: theme.colors.accent, cursor: 'pointer' },

  catCell: { display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 },
  catIcon: {
    width: 36, height: 36, borderRadius: 10,
    background: theme.colors.accentSoft,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  catName: {
    fontSize: 13.5, fontWeight: 700, color: theme.colors.text,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },

  countBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '4px 10px', borderRadius: 999,
    background: theme.colors.accentSoft,
    color: theme.colors.accent,
    fontSize: 11.5, fontWeight: 700,
  },
  countBadgeEmpty: {
    background: theme.colors.surfaceAlt,
    color: theme.colors.textFaint,
  },

  actionsGroup: { display: 'flex', gap: 4 },
  rowAction: {
    width: 28, height: 28, display: 'inline-flex',
    alignItems: 'center', justifyContent: 'center',
    background: theme.colors.surfaceAlt, border: 'none', borderRadius: 8,
    color: theme.colors.textMuted, cursor: 'pointer',
    transition: 'all 0.15s', textDecoration: 'none',
  },

  // Mobile
  mobileCard: {
    display: 'block', width: '100%', textAlign: 'right',
    padding: 14, background: theme.colors.surface,
    borderBottom: `1px solid ${theme.colors.borderSoft}`,
    fontFamily: theme.font.family,
  },
  mobileCardSelected: { background: theme.colors.accentSoft },
  mobileCheckRow: { display: 'flex', alignItems: 'center',
    gap: 8, marginBottom: 10 },
  mobileSelectedLabel: {
    fontSize: 11.5, color: theme.colors.textSubtle, fontWeight: 500,
  },
  mobileTop: { display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', gap: 8, marginBottom: 6 },
  mobileTime: { fontSize: 11, color: theme.colors.textFaint, marginTop: 4 },

  // Empty
  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', gap: 8, padding: '56px 20px', textAlign: 'center',
  },
  emptyIconWrap: {
    width: 56, height: 56, borderRadius: 16,
    background: theme.colors.surfaceAlt, display: 'flex',
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  emptyTitle: { fontSize: 14, fontWeight: 700, color: theme.colors.text, margin: 0 },
  emptyDesc: {
    fontSize: 12.5, color: theme.colors.textSubtle, margin: 0,
    maxWidth: 320, lineHeight: 1.6,
  },
  emptyCta: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    marginTop: 8, padding: '9px 18px',
    background: theme.colors.accentSoft, color: theme.colors.accent,
    borderRadius: 10, fontSize: 12.5, fontWeight: 700,
    textDecoration: 'none', fontFamily: theme.font.family,
    cursor: 'pointer', border: 'none',
  },

  // Modal
  modalBackdrop: {
    position: 'fixed', inset: 0, background: 'rgba(11,15,26,0.5)',
    backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
    zIndex: 1000, display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: 20,
  },
  modal: {
    width: '100%', maxWidth: 460,
    background: theme.colors.surface, borderRadius: 16,
    boxShadow: theme.shadow.xl, overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '18px 20px',
    borderBottom: `1px solid ${theme.colors.border}`,
  },
  modalTitle: {
    fontSize: 15, fontWeight: 700, color: theme.colors.text, margin: 0,
  },
  modalClose: {
    width: 28, height: 28, background: 'none', border: 'none',
    color: theme.colors.textFaint, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  },
  modalBody: {
    padding: '20px', display: 'flex', flexDirection: 'column', gap: 8,
  },
  label: { fontSize: 12, fontWeight: 600, color: theme.colors.textMuted },
  input: {
    padding: '11px 14px', background: theme.colors.surfaceAlt,
    border: `1px solid ${theme.colors.border}`, borderRadius: 10,
    fontSize: 13, color: theme.colors.text, fontFamily: theme.font.family,
    outline: 'none', width: '100%', boxSizing: 'border-box',
  },
  helperText: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    fontSize: 11.5, color: theme.colors.textFaint,
  },
  modalFooter: {
    display: 'flex', justifyContent: 'flex-end', gap: 8,
    padding: '12px 20px',
    borderTop: `1px solid ${theme.colors.border}`,
    background: theme.colors.surfaceAlt,
  },
  modalCancel: {
    padding: '9px 18px', background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`, borderRadius: 10,
    fontSize: 12.5, fontWeight: 600, color: theme.colors.textMuted,
    fontFamily: theme.font.family, cursor: 'pointer',
  },
  modalSubmit: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '9px 20px',
    background: `linear-gradient(135deg, ${theme.colors.accent} 0%, #7C5CE7 100%)`,
    border: 'none', borderRadius: 10,
    fontSize: 12.5, fontWeight: 700, color: '#FFFFFF',
    fontFamily: theme.font.family, cursor: 'pointer',
    boxShadow: `0 4px 14px ${theme.colors.accentGlow}`,
  },

  skelBar: {
    background: 'linear-gradient(90deg, #EEF0F4 0%, #F7F8FA 50%, #EEF0F4 100%)',
    backgroundSize: '200% 100%', borderRadius: 6,
    animation: 'cat-skel 1.4s ease-in-out infinite',
  },
};

if (typeof document !== 'undefined' && !document.getElementById('admin-categories-styles')) {
  const style = document.createElement('style');
  style.id = 'admin-categories-styles';
  style.textContent = `
    @keyframes cat-skel {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .cat-card-static { transition: box-shadow 0.18s ease !important; }
    .cat-card-static:hover {
      box-shadow: 0 8px 24px -6px rgba(15,23,42,0.08), 0 2px 6px -2px rgba(15,23,42,0.04) !important;
    }
    .cat-row:hover { background: ${theme.colors.surfaceAlt}; }
    .cat-row:last-child { border-bottom: none; }
    .cat-row-action:hover {
      background: ${theme.colors.accentSoft} !important;
      color: ${theme.colors.accent} !important;
    }
    .cat-row-action-danger:hover {
      background: ${theme.colors.dangerSoft} !important;
      color: ${theme.colors.danger} !important;
    }
    .cat-clear-search:hover {
      background: ${theme.colors.surfaceAlt} !important;
      color: ${theme.colors.text} !important;
    }
    .cat-btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 22px ${theme.colors.accentGlow} !important;
    }
    .cat-empty-cta:hover {
      background: ${theme.colors.accent} !important;
      color: #FFFFFF !important;
    }
    .cat-modal-submit:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 8px 22px ${theme.colors.accentGlow} !important;
    }
    .cat-modal-submit:disabled { opacity: 0.5; cursor: not-allowed; }

    .cat-mobile-cards { display: none; }

    @media (max-width: 1023px) {
      .cat-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
    }
    @media (max-width: 768px) {
      .cat-page-header {
        flex-direction: column !important;
        align-items: stretch !important;
      }
      .cat-stats-grid { grid-template-columns: 1fr 1fr !important; }
      .cat-desktop-table { display: none !important; }
      .cat-mobile-cards { display: block !important; }
    }
  `;
  document.head.appendChild(style);
}

export default AdminCategories;
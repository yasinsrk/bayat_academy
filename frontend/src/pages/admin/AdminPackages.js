// src/pages/admin/AdminPackages.js
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FaPlus, FaEdit, FaTrash, FaSearch, FaFilter,
  FaEye, FaEyeSlash, FaStar, FaBox, FaGift,
  FaChevronLeft, FaChevronRight, FaCheckCircle,
  FaTimesCircle, FaInfoCircle, FaTag, FaClock,
  FaBookOpen, FaUserGraduate, FaLayerGroup,
} from 'react-icons/fa';
import AdminLayout from './AdminLayout';
import SavedViewsBar from '../../components/SavedViewsBar';
import ExportMenu from '../../components/ExportMenu';
import BulkActionsBar from '../../components/BulkActionsBar';
import ColumnToggle, { useColumnPrefs } from '../../components/ColumnToggle';
import { toast } from 'react-toastify';
import axios from 'axios';
import theme from '../../styles/adminTheme';
import { formatJalali } from '../../utils/jalali';

const API = '/api/packages/packages';

const COLUMNS = [
  { key: 'title',    label: 'عنوان', always: true },
  { key: 'price',    label: 'قیمت' },
  { key: 'category', label: 'دسته‌بندی' },
  { key: 'status',   label: 'وضعیت' },
  { key: 'topics',   label: 'سرفصل‌ها' },
  { key: 'students', label: 'دانشجو' },
  { key: 'date',     label: 'تاریخ' },
  { key: 'actions',  label: 'عملیات', always: true },
];

function AdminPackages() {
  const [packages, setPackages] = useState([]);
  const [filteredPackages, setFilteredPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // Table
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedIds, setSelectedIds] = useState([]);

  // Column toggle
  const [visibleCols, setVisibleCols] = useColumnPrefs('packages.columns', {
    title: true, price: true, category: true, status: true,
    topics: true, students: true, date: true, actions: true,
  });

  useEffect(() => { fetchPackages(); }, []);

  useEffect(() => { if (packages.length > 0) applyFilters(); },
    // eslint-disable-next-line
    [packages, searchTerm, filterStatus, filterType]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const res = await axios.get(`${API}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let data = [];
      if (res.data?.results) data = res.data.results;
      else if (Array.isArray(res.data)) data = res.data;
      setPackages(data);
      setFilteredPackages(data);
    } catch (e) {
      console.error(e);
      toast.error('خطا در دریافت دوره‌ها');
      setPackages([]); setFilteredPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let data = [...packages];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter((p) =>
        (p.title || '').toLowerCase().includes(term) ||
        (p.slug || '').toLowerCase().includes(term)
      );
    }

    if (filterStatus !== 'all') {
      data = data.filter((p) =>
        filterStatus === 'published' ? p.is_published : !p.is_published
      );
    }

    if (filterType !== 'all') {
      data = data.filter((p) => {
        if (filterType === 'free') return p.is_free;
        if (filterType === 'paid') return !p.is_free;
        if (filterType === 'top') return p.is_top;
        if (filterType === 'discount') return p.has_discount;
        return true;
      });
    }

    setFilteredPackages(data);
    setCurrentPage(1);
  };

  // Stats
  const stats = useMemo(() => ({
    total: packages.length,
    published: packages.filter((p) => p.is_published).length,
    draft: packages.filter((p) => !p.is_published).length,
    free: packages.filter((p) => p.is_free).length,
    totalStudents: packages.reduce((sum, p) => sum + (p.students_count || 0), 0),
  }), [packages]);

  // Pagination
  const totalPages = Math.ceil(filteredPackages.length / itemsPerPage);
  const currentItems = filteredPackages.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Bulk
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const allIds = currentItems.map((p) => p.id);
    const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds.includes(id));
    if (allSelected) setSelectedIds((prev) => prev.filter((id) => !allIds.includes(id)));
    else setSelectedIds((prev) => Array.from(new Set([...prev, ...allIds])));
  };

  const clearSelection = () => setSelectedIds([]);

  const handleBulk = async (endpoint, body = {}) => {
    const token = localStorage.getItem('access_token');
    await axios.post(`${API}/../${endpoint}`, body,
      { headers: { Authorization: `Bearer ${token}` } });
  };

  const bulkPublish = (ids) => handleBulk('bulk/publish/', { ids });
  const bulkUnpublish = (ids) => handleBulk('bulk/unpublish/', { ids });
  const bulkMarkTop = (ids) => handleBulk('bulk/mark-top/', { ids, value: true });
  const bulkDelete = (ids) => handleBulk('bulk/delete/', { ids });

  const handleDelete = async (id) => {
    if (!window.confirm('این دوره حذف شود؟')) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${API}/${id}/`,
        { headers: { Authorization: `Bearer ${token}` } });
      toast.success('دوره حذف شد');
      fetchPackages();
    } catch { toast.error('خطا در حذف'); }
  };

  const handleTogglePublish = async (pkg) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.patch(`${API}/${pkg.id}/`,
        { is_published: !pkg.is_published },
        { headers: { Authorization: `Bearer ${token}` } });
      toast.success(pkg.is_published ? 'پیش‌نویس شد' : 'منتشر شد');
      fetchPackages();
    } catch { toast.error('خطا'); }
  };

  const exportData = useMemo(() => filteredPackages.map((p) => ({
    'عنوان': p.title,
    'قیمت': p.is_free ? 'رایگان' : p.display_price_str || '',
    'دسته‌بندی': (p.categories || []).map((c) => c.name).join('، ') || '—',
    'وضعیت': p.is_published ? 'منتشر شده' : 'پیش‌نویس',
    'سرفصل‌ها': p.topics_count || 0,
    'دانشجو': p.students_count || 0,
    'تاریخ': p.created_at,
  })), [filteredPackages]);

  if (loading) {
    return <AdminLayout><PackageSkeleton /></AdminLayout>;
  }

  const allOnPageSelected = currentItems.length > 0 &&
    currentItems.every((p) => selectedIds.includes(p.id));

  return (
    <AdminLayout>
      <div style={S.container}>

        {/* HEADER */}
        <div style={S.pageHeader} className="pkg-page-header">
          <div>
            <h1 style={S.pageTitle}>مدیریت دوره‌ها</h1>
            <p style={S.pageSubtitle}>مدیریت و ویرایش دوره‌های آموزشی</p>
          </div>
          <div style={S.headerActions}>
            <ColumnToggle storageKey="packages.columns"
              columns={COLUMNS} visible={visibleCols} onChange={setVisibleCols} />
            <ExportMenu data={exportData} filename="packages" title="گزارش دوره‌ها" />
            <Link to="/adminpanel/m1/admin/packages/add" style={S.btnPrimary} className="pkg-btn-primary">
              <FaPlus size={11} /> <span>دوره جدید</span>
            </Link>
          </div>
        </div>

        {/* STATS */}
        <div style={S.statsGrid} className="pkg-stats-grid">
          <StatCard icon={FaBox} label="کل دوره‌ها" value={stats.total}
            color={theme.colors.tintIndigo} soft={theme.colors.tintIndigoSoft} />
          <StatCard icon={FaCheckCircle} label="منتشر شده" value={stats.published}
            color={theme.colors.tintEmerald} soft={theme.colors.tintEmeraldSoft} />
          <StatCard icon={FaEyeSlash} label="پیش‌نویس" value={stats.draft}
            color={theme.colors.warning} soft={theme.colors.warningSoft} />
          <StatCard icon={FaUserGraduate} label="کل دانشجو" value={stats.totalStudents}
            color={theme.colors.tintViolet} soft={theme.colors.tintVioletSoft} />
        </div>

        {/* SAVED VIEWS */}
        <SavedViewsBar
          page="packages"
          currentFilters={{ status: filterStatus, type: filterType, search: searchTerm }}
          onApply={(f) => {
            if (f.status !== undefined) setFilterStatus(f.status);
            if (f.type !== undefined) setFilterType(f.type);
            if (f.search !== undefined) setSearchTerm(f.search);
          }}
        />

        {/* FILTERS */}
        <div style={S.filtersCard} className="pkg-filters-card">
          <div style={S.filtersRow} className="pkg-filters-row">
            <div style={S.searchWrapper}>
              <FaSearch size={11} style={S.searchIcon} />
              <input type="text" placeholder="جستجوی دوره..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                style={S.searchInput} />
            </div>

            <div style={S.filterWrapper}>
              <FaFilter size={10} style={S.filterIcon} />
              <select value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={S.filterSelect}>
                <option value="all">همه وضعیت‌ها</option>
                <option value="published">منتشر شده</option>
                <option value="draft">پیش‌نویس</option>
              </select>
            </div>

            <div style={S.filterWrapper}>
              <FaStar size={10} style={S.filterIcon} />
              <select value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                style={S.filterSelect}>
                <option value="all">همه انواع</option>
                <option value="free">رایگان</option>
                <option value="paid">پولی</option>
                <option value="top">برترین</option>
                <option value="discount">تخفیف‌دار</option>
              </select>
            </div>
          </div>

          <div style={S.filtersMeta}>
            <span style={S.filtersCount}>
              {filteredPackages.length.toLocaleString('fa-IR')} دوره
            </span>
            {(filterStatus !== 'all' || filterType !== 'all' || searchTerm) && (
              <button onClick={() => {
                setSearchTerm(''); setFilterStatus('all'); setFilterType('all');
              }} style={S.clearBtn} className="pkg-clear-btn">
                پاک کردن فیلترها
              </button>
            )}
          </div>
        </div>

        {/* TABLE */}
        <div style={S.tableCard} className="pkg-table-card">
          {currentItems.length === 0 ? (
            <div style={S.empty}>
              <div style={S.emptyIconWrap}>
                <FaBox size={22} color={theme.colors.textFaint} />
              </div>
              <h4 style={S.emptyTitle}>هیچ دوره‌ای یافت نشد</h4>
              <p style={S.emptyDesc}>
                {searchTerm
                  ? `هیچ دوره‌ای با «${searchTerm}» مطابقت نداشت.`
                  : 'اولین دوره آموزشی خود را ایجاد کنید.'}
              </p>
              {!searchTerm && (
                <Link to="/adminpanel/m1/admin/packages/add" style={S.emptyCta} className="pkg-empty-cta">
                  <FaPlus size={10} /> ایجاد دوره
                </Link>
              )}
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div style={S.tableWrap} className="pkg-desktop-table">
                <table style={S.table}>
                  <thead>
                    <tr>
                      <th style={{ ...S.th, width: 42 }}>
                        <input type="checkbox" checked={allOnPageSelected}
                          onChange={toggleSelectAll} style={S.checkbox} />
                      </th>
                      {visibleCols.title && <th style={S.th}>عنوان</th>}
                      {visibleCols.price && <th style={S.th}>قیمت</th>}
                      {visibleCols.category && <th style={S.th}>دسته‌بندی</th>}
                      {visibleCols.status && <th style={S.th}>وضعیت</th>}
                      {visibleCols.topics && <th style={S.th}>سرفصل‌ها</th>}
                      {visibleCols.students && <th style={S.th}>دانشجو</th>}
                      {visibleCols.date && <th style={S.th}>تاریخ</th>}
                      {visibleCols.actions && <th style={S.th}></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((p) => {
                      const isSelected = selectedIds.includes(p.id);
                      return (
                        <tr key={p.id}
                          style={{ ...S.tr, ...(isSelected ? S.trSelected : {}) }}
                          className="pkg-row">
                          <td style={{ ...S.td, width: 42 }}>
                            <input type="checkbox" checked={isSelected}
                              onChange={() => toggleSelect(p.id)} style={S.checkbox} />
                          </td>
                          {visibleCols.title && (
                            <td style={{ ...S.td, maxWidth: 280 }}>
                              <div style={S.titleCell}>
                                <div style={S.pkgIcon}>
                                  <FaBookOpen size={12} color={theme.colors.accent} />
                                </div>
                                <div style={S.titleInfo}>
                                  <div style={S.titleText}>{p.title}</div>
                                  <div style={S.titleBadges}>
                                    {p.is_free && <span style={S.badgeFree}>رایگان</span>}
                                    {p.is_top && <span style={S.badgeTop}>برترین</span>}
                                    {p.has_discount && <span style={S.badgeDiscount}>تخفیف</span>}
                                  </div>
                                </div>
                              </div>
                            </td>
                          )}
                          {visibleCols.price && (
                            <td style={S.td}>
                              {p.is_free ? (
                                <span style={{ ...S.pill, background: theme.colors.tintEmeraldSoft, color: theme.colors.tintEmerald }}>
                                  <FaGift size={9} /> رایگان
                                </span>
                              ) : (
                                <span style={{ ...S.priceCell, color: p.has_discount ? theme.colors.danger : theme.colors.text }}>
                                  {p.display_price_str || `${(p.price || 0).toLocaleString('fa-IR')} تومان`}
                                </span>
                              )}
                            </td>
                          )}
                          {visibleCols.category && (
                            <td style={S.td}>
                              {p.categories && p.categories.length > 0 ? (
                                <div style={S.categoryList}>
                                  {p.categories.slice(0, 2).map((c) => (
                                    <span key={c.id} style={S.categoryChip}>
                                      <FaTag size={8} /> {c.name}
                                    </span>
                                  ))}
                                  {p.categories.length > 2 && (
                                    <span style={S.categoryMore}>+{p.categories.length - 2}</span>
                                  )}
                                </div>
                              ) : <span style={S.dash}>—</span>}
                            </td>
                          )}
                          {visibleCols.status && (
                            <td style={S.td}>
                              <button onClick={() => handleTogglePublish(p)}
                                style={{
                                  ...S.pill,
                                  background: p.is_published ? theme.colors.tintEmeraldSoft : theme.colors.warningSoft,
                                  color: p.is_published ? theme.colors.tintEmerald : theme.colors.warning,
                                  border: 'none', cursor: 'pointer',
                                }}
                                className="pkg-status-btn"
                                title="کلیک برای تغییر">
                                {p.is_published ? <FaCheckCircle size={9} /> : <FaEyeSlash size={9} />}
                                {p.is_published ? 'منتشر شده' : 'پیش‌نویس'}
                              </button>
                            </td>
                          )}
                          {visibleCols.topics && (
                            <td style={{ ...S.td, color: theme.colors.textMuted }}>
                              {(p.topics_count || 0).toLocaleString('fa-IR')}
                            </td>
                          )}
                          {visibleCols.students && (
                            <td style={S.td}>
                              <span style={S.studentsCell}>
                                <FaUserGraduate size={9} />
                                {(p.students_count || 0).toLocaleString('fa-IR')}
                              </span>
                            </td>
                          )}
                          {visibleCols.date && (
                            <td style={{ ...S.td, color: theme.colors.textSubtle }}>
                              {formatJalali(p.created_at)}
                            </td>
                          )}
                          {visibleCols.actions && (
                            <td style={S.td}>
                              <div style={S.actionsGroup}>
                                <Link to={`/adminpanel/m1/admin/packages/${p.id}/edit`}
                                  style={S.rowAction} className="pkg-row-action" title="ویرایش">
                                  <FaEdit size={11} />
                                </Link>
                                <Link to={`/package/${p.id}`} target="_blank"
                                  style={S.rowAction} className="pkg-row-action" title="مشاهده">
                                  <FaEye size={11} />
                                </Link>
                                <button onClick={() => handleDelete(p.id)}
                                  style={{ ...S.rowAction, color: theme.colors.danger }}
                                  className="pkg-row-action-danger" title="حذف">
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

              {/* Mobile */}
              <div className="pkg-mobile-cards">
                {currentItems.map((p) => {
                  const isSelected = selectedIds.includes(p.id);
                  return (
                    <div key={p.id}
                      style={{ ...S.mobileCard, ...(isSelected ? S.mobileCardSelected : {}) }}>
                      <div style={S.mobileCheckRow}>
                        <input type="checkbox" checked={isSelected}
                          onChange={() => toggleSelect(p.id)} style={S.checkbox} />
                        <span style={S.mobileSelectedLabel}>انتخاب</span>
                      </div>
                      <Link to={`/adminpanel/m1/admin/packages/${p.id}/edit`} style={S.mobileCardBody}>
                        <div style={S.mobileTitleRow}>
                          <div style={S.mobileTitle}>{p.title}</div>
                          <span style={{
                            ...S.pill,
                            background: p.is_published ? theme.colors.tintEmeraldSoft : theme.colors.warningSoft,
                            color: p.is_published ? theme.colors.tintEmerald : theme.colors.warning,
                          }}>
                            {p.is_published ? 'منتشر شده' : 'پیش‌نویس'}
                          </span>
                        </div>
                        <div style={S.mobileRow}>
                          <span style={S.mobileLabel}>قیمت</span>
                          <span style={S.mobileValue}>
                            {p.is_free ? 'رایگان' : p.display_price_str}
                          </span>
                        </div>
                        <div style={S.mobileRow}>
                          <span style={S.mobileLabel}>دانشجو</span>
                          <span style={S.mobileValue}>
                            {(p.students_count || 0).toLocaleString('fa-IR')}
                          </span>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={S.pagination}>
                  <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1} style={S.pageBtn} className="pkg-page-btn">
                    <FaChevronRight size={10} />
                  </button>
                  <span style={S.pageInfo}>
                    صفحه {currentPage.toLocaleString('fa-IR')} از {totalPages.toLocaleString('fa-IR')}
                  </span>
                  <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages} style={S.pageBtn} className="pkg-page-btn">
                    <FaChevronLeft size={10} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      </div>

      {/* BULK ACTIONS */}
      <BulkActionsBar
        selectedIds={selectedIds}
        onClear={clearSelection}
        resourceName="دوره"
        onRefresh={fetchPackages}
        actions={[
          { key: 'publish', label: 'انتشار', icon: FaCheckCircle,
            color: theme.colors.success, bg: theme.colors.successSoft,
            onClick: bulkPublish },
          { key: 'unpublish', label: 'پیش‌نویس', icon: FaEyeSlash,
            color: theme.colors.warning, bg: theme.colors.warningSoft,
            onClick: bulkUnpublish },
          { key: 'top', label: 'برترین', icon: FaStar,
            color: theme.colors.accent, bg: theme.colors.accentSoft,
            onClick: bulkMarkTop },
          { key: 'delete', label: 'حذف', icon: FaTrash,
            color: '#FFFFFF', bg: theme.colors.danger,
            danger: true, onClick: bulkDelete },
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
    <div style={S.statCard} className="pkg-card-static">
      <div style={{ ...S.statIconBox, background: soft }}>
        <Icon size={14} color={color} />
      </div>
      <div style={S.statLabel}>{label}</div>
      <div style={S.statValue}>{(value || 0).toLocaleString('fa-IR')}</div>
    </div>
  );
}

function PackageSkeleton() {
  return (
    <div style={S.container}>
      <div style={S.pageHeader}>
        <div>
          <div style={{ ...S.skelBar, width: 200, height: 26 }} />
          <div style={{ ...S.skelBar, width: 240, height: 14, marginTop: 10 }} />
        </div>
        <div style={{ ...S.skelBar, width: 220, height: 38, borderRadius: 10 }} />
      </div>
      <div style={S.statsGrid} className="pkg-stats-grid">
        {[0,1,2,3].map((i) => (
          <div key={i} style={S.statCard}>
            <div style={{ ...S.skelBar, width: 36, height: 36, borderRadius: 10 }} />
            <div style={{ ...S.skelBar, width: 70, height: 12, marginTop: 12 }} />
            <div style={{ ...S.skelBar, width: 100, height: 22, marginTop: 6 }} />
          </div>
        ))}
      </div>
      <div style={{ ...S.skelBar, width: '100%', height: 340, borderRadius: 14 }} />
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
    color: '#FFFFFF', textDecoration: 'none',
    fontFamily: theme.font.family, cursor: 'pointer',
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
  filtersRow: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  searchWrapper: { position: 'relative', flex: 1, minWidth: 220 },
  searchIcon: { position: 'absolute', right: 14, top: '50%',
    transform: 'translateY(-50%)', color: theme.colors.textFaint },
  searchInput: {
    width: '100%', padding: '10px 40px 10px 14px',
    background: theme.colors.surfaceAlt, border: `1px solid ${theme.colors.border}`,
    borderRadius: 10, fontSize: 13, color: theme.colors.text,
    fontFamily: theme.font.family, outline: 'none', boxSizing: 'border-box',
  },
  filterWrapper: { display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 14px', background: theme.colors.surfaceAlt,
    border: `1px solid ${theme.colors.border}`, borderRadius: 10 },
  filterIcon: { color: theme.colors.textFaint },
  filterSelect: { background: 'transparent', border: 'none', fontSize: 12.5,
    color: theme.colors.text, fontFamily: theme.font.family,
    cursor: 'pointer', outline: 'none' },
  filtersMeta: { display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', paddingTop: 12,
    borderTop: `1px solid ${theme.colors.borderSoft}`, gap: 8 },
  filtersCount: { fontSize: 12, color: theme.colors.textSubtle, fontWeight: 500 },
  clearBtn: { padding: '6px 14px', background: theme.colors.dangerSoft,
    border: 'none', borderRadius: 8, fontSize: 11.5, fontWeight: 600,
    color: theme.colors.danger, fontFamily: theme.font.family, cursor: 'pointer' },

  tableCard: { background: theme.colors.surface, border: `1px solid ${theme.colors.border}`,
    borderRadius: 14, boxShadow: theme.shadow.sm, overflow: 'hidden' },
  tableWrap: { overflowX: 'auto', WebkitOverflowScrolling: 'touch' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'right', padding: '12px 16px', fontSize: 10.5,
    fontWeight: 700, color: theme.colors.textFaint, textTransform: 'uppercase',
    letterSpacing: '0.5px', background: theme.colors.surfaceAlt,
    borderBottom: `1px solid ${theme.colors.border}`, whiteSpace: 'nowrap' },
  tr: { borderBottom: `1px solid ${theme.colors.borderSoft}`,
    transition: 'background 0.15s' },
  trSelected: { background: theme.colors.accentSoft },
  td: { padding: '12px 16px', fontSize: 13, color: theme.colors.text,
    fontFamily: theme.font.family, verticalAlign: 'middle', whiteSpace: 'nowrap' },
  checkbox: { width: 16, height: 16,
    accentColor: theme.colors.accent, cursor: 'pointer' },

  titleCell: { display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 },
  pkgIcon: { width: 36, height: 36, borderRadius: 10,
    background: theme.colors.accentSoft,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0 },
  titleInfo: { minWidth: 0, flex: 1 },
  titleText: { fontSize: 13, fontWeight: 700, color: theme.colors.text,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    maxWidth: 240 },
  titleBadges: { display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' },
  badgeFree: { fontSize: 9.5, fontWeight: 700,
    background: theme.colors.tintEmeraldSoft, color: theme.colors.tintEmerald,
    padding: '2px 7px', borderRadius: 999 },
  badgeTop: { fontSize: 9.5, fontWeight: 700,
    background: theme.colors.tintAmberSoft, color: theme.colors.tintAmber,
    padding: '2px 7px', borderRadius: 999 },
  badgeDiscount: { fontSize: 9.5, fontWeight: 700,
    background: theme.colors.dangerSoft, color: theme.colors.danger,
    padding: '2px 7px', borderRadius: 999 },

  priceCell: { fontSize: 13, fontWeight: 700 },
  pill: { display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '4px 10px', borderRadius: 999,
    fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' },

  categoryList: { display: 'flex', gap: 4, flexWrap: 'wrap' },
  categoryChip: { display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '3px 8px', background: theme.colors.surfaceAlt,
    borderRadius: 999, fontSize: 10.5, fontWeight: 600,
    color: theme.colors.textMuted },
  categoryMore: { display: 'inline-flex', alignItems: 'center',
    padding: '3px 8px', background: theme.colors.surfaceAlt,
    borderRadius: 999, fontSize: 10.5, fontWeight: 700,
    color: theme.colors.textFaint },
  dash: { color: theme.colors.textFaint },

  studentsCell: { display: 'inline-flex', alignItems: 'center', gap: 5,
    fontSize: 12, color: theme.colors.textMuted, fontWeight: 600 },

  actionsGroup: { display: 'flex', gap: 4 },
  rowAction: { width: 28, height: 28, display: 'inline-flex',
    alignItems: 'center', justifyContent: 'center',
    background: theme.colors.surfaceAlt, border: 'none', borderRadius: 8,
    color: theme.colors.textMuted, cursor: 'pointer',
    transition: 'all 0.15s', textDecoration: 'none' },

  // Mobile
  mobileCard: { display: 'block', width: '100%', textAlign: 'right',
    padding: 14, background: theme.colors.surface,
    borderBottom: `1px solid ${theme.colors.borderSoft}`,
    fontFamily: theme.font.family },
  mobileCardSelected: { background: theme.colors.accentSoft },
  mobileCheckRow: { display: 'flex', alignItems: 'center',
    gap: 8, marginBottom: 10 },
  mobileSelectedLabel: { fontSize: 11.5, color: theme.colors.textSubtle, fontWeight: 500 },
  mobileCardBody: { display: 'block', textDecoration: 'none', color: 'inherit' },
  mobileTitleRow: { display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', gap: 8, marginBottom: 8 },
  mobileTitle: { fontSize: 13.5, fontWeight: 700, color: theme.colors.text, flex: 1,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  mobileRow: { display: 'flex', justifyContent: 'space-between',
    gap: 8, padding: '4px 0' },
  mobileLabel: { fontSize: 12, color: theme.colors.textSubtle, fontWeight: 500 },
  mobileValue: { fontSize: 12.5, color: theme.colors.text, fontWeight: 600 },

  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center',
    gap: 12, padding: 16, borderTop: `1px solid ${theme.colors.borderSoft}` },
  pageBtn: { width: 34, height: 34, borderRadius: 9,
    background: theme.colors.surface, border: `1px solid ${theme.colors.border}`,
    color: theme.colors.textMuted, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
  pageInfo: { fontSize: 12.5, color: theme.colors.textSubtle, fontWeight: 500 },

  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', gap: 8, padding: '56px 20px', textAlign: 'center' },
  emptyIconWrap: { width: 56, height: 56, borderRadius: 16,
    background: theme.colors.surfaceAlt, display: 'flex',
    alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle: { fontSize: 14, fontWeight: 700, color: theme.colors.text, margin: 0 },
  emptyDesc: { fontSize: 12.5, color: theme.colors.textSubtle, margin: 0,
    maxWidth: 320, lineHeight: 1.6 },
  emptyCta: { display: 'inline-flex', alignItems: 'center', gap: 6,
    marginTop: 8, padding: '9px 18px',
    background: theme.colors.accentSoft, color: theme.colors.accent,
    borderRadius: 10, fontSize: 12.5, fontWeight: 700,
    textDecoration: 'none', fontFamily: theme.font.family, cursor: 'pointer' },

  skelBar: { background: 'linear-gradient(90deg, #EEF0F4 0%, #F7F8FA 50%, #EEF0F4 100%)',
    backgroundSize: '200% 100%', borderRadius: 6,
    animation: 'pkg-skel 1.4s ease-in-out infinite' },
};

if (typeof document !== 'undefined' && !document.getElementById('admin-packages-styles')) {
  const style = document.createElement('style');
  style.id = 'admin-packages-styles';
  style.textContent = `
    @keyframes pkg-skel {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .pkg-card-static { transition: box-shadow 0.18s ease !important; }
    .pkg-card-static:hover {
      box-shadow: 0 8px 24px -6px rgba(15,23,42,0.08), 0 2px 6px -2px rgba(15,23,42,0.04) !important;
    }
    .pkg-row:hover { background: ${theme.colors.surfaceAlt}; }
    .pkg-row:last-child { border-bottom: none; }
    .pkg-row-action:hover {
      background: ${theme.colors.accentSoft} !important;
      color: ${theme.colors.accent} !important;
    }
    .pkg-row-action-danger:hover {
      background: ${theme.colors.dangerSoft} !important;
      color: ${theme.colors.danger} !important;
    }
    .pkg-status-btn:hover { filter: brightness(0.95); }
    .pkg-clear-btn:hover {
      background: ${theme.colors.danger} !important;
      color: #FFFFFF !important;
    }
    .pkg-page-btn:hover { background: ${theme.colors.surfaceAlt} !important; }
    .pkg-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
    .pkg-btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 22px ${theme.colors.accentGlow} !important;
    }
    .pkg-empty-cta:hover {
      background: ${theme.colors.accent} !important;
      color: #FFFFFF !important;
    }
    .pkg-mobile-cards { display: none; }

    @media (max-width: 1023px) {
      .pkg-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
    }
    @media (max-width: 768px) {
      .pkg-page-header { flex-direction: column !important; align-items: stretch !important; }
      .pkg-filters-row { flex-direction: column !important; }
      .pkg-filters-row > * { width: 100% !important; }
      .pkg-stats-grid { grid-template-columns: 1fr 1fr !important; }
      .pkg-desktop-table { display: none !important; }
      .pkg-mobile-cards { display: block !important; }
    }
    @media (max-width: 480px) {
      .pkg-stats-grid { grid-template-columns: 1fr !important; }
    }
  `;
  document.head.appendChild(style);
}

export default AdminPackages;
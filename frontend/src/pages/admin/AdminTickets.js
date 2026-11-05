// src/pages/admin/AdminTickets.js
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaSearch, FaFilter, FaChevronLeft, FaChevronRight,
  FaCheckCircle, FaTimesCircle, FaClock, FaHourglassHalf,
  FaTag, FaUser, FaReply, FaTrash, FaEye, FaInfoCircle,
  FaTicketAlt, FaExclamationCircle, FaArrowUp, FaBan,
  FaCalendar, FaEnvelope, FaFlag,
} from 'react-icons/fa';
import AdminLayout from './AdminLayout';
import SavedViewsBar from '../../components/SavedViewsBar';
import ExportMenu from '../../components/ExportMenu';
import BulkActionsBar from '../../components/BulkActionsBar';
import ColumnToggle, { useColumnPrefs } from '../../components/ColumnToggle';
import { toast } from 'react-toastify';
import axios from 'axios';
import theme from '../../styles/adminTheme';
import { formatJalali, formatJalaliDateTime } from '../../utils/jalali';

const API_URL = '/api/tickets';

const COLUMNS = [
  { key: 'id',       label: 'شناسه' },
  { key: 'user',     label: 'کاربر', always: true },
  { key: 'title',    label: 'عنوان' },
  { key: 'category', label: 'دسته' },
  { key: 'status',   label: 'وضعیت' },
  { key: 'priority', label: 'اولویت' },
  { key: 'replies',  label: 'پاسخ‌ها' },
  { key: 'date',     label: 'تاریخ' },
  { key: 'actions',  label: 'عملیات', always: true },
];

const STATUS_CONFIG = {
  open:         { label: 'باز',           color: '#059669', bg: '#ECFDF5', icon: FaExclamationCircle },
  in_progress:  { label: 'در حال بررسی',  color: '#4F46E5', bg: '#EEF2FF', icon: FaClock },
  waiting:      { label: 'در انتظار پاسخ', color: '#D97706', bg: '#FFFBEB', icon: FaHourglassHalf },
  resolved:     { label: 'برطرف شده',     color: '#7C3AED', bg: '#EDE9FE', icon: FaCheckCircle },
  closed:       { label: 'بسته شده',      color: '#64748B', bg: '#F1F5F9', icon: FaTimesCircle },
};

const PRIORITY_CONFIG = {
  low:    { label: 'کم',     color: '#64748B', bg: '#F1F5F9' },
  medium: { label: 'متوسط',  color: '#0284C7', bg: '#E0F2FE' },
  high:   { label: 'بالا',   color: '#D97706', bg: '#FEF3C7' },
  urgent: { label: 'فوری',   color: '#DC2626', bg: '#FEF2F2' },
};

function AdminTickets() {
  const { user: currentUser } = useSelector((s) => s.auth);

  // ── Data ──
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Filters ──
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // ── Table ──
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const itemsPerPage = 10;

  // ── Bulk ──
  const [selectedIds, setSelectedIds] = useState([]);

  // ── Column toggle ──
  const [visibleCols, setVisibleCols] = useColumnPrefs('tickets.columns', {
    id: true, user: true, title: true, category: true,
    status: true, priority: true, replies: true, date: true, actions: true,
  });

  // ── Fetch ──
  useEffect(() => {
    fetchTickets();
    fetchStats();
    fetchCategories();
  }, []);

  useEffect(() => { if (tickets.length > 0) applyFilters(); },
    // eslint-disable-next-line
    [tickets, searchTerm, filterStatus, filterPriority, filterCategory]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const res = await axios.get(`${API_URL}/tickets/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let data = [];
      if (res.data?.results) data = res.data.results;
      else if (Array.isArray(res.data)) data = res.data;
      setTickets(data);
      setFilteredTickets(data);
    } catch (e) {
      console.error(e);
      toast.error('خطا در دریافت تیکت‌ها');
      setTickets([]); setFilteredTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get(`${API_URL}/stats/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (e) {
      console.warn('[tickets] stats failed:', e?.message);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get(`${API_URL}/categories/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let data = [];
      if (res.data?.results) data = res.data.results;
      else if (Array.isArray(res.data)) data = res.data;
      setCategories(data);
    } catch (e) {
      console.warn('[tickets] categories failed:', e?.message);
    }
  };

  const applyFilters = () => {
    let data = [...tickets];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter((t) =>
        (t.title || '').toLowerCase().includes(term) ||
        (t.message || '').toLowerCase().includes(term) ||
        (t.user?.username || '').toLowerCase().includes(term) ||
        (t.user?.full_name || '').toLowerCase().includes(term) ||
        (t.user?.email || '').toLowerCase().includes(term)
      );
    }

    if (filterStatus !== 'all') {
      data = data.filter((t) => t.status === filterStatus);
    }

    if (filterPriority !== 'all') {
      data = data.filter((t) => t.priority === filterPriority);
    }

    if (filterCategory !== 'all') {
      data = data.filter((t) => t.category === parseInt(filterCategory));
    }

    setFilteredTickets(data);
    setCurrentPage(1);
  };

  // ── Pagination ──
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const currentItems = filteredTickets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // ── Bulk helpers ──
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const allIds = currentItems.map((t) => t.id);
    const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !allIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...allIds])));
    }
  };

  const clearSelection = () => setSelectedIds([]);

  const bulkChangeStatus = async (ids, newStatus) => {
    const token = localStorage.getItem('access_token');
    await axios.post(`${API_URL}/bulk/status/`, { ids, status: newStatus },
      { headers: { Authorization: `Bearer ${token}` } });
  };
  const bulkChangePriority = async (ids, priority) => {
    const token = localStorage.getItem('access_token');
    await axios.post(`${API_URL}/bulk/priority/`, { ids, priority },
      { headers: { Authorization: `Bearer ${token}` } });
  };
  const bulkDelete = async (ids) => {
    const token = localStorage.getItem('access_token');
    await axios.post(`${API_URL}/bulk/delete/`, { ids },
      { headers: { Authorization: `Bearer ${token}` } });
  };

  // ── Single actions ──
  const handleChangeStatus = async (ticketId, newStatus) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${API_URL}/tickets/${ticketId}/change_status/`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } });
      toast.success('وضعیت تغییر کرد');
      fetchTickets(); fetchStats();
    } catch {
      toast.error('خطا در تغییر وضعیت');
    }
  };

  const handleDeleteTicket = async (id) => {
    if (!window.confirm('این تیکت حذف شود؟ این عمل قابل بازگشت نیست.')) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${API_URL}/tickets/${id}/`,
        { headers: { Authorization: `Bearer ${token}` } });
      toast.success('تیکت حذف شد');
      fetchTickets(); fetchStats();
    } catch {
      toast.error('خطا در حذف تیکت');
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) { toast.warning('متن پاسخ را وارد کنید'); return; }
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${API_URL}/tickets/${selectedTicket.id}/reply/`,
        { message: replyMessage },
        { headers: { Authorization: `Bearer ${token}` } });
      toast.success('پاسخ ارسال شد');
      setReplyMessage('');
      setShowReplyModal(false);
      fetchTickets(); fetchStats();
    } catch {
      toast.error('خطا در ارسال پاسخ');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Export ──
  const exportData = useMemo(() => filteredTickets.map((t) => ({
    'شناسه': `#${t.id}`,
    'کاربر': t.user?.full_name || t.user?.username || '—',
    'عنوان': t.title,
    'دسته': t.category_name || '—',
    'وضعیت': STATUS_CONFIG[t.status]?.label || t.status,
    'اولویت': PRIORITY_CONFIG[t.priority]?.label || t.priority,
    'پاسخ‌ها': t.replies_count || 0,
    'تاریخ': t.created_at,
  })), [filteredTickets]);

  if (loading) {
    return (
      <AdminLayout>
        <TicketSkeleton />
      </AdminLayout>
    );
  }

  const allOnPageSelected =
    currentItems.length > 0 && currentItems.every((t) => selectedIds.includes(t.id));

  return (
    <AdminLayout>
      <div style={S.container}>

        {/* HEADER */}
        <div style={S.pageHeader} className="tk-page-header">
          <div>
            <h1 style={S.pageTitle}>مدیریت تیکت‌ها</h1>
            <p style={S.pageSubtitle}>پاسخگویی و مدیریت تیکت‌های پشتیبانی</p>
          </div>
          <div style={S.headerActions}>
            <ColumnToggle
              storageKey="tickets.columns"
              columns={COLUMNS}
              visible={visibleCols}
              onChange={setVisibleCols}
            />
            <ExportMenu data={exportData} filename="tickets" title="گزارش تیکت‌ها" />
          </div>
        </div>

        {/* STATS */}
        {stats && (
          <div style={S.statsGrid} className="tk-stats-grid">
            <StatCard icon={FaTicketAlt} label="کل تیکت‌ها" value={stats.total || 0}
              color={theme.colors.tintIndigo} soft={theme.colors.tintIndigoSoft} />
            <StatCard icon={FaExclamationCircle} label="باز" value={stats.open || 0}
              color={theme.colors.tintEmerald} soft={theme.colors.tintEmeraldSoft} />
            <StatCard icon={FaClock} label="در حال بررسی" value={stats.in_progress || 0}
              color={theme.colors.accent} soft={theme.colors.accentSoft} />
            <StatCard icon={FaCheckCircle} label="برطرف شده" value={stats.resolved || 0}
              color={theme.colors.tintViolet} soft={theme.colors.tintVioletSoft} />
          </div>
        )}

        {/* SAVED VIEWS */}
        <SavedViewsBar
          page="tickets"
          currentFilters={{
            status: filterStatus,
            priority: filterPriority,
            category: filterCategory,
            search: searchTerm,
          }}
          onApply={(f) => {
            if (f.status !== undefined) setFilterStatus(f.status);
            if (f.priority !== undefined) setFilterPriority(f.priority);
            if (f.category !== undefined) setFilterCategory(f.category);
            if (f.search !== undefined) setSearchTerm(f.search);
          }}
        />

        {/* FILTERS */}
        <div style={S.filtersCard} className="tk-filters-card">
          <div style={S.filtersRow} className="tk-filters-row">
            <div style={S.searchWrapper}>
              <FaSearch size={11} style={S.searchIcon} />
              <input type="text"
                placeholder="جستجوی عنوان، کاربر، متن تیکت..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={S.searchInput} />
            </div>

            <div style={S.filterWrapper}>
              <FaFilter size={10} style={S.filterIcon} />
              <select value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={S.filterSelect}>
                <option value="all">همه وضعیت‌ها</option>
                <option value="open">باز</option>
                <option value="in_progress">در حال بررسی</option>
                <option value="waiting">در انتظار پاسخ</option>
                <option value="resolved">برطرف شده</option>
                <option value="closed">بسته شده</option>
              </select>
            </div>

            <div style={S.filterWrapper}>
              <FaFlag size={10} style={S.filterIcon} />
              <select value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                style={S.filterSelect}>
                <option value="all">همه اولویت‌ها</option>
                <option value="low">کم</option>
                <option value="medium">متوسط</option>
                <option value="high">بالا</option>
                <option value="urgent">فوری</option>
              </select>
            </div>

            <div style={S.filterWrapper}>
              <FaTag size={10} style={S.filterIcon} />
              <select value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={S.filterSelect}>
                <option value="all">همه دسته‌ها</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={S.filtersMeta}>
            <span style={S.filtersCount}>
              {filteredTickets.length.toLocaleString('fa-IR')} تیکت
            </span>
            {(filterStatus !== 'all' || filterPriority !== 'all' ||
              filterCategory !== 'all' || searchTerm) && (
              <button
                onClick={() => {
                  setSearchTerm(''); setFilterStatus('all');
                  setFilterPriority('all'); setFilterCategory('all');
                }}
                style={S.clearBtn}
                className="tk-clear-btn">
                پاک کردن فیلترها
              </button>
            )}
          </div>
        </div>

        {/* TABLE */}
        <div style={S.tableCard} className="tk-table-card">
          {currentItems.length === 0 ? (
            <div style={S.empty}>
              <div style={S.emptyIconWrap}>
                <FaTicketAlt size={22} color={theme.colors.textFaint} />
              </div>
              <h4 style={S.emptyTitle}>هیچ تیکتی یافت نشد</h4>
              <p style={S.emptyDesc}>
                فیلترها را تغییر دهید یا بعد از اولین ارسال تیکت دوباره سر بزنید.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div style={S.tableWrap} className="tk-desktop-table">
                <table style={S.table}>
                  <thead>
                    <tr>
                      <th style={{ ...S.th, width: 42 }}>
                        <input type="checkbox" checked={allOnPageSelected}
                          onChange={toggleSelectAll} style={S.checkbox} />
                      </th>
                      {visibleCols.id && <th style={S.th}>#</th>}
                      {visibleCols.user && <th style={S.th}>کاربر</th>}
                      {visibleCols.title && <th style={S.th}>عنوان</th>}
                      {visibleCols.category && <th style={S.th}>دسته</th>}
                      {visibleCols.status && <th style={S.th}>وضعیت</th>}
                      {visibleCols.priority && <th style={S.th}>اولویت</th>}
                      {visibleCols.replies && <th style={S.th}>پاسخ‌ها</th>}
                      {visibleCols.date && <th style={S.th}>تاریخ</th>}
                      {visibleCols.actions && <th style={S.th}></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((t) => {
                      const status = STATUS_CONFIG[t.status] || STATUS_CONFIG.open;
                      const priority = PRIORITY_CONFIG[t.priority] || PRIORITY_CONFIG.medium;
                      const StatusIcon = status.icon;
                      const isSelected = selectedIds.includes(t.id);
                      return (
                        <tr key={t.id}
                          style={{ ...S.tr, ...(isSelected ? S.trSelected : {}) }}
                          className="tk-row">
                          <td style={{ ...S.td, width: 42 }}>
                            <input type="checkbox" checked={isSelected}
                              onChange={() => toggleSelect(t.id)} style={S.checkbox} />
                          </td>
                          {visibleCols.id && <td style={S.td}>#{t.id}</td>}
                          {visibleCols.user && (
                            <td style={S.td}>
                              <div style={S.userCell}>
                                <div style={S.userAvatar}>
                                  {(t.user?.full_name || t.user?.username || '?')[0]}
                                </div>
                                <div>
                                  <div style={S.userName}>
                                    {t.user?.full_name || t.user?.username || 'کاربر حذف شده'}
                                  </div>
                                  {t.user?.email && (
                                    <div style={S.userEmail}>{t.user.email}</div>
                                  )}
                                </div>
                              </div>
                            </td>
                          )}
                          {visibleCols.title && (
                            <td style={{ ...S.td, maxWidth: 260 }}>
                              <div style={S.ticketTitle}>{t.title}</div>
                            </td>
                          )}
                          {visibleCols.category && (
                            <td style={S.td}>
                              {t.category_name ? (
                                <span style={S.categoryBadge}>
                                  <FaTag size={9} />
                                  {t.category_name}
                                </span>
                              ) : <span style={S.dash}>—</span>}
                            </td>
                          )}
                          {visibleCols.status && (
                            <td style={S.td}>
                              <span style={{ ...S.pill, background: status.bg, color: status.color }}>
                                <StatusIcon size={10} />
                                {status.label}
                              </span>
                            </td>
                          )}
                          {visibleCols.priority && (
                            <td style={S.td}>
                              <span style={{ ...S.pill, background: priority.bg, color: priority.color }}>
                                {priority.label}
                              </span>
                            </td>
                          )}
                          {visibleCols.replies && (
                            <td style={S.td}>
                              <span style={S.replyCount}>
                                <FaReply size={10} />
                                {t.replies_count || 0}
                              </span>
                            </td>
                          )}
                          {visibleCols.date && (
                            <td style={{ ...S.td, color: theme.colors.textSubtle }}>
                              {formatJalali(t.created_at)}
                            </td>
                          )}
                          {visibleCols.actions && (
                              <td style={S.td}>
                                <div style={S.actionsGroup}>
                                  {/* مشاهده جزئیات — Link برای پشتیبانی از Ctrl+Click */}
                                  <Link
                                      to={`/adminpanel/m1/admin/tickets/${t.id}`}
                                      style={S.rowAction}
                                      className="tk-row-action"
                                      title="مشاهده جزئیات"
                                      onClick={(e) => e.stopPropagation()}
                                  >
                                    <FaEye size={11}/>
                                  </Link>

                                  {/* پاسخ سریع — بدون رفتن به صفحه جزئیات */}
                                  <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedTicket(t);
                                        setShowReplyModal(true);
                                      }}
                                      style={S.rowAction}
                                      className="tk-row-action"
                                      title="پاسخ سریع"
                                  >
                                    <FaReply size={11}/>
                                  </button>

                                  {/* حذف */}
                                  <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteTicket(t.id);
                                      }}
                                      style={{...S.rowAction, color: theme.colors.danger}}
                                      className="tk-row-action-danger"
                                      title="حذف"
                                  >
                                    <FaTrash size={11}/>
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
              <div className="tk-mobile-cards">
                {currentItems.map((t) => {
                  const status = STATUS_CONFIG[t.status] || STATUS_CONFIG.open;
                  const priority = PRIORITY_CONFIG[t.priority] || PRIORITY_CONFIG.medium;
                  const isSelected = selectedIds.includes(t.id);
                  return (
                      <div key={t.id}
                           style={{
                             ...S.mobileCard,
                             ...(isSelected ? S.mobileCardSelected : {}),
                           }}>
                        <div style={S.mobileCheckRow}>
                          <input type="checkbox" checked={isSelected}
                                 onChange={() => toggleSelect(t.id)} style={S.checkbox}/>
                          <span style={S.mobileSelectedLabel}>انتخاب</span>
                      </div>
                      <Link to={`/adminpanel/m1/admin/tickets/${t.id}`} style={S.mobileCardBody}>
                        <div style={S.mobileTop}>
                          <div style={S.userCell}>
                            <div style={S.userAvatar}>
                              {(t.user?.full_name || t.user?.username || '?')[0]}
                            </div>
                            <div>
                              <div style={S.userName}>
                                {t.user?.full_name || t.user?.username || 'کاربر حذف شده'}
                              </div>
                              <div style={S.mobileTime}>{formatJalali(t.created_at)}</div>
                            </div>
                          </div>
                        </div>
                        <div style={S.mobileTitle}>{t.title}</div>
                        <div style={S.mobileBadges}>
                          <span style={{ ...S.pill, background: status.bg, color: status.color }}>
                            {status.label}
                          </span>
                          <span style={{ ...S.pill, background: priority.bg, color: priority.color }}>
                            {priority.label}
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
                    disabled={currentPage === 1}
                    style={S.pageBtn} className="tk-page-btn">
                    <FaChevronRight size={10} />
                  </button>
                  <span style={S.pageInfo}>
                    صفحه {currentPage.toLocaleString('fa-IR')} از {totalPages.toLocaleString('fa-IR')}
                  </span>
                  <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    style={S.pageBtn} className="tk-page-btn">
                    <FaChevronLeft size={10} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      </div>

      {/* REPLY MODAL */}
      {showReplyModal && selectedTicket && (
        <div style={S.modalBackdrop} onClick={() => setShowReplyModal(false)}>
          <div style={S.modal} onClick={(e) => e.stopPropagation()}>
            <div style={S.modalHeader}>
              <h3 style={S.modalTitle}>پاسخ به تیکت #{selectedTicket.id}</h3>
              <button onClick={() => setShowReplyModal(false)} style={S.modalClose}>×</button>
            </div>

            <form onSubmit={handleReply}>
              <div style={S.modalBody}>
                <div style={S.replyTicketBox}>
                  <div style={S.replyTicketUser}>
                    <FaUser size={11} color={theme.colors.textFaint} />
                    <span>{selectedTicket.user?.full_name || selectedTicket.user?.username}</span>
                  </div>
                  <div style={S.replyTicketTitle}>{selectedTicket.title}</div>
                  <div style={S.replyTicketMsg}>{selectedTicket.message}</div>
                </div>

                <div style={S.formGroup}>
                  <label style={S.label}>پاسخ شما</label>
                  <textarea value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    style={S.textarea}
                    placeholder="پاسخ خود را بنویسید..."
                    rows="4" required />
                </div>
              </div>

              <div style={S.modalFooter}>
                <button type="button" onClick={() => setShowReplyModal(false)}
                  style={S.modalCloseBtn}>
                  انصراف
                </button>
                <button type="submit" style={S.modalSaveBtn} disabled={isSubmitting}>
                  <FaReply size={11} />
                  {isSubmitting ? 'در حال ارسال...' : 'ارسال پاسخ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK ACTIONS */}
      <BulkActionsBar
        selectedIds={selectedIds}
        onClear={clearSelection}
        resourceName="تیکت"
        onRefresh={() => { fetchTickets(); fetchStats(); }}
        actions={[
          { key: 'in_progress', label: 'در حال بررسی', icon: FaClock,
            color: theme.colors.accent, bg: theme.colors.accentSoft,
            onClick: (ids) => bulkChangeStatus(ids, 'in_progress') },
          { key: 'resolved', label: 'برطرف شده', icon: FaCheckCircle,
            color: theme.colors.success, bg: theme.colors.successSoft,
            onClick: (ids) => bulkChangeStatus(ids, 'resolved') },
          { key: 'closed', label: 'بسته شده', icon: FaTimesCircle,
            color: theme.colors.textMuted, bg: theme.colors.surfaceAlt,
            onClick: (ids) => bulkChangeStatus(ids, 'closed') },
          { key: 'urgent', label: 'اولویت فوری', icon: FaFlag,
            color: theme.colors.danger, bg: theme.colors.dangerSoft,
            onClick: (ids) => bulkChangePriority(ids, 'urgent') },
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
    <div style={S.statCard} className="tk-card-static">
      <div style={{ ...S.statIconBox, background: soft }}>
        <Icon size={14} color={color} />
      </div>
      <div style={S.statLabel}>{label}</div>
      <div style={S.statValue}>{(value || 0).toLocaleString('fa-IR')}</div>
    </div>
  );
}

function TicketSkeleton() {
  return (
    <div style={S.container}>
      <div style={S.pageHeader}>
        <div>
          <div style={{ ...S.skelBar, width: 180, height: 26 }} />
          <div style={{ ...S.skelBar, width: 220, height: 14, marginTop: 10 }} />
        </div>
        <div style={{ ...S.skelBar, width: 200, height: 38, borderRadius: 10 }} />
      </div>
      <div style={S.statsGrid} className="tk-stats-grid">
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
  filterWrapper: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '10px 14px', background: theme.colors.surfaceAlt,
    border: `1px solid ${theme.colors.border}`, borderRadius: 10,
  },
  filterIcon: { color: theme.colors.textFaint },
  filterSelect: {
    background: 'transparent', border: 'none', fontSize: 12.5,
    color: theme.colors.text, fontFamily: theme.font.family,
    cursor: 'pointer', outline: 'none',
  },
  filtersMeta: { display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', paddingTop: 12,
    borderTop: `1px solid ${theme.colors.borderSoft}`, gap: 8 },
  filtersCount: { fontSize: 12, color: theme.colors.textSubtle, fontWeight: 500 },
  clearBtn: {
    padding: '6px 14px', background: theme.colors.dangerSoft,
    border: 'none', borderRadius: 8, fontSize: 11.5, fontWeight: 600,
    color: theme.colors.danger, fontFamily: theme.font.family, cursor: 'pointer',
  },

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

  userCell: { display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 },
  userAvatar: {
    width: 32, height: 32, borderRadius: '50%',
    background: `linear-gradient(135deg, ${theme.colors.accent} 0%, #7C5CE7 100%)`,
    color: '#FFFFFF', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0,
  },
  userName: { fontSize: 12.5, fontWeight: 600, color: theme.colors.text,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  userEmail: { fontSize: 11, color: theme.colors.textFaint, marginTop: 1 },

  ticketTitle: {
    fontSize: 12.5, fontWeight: 500, color: theme.colors.text,
    overflow: 'hidden', textOverflow: 'ellipsis',
    whiteSpace: 'nowrap', maxWidth: 260,
  },
  categoryBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '3px 10px', background: theme.colors.surfaceAlt,
    borderRadius: 999, fontSize: 11, fontWeight: 600,
    color: theme.colors.textMuted,
  },
  dash: { color: theme.colors.textFaint },

  pill: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '4px 10px', borderRadius: 999,
    fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
  },
  replyCount: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    fontSize: 12, color: theme.colors.textMuted, fontWeight: 600,
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
  mobileCardBody: {
    display: 'block', width: '100%', textAlign: 'right',
    textDecoration: 'none', color: 'inherit',
    cursor: 'pointer', fontFamily: theme.font.family,
  },
  mobileTop: { display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', gap: 8, marginBottom: 8 },
  mobileTime: { fontSize: 11, color: theme.colors.textFaint, marginTop: 1 },
  mobileTitle: {
    fontSize: 13, fontWeight: 600, color: theme.colors.text,
    marginBottom: 8, lineHeight: 1.5,
  },
  mobileBadges: { display: 'flex', gap: 6, flexWrap: 'wrap' },

  pagination: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    gap: 12, padding: 16, borderTop: `1px solid ${theme.colors.borderSoft}`,
  },
  pageBtn: {
    width: 34, height: 34, borderRadius: 9,
    background: theme.colors.surface, border: `1px solid ${theme.colors.border}`,
    color: theme.colors.textMuted, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  },
  pageInfo: { fontSize: 12.5, color: theme.colors.textSubtle, fontWeight: 500 },

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

  // Modal
  modalBackdrop: {
    position: 'fixed', inset: 0, background: 'rgba(11,15,26,0.5)',
    backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
    zIndex: 1000, display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: 20,
  },
  modal: {
    width: '100%', maxWidth: 520, maxHeight: '85vh',
    background: theme.colors.surface, borderRadius: 16,
    boxShadow: theme.shadow.xl, display: 'flex',
    flexDirection: 'column', overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '16px 20px',
    borderBottom: `1px solid ${theme.colors.border}`,
  },
  modalTitle: { fontSize: 14.5, fontWeight: 700, color: theme.colors.text, margin: 0 },
  modalClose: {
    width: 28, height: 28, background: 'none', border: 'none',
    fontSize: 22, color: theme.colors.textFaint, cursor: 'pointer', lineHeight: 1,
  },
  modalBody: { padding: 20, overflowY: 'auto',
    display: 'flex', flexDirection: 'column', gap: 14 },
  modalFooter: {
    padding: '12px 20px', borderTop: `1px solid ${theme.colors.border}`,
    display: 'flex', justifyContent: 'flex-end', gap: 8,
  },
  modalCloseBtn: {
    padding: '8px 20px', background: theme.colors.surfaceAlt,
    border: `1px solid ${theme.colors.border}`, borderRadius: 10,
    fontSize: 12.5, fontWeight: 600, color: theme.colors.textMuted,
    fontFamily: theme.font.family, cursor: 'pointer',
  },
  modalSaveBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '8px 18px',
    background: `linear-gradient(135deg, ${theme.colors.accent} 0%, #7C5CE7 100%)`,
    border: 'none', borderRadius: 10, fontSize: 12.5, fontWeight: 600,
    color: '#FFFFFF', fontFamily: theme.font.family, cursor: 'pointer',
  },

  replyTicketBox: {
    padding: 14, background: theme.colors.surfaceAlt,
    borderRadius: 12, border: `1px solid ${theme.colors.border}`,
  },
  replyTicketUser: {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: 11.5, color: theme.colors.textSubtle,
    fontWeight: 500, marginBottom: 6,
  },
  replyTicketTitle: {
    fontSize: 13, fontWeight: 700, color: theme.colors.text, marginBottom: 8,
  },
  replyTicketMsg: {
    fontSize: 12.5, color: theme.colors.textMuted, lineHeight: 1.7,
    padding: 10, background: theme.colors.surface,
    borderRadius: 8, border: `1px solid ${theme.colors.border}`,
  },

  formGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, fontWeight: 600, color: theme.colors.textMuted },
  textarea: {
    padding: '10px 14px', background: theme.colors.surfaceAlt,
    border: `1px solid ${theme.colors.border}`, borderRadius: 10,
    fontSize: 13, color: theme.colors.text, fontFamily: theme.font.family,
    outline: 'none', resize: 'vertical',
  },

  skelBar: {
    background: 'linear-gradient(90deg, #EEF0F4 0%, #F7F8FA 50%, #EEF0F4 100%)',
    backgroundSize: '200% 100%', borderRadius: 6,
    animation: 'tk-skel 1.4s ease-in-out infinite',
  },
};

if (typeof document !== 'undefined' && !document.getElementById('admin-tickets-styles')) {
  const style = document.createElement('style');
  style.id = 'admin-tickets-styles';
  style.textContent = `
    @keyframes tk-skel {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .tk-card-static { transition: box-shadow 0.18s ease !important; }
    .tk-card-static:hover {
      box-shadow: 0 8px 24px -6px rgba(15,23,42,0.08), 0 2px 6px -2px rgba(15,23,42,0.04) !important;
    }
    .tk-row:hover { background: ${theme.colors.surfaceAlt}; }
    .tk-row:last-child { border-bottom: none; }
    .tk-row-action:hover {
      background: ${theme.colors.accentSoft} !important;
      color: ${theme.colors.accent} !important;
    }
    .tk-row-action-danger:hover {
      background: ${theme.colors.dangerSoft} !important;
      color: ${theme.colors.danger} !important;
    }
    .tk-clear-btn:hover {
      background: ${theme.colors.danger} !important;
      color: #FFFFFF !important;
    }
    .tk-page-btn:hover { background: ${theme.colors.surfaceAlt} !important; }
    .tk-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }

    .tk-mobile-cards { display: none; }

    @media (max-width: 1023px) {
      .tk-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
    }
    @media (max-width: 768px) {
      .tk-page-header {
        flex-direction: column !important;
        align-items: stretch !important;
      }
      .tk-filters-row { flex-direction: column !important; }
      .tk-filters-row > * { width: 100% !important; }
      .tk-stats-grid { grid-template-columns: 1fr !important; }
      .tk-desktop-table { display: none !important; }
      .tk-mobile-cards { display: block !important; }
    }
  `;
  document.head.appendChild(style);
}

export default AdminTickets;
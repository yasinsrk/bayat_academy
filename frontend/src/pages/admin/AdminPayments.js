// src/pages/admin/AdminPayments.js
import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  FaSearch, FaFilter, FaChevronLeft, FaChevronRight,
  FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaBan,
  FaMoneyBillWave, FaCalendarAlt, FaWallet, FaUser,
  FaBox, FaInfoCircle, FaCalendar, FaClock,
  FaArrowUp, FaArrowDown, FaCreditCard, FaTrash,
} from 'react-icons/fa';
import AdminLayout from './AdminLayout';
import SavedViewsBar from '../../components/SavedViewsBar';
import ExportMenu from '../../components/ExportMenu';
import BulkActionsBar from '../../components/BulkActionsBar';
import ColumnToggle, { useColumnPrefs } from '../../components/ColumnToggle';
import { toast } from 'react-toastify';
import axios from 'axios';
import moment from 'moment-jalaali';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { registerLocale } from 'react-datepicker';
import fa from 'date-fns/locale/fa-IR';
import theme from '../../styles/adminTheme';
import { formatJalali, formatJalaliDateTime } from '../../utils/jalali';

registerLocale('fa', fa);

const API_URL = '/api';

const persianMonths = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
];

const fmtPrice = (n) => (n || 0).toLocaleString('fa-IR');

const COLUMNS = [
  { key: 'id',      label: 'شناسه' },
  { key: 'user',    label: 'کاربر', always: true },
  { key: 'package', label: 'دوره' },
  { key: 'amount',  label: 'مبلغ' },
  { key: 'status',  label: 'وضعیت' },
  { key: 'date',    label: 'تاریخ' },
  { key: 'ref',     label: 'کد پیگیری' },
  { key: 'actions', label: 'عملیات', always: true },
];

function AdminPayments() {
  const { user } = useSelector((s) => s.auth);

  // ── Data ──
  const [payments, setPayments] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Filters ──
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('month');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // ── Table ──
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const itemsPerPage = 10;

  // ── Bulk ──
  const [selectedIds, setSelectedIds] = useState([]);

  // ── Column visibility ──
  const [visibleCols, setVisibleCols] = useColumnPrefs('payments.columns', {
    id: true,
    user: true,
    package: true,
    amount: true,
    status: true,
    date: true,
    ref: true,
    actions: true,
  });

  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    successfulTransactions: 0,
    failedTransactions: 0,
    pendingTransactions: 0,
    averageTransaction: 0,
    monthlyData: [],
    growth: 0,
  });

  // ── Default dates ──
  useEffect(() => {
    const now = moment();
    const oneMonthAgo = moment().subtract(1, 'months');
    setStartDate(oneMonthAgo.format('jYYYY-jMM-jDD'));
    setEndDate(now.format('jYYYY-jMM-jDD'));
  }, []);

  // ── Fetch ──
  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (payments.length > 0) applyFilters();
    // eslint-disable-next-line
  }, [payments, filterPeriod, selectedMonth, startDate, endDate, filterStatus, searchTerm]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };

      const [paymentsRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/payments/payments/`, { headers }),
        axios.get(`${API_URL}/payments/stats/`, { headers }).catch(() => ({ data: {} })),
      ]);

      let paymentsData = [];
      if (paymentsRes.data?.results) paymentsData = paymentsRes.data.results;
      else if (Array.isArray(paymentsRes.data)) paymentsData = paymentsRes.data;

      setPayments(paymentsData);
      setFilteredData(paymentsData);

      const s = statsRes.data || {};
      const avg = s.successful > 0
        ? Math.round((s.total_revenue || 0) / s.successful)
        : 0;

      let growth = 0;
      if (s.monthly_revenue && s.monthly_revenue.length >= 2) {
        const last = s.monthly_revenue[s.monthly_revenue.length - 1];
        const prev = s.monthly_revenue[s.monthly_revenue.length - 2];
        if (prev && prev.revenue > 0) {
          growth = ((last.revenue - prev.revenue) / prev.revenue) * 100;
        }
      }

      setStats({
        totalRevenue: s.total_revenue || 0,
        totalTransactions: s.total_transactions || 0,
        successfulTransactions: s.successful || 0,
        failedTransactions: s.failed || 0,
        pendingTransactions: s.pending || 0,
        averageTransaction: avg,
        monthlyData: s.monthly_revenue || [],
        growth: Math.round(growth),
      });
    } catch (e) {
      console.error(e);
      toast.error('خطا در دریافت تراکنش‌ها');
    } finally {
      setLoading(false);
    }
  };

  // ── Filtering ──
  const applyFilters = () => {
    let data = [...payments];

    if (filterPeriod === 'month' && selectedMonth) {
      const [year, month] = selectedMonth.split('-');
      data = data.filter((p) => {
        if (!p.created_at) return false;
        const m = moment(p.created_at);
        return m.jYear() === parseInt(year) && m.jMonth() + 1 === parseInt(month);
      });
    }

    if (filterPeriod === 'custom' && startDate && endDate) {
      const start = moment(startDate, 'jYYYY-jMM-jDD').toDate();
      const end = moment(endDate, 'jYYYY-jMM-jDD').toDate();
      end.setHours(23, 59, 59);
      data = data.filter((p) => {
        if (!p.created_at) return false;
        const d = new Date(p.created_at);
        return d >= start && d <= end;
      });
    }

    if (filterStatus !== 'all') {
      data = data.filter((p) => p.status === filterStatus);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter((p) =>
        (p.user?.username || '').toLowerCase().includes(term) ||
        (p.user?.full_name || '').toLowerCase().includes(term) ||
        (p.package?.title || '').toLowerCase().includes(term) ||
        (p.ref_id || '').toString().toLowerCase().includes(term) ||
        (p.authority || '').toString().toLowerCase().includes(term)
      );
    }

    setFilteredData(data);
    setCurrentPage(1);
  };

  // ── Date helpers ──
  const toGregorian = (persianDate) => {
    if (!persianDate) return null;
    const parts = persianDate.split('-');
    if (parts.length !== 3) return null;
    return moment(`${parts[0]}/${parts[1]}/${parts[2]}`, 'jYYYY/jMM/jDD').toDate();
  };

  const toPersian = (date) => (date ? moment(date).format('jYYYY-jMM-jDD') : '');

  // ── Status badge ──
  const getStatusBadge = (status) => {
    const configs = {
      paid: { label: 'پرداخت شده', color: theme.colors.success, bg: theme.colors.successSoft, icon: FaCheckCircle },
      success: { label: 'پرداخت شده', color: theme.colors.success, bg: theme.colors.successSoft, icon: FaCheckCircle },
      pending: { label: 'در انتظار', color: theme.colors.warning, bg: theme.colors.warningSoft, icon: FaHourglassHalf },
      failed: { label: 'ناموفق', color: theme.colors.danger, bg: theme.colors.dangerSoft, icon: FaTimesCircle },
      cancelled: { label: 'لغو شده', color: theme.colors.textMuted, bg: theme.colors.surfaceAlt, icon: FaBan },
    };
    return configs[status] || configs.pending;
  };

  // ── Pagination ──
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = filteredData.slice(
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
    const allIds = currentItems.map((p) => p.id);
    const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !allIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...allIds])));
    }
  };

  const clearSelection = () => setSelectedIds([]);

  const handleBulkStatus = async (ids, newStatus) => {
    const token = localStorage.getItem('access_token');
    await axios.post(
      `${API_URL}/payments/bulk/status/`,
      { ids, status: newStatus },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  const handleBulkDelete = async (ids) => {
    const token = localStorage.getItem('access_token');
    await axios.post(
      `${API_URL}/payments/bulk/delete/`,
      { ids },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  // ── Export data ──
  const exportData = useMemo(
    () =>
      filteredData.map((p) => ({
        'کاربر': p.user?.full_name || p.user?.username || '—',
        'دوره': p.package?.title || '—',
        'مبلغ': fmtPrice(p.amount),
        'وضعیت': getStatusBadge(p.status).label,
        'کد پیگیری': p.ref_id || p.authority || '—',
        'تاریخ': p.created_at,
      })),
    [filteredData]
  );

  if (loading) {
    return (
      <AdminLayout>
        <PaymentSkeleton />
      </AdminLayout>
    );
  }

  const allOnPageSelected =
    currentItems.length > 0 && currentItems.every((p) => selectedIds.includes(p.id));

  return (
    <AdminLayout>
      <div style={S.container}>

        {/* ═══════ HEADER ═══════ */}
        <div style={S.pageHeader} className="pay-page-header">
          <div>
            <h1 style={S.pageTitle}>مدیریت تراکنش‌ها</h1>
            <p style={S.pageSubtitle}>گزارش کامل مالی و فروش</p>
          </div>
          <div style={S.headerActions}>
            <ColumnToggle
              storageKey="payments.columns"
              columns={COLUMNS}
              visible={visibleCols}
              onChange={setVisibleCols}
            />
            <ExportMenu
              data={exportData}
              filename="payments"
              title="گزارش تراکنش‌ها"
            />
          </div>
        </div>

        {/* ═══════ STATS ═══════ */}
        <div style={S.statsGrid} className="pay-stats-grid">
          <StatCard
            icon={FaMoneyBillWave}
            label="کل درآمد"
            value={`${fmtPrice(stats.totalRevenue)}`}
            unit="تومان"
            color={theme.colors.tintIndigo}
            soft={theme.colors.tintIndigoSoft}
            subtitle={`${fmtPrice(stats.successfulTransactions)} تراکنش موفق`}
            trend={stats.growth}
          />
          <StatCard
            icon={FaCheckCircle}
            label="تراکنش‌های موفق"
            value={fmtPrice(stats.successfulTransactions)}
            color={theme.colors.tintEmerald}
            soft={theme.colors.tintEmeraldSoft}
            subtitle={`میانگین ${fmtPrice(stats.averageTransaction)} تومان`}
          />
          <StatCard
            icon={FaHourglassHalf}
            label="در انتظار"
            value={fmtPrice(stats.pendingTransactions)}
            color={theme.colors.warning}
            soft={theme.colors.warningSoft}
          />
          <StatCard
            icon={FaTimesCircle}
            label="ناموفق"
            value={fmtPrice(stats.failedTransactions)}
            color={theme.colors.danger}
            soft={theme.colors.dangerSoft}
          />
        </div>

        {/* ═══════ SAVED VIEWS ═══════ */}
        <SavedViewsBar
          page="payments"
          currentFilters={{
            status: filterStatus,
            period: filterPeriod,
            selectedMonth,
            startDate,
            endDate,
            search: searchTerm,
          }}
          onApply={(f) => {
            if (f.status !== undefined) setFilterStatus(f.status);
            if (f.period !== undefined) setFilterPeriod(f.period);
            if (f.selectedMonth !== undefined) setSelectedMonth(f.selectedMonth);
            if (f.startDate !== undefined) setStartDate(f.startDate);
            if (f.endDate !== undefined) setEndDate(f.endDate);
            if (f.search !== undefined) setSearchTerm(f.search);
          }}
        />

        {/* ═══════ FILTERS ═══════ */}
        <div style={S.filtersCard} className="pay-filters-card">
          <div style={S.filtersRow} className="pay-filters-row">
            <div style={S.searchWrapper}>
              <FaSearch size={11} style={S.searchIcon} />
              <input
                type="text"
                placeholder="جستجوی کاربر، دوره، کد تراکنش..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={S.searchInput}
              />
            </div>

            <div style={S.filterWrapper}>
              <FaFilter size={10} style={S.filterIcon} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={S.filterSelect}
              >
                <option value="all">همه وضعیت‌ها</option>
                <option value="paid">پرداخت شده</option>
                <option value="pending">در انتظار</option>
                <option value="failed">ناموفق</option>
                <option value="cancelled">لغو شده</option>
              </select>
            </div>

            <div style={S.filterWrapper}>
              <FaCalendarAlt size={10} style={S.filterIcon} />
              <select
                value={filterPeriod}
                onChange={(e) => setFilterPeriod(e.target.value)}
                style={S.filterSelect}
              >
                <option value="month">ماهانه</option>
                <option value="custom">بازه زمانی</option>
              </select>
            </div>

            {filterPeriod === 'month' && (
              <div style={S.filterWrapper}>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  style={S.filterSelect}
                >
                  <option value="">همه ماه‌ها</option>
                  {Array.from({ length: 12 }, (_, i) => {
                    const month = i + 1;
                    const year = 1403;
                    const val = `${year}-${String(month).padStart(2, '0')}`;
                    return (
                      <option key={val} value={val}>
                        {persianMonths[i]} {year}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {filterPeriod === 'custom' && (
              <div style={S.dateRangeWrapper}>
                <DatePicker
                  selected={startDate ? toGregorian(startDate) : null}
                  onChange={(d) => setStartDate(toPersian(d))}
                  placeholderText="از تاریخ"
                  className="pay-datepicker"
                  dateFormat="yyyy/MM/dd"
                  locale="fa"
                  isClearable
                />
                <span style={S.dateSeparator}>تا</span>
                <DatePicker
                  selected={endDate ? toGregorian(endDate) : null}
                  onChange={(d) => setEndDate(toPersian(d))}
                  placeholderText="تا تاریخ"
                  className="pay-datepicker"
                  dateFormat="yyyy/MM/dd"
                  locale="fa"
                  isClearable
                />
              </div>
            )}
          </div>

          <div style={S.filtersMeta}>
            <span style={S.filtersCount}>
              {filteredData.length.toLocaleString('fa-IR')} تراکنش
            </span>
            {(filterStatus !== 'all' || searchTerm || selectedMonth) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setSelectedMonth('');
                  setFilterPeriod('month');
                }}
                style={S.clearBtn}
                className="pay-clear-btn"
              >
                پاک کردن فیلترها
              </button>
            )}
          </div>
        </div>

        {/* ═══════ TABLE ═══════ */}
        <div style={S.tableCard} className="pay-table-card">
          {currentItems.length === 0 ? (
            <div style={S.empty}>
              <div style={S.emptyIconWrap}>
                <FaCreditCard size={22} color={theme.colors.textFaint} />
              </div>
              <h4 style={S.emptyTitle}>هیچ تراکنشی یافت نشد</h4>
              <p style={S.emptyDesc}>
                فیلترها را تغییر دهید یا بعد از اولین فروش دوباره سر بزنید.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div style={S.tableWrap} className="pay-desktop-table">
                <table style={S.table}>
                  <thead>
                    <tr>
                      <th style={{ ...S.th, width: 42 }}>
                        <input
                          type="checkbox"
                          checked={allOnPageSelected}
                          onChange={toggleSelectAll}
                          style={S.checkbox}
                        />
                      </th>
                      {visibleCols.id && <th style={S.th}>#</th>}
                      {visibleCols.user && <th style={S.th}>کاربر</th>}
                      {visibleCols.package && <th style={S.th}>دوره</th>}
                      {visibleCols.amount && <th style={S.th}>مبلغ</th>}
                      {visibleCols.status && <th style={S.th}>وضعیت</th>}
                      {visibleCols.date && <th style={S.th}>تاریخ</th>}
                      {visibleCols.ref && <th style={S.th}>کد پیگیری</th>}
                      {visibleCols.actions && <th style={S.th}></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((p) => {
                      const status = getStatusBadge(p.status);
                      const Icon = status.icon;
                      const isSelected = selectedIds.includes(p.id);
                      return (
                        <tr
                          key={p.id}
                          style={{
                            ...S.tr,
                            ...(isSelected ? S.trSelected : {}),
                          }}
                          className="pay-row"
                        >
                          <td style={{ ...S.td, width: 42 }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(p.id)}
                              style={S.checkbox}
                            />
                          </td>
                          {visibleCols.id && <td style={S.td}>#{p.id}</td>}
                          {visibleCols.user && (
                            <td style={S.td}>
                              <div style={S.userCell}>
                                <div style={S.userAvatar}>
                                  {(p.user?.full_name || p.user?.username || '?')[0]}
                                </div>
                                <div>
                                  <div style={S.userName}>
                                    {p.user?.full_name || p.user?.username || 'کاربر حذف شده'}
                                  </div>
                                  <div style={S.userEmail}>{p.user?.email || ''}</div>
                                </div>
                              </div>
                            </td>
                          )}
                          {visibleCols.package && (
                            <td style={{ ...S.td, color: theme.colors.textMuted }}>
                              {p.package?.title || 'دوره حذف شده'}
                            </td>
                          )}
                          {visibleCols.amount && (
                            <td style={{ ...S.td, fontWeight: 700 }}>
                              {fmtPrice(p.amount)}
                            </td>
                          )}
                          {visibleCols.status && (
                            <td style={S.td}>
                              <span style={{ ...S.pill, background: status.bg, color: status.color }}>
                                <Icon size={10} />
                                {status.label}
                              </span>
                            </td>
                          )}
                          {visibleCols.date && (
                            <td style={{ ...S.td, color: theme.colors.textSubtle }}>
                              {formatJalali(p.created_at)}
                            </td>
                          )}
                          {visibleCols.ref && (
                            <td style={{ ...S.td, fontFamily: 'monospace', color: theme.colors.textSubtle }}>
                              {p.ref_id || p.authority || '—'}
                            </td>
                          )}
                          {visibleCols.actions && (
                            <td style={S.td}>
                              <button
                                onClick={() => {
                                  setSelectedPayment(p);
                                  setShowDetailModal(true);
                                }}
                                style={S.rowAction}
                                className="pay-row-action"
                              >
                                <FaInfoCircle size={11} />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="pay-mobile-cards">
                {currentItems.map((p) => {
                  const status = getStatusBadge(p.status);
                  const Icon = status.icon;
                  const isSelected = selectedIds.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      style={{
                        ...S.mobileCard,
                        ...(isSelected ? S.mobileCardSelected : {}),
                      }}
                    >
                      <div style={S.mobileCheckRow}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(p.id)}
                          style={S.checkbox}
                        />
                        <span style={S.mobileSelectedLabel}>انتخاب</span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedPayment(p);
                          setShowDetailModal(true);
                        }}
                        style={S.mobileCardBody}
                      >
                        <div style={S.mobileTop}>
                          <div style={S.userCell}>
                            <div style={S.userAvatar}>
                              {(p.user?.full_name || p.user?.username || '?')[0]}
                            </div>
                            <div>
                              <div style={S.userName}>
                                {p.user?.full_name || p.user?.username || 'کاربر حذف شده'}
                              </div>
                              <div style={S.mobileTime}>{formatJalali(p.created_at)}</div>
                            </div>
                          </div>
                          <span style={{ ...S.pill, background: status.bg, color: status.color }}>
                            <Icon size={10} />
                            {status.label}
                          </span>
                        </div>
                        <div style={S.mobileRow}>
                          <span style={S.mobileLabel}>دوره</span>
                          <span style={S.mobileValue}>{p.package?.title || '—'}</span>
                        </div>
                        <div style={S.mobileRow}>
                          <span style={S.mobileLabel}>مبلغ</span>
                          <span style={{ ...S.mobileValue, fontWeight: 700 }}>
                            {fmtPrice(p.amount)} تومان
                          </span>
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={S.pagination}>
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={S.pageBtn}
                    className="pay-page-btn"
                  >
                    <FaChevronRight size={10} />
                  </button>
                  <span style={S.pageInfo}>
                    صفحه {currentPage.toLocaleString('fa-IR')} از {totalPages.toLocaleString('fa-IR')}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    style={S.pageBtn}
                    className="pay-page-btn"
                  >
                    <FaChevronLeft size={10} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

      </div>

      {/* ═══════ DETAIL MODAL ═══════ */}
      {showDetailModal && selectedPayment && (
        <div style={S.modalBackdrop} onClick={() => setShowDetailModal(false)}>
          <div style={S.modal} onClick={(e) => e.stopPropagation()}>
            <div style={S.modalHeader}>
              <h3 style={S.modalTitle}>جزئیات تراکنش #{selectedPayment.id}</h3>
              <button
                onClick={() => setShowDetailModal(false)}
                style={S.modalClose}
              >
                ×
              </button>
            </div>

            <div style={S.modalBody}>
              <DetailRow
                icon={FaUser}
                label="کاربر"
                value={selectedPayment.user?.full_name || selectedPayment.user?.username || '—'}
              />
              <DetailRow
                icon={FaBox}
                label="دوره"
                value={selectedPayment.package?.title || '—'}
              />
              <DetailRow
                icon={FaWallet}
                label="مبلغ"
                value={`${fmtPrice(selectedPayment.amount)} تومان`}
              />
              <DetailRow
                icon={FaCheckCircle}
                label="وضعیت"
                value={
                  <span
                    style={{
                      ...S.pill,
                      background: getStatusBadge(selectedPayment.status).bg,
                      color: getStatusBadge(selectedPayment.status).color,
                    }}
                  >
                    {getStatusBadge(selectedPayment.status).label}
                  </span>
                }
              />
              <DetailRow
                icon={FaCreditCard}
                label="کد پیگیری"
                value={selectedPayment.ref_id || selectedPayment.authority || '—'}
              />
              <DetailRow
                icon={FaCalendar}
                label="تاریخ ایجاد"
                value={formatJalaliDateTime(selectedPayment.created_at)}
              />
              {selectedPayment.paid_at && (
                <DetailRow
                  icon={FaClock}
                  label="تاریخ پرداخت"
                  value={formatJalaliDateTime(selectedPayment.paid_at)}
                />
              )}
            </div>

            <div style={S.modalFooter}>
              <button
                onClick={() => setShowDetailModal(false)}
                style={S.modalCloseBtn}
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ BULK ACTIONS BAR ═══════ */}
      <BulkActionsBar
        selectedIds={selectedIds}
        onClear={clearSelection}
        resourceName="تراکنش"
        onRefresh={fetchPayments}
        actions={[
          {
            key: 'paid',
            label: 'پرداخت شده',
            icon: FaCheckCircle,
            color: theme.colors.success,
            bg: theme.colors.successSoft,
            onClick: (ids) => handleBulkStatus(ids, 'paid'),
          },
          {
            key: 'pending',
            label: 'در انتظار',
            icon: FaHourglassHalf,
            color: theme.colors.warning,
            bg: theme.colors.warningSoft,
            onClick: (ids) => handleBulkStatus(ids, 'pending'),
          },
          {
            key: 'failed',
            label: 'ناموفق',
            icon: FaTimesCircle,
            color: theme.colors.danger,
            bg: theme.colors.dangerSoft,
            onClick: (ids) => handleBulkStatus(ids, 'failed'),
          },
          {
            key: 'cancelled',
            label: 'لغو',
            icon: FaBan,
            color: theme.colors.textMuted,
            bg: theme.colors.surfaceAlt,
            onClick: (ids) => handleBulkStatus(ids, 'cancelled'),
          },
          {
            key: 'delete',
            label: 'حذف',
            icon: FaTrash,
            color: '#FFFFFF',
            bg: theme.colors.danger,
            danger: true,
            onClick: (ids) => handleBulkDelete(ids),
          },
        ]}
      />

    </AdminLayout>
  );
}

// ═══════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════

function StatCard({ icon: Icon, label, value, unit, subtitle, trend, color, soft }) {
  const trendPositive = trend >= 0;
  return (
    <div style={S.statCard} className="pay-card-static">
      <div style={S.statTop}>
        <div style={{ ...S.statIconBox, background: soft }}>
          <Icon size={14} color={color} />
        </div>
        {trend !== undefined && trend !== null && (
          <div
            style={{
              ...S.statDelta,
              color: trendPositive ? theme.colors.success : theme.colors.danger,
              background: trendPositive ? theme.colors.successSoft : theme.colors.dangerSoft,
            }}
          >
            {trendPositive ? <FaArrowUp size={8} /> : <FaArrowDown size={8} />}
            <span>{Math.abs(trend).toFixed(1)}%</span>
          </div>
        )}
      </div>
      <div style={S.statLabel}>{label}</div>
      <div style={S.statValueRow}>
        <span style={S.statValue}>{value}</span>
        {unit && <span style={S.statUnit}>{unit}</span>}
      </div>
      {subtitle && <div style={S.statSub}>{subtitle}</div>}
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div style={S.detailRow}>
      <span style={S.detailLabel}>
        <Icon size={11} />
        {label}
      </span>
      <span style={S.detailValue}>{value}</span>
    </div>
  );
}

function PaymentSkeleton() {
  return (
    <div style={S.container}>
      <div style={S.pageHeader}>
        <div>
          <div style={{ ...S.skelBar, width: 180, height: 26 }} />
          <div style={{ ...S.skelBar, width: 220, height: 14, marginTop: 10 }} />
        </div>
        <div style={{ ...S.skelBar, width: 200, height: 38, borderRadius: 10 }} />
      </div>
      <div style={S.statsGrid} className="pay-stats-grid">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={S.statCard}>
            <div style={{ ...S.skelBar, width: 36, height: 36, borderRadius: 10 }} />
            <div style={{ ...S.skelBar, width: 70, height: 12, marginTop: 12 }} />
            <div style={{ ...S.skelBar, width: 140, height: 22, marginTop: 6 }} />
          </div>
        ))}
      </div>
      <div style={{ ...S.skelBar, width: '100%', height: 46, borderRadius: 12 }} />
      <div style={{ ...S.skelBar, width: '100%', height: 300, borderRadius: 14, marginTop: 8 }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════

const S = {
  container: {
    maxWidth: 1360,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    minWidth: 0,
  },

  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    flexWrap: 'wrap',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 800,
    color: theme.colors.text,
    margin: 0,
    letterSpacing: '-0.4px',
  },
  pageSubtitle: {
    fontSize: 13,
    color: theme.colors.textSubtle,
    margin: '6px 0 0',
  },
  headerActions: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 14,
  },
  statCard: {
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 14,
    padding: 20,
    boxShadow: theme.shadow.sm,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  statTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  statIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statDelta: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 3,
    fontSize: 11,
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: 999,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: 500,
    color: theme.colors.textSubtle,
  },
  statValueRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 6,
    flexWrap: 'wrap',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 800,
    color: theme.colors.text,
    letterSpacing: '-0.6px',
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1,
  },
  statUnit: {
    fontSize: 12,
    fontWeight: 500,
    color: theme.colors.textSubtle,
  },
  statSub: {
    fontSize: 11.5,
    color: theme.colors.textSubtle,
    fontWeight: 500,
  },

  filtersCard: {
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 14,
    boxShadow: theme.shadow.sm,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  filtersRow: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
  },
  searchWrapper: {
    position: 'relative',
    flex: 1,
    minWidth: 220,
  },
  searchIcon: {
    position: 'absolute',
    right: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    color: theme.colors.textFaint,
  },
  searchInput: {
    width: '100%',
    padding: '10px 40px 10px 14px',
    background: theme.colors.surfaceAlt,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 10,
    fontSize: 13,
    color: theme.colors.text,
    fontFamily: theme.font.family,
    outline: 'none',
    boxSizing: 'border-box',
  },
  filterWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 14px',
    background: theme.colors.surfaceAlt,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 10,
  },
  filterIcon: {
    color: theme.colors.textFaint,
  },
  filterSelect: {
    background: 'transparent',
    border: 'none',
    fontSize: 12.5,
    color: theme.colors.text,
    fontFamily: theme.font.family,
    cursor: 'pointer',
    outline: 'none',
  },
  dateRangeWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  dateSeparator: {
    color: theme.colors.textFaint,
    fontSize: 12,
  },

  filtersMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTop: `1px solid ${theme.colors.borderSoft}`,
    gap: 8,
  },
  filtersCount: {
    fontSize: 12,
    color: theme.colors.textSubtle,
    fontWeight: 500,
  },
  clearBtn: {
    padding: '6px 14px',
    background: theme.colors.dangerSoft,
    border: 'none',
    borderRadius: 8,
    fontSize: 11.5,
    fontWeight: 600,
    color: theme.colors.danger,
    fontFamily: theme.font.family,
    cursor: 'pointer',
  },

  tableCard: {
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 14,
    boxShadow: theme.shadow.sm,
    overflow: 'hidden',
  },
  tableWrap: {
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'right',
    padding: '12px 16px',
    fontSize: 10.5,
    fontWeight: 700,
    color: theme.colors.textFaint,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    background: theme.colors.surfaceAlt,
    borderBottom: `1px solid ${theme.colors.border}`,
    whiteSpace: 'nowrap',
  },
  tr: {
    borderBottom: `1px solid ${theme.colors.borderSoft}`,
    transition: 'background 0.15s',
  },
  trSelected: {
    background: theme.colors.accentSoft,
  },
  td: {
    padding: '12px 16px',
    fontSize: 13,
    color: theme.colors.text,
    fontFamily: theme.font.family,
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
  },
  checkbox: {
    width: 16,
    height: 16,
    accentColor: theme.colors.accent,
    cursor: 'pointer',
  },

  userCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
  },
  userAvatar: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${theme.colors.accent} 0%, #7C5CE7 100%)`,
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
  },
  userName: {
    fontSize: 12.5,
    fontWeight: 600,
    color: theme.colors.text,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  userEmail: {
    fontSize: 11,
    color: theme.colors.textFaint,
    marginTop: 1,
  },

  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '4px 10px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  rowAction: {
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

  // ── Mobile ──
  mobileCard: {
    display: 'block',
    width: '100%',
    textAlign: 'right',
    padding: 14,
    background: theme.colors.surface,
    borderBottom: `1px solid ${theme.colors.borderSoft}`,
    fontFamily: theme.font.family,
  },
  mobileCardSelected: {
    background: theme.colors.accentSoft,
  },
  mobileCheckRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  mobileSelectedLabel: {
    fontSize: 11.5,
    color: theme.colors.textSubtle,
    fontWeight: 500,
  },
  mobileCardBody: {
    display: 'block',
    width: '100%',
    textAlign: 'right',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontFamily: theme.font.family,
    padding: 0,
  },
  mobileTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  mobileTime: {
    fontSize: 11,
    color: theme.colors.textFaint,
    marginTop: 1,
  },
  mobileRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 8,
    padding: '4px 0',
  },
  mobileLabel: {
    fontSize: 12,
    color: theme.colors.textSubtle,
    fontWeight: 500,
  },
  mobileValue: {
    fontSize: 12.5,
    color: theme.colors.text,
    fontWeight: 500,
    textAlign: 'left',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '65%',
  },

  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderTop: `1px solid ${theme.colors.borderSoft}`,
  },
  pageBtn: {
    width: 34,
    height: 34,
    borderRadius: 9,
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    color: theme.colors.textMuted,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageInfo: {
    fontSize: 12.5,
    color: theme.colors.textSubtle,
    fontWeight: 500,
  },

  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '56px 20px',
    textAlign: 'center',
  },
  emptyIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    background: theme.colors.surfaceAlt,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: theme.colors.text,
    margin: 0,
  },
  emptyDesc: {
    fontSize: 12.5,
    color: theme.colors.textSubtle,
    margin: 0,
    maxWidth: 320,
    lineHeight: 1.6,
  },

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
    maxHeight: '85vh',
    background: theme.colors.surface,
    borderRadius: 16,
    boxShadow: theme.shadow.xl,
    display: 'flex',
    flexDirection: 'column',
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
    fontSize: 22,
    color: theme.colors.textFaint,
    cursor: 'pointer',
    lineHeight: 1,
  },
  modalBody: {
    padding: 20,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  modalFooter: {
    padding: '12px 20px',
    borderTop: `1px solid ${theme.colors.border}`,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  modalCloseBtn: {
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

  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    padding: '10px 0',
    borderBottom: `1px solid ${theme.colors.borderSoft}`,
  },
  detailLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    color: theme.colors.textSubtle,
    fontWeight: 500,
  },
  detailValue: {
    fontSize: 12.5,
    fontWeight: 600,
    color: theme.colors.text,
    textAlign: 'left',
    maxWidth: '65%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  skelBar: {
    background: 'linear-gradient(90deg, #EEF0F4 0%, #F7F8FA 50%, #EEF0F4 100%)',
    backgroundSize: '200% 100%',
    borderRadius: 6,
    animation: 'pay-skel 1.4s ease-in-out infinite',
  },
};

if (typeof document !== 'undefined' && !document.getElementById('admin-payments-styles')) {
  const style = document.createElement('style');
  style.id = 'admin-payments-styles';
  style.textContent = `
    @keyframes pay-skel {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .pay-card-static { transition: box-shadow 0.18s ease !important; }
    .pay-card-static:hover {
      box-shadow: 0 8px 24px -6px rgba(15,23,42,0.08), 0 2px 6px -2px rgba(15,23,42,0.04) !important;
    }
    .pay-row:hover { background: ${theme.colors.surfaceAlt}; }
    .pay-row:last-child { border-bottom: none; }
    .pay-row-action:hover {
      background: ${theme.colors.accentSoft} !important;
      color: ${theme.colors.accent} !important;
    }
    .pay-clear-btn:hover {
      background: ${theme.colors.danger} !important;
      color: #FFFFFF !important;
    }
    .pay-page-btn:hover {
      background: ${theme.colors.surfaceAlt} !important;
    }
    .pay-page-btn:disabled { opacity: 0.35; cursor: not-allowed; }

    .pay-mobile-cards { display: none; }

    .pay-datepicker {
      padding: 8px 12px;
      background: ${theme.colors.surfaceAlt};
      border: 1px solid ${theme.colors.border};
      border-radius: 8px;
      font-size: 12px;
      color: ${theme.colors.text};
      font-family: Vazirmatn, sans-serif;
      width: 130px;
      outline: none;
    }
    .react-datepicker { font-family: Vazirmatn, sans-serif !important; border-radius: 12px !important; }
    .react-datepicker__current-month,
    .react-datepicker__day-name,
    .react-datepicker__day { font-family: Vazirmatn, sans-serif !important; }
    .react-datepicker__day--selected {
      background: ${theme.colors.accent} !important;
      border-radius: 8px !important;
    }

    @media (max-width: 1023px) {
      .pay-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
    }
    @media (max-width: 768px) {
      .pay-page-header {
        flex-direction: column !important;
        align-items: stretch !important;
      }
      .pay-filters-row {
        flex-direction: column !important;
      }
      .pay-filters-row > * { width: 100% !important; }
      .pay-stats-grid { grid-template-columns: 1fr !important; }
      .pay-desktop-table { display: none !important; }
      .pay-mobile-cards { display: block !important; }
    }
  `;
  document.head.appendChild(style);
}

export default AdminPayments;
// src/pages/admin/AdminAudit.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaHistory, FaSearch, FaFilter, FaUser, FaBox, FaTag,
  FaCreditCard, FaTicketAlt, FaUserShield, FaPlus,
  FaEdit, FaTrash, FaChevronLeft, FaChevronRight,
  FaSync, FaGlobe, FaInfoCircle,
} from 'react-icons/fa';
import AdminLayout from './AdminLayout';
import { toast } from 'react-toastify';
import axios from 'axios';
import theme from '../../styles/adminTheme';
import { formatJalaliDateTime, formatJalaliRelative } from '../../utils/jalali';

const API_URL = '/api';

const MODEL_ICONS = {
  package: FaBox,
  category: FaTag,
  userpackage: FaBox,
  payment: FaCreditCard,
  ticket: FaTicketAlt,
  ticketreply: FaTicketAlt,
  user: FaUser,
};

const MODEL_LABELS = {
  package: 'دوره',
  category: 'دسته‌بندی',
  userpackage: 'خرید دوره',
  payment: 'تراکنش',
  ticket: 'تیکت',
  ticketreply: 'پاسخ تیکت',
  user: 'کاربر',
};

const ACTION_STYLES = {
  create: { label: 'ایجاد', color: '#059669', bg: '#ECFDF5', icon: FaPlus },
  update: { label: 'ویرایش', color: '#D97706', bg: '#FFFBEB', icon: FaEdit },
  delete: { label: 'حذف', color: '#DC2626', bg: '#FEF2F2', icon: FaTrash },
};

function AdminAudit() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterModel, setFilterModel] = useState('all');
  const [filterDays, setFilterDays] = useState('7');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const pageSize = 20;

  useEffect(() => {
    fetchStats();
    fetchModels();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line
  }, [page, filterAction, filterModel, filterDays]);

  // Debounced search
  useEffect(() => {
    const id = setTimeout(() => {
      if (page !== 1) setPage(1);
      else fetchLogs();
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line
  }, [searchTerm]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get(`${API_URL}/audit/stats/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (e) {
      console.warn('[audit] stats error:', e?.message);
    }
  };

  const fetchModels = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get(`${API_URL}/audit/models/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setModels(res.data.models || []);
    } catch (e) {
      console.warn('[audit] models error:', e?.message);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams();
      if (filterAction !== 'all') params.append('action', filterAction);
      if (filterModel !== 'all') params.append('model', filterModel);
      if (filterDays !== 'all') params.append('days', filterDays);
      if (searchTerm.trim()) params.append('q', searchTerm.trim());
      params.append('page', page);
      params.append('page_size', pageSize);

      const res = await axios.get(`${API_URL}/audit/logs/?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setLogs(res.data.results || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.total_pages || 1);
    } catch (e) {
      console.error(e);
      toast.error('خطا در دریافت گزارش فعالیت');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterAction('all');
    setFilterModel('all');
    setFilterDays('7');
    setPage(1);
  };

  return (
    <AdminLayout>
      <div style={S.container}>

        {/* HEADER */}
        <div style={S.pageHeader} className="audit-page-header">
          <div>
            <h1 style={S.title}>گزارش فعالیت‌ها</h1>
            <p style={S.subtitle}>
              تمام اقدامات مدیران سیستم به‌صورت خودکار ثبت می‌شود
            </p>
          </div>
          <button onClick={() => { fetchStats(); fetchLogs(); }} style={S.refreshBtn} className="audit-refresh-btn">
            <FaSync size={11} />
            <span>بروزرسانی</span>
          </button>
        </div>

        {/* STATS */}
        {stats && (
          <div style={S.statsGrid} className="audit-stats-grid">
            <StatCard label="کل رویدادها" value={stats.total} color={theme.colors.accent} />
            <StatCard label="۲۴ ساعت اخیر" value={stats.last_24h} color={theme.colors.tintSky} />
            <StatCard label="ایجاد (۷ روز)" value={stats.creates_7d} color="#059669" />
            <StatCard label="ویرایش (۷ روز)" value={stats.updates_7d} color="#D97706" />
            <StatCard label="حذف (۷ روز)" value={stats.deletes_7d} color="#DC2626" />
          </div>
        )}

        {/* FILTERS */}
        <div style={S.filtersCard} className="audit-filters">
          <div style={S.searchWrap}>
            <FaSearch size={12} style={S.searchIcon} />
            <input
              type="text"
              placeholder="جستجو در کاربر، عنوان، مدل..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={S.searchInput}
            />
          </div>

          <div style={S.filterGroup}>
            <div style={S.filterWrapper}>
              <FaInfoCircle size={11} style={S.filterIcon} />
              <select
                value={filterAction}
                onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
                style={S.filterSelect}
              >
                <option value="all">همه اقدامات</option>
                <option value="create">ایجاد</option>
                <option value="update">ویرایش</option>
                <option value="delete">حذف</option>
              </select>
            </div>

            <div style={S.filterWrapper}>
              <FaFilter size={11} style={S.filterIcon} />
              <select
                value={filterModel}
                onChange={(e) => { setFilterModel(e.target.value); setPage(1); }}
                style={S.filterSelect}
              >
                <option value="all">همه مدل‌ها</option>
                {models.map((m) => (
                  <option key={m} value={m}>{MODEL_LABELS[m] || m}</option>
                ))}
              </select>
            </div>

            <div style={S.filterWrapper}>
              <FaHistory size={11} style={S.filterIcon} />
              <select
                value={filterDays}
                onChange={(e) => { setFilterDays(e.target.value); setPage(1); }}
                style={S.filterSelect}
              >
                <option value="1">۲۴ ساعت اخیر</option>
                <option value="7">۷ روز اخیر</option>
                <option value="30">۳۰ روز اخیر</option>
                <option value="90">۹۰ روز اخیر</option>
                <option value="all">همه</option>
              </select>
            </div>

            <button onClick={clearFilters} style={S.clearBtn} className="audit-clear-btn">
              پاک کردن
            </button>
          </div>
        </div>

        {/* LOGS */}
        <div style={S.listCard} className="audit-list-card">
          {loading ? (
            <div style={S.skeletonWrap}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={S.skeletonRow}>
                  <div style={S.skelCircle} />
                  <div style={{ flex: 1 }}>
                    <div style={{ ...S.skelBar, width: '40%' }} />
                    <div style={{ ...S.skelBar, width: '70%', marginTop: 6, height: 10 }} />
                  </div>
                  <div style={{ ...S.skelBar, width: 80, height: 12 }} />
                </div>
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div style={S.empty}>
              <div style={S.emptyIconWrap}>
                <FaHistory size={24} color={theme.colors.textFaint} />
              </div>
              <h4 style={S.emptyTitle}>هیچ رویدادی یافت نشد</h4>
              <p style={S.emptyDesc}>
                فعالیت‌های مدیران پس از وقوع اینجا ثبت و نمایش داده می‌شوند.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <table style={S.table} className="audit-desktop-table">
                <thead>
                  <tr>
                    <th style={S.th}>کاربر</th>
                    <th style={S.th}>اقدام</th>
                    <th style={S.th}>موضوع</th>
                    <th style={S.th}>IP</th>
                    <th style={S.th}>زمان</th>
                    <th style={S.th}></th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, idx) => {
                    const action = ACTION_STYLES[log.action] || ACTION_STYLES.update;
                    const ActionIcon = action.icon;
                    const ModelIcon = MODEL_ICONS[log.model_name] || FaInfoCircle;

                    return (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.015 }}
                        style={S.tr}
                        className="audit-row"
                      >
                        <td style={S.td}>
                          <div style={S.userCell}>
                            <div style={S.userAvatar}>
                              {log.user.full_name?.[0] || log.user.username?.[0] || '?'}
                            </div>
                            <span style={S.userName}>{log.user.full_name}</span>
                          </div>
                        </td>
                        <td style={S.td}>
                          <span style={{ ...S.pill, color: action.color, background: action.bg }}>
                            <ActionIcon size={9} />
                            {action.label}
                          </span>
                        </td>
                        <td style={S.td}>
                          <div style={S.subjectCell}>
                            <div style={S.modelIconBox}>
                              <ModelIcon size={10} color={theme.colors.textMuted} />
                            </div>
                            <div style={S.subjectInfo}>
                              <div style={S.subjectName}>{log.object_repr || '—'}</div>
                              <div style={S.subjectModel}>
                                {MODEL_LABELS[log.model_name] || log.model_name}
                                {log.object_id && ` · #${log.object_id}`}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={S.td}>
                          <span style={S.ipText}>{log.ip_address || '—'}</span>
                        </td>
                        <td style={S.td}>
                          <div style={S.timeCell}>
                            <div style={S.timeMain}>{formatJalaliRelative(log.created_at)}</div>
                            <div style={S.timeSub}>{formatJalaliDateTime(log.created_at)}</div>
                          </div>
                        </td>
                        <td style={S.td}>
                          <button
                            onClick={() => { setSelectedLog(log); setShowDetail(true); }}
                            style={S.detailBtn}
                            className="audit-detail-btn"
                            title="جزئیات"
                          >
                            <FaInfoCircle size={11} />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Mobile cards */}
              <div className="audit-mobile-cards">
                {logs.map((log) => {
                  const action = ACTION_STYLES[log.action] || ACTION_STYLES.update;
                  const ActionIcon = action.icon;
                  const ModelIcon = MODEL_ICONS[log.model_name] || FaInfoCircle;

                  return (
                    <button
                      key={log.id}
                      onClick={() => { setSelectedLog(log); setShowDetail(true); }}
                      style={S.mobileCard}
                    >
                      <div style={S.mobileTop}>
                        <div style={S.userCell}>
                          <div style={S.userAvatar}>
                            {log.user.full_name?.[0] || '?'}
                          </div>
                          <div>
                            <div style={S.userName}>{log.user.full_name}</div>
                            <div style={S.mobileTime}>{formatJalaliRelative(log.created_at)}</div>
                          </div>
                        </div>
                        <span style={{ ...S.pill, color: action.color, background: action.bg }}>
                          <ActionIcon size={9} />
                          {action.label}
                        </span>
                      </div>
                      <div style={S.mobileRow}>
                        <ModelIcon size={10} color={theme.colors.textMuted} />
                        <span style={S.mobileSubject}>{log.object_repr || '—'}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div style={S.pagination}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={S.pageBtn}
            >
              <FaChevronRight size={10} />
            </button>
            <span style={S.pageInfo}>
              صفحه {page} از {totalPages} · {total} رویداد
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={S.pageBtn}
            >
              <FaChevronLeft size={10} />
            </button>
          </div>
        )}

        {/* DETAIL MODAL */}
        {showDetail && selectedLog && (
          <div style={S.modalBackdrop} onClick={() => setShowDetail(false)}>
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              style={S.modal}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={S.modalHeader}>
                <h3 style={S.modalTitle}>جزئیات رویداد</h3>
                <button onClick={() => setShowDetail(false)} style={S.modalClose}>×</button>
              </div>

              <div style={S.modalBody}>
                <DetailRow label="کاربر" value={selectedLog.user.full_name} />
                <DetailRow label="اقدام" value={ACTION_STYLES[selectedLog.action]?.label || selectedLog.action} />
                <DetailRow label="مدل" value={MODEL_LABELS[selectedLog.model_name] || selectedLog.model_name} />
                <DetailRow label="موضوع" value={selectedLog.object_repr || '—'} />
                {selectedLog.object_id && <DetailRow label="شناسه" value={`#${selectedLog.object_id}`} />}
                <DetailRow label="IP" value={selectedLog.ip_address || '—'} />
                <DetailRow label="زمان" value={formatJalaliDateTime(selectedLog.created_at)} />

                {selectedLog.changes && Object.keys(selectedLog.changes).length > 0 && (
                  <div style={S.changesBox}>
                    <div style={S.changesTitle}>تغییرات ثبت‌شده</div>
                    <div style={S.changesList}>
                      {Object.entries(selectedLog.changes).map(([k, v]) => (
                        <div key={k} style={S.changeRow}>
                          <span style={S.changeKey}>{k}</span>
                          <span style={S.changeVal}>{String(v).slice(0, 100)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={S.modalFooter}>
                <button onClick={() => setShowDetail(false)} style={S.modalCloseBtn}>
                  بستن
                </button>
              </div>
            </motion.div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={S.statCard} className="audit-stat-card">
      <div style={S.statValue}>
        {(value || 0).toLocaleString('fa-IR')}
      </div>
      <div style={S.statLabel}>{label}</div>
      <div style={{ ...S.statBar, background: color }} />
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div style={S.detailRow}>
      <span style={S.detailLabel}>{label}</span>
      <span style={S.detailValue}>{value}</span>
    </div>
  );
}

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
  title: {
    fontSize: 24,
    fontWeight: 800,
    color: theme.colors.text,
    margin: 0,
    letterSpacing: '-0.4px',
  },
  subtitle: {
    fontSize: 13,
    color: theme.colors.textSubtle,
    margin: '6px 0 0',
  },
  refreshBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '9px 15px',
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 10,
    fontSize: 12.5,
    fontWeight: 600,
    color: theme.colors.textMuted,
    fontFamily: theme.font.family,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: 12,
  },
  statCard: {
    position: 'relative',
    padding: '16px 18px',
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 12,
    boxShadow: theme.shadow.sm,
    overflow: 'hidden',
  },
  statValue: {
    fontSize: 22,
    fontWeight: 800,
    color: theme.colors.text,
    letterSpacing: '-0.5px',
    fontVariantNumeric: 'tabular-nums',
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSubtle,
    marginTop: 3,
    fontWeight: 500,
  },
  statBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
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
  searchWrap: {
    position: 'relative',
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
  filterGroup: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
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
  clearBtn: {
    padding: '8px 16px',
    background: theme.colors.surfaceAlt,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 10,
    fontSize: 12.5,
    fontWeight: 600,
    color: theme.colors.textMuted,
    fontFamily: theme.font.family,
    cursor: 'pointer',
    marginRight: 'auto',
  },

  listCard: {
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 14,
    boxShadow: theme.shadow.sm,
    overflow: 'hidden',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
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
  },
  tr: {
    borderBottom: `1px solid ${theme.colors.borderSoft}`,
    transition: 'background 0.15s',
  },
  td: {
    padding: '12px 16px',
    fontSize: 13,
    color: theme.colors.text,
    fontFamily: theme.font.family,
    verticalAlign: 'middle',
  },

  userCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
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

  subjectCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
  },
  modelIconBox: {
    width: 26,
    height: 26,
    borderRadius: 7,
    background: theme.colors.surfaceAlt,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  subjectInfo: { minWidth: 0 },
  subjectName: {
    fontSize: 12.5,
    fontWeight: 600,
    color: theme.colors.text,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: 220,
  },
  subjectModel: {
    fontSize: 10.5,
    color: theme.colors.textFaint,
    marginTop: 2,
  },

  ipText: {
    fontSize: 12,
    color: theme.colors.textSubtle,
    fontFamily: 'monospace',
  },

  timeCell: { minWidth: 0 },
  timeMain: {
    fontSize: 12.5,
    fontWeight: 600,
    color: theme.colors.text,
  },
  timeSub: {
    fontSize: 10.5,
    color: theme.colors.textFaint,
    marginTop: 2,
  },

  detailBtn: {
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

  mobileCard: {
    display: 'block',
    width: '100%',
    textAlign: 'right',
    padding: 14,
    background: theme.colors.surface,
    border: 'none',
    borderBottom: `1px solid ${theme.colors.borderSoft}`,
    cursor: 'pointer',
    fontFamily: theme.font.family,
  },
  mobileTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  mobileTime: {
    fontSize: 11,
    color: theme.colors.textFaint,
    marginTop: 1,
  },
  mobileRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 0',
  },
  mobileSubject: {
    fontSize: 12.5,
    color: theme.colors.text,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1,
  },

  skeletonWrap: {
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  skeletonRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  skelCircle: {
    width: 30,
    height: 30,
    borderRadius: '50%',
    background: 'linear-gradient(90deg, #EEF0F4 0%, #F7F8FA 50%, #EEF0F4 100%)',
    backgroundSize: '200% 100%',
    animation: 'audit-skel 1.4s ease-in-out infinite',
    flexShrink: 0,
  },
  skelBar: {
    height: 12,
    borderRadius: 4,
    background: 'linear-gradient(90deg, #EEF0F4 0%, #F7F8FA 50%, #EEF0F4 100%)',
    backgroundSize: '200% 100%',
    animation: 'audit-skel 1.4s ease-in-out infinite',
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

  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
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
    maxWidth: 560,
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
    fontSize: 15,
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
    fontSize: 13,
    fontWeight: 600,
    color: theme.colors.textMuted,
    fontFamily: theme.font.family,
    cursor: 'pointer',
  },

  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    padding: '8px 0',
    borderBottom: `1px solid ${theme.colors.borderSoft}`,
  },
  detailLabel: {
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

  changesBox: {
    marginTop: 8,
    padding: 12,
    background: theme.colors.surfaceAlt,
    borderRadius: 10,
    border: `1px solid ${theme.colors.border}`,
  },
  changesTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: theme.colors.textFaint,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: 8,
  },
  changesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  changeRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    fontSize: 12,
  },
  changeKey: {
    color: theme.colors.textSubtle,
    fontWeight: 500,
  },
  changeVal: {
    color: theme.colors.text,
    fontFamily: 'monospace',
    maxWidth: '60%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
};

if (typeof document !== 'undefined' && !document.getElementById('admin-audit-styles')) {
  const style = document.createElement('style');
  style.id = 'admin-audit-styles';
  style.textContent = `
    @keyframes audit-skel {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .audit-refresh-btn:hover {
      background: ${theme.colors.surfaceAlt} !important;
      color: ${theme.colors.text} !important;
    }
    .audit-clear-btn:hover {
      background: ${theme.colors.dangerSoft} !important;
      color: ${theme.colors.danger} !important;
    }
    .audit-row:hover { background: ${theme.colors.surfaceAlt}; }
    .audit-row:last-child { border-bottom: none; }
    .audit-detail-btn:hover {
      background: ${theme.colors.accentSoft} !important;
      color: ${theme.colors.accent} !important;
    }
    .audit-mobile-cards { display: none; }

    @media (max-width: 768px) {
      .audit-page-header {
        flex-direction: column !important;
        align-items: stretch !important;
      }
      .audit-refresh-btn { justify-content: center !important; }
      .audit-stats-grid {
        grid-template-columns: repeat(2, 1fr) !important;
      }
      .audit-desktop-table { display: none !important; }
      .audit-mobile-cards { display: block !important; }
    }
  `;
  document.head.appendChild(style);
}

export default AdminAudit;
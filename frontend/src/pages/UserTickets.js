import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  FaPlus, FaEye, FaSearch, FaFilter, FaChevronLeft, FaChevronRight,
  FaClock, FaCheckCircle, FaTimesCircle, FaTicketAlt, FaLock
} from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function UserTickets() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [closingTicketId, setClosingTicketId] = useState(null);
  const itemsPerPage = 10;
  const API_URL = '/api/tickets'

  useEffect(() => { fetchTickets(); }, []);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/tickets/`, { headers: { Authorization: `Bearer ${token}` } });
      let ticketsData = [];
      if (response.data && response.data.results) ticketsData = response.data.results;
      else if (Array.isArray(response.data)) ticketsData = response.data;
      setTickets(ticketsData);
      setLoading(false);
    } catch (error) {
      toast.error('خطا در دریافت تیکت‌ها');
      setTickets([]);
      setLoading(false);
    }
  };

  const handleCloseTicket = async (ticketId) => {
    if (!window.confirm('آیا از بستن این تیکت مطمئن هستید؟')) return;
    setClosingTicketId(ticketId);
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${API_URL}/tickets/${ticketId}/close/`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('تیکت با موفقیت بسته شد');
      await fetchTickets();
    } catch (error) {
      toast.error(error.response?.data?.error || 'خطا در بستن تیکت');
    } finally {
      setClosingTicketId(null);
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      open: { label: 'باز', color: '#10B981', bg: 'rgba(16,185,129,0.1)', icon: FaCheckCircle },
      in_progress: { label: 'در حال بررسی', color: '#7C3AED', bg: 'rgba(124,58,237,0.1)', icon: FaClock },
      waiting: { label: 'در انتظار پاسخ', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', icon: FaClock },
      resolved: { label: 'برطرف شده', color: '#10B981', bg: 'rgba(16,185,129,0.1)', icon: FaCheckCircle },
      closed: { label: 'بسته شده', color: '#8a8a9a', bg: 'rgba(138,138,154,0.1)', icon: FaTimesCircle },
    };
    return configs[status] || configs.open;
  };

  const getPriorityBadge = (priority) => {
    const configs = {
      low: { label: 'کم', color: '#8a8a9a' },
      medium: { label: 'متوسط', color: '#7C3AED' },
      high: { label: 'بالا', color: '#F59E0B' },
      urgent: { label: 'فوری', color: '#EF4444' },
    };
    return configs[priority] || configs.medium;
  };

  const filteredTickets = tickets.filter(t => {
    const matchSearch = t.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const currentItems = filteredTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>در حال بارگذاری...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div style={styles.pageContainer}>
        <div style={styles.content}>
          <div style={styles.container}>

            {/* ===== Header ===== */}
            <div style={styles.header} className="tickets-header">
              <div style={styles.headerTextWrap}>
                <h1 style={styles.pageTitle} className="tickets-title">تیکت‌های من</h1>
                <p style={styles.pageSubtitle}>مدیریت تیکت‌های پشتیبانی</p>
              </div>
              <button
                onClick={() => navigate('/tickets/create')}
                style={styles.addBtn}
                className="tickets-add-btn"
              >
                <FaPlus /> تیکت جدید
              </button>
            </div>

            {/* ===== Stats ===== */}
            <div style={styles.statsGrid} className="tickets-stats-grid">
              {[
                { label: 'کل تیکت‌ها', value: tickets.length, color: '#7C3AED', bg: 'rgba(124,58,237,0.08)' },
                { label: 'در انتظار', value: tickets.filter(t => ['open', 'in_progress', 'waiting'].includes(t.status)).length, color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
                { label: 'بسته شده', value: tickets.filter(t => t.status === 'closed').length, color: '#8a8a9a', bg: 'rgba(138,138,154,0.08)' },
                { label: 'برطرف شده', value: tickets.filter(t => t.status === 'resolved').length, color: '#10B981', bg: 'rgba(16,185,129,0.08)' },
              ].map((stat, i) => (
                <div key={i} style={styles.statCard} className="tickets-stat-card">
                  <span style={{...styles.statNumber, color: stat.color}}>{stat.value}</span>
                  <span style={styles.statLabel}>{stat.label}</span>
                </div>
              ))}
            </div>

            {/* ===== Filters ===== */}
            <div style={styles.filters} className="tickets-filters">
              <div style={styles.searchWrapper}>
                <FaSearch style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="جستجوی تیکت..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchInput}
                  className="tickets-search"
                />
              </div>
              <div style={styles.filterWrapper}>
                <FaFilter style={styles.filterIcon} />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={styles.filterSelect}
                >
                  <option value="all">همه</option>
                  <option value="open">باز</option>
                  <option value="in_progress">در حال بررسی</option>
                  <option value="waiting">در انتظار پاسخ</option>
                  <option value="resolved">برطرف شده</option>
                  <option value="closed">بسته شده</option>
                </select>
              </div>
            </div>

            {/* ===== Table ===== */}
            <div style={styles.tableWrapper}>
              {currentItems.length === 0 ? (
                <div style={styles.empty}>
                  <div style={styles.emptyIconWrapper}><FaTicketAlt style={styles.emptyIcon} /></div>
                  <h3 style={styles.emptyTitle}>هیچ تیکتی وجود ندارد</h3>
                  <p style={styles.emptyDesc}>برای ایجاد تیکت جدید روی دکمه «تیکت جدید» کلیک کنید</p>
                </div>
              ) : (
                <>
                  <div style={styles.tableScroll}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          {['#', 'عنوان', 'وضعیت', 'اولویت', 'پاسخ‌ها', 'تاریخ', 'عملیات'].map(h => (
                            <th key={h} style={styles.th}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.map((ticket) => {
                          const status = getStatusBadge(ticket.status);
                          const priority = getPriorityBadge(ticket.priority);
                          const StatusIcon = status.icon;
                          const isClosed = ticket.status === 'closed';
                          return (
                            <tr key={ticket.id} style={{...styles.tr, opacity: isClosed ? 0.7 : 1}} className="tickets-tr">
                              <td style={styles.td}>#{ticket.id}</td>
                              <td style={styles.td}><span style={styles.ticketTitle}>{ticket.title}</span></td>
                              <td style={styles.td}>
                                <span style={{...styles.statusBadge, background: status.bg, color: status.color}}>
                                  <StatusIcon style={styles.statusIcon} /> {status.label}
                                </span>
                              </td>
                              <td style={styles.td}>
                                <span style={{...styles.priorityBadge, color: priority.color, background: `${priority.color}15`}}>
                                  {priority.label}
                                </span>
                              </td>
                              <td style={styles.td}>{ticket.replies_count || 0}</td>
                              <td style={styles.td}>{new Date(ticket.created_at).toLocaleDateString('fa-IR')}</td>
                              <td style={styles.td}>
                                <div style={styles.actions}>
                                  <Link
                                    to={`/tickets/${ticket.id}`}
                                    style={styles.actionBtn}
                                    className="tickets-action-btn"
                                  >
                                    <FaEye />
                                  </Link>
                                  {!isClosed && (
                                    <button
                                      onClick={() => handleCloseTicket(ticket.id)}
                                      style={{...styles.actionBtn, ...styles.actionBtnDanger}}
                                      className="tickets-action-btn tickets-action-btn-danger"
                                      disabled={closingTicketId === ticket.id}
                                    >
                                      {closingTicketId === ticket.id ? <div style={styles.smallSpinner}></div> : <FaLock />}
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {totalPages > 1 && (
                    <div style={styles.pagination}>
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        style={styles.pageBtn}
                        className="tickets-page-btn"
                      >
                        <FaChevronRight />
                      </button>
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let page = currentPage;
                        if (totalPages > 5) {
                          if (currentPage <= 3) page = i + 1;
                          else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                          else page = currentPage - 2 + i;
                        } else page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            style={{...styles.pageBtn, ...(currentPage === page ? styles.pageActive : {})}}
                            className={currentPage === page ? 'tickets-page-btn tickets-page-active' : 'tickets-page-btn'}
                          >
                            {page}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        style={styles.pageBtn}
                        className="tickets-page-btn"
                      >
                        <FaChevronLeft />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

// ============================================
// STYLES (هماهنگ با تم سایت)
// ============================================
const styles = {
  pageContainer: { minHeight: '100vh', background: '#FFFFFF', fontFamily: 'Vazirmatn, sans-serif' },
  content: { padding: '100px 0 60px' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '0 24px' },

  loading: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px', background: '#FFFFFF' },
  spinner: { width: '40px', height: '40px', border: '2px solid rgba(124,58,237,0.1)', borderTop: '2px solid #7C3AED', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  smallSpinner: { width: '14px', height: '14px', border: '2px solid rgba(239,68,68,0.2)', borderTop: '2px solid #EF4444', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  loadingText: { color: 'rgba(26,26,46,0.4)', fontSize: '14px' },

  // ===== Header =====
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' },
  headerTextWrap: { display: 'flex', flexDirection: 'column' },
  pageTitle: { fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: '800', color: '#1A1A2E', letterSpacing: '-0.5px', margin: 0 },
  pageSubtitle: { fontSize: '14px', color: 'rgba(26,26,46,0.5)', marginTop: '4px' },

  // ✅ دکمه تیکت جدید - تیره
  addBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '14px 28px',
    background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
    color: 'white', border: '1px solid rgba(168,85,247,0.2)',
    borderRadius: '14px', fontWeight: '700', fontSize: '14px',
    cursor: 'pointer', fontFamily: 'Vazirmatn, sans-serif',
    boxShadow: '0 4px 16px rgba(45,21,64,0.35)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },

  // ===== Stats =====
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px', marginBottom: '24px' },
  statCard: {
    padding: '22px 20px', background: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid rgba(124,58,237,0.08)',
    display: 'flex', flexDirection: 'column',
    boxShadow: '0 4px 16px rgba(124,58,237,0.06)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
  },
  statNumber: { fontSize: '28px', fontWeight: '800', lineHeight: 1 },
  statLabel: { fontSize: '13px', color: 'rgba(26,26,46,0.5)', marginTop: '6px', fontWeight: '600' },

  // ===== Filters =====
  filters: { display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' },
  searchWrapper: { position: 'relative', flex: 1, minWidth: '220px' },
  searchIcon: { position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(26,26,46,0.3)', fontSize: '16px', pointerEvents: 'none' },
  searchInput: {
    width: '100%', padding: '14px 48px 14px 16px',
    background: '#FFFFFF',
    border: '1.5px solid rgba(124,58,237,0.1)',
    borderRadius: '14px', fontSize: '14px', color: '#1A1A2E',
    fontFamily: 'Vazirmatn, sans-serif', outline: 'none',
    transition: 'border-color 0.3s ease, background 0.3s ease',
  },
  filterWrapper: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '14px 18px', background: '#FFFFFF',
    border: '1.5px solid rgba(124,58,237,0.1)',
    borderRadius: '14px', transition: 'border-color 0.3s ease',
  },
  filterIcon: { color: 'rgba(26,26,46,0.4)', fontSize: '14px' },
  filterSelect: {
    background: 'transparent', border: 'none', fontSize: '14px',
    color: '#1A1A2E', fontFamily: 'Vazirmatn, sans-serif',
    cursor: 'pointer', outline: 'none', fontWeight: '600',
  },

  // ===== Table =====
  tableWrapper: {
    background: '#FFFFFF', borderRadius: '20px',
    border: '1px solid rgba(124,58,237,0.08)',
    overflow: 'hidden',
    boxShadow: '0 4px 24px rgba(124,58,237,0.06)',
  },
  tableScroll: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '750px' },
  th: {
    padding: '16px 18px', textAlign: 'right',
    fontSize: '12px', fontWeight: '700',
    color: 'rgba(26,26,46,0.5)',
    borderBottom: '1px solid rgba(124,58,237,0.08)',
    background: '#FAFAFC', textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  tr: {
    borderBottom: '1px solid rgba(124,58,237,0.06)',
    transition: 'background 0.2s ease',
  },
  td: { padding: '16px 18px', fontSize: '13px', color: '#1A1A2E', verticalAlign: 'middle' },
  ticketTitle: { fontWeight: '700' },
  statusBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '6px 14px', borderRadius: '50px',
    fontSize: '12px', fontWeight: '700',
  },
  statusIcon: { fontSize: '11px' },
  priorityBadge: {
    display: 'inline-block', padding: '4px 14px',
    borderRadius: '50px', fontSize: '11px', fontWeight: '700',
  },
  actions: { display: 'flex', gap: '8px', alignItems: 'center' },

  // ✅ دکمه‌های عملیات - hover تیره
  actionBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '36px', height: '36px', borderRadius: '10px',
    background: '#F5F3FF', border: '1px solid rgba(124,58,237,0.1)',
    color: '#7C3AED', cursor: 'pointer', textDecoration: 'none',
    fontSize: '13px', fontFamily: 'Vazirmatn, sans-serif',
    transition: 'background 0.3s ease, color 0.3s ease, border-color 0.3s ease, transform 0.3s ease',
  },
  actionBtnDanger: {
    background: 'rgba(239,68,68,0.06)',
    border: '1px solid rgba(239,68,68,0.15)',
    color: '#EF4444',
  },

  // ===== Pagination =====
  pagination: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    gap: '8px', padding: '20px',
    borderTop: '1px solid rgba(124,58,237,0.06)',
    flexWrap: 'wrap',
  },
  pageBtn: {
    width: '40px', height: '40px', borderRadius: '10px',
    border: '1.5px solid rgba(124,58,237,0.15)',
    background: '#FFFFFF', color: '#1A1A2E',
    cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontFamily: 'Vazirmatn, sans-serif', fontSize: '13px',
    fontWeight: '700',
    transition: 'background 0.3s ease, color 0.3s ease, border-color 0.3s ease, transform 0.3s ease',
  },
  pageActive: {
    background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
    color: 'white',
    border: '1px solid rgba(168,85,247,0.3)',
    boxShadow: '0 4px 16px rgba(45,21,64,0.35)',
  },

  // ===== Empty =====
  empty: { textAlign: 'center', padding: '80px 24px' },
  emptyIconWrapper: {
    width: '88px', height: '88px', borderRadius: '50%',
    background: 'rgba(124,58,237,0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 20px',
  },
  emptyIcon: { fontSize: '36px', color: '#7C3AED' },
  emptyTitle: { fontSize: '18px', fontWeight: '800', color: '#1A1A2E', marginBottom: '8px' },
  emptyDesc: { fontSize: '14px', color: 'rgba(26,26,46,0.5)' },
};

// ===== CSS Hover + Responsive =====
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

  /* ===== Add Button Hover ===== */
  .tickets-add-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(45,21,64,0.5) !important;
    border-color: rgba(168,85,247,0.5) !important;
    background: linear-gradient(135deg, #3D1E57 0%, #2D1540 100%) !important;
  }

  /* ===== Stat Card Hover ===== */
  .tickets-stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(124,58,237,0.12);
    border-color: rgba(168,85,247,0.2);
  }

  /* ===== Search Focus ===== */
  .tickets-search:focus {
    border-color: rgba(124,58,237,0.4) !important;
    background: #FFFFFF !important;
  }

  /* ===== Table Row Hover ===== */
  .tickets-tr:hover {
    background: #FAFAFC;
  }

  /* ===== Action Button Hover ===== */
  .tickets-action-btn:hover {
    background: linear-gradient(135deg, #2D1540 0%, #1A0828 100%) !important;
    color: #FFFFFF !important;
    border-color: rgba(168,85,247,0.5) !important;
    transform: translateY(-2px);
  }
  .tickets-action-btn-danger:hover {
    background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%) !important;
    color: #FFFFFF !important;
    border-color: transparent !important;
  }

  /* ===== Pagination Hover ===== */
  .tickets-page-btn:hover:not(.tickets-page-active) {
    background: #F5F3FF !important;
    color: #7C3AED !important;
    border-color: rgba(124,58,237,0.3) !important;
    transform: translateY(-2px);
  }
  .tickets-page-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  .tickets-page-btn.tickets-page-active:hover {
    background: linear-gradient(135deg, #3D1E57 0%, #2D1540 100%) !important;
  }

  /* ===== Responsive ===== */
  @media (max-width: 768px) {
    .tickets-header {
      flex-direction: column !important;
      align-items: stretch !important;
    }
    .tickets-add-btn {
      justify-content: center !important;
      width: 100% !important;
    }
    .tickets-stats-grid {
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 10px !important;
    }
    .tickets-stat-card { padding: 18px 16px !important; }
    .tickets-stat-card .stat-number { font-size: 22px !important; }
    .tickets-filters {
      flex-direction: column !important;
    }
  }

  @media (max-width: 480px) {
    .tickets-title { font-size: 22px !important; }
    .tickets-stats-grid {
      grid-template-columns: 1fr 1fr !important;
      gap: 8px !important;
    }
    .tickets-stat-card { padding: 14px 12px !important; }
    .tickets-stat-card .stat-number { font-size: 20px !important; }
    .tickets-stat-card .stat-label { font-size: 11px !important; }
  }
`;
document.head.appendChild(styleSheet);

export default UserTickets;
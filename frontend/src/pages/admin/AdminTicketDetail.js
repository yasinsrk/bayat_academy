// src/pages/admin/AdminTicketDetail.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FaChevronLeft, FaUser, FaTag, FaClock, FaCheck,
  FaCheckCircle, FaTimesCircle, FaReply, FaPaperPlane,
  FaExclamationCircle, FaHourglassHalf, FaLock, FaUnlock,
  FaFlag, FaInfoCircle, FaSpinner, FaComment, FaHistory,
  FaCopy, FaExternalLinkAlt, FaEnvelope, FaPhone,
  FaChevronDown, FaStar, FaArchive, FaArrowRight,
} from 'react-icons/fa';
import AdminLayout from './AdminLayout';
import Breadcrumbs from '../../components/Breadcrumbs';
import { toast } from 'react-toastify';
import axios from 'axios';
import theme from '../../styles/adminTheme';
import { formatJalaliDateTime, formatJalaliRelative, formatJalali } from '../../utils/jalali';

const API = '/api/tickets';

// ═══════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════

const STATUS_CONFIG = {
  open:        { label: 'باز',              color: '#059669', bg: '#ECFDF5', border: '#A7F3D0', icon: FaExclamationCircle },
  in_progress: { label: 'در حال بررسی',     color: '#4F46E5', bg: '#EEF2FF', border: '#C7D2FE', icon: FaClock },
  waiting:     { label: 'در انتظار پاسخ',   color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', icon: FaHourglassHalf },
  resolved:    { label: 'برطرف شده',        color: '#7C3AED', bg: '#EDE9FE', border: '#DDD6FE', icon: FaCheckCircle },
  closed:      { label: 'بسته شده',         color: '#64748B', bg: '#F1F5F9', border: '#CBD5E1', icon: FaLock },
};

const PRIORITY_CONFIG = {
  low:    { label: 'کم',    color: '#64748B', bg: '#F1F5F9', border: '#CBD5E1', bar: '#94A3B8' },
  medium: { label: 'متوسط', color: '#0284C7', bg: '#E0F2FE', border: '#BAE6FD', bar: '#0EA5E9' },
  high:   { label: 'بالا',  color: '#D97706', bg: '#FEF3C7', border: '#FDE68A', bar: '#F59E0B' },
  urgent: { label: 'فوری',  color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', bar: '#EF4444' },
};

const STATUS_FLOW = ['open', 'in_progress', 'waiting', 'resolved', 'closed'];

// ═══════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════

function AdminTicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const replyBoxRef = useRef(null);

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);
  const [changingPriority, setChangingPriority] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);

  useEffect(() => { fetchTicket(); /* eslint-disable-next-line */ }, [id]);

  const fetchTicket = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get(`${API}/tickets/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTicket(res.data);
    } catch (e) {
      console.error(e);
      toast.error('خطا در دریافت تیکت');
      if (e.response?.status === 404) navigate('/adminpanel/m1/admin/tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) { toast.warning('متن پاسخ را وارد کنید'); return; }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${API}/tickets/${id}/reply/`,
        { message: replyMessage.trim() },
        { headers: { Authorization: `Bearer ${token}` } });
      toast.success('پاسخ ارسال شد');
      setReplyMessage('');
      fetchTicket();
    } catch (err) {
      toast.error(err.response?.data?.error || 'خطا در ارسال پاسخ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeStatus = async (newStatus) => {
    if (newStatus === ticket.status) { setShowStatusMenu(false); return; }
    setChangingStatus(true);
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${API}/tickets/${id}/change_status/`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } });
      toast.success('وضعیت تغییر کرد');
      setShowStatusMenu(false);
      fetchTicket();
    } catch { toast.error('خطا'); }
    finally { setChangingStatus(false); }
  };

  const handleChangePriority = async (newPriority) => {
    if (newPriority === ticket.priority) { setShowPriorityMenu(false); return; }
    setChangingPriority(true);
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${API}/tickets/${id}/change_priority/`,
        { priority: newPriority },
        { headers: { Authorization: `Bearer ${token}` } });
      toast.success('اولویت تغییر کرد');
      setShowPriorityMenu(false);
      fetchTicket();
    } catch { toast.error('خطا'); }
    finally { setChangingPriority(false); }
  };

  const handleClose = async () => {
    if (!window.confirm('این تیکت بسته شود؟')) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${API}/tickets/${id}/close/`, {},
        { headers: { Authorization: `Bearer ${token}` } });
      toast.success('تیکت بسته شد');
      fetchTicket();
    } catch { toast.error('خطا'); }
  };

  const handleReopen = async () => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${API}/tickets/${id}/reopen/`, {},
        { headers: { Authorization: `Bearer ${token}` } });
      toast.success('تیکت بازگشایی شد');
      fetchTicket();
    } catch { toast.error('خطا'); }
  };

  const copyTicketId = () => {
    navigator.clipboard.writeText(`#${ticket.id}`);
    toast.success('شناسه کپی شد');
  };

  const scrollToReply = () => {
    replyBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  if (loading) {
    return (
      <AdminLayout>
        <DetailSkeleton />
      </AdminLayout>
    );
  }

  if (!ticket) return null;

  const status = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
  const priority = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.medium;
  const StatusIcon = status.icon;
  const isClosed = ticket.status === 'closed';

  return (
    <AdminLayout>
      <div style={S.container}>

        {/* ═══ BREADCRUMBS ═══ */}
        <Breadcrumbs items={[
          { label: 'تیکت‌ها', to: '/adminpanel/m1/admin/tickets' },
          { label: `#${ticket.id}` },
        ]} />

        {/* ═══ HERO HEADER ═══ */}
        <div style={S.hero}>
          <div style={{ ...S.heroBar, background: priority.bar }} />
          <div style={S.heroContent}>

            <div style={S.heroTop}>
              <div style={S.heroLeft}>
                <button
                  onClick={() => navigate('/adminpanel/m1/admin/tickets')}
                  style={S.backBtn}
                  className="tkd-back-btn"
                  title="بازگشت"
                >
                  <FaChevronLeft size={11} />
                </button>

                <div style={S.idBadge} onClick={copyTicketId} className="tkd-id-badge" title="کپی شناسه">
                  <span>#{ticket.id}</span>
                  <FaCopy size={9} />
                </div>

                <span style={{ ...S.heroStatus, color: status.color, background: status.bg, borderColor: status.border }}>
                  <StatusIcon size={10} />
                  {status.label}
                </span>
              </div>

              <div style={S.heroActions}>
                {!isClosed ? (
                  <button onClick={handleClose} style={S.btnGhost} className="tkd-btn-ghost">
                    <FaLock size={10} /> بستن تیکت
                  </button>
                ) : (
                  <button onClick={handleReopen} style={S.btnGhost} className="tkd-btn-ghost">
                    <FaUnlock size={10} /> بازگشایی
                  </button>
                )}
                {!isClosed && (
                  <button onClick={scrollToReply} style={S.btnPrimary} className="tkd-btn-primary">
                    <FaReply size={10} /> پاسخ دادن
                  </button>
                )}
              </div>
            </div>

            <h1 style={S.heroTitle}>{ticket.title}</h1>

            <div style={S.heroMeta}>
              <div style={S.heroMetaItem}>
                <div style={S.metaAvatar}>
                  {(ticket.user?.full_name || ticket.user?.username || '?')[0]}
                </div>
                <span style={S.metaName}>
                  {ticket.user?.full_name || ticket.user?.username || 'کاربر حذف شده'}
                </span>
              </div>

              {ticket.user?.email && (
                <div style={S.heroMetaItem}>
                  <FaEnvelope size={10} style={S.metaIcon} />
                  <span>{ticket.user.email}</span>
                </div>
              )}

              <div style={S.heroMetaItem}>
                <FaClock size={10} style={S.metaIcon} />
                <span title={formatJalaliDateTime(ticket.created_at)}>
                  {formatJalaliRelative(ticket.created_at)}
                </span>
              </div>

              {ticket.category_name && (
                <div style={S.heroMetaItem}>
                  <FaTag size={10} style={S.metaIcon} />
                  <span>{ticket.category_name}</span>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ═══ MAIN GRID ═══ */}
        <div style={S.grid} className="tkd-grid">

          {/* ═══ CONVERSATION COLUMN ═══ */}
          <div style={S.conversationCol}>

            {/* Original message */}
            <article style={S.messageCard} className="tkd-card">
              <header style={S.messageHeader}>
                <div style={S.userCell}>
                  <div style={S.userAvatar}>
                    {(ticket.user?.full_name || ticket.user?.username || '?')[0]}
                  </div>
                  <div style={S.userInfo}>
                    <div style={S.userName}>
                      {ticket.user?.full_name || ticket.user?.username || 'کاربر حذف شده'}
                    </div>
                    <div style={S.userRole}>کاربر</div>
                  </div>
                </div>
                <div style={S.messageTime}>
                  <span>{formatJalali(ticket.created_at)}</span>
                  <span style={S.timeDot}>·</span>
                  <span>{formatJalaliRelative(ticket.created_at)}</span>
                </div>
              </header>

              <div style={S.messageBody}>{ticket.message}</div>
            </article>

            {/* Replies */}
            {ticket.replies && ticket.replies.length > 0 && (
              <div style={S.repliesWrap}>
                <div style={S.repliesDivider}>
                  <span style={S.repliesDividerLine} />
                  <span style={S.repliesDividerLabel}>
                    <FaComment size={10} />
                    {ticket.replies.length.toLocaleString('fa-IR')} پاسخ
                  </span>
                  <span style={S.repliesDividerLine} />
                </div>

                {ticket.replies.map((reply) => {
                  const isAdmin = reply.is_admin;
                  return (
                    <article key={reply.id}
                      style={{ ...S.messageCard, ...(isAdmin ? S.messageCardAdmin : {}) }}
                      className="tkd-card">
                      <header style={S.messageHeader}>
                        <div style={S.userCell}>
                          <div style={{ ...S.userAvatar, ...(isAdmin ? S.userAvatarAdmin : {}) }}>
                            {(reply.user?.full_name || reply.user?.username || '?')[0]}
                          </div>
                          <div style={S.userInfo}>
                            <div style={S.userName}>
                              {reply.user?.full_name || reply.user?.username || 'کاربر حذف شده'}
                            </div>
                            <div style={{ ...S.userRole, color: isAdmin ? theme.colors.success : theme.colors.textFaint }}>
                              {isAdmin ? (
                                <><FaStar size={8} /> پشتیبان</>
                              ) : 'کاربر'}
                            </div>
                          </div>
                        </div>
                        <div style={S.messageTime}>
                          <span>{formatJalali(reply.created_at)}</span>
                          <span style={S.timeDot}>·</span>
                          <span>{formatJalaliRelative(reply.created_at)}</span>
                        </div>
                      </header>

                      <div style={S.messageBody}>{reply.message}</div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* Reply form */}
            <div ref={replyBoxRef}>
              {!isClosed ? (
                <form onSubmit={handleReply} style={S.replyForm}>
                  <div style={S.replyFormHeader}>
                    <div style={S.replyFormTitle}>
                      <FaPaperPlane size={11} />
                      پاسخ شما
                    </div>
                    <div style={S.replyFormHint}>
                      کاربر پاسخ شما را در اعلان‌ها دریافت می‌کند
                    </div>
                  </div>

                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="پاسخ خود را بنویسید..."
                    style={S.replyTextarea}
                    rows="6"
                    disabled={submitting}
                    className="tkd-reply-textarea"
                  />

                  <div style={S.replyFormFooter}>
                    <span style={S.replyCount}>
                      {replyMessage.length.toLocaleString('fa-IR')} / ۵۰۰۰ کاراکتر
                    </span>
                    <div style={S.replyButtons}>
                      <button
                        type="button"
                        onClick={() => setReplyMessage('')}
                        style={S.replyCancel}
                        className="tkd-reply-cancel"
                        disabled={!replyMessage || submitting}
                      >
                        پاک کردن
                      </button>
                      <button
                        type="submit"
                        style={S.replySubmit}
                        className="tkd-reply-submit"
                        disabled={submitting || !replyMessage.trim()}
                      >
                        {submitting ? (
                          <><FaSpinner size={11} className="tkd-spin" /> در حال ارسال...</>
                        ) : (
                          <><FaPaperPlane size={11} /> ارسال پاسخ</>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div style={S.closedBanner}>
                  <div style={S.closedIcon}>
                    <FaLock size={16} />
                  </div>
                  <div style={S.closedBody}>
                    <div style={S.closedTitle}>این تیکت بسته شده است</div>
                    <div style={S.closedDesc}>
                      برای پاسخ دادن، ابتدا تیکت را بازگشایی کنید.
                    </div>
                  </div>
                  <button onClick={handleReopen} style={S.closedBtn} className="tkd-closed-btn">
                    <FaUnlock size={10} /> بازگشایی
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* ═══ SIDEBAR COLUMN ═══ */}
          <aside style={S.sidebarCol}>

            {/* ── Status card ── */}
            <div style={S.sideCard}>
              <div style={S.sideCardHeader}>
                <div style={S.sideCardTitle}>
                  <FaInfoCircle size={10} />
                  وضعیت تیکت
                </div>
              </div>

              <button
                onClick={() => setShowStatusMenu((v) => !v)}
                style={{ ...S.selectorBtn, borderColor: status.border, background: status.bg }}
                className="tkd-selector-btn"
              >
                <span style={{ color: status.color, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <StatusIcon size={12} />
                  {status.label}
                </span>
                <FaChevronDown size={9} style={{ color: status.color }} />
              </button>

              {showStatusMenu && (
                <div style={S.dropdown}>
                  {STATUS_FLOW.map((s) => {
                    const cfg = STATUS_CONFIG[s];
                    const Icon = cfg.icon;
                    const isActive = ticket.status === s;
                    return (
                      <button
                        key={s}
                        onClick={() => handleChangeStatus(s)}
                        disabled={changingStatus || isActive}
                        style={{
                          ...S.dropdownItem,
                          ...(isActive ? { background: cfg.bg, color: cfg.color } : {}),
                        }}
                        className="tkd-dropdown-item"
                      >
                        <Icon size={10} />
                        <span>{cfg.label}</span>
                        {isActive && <FaCheck size={9} style={{ marginRight: 'auto' }} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Priority card ── */}
            <div style={S.sideCard}>
              <div style={S.sideCardHeader}>
                <div style={S.sideCardTitle}>
                  <FaFlag size={10} />
                  اولویت
                </div>
              </div>

              <button
                onClick={() => setShowPriorityMenu((v) => !v)}
                style={{ ...S.selectorBtn, borderColor: priority.border, background: priority.bg }}
                className="tkd-selector-btn"
              >
                <span style={{ color: priority.color, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: priority.bar }} />
                  {priority.label}
                </span>
                <FaChevronDown size={9} style={{ color: priority.color }} />
              </button>

              {showPriorityMenu && (
                <div style={S.dropdown}>
                  {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => {
                    const isActive = ticket.priority === key;
                    return (
                      <button
                        key={key}
                        onClick={() => handleChangePriority(key)}
                        disabled={changingPriority || isActive}
                        style={{
                          ...S.dropdownItem,
                          ...(isActive ? { background: cfg.bg, color: cfg.color } : {}),
                        }}
                        className="tkd-dropdown-item"
                      >
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.bar }} />
                        <span>{cfg.label}</span>
                        {isActive && <FaCheck size={9} style={{ marginRight: 'auto' }} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── User card ── */}
            <div style={S.sideCard}>
              <div style={S.sideCardHeader}>
                <div style={S.sideCardTitle}>
                  <FaUser size={10} />
                  فرستنده
                </div>
              </div>

              <div style={S.profileRow}>
                <div style={S.profileAvatar}>
                  {(ticket.user?.full_name || ticket.user?.username || '?')[0]}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={S.profileName}>
                    {ticket.user?.full_name || ticket.user?.username || 'کاربر حذف شده'}
                  </div>
                  <div style={S.profileHandle}>
                    @{ticket.user?.username || 'unknown'}
                  </div>
                </div>
              </div>

              <div style={S.profileDetails}>
                {ticket.user?.email && (
                  <div style={S.profileDetail}>
                    <FaEnvelope size={10} style={S.detailIcon} />
                    <span style={S.detailText}>{ticket.user.email}</span>
                  </div>
                )}
                {ticket.user?.phone && (
                  <div style={S.profileDetail}>
                    <FaPhone size={10} style={S.detailIcon} />
                    <span style={S.detailText}>{ticket.user.phone}</span>
                  </div>
                )}
              </div>

              {ticket.user?.id && (
                <Link
                  to={`/adminpanel/m1/admin/users?id=${ticket.user.id}`}
                  style={S.profileLink}
                  className="tkd-profile-link"
                >
                  <span>مشاهده پروفایل کامل</span>
                  <FaExternalLinkAlt size={9} />
                </Link>
              )}
            </div>

            {/* ── Timeline card ── */}
            <div style={S.sideCard}>
              <div style={S.sideCardHeader}>
                <div style={S.sideCardTitle}>
                  <FaHistory size={10} />
                  رویدادها
                </div>
              </div>

              <div style={S.timeline}>
                <TimelineItem
                  icon={FaInfoCircle}
                  label="ایجاد تیکت"
                  date={ticket.created_at}
                  color={theme.colors.accent}
                  isLast={!ticket.replies_count && !ticket.resolved_at && !ticket.closed_at}
                />
                {ticket.replies_count > 0 && (
                  <TimelineItem
                    icon={FaReply}
                    label={`${ticket.replies_count} پاسخ`}
                    date={ticket.replies?.[ticket.replies.length - 1]?.created_at}
                    color={theme.colors.tintSky}
                    isLast={!ticket.resolved_at && !ticket.closed_at}
                  />
                )}
                {ticket.resolved_at && (
                  <TimelineItem
                    icon={FaCheckCircle}
                    label="برطرف شده"
                    date={ticket.resolved_at}
                    color={theme.colors.success}
                    isLast={!ticket.closed_at}
                  />
                )}
                {ticket.closed_at && (
                  <TimelineItem
                    icon={FaLock}
                    label="بسته شده"
                    date={ticket.closed_at}
                    color={theme.colors.textMuted}
                    isLast={true}
                  />
                )}
              </div>
            </div>

          </aside>

        </div>
      </div>
    </AdminLayout>
  );
}

// ═══════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════

function TimelineItem({ icon: Icon, label, date, color, isLast }) {
  return (
    <div style={S.timelineItem}>
      <div style={S.timelineTrack}>
        <div style={{
          ...S.timelineDot,
          background: color + '15',
          border: `2px solid ${color}`,
          boxShadow: `0 0 0 3px ${color}10`,
        }}>
          <Icon size={7} color={color} />
        </div>
        {!isLast && <div style={S.timelineLine} />}
      </div>
      <div style={S.timelineBody}>
        <div style={S.timelineLabel}>{label}</div>
        {date && <div style={S.timelineDate}>{formatJalaliDateTime(date)}</div>}
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div style={{ maxWidth: 1360, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ ...S.skelBar, width: 200, height: 14 }} />
      <div style={{ ...S.skelBar, width: '100%', height: 140, borderRadius: 16 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }}>
        <div>
          <div style={{ ...S.skelBar, width: '100%', height: 180, borderRadius: 14 }} />
          <div style={{ ...S.skelBar, width: '100%', height: 220, borderRadius: 14, marginTop: 12 }} />
        </div>
        <div>
          <div style={{ ...S.skelBar, width: '100%', height: 100, borderRadius: 14 }} />
          <div style={{ ...S.skelBar, width: '100%', height: 100, borderRadius: 14, marginTop: 12 }} />
          <div style={{ ...S.skelBar, width: '100%', height: 180, borderRadius: 14, marginTop: 12 }} />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════

const S = {
  container: {
    maxWidth: 1360, margin: '0 auto',
    display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0,
  },

  // ═══ HERO ═══
  hero: {
    position: 'relative',
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 18,
    overflow: 'hidden',
    boxShadow: theme.shadow.sm,
  },
  heroBar: {
    position: 'absolute',
    top: 0, right: 0, left: 0,
    height: 4,
  },
  heroContent: {
    padding: '24px 28px 22px',
  },
  heroTop: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', gap: 16, marginBottom: 14, flexWrap: 'wrap',
  },
  heroLeft: {
    display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
  },
  backBtn: {
    width: 36, height: 36,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    background: theme.colors.surfaceAlt,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 10,
    color: theme.colors.textMuted,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  idBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '5px 12px',
    background: theme.colors.surfaceAlt,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 8,
    fontSize: 12, fontWeight: 700,
    color: theme.colors.textMuted,
    cursor: 'pointer',
    fontVariantNumeric: 'tabular-nums',
    transition: 'all 0.15s',
  },
  heroStatus: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '5px 12px',
    borderRadius: 999,
    fontSize: 11.5, fontWeight: 700,
    border: '1px solid',
  },
  heroActions: {
    display: 'flex', gap: 8, flexWrap: 'wrap',
  },
  btnGhost: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '9px 16px',
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 10,
    fontSize: 12.5, fontWeight: 600,
    color: theme.colors.textMuted,
    fontFamily: theme.font.family,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s',
  },
  btnPrimary: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '9px 16px',
    background: `linear-gradient(135deg, ${theme.colors.accent} 0%, #7C5CE7 100%)`,
    border: 'none',
    borderRadius: 10,
    fontSize: 12.5, fontWeight: 700,
    color: '#FFFFFF',
    fontFamily: theme.font.family,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    boxShadow: `0 4px 14px ${theme.colors.accentGlow}`,
    transition: 'all 0.15s',
  },
  heroTitle: {
    fontSize: 24, fontWeight: 800,
    color: theme.colors.text,
    margin: '0 0 14px',
    letterSpacing: '-0.5px',
    lineHeight: 1.35,
    wordBreak: 'break-word',
  },
  heroMeta: {
    display: 'flex', alignItems: 'center', gap: 18,
    flexWrap: 'wrap',
  },
  heroMetaItem: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    fontSize: 12.5, color: theme.colors.textSubtle,
    fontWeight: 500,
  },
  metaAvatar: {
    width: 22, height: 22, borderRadius: '50%',
    background: `linear-gradient(135deg, ${theme.colors.accent} 0%, #7C5CE7 100%)`,
    color: '#FFFFFF',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 10, fontWeight: 700,
    flexShrink: 0,
  },
  metaName: {
    color: theme.colors.text, fontWeight: 600,
  },
  metaIcon: { color: theme.colors.textFaint },

  // ═══ GRID ═══
  grid: {
    display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16,
  },
  conversationCol: {
    display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0,
  },
  sidebarCol: {
    display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0,
    position: 'sticky', top: 88, alignSelf: 'start',
  },

  // ═══ MESSAGES ═══
  messageCard: {
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 14,
    padding: 20,
    boxShadow: theme.shadow.xs,
    transition: 'box-shadow 0.18s',
  },
  messageCardAdmin: {
    borderColor: theme.colors.accentBorder,
    background: `linear-gradient(180deg, ${theme.colors.accentSoft}30 0%, ${theme.colors.surface} 100%)`,
  },
  messageHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', gap: 12, marginBottom: 14,
    paddingBottom: 14,
    borderBottom: `1px solid ${theme.colors.borderSoft}`,
  },
  userCell: {
    display: 'flex', alignItems: 'center', gap: 10, minWidth: 0,
  },
  userAvatar: {
    width: 38, height: 38, borderRadius: '50%',
    background: `linear-gradient(135deg, ${theme.colors.accent} 0%, #7C5CE7 100%)`,
    color: '#FFFFFF',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 14, fontWeight: 700,
    flexShrink: 0,
    boxShadow: `0 3px 10px ${theme.colors.accentGlow}`,
  },
  userAvatarAdmin: {
    background: `linear-gradient(135deg, ${theme.colors.success} 0%, #059669 100%)`,
    boxShadow: `0 3px 10px rgba(5,150,105,0.25)`,
  },
  userInfo: { minWidth: 0 },
  userName: {
    fontSize: 13.5, fontWeight: 700,
    color: theme.colors.text,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  userRole: {
    fontSize: 11, color: theme.colors.textFaint,
    marginTop: 2, fontWeight: 500,
    display: 'inline-flex', alignItems: 'center', gap: 4,
  },
  messageTime: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    fontSize: 11, color: theme.colors.textFaint,
    fontWeight: 500, flexShrink: 0, whiteSpace: 'nowrap',
  },
  timeDot: { color: theme.colors.border },
  messageBody: {
    fontSize: 13.5, color: theme.colors.text,
    lineHeight: 1.9, whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },

  // ═══ REPLIES DIVIDER ═══
  repliesWrap: {
    display: 'flex', flexDirection: 'column', gap: 12,
  },
  repliesDivider: {
    display: 'flex', alignItems: 'center', gap: 12,
    marginTop: 4,
  },
  repliesDividerLine: {
    flex: 1, height: 1, background: theme.colors.border,
  },
  repliesDividerLabel: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    fontSize: 11, fontWeight: 700,
    color: theme.colors.textFaint,
    textTransform: 'uppercase', letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
  },

  // ═══ REPLY FORM ═══
  replyForm: {
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 14,
    padding: 20,
    boxShadow: theme.shadow.sm,
    display: 'flex', flexDirection: 'column', gap: 14,
  },
  replyFormHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', gap: 12, flexWrap: 'wrap',
  },
  replyFormTitle: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    fontSize: 13, fontWeight: 700,
    color: theme.colors.text,
  },
  replyFormHint: {
    fontSize: 11.5, color: theme.colors.textFaint,
  },
  replyTextarea: {
    padding: '14px 16px',
    background: theme.colors.surfaceAlt,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 12,
    fontSize: 13.5,
    color: theme.colors.text,
    fontFamily: theme.font.family,
    outline: 'none',
    resize: 'vertical',
    lineHeight: 1.8,
    transition: 'border-color 0.15s, box-shadow 0.15s',
  },
  replyFormFooter: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', gap: 12, flexWrap: 'wrap',
  },
  replyCount: {
    fontSize: 11, color: theme.colors.textFaint,
    fontVariantNumeric: 'tabular-nums',
  },
  replyButtons: {
    display: 'flex', gap: 8,
  },
  replyCancel: {
    padding: '9px 16px',
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 10,
    fontSize: 12.5, fontWeight: 600,
    color: theme.colors.textMuted,
    fontFamily: theme.font.family,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  replySubmit: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '9px 20px',
    background: `linear-gradient(135deg, ${theme.colors.accent} 0%, #7C5CE7 100%)`,
    border: 'none',
    borderRadius: 10,
    fontSize: 12.5, fontWeight: 700,
    color: '#FFFFFF',
    fontFamily: theme.font.family,
    cursor: 'pointer',
    boxShadow: `0 4px 14px ${theme.colors.accentGlow}`,
    transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  },

  // ═══ CLOSED BANNER ═══
  closedBanner: {
    display: 'flex', alignItems: 'center', gap: 16,
    padding: 20,
    background: theme.colors.surfaceAlt,
    border: `1px dashed ${theme.colors.border}`,
    borderRadius: 14,
  },
  closedIcon: {
    width: 44, height: 44, borderRadius: 12,
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: theme.colors.textMuted,
    flexShrink: 0,
  },
  closedBody: { flex: 1, minWidth: 0 },
  closedTitle: {
    fontSize: 13.5, fontWeight: 700, color: theme.colors.text,
  },
  closedDesc: {
    fontSize: 12, color: theme.colors.textSubtle, marginTop: 4,
  },
  closedBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '8px 14px',
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 9,
    fontSize: 12, fontWeight: 600,
    color: theme.colors.textMuted,
    fontFamily: theme.font.family,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s',
  },

  // ═══ SIDEBAR CARDS ═══
  sideCard: {
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 14,
    padding: 16,
    boxShadow: theme.shadow.xs,
  },
  sideCardHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', gap: 8, marginBottom: 12,
  },
  sideCardTitle: {
    display: 'inline-flex', alignItems: 'center', gap: 7,
    fontSize: 10.5, fontWeight: 700,
    color: theme.colors.textFaint,
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
  },
  selectorBtn: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', gap: 10, width: '100%',
    padding: '11px 14px',
    border: '1px solid',
    borderRadius: 10,
    fontSize: 12.5, fontWeight: 700,
    fontFamily: theme.font.family,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  dropdown: {
    marginTop: 8,
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 10,
    padding: 5,
    boxShadow: theme.shadow.md,
    animation: 'tkd-fade-in 0.12s ease-out',
  },
  dropdownItem: {
    display: 'flex', alignItems: 'center', gap: 10,
    width: '100%',
    padding: '9px 11px',
    background: 'transparent',
    border: 'none',
    borderRadius: 7,
    fontSize: 12.5, fontWeight: 600,
    color: theme.colors.textMuted,
    fontFamily: theme.font.family,
    cursor: 'pointer',
    textAlign: 'right',
    transition: 'all 0.12s',
  },

  // ═══ PROFILE ═══
  profileRow: {
    display: 'flex', alignItems: 'center', gap: 12,
    marginBottom: 12,
  },
  profileAvatar: {
    width: 44, height: 44, borderRadius: '50%',
    background: `linear-gradient(135deg, ${theme.colors.accent} 0%, #7C5CE7 100%)`,
    color: '#FFFFFF',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 17, fontWeight: 700,
    flexShrink: 0,
    boxShadow: `0 4px 14px ${theme.colors.accentGlow}`,
  },
  profileName: {
    fontSize: 13.5, fontWeight: 700,
    color: theme.colors.text,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  profileHandle: {
    fontSize: 11.5, color: theme.colors.textFaint, marginTop: 2,
    fontFamily: 'monospace',
  },
  profileDetails: {
    display: 'flex', flexDirection: 'column', gap: 8,
    paddingTop: 12,
    borderTop: `1px solid ${theme.colors.borderSoft}`,
  },
  profileDetail: {
    display: 'flex', alignItems: 'center', gap: 8,
    fontSize: 12, color: theme.colors.textMuted,
    minWidth: 0,
  },
  detailIcon: { color: theme.colors.textFaint, flexShrink: 0 },
  detailText: {
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    direction: 'ltr', textAlign: 'right',
  },
  profileLink: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    marginTop: 12, fontSize: 11.5, fontWeight: 600,
    color: theme.colors.accent,
    textDecoration: 'none',
    transition: 'all 0.15s',
  },

  // ═══ TIMELINE ═══
  timeline: {
    display: 'flex', flexDirection: 'column',
  },
  timelineItem: {
    display: 'flex', gap: 12, position: 'relative',
  },
  timelineTrack: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    flexShrink: 0,
  },
  timelineDot: {
    width: 24, height: 24, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
    position: 'relative', zIndex: 1,
  },
  timelineLine: {
    width: 2, flex: 1, minHeight: 20,
    background: theme.colors.border,
    marginTop: 2,
  },
  timelineBody: {
    flex: 1, minWidth: 0, paddingBottom: 14,
    paddingTop: 2,
  },
  timelineLabel: {
    fontSize: 12.5, fontWeight: 600,
    color: theme.colors.text,
  },
  timelineDate: {
    fontSize: 10.5, color: theme.colors.textFaint, marginTop: 3,
  },

  // ═══ SKELETON ═══
  skelBar: {
    background: 'linear-gradient(90deg, #EEF0F4 0%, #F7F8FA 50%, #EEF0F4 100%)',
    backgroundSize: '200% 100%',
    borderRadius: 6,
    animation: 'tkd-skel 1.4s ease-in-out infinite',
  },
};

// ═══════════════════════════════════════════════════════
// STYLES INJECTION
// ═══════════════════════════════════════════════════════

if (typeof document !== 'undefined' && !document.getElementById('admin-ticket-detail-styles')) {
  const style = document.createElement('style');
  style.id = 'admin-ticket-detail-styles';
  style.textContent = `
    @keyframes tkd-skel {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    @keyframes tkd-spin-anim { to { transform: rotate(360deg); } }
    @keyframes tkd-fade-in {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .tkd-spin { animation: tkd-spin-anim 1s linear infinite; }

    .tkd-card { transition: box-shadow 0.18s ease !important; }
    .tkd-card:hover {
      box-shadow: 0 8px 24px -6px rgba(15,23,42,0.08), 0 2px 6px -2px rgba(15,23,42,0.04) !important;
    }
    .tkd-back-btn:hover {
      background: ${theme.colors.surface} !important;
      color: ${theme.colors.text} !important;
      border-color: ${theme.colors.borderStrong} !important;
    }
    .tkd-id-badge:hover {
      background: ${theme.colors.accentSoft} !important;
      color: ${theme.colors.accent} !important;
      border-color: ${theme.colors.accentBorder} !important;
    }
    .tkd-btn-ghost:hover {
      background: ${theme.colors.surfaceAlt} !important;
      color: ${theme.colors.text} !important;
    }
    .tkd-btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 22px ${theme.colors.accentGlow} !important;
    }
    .tkd-reply-submit:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 8px 22px ${theme.colors.accentGlow} !important;
    }
    .tkd-reply-submit:disabled { opacity: 0.4; cursor: not-allowed; }
    .tkd-reply-cancel:hover:not(:disabled) {
      background: ${theme.colors.surfaceAlt} !important;
      color: ${theme.colors.text} !important;
    }
    .tkd-reply-cancel:disabled { opacity: 0.4; cursor: not-allowed; }
    .tkd-reply-textarea:focus {
      border-color: ${theme.colors.accent} !important;
      background: ${theme.colors.surface} !important;
      box-shadow: 0 0 0 3px ${theme.colors.accent}15;
    }
    .tkd-selector-btn:hover {
      filter: brightness(0.97);
      transform: translateY(-1px);
    }
    .tkd-dropdown-item:hover:not(:disabled) {
      background: ${theme.colors.surfaceAlt} !important;
      color: ${theme.colors.text} !important;
    }
    .tkd-dropdown-item:disabled { cursor: default; }
    .tkd-profile-link:hover { text-decoration: underline; }
    .tkd-closed-btn:hover {
      background: ${theme.colors.surfaceAlt} !important;
      color: ${theme.colors.text} !important;
    }

    @media (max-width: 1024px) {
      .tkd-grid { grid-template-columns: 1fr !important; }
    }
    @media (max-width: 640px) {
      .tkd-info-strip { flex-direction: column !important; }
    }
  `;
  document.head.appendChild(style);
}

export default AdminTicketDetail;
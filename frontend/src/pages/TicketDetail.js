// src/pages/TicketDetail.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaArrowLeft, FaPaperPlane, FaUser, FaShieldAlt,
  FaClock, FaCheckCircle, FaTimesCircle, FaExclamationCircle,
  FaTag, FaReply, FaLock, FaUnlock, FaChevronDown,
  FaCircle, FaComments, FaPlus, FaFileAlt,
  FaPaperclip, FaSmile, FaInfoCircle,
} from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import { formatJalali, formatJalaliDateTime, formatJalaliRelative } from '../utils/jalali';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const API_URL = '/api/tickets';

// ═══════════════════════════════════════════════════════
// CONFIG (رنگ‌های هماهنگ با سایت)
// ═══════════════════════════════════════════════════════

const STATUS_CONFIG = {
  open:        { label: 'باز',            color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', icon: FaCircle },
  in_progress: { label: 'در حال بررسی',   color: '#7C3AED', bg: 'rgba(124,58,237,0.1)', border: 'rgba(124,58,237,0.3)', icon: FaClock },
  waiting:     { label: 'در انتظار پاسخ', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', icon: FaClock },
  resolved:    { label: 'برطرف شده',      color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', icon: FaCheckCircle },
  closed:      { label: 'بسته شده',       color: '#64748B', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.3)', icon: FaLock },
};

const PRIORITY_CONFIG = {
  low:    { label: 'کم',    color: '#64748B', bg: 'rgba(100,116,139,0.1)' },
  medium: { label: 'متوسط', color: '#7C3AED', bg: 'rgba(124,58,237,0.1)' },
  high:   { label: 'بالا',  color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  urgent: { label: 'فوری',  color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
};

// ═══════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════

function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [ticket, setTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [closing, setClosing] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const isAdmin = user?.is_superuser;

  // ═══════════════════════════════════════════════════════
  // DATA
  // ═══════════════════════════════════════════════════════

  useEffect(() => {
    fetchTicket();
    // eslint-disable-next-line
  }, [id]);

  useEffect(() => {
    scrollToBottom();
    // eslint-disable-next-line
  }, [ticket]);

  const fetchTicket = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${API_URL}/tickets/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTicket(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching ticket:', error);
      toast.error('خطا در دریافت تیکت');
      navigate('/my-tickets');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ═══════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════

  const handleCloseTicket = async () => {
    if (!window.confirm('آیا از بستن این تیکت مطمئن هستید؟ پس از بستن، نمی‌توانید به آن پاسخ دهید.')) return;

    setClosing(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        `${API_URL}/tickets/${id}/close/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('تیکت بسته شد');
      setTicket(response.data.ticket);
    } catch (error) {
      toast.error(error.response?.data?.error || 'خطا در بستن تیکت');
    } finally {
      setClosing(false);
    }
  };

  const handleReopenTicket = async () => {
    if (!window.confirm('آیا از بازگشایی این تیکت مطمئن هستید؟')) return;

    setClosing(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        `${API_URL}/tickets/${id}/reopen/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('تیکت بازگشایی شد');
      setTicket(response.data.ticket);
    } catch (error) {
      toast.error(error.response?.data?.error || 'خطا در بازگشایی تیکت');
    } finally {
      setClosing(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();

    if (!replyMessage.trim()) {
      toast.warning('لطفاً متن پاسخ را وارد کنید');
      return;
    }

    if (ticket?.status === 'closed') {
      toast.warning('این تیکت بسته شده است');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        `${API_URL}/tickets/${id}/reply/`,
        { message: replyMessage },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      toast.success('پیام شما ارسال شد');
      setReplyMessage('');
      setTicket(response.data);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    } catch (error) {
      console.error('Error replying:', error);
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('خطا در ارسال پیام');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const changeStatus = async (newStatus) => {
    setShowStatusMenu(false);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        `${API_URL}/tickets/${id}/change_status/`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('وضعیت تغییر کرد');
      setTicket(response.data.ticket);
    } catch (error) {
      toast.error('خطا در تغییر وضعیت');
    }
  };

  // Auto-grow textarea
  const handleTextareaChange = (e) => {
    setReplyMessage(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
  };

  // ═══════════════════════════════════════════════════════
  // LOADING
  // ═══════════════════════════════════════════════════════

  if (loading) {
    return (
      <>
        <Navbar />
        <PageWrapper>
          <DetailSkeleton />
        </PageWrapper>
        <Footer />
      </>
    );
  }

  if (!ticket) {
    return (
      <>
        <Navbar />
        <PageWrapper>
          <div style={S.errorState}>
            <div style={S.errorIcon}>
              <FaExclamationCircle size={28} />
            </div>
            <h2 style={S.errorTitle}>تیکت یافت نشد</h2>
            <p style={S.errorDesc}>ممکن است حذف شده باشد یا دسترسی نداشته باشید.</p>
            <button onClick={() => navigate('/my-tickets')} style={S.errorBtn}>
              <FaArrowLeft size={11} /> بازگشت به تیکت‌ها
            </button>
          </div>
        </PageWrapper>
        <Footer />
      </>
    );
  }

  // ═══════════════════════════════════════════════════════
  // PERMISSIONS
  // ═══════════════════════════════════════════════════════

  const status = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open;
  const priority = PRIORITY_CONFIG[ticket.priority] || PRIORITY_CONFIG.medium;
  const StatusIcon = status.icon;
  const isClosed = ticket.status === 'closed';

  const ticketUserId = ticket.user?.id || ticket.user;
  const currentUserId = user?.id;
  const isOwner = ticketUserId === currentUserId;

  const canReply = !isClosed && (isOwner || isAdmin);
  const canClose = !isClosed && (isOwner || isAdmin);

  const replies = ticket.replies || [];
  const hasReplies = replies.length > 0;

  return (
    <>
      <Navbar />

      <PageWrapper>
        <div style={S.container}>

          {/* ═══ TOP ROW ═══ */}
          <div style={S.topRow}>
            <button
              onClick={() => navigate(isAdmin ? '/admin/tickets' : '/my-tickets')}
              style={S.backBtn}
              className="td-back-btn"
            >
              <FaArrowLeft size={10} />
              <span>بازگشت به تیکت‌ها</span>
            </button>

            {isAdmin && (
              <div style={S.statusMenuWrap}>
                <button
                  onClick={() => setShowStatusMenu((v) => !v)}
                  style={S.statusMenuBtn}
                  className="td-status-menu-btn"
                >
                  <FaCircle size={6} style={{ color: status.color }} />
                  <span>تغییر وضعیت</span>
                  <FaChevronDown size={8} />
                </button>

                <AnimatePresence>
                  {showStatusMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.15 }}
                      style={S.statusMenu}
                    >
                      {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                        const Icon = cfg.icon;
                        const isActive = ticket.status === key;
                        return (
                          <button
                            key={key}
                            onClick={() => changeStatus(key)}
                            style={{
                              ...S.statusMenuItem,
                              ...(isActive ? { background: cfg.bg, color: cfg.color } : {}),
                            }}
                            className="td-status-item"
                            disabled={isActive}
                          >
                            <Icon size={10} />
                            <span>{cfg.label}</span>
                            {isActive && <FaCheckCircle size={9} style={{ marginRight: 'auto' }} />}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* ═══ HEADER CARD ═══ */}
          <div style={S.headerCard} className="td-header-card">
            <div style={S.headerTop}>
              <div style={S.headerLeft}>
                <div style={S.ticketIdBadge}>#{ticket.id}</div>
                <span style={{ ...S.statusPill, color: status.color, background: status.bg, borderColor: status.border }}>
                  <StatusIcon size={9} />
                  {status.label}
                </span>
              </div>

              <div style={S.headerMeta}>
                <FaClock size={10} style={S.metaIcon} />
                <span title={formatJalaliDateTime(ticket.created_at)}>
                  {formatJalaliRelative(ticket.created_at)}
                </span>
              </div>
            </div>

            <h1 style={S.title}>{ticket.title}</h1>

            {ticket.category_name && (
              <div style={S.categoryRow}>
                <span style={S.categoryPill}>
                  <FaTag size={9} />
                  {ticket.category_name}
                </span>
                <span style={{ ...S.priorityPill, color: priority.color, background: priority.bg }}>
                  اولویت: {priority.label}
                </span>
              </div>
            )}

            {/* Support status bar */}
            <div style={S.supportBar}>
              <div style={S.supportStatus}>
                <span style={S.onlineDot} />
                <span style={S.supportStatusText}>تیم پشتیبانی</span>
                <span style={S.supportStatusSub}>پاسخ‌دهی معمولاً زیر ۲۴ ساعت</span>
              </div>

              <div style={S.headerActions} className="td-header-actions">
                {canClose && (
                  <button
                    onClick={handleCloseTicket}
                    style={S.btnGhost}
                    className="td-btn-ghost"
                    disabled={closing}
                  >
                    <FaLock size={10} />
                    {closing ? 'در حال بستن...' : 'بستن تیکت'}
                  </button>
                )}

                {isClosed && isAdmin && (
                  <button
                    onClick={handleReopenTicket}
                    style={S.btnPrimary}
                    className="td-btn-primary"
                    disabled={closing}
                  >
                    <FaUnlock size={10} />
                    {closing ? 'در حال بازگشایی...' : 'بازگشایی'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ═══ CLOSED BANNER ═══ */}
          {isClosed && (
            <div style={S.closedBanner}>
              <div style={S.closedIconWrap}>
                <FaLock size={16} />
              </div>
              <div style={S.closedBody}>
                <div style={S.closedTitle}>این تیکت بسته شده است</div>
                <div style={S.closedDesc}>
                  {ticket.closed_at && <>بسته شده در {formatJalaliDateTime(ticket.closed_at)}. </>}
                  {isAdmin
                    ? 'برای پاسخ، ابتدا بازگشایی کنید.'
                    : 'اگر سوال جدیدی دارید، لطفاً تیکت جدیدی ایجاد کنید.'}
                </div>
              </div>

              {!isAdmin && (
                <Link to="/my-tickets/create" style={S.closedCta} className="td-closed-cta">
                  <FaPlus size={10} /> تیکت جدید
                </Link>
              )}
            </div>
          )}

          {/* ═══ CHAT AREA ═══ */}
          <div style={S.chatCard}>

            {/* Chat header */}
            <div style={S.chatHeader}>
              <div style={S.chatHeaderLeft}>
                <div style={S.chatHeaderAvatar}>
                  <FaComments size={14} />
                </div>
                <div>
                  <div style={S.chatHeaderTitle}>گفتگو با پشتیبانی</div>
                  <div style={S.chatHeaderSub}>
                    {hasReplies
                      ? `${replies.length.toLocaleString('fa-IR')} پیام در این گفتگو`
                      : 'منتظر پاسخ تیم پشتیبانی باشید'}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={S.messagesArea} className="td-messages-area">
              <ChatBubble
                side="right"
                name={ticket.user_full_name || ticket.user_name || 'شما'}
                avatarChar={(ticket.user_full_name || ticket.user_name || 'U')[0]}
                isAdmin={false}
                isOwn={true}
                date={ticket.created_at}
                message={ticket.message}
                isFirst
              />

              {replies.map((reply, idx) => (
                <ChatBubble
                  key={reply.id || idx}
                  side={reply.is_admin ? 'left' : 'right'}
                  name={reply.user_full_name || reply.user_name || 'کاربر'}
                  avatarChar={(reply.user_full_name || reply.user_name || 'U')[0]}
                  isAdmin={reply.is_admin}
                  isOwn={!reply.is_admin && isOwner}
                  date={reply.created_at}
                  message={reply.message}
                  isLast={idx === replies.length - 1}
                />
              ))}

              {!isClosed && canReply && !hasReplies && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  style={S.waitingWrap}
                >
                  <div style={S.waitingAvatar}>
                    <FaShieldAlt size={12} />
                  </div>
                  <div style={S.waitingBubble}>
                    <div style={S.waitingText}>
                      تیم پشتیبانی در حال بررسی درخواست شماست
                    </div>
                    <div style={S.typingDots}>
                      <span style={{ ...S.typingDot, animationDelay: '0s' }} />
                      <span style={{ ...S.typingDot, animationDelay: '0.15s' }} />
                      <span style={{ ...S.typingDot, animationDelay: '0.3s' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Reply composer */}
            {canReply && (
              <form onSubmit={handleReply} style={S.composer}>
                <div style={S.composerInner} className="td-composer-inner">
                  <div style={S.composerAvatar}>
                    {isAdmin ? <FaShieldAlt size={13} /> : <FaUser size={12} />}
                  </div>

                  <div style={S.composerBody} className="td-composer-body">
                    <textarea
                      ref={textareaRef}
                      value={replyMessage}
                      onChange={handleTextareaChange}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                          e.preventDefault();
                          handleReply(e);
                        }
                      }}
                      style={S.composerInput}
                      className="td-composer-input"
                      placeholder="پیام خود را اینجا بنویسید..."
                      rows={1}
                      disabled={submitting}
                    />

                    <div style={S.composerFooter} className="td-composer-footer">
                      <div style={S.composerHints}>
                        <span style={S.composerHint}>
                          <kbd style={S.kbd}>Ctrl</kbd> + <kbd style={S.kbd}>Enter</kbd> برای ارسال
                        </span>
                      </div>

                      <div style={S.composerActions}>
                        <span style={S.charCount}>
                          {replyMessage.length.toLocaleString('fa-IR')} / ۵۰۰۰
                        </span>
                        <button
                          type="submit"
                          style={{
                            ...S.composerSubmit,
                            opacity: submitting || !replyMessage.trim() ? 0.4 : 1,
                            cursor: submitting || !replyMessage.trim() ? 'not-allowed' : 'pointer',
                          }}
                          className="td-composer-submit"
                          disabled={submitting || !replyMessage.trim()}
                        >
                          <FaPaperPlane size={10} />
                          {submitting ? 'در حال ارسال...' : 'ارسال'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {!canReply && !isClosed && !isOwner && !isAdmin && (
              <div style={S.composerDisabled}>
                <FaInfoCircle size={12} />
                <span>شما دسترسی به پاسخ‌دهی این تیکت را ندارید</span>
              </div>
            )}

            {isClosed && (
              <div style={S.composerDisabled}>
                <FaLock size={12} />
                <span>این تیکت بسته شده است</span>
                {!isAdmin && (
                  <Link to="/my-tickets/create" style={S.composerDisabledLink}>
                    ایجاد تیکت جدید
                  </Link>
                )}
              </div>
            )}
          </div>

        </div>
      </PageWrapper>

      <Footer />
    </>
  );
}

// ═══════════════════════════════════════════════════════
// WRAPPER
// ═══════════════════════════════════════════════════════

function PageWrapper({ children }) {
  return (
    <div style={S.pageContainer}>
      <div style={S.content}>{children}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// CHAT BUBBLE
// ═══════════════════════════════════════════════════════

function ChatBubble({ side, name, avatarChar, isAdmin, isOwn, date, message, isFirst, isLast }) {
  const isRight = side === 'right';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        ...S.bubbleRow,
        justifyContent: isRight ? 'flex-start' : 'flex-end',
      }}
      className="td-bubble-row"
    >
      <div
        style={{
          ...S.bubbleAvatar,
          ...(isAdmin ? S.bubbleAvatarAdmin : S.bubbleAvatarUser),
          order: isRight ? 0 : 1,
        }}
      >
        {isAdmin ? <FaShieldAlt size={12} /> : (avatarChar || '?')}
      </div>

      <div
        style={{
          ...S.bubbleWrap,
          alignItems: isRight ? 'flex-start' : 'flex-end',
          order: isRight ? 1 : 0,
        }}
      >
        <div style={S.bubbleHeader}>
          <span style={S.bubbleName}>
            {name}
            {isAdmin && <span style={S.bubbleAdminBadge}>پشتیبان</span>}
            {isOwn && !isAdmin && <span style={S.bubbleOwnBadge}>شما</span>}
          </span>
        </div>

        <div
          style={{
            ...S.bubble,
            ...(isAdmin ? S.bubbleAdmin : S.bubbleUser),
            ...(isFirst ? S.bubbleFirst : {}),
            ...(isLast ? S.bubbleLast : {}),
          }}
          className="td-bubble"
        >
          {message}
        </div>

        <div
          style={{
            ...S.bubbleTime,
            textAlign: isRight ? 'right' : 'left',
          }}
          title={formatJalaliDateTime(date)}
        >
          {formatJalaliRelative(date)}
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════
// SKELETON
// ═══════════════════════════════════════════════════════

function DetailSkeleton() {
  return (
    <div style={S.container}>
      <div style={{ ...S.skelBar, width: 140, height: 32, borderRadius: 10 }} />
      <div style={{ ...S.skelBar, width: '100%', height: 160, borderRadius: 16, marginTop: 16 }} />
      <div style={{ ...S.skelBar, width: '100%', height: 400, borderRadius: 16, marginTop: 16 }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// STYLES (هماهنگ با تم سایت)
// ═══════════════════════════════════════════════════════

const S = {
  pageContainer: {
    minHeight: '100vh',
    background: '#FFFFFF',
    padding: '100px 0 40px',
    fontFamily: 'Vazirmatn, sans-serif',
  },
  content: {
    maxWidth: 900,
    margin: '0 auto',
    padding: '0 16px',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },

  // ═══ TOP ROW ═══
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '10px 16px',
    background: '#F5F3FF',
    border: '1px solid rgba(124,58,237,0.1)',
    borderRadius: 12,
    color: 'rgba(26,26,46,0.6)',
    fontSize: 13,
    fontWeight: 600,
    fontFamily: 'Vazirmatn, sans-serif',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },

  statusMenuWrap: { position: 'relative' },
  statusMenuBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 16px',
    background: '#F5F3FF',
    border: '1px solid rgba(124,58,237,0.1)',
    borderRadius: 12,
    color: 'rgba(26,26,46,0.6)',
    fontSize: 13,
    fontWeight: 600,
    fontFamily: 'Vazirmatn, sans-serif',
    cursor: 'pointer',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  },
  statusMenu: {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    left: 0,
    minWidth: 200,
    background: '#FFFFFF',
    border: '1px solid rgba(124,58,237,0.1)',
    borderRadius: 12,
    boxShadow: '0 8px 32px rgba(124,58,237,0.15)',
    padding: 5,
    zIndex: 500,
    animation: 'td-fade-in 0.12s ease-out',
  },
  statusMenuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    padding: '9px 11px',
    background: 'transparent',
    border: 'none',
    borderRadius: 7,
    color: 'rgba(26,26,46,0.6)',
    fontSize: 12.5,
    fontWeight: 600,
    fontFamily: 'Vazirmatn, sans-serif',
    cursor: 'pointer',
    textAlign: 'right',
    transition: 'all 0.12s',
  },

  // ═══ HEADER CARD ═══
  headerCard: {
    background: '#FFFFFF',
    border: '1px solid rgba(124,58,237,0.08)',
    borderRadius: 20,
    padding: '24px 26px 20px',
    boxShadow: '0 4px 24px rgba(124,58,237,0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  ticketIdBadge: {
    fontSize: 12,
    fontWeight: 800,
    color: 'rgba(26,26,46,0.5)',
    background: '#F5F3FF',
    padding: '4px 10px',
    borderRadius: 8,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '0.3px',
  },
  statusPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '5px 12px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
    border: '1px solid',
  },
  headerMeta: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    color: 'rgba(26,26,46,0.5)',
    fontWeight: 500,
  },
  metaIcon: { color: 'rgba(26,26,46,0.3)' },

  title: {
    fontSize: 22,
    fontWeight: 800,
    color: '#1A1A2E',
    margin: 0,
    letterSpacing: '-0.4px',
    lineHeight: 1.4,
    wordBreak: 'break-word',
  },
  categoryRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  categoryPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '5px 12px',
    background: '#FAFAFC',
    border: '1px solid rgba(124,58,237,0.1)',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    color: 'rgba(26,26,46,0.6)',
  },
  priorityPill: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '5px 12px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
  },

  supportBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingTop: 16,
    borderTop: '1px solid rgba(124,58,237,0.08)',
    flexWrap: 'wrap',
  },
  supportStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#10B981',
    boxShadow: '0 0 0 3px rgba(16,185,129,0.15)',
    animation: 'td-pulse 1.8s ease-in-out infinite',
  },
  supportStatusText: {
    fontSize: 13,
    fontWeight: 700,
    color: '#1A1A2E',
  },
  supportStatusSub: {
    fontSize: 12,
    color: 'rgba(26,26,46,0.4)',
    fontWeight: 500,
  },
  headerActions: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  btnGhost: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '9px 16px',
    background: '#FAFAFC',
    border: '1px solid rgba(124,58,237,0.1)',
    borderRadius: 10,
    color: 'rgba(26,26,46,0.6)',
    fontSize: 12.5,
    fontWeight: 600,
    fontFamily: 'Vazirmatn, sans-serif',
    cursor: 'pointer',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  },
  // ✅ دکمه اصلی - تیره
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '9px 16px',
    background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
    border: '1px solid rgba(168,85,247,0.2)',
    borderRadius: 10,
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: 700,
    fontFamily: 'Vazirmatn, sans-serif',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(45,21,64,0.35)',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  },

  // ═══ CLOSED BANNER ═══
  closedBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: 18,
    background: '#FAFAFC',
    border: '1px dashed rgba(124,58,237,0.15)',
    borderRadius: 16,
    flexWrap: 'wrap',
  },
  closedIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    background: '#FFFFFF',
    border: '1px solid rgba(124,58,237,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'rgba(26,26,46,0.5)',
    flexShrink: 0,
  },
  closedBody: { flex: 1, minWidth: 200 },
  closedTitle: {
    fontSize: 13.5,
    fontWeight: 700,
    color: '#1A1A2E',
    marginBottom: 4,
  },
  closedDesc: {
    fontSize: 12,
    color: 'rgba(26,26,46,0.5)',
    lineHeight: 1.6,
  },
  closedCta: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '8px 16px',
    background: 'rgba(124,58,237,0.06)',
    border: '1px solid rgba(124,58,237,0.15)',
    borderRadius: 10,
    color: '#7C3AED',
    fontSize: 12.5,
    fontWeight: 700,
    textDecoration: 'none',
    fontFamily: 'Vazirmatn, sans-serif',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  },

  // ═══ CHAT CARD ═══
  chatCard: {
    background: '#FFFFFF',
    border: '1px solid rgba(124,58,237,0.08)',
    borderRadius: 20,
    boxShadow: '0 4px 24px rgba(124,58,237,0.06)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  chatHeader: {
    padding: '18px 22px',
    borderBottom: '1px solid rgba(124,58,237,0.08)',
    background: '#FAFAFC',
  },
  chatHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  // ✅ آواتار گفتگو - تیره
  chatHeaderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 4px 12px rgba(45,21,64,0.3)',
    border: '1px solid rgba(168,85,247,0.2)',
  },
  chatHeaderTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1A1A2E',
  },
  chatHeaderSub: {
    fontSize: 12,
    color: 'rgba(26,26,46,0.5)',
    marginTop: 2,
  },

  // ═══ MESSAGES AREA ═══
  messagesArea: {
    padding: '24px 22px',
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
    maxHeight: '60vh',
    overflowY: 'auto',
    background: '#FFFFFF',
  },

  // ═══ BUBBLES ═══
  bubbleRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 10,
  },
  bubbleAvatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontSize: 13,
    fontWeight: 700,
    color: '#FFFFFF',
  },
  bubbleAvatarAdmin: {
    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    boxShadow: '0 3px 10px rgba(16,185,129,0.3)',
  },
  // ✅ آواتار کاربر - تیره
  bubbleAvatarUser: {
    background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
    boxShadow: '0 3px 10px rgba(45,21,64,0.35)',
    border: '1px solid rgba(168,85,247,0.2)',
  },
  bubbleWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    maxWidth: '72%',
    minWidth: 0,
  },
  bubbleHeader: {
    padding: '0 6px',
  },
  bubbleName: {
    fontSize: 12,
    fontWeight: 700,
    color: 'rgba(26,26,46,0.6)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  },
  bubbleAdminBadge: {
    fontSize: 10,
    fontWeight: 700,
    color: '#10B981',
    background: 'rgba(16,185,129,0.1)',
    padding: '2px 7px',
    borderRadius: 999,
  },
  bubbleOwnBadge: {
    fontSize: 10,
    fontWeight: 700,
    color: '#7C3AED',
    background: 'rgba(124,58,237,0.1)',
    padding: '2px 7px',
    borderRadius: 999,
  },
  bubble: {
    padding: '12px 16px',
    fontSize: 13.5,
    lineHeight: 1.8,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    borderRadius: 14,
  },
  // ✅ حباب کاربر - تیره
  bubbleUser: {
    background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
    color: '#FFFFFF',
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 4,
    boxShadow: '0 4px 14px rgba(45,21,64,0.35)',
    border: '1px solid rgba(168,85,247,0.2)',
  },
  bubbleAdmin: {
    background: '#FAFAFC',
    color: '#1A1A2E',
    border: '1px solid rgba(124,58,237,0.1)',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 14,
  },
  bubbleFirst: {},
  bubbleLast: {},
  bubbleTime: {
    fontSize: 11,
    color: 'rgba(26,26,46,0.4)',
    padding: '0 6px',
    fontWeight: 500,
  },

  // ═══ WAITING ═══
  waitingWrap: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 10,
  },
  waitingAvatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 3px 10px rgba(16,185,129,0.3)',
  },
  waitingBubble: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    background: '#FAFAFC',
    border: '1px solid rgba(124,58,237,0.1)',
    borderRadius: 14,
    borderBottomLeftRadius: 4,
  },
  waitingText: {
    fontSize: 12.5,
    color: 'rgba(26,26,46,0.6)',
    fontWeight: 500,
  },
  typingDots: {
    display: 'inline-flex',
    gap: 4,
    alignItems: 'center',
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#7C3AED',
    animation: 'td-typing 1.2s ease-in-out infinite',
  },

  // ═══ COMPOSER ═══
  composer: {
    borderTop: '1px solid rgba(124,58,237,0.08)',
    background: '#FFFFFF',
    padding: 18,
  },
  composerInner: {
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start',
  },
  // ✅ آواتار Composer - تیره
  composerAvatar: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 3px 10px rgba(45,21,64,0.35)',
    marginTop: 4,
    border: '1px solid rgba(168,85,247,0.2)',
  },
  composerBody: {
    flex: 1,
    minWidth: 0,
    background: '#FAFAFC',
    border: '1.5px solid rgba(124,58,237,0.1)',
    borderRadius: 14,
    padding: '12px 14px',
    transition: 'all 0.15s',
  },
  composerInput: {
    width: '100%',
    border: 'none',
    background: 'transparent',
    fontSize: 13.5,
    color: '#1A1A2E',
    fontFamily: 'Vazirmatn, sans-serif',
    outline: 'none',
    resize: 'none',
    lineHeight: 1.7,
    minHeight: 24,
    maxHeight: 200,
    boxSizing: 'border-box',
  },
  composerFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginTop: 10,
    paddingTop: 10,
    borderTop: '1px solid rgba(124,58,237,0.08)',
    flexWrap: 'wrap',
  },
  composerHints: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
  },
  composerHint: {
    fontSize: 10.5,
    color: 'rgba(26,26,46,0.4)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  },
  kbd: {
    fontSize: 10,
    fontWeight: 700,
    color: 'rgba(26,26,46,0.6)',
    background: '#FFFFFF',
    border: '1px solid rgba(124,58,237,0.15)',
    borderRadius: 4,
    padding: '1px 5px',
    fontFamily: 'monospace',
  },
  composerActions: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 12,
  },
  charCount: {
    fontSize: 10.5,
    color: 'rgba(26,26,46,0.4)',
    fontVariantNumeric: 'tabular-nums',
  },
  // ✅ دکمه ارسال - تیره
  composerSubmit: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
    border: '1px solid rgba(168,85,247,0.2)',
    borderRadius: 10,
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: 700,
    fontFamily: 'Vazirmatn, sans-serif',
    cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(45,21,64,0.35)',
    transition: 'all 0.15s',
    whiteSpace: 'nowrap',
  },

  composerDisabled: {
    padding: '18px 22px',
    borderTop: '1px solid rgba(124,58,237,0.08)',
    background: '#FAFAFC',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    color: 'rgba(26,26,46,0.4)',
    fontSize: 12.5,
    fontWeight: 500,
    flexWrap: 'wrap',
  },
  composerDisabledLink: {
    color: '#7C3AED',
    fontWeight: 700,
    textDecoration: 'none',
    fontSize: 12.5,
  },

  // ═══ ERROR ═══
  errorState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: '80px 20px',
    textAlign: 'center',
    background: '#FFFFFF',
    border: '1px solid rgba(124,58,237,0.08)',
    borderRadius: 20,
  },
  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    background: 'rgba(239,68,68,0.08)',
    color: '#EF4444',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: '#1A1A2E',
    margin: 0,
  },
  errorDesc: {
    fontSize: 13,
    color: 'rgba(26,26,46,0.5)',
    margin: 0,
    maxWidth: 320,
  },
  errorBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    padding: '11px 22px',
    background: 'rgba(124,58,237,0.06)',
    border: '1px solid rgba(124,58,237,0.15)',
    borderRadius: 10,
    color: '#7C3AED',
    fontSize: 13,
    fontWeight: 700,
    fontFamily: 'Vazirmatn, sans-serif',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },

  // ═══ SKELETON ═══
  skelBar: {
    background: 'linear-gradient(90deg, #F5F3FF 0%, #FAFAFC 50%, #F5F3FF 100%)',
    backgroundSize: '200% 100%',
    animation: 'td-skel 1.4s ease-in-out infinite',
  },
};

// ═══════════════════════════════════════════════════════
// STYLES INJECTION
// ═══════════════════════════════════════════════════════

if (typeof document !== 'undefined' && !document.getElementById('ticket-detail-styles')) {
  const style = document.createElement('style');
  style.id = 'ticket-detail-styles';
  style.textContent = `
    @keyframes td-skel {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    @keyframes td-fade-in {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes td-typing {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
      30% { transform: translateY(-4px); opacity: 1; }
    }
    @keyframes td-pulse {
      0%, 100% { box-shadow: 0 0 0 3px rgba(16,185,129,0.15); }
      50% { box-shadow: 0 0 0 6px rgba(16,185,129,0.1); }
    }

    /* ═══ Back Button Hover ═══ */
    .td-back-btn:hover {
      background: linear-gradient(135deg, #2D1540 0%, #1A0828 100%) !important;
      color: #FFFFFF !important;
      border-color: rgba(168,85,247,0.5) !important;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(45,21,64,0.3);
    }

    /* ═══ Ghost Button Hover ═══ */
    .td-btn-ghost:hover {
      background: linear-gradient(135deg, #2D1540 0%, #1A0828 100%) !important;
      color: #FFFFFF !important;
      border-color: rgba(168,85,247,0.5) !important;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(45,21,64,0.3);
    }

    /* ═══ Primary Button Hover ═══ */
    .td-btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 22px rgba(45,21,64,0.5) !important;
      border-color: rgba(168,85,247,0.5) !important;
      background: linear-gradient(135deg, #3D1E57 0%, #2D1540 100%) !important;
    }
    .td-btn-primary:disabled,
    .td-btn-ghost:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }

    /* ═══ Status Menu Button Hover ═══ */
    .td-status-menu-btn:hover {
      background: #EDE9FE !important;
      color: #7C3AED !important;
      border-color: rgba(124,58,237,0.3) !important;
    }
    .td-status-item:hover:not(:disabled) {
      background: #F5F3FF !important;
      color: #7C3AED !important;
    }
    .td-status-item:disabled {
      cursor: default;
    }

    /* ═══ Closed CTA Hover ═══ */
    .td-closed-cta:hover {
      background: linear-gradient(135deg, #2D1540 0%, #1A0828 100%) !important;
      color: #FFFFFF !important;
      border-color: rgba(168,85,247,0.5) !important;
      transform: translateY(-2px);
    }

    /* ═══ Composer Input Focus ═══ */
    .td-composer-input:focus {
      outline: none;
    }
    .td-composer-input::placeholder {
      color: rgba(26,26,46,0.35);
    }

    /* ═══ Composer Submit Hover ═══ */
    .td-composer-submit:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 22px rgba(45,21,64,0.5) !important;
      border-color: rgba(168,85,247,0.5) !important;
      background: linear-gradient(135deg, #3D1E57 0%, #2D1540 100%) !important;
    }
    .td-composer-submit:disabled {
      cursor: not-allowed;
    }

    /* ═══ Error Button Hover ═══ */
    .td-error-btn:hover {
      background: linear-gradient(135deg, #2D1540 0%, #1A0828 100%) !important;
      color: #FFFFFF !important;
      border-color: rgba(168,85,247,0.5) !important;
      transform: translateY(-2px);
    }

    /* ═══ Bubble Animation ═══ */
    .td-bubble {
      animation: td-fade-in 0.2s ease-out;
    }

    /* ═══ Scrollbar ═══ */
    .td-messages-area::-webkit-scrollbar {
      width: 6px;
    }
    .td-messages-area::-webkit-scrollbar-track {
      background: transparent;
    }
    .td-messages-area::-webkit-scrollbar-thumb {
      background: rgba(124,58,237,0.15);
      border-radius: 3px;
    }
    .td-messages-area::-webkit-scrollbar-thumb:hover {
      background: rgba(124,58,237,0.3);
    }

    /* ══════════ RESPONSIVE ══════════ */
    @media (max-width: 640px) {
      .td-back-btn span {
        display: none;
      }
      .td-back-btn {
        padding: 8px 12px !important;
      }
      .td-bubble-row {
        gap: 8px !important;
      }
      .td-messages-area {
        padding: 18px 16px !important;
      }
      .td-header-card {
        padding: 18px 16px 16px !important;
      }
      .td-composer-inner {
        gap: 8px !important;
      }
      .td-composer-footer {
        flex-direction: column !important;
        align-items: stretch !important;
        gap: 8px !important;
      }
      .td-composer-actions {
        justify-content: space-between !important;
      }
    }

    @media (max-width: 480px) {
      .td-header-actions {
        width: 100% !important;
      }
      .td-btn-ghost,
      .td-btn-primary {
        flex: 1 !important;
        justify-content: center !important;
      }
    }
  `;
  document.head.appendChild(style);
}

export default TicketDetail;
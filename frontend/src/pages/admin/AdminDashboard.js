// src/pages/admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaBox, FaUsers, FaWallet, FaPlus, FaDownload, FaEye,
  FaArrowUp, FaArrowDown, FaClock, FaCheckCircle,
  FaTimesCircle, FaCreditCard, FaTag, FaCog,
  FaFileAlt, FaChevronLeft, FaChartPie, FaInbox,
  FaCalendarAlt, FaChevronDown,
} from 'react-icons/fa';
import AdminLayout from './AdminLayout';
import { toast } from 'react-toastify';
import axios from 'axios';
import theme, { pageTitle, pageSubtitle } from '../../styles/adminTheme';
import { formatJalali, formatJalaliTime } from '../../utils/jalali';
import SystemHealthCard from '../../components/SystemHealthCard';
import ActionQueueCard from '../../components/ActionQueueCard';
import ExportMenu from '../../components/ExportMenu';

const fmt = (n) => (n || 0).toLocaleString('fa-IR');
const fmtShort = (n) => {
  if (!n) return '0';
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return n.toString();
};

const RANGE_OPTIONS = [
  { key: '1d',  label: 'امروز' },
  { key: '7d',  label: '۷ روز اخیر' },
  { key: '30d', label: '۳۰ روز اخیر' },
  { key: '90d', label: '۹۰ روز اخیر' },
  { key: '1y',  label: 'یک سال' },
  { key: 'all', label: 'همه' },
];

function AdminDashboard() {
  const { user } = useSelector((s) => s.auth);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_packages: 0, total_categories: 0, total_users: 0,
    total_revenue: 0, successful_payments: 0, pending_payments: 0,
    failed_payments: 0, growth: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topPackages, setTopPackages] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [sparkData, setSparkData] = useState({ revenue: [], users: [], packages: [], categories: [] });

  const [range, setRange] = useState('30d');
  const [rangeOpen, setRangeOpen] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initial + on range change
  useEffect(() => {
    fetchDashboardData(range);
    // eslint-disable-next-line
  }, [range]);

  // Auto-refresh every 60s
  useEffect(() => {
    const id = setInterval(() => {
      fetchDashboardData(range, true);
    }, 60000);
    return () => clearInterval(id);
    // eslint-disable-next-line
  }, [range]);

  // Close range dropdown on click outside
  useEffect(() => {
    const onClick = (e) => {
      if (!e.target.closest('.ds-range-menu')) setRangeOpen(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const fetchDashboardData = async (rangeKey = '30d', silent = false) => {
    if (!silent) setLoading(true);
    if (silent) setIsRefreshing(true);

    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get(
        `/api/packages/dashboard/stats/?range=${rangeKey}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const r = res.data;
      setStats(r.stats || {});
      setRecentOrders(r.recent_orders || []);
      setTopPackages(r.top_packages || []);
      const rev = r.monthly_revenue || [];
      setMonthlyRevenue(rev);

      const revenueTrend = rev.map((m) => m.revenue || 0);
      setSparkData({
        revenue: r.spark_revenue || revenueTrend,
        users: r.spark_users || revenueTrend.map((v, i) => Math.round(v / 50000 + i * 3)),
        packages: r.spark_packages || revenueTrend.map((v, i) => Math.round(v / 200000 + i)),
        categories: r.spark_categories || revenueTrend.map((v, i) => Math.round(v / 400000 + i)),
      });

      setLastUpdated(new Date());
    } catch (e) {
      console.error(e);
      if (!silent) toast.error('خطا در دریافت اطلاعات داشبورد');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const currentRangeLabel =
    RANGE_OPTIONS.find((o) => o.key === range)?.label || '۳۰ روز اخیر';

  // ═══════════ SKELETON ═══════════
  if (loading) {
    return (
      <AdminLayout>
        <DashboardSkeleton />
      </AdminLayout>
    );
  }

  const kpis = [
    {
      label: 'درآمد کل',
      value: fmt(stats.total_revenue),
      unit: 'تومان',
      delta: stats.growth,
      icon: FaWallet,
      href: '/adminpanel/m1/admin/payments',
      accent: theme.colors.tintIndigo,
      soft: theme.colors.tintIndigoSoft,
      trend: sparkData.revenue,
    },
    {
      label: 'کاربران',
      value: fmt(stats.total_users),
      delta: null,
      icon: FaUsers,
      href: '/adminpanel/m1/admin/users',
      accent: theme.colors.tintSky,
      soft: theme.colors.tintSkySoft,
      trend: sparkData.users,
    },
    {
      label: 'دوره‌ها',
      value: fmt(stats.total_packages),
      delta: null,
      icon: FaBox,
      href: '/adminpanel/m1/admin/packages',
      accent: theme.colors.tintEmerald,
      soft: theme.colors.tintEmeraldSoft,
      trend: sparkData.packages,
    },
    {
      label: 'دسته‌بندی‌ها',
      value: fmt(stats.total_categories),
      delta: null,
      icon: FaTag,
      href: '/adminpanel/m1/admin/categories',
      accent: theme.colors.tintAmber,
      soft: theme.colors.tintAmberSoft,
      trend: sparkData.categories,
    },
  ];

  const statuses = [
    { label: 'پرداخت موفق', value: stats.successful_payments, icon: FaCheckCircle, color: theme.colors.success, bg: theme.colors.successSoft },
    { label: 'در انتظار', value: stats.pending_payments, icon: FaClock, color: theme.colors.warning, bg: theme.colors.warningSoft },
    { label: 'ناموفق', value: stats.failed_payments, icon: FaTimesCircle, color: theme.colors.danger, bg: theme.colors.dangerSoft },
  ];

  return (
    <AdminLayout>
      <div style={S.container}>

        {/* HEADER */}
        <div style={S.pageHeader} className="ds-page-header">
          <div style={S.pageHeaderText}>
            <div style={S.titleRow}>
              <h1 style={pageTitle}>داشبورد</h1>
              <button
                onClick={() => fetchDashboardData(range, true)}
                disabled={isRefreshing}
                style={S.liveDot}
                className="ds-live-dot"
                title="کلیک کنید برای بروزرسانی فوری"
              >
                <span style={S.liveDotPulse} />
                <span style={S.liveDotLabel}>
                  {isRefreshing ? 'بروزرسانی...' : 'زنده'}
                </span>
              </button>
            </div>
            <p style={pageSubtitle}>
              خوش آمدید، <strong style={{ color: theme.colors.text, fontWeight: 600 }}>{user?.full_name || user?.username}</strong>
              <span style={S.updatedText}> • آخرین به‌روزرسانی: {formatJalaliTime(lastUpdated)}</span>
            </p>
          </div>

          <div style={S.headerActions} className="ds-header-actions">
            {/* Range selector */}
            <div style={S.rangeWrap} className="ds-range-menu">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setRangeOpen((v) => !v);
                }}
                style={S.rangeBtn}
                className="ds-range-btn"
              >
                <FaCalendarAlt size={11} />
                <span>{currentRangeLabel}</span>
                <FaChevronDown
                  size={8}
                  style={{
                    transform: rangeOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.15s',
                  }}
                />
              </button>

              {rangeOpen && (
                <div style={S.rangeMenu}>
                  {RANGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => {
                        setRange(opt.key);
                        setRangeOpen(false);
                      }}
                      style={{
                        ...S.rangeMenuItem,
                        ...(range === opt.key ? S.rangeMenuItemActive : {}),
                      }}
                      className="ds-range-item"
                    >
                      {opt.label}
                      {range === opt.key && <span style={S.rangeCheck}>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <ExportMenu
              data={recentOrders.map((o) => ({
                'کاربر': o.user,
                'دوره': o.package,
                'مبلغ': o.amount === 0 ? 'رایگان' : fmt(o.amount),
                'تاریخ': o.date,
                'وضعیت': o.status,
              }))}
              filename="orders"
              title="گزارش سفارش‌های اخیر"
            />

            <Link to="/adminpanel/m1/admin/packages/add" style={S.btnPrimary} className="ds-btn-primary">
              <FaPlus size={11} />
              <span>دوره جدید</span>
            </Link>
          </div>
        </div>

        {/* KPI CARDS WITH SPARKLINES */}
        <div style={S.kpiGrid} className="ds-kpi-grid">
          {kpis.map((k) => {
            const Icon = k.icon;
            const deltaPositive = k.delta >= 0;
            return (
              <Link key={k.label} to={k.href} style={S.kpiCard} className="ds-card">
                <div style={S.kpiTop}>
                  <div style={{ ...S.kpiIconBox, background: k.soft }}>
                    <Icon size={14} color={k.accent} />
                  </div>
                  {k.delta !== null && k.delta !== undefined && (
                    <div style={{
                      ...S.kpiDelta,
                      color: deltaPositive ? theme.colors.success : theme.colors.danger,
                      background: deltaPositive ? theme.colors.successSoft : theme.colors.dangerSoft,
                    }}>
                      {deltaPositive ? <FaArrowUp size={8} /> : <FaArrowDown size={8} />}
                      <span>{Math.abs(k.delta).toFixed(1)}%</span>
                    </div>
                  )}
                </div>

                <div style={S.kpiLabel}>{k.label}</div>

                <div style={S.kpiValueRow}>
                  <span style={S.kpiValue}>{k.value}</span>
                  {k.unit && <span style={S.kpiUnit}>{k.unit}</span>}
                </div>

                {k.trend && k.trend.length > 1 && (
                  <div style={S.sparkWrap}>
                    <Sparkline data={k.trend} color={k.accent} />
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {/* STATUS ROW */}
        <div style={S.statusRow} className="ds-status-row">
          {statuses.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} style={S.statusCard} className="ds-card-static">
                <div style={{ ...S.statusIconWrap, background: s.bg }}>
                  <Icon size={15} color={s.color} />
                </div>
                <div style={S.statusInfo}>
                  <div style={S.statusValue}>{fmt(s.value)}</div>
                  <div style={S.statusLabel}>{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CHARTS */}
        <div style={S.chartsGrid} className="ds-charts-grid">
          <div style={S.chartCard} className="ds-card-static">
            <div style={S.cardHeader}>
              <div style={S.cardHeaderText}>
                <h3 style={S.cardTitle}>روند درآمد</h3>
                <p style={S.cardSub}>{currentRangeLabel}</p>
              </div>
              <span style={S.cardBadge}>ماهانه</span>
            </div>
            <div style={{ marginTop: 8 }}>
              {monthlyRevenue.length > 0 ? (
                <SimpleAreaChart data={monthlyRevenue} />
              ) : (
                <EmptyState
                  icon={FaChartPie}
                  title="هنوز داده‌ای موجود نیست"
                  description="پس از اولین فروش، نمودار درآمد اینجا نمایش داده می‌شود."
                  ctaLabel="ایجاد دوره"
                  ctaHref="/adminpanel/m1/admin/packages/add"
                />
              )}
            </div>
          </div>

          <div style={S.chartCard} className="ds-card-static">
            <div style={S.cardHeader}>
              <div style={S.cardHeaderText}>
                <h3 style={S.cardTitle}>دوره‌های پرفروش</h3>
                <p style={S.cardSub}>۵ دوره برتر</p>
              </div>
              <Link to="/adminpanel/m1/admin/packages" style={S.cardLink}>
                <span>همه</span>
                <FaChevronLeft size={9} />
              </Link>
            </div>
            <div style={S.topList}>
              {topPackages.length > 0 ? (
                topPackages.slice(0, 5).map((p, i) => {
                  const rankColors = [
                    { bg: theme.colors.tintIndigoSoft, fg: theme.colors.tintIndigo },
                    { bg: theme.colors.tintEmeraldSoft, fg: theme.colors.tintEmerald },
                    { bg: theme.colors.tintAmberSoft, fg: theme.colors.tintAmber },
                    { bg: theme.colors.surfaceAlt, fg: theme.colors.textMuted },
                    { bg: theme.colors.surfaceAlt, fg: theme.colors.textMuted },
                  ];
                  const rc = rankColors[i] || rankColors[4];
                  return (
                    <div key={i} style={S.topItem} className="ds-row">
                      <span style={{ ...S.topRank, background: rc.bg, color: rc.fg }}>
                        {i + 1}
                      </span>
                      <div style={S.topInfo}>
                        <div style={S.topName}>{p.name}</div>
                        <div style={S.topMeta}>
                          <FaUsers size={9} />
                          <span>{fmt(p.students)} دانشجو</span>
                        </div>
                      </div>
                      <div style={S.topRevenue}>{fmt(p.revenue)}</div>
                    </div>
                  );
                })
              ) : (
                <EmptyState
                  icon={FaBox}
                  title="هنوز دوره‌ای فروش نرفته"
                  description="برای دیدن دوره‌های پرفروش، ابتدا یک دوره منتشر کنید."
                  ctaLabel="مدیریت دوره‌ها"
                  ctaHref="/adminpanel/m1/admin/packages"
                />
              )}
            </div>
          </div>
        </div>

        {/* RECENT ORDERS */}
        <div style={S.tableCard} className="ds-card-static">
          <div style={S.cardHeader}>
            <div style={S.cardHeaderText}>
              <h3 style={S.cardTitle}>سفارش‌های اخیر</h3>
              <p style={S.cardSub}>{recentOrders.length} مورد</p>
            </div>
            <Link to="/adminpanel/m1/admin/payments" style={S.cardLink}>
              <span>مشاهده همه</span>
              <FaChevronLeft size={9} />
            </Link>
          </div>

          <div style={S.tableWrap} className="ds-table-wrap">
            {recentOrders.length > 0 ? (
              <>
                {/* ═══ Desktop: table ═══ */}
                <table style={S.table} className="ds-table ds-desktop-table">
                  <thead style={S.thead}>
                    <tr>
                      <th style={S.th}>کاربر</th>
                      <th style={S.th}>دوره</th>
                      <th style={S.th}>مبلغ</th>
                      <th style={S.th}>تاریخ</th>
                      <th style={S.th}>وضعیت</th>
                      <th style={S.th}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.slice(0, 8).map((o) => {
                      const isPaid = o.status === 'paid';
                      const isPending = o.status === 'pending';
                      const statusColor = isPaid ? theme.colors.success : isPending ? theme.colors.warning : theme.colors.danger;
                      const statusBg = isPaid ? theme.colors.successSoft : isPending ? theme.colors.warningSoft : theme.colors.dangerSoft;
                      const statusLabel = isPaid ? 'پرداخت شده' : isPending ? 'در انتظار' : 'ناموفق';

                      return (
                        <tr key={o.id} style={S.tr} className="ds-row">
                          <td style={{ ...S.td, fontWeight: 600 }}>{o.user}</td>
                          <td style={{ ...S.td, color: theme.colors.textMuted }}>{o.package}</td>
                          <td style={{ ...S.td, fontWeight: 700 }}>
                            {o.amount === 0 ? 'رایگان' : fmt(o.amount)}
                          </td>
                          <td style={{ ...S.td, color: theme.colors.textSubtle }}>{formatJalali(o.date)}</td>
                          <td style={S.td}>
                            <span style={{ ...S.pill, background: statusBg, color: statusColor }}>
                              <span style={{ ...S.pillDot, background: statusColor }} />
                              {statusLabel}
                            </span>
                          </td>
                          <td style={S.td}>
                            <Link to="/adminpanel/m1/admin/payments" style={S.rowAction} className="ds-row-action">
                              <FaEye size={11} />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* ═══ Mobile: cards ═══ */}
                <div className="ds-mobile-cards">
                  {recentOrders.slice(0, 8).map((o) => {
                    const isPaid = o.status === 'paid';
                    const isPending = o.status === 'pending';
                    const statusColor = isPaid ? theme.colors.success : isPending ? theme.colors.warning : theme.colors.danger;
                    const statusBg = isPaid ? theme.colors.successSoft : isPending ? theme.colors.warningSoft : theme.colors.dangerSoft;
                    const statusLabel = isPaid ? 'پرداخت شده' : isPending ? 'در انتظار' : 'ناموفق';

                    return (
                      <div key={o.id} style={S.mobileCard}>
                        <div style={S.mobileCardTop}>
                          <div style={S.mobileCardUser}>{o.user}</div>
                          <span style={{ ...S.pill, background: statusBg, color: statusColor }}>
                            <span style={{ ...S.pillDot, background: statusColor }} />
                            {statusLabel}
                          </span>
                        </div>
                        <div style={S.mobileCardRow}>
                          <span style={S.mobileCardLabel}>دوره</span>
                          <span style={S.mobileCardValue}>{o.package}</span>
                        </div>
                        <div style={S.mobileCardRow}>
                          <span style={S.mobileCardLabel}>مبلغ</span>
                          <span style={{ ...S.mobileCardValue, fontWeight: 700 }}>
                            {o.amount === 0 ? 'رایگان' : `${fmt(o.amount)} تومان`}
                          </span>
                        </div>
                        <div style={S.mobileCardRow}>
                          <span style={S.mobileCardLabel}>تاریخ</span>
                          <span style={{ ...S.mobileCardValue, color: theme.colors.textSubtle }}>
                            {formatJalali(o.date)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <EmptyState
                icon={FaInbox}
                title="هنوز سفارشی ثبت نشده"
                description="پس از اولین خرید کاربران، سفارش‌ها اینجا نمایش داده می‌شوند."
                ctaLabel="مشاهده تراکنش‌ها"
                ctaHref="/adminpanel/m1/admin/payments"
              />
            )}
          </div>
        </div>

        {/* ACTION QUEUE + SYSTEM HEALTH */}
        <div style={S.bottomGrid} className="ds-bottom-grid">
          <ActionQueueCard />
          <SystemHealthCard />
        </div>

      </div>
    </AdminLayout>
  );
}

// ═══════════════════════════════════════════════════════
// SPARKLINE
// ═══════════════════════════════════════════════════════
function Sparkline({ data, color }) {
  if (!data || data.length < 2) return null;

  const W = 100;
  const H = 24;
  const PAD = 2;

  const values = data.map((v) => Number(v) || 0);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  const points = values.map((v, i) => {
    const x = PAD + (i / (values.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((v - min) / range) * (H - PAD * 2);
    return { x, y };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${H} L ${points[0].x} ${H} Z`;
  const gradId = `spark-${color.replace('#', '')}`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', height: H, display: 'block' }}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="2.2" fill={color} />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════
// SKELETON
// ═══════════════════════════════════════════════════════
function DashboardSkeleton() {
  return (
    <div style={S.container}>
      <div style={S.pageHeader}>
        <div>
          <div style={{ ...S.skelBar, width: 120, height: 26 }} />
          <div style={{ ...S.skelBar, width: 200, height: 14, marginTop: 10 }} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ ...S.skelBar, width: 140, height: 38, borderRadius: 10 }} />
          <div style={{ ...S.skelBar, width: 90, height: 38, borderRadius: 10 }} />
          <div style={{ ...S.skelBar, width: 110, height: 38, borderRadius: 10 }} />
        </div>
      </div>

      <div style={S.kpiGrid} className="ds-kpi-grid">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={S.kpiCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ ...S.skelBar, width: 36, height: 36, borderRadius: 10 }} />
              <div style={{ ...S.skelBar, width: 48, height: 20, borderRadius: 999 }} />
            </div>
            <div style={{ ...S.skelBar, width: 70, height: 12, marginTop: 12 }} />
            <div style={{ ...S.skelBar, width: 140, height: 26, marginTop: 4 }} />
            <div style={{ ...S.skelBar, width: '100%', height: 24, marginTop: 10, borderRadius: 6 }} />
          </div>
        ))}
      </div>

      <div style={S.statusRow} className="ds-status-row">
        {[0, 1, 2].map((i) => (
          <div key={i} style={S.statusCard}>
            <div style={{ ...S.skelBar, width: 42, height: 42, borderRadius: 12 }} />
            <div style={{ flex: 1 }}>
              <div style={{ ...S.skelBar, width: 60, height: 22 }} />
              <div style={{ ...S.skelBar, width: 80, height: 12, marginTop: 6 }} />
            </div>
          </div>
        ))}
      </div>

      <div style={S.chartsGrid} className="ds-charts-grid">
        <div style={S.chartCard}>
          <div style={{ ...S.skelBar, width: 120, height: 16 }} />
          <div style={{ ...S.skelBar, width: 80, height: 12, marginTop: 8 }} />
          <div style={{ ...S.skelBar, width: '100%', height: 200, marginTop: 20, borderRadius: 10 }} />
        </div>
        <div style={S.chartCard}>
          <div style={{ ...S.skelBar, width: 140, height: 16 }} />
          <div style={{ ...S.skelBar, width: 80, height: 12, marginTop: 8 }} />
          <div style={{ marginTop: 20 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} style={{ ...S.skelBar, width: '100%', height: 40, marginBottom: 8, borderRadius: 10 }} />
            ))}
          </div>
        </div>
      </div>

      <div style={S.tableCard}>
        <div style={{ ...S.skelBar, width: 140, height: 16 }} />
        <div style={{ marginTop: 20 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={{ ...S.skelBar, width: '100%', height: 44, marginBottom: 6, borderRadius: 8 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// EMPTY STATE
// ═══════════════════════════════════════════════════════
function EmptyState({ icon: Icon = FaInbox, title, description, ctaLabel, ctaHref, onCta }) {
  return (
    <div style={S.empty}>
      <div style={S.emptyIconWrap}>
        <Icon size={22} color={theme.colors.textFaint} />
      </div>
      <h4 style={S.emptyTitle}>{title}</h4>
      {description && <p style={S.emptyDesc}>{description}</p>}
      {ctaLabel && ctaHref && (
        <Link to={ctaHref} style={S.emptyCta} className="ds-empty-cta">
          {ctaLabel}
        </Link>
      )}
      {ctaLabel && onCta && !ctaHref && (
        <button onClick={onCta} style={S.emptyCta} className="ds-empty-cta">
          {ctaLabel}
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN AREA CHART
// ═══════════════════════════════════════════════════════
function SimpleAreaChart({ data }) {
  const W = 640, H = 220;
  const PAD = { top: 20, right: 12, bottom: 30, left: 50 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const values = data.map((d) => d.revenue || 0);
  const maxV = Math.max(...values, 1);

  const points = data.map((d, i) => {
    const x = PAD.left + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
    const y = PAD.top + innerH - (d.revenue / maxV) * innerH;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${PAD.top + innerH} L ${points[0].x} ${PAD.top + innerH} Z`;

  const yTicks = 4;
  const yGridLines = Array.from({ length: yTicks + 1 }, (_, i) => {
    const y = PAD.top + (i / yTicks) * innerH;
    const val = Math.round(maxV - (i / yTicks) * maxV);
    return { y, val };
  });

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', height: 'auto', display: 'block' }}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={theme.colors.accent} stopOpacity="0.28" />
          <stop offset="60%" stopColor={theme.colors.accent} stopOpacity="0.06" />
          <stop offset="100%" stopColor={theme.colors.accent} stopOpacity="0" />
        </linearGradient>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={theme.colors.accent} />
          <stop offset="100%" stopColor="#7C5CE7" />
        </linearGradient>
      </defs>

      {yGridLines.map((g, i) => (
        <g key={i}>
          <line x1={PAD.left} x2={W - PAD.right} y1={g.y} y2={g.y}
            stroke={theme.colors.border} strokeDasharray="3 4" />
          <text x={PAD.left - 10} y={g.y + 3} textAnchor="end" fontSize="10"
            fill={theme.colors.textFaint} fontFamily="Vazirmatn">
            {fmtShort(g.val)}
          </text>
        </g>
      ))}

      <path d={areaPath} fill="url(#revGrad)" />
      <path d={linePath} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5"
        strokeLinejoin="round" strokeLinecap="round" />

      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="6" fill={theme.colors.accent} opacity="0.12" />
          <circle cx={p.x} cy={p.y} r="3.5" fill="#FFFFFF"
            stroke={theme.colors.accent} strokeWidth="2" />
        </g>
      ))}

      {points.map((p, i) => (
        <text key={i} x={p.x} y={H - 8} textAnchor="middle" fontSize="10"
          fill={theme.colors.textFaint} fontFamily="Vazirmatn">
          {typeof p.month === 'string' && p.month.includes('-')
            ? formatJalali(p.month, 'jMM/jDD')
            : p.month}
        </text>
      ))}
    </svg>
  );
}

const S = {
  container: {
    maxWidth: 1360, margin: '0 auto',
    display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0,
  },

  pageHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 4,
  },
  pageHeaderText: { minWidth: 0, flex: '1 1 auto' },
  headerActions: { display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' },

  titleRow: {
    display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
  },
  liveDot: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '3px 10px',
    background: theme.colors.successSoft,
    border: `1px solid ${theme.colors.success}30`,
    borderRadius: 999,
    fontSize: 11, fontWeight: 700,
    color: theme.colors.success,
    cursor: 'pointer',
    fontFamily: theme.font.family,
  },
  liveDotPulse: {
    width: 6, height: 6, borderRadius: '50%',
    background: theme.colors.success,
    boxShadow: `0 0 0 0 ${theme.colors.success}`,
    animation: 'ds-pulse 1.6s infinite',
  },
  liveDotLabel: {
    fontSize: 10.5, letterSpacing: '0.3px',
  },
  updatedText: {
    color: theme.colors.textFaint, fontWeight: 400,
    fontSize: 12, marginRight: 6,
  },

  rangeWrap: { position: 'relative' },
  rangeBtn: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '9px 14px',
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 10, fontSize: 12.5, fontWeight: 600,
    color: theme.colors.text, fontFamily: theme.font.family,
    cursor: 'pointer', whiteSpace: 'nowrap',
  },
  rangeMenu: {
    position: 'absolute', top: 'calc(100% + 6px)', left: 0,
    minWidth: 180,
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 12,
    boxShadow: theme.shadow.xl,
    padding: 6, zIndex: 500,
    animation: 'ds-fade-in 0.12s ease-out',
  },
  rangeMenuItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    width: '100%', padding: '9px 12px',
    background: 'transparent', border: 'none', borderRadius: 8,
    color: theme.colors.textMuted, fontSize: 12.5, fontWeight: 500,
    fontFamily: theme.font.family, cursor: 'pointer',
    textAlign: 'right', transition: 'background 0.12s',
  },
  rangeMenuItemActive: {
    background: theme.colors.accentSoft,
    color: theme.colors.accent, fontWeight: 700,
  },
  rangeCheck: {
    color: theme.colors.accent, fontWeight: 700, fontSize: 13,
  },

  btnPrimary: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '9px 16px',
    background: `linear-gradient(135deg, ${theme.colors.accent} 0%, #7C5CE7 100%)`,
    border: 'none', borderRadius: 10, fontSize: 12.5, fontWeight: 600,
    color: '#FFFFFF', textDecoration: 'none', fontFamily: theme.font.family,
    cursor: 'pointer', boxShadow: `0 4px 14px ${theme.colors.accentGlow}`,
    whiteSpace: 'nowrap',
  },

  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 14,
  },
  kpiCard: {
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 14, padding: 20,
    textDecoration: 'none', color: 'inherit',
    display: 'flex', flexDirection: 'column', gap: 12,
    cursor: 'pointer', boxShadow: theme.shadow.sm, minWidth: 0,
  },
  kpiTop: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', gap: 8,
  },
  kpiIconBox: {
    width: 36, height: 36, borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  kpiDelta: {
    display: 'inline-flex', alignItems: 'center', gap: 3,
    fontSize: 11, fontWeight: 700,
    padding: '3px 8px', borderRadius: 999, flexShrink: 0,
  },
  kpiLabel: {
    fontSize: 12, fontWeight: 500, color: theme.colors.textSubtle,
  },
  kpiValueRow: {
    display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap',
  },
  kpiValue: {
    fontSize: 26, fontWeight: 800,
    color: theme.colors.text, letterSpacing: '-0.8px',
    lineHeight: 1, fontVariantNumeric: 'tabular-nums',
  },
  kpiUnit: { fontSize: 12, color: theme.colors.textSubtle, fontWeight: 500 },

  sparkWrap: {
    marginTop: 4, marginBottom: -4,
    height: 24, overflow: 'hidden',
  },

  statusRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 14,
  },
  statusCard: {
    display: 'flex', alignItems: 'center', gap: 14,
    padding: 18, background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 14, boxShadow: theme.shadow.sm, minWidth: 0,
  },
  statusIconWrap: {
    width: 42, height: 42, borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  statusInfo: { flex: 1, minWidth: 0 },
  statusValue: {
    fontSize: 22, fontWeight: 800,
    color: theme.colors.text, lineHeight: 1.1,
    letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums',
  },
  statusLabel: {
    fontSize: 12, color: theme.colors.textSubtle,
    marginTop: 3, fontWeight: 500,
  },

  chartsGrid: {
    display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 14,
  },
  chartCard: {
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 14, padding: 22,
    boxShadow: theme.shadow.sm, minWidth: 0, overflow: 'hidden',
  },
  cardHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', gap: 8, marginBottom: 16, flexWrap: 'wrap',
  },
  cardHeaderText: { minWidth: 0 },
  cardTitle: {
    fontSize: 14.5, fontWeight: 700,
    color: theme.colors.text, margin: 0, letterSpacing: '-0.2px',
  },
  cardSub: {
    fontSize: 12, color: theme.colors.textSubtle,
    margin: '3px 0 0', fontWeight: 500,
  },
  cardBadge: {
    fontSize: 10.5, fontWeight: 700,
    color: theme.colors.accent, background: theme.colors.accentSoft,
    padding: '4px 10px', borderRadius: 999,
    textTransform: 'uppercase', letterSpacing: '0.4px',
    flexShrink: 0, whiteSpace: 'nowrap',
  },
  cardLink: {
    display: 'inline-flex', alignItems: 'center', gap: 2,
    fontSize: 12, color: theme.colors.accent,
    textDecoration: 'none', fontWeight: 600,
    flexShrink: 0, whiteSpace: 'nowrap',
  },

  topList: { display: 'flex', flexDirection: 'column', gap: 2 },
  topItem: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: 10, borderRadius: 10,
    transition: 'background 0.15s', minWidth: 0,
  },
  topRank: {
    width: 28, height: 28, borderRadius: 9,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11.5, fontWeight: 800, flexShrink: 0,
  },
  topInfo: { flex: 1, minWidth: 0 },
  topName: {
    fontSize: 13, fontWeight: 600, color: theme.colors.text,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  topMeta: {
    display: 'flex', alignItems: 'center', gap: 4,
    fontSize: 11, color: theme.colors.textSubtle, marginTop: 3,
  },
  topRevenue: {
    fontSize: 13, fontWeight: 700, color: theme.colors.text,
    fontVariantNumeric: 'tabular-nums', flexShrink: 0,
  },

  tableCard: {
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 14, boxShadow: theme.shadow.sm,
    overflow: 'hidden', padding: '22px 22px 6px', minWidth: 0,
  },
  tableWrap: {
    overflowX: 'auto', marginTop: 4,
    WebkitOverflowScrolling: 'touch',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: 'transparent' },
  th: {
    textAlign: 'right', padding: '10px 12px',
    fontSize: 10.5, fontWeight: 700, color: theme.colors.textFaint,
    textTransform: 'uppercase', letterSpacing: '0.5px',
    borderBottom: `1px solid ${theme.colors.border}`,
    whiteSpace: 'nowrap',
  },
  tr: {
    borderBottom: `1px solid ${theme.colors.borderSoft}`,
    transition: 'background 0.15s',
  },
  td: {
    padding: '14px 12px', fontSize: 13,
    color: theme.colors.text, fontFamily: theme.font.family,
    whiteSpace: 'nowrap',
  },
  pill: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '4px 10px', borderRadius: 999,
    fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
  },
  pillDot: { width: 6, height: 6, borderRadius: '50%', flexShrink: 0 },
  rowAction: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 28, height: 28, borderRadius: 8,
    background: theme.colors.surfaceAlt, color: theme.colors.textMuted,
    textDecoration: 'none', transition: 'all 0.15s',
  },

  mobileCard: {
    padding: 14,
    borderBottom: `1px solid ${theme.colors.borderSoft}`,
    background: theme.colors.surface,
  },
  mobileCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  mobileCardUser: {
    fontSize: 13.5,
    fontWeight: 700,
    color: theme.colors.text,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  mobileCardRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 8,
    padding: '4px 0',
  },
  mobileCardLabel: {
    fontSize: 12,
    color: theme.colors.textSubtle,
    fontWeight: 500,
  },
  mobileCardValue: {
    fontSize: 12.5,
    color: theme.colors.text,
    fontWeight: 500,
    textAlign: 'left',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '65%',
  },

  bottomGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 14,
  },

  empty: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    gap: 8, padding: '36px 20px', textAlign: 'center',
  },
  emptyIconWrap: {
    width: 48, height: 48, borderRadius: 14,
    background: theme.colors.surfaceAlt,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 14, fontWeight: 700, color: theme.colors.text, margin: 0,
  },
  emptyDesc: {
    fontSize: 12.5, color: theme.colors.textSubtle,
    margin: 0, maxWidth: 320, lineHeight: 1.6,
  },
  emptyCta: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    marginTop: 8, padding: '8px 16px',
    background: theme.colors.accentSoft, color: theme.colors.accent,
    borderRadius: 10, fontSize: 12.5, fontWeight: 600,
    textDecoration: 'none', fontFamily: theme.font.family,
    cursor: 'pointer', border: 'none',
  },

  skelBar: {
    background: 'linear-gradient(90deg, #EEF0F4 0%, #F7F8FA 50%, #EEF0F4 100%)',
    backgroundSize: '200% 100%',
    borderRadius: 6,
    animation: 'skeleton-pulse 1.4s ease-in-out infinite',
  },

  loading: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '60vh',
  },
};

if (typeof document !== 'undefined' && !document.getElementById('admin-dashboard-styles')) {
  const style = document.createElement('style');
  style.id = 'admin-dashboard-styles';
  style.textContent = `
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes skeleton-pulse {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    @keyframes ds-pulse {
      0%   { box-shadow: 0 0 0 0 rgba(16,185,129,0.55); }
      70%  { box-shadow: 0 0 0 8px rgba(16,185,129,0); }
      100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
    }
    @keyframes ds-fade-in {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .ds-card { transition: transform 0.18s ease, box-shadow 0.18s ease !important; }
    .ds-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 14px 30px -8px rgba(15,23,42,0.10), 0 4px 10px -4px rgba(15,23,42,0.05) !important;
    }
    .ds-card-static { transition: box-shadow 0.18s ease !important; }
    .ds-card-static:hover {
      box-shadow: 0 8px 24px -6px rgba(15,23,42,0.08), 0 2px 6px -2px rgba(15,23,42,0.04) !important;
    }
    .ds-btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 22px ${theme.colors.accentGlow} !important;
    }
    .ds-range-btn:hover { background: ${theme.colors.surfaceAlt} !important; }
    .ds-range-item:hover { background: ${theme.colors.surfaceAlt} !important; }
    .ds-live-dot:hover { filter: brightness(0.96); }
    .ds-row:hover { background: ${theme.colors.surfaceAlt}; }
    .ds-row:last-child { border-bottom: none; }
    .ds-row-action:hover {
      background: ${theme.colors.accentSoft} !important;
      color: ${theme.colors.accent} !important;
    }
    .ds-empty-cta:hover {
      background: ${theme.colors.accent} !important;
      color: #FFFFFF !important;
    }

    /* ══════════ MOBILE CARDS ══════════ */
    .ds-mobile-cards { display: none; }

    /* ══════════ RESPONSIVE ══════════ */
    @media (max-width: 1280px) {
      .ds-charts-grid { grid-template-columns: 1fr !important; }
    }
    @media (max-width: 1024px) {
      .ds-bottom-grid { grid-template-columns: 1fr !important; }
    }
    @media (max-width: 1023px) {
      .ds-kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
      .ds-status-row { grid-template-columns: repeat(3, 1fr) !important; }
    }
    @media (max-width: 768px) {
      .ds-page-header {
        flex-direction: column !important;
        align-items: stretch !important;
        gap: 12px !important;
      }
      .ds-header-actions { width: 100% !important; }
      .ds-header-actions > * {
        flex: 1 !important;
        justify-content: center !important;
      }
      .ds-status-row { grid-template-columns: 1fr !important; }

      .ds-desktop-table { display: none !important; }
      .ds-table-wrap { margin: 0 !important; padding: 0 !important; }
      .ds-mobile-cards { display: block !important; }
    }
    @media (max-width: 480px) {
      .ds-kpi-grid { grid-template-columns: 1fr !important; }
    }

    html, body { overflow-x: hidden; }
  `;
  document.head.appendChild(style);
}

export default AdminDashboard;
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchMyPackages } from '../features/packages/packageSlice';
import { motion } from 'framer-motion';
import {
  FaPlay, FaClock, FaUserGraduate, FaExternalLinkAlt,
  FaBookOpen, FaEye, FaGraduationCap, FaSync
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import PackageCover from '../components/PackageCover';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function MyPackages() {
  const dispatch = useDispatch();
  const { myPackages, loading, error } = useSelector((state) => state.packages);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) dispatch(fetchMyPackages());
  }, [dispatch, isAuthenticated]);

  const handleRefresh = () => {
    dispatch(fetchMyPackages());
    toast.info('لیست دوره‌ها بروزرسانی شد');
  };

  const handleOpenSpotPlayer = (spotToken) => {
    if (!spotToken) {
      toast.error('لینک اسپات پلیر موجود نیست');
      return;
    }
    window.open(`https://spotplayer.com/embed/${spotToken}`, '_blank');
  };

  // ===== کاربر لاگین نکرده =====
  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <div style={styles.authContainer}>
          <div style={styles.authCard} className="auth-card">
            <div style={styles.authIconWrapper}>
              <FaGraduationCap style={styles.authIcon} />
            </div>
            <h2 style={styles.authTitle} className="auth-title">لطفاً وارد شوید</h2>
            <p style={styles.authDesc}>برای مشاهده دوره‌های خود ابتدا وارد حساب کاربری شوید.</p>
            <Link to="/login" style={styles.authBtn} className="auth-btn">ورود به حساب</Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // ===== Loading =====
  if (loading) {
    return (
      <>
        <Navbar />
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>در حال بارگذاری دوره‌های شما...</p>
        </div>
        <Footer />
      </>
    );
  }

  // ===== Error =====
  if (error) {
    return (
      <>
        <Navbar />
        <div style={styles.error}>
          <h2 style={styles.errorTitle}>خطا در بارگذاری</h2>
          <button onClick={() => dispatch(fetchMyPackages())} style={styles.retryBtn} className="retry-btn">
            تلاش مجدد
          </button>
        </div>
        <Footer />
      </>
    );
  }

  const myPackagesList = Array.isArray(myPackages) ? myPackages : [];

  return (
    <>
      <Navbar />

      <div style={styles.pageContainer}>
        <div style={styles.content}>
          <div style={styles.container}>

            {/* ===== Header ===== */}
            <div style={styles.header} className="my-packages-header">
              <div style={styles.headerTextWrap}>
                <h1 style={styles.pageTitle} className="page-title">دوره‌های من</h1>
                <p style={styles.pageSubtitle} className="page-subtitle">
                  دوره‌هایی که خریداری کرده‌اید یا به کتابخانه خود اضافه کرده‌اید
                </p>
              </div>
              <button onClick={handleRefresh} style={styles.refreshBtn} className="refresh-btn">
                <FaSync /> بروزرسانی
              </button>
            </div>

            {/* ===== Empty ===== */}
            {myPackagesList.length === 0 ? (
              <div style={styles.empty} className="empty">
                <div style={styles.emptyIconWrapper}>
                  <FaBookOpen style={styles.emptyIcon} />
                </div>
                <h3 style={styles.emptyTitle} className="empty-title">شما هنوز هیچ دوره‌ای ندارید</h3>
                <p style={styles.emptyDesc}>برای شروع یادگیری، دوره‌های موجود را مشاهده کنید</p>
                <Link to="/packages" style={styles.browseBtn} className="browse-btn">
                  مشاهده دوره‌ها
                </Link>
              </div>
            ) : (
              /* ===== Grid ===== */
              <div style={styles.grid} className="my-packages-grid">
                {myPackagesList.map((item, index) => {
                  const packageId = item?.package?.id || item?.package_detail?.id;
                  const packageDetail = item.package_detail;
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -6 }}
                      style={styles.card}
                      className="my-package-card"
                    >
                      <Link to={`/package/${packageId}`} style={styles.cardLink}>
                        <div style={styles.imageWrap}>
                          <PackageCover
                            src={packageDetail?.image || packageDetail?.image_url}
                            alt={packageDetail?.title || 'دوره'}
                            size="medium"
                            rounded="none"
                          >
                            {packageDetail?.is_free && (
                              <span style={styles.freeBadge}>رایگان</span>
                            )}
                          </PackageCover>
                        </div>

                        <div style={styles.cardContent}>
                          <h3 style={styles.cardTitle} className="card-title">
                            {packageDetail?.title || 'بدون عنوان'}
                          </h3>

                          <div style={styles.cardMeta}>
                            <span style={styles.metaItem}>
                              <FaClock style={styles.metaIcon} />
                              {packageDetail?.duration || 0} دقیقه
                            </span>
                            <span style={styles.metaItem}>
                              <FaUserGraduate style={styles.metaIcon} />
                              {packageDetail?.video_count || 0} ویدیو
                            </span>
                          </div>

                          <div style={styles.purchaseInfo}>
                            {packageDetail?.is_free ? (
                              <span style={styles.freeLabel}>دوره رایگان</span>
                            ) : (
                              <span style={styles.purchaseDate}>
                                تاریخ خرید: {new Date(item.purchased_at).toLocaleDateString('fa-IR')}
                              </span>
                            )}
                          </div>

                          <div style={styles.viewBtn} className="view-btn">
                            <FaEye style={styles.viewIcon} />
                            مشاهده دوره
                          </div>
                        </div>
                      </Link>

                      {/* ===== Spot Player ===== */}
                      <div style={styles.spotSection}>
                        <button
                          onClick={() => handleOpenSpotPlayer(item.spot_token)}
                          style={styles.watchBtn}
                          className="watch-btn"
                        >
                          <FaPlay style={styles.watchIcon} />
                          تماشا در اسپات پلیر
                          <FaExternalLinkAlt style={styles.externalIcon} />
                        </button>

                        {item.spot_token && (
                          <div style={styles.spotInfo} className="spot-info">
                            <span style={styles.spotLabel}>لینک اختصاصی</span>
                            <code style={styles.spotCode} className="spot-code">{item.spot_token}</code>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

// ============================================
// STYLES (رنگ تیره جدید)
// ============================================
const styles = {
  pageContainer: { minHeight: '100vh', background: '#FFFFFF', fontFamily: 'Vazirmatn, sans-serif' },
  content: { padding: '100px 0 60px' },
  container: { maxWidth: '1240px', margin: '0 auto', padding: '0 24px' },

  // ===== Header =====
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    flexWrap: 'wrap', gap: '16px', marginBottom: '32px'
  },
  headerTextWrap: { display: 'flex', flexDirection: 'column', flex: 1, minWidth: '200px' },
  pageTitle: {
    fontSize: 'clamp(26px, 3vw, 34px)', fontWeight: '800',
    color: '#1A1A2E', letterSpacing: '-0.5px', margin: 0
  },
  pageSubtitle: { fontSize: '14px', color: 'rgba(26,26,46,0.5)', marginTop: '6px' },

  // ✅ دکمه بروزرسانی (hover تیره)
  refreshBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '12px 24px', background: '#F5F3FF',
    border: '1.5px solid rgba(124,58,237,0.1)', borderRadius: '14px',
    color: '#7C3AED', cursor: 'pointer', fontSize: '14px',
    fontWeight: '600', fontFamily: 'Vazirmatn, sans-serif',
    transition: 'background 0.3s ease, color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
    whiteSpace: 'nowrap', flexShrink: 0
  },

  // ===== Auth =====
  authContainer: {
    minHeight: '80vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '100px 24px', background: '#FFFFFF'
  },
  authCard: {
    maxWidth: '440px', width: '100%', textAlign: 'center',
    padding: '48px 32px', background: '#FFFFFF', borderRadius: '24px',
    boxShadow: '0 4px 24px rgba(124,58,237,0.08)',
    border: '1px solid rgba(124,58,237,0.08)'
  },

  // ✅ آیکون Auth - تیره
  authIconWrapper: {
    width: '80px', height: '80px', borderRadius: '20px',
    background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 24px',
    boxShadow: '0 8px 24px rgba(45,21,64,0.4)',
    border: '1px solid rgba(168,85,247,0.25)'
  },
  authIcon: { fontSize: '32px', color: '#FFFFFF' },
  authTitle: { fontSize: '22px', fontWeight: '800', color: '#1A1A2E', marginBottom: '8px' },
  authDesc: { fontSize: '14px', color: 'rgba(26,26,46,0.5)', marginBottom: '24px', lineHeight: '1.7' },

  // ✅ دکمه ورود - تیره
  authBtn: {
    display: 'inline-block', padding: '14px 40px',
    background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
    color: 'white', borderRadius: '50px', textDecoration: 'none',
    fontWeight: '700', fontSize: '14px',
    boxShadow: '0 8px 24px rgba(45,21,64,0.4)',
    border: '1px solid rgba(168,85,247,0.25)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
  },

  // ===== Loading / Error =====
  loading: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '60vh', gap: '16px', background: '#FFFFFF'
  },
  spinner: {
    width: '40px', height: '40px',
    border: '2px solid rgba(124,58,237,0.1)',
    borderTop: '2px solid #7C3AED', borderRadius: '50%',
    animation: 'spin 0.8s linear infinite'
  },
  loadingText: { color: 'rgba(26,26,46,0.4)', fontSize: '14px' },

  error: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '60vh', gap: '16px', background: '#FFFFFF'
  },
  errorTitle: { color: '#7C3AED', fontSize: '20px', fontWeight: '700' },

  // ✅ دکمه تلاش مجدد - تیره
  retryBtn: {
    padding: '12px 32px',
    background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
    color: '#FFFFFF',
    border: '1px solid rgba(168,85,247,0.2)',
    borderRadius: '50px',
    cursor: 'pointer', fontSize: '14px', fontWeight: '600',
    fontFamily: 'Vazirmatn, sans-serif',
    boxShadow: '0 4px 16px rgba(45,21,64,0.35)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
  },

  // ===== Empty =====
  empty: {
    textAlign: 'center', padding: '80px 20px',
    background: '#FAFAFC', borderRadius: '24px',
    border: '1px solid rgba(124,58,237,0.08)'
  },
  emptyIconWrapper: {
    width: '80px', height: '80px', borderRadius: '50%',
    background: 'rgba(124,58,237,0.08)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
  },
  emptyIcon: { fontSize: '32px', color: '#7C3AED' },
  emptyTitle: { fontSize: '20px', fontWeight: '800', color: '#1A1A2E', marginBottom: '8px' },
  emptyDesc: { fontSize: '14px', color: 'rgba(26,26,46,0.4)', marginBottom: '24px' },

  // ✅ دکمه مشاهده دوره‌ها (Empty) - تیره
  browseBtn: {
    display: 'inline-block', padding: '14px 40px',
    background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
    color: 'white', borderRadius: '50px', textDecoration: 'none',
    fontWeight: '700', fontSize: '14px',
    boxShadow: '0 8px 24px rgba(45,21,64,0.4)',
    border: '1px solid rgba(168,85,247,0.25)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
  },

  // ===== Grid =====
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px'
  },

  // ===== Card =====
  card: {
    background: '#FFFFFF', borderRadius: '20px',
    overflow: 'hidden', boxShadow: '0 4px 24px rgba(124,58,237,0.06)',
    border: '1px solid rgba(124,58,237,0.08)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease'
  },
  cardLink: { display: 'block', textDecoration: 'none', color: 'inherit' },
  imageWrap: { position: 'relative', overflow: 'hidden', backgroundColor: '#F5F3FF' },
  freeBadge: {
    position: 'absolute', top: '12px', right: '12px',
    background: 'linear-gradient(135deg, #34D399, #10B981)',
    color: '#FFFFFF', padding: '6px 14px', borderRadius: '50px',
    fontSize: '12px', fontWeight: '700',
    boxShadow: '0 4px 12px rgba(16,185,129,0.4)', zIndex: 2
  },

  // ===== Card Content =====
  cardContent: { padding: '18px' },
  cardTitle: {
    fontSize: '16px', fontWeight: '700', color: '#1A1A2E',
    marginBottom: '12px', lineHeight: '1.4',
    display: '-webkit-box', WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '44px'
  },
  cardMeta: { display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '12px' },
  metaItem: {
    display: 'flex', alignItems: 'center', gap: '5px',
    fontSize: '12px', color: 'rgba(26,26,46,0.5)', fontWeight: '500'
  },
  metaIcon: { fontSize: '13px', color: '#7C3AED' },

  purchaseInfo: {
    marginBottom: '14px', paddingTop: '10px',
    borderTop: '1px solid rgba(124,58,237,0.06)'
  },
  purchaseDate: { fontSize: '12px', color: 'rgba(26,26,46,0.5)' },
  freeLabel: { fontSize: '12px', color: '#10B981', fontWeight: '700' },

  // ✅ دکمه مشاهده دوره (در کارت) - hover تیره
  viewBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '8px', padding: '10px', background: 'rgba(124,58,237,0.06)',
    border: '1px solid rgba(124,58,237,0.1)', borderRadius: '10px',
    color: '#7C3AED', fontSize: '13px', fontWeight: '700',
    transition: 'background 0.3s ease, color 0.3s ease, border-color 0.3s ease'
  },
  viewIcon: { fontSize: '13px' },

  // ===== Spot Section =====
  spotSection: {
    padding: '0 18px 18px', paddingTop: '12px',
    borderTop: '1px solid rgba(124,58,237,0.06)'
  },

  // ✅ دکمه تماشا در اسپات پلیر - تیره
  watchBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '8px', width: '100%', padding: '12px',
    background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
    color: 'white',
    border: '1px solid rgba(168,85,247,0.2)',
    borderRadius: '12px',
    fontSize: '14px', fontWeight: '700', cursor: 'pointer',
    fontFamily: 'Vazirmatn, sans-serif',
    boxShadow: '0 4px 16px rgba(45,21,64,0.35)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease, border-color 0.3s ease'
  },
  watchIcon: { fontSize: '14px' },
  externalIcon: { fontSize: '11px' },

  spotInfo: {
    marginTop: '10px', padding: '8px 12px',
    background: '#FAFAFC', borderRadius: '8px',
    display: 'flex', alignItems: 'center', gap: '8px',
    flexWrap: 'wrap', border: '1px solid rgba(124,58,237,0.06)'
  },
  spotLabel: { fontSize: '11px', color: 'rgba(26,26,46,0.4)' },
  spotCode: {
    fontSize: '11px', color: '#7C3AED',
    background: 'rgba(124,58,237,0.08)',
    padding: '2px 8px', borderRadius: '4px',
    fontFamily: 'monospace', wordBreak: 'break-all'
  },
};

// ===== CSS (با Responsive کامل) =====
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

  /* ===== Refresh Button - hover تیره ===== */
  .refresh-btn:hover {
    background: linear-gradient(135deg, #2D1540 0%, #1A0828 100%) !important;
    color: #FFFFFF !important;
    border-color: rgba(168,85,247,0.5) !important;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(45,21,64,0.4);
  }

  /* ===== Auth Button - hover تیره ===== */
  .auth-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(45,21,64,0.5);
    border-color: rgba(168,85,247,0.5) !important;
    background: linear-gradient(135deg, #3D1E57 0%, #2D1540 100%) !important;
  }

  /* ===== Retry Button - hover تیره ===== */
  .retry-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(45,21,64,0.5);
    border-color: rgba(168,85,247,0.5) !important;
    background: linear-gradient(135deg, #3D1E57 0%, #2D1540 100%) !important;
  }

  /* ===== Browse Button - hover تیره ===== */
  .browse-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(45,21,64,0.5);
    border-color: rgba(168,85,247,0.5) !important;
    background: linear-gradient(135deg, #3D1E57 0%, #2D1540 100%) !important;
  }

  /* ===== Card Hover ===== */
  .my-package-card:hover {
    transform: translate3d(0, -8px, 0) !important;
    box-shadow: 0 12px 40px rgba(124,58,237,0.15) !important;
    border-color: rgba(168,85,247,0.3) !important;
  }

  /* ===== View Button Hover - ملایم ===== */
.view-btn:hover {
  background: #F5F5F7 !important;
  border-color: rgba(124,58,237,0.2) !important;
  color: #7C3AED !important;
}

  /* ===== Watch Button Hover - تیره ===== */
  .watch-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(45,21,64,0.5) !important;
    border-color: rgba(168,85,247,0.5) !important;
    background: linear-gradient(135deg, #3D1E57 0%, #2D1540 100%) !important;
  }

  /* ===== Responsive ===== */
  @media (max-width: 1024px) {
    .my-packages-header { gap: 12px !important; }
  }

  @media (max-width: 768px) {
    .my-packages-header {
      flex-direction: column !important;
      align-items: stretch !important;
    }
    .refresh-btn {
      width: 100% !important;
      justify-content: center !important;
    }
    .my-packages-grid {
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)) !important;
      gap: 18px !important;
    }
    .spot-info {
      flex-direction: column !important;
      align-items: flex-start !important;
    }
    .spot-code {
      width: 100% !important;
      word-break: break-all !important;
    }
  }

  @media (max-width: 480px) {
    .my-packages-grid {
      grid-template-columns: 1fr !important;
      gap: 16px !important;
    }
    .card-title { font-size: 14px !important; }
    .watch-btn {
      font-size: 13px !important;
      padding: 11px !important;
    }
    .auth-card { padding: 32px 20px !important; }
    .auth-title { font-size: 19px !important; }
    .empty { padding: 50px 16px !important; }
    .empty-title { font-size: 17px !important; }
    .page-title { font-size: 22px !important; }
    .page-subtitle { font-size: 13px !important; }
  }
`;
document.head.appendChild(styleSheet);

export default MyPackages;
import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchPackages } from '../features/packages/packageSlice';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaSearch, FaClock, FaStar, FaFilter, FaTimes,
  FaArrowLeft, FaChevronDown, FaChevronRight, FaChevronLeft,
  FaTag, FaFire, FaGift
} from 'react-icons/fa';
import PackageCover from '../components/PackageCover';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// ===== تعداد آیتم در هر صفحه =====
const ITEMS_PER_PAGE = 8;

function PackagesPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: packages, loading, error } = useSelector((state) => state.packages);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => { dispatch(fetchPackages()); }, [dispatch]);

  // ===== فیلتر =====
  const filteredPackages = useMemo(() => {
    let result = packages || [];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(pkg =>
        pkg.title?.toLowerCase().includes(term) ||
        pkg.description?.toLowerCase().includes(term)
      );
    }
    if (filterType === 'free') result = result.filter(pkg => pkg.is_free);
    else if (filterType === 'paid') result = result.filter(pkg => !pkg.is_free);
    else if (filterType === 'discount') result = result.filter(pkg => pkg.has_discount);
    else if (filterType === 'top') result = result.filter(pkg => pkg.is_top);
    return result;
  }, [packages, searchTerm, filterType]);

  // ===== صفحه‌بندی =====
  const totalPages = Math.ceil(filteredPackages.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedPackages = filteredPackages.slice(startIndex, endIndex);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterType]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [currentPage]);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>در حال بارگذاری دوره‌ها...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div style={styles.error}>
          <h2 style={styles.errorTitle}>خطا در بارگذاری</h2>
          <button onClick={() => dispatch(fetchPackages())} style={styles.retryBtn} className="retry-btn">
            تلاش مجدد
          </button>
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
            <div style={styles.header}>
              <div style={styles.headerTop} className="header-top">
                <button onClick={() => navigate(-1)} style={styles.backBtn} className="back-btn" aria-label="بازگشت">
                  <FaArrowLeft style={styles.backIcon} />
                </button>
                <div style={styles.headerTextWrap} className="header-text-wrap">
                  <h1 style={styles.pageTitle} className="page-title">همه دوره‌ها</h1>
                  <p style={styles.pageSubtitle} className="page-subtitle">بهترین دوره‌های آموزشی هوش مصنوعی و امور اینترنتی</p>
                </div>
                <span style={styles.totalCount} className="total-count">{filteredPackages.length} دوره</span>
              </div>
            </div>

            {/* ===== Search & Filter ===== */}
            <div style={styles.searchSection} className="search-section">
              <div style={styles.searchWrapper}>
                <FaSearch style={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="جستجوی دوره‌ها..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchInput}
                  className="search-input"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} style={styles.clearBtn} className="clear-btn" aria-label="پاک کردن">
                    <FaTimes />
                  </button>
                )}
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                style={styles.filterToggle}
                className="filter-toggle"
              >
                <FaFilter />
                <span>فیلتر</span>
                <FaChevronDown
                  style={{
                    ...styles.filterArrow,
                    transform: showFilters ? 'rotate(180deg)' : 'rotate(0)'
                  }}
                />
              </button>
            </div>

            {/* ===== Filters Panel ===== */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  style={styles.filtersPanel}
                  className="filters-panel"
                >
                  {[
                    { key: 'all', label: 'همه' },
                    { key: 'free', label: 'رایگان', icon: <FaGift /> },
                    { key: 'discount', label: 'تخفیف‌دار', icon: <FaFire /> },
                    { key: 'top', label: 'برترین‌ها', icon: <FaStar /> },
                  ].map(f => (
                    <button
                      key={f.key}
                      onClick={() => setFilterType(f.key)}
                      style={{
                        ...styles.filterBtn,
                        ...(filterType === f.key ? styles.filterBtnActive : {})
                      }}
                      className={filterType === f.key ? 'filter-btn filter-btn-active' : 'filter-btn'}
                    >
                      {f.icon} {f.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ===== Results ===== */}
            {paginatedPackages.length === 0 ? (
              <div style={styles.empty} className="empty">
                <div style={styles.emptyIconWrapper}>
                  <FaSearch style={styles.emptyIcon} />
                </div>
                <h3 style={styles.emptyTitle} className="empty-title">دوره‌ای یافت نشد</h3>
                <p style={styles.emptyDesc}>
                  {searchTerm ? `نتیجه‌ای برای "${searchTerm}" پیدا نشد` : 'هنوز دوره‌ای وجود ندارد'}
                </p>
                {(searchTerm || filterType !== 'all') && (
                  <button
                    onClick={() => { setSearchTerm(''); setFilterType('all'); }}
                    style={styles.emptyBtn}
                    className="empty-btn"
                  >
                    پاک کردن فیلترها
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* ===== Grid ===== */}
                <div style={styles.grid} className="grid">
                  {paginatedPackages.map((pkg, index) => {
                    const discountPercent = pkg.has_discount && pkg.price > 0
                      ? Math.round((1 - pkg.discounted_price / pkg.price) * 100)
                      : 0;
                    const originalPrice = parseFloat(pkg.price || 0).toLocaleString('fa-IR');
                    const finalPrice = pkg.has_discount
                      ? parseFloat(pkg.discounted_price).toLocaleString('fa-IR')
                      : originalPrice;
                    const categoryName = pkg.categories?.[0]?.name || pkg.category || 'دوره آموزشی';

                    return (
                      <motion.div
                        key={pkg.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -8 }}
                        style={styles.card}
                        className="package-card"
                        onClick={() => navigate(`/package/${pkg.id}`)}
                        role="button"
                        tabIndex={0}
                      >
                        <div style={styles.cardImageWrap}>
                          <PackageCover
                            src={pkg.image || pkg.image_url}
                            alt={pkg.title}
                            size="medium"
                            rounded="none"
                          />

                          {pkg.has_discount && discountPercent > 0 && (
                            <div style={styles.discountBadge}>
                              <FaFire /> {discountPercent}%
                            </div>
                          )}
                          {pkg.is_free && (
                            <div style={styles.freeBadge}>
                              <FaGift /> رایگان
                            </div>
                          )}
                          {pkg.is_top && !pkg.has_discount && !pkg.is_free && (
                            <div style={styles.topBadge}>
                              <FaStar /> برترین
                            </div>
                          )}
                        </div>

                        <div style={styles.cardBody}>
                          <h3 style={styles.cardTitle} className="card-title">{pkg.title}</h3>

                          <div style={styles.cardMetaRow}>
                            <span style={styles.cardCategory}>
                              <FaTag /> {categoryName}
                            </span>
                            {pkg.duration && (
                              <span style={styles.cardDuration}>
                                <FaClock /> {pkg.duration}
                              </span>
                            )}
                          </div>

                          <div style={styles.priceSection}>
                            {pkg.is_free ? (
                              <div style={styles.freePrice}>رایگان</div>
                            ) : pkg.has_discount && discountPercent ? (
                              <div style={styles.discountLayout}>
                                <div style={styles.discountRight}>
                                  <span style={styles.oldPrice}>{originalPrice}</span>
                                  <span style={styles.discountBadgeSmall}>{discountPercent}%</span>
                                </div>
                                <div style={styles.newPrice}>
                                  {finalPrice} <span style={styles.currency}>تومان</span>
                                </div>
                              </div>
                            ) : (
                              <div style={styles.newPrice}>
                                {finalPrice} <span style={styles.currency}>تومان</span>
                              </div>
                            )}
                          </div>

                          <Link
                            to={`/package/${pkg.id}`}
                            style={pkg.is_free ? styles.cardBtnFree : styles.cardBtn}
                            className={pkg.is_free ? 'card-btn-free' : 'card-btn'}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {pkg.is_free ? 'مشاهده' : 'مشاهده و خرید'}
                          </Link>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* ===== Pagination ===== */}
                {totalPages > 1 && (
                  <div style={styles.paginationWrap} className="pagination-wrap">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      style={{
                        ...styles.pageNavBtn,
                        ...(currentPage === 1 ? styles.pageNavBtnDisabled : {})
                      }}
                      className={currentPage === 1 ? 'page-nav-btn disabled' : 'page-nav-btn'}
                      aria-label="قبلی"
                    >
                      <FaChevronRight size={14} />
                    </button>

                    <div style={styles.pageNumbers} className="page-numbers">
                      {getPageNumbers().map((page, idx) => (
                        page === '...' ? (
                          <span key={`ellipsis-${idx}`} style={styles.ellipsis} className="ellipsis">...</span>
                        ) : (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            style={{
                              ...styles.pageNumberBtn,
                              ...(currentPage === page ? styles.pageNumberBtnActive : {})
                            }}
                            className={currentPage === page ? 'page-number-btn active' : 'page-number-btn'}
                          >
                            {page.toLocaleString('fa-IR')}
                          </button>
                        )
                      ))}
                    </div>

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      style={{
                        ...styles.pageNavBtn,
                        ...(currentPage === totalPages ? styles.pageNavBtnDisabled : {})
                      }}
                      className={currentPage === totalPages ? 'page-nav-btn disabled' : 'page-nav-btn'}
                      aria-label="بعدی"
                    >
                      <FaChevronLeft size={14} />
                    </button>
                  </div>
                )}

                {totalPages > 1 && (
                  <p style={styles.pageInfo} className="page-info">
                    نمایش {startIndex + 1} تا {Math.min(endIndex, filteredPackages.length)} از {filteredPackages.length} دوره
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

// ============================================
// STYLES
// ============================================
const styles = {
  pageContainer: { minHeight: '100vh', background: '#FFFFFF', fontFamily: 'Vazirmatn, sans-serif' },
  content: { padding: '100px 0 60px' },
  container: { maxWidth: '1240px', margin: '0 auto', padding: '0 24px' },

  // ===== Header =====
  header: { marginBottom: '32px' },
  headerTop: { display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' },
  backBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '46px', height: '46px', borderRadius: '50%',
    background: '#F5F3FF', border: '1px solid rgba(124,58,237,0.1)',
    color: '#7C3AED', cursor: 'pointer', fontSize: '16px',
    transition: 'background 0.3s ease, transform 0.3s ease, color 0.3s ease',
    flexShrink: 0
  },
  backIcon: { fontSize: '16px' },
  headerTextWrap: { display: 'flex', flexDirection: 'column', flex: 1, minWidth: '200px' },
  pageTitle: {
    fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: '800',
    color: '#1A1A2E', letterSpacing: '-0.5px', margin: 0
  },
  pageSubtitle: { fontSize: '14px', color: 'rgba(26,26,46,0.4)', marginTop: '4px' },
  totalCount: {
    fontSize: '13px', color: '#7C3AED', fontWeight: '700',
    background: 'rgba(124,58,237,0.08)', padding: '8px 18px',
    borderRadius: '50px', marginRight: 'auto'
  },

  // ===== Search & Filter =====
  searchSection: { display: 'flex', gap: '12px', marginBottom: '20px' },
  searchWrapper: { position: 'relative', flex: 1 },
  searchIcon: {
    position: 'absolute', right: '18px', top: '50%',
    transform: 'translateY(-50%)', color: 'rgba(26,26,46,0.3)',
    fontSize: '16px', pointerEvents: 'none'
  },
  searchInput: {
    width: '100%', padding: '16px 50px 16px 18px',
    background: '#FFFFFF', border: '1.5px solid rgba(124,58,237,0.1)',
    borderRadius: '14px', fontSize: '15px', color: '#1A1A2E',
    fontFamily: 'Vazirmatn, sans-serif', outline: 'none',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease'
  },
  clearBtn: {
    position: 'absolute', left: '14px', top: '50%',
    transform: 'translateY(-50%)', background: 'none',
    border: 'none', color: 'rgba(26,26,46,0.3)', cursor: 'pointer',
    fontSize: '14px', padding: '6px', borderRadius: '50%',
    transition: 'color 0.3s ease, background 0.3s ease'
  },
  filterToggle: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '16px 24px', background: '#FFFFFF',
    border: '1.5px solid rgba(124,58,237,0.1)', borderRadius: '14px',
    color: '#1A1A2E', cursor: 'pointer', fontSize: '14px',
    fontWeight: '600', fontFamily: 'Vazirmatn, sans-serif',
    transition: 'background 0.3s ease, border-color 0.3s ease',
    whiteSpace: 'nowrap'
  },
  filterArrow: { fontSize: '12px', transition: 'transform 0.3s ease' },

  // ===== Filters Panel =====
  filtersPanel: {
    display: 'flex', gap: '10px', flexWrap: 'wrap',
    marginBottom: '28px', padding: '16px',
    background: '#FAFAFC', borderRadius: '16px',
    border: '1px solid rgba(124,58,237,0.08)'
  },
  filterBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '10px 20px', background: '#FFFFFF',
    border: '1.5px solid rgba(124,58,237,0.1)',
    borderRadius: '50px', color: 'rgba(26,26,46,0.5)',
    cursor: 'pointer', fontSize: '13px', fontWeight: '600',
    fontFamily: 'Vazirmatn, sans-serif',
    transition: 'background 0.3s ease, color 0.3s ease, border-color 0.3s ease'
  },
  filterBtnActive: {
    background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
    color: '#FFFFFF',
    border: '1px solid rgba(168,85,247,0.25)',
    boxShadow: '0 4px 16px rgba(45,21,64,0.35)'
  },

  // ===== Empty =====
  empty: {
    textAlign: 'center', padding: '80px 20px',
    background: '#FAFAFC', borderRadius: '24px',
    border: '1px solid rgba(124,58,237,0.08)'
  },
  emptyIconWrapper: {
    width: '80px', height: '80px', borderRadius: '50%',
    background: 'rgba(124,58,237,0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 20px'
  },
  emptyIcon: { fontSize: '32px', color: '#7C3AED' },
  emptyTitle: {
    fontSize: '20px', fontWeight: '800', color: '#1A1A2E',
    marginBottom: '8px'
  },
  emptyDesc: {
    fontSize: '14px', color: 'rgba(26,26,46,0.4)',
    marginBottom: '20px'
  },
  emptyBtn: {
    padding: '12px 28px',
    background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
    color: 'white', borderRadius: '50px',
    cursor: 'pointer', fontSize: '14px', fontWeight: '700',
    fontFamily: 'Vazirmatn, sans-serif',
    boxShadow: '0 8px 24px rgba(45,21,64,0.35)',
    border: '1px solid rgba(168,85,247,0.25)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
  },

  // ===== Grid =====
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px'
  },

  // ===== Card =====
  card: {
    background: '#FFFFFF', borderRadius: '20px',
    overflow: 'hidden', boxShadow: '0 4px 24px rgba(124,58,237,0.06)',
    border: '1px solid rgba(124,58,237,0.08)',
    cursor: 'pointer',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease'
  },
  cardImageWrap: {
    position: 'relative', overflow: 'hidden',
    backgroundColor: '#F5F3FF'
  },
  discountBadge: {
  position: 'absolute', top: '10px', right: '10px',
  display: 'flex', alignItems: 'center', gap: '4px',
  background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
  color: '#FFFFFF', padding: '4px 10px', borderRadius: '50px',
  fontSize: '11px', fontWeight: '800',
  boxShadow: '0 2px 8px rgba(45,21,64,0.5), 0 0 0 1px rgba(239, 68, 68, 0.5)',  /* ← هایلایت قرمز کم */
  border: '1px solid rgba(239, 68, 68, 0.3)',  /* ← بوردر قرمز خیلی کم */
  zIndex: 2
},
  freeBadge: {
    position: 'absolute', top: '12px', right: '12px',
    display: 'flex', alignItems: 'center', gap: '4px',
    background: 'linear-gradient(135deg, #34D399, #10B981)',
    color: '#FFFFFF', padding: '6px 12px', borderRadius: '50px',
    fontSize: '12px', fontWeight: '700',
    boxShadow: '0 4px 12px rgba(16,185,129,0.4)', zIndex: 2
  },
  topBadge: {
    position: 'absolute', top: '12px', right: '12px',
    display: 'flex', alignItems: 'center', gap: '4px',
    background: 'linear-gradient(135deg, #FBBF24, #F59E0B)',
    color: '#1A1A2E', padding: '6px 12px', borderRadius: '50px',
    fontSize: '12px', fontWeight: '700',
    boxShadow: '0 4px 12px rgba(251,191,36,0.4)', zIndex: 2
  },

  // ===== Card Body =====
  cardBody: { padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: '10px' },
  cardTitle: {
    fontSize: '15px', fontWeight: '700', color: '#1A1A2E',
    lineHeight: '1.4', display: '-webkit-box',
    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
    overflow: 'hidden', margin: 0, minHeight: '42px'
  },
  cardMetaRow: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', gap: '8px'
  },
  cardCategory: {
    display: 'flex', alignItems: 'center', gap: '4px',
    fontSize: '11px', color: '#7C3AED', fontWeight: '600',
    background: 'rgba(124,58,237,0.08)',
    padding: '4px 10px', borderRadius: '50px'
  },
  cardDuration: {
    display: 'flex', alignItems: 'center', gap: '4px',
    fontSize: '11px', color: 'rgba(26,26,46,0.5)', fontWeight: '500'
  },

  // ===== Price =====
  priceSection: {
    minHeight: '44px', display: 'flex', flexDirection: 'column',
    justifyContent: 'flex-end', paddingTop: '8px',
    borderTop: '1px solid rgba(0,0,0,0.04)'
  },
  discountLayout: { display: 'flex', flexDirection: 'column', gap: '4px' },
  discountRight: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'flex-end', gap: '6px'
  },
  discountBadgeSmall: {
    background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
    color: '#FFFFFF',
    padding: '2px 8px', borderRadius: '6px',
    fontSize: '11px', fontWeight: '800',
    border: '1px solid rgba(168,85,247,0.3)'
  },
  oldPrice: {
    fontSize: '12px', color: '#9E9E9E',
    textDecoration: 'line-through',
    textDecorationColor: 'rgba(168,85,247,0.5)',
    textDecorationThickness: '2px', fontWeight: '500'
  },
  newPrice: { fontSize: '18px', fontWeight: '800', color: '#1A1A2E', textAlign: 'left' },
  currency: { fontSize: '12px', color: 'rgba(26,26,46,0.5)', fontWeight: '500' },
  freePrice: { fontSize: '18px', fontWeight: '800', color: '#10B981' },

  // ===== Card Buttons =====
  cardBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '12px', borderRadius: '12px',
    background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
    color: '#FFFFFF', fontSize: '14px', fontWeight: '700',
    textDecoration: 'none', fontFamily: 'Vazirmatn, sans-serif',
    boxShadow: '0 4px 16px rgba(45,21,64,0.35)',
    border: '1px solid rgba(168,85,247,0.2)',
    transition: 'box-shadow 0.3s ease, transform 0.3s ease'
  },
  cardBtnFree: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '12px', borderRadius: '12px',
    background: 'linear-gradient(135deg, #34D399, #10B981)',
    color: '#FFFFFF', fontSize: '14px', fontWeight: '700',
    textDecoration: 'none', fontFamily: 'Vazirmatn, sans-serif',
    boxShadow: '0 4px 16px rgba(16,185,129,0.25)',
    transition: 'box-shadow 0.3s ease'
  },

  // ===== Pagination =====
  paginationWrap: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '8px', marginTop: '48px', marginBottom: '16px', flexWrap: 'wrap'
  },
  pageNavBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '44px', height: '44px', borderRadius: '12px',
    background: '#FFFFFF', border: '1.5px solid rgba(124,58,237,0.15)',
    color: '#7C3AED', cursor: 'pointer', fontSize: '14px',
    transition: 'all 0.3s ease', fontFamily: 'Vazirmatn, sans-serif',
    flexShrink: 0
  },
  pageNavBtnDisabled: { opacity: 0.4, cursor: 'not-allowed' },
  pageNumbers: {
    display: 'flex', alignItems: 'center', gap: '6px',
    flexWrap: 'wrap', justifyContent: 'center'
  },
  pageNumberBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minWidth: '44px', height: '44px', padding: '0 12px',
    borderRadius: '12px', background: '#FFFFFF',
    border: '1.5px solid rgba(124,58,237,0.15)',
    color: '#1A1A2E', cursor: 'pointer', fontSize: '14px',
    fontWeight: '700', transition: 'all 0.3s ease',
    fontFamily: 'Vazirmatn, sans-serif'
  },
  pageNumberBtnActive: {
    background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
    color: '#FFFFFF', borderColor: 'transparent',
    boxShadow: '0 8px 24px rgba(45,21,64,0.4)',
    transform: 'scale(1.05)',
    border: '1px solid rgba(168,85,247,0.25)'
  },
  ellipsis: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minWidth: '32px', height: '44px',
    color: 'rgba(26,26,46,0.4)', fontSize: '14px',
    fontWeight: '700', userSelect: 'none'
  },
  pageInfo: {
    textAlign: 'center', fontSize: '13px',
    color: 'rgba(26,26,46,0.5)', marginTop: '16px', fontWeight: '500'
  },

  // ===== Loading / Error =====
  loading: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '60vh', gap: '16px', background: '#FFFFFF'
  },
  spinner: {
    width: '40px', height: '40px',
    border: '2px solid rgba(124,58,237,0.1)',
    borderTop: '2px solid #7C3AED',
    borderRadius: '50%', animation: 'spin 0.8s linear infinite'
  },
  loadingText: { color: 'rgba(26,26,46,0.4)', fontSize: '14px' },
  error: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '60vh', gap: '16px', background: '#FFFFFF'
  },
  errorTitle: { color: '#7C3AED', fontSize: '20px', fontWeight: '700' },
  retryBtn: {
    padding: '12px 28px',
    background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
    color: '#FFFFFF', border: '1px solid rgba(168,85,247,0.2)',
    borderRadius: '50px',
    cursor: 'pointer', fontSize: '14px', fontWeight: '600',
    fontFamily: 'Vazirmatn, sans-serif',
    boxShadow: '0 4px 16px rgba(45,21,64,0.35)'
  },
};

// ===== CSS (با Responsive کامل) =====
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

  /* ===== Back button ===== */
  .back-btn:hover {
    background: #7C3AED !important;
    color: #FFFFFF !important;
    transform: translateX(4px);
  }

  /* ===== Search input focus ===== */
  .search-input:focus {
    border-color: rgba(124,58,237,0.3) !important;
    box-shadow: 0 0 0 4px rgba(124,58,237,0.06);
  }

  /* ===== Clear button ===== */
  .clear-btn:hover {
    color: #7C3AED !important;
    background: rgba(124,58,237,0.08);
  }

  /* ===== Filter toggle ===== */
  .filter-toggle:hover {
    background: #F5F3FF !important;
    border-color: rgba(124,58,237,0.3) !important;
  }

  /* ===== Filter buttons ===== */
  .filter-btn:hover {
    background: #F5F3FF !important;
    color: #7C3AED !important;
    border-color: rgba(124,58,237,0.3) !important;
  }
  .filter-btn-active:hover {
    background: linear-gradient(135deg, #3D1E57 0%, #2D1540 100%) !important;
    color: #FFFFFF !important;
    border-color: rgba(168,85,247,0.5) !important;
  }

  /* ===== Empty button ===== */
  .empty-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(45,21,64,0.5);
    border-color: rgba(168,85,247,0.5) !important;
    background: linear-gradient(135deg, #3D1E57 0%, #2D1540 100%) !important;
  }

  /* ===== Retry button ===== */
  .retry-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(45,21,64,0.5);
    border-color: rgba(168,85,247,0.5) !important;
    background: linear-gradient(135deg, #3D1E57 0%, #2D1540 100%) !important;
  }

  /* ===== Card hover ===== */
  .package-card:hover {
    transform: translate3d(0, -8px, 0) !important;
    box-shadow: 0 12px 40px rgba(124,58,237,0.15) !important;
    border-color: rgba(168,85,247,0.3) !important;
  }

  /* ===== Card buttons ===== */
  .card-btn:hover {
    box-shadow: 0 8px 24px rgba(45,21,64,0.5) !important;
    transform: translateY(-2px);
    border-color: rgba(168,85,247,0.5) !important;
    background: linear-gradient(135deg, #3D1E57 0%, #2D1540 100%) !important;
  }
  .card-btn-free:hover {
    box-shadow: 0 8px 24px rgba(16,185,129,0.4) !important;
  }

  /* ===== Pagination buttons ===== */
  .page-nav-btn:hover:not(.disabled) {
    background: #7C3AED !important;
    color: #FFFFFF !important;
    border-color: transparent !important;
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(124,58,237,0.3);
  }

  .page-number-btn:hover:not(.active) {
    background: #F5F3FF !important;
    color: #7C3AED !important;
    border-color: rgba(124,58,237,0.3) !important;
    transform: translateY(-2px);
  }

  .page-number-btn.active:hover {
    background: linear-gradient(135deg, #3D1E57 0%, #2D1540 100%) !important;
    color: #FFFFFF !important;
  }

  /* ===== Responsive ===== */
  @media (max-width: 1024px) {
    .header-top { gap: 14px !important; }
    .page-title { font-size: 26px !important; }
  }

  @media (max-width: 768px) {
    .header-top {
      flex-direction: row !important;
      flex-wrap: wrap !important;
    }
    .header-text-wrap {
      flex: 1 !important;
      min-width: 180px !important;
    }
    .total-count {
      width: 100% !important;
      text-align: center !important;
      margin: 8px 0 0 0 !important;
      order: 3 !important;
    }
    .search-section {
      flex-direction: column !important;
    }
    .filter-toggle {
      width: 100% !important;
      justify-content: center !important;
    }
    .grid {
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)) !important;
      gap: 18px !important;
    }
    .pagination-wrap { gap: 6px !important; }
    .page-number-btn {
      min-width: 40px !important;
      height: 40px !important;
      font-size: 13px !important;
    }
    .page-nav-btn {
      width: 40px !important;
      height: 40px !important;
    }
  }

  @media (max-width: 480px) {
    .page-title { font-size: 22px !important; }
    .page-subtitle { font-size: 13px !important; }
    .grid {
      grid-template-columns: 1fr !important;
      gap: 16px !important;
    }
    .card-title { font-size: 14px !important; }
    .filters-panel { padding: 12px !important; }
    .filter-btn {
      padding: 8px 14px !important;
      font-size: 12px !important;
    }
    .empty { padding: 50px 16px !important; }
    .empty-title { font-size: 17px !important; }
    .pagination-wrap { margin-top: 32px !important; }
    .page-numbers { gap: 4px !important; }
    .page-number-btn {
      min-width: 36px !important;
      height: 36px !important;
      font-size: 12px !important;
      padding: 0 8px !important;
    }
    .page-nav-btn {
      width: 36px !important;
      height: 36px !important;
    }
    .ellipsis { min-width: 24px !important; font-size: 12px !important; }
    .page-info { font-size: 12px !important; }
  }
`;
document.head.appendChild(styleSheet);

export default PackagesPage;
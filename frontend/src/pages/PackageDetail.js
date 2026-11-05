// src/pages/PackageDetail.js
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPackageDetail, checkPackageAccess, addFreePackage, fetchMyPackages } from '../features/packages/packageSlice';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaLock, FaUnlock, FaPlay, FaClock, FaUserGraduate,
  FaCheckCircle, FaArrowLeft, FaExternalLinkAlt,
  FaBookOpen, FaShoppingCart, FaStar, FaPlus, FaGift,
  FaList, FaTag, FaPercent, FaYoutube, FaAward,
  FaVideo, FaTimes, FaCopy, FaDownload
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import PackageCover from '../components/PackageCover';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const API_URL = process.env.REACT_APP_API_URL || '/api';

// ===== تابع فرمت قیمت =====
const formatPrice = (price) => {
  if (price === null || price === undefined || price === '') return '';
  const num = parseFloat(price);
  if (isNaN(num)) return '';
  return num.toLocaleString('fa-IR');
};

// ===== تبدیل لینک یوتیوب به embed =====
const getEmbedUrl = (url) => {
  if (!url) return '';
  if (url.includes('youtube.com/watch') || url.includes('youtu.be')) {
    return url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/');
  }
  return url;
};

function PackageDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentPackage, loading, error, access } = useSelector((state) => state.packages);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { addToCart } = useCart();
  const [hasAccess, setHasAccess] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [showAllTopics, setShowAllTopics] = useState(false);

  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [licenseData, setLicenseData] = useState(null);
  const [loadingLicense, setLoadingLicense] = useState(false);
  const [copied, setCopied] = useState(false);

  const addToCartRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsChecking(true);
      await dispatch(fetchPackageDetail(id));
      if (isAuthenticated) {
        try {
          const result = await dispatch(checkPackageAccess(id)).unwrap();
          setHasAccess(result.has_access);
        } catch (err) {
          setHasAccess(false);
        }
      } else {
        setHasAccess(false);
      }
      setIsChecking(false);
    };
    fetchData();
  }, [dispatch, id, isAuthenticated]);

  useEffect(() => {
    if (access) setHasAccess(access.has_access);
  }, [access]);

  const handleOpenSpotPlayer = async () => {
    if (!isAuthenticated) {
      toast.info('لطفاً ابتدا وارد شوید');
      navigate('/login');
      return;
    }
    setLoadingLicense(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        `${API_URL}/packages/packages/${id}/spotplayer-license/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLicenseData(response.data);
      setShowLicenseModal(true);
    } catch (error) {
      const errMsg = error.response?.data?.error || 'خطا در دریافت لایسنس';
      toast.error(errMsg);
    } finally {
      setLoadingLicense(false);
    }
  };

  const handleCopyLicense = () => {
    if (!licenseData?.license) return;
    navigator.clipboard.writeText(licenseData.license).then(() => {
      setCopied(true);
      toast.success('کد لایسنس کپی شد');
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      toast.error('خطا در کپی');
    });
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.info('لطفاً ابتدا وارد شوید');
      navigate('/login');
      return;
    }
    addToCart(currentPackage);
    toast.success('دوره به سبد خرید اضافه شد');
  };

  const handleAddFreeToMyPackages = async () => {
    if (!isAuthenticated) {
      toast.info('لطفاً ابتدا وارد شوید');
      navigate('/login');
      return;
    }
    setIsAdding(true);
    try {
      const result = await dispatch(addFreePackage(id)).unwrap();
      toast.success(result.message || 'دوره به دوره‌های شما اضافه شد');
      try {
        const accessResult = await dispatch(checkPackageAccess(id)).unwrap();
        setHasAccess(accessResult.has_access);
      } catch (err) {
        setHasAccess(true);
      }
      await dispatch(fetchMyPackages());
    } catch (error) {
      toast.error(error?.message || 'خطا در افزودن دوره');
    } finally {
      setIsAdding(false);
    }
  };

  if (loading || isChecking) {
    return (
      <>
        <Navbar />
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>در حال بارگذاری دوره...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !currentPackage) {
    return (
      <>
        <Navbar />
        <div style={styles.error}>
          <h2 style={styles.errorTitle}>دوره یافت نشد</h2>
          <p style={styles.errorDesc}>
            {typeof error === 'string' ? error : 'این دوره ممکن است وجود نداشته باشد یا حذف شده باشد'}
          </p>
          <Link to="/" style={styles.backBtn}>← بازگشت به صفحه اصلی</Link>
        </div>
        <Footer />
      </>
    );
  }

  const discountPercent = currentPackage.has_discount && currentPackage.price > 0
    ? Math.round((1 - currentPackage.discounted_price / currentPackage.price) * 100)
    : 0;

  const displayedTopics = showAllTopics
    ? currentPackage.topics || []
    : (currentPackage.topics || []).slice(0, 6);

  const hasIntroVideo = Boolean(currentPackage.introduction_video_url || currentPackage.introduction_video);

  return (
    <>
      <Navbar />

      <div style={styles.pageContainer}>
        <div style={styles.content}>
          <div style={styles.container}>

            {/* ===== دکمه بازگشت ===== */}
            <Link to="/packages" style={styles.backLink} className="back-link">
              <FaArrowLeft style={styles.backIcon} />
              بازگشت به همه دوره‌ها
            </Link>

            {/* ===== هدر دوره ===== */}
            <div style={styles.header}>
              <div style={styles.headerContent}>
                {(currentPackage.image || currentPackage.image_url) && (
                  <div style={styles.imageContainer}>
                    <PackageCover
                      src={currentPackage.image || currentPackage.image_url}
                      alt={currentPackage.title}
                      size="hero"
                      rounded="lg"
                    >
                      <div style={styles.imageBadges}>
                        {currentPackage.has_discount && discountPercent > 0 && (
                          <span style={styles.discountBadgeOnImage}>
                            <FaPercent style={styles.badgeIcon} /> {discountPercent}%
                          </span>
                        )}
                        {currentPackage.is_free && (
                          <span style={styles.freeBadgeOnImage}>
                            <FaGift style={styles.badgeIcon} /> رایگان
                          </span>
                        )}
                      </div>
                    </PackageCover>
                  </div>
                )}

                <div style={styles.headerInfo}>
                  <div style={styles.badges}>
                    {currentPackage.is_top && (
                      <span style={styles.topBadgeHeader}>
                        <FaStar style={styles.badgeIcon} /> برترین
                      </span>
                    )}
                    {currentPackage.is_published && (
                      <span style={styles.publishedBadge}>
                        <FaCheckCircle style={styles.badgeIcon} /> منتشر شده
                      </span>
                    )}
                    {currentPackage.categories && currentPackage.categories.length > 0 && (
                      <span style={styles.categoryBadge}>
                        <FaTag style={styles.badgeIcon} /> {currentPackage.categories[0].name}
                      </span>
                    )}
                  </div>

                  <h1 style={styles.title}>{currentPackage.title}</h1>
                  <p style={styles.description}>{currentPackage.description}</p>

                  <div style={styles.meta}>
                    {currentPackage.duration && (
                      <span style={styles.metaItem}>
                        <FaClock style={styles.metaIcon} />
                        {currentPackage.duration}
                      </span>
                    )}
                    <span style={styles.metaItem}>
                      <FaList style={styles.metaIcon} />
                      {currentPackage.topics?.length || 0} سرفصل
                    </span>
                    {currentPackage.students_count > 0 && (
                      <span style={styles.metaItem}>
                        <FaUserGraduate style={styles.metaIcon} />
                        {currentPackage.students_count} دانشجو
                      </span>
                    )}
                    {hasIntroVideo && (
                      <span style={styles.metaItemVideo}>
                        <FaVideo style={styles.metaIcon} />
                        ویدیو معرفی دارد
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ===== قیمت و خرید ===== */}
            {!hasAccess && (
              <>
                {!currentPackage.is_free ? (
                  <div style={styles.priceSection} ref={addToCartRef}>
                    <div style={styles.priceSectionInner}>
                      <div style={styles.priceInfo}>
                        {currentPackage.has_discount ? (
                          <>
                            <div style={styles.discountRow}>
                              <span style={styles.discountBadge}>{discountPercent}%</span>
                              <span style={styles.originalPriceHeader}>
                                {formatPrice(currentPackage.price)}
                              </span>
                            </div>
                            <div style={styles.discountedPriceHeader}>
                              {formatPrice(currentPackage.discounted_price)}
                              <span style={styles.currency}> تومان</span>
                            </div>
                          </>
                        ) : (
                          <div style={styles.priceHeader}>
                            {formatPrice(currentPackage.price)}
                            <span style={styles.currency}> تومان</span>
                          </div>
                        )}
                      </div>
                      <button onClick={handleAddToCart} style={styles.addToCartBtn} className="add-to-cart-btn">
                        <FaShoppingCart style={styles.cartIcon} />
                        افزودن به سبد خرید
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={styles.freeMessageSection}>
                    <div style={styles.freeMessageContent}>
                      <div style={styles.freeMessageIconWrapper}>
                        <FaGift style={styles.freeMessageIcon} />
                      </div>
                      <div>
                        <div style={styles.freeMessageTitle}>دوره رایگان</div>
                        <div style={styles.freeMessageText}>این دوره به صورت کاملاً رایگان می‌باشد</div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ===== پیام دسترسی ===== */}
            {hasAccess && (
              <div style={styles.accessMessageSection}>
                <div style={styles.accessMessageContent}>
                  <div style={styles.accessMessageIconWrapper}>
                    <FaCheckCircle style={styles.accessMessageIcon} />
                  </div>
                  <div>
                    <div style={styles.accessMessageTitle}>شما به این دوره دسترسی دارید</div>
                    <div style={styles.accessMessageText}>
                      از بخش اسپات پلیر می‌توانید کد لایسنس خود را دریافت کنید
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ===== ویدیو معرفی ===== */}
            {hasIntroVideo && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>
                  <div style={styles.sectionIconWrapper}>
                    <FaYoutube style={styles.sectionIcon} />
                  </div>
                  ویدیو معرفی دوره
                </h2>
                <div style={styles.videoWrapper}>
                  {currentPackage.introduction_video_url ? (
                    <iframe
                      src={getEmbedUrl(currentPackage.introduction_video_url)}
                      title="ویدیو معرفی دوره"
                      style={styles.videoIframe}
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  ) : (
                    <video controls style={styles.videoIframe}>
                      <source src={currentPackage.introduction_video} type="video/mp4" />
                      مرورگر شما ویدیو را پشتیبانی نمی‌کند
                    </video>
                  )}
                </div>
              </div>
            )}

            {/* ===== ویژگی‌ها ===== */}
            {currentPackage.features && currentPackage.features.length > 0 && (
              <div style={styles.section}>
                <h2 style={styles.sectionTitle}>
                  <div style={styles.sectionIconWrapper}>
                    <FaAward style={styles.sectionIcon} />
                  </div>
                  ویژگی‌های دوره
                </h2>
                <div style={styles.featuresGrid}>
                  {currentPackage.features.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      style={styles.featureItem}
                    >
                      <FaCheckCircle style={styles.featureCheck} />
                      <span>{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* ===== سرفصل‌ها ===== */}
            {currentPackage.topics && currentPackage.topics.length > 0 && (
              <div style={styles.section}>
                <div style={styles.sectionHeader}>
                  <h2 style={{...styles.sectionTitle, marginBottom: 0}}>
                    <div style={styles.sectionIconWrapper}>
                      <FaBookOpen style={styles.sectionIcon} />
                    </div>
                    سرفصل‌های دوره
                  </h2>
                  <span style={styles.topicsCount}>{currentPackage.topics.length} سرفصل</span>
                </div>

                <div style={styles.topicsList}>
                  {displayedTopics.map((topic, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      style={styles.topicItem}
                      className="topic-item"
                    >
                      <div style={styles.topicNumber}>{String(index + 1).padStart(2, '0')}</div>
                      <span style={styles.topicTitle}>{topic}</span>
                      <span style={styles.topicStatus}>
                        {hasAccess || currentPackage.is_free ? (
                          <FaUnlock style={styles.topicUnlock} />
                        ) : (
                          <FaLock style={styles.topicLock} />
                        )}
                      </span>
                    </motion.div>
                  ))}
                </div>

                {(currentPackage.topics || []).length > 6 && (
                  <button
                    onClick={() => setShowAllTopics(!showAllTopics)}
                    style={styles.showMoreBtn}
                    className="show-more-btn"
                  >
                    {showAllTopics ? 'نمایش کمتر' : `مشاهده ${(currentPackage.topics || []).length - 6} سرفصل دیگر`}
                  </button>
                )}
              </div>
            )}

            {/* ===== اسپات پلیر ===== */}
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>
                <div style={styles.sectionIconWrapper}>
                  <FaPlay style={styles.sectionIcon} />
                </div>
                {currentPackage.is_free ? 'مشاهده رایگان دوره' : 'مشاهده دوره در اسپات پلیر'}
              </h2>

              <div style={styles.spotCard}>
                {hasAccess ? (
                  <div style={styles.spotContent}>
                    <div style={styles.spotInfo}>
                      <div style={styles.spotIconWrapper}>
                        <FaPlay style={styles.spotIcon} />
                      </div>
                      <div>
                        <h3 style={styles.spotCardTitle}>
                          <FaCheckCircle style={styles.spotCheckIcon} />
                          دسترسی دارید
                        </h3>
                        <p style={styles.spotCardDesc}>
                          برای دریافت کد لایسنس و مشاهده دوره، روی دکمه زیر کلیک کنید.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleOpenSpotPlayer}
                      style={styles.spotBtn}
                      className="spot-btn"
                      disabled={loadingLicense}
                    >
                      <FaPlay style={styles.spotBtnIcon} />
                      {loadingLicense ? 'در حال دریافت لایسنس...' : 'دریافت کد لایسنس'}
                      <FaExternalLinkAlt style={styles.spotExternalIcon} />
                    </button>
                  </div>
                ) : currentPackage.is_free ? (
                  <div style={styles.spotContent}>
                    <div style={styles.spotInfo}>
                      <div style={styles.spotLockedWrapper}>
                        <FaLock style={styles.spotLockIcon} />
                      </div>
                      <div>
                        <h3 style={styles.spotCardTitle}>دسترسی قفل است</h3>
                        <p style={styles.spotCardDesc}>
                          برای مشاهده، ابتدا دوره را به دوره‌های خود اضافه کنید
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleAddFreeToMyPackages}
                      style={styles.freeAccessBtn}
                      className="free-access-btn"
                      disabled={isAdding}
                    >
                      {isAdding ? (
                        <span>در حال افزودن...</span>
                      ) : (
                        <>
                          <FaPlus style={styles.freeAccessIcon} />
                          افزودن به دوره‌های من
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div style={styles.spotContent}>
                    <div style={styles.spotInfo}>
                      <div style={styles.spotLockedWrapper}>
                        <FaLock style={styles.spotLockIcon} />
                      </div>
                      <div>
                        <h3 style={styles.spotCardTitle}>دسترسی قفل است</h3>
                        <p style={styles.spotCardDesc}>
                          برای مشاهده این دوره، ابتدا آن را خریداری کنید.
                        </p>
                      </div>
                    </div>
                    <button onClick={handleAddToCart} style={styles.spotBuyBtn} className="spot-buy-btn">
                      <FaShoppingCart style={styles.buyIcon} />
                      افزودن به سبد خرید
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ===== License Modal ===== */}
        <AnimatePresence>
          {showLicenseModal && licenseData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={styles.modalOverlay}
              onClick={() => setShowLicenseModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                style={styles.modal}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowLicenseModal(false)}
                  style={styles.modalCloseBtn}
                  className="modal-close-btn"
                >
                  <FaTimes />
                </button>

                <div style={styles.modalHeader}>
                  <div style={styles.modalIconWrapper}>
                    <FaPlay style={styles.modalIcon} />
                  </div>
                  <h3 style={styles.modalTitle}>کد لایسنس اسپات پلیر</h3>
                  <p style={styles.modalSubtitle}>{licenseData.package_title}</p>
                </div>

                <div style={styles.licenseBox}>
                  <div style={styles.licenseBoxHeader}>
                    <span style={styles.licenseBoxLabel}>کد لایسنس شما</span>
                  </div>
                  <div
                    style={styles.licenseCodeWrapper}
                    className="license-code-wrapper"
                    onClick={handleCopyLicense}
                    title="برای کپی کلیک کنید"
                  >
                    <code style={styles.licenseCode}>{licenseData.license}</code>
                    <div style={styles.copyBtnWrapper}>
                      {copied ? (
                        <FaCheckCircle style={styles.copiedIcon} />
                      ) : (
                        <FaCopy style={styles.copyIcon} />
                      )}
                    </div>
                  </div>
                  <p style={styles.licenseHint}>برای کپی، روی کد بالا کلیک کنید</p>
                </div>

                <div style={styles.instructionsBox}>
                  <h4 style={styles.instructionsTitle}>راهنمای استفاده:</h4>
                  <ol style={styles.instructionsList}>
                    <li>کد بالا را کپی کنید</li>
                    <li>اپلیکیشن اسپات پلیر را دانلود و نصب کنید</li>
                    <li>کد لایسنس را در اپ وارد کنید</li>
                    <li>از تماشای دوره لذت ببرید!</li>
                  </ol>
                </div>

                <div style={styles.modalActions}>
                  <a
                    href="https://spotplayer.ir"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.downloadBtn}
                    className="download-btn"
                  >
                    <FaDownload style={styles.downloadIcon} />
                    دانلود اسپات پلیر
                  </a>
                  <button
                    onClick={() => setShowLicenseModal(false)}
                    style={styles.modalCloseActionBtn}
                    className="modal-close-action-btn"
                  >
                    بستن
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </>
  );
}

// ============================================
// STYLES (رنگ تیره جدید)
// ============================================
const styles = {
  pageContainer: { position: 'relative', minHeight: '100vh', backgroundColor: '#FFFFFF', fontFamily: 'Vazirmatn, sans-serif' },
  content: { position: 'relative', zIndex: 1, padding: '100px 0 60px' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '0 24px' },

  loading: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', gap: '16px', backgroundColor: '#FFFFFF' },
  spinner: { width: '40px', height: '40px', border: '2px solid rgba(124,58,237,0.1)', borderTop: '2px solid #7C3AED', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  loadingText: { color: 'rgba(26,26,46,0.4)', fontSize: '14px', fontWeight: '500' },

  error: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '12px', backgroundColor: '#FFFFFF', padding: '40px 24px' },
  errorTitle: { color: '#7C3AED', fontSize: '24px', fontWeight: '700' },
  errorDesc: { color: 'rgba(26,26,46,0.4)', fontSize: '14px', textAlign: 'center' },

  // دکمه بازگشت به صفحه اصلی (Error) - تیره
  backBtn: {
    display: 'inline-block', padding: '12px 28px',
    background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
    color: '#FFFFFF', borderRadius: '50px', textDecoration: 'none',
    marginTop: '16px', fontSize: '14px', fontWeight: '600',
    fontFamily: 'Vazirmatn, sans-serif',
    boxShadow: '0 4px 16px rgba(45,21,64,0.35)',
    border: '1px solid rgba(168,85,247,0.2)'
  },

  backLink: { display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'rgba(26,26,46,0.5)', textDecoration: 'none', fontSize: '14px', fontWeight: '500', marginBottom: '20px', padding: '8px 14px', borderRadius: '10px', transition: 'all 0.3s ease', fontFamily: 'Vazirmatn, sans-serif' },
  backIcon: { fontSize: '13px' },

  // ===== Header با تم تیره =====
  header: {
    background: '#0A0415',
    borderRadius: '24px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: '0 8px 40px rgba(124,58,237,0.15)',
    position: 'relative',
    overflow: 'hidden'
  },
  headerContent: { display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap', position: 'relative', zIndex: 1 },
  imageContainer: {
    flex: '0 0 380px',
    maxWidth: '100%',
    position: 'relative',
    borderRadius: '16px',
    overflow: 'hidden',
    background: 'rgba(255,255,255,0.06)',
  },
  imageBadges: { position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px', flexDirection: 'column' },

  // ✅ بج تخفیف تیره با هایلایت قرمز کم
  discountBadgeOnImage: {
    display: 'flex', alignItems: 'center', gap: '4px',
    background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
    color: '#FFFFFF', padding: '4px 10px', borderRadius: '50px',
    fontSize: '11px', fontWeight: '800',
    boxShadow: '0 2px 8px rgba(45,21,64,0.5), 0 0 0 1px rgba(239,68,68,0.5)',
    border: '1px solid rgba(239,68,68,0.3)'
  },

  freeBadgeOnImage: {
    display: 'flex', alignItems: 'center', gap: '4px',
    background: 'linear-gradient(135deg, #34D399, #10B981)',
    color: '#FFFFFF', padding: '5px 10px', borderRadius: '50px',
    fontSize: '12px', fontWeight: '700',
    boxShadow: '0 4px 12px rgba(16,185,129,0.4)'
  },
  headerInfo: { flex: 1, minWidth: '280px' },
  badges: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' },
  badgeIcon: { fontSize: '11px' },
  topBadgeHeader: { display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(251,191,36,0.15)', color: '#FBBF24', padding: '5px 12px', borderRadius: '50px', fontSize: '12px', fontWeight: '600' },
  publishedBadge: { display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16,185,129,0.15)', color: '#10B981', padding: '5px 12px', borderRadius: '50px', fontSize: '12px', fontWeight: '600' },
  categoryBadge: { display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(124,58,237,0.2)', color: '#A78BFA', padding: '5px 12px', borderRadius: '50px', fontSize: '12px', fontWeight: '600' },
  title: { fontSize: 'clamp(24px, 3.5vw, 34px)', fontWeight: '800', color: '#FFFFFF', marginBottom: '12px', lineHeight: '1.3', letterSpacing: '-0.5px' },
  description: { fontSize: 'clamp(14px, 1.5vw, 16px)', color: 'rgba(255,255,255,0.5)', lineHeight: '1.8', marginBottom: '20px' },
  meta: { display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: 0 },
  metaItem: { display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.65)', fontSize: '13px', background: 'rgba(255,255,255,0.06)', padding: '6px 14px', borderRadius: '50px', fontWeight: '500' },
  metaItemVideo: { display: 'flex', alignItems: 'center', gap: '6px', color: '#10B981', fontSize: '13px', background: 'rgba(16,185,129,0.12)', padding: '6px 14px', borderRadius: '50px', fontWeight: '600' },
  metaIcon: { color: '#A78BFA', fontSize: '13px' },

  // ===== Price Section =====
  priceSection: {
    background: '#FFFFFF',
    borderRadius: '20px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: '0 4px 24px rgba(124,58,237,0.08)',
    border: '1px solid rgba(124,58,237,0.08)',
    scrollMarginTop: '100px'
  },
  priceSectionInner: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' },
  priceInfo: { display: 'flex', flexDirection: 'column', gap: '6px' },
  discountRow: { display: 'flex', alignItems: 'center', gap: '10px' },

  // ✅ بج تخفیف تیره با هایلایت قرمز
  discountBadge: {
    background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
    color: '#FFFFFF', padding: '3px 10px', borderRadius: '8px',
    fontSize: '14px', fontWeight: '800', lineHeight: 1.4,
    boxShadow: '0 2px 8px rgba(45,21,64,0.5), 0 0 0 1px rgba(239,68,68,0.5)',
    border: '1px solid rgba(239,68,68,0.3)'
  },

  originalPriceHeader: {
    fontSize: '16px', color: '#9E9E9E', textDecoration: 'line-through',
    textDecorationColor: 'rgba(168,85,247,0.5)', textDecorationThickness: '2px', fontWeight: '500'
  },
  discountedPriceHeader: { fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: '800', color: '#1A1A2E', lineHeight: 1.2 },
  priceHeader: { fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: '800', color: '#1A1A2E', lineHeight: 1.2 },
  currency: { fontSize: '14px', fontWeight: '500', color: 'rgba(26,26,46,0.5)' },

  // ✅ دکمه افزودن به سبد خرید - تیره
  addToCartBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
    padding: '14px 32px',
    background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
    color: '#FFFFFF',
    border: '1px solid rgba(168,85,247,0.2)',
    borderRadius: '12px',
    fontSize: '15px', fontWeight: '700', cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 20px rgba(45,21,64,0.35)',
    fontFamily: 'Vazirmatn, sans-serif', whiteSpace: 'nowrap'
  },
  cartIcon: { fontSize: '18px' },

  // ===== Free / Access Messages =====
  freeMessageSection: { background: '#FFFFFF', borderRadius: '20px', padding: '20px 24px', marginBottom: '20px', boxShadow: '0 4px 24px rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', borderRight: '4px solid #10B981' },
  freeMessageContent: { display: 'flex', alignItems: 'center', gap: '16px' },
  freeMessageIconWrapper: { width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  freeMessageIcon: { fontSize: '24px', color: '#10B981' },
  freeMessageTitle: { fontSize: '16px', fontWeight: '700', color: '#10B981', marginBottom: '2px' },
  freeMessageText: { fontSize: '13px', color: 'rgba(26,26,46,0.5)' },

  accessMessageSection: { background: '#FFFFFF', borderRadius: '20px', padding: '20px 24px', marginBottom: '20px', boxShadow: '0 4px 24px rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', borderRight: '4px solid #10B981' },
  accessMessageContent: { display: 'flex', alignItems: 'center', gap: '16px' },
  accessMessageIconWrapper: { width: '52px', height: '52px', borderRadius: '14px', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  accessMessageIcon: { fontSize: '24px', color: '#10B981' },
  accessMessageTitle: { fontSize: '16px', fontWeight: '700', color: '#10B981', marginBottom: '2px' },
  accessMessageText: { fontSize: '13px', color: 'rgba(26,26,46,0.5)' },

  // ===== Sections =====
  section: {
    background: '#FFFFFF',
    borderRadius: '20px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: '0 4px 24px rgba(124,58,237,0.06)',
    border: '1px solid rgba(124,58,237,0.08)'
  },
  sectionHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' },
  sectionTitle: { display: 'flex', alignItems: 'center', gap: '12px', fontSize: 'clamp(17px, 2vw, 20px)', fontWeight: '800', color: '#1A1A2E', marginBottom: '20px' },
  sectionIconWrapper: { width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(124,58,237,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  sectionIcon: { fontSize: '18px', color: '#7C3AED' },

  // ===== Features =====
  featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' },
  featureItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', background: '#FAFAFC', borderRadius: '12px', color: 'rgba(26,26,46,0.75)', fontSize: '14px', fontWeight: '500', border: '1px solid rgba(124,58,237,0.06)' },
  featureCheck: { color: '#10B981', fontSize: '16px', flexShrink: 0 },

  // ===== Topics =====
  topicsCount: { fontSize: '13px', color: '#7C3AED', fontWeight: '700', background: 'rgba(124,58,237,0.08)', padding: '6px 14px', borderRadius: '50px' },
  topicsList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  topicItem: { display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', background: '#FAFAFC', borderRadius: '12px', border: '1px solid rgba(124,58,237,0.06)', transition: 'all 0.3s ease' },

  // ✅ شماره سرفصل - تیره
  topicNumber: {
    width: '40px', height: '40px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
    borderRadius: '12px', color: '#FFFFFF',
    fontWeight: '800', fontSize: '14px', flexShrink: 0,
    boxShadow: '0 4px 12px rgba(45,21,64,0.35)',
    border: '1px solid rgba(168,85,247,0.2)'
  },
  topicTitle: { flex: 1, fontSize: '14px', color: '#1A1A2E', fontWeight: '600' },
  topicStatus: { fontSize: '14px', flexShrink: 0 },
  topicUnlock: { color: '#10B981' },
  topicLock: { color: 'rgba(26,26,46,0.2)' },
  showMoreBtn: {
    marginTop: '16px', padding: '12px 20px',
    background: 'rgba(124,58,237,0.06)',
    border: '1px solid rgba(124,58,237,0.15)',
    borderRadius: '12px', color: '#7C3AED',
    cursor: 'pointer', fontSize: '14px', fontWeight: '700',
    fontFamily: 'Vazirmatn, sans-serif', width: '100%',
    transition: 'background 0.3s ease'
  },

  // ===== Video =====
  videoWrapper: { position: 'relative', width: '100%', paddingBottom: '56.25%', borderRadius: '16px', overflow: 'hidden', background: '#000' },
  videoIframe: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' },

  // ===== Spot Player =====
  spotCard: { background: '#FAFAFC', borderRadius: '16px', padding: '24px', border: '1px solid rgba(124,58,237,0.08)' },
  spotContent: { display: 'flex', flexDirection: 'column', gap: '20px' },
  spotInfo: { display: 'flex', alignItems: 'center', gap: '16px' },

  // ✅ آیکون اسپات پلیر - تیره
  spotIconWrapper: {
    width: '60px', height: '60px', borderRadius: '16px',
    background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, boxShadow: '0 4px 16px rgba(45,21,64,0.35)',
    border: '1px solid rgba(168,85,247,0.2)'
  },
  spotIcon: { fontSize: '24px', color: '#FFFFFF' },
  spotLockedWrapper: { width: '60px', height: '60px', borderRadius: '16px', background: 'rgba(26,26,46,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  spotLockIcon: { fontSize: '24px', color: 'rgba(26,26,46,0.25)' },
  spotCardTitle: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '17px', fontWeight: '800', color: '#1A1A2E', marginBottom: '4px' },
  spotCheckIcon: { fontSize: '16px', color: '#10B981' },
  spotCardDesc: { fontSize: '13px', color: 'rgba(26,26,46,0.55)', lineHeight: '1.6' },

  // ✅ دکمه دریافت لایسنس - تیره
  spotBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
    width: '100%', padding: '14px',
    background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
    color: '#FFFFFF', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '12px',
    fontSize: '15px', fontWeight: '700', cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(45,21,64,0.35)',
    fontFamily: 'Vazirmatn, sans-serif',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
  },
  spotBtnIcon: { fontSize: '18px' },
  spotExternalIcon: { fontSize: '14px' },

  // دکمه رایگان - سبز (بدون تغییر)
  freeAccessBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
    width: '100%', padding: '14px',
    background: 'linear-gradient(135deg, #34D399, #10B981)',
    color: '#FFFFFF', border: 'none', borderRadius: '12px',
    fontSize: '15px', fontWeight: '700', cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
    fontFamily: 'Vazirmatn, sans-serif'
  },
  freeAccessIcon: { fontSize: '18px' },

  // ✅ دکمه خرید داخل اسپات پلیر - تیره
  spotBuyBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    width: '100%', padding: '14px',
    background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
    color: '#FFFFFF', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '12px',
    fontSize: '15px', fontWeight: '700', cursor: 'pointer',
    boxShadow: '0 4px 16px rgba(45,21,64,0.35)',
    fontFamily: 'Vazirmatn, sans-serif',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
  },
  buyIcon: { fontSize: '18px' },

  // ===== Modal =====
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(10,4,21,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', zIndex: 9999 },
  modal: { position: 'relative', background: '#FFFFFF', borderRadius: '24px', padding: '32px 28px', maxWidth: '480px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(124,58,237,0.3)' },
  modalCloseBtn: { position: 'absolute', top: '16px', left: '16px', width: '36px', height: '36px', borderRadius: '50%', background: '#F5F3FF', border: 'none', color: 'rgba(26,26,46,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', transition: 'all 0.3s ease' },
  modalHeader: { textAlign: 'center', marginBottom: '24px' },

  // ✅ آیکون مودال - تیره
  modalIconWrapper: {
    width: '72px', height: '72px', borderRadius: '20px',
    background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 16px',
    boxShadow: '0 8px 24px rgba(45,21,64,0.4)',
    border: '1px solid rgba(168,85,247,0.25)'
  },
  modalIcon: { fontSize: '28px', color: '#FFFFFF' },
  modalTitle: { fontSize: '22px', fontWeight: '800', color: '#1A1A2E', marginBottom: '6px' },
  modalSubtitle: { fontSize: '14px', color: 'rgba(26,26,46,0.5)' },

  licenseBox: { background: '#FAFAFC', borderRadius: '16px', padding: '20px', marginBottom: '20px', border: '1px solid rgba(124,58,237,0.1)' },
  licenseBoxHeader: { marginBottom: '12px' },
  licenseBoxLabel: { fontSize: '13px', fontWeight: '600', color: 'rgba(26,26,46,0.5)' },
  licenseCodeWrapper: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', background: '#FFFFFF', borderRadius: '12px', padding: '16px 18px', cursor: 'pointer', transition: 'all 0.3s ease', border: '2px solid transparent', userSelect: 'none' },
  licenseCode: { flex: 1, fontSize: '16px', fontWeight: '700', color: '#7C3AED', fontFamily: 'monospace', wordBreak: 'break-all', letterSpacing: '1px' },
  copyBtnWrapper: { width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  copyIcon: { fontSize: '16px', color: '#7C3AED' },
  copiedIcon: { fontSize: '16px', color: '#10B981' },
  licenseHint: { fontSize: '12px', color: 'rgba(26,26,46,0.4)', textAlign: 'center', marginTop: '10px' },

  instructionsBox: { background: 'rgba(124,58,237,0.04)', borderRadius: '14px', padding: '16px 18px', marginBottom: '20px', border: '1px solid rgba(124,58,237,0.1)' },
  instructionsTitle: { fontSize: '14px', fontWeight: '700', color: '#1A1A2E', marginBottom: '10px' },
  instructionsList: { margin: 0, paddingRight: '20px', fontSize: '13px', color: 'rgba(26,26,46,0.6)', lineHeight: '1.9' },

  modalActions: { display: 'flex', gap: '10px' },

  // ✅ دکمه دانلود - تیره
  downloadBtn: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    padding: '14px',
    background: 'linear-gradient(135deg, #2D1540 0%, #1A0828 100%)',
    color: '#FFFFFF', border: '1px solid rgba(168,85,247,0.2)',
    borderRadius: '12px', textDecoration: 'none',
    fontSize: '14px', fontWeight: '700',
    fontFamily: 'Vazirmatn, sans-serif',
    boxShadow: '0 4px 16px rgba(45,21,64,0.35)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
  },
  downloadIcon: { fontSize: '16px' },

  modalCloseActionBtn: { padding: '14px 24px', background: '#F5F3FF', color: 'rgba(26,26,46,0.6)', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Vazirmatn, sans-serif' },
};

// ============================================
// GLOBAL STYLES
// ============================================
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

  .back-link:hover { color: #7C3AED !important; background: rgba(124,58,237,0.06); }

  .add-to-cart-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(45,21,64,0.5) !important;
    border-color: rgba(168,85,247,0.5) !important;
    background: linear-gradient(135deg, #3D1E57 0%, #2D1540 100%) !important;
  }

  .spot-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(45,21,64,0.5) !important;
    border-color: rgba(168,85,247,0.5) !important;
    background: linear-gradient(135deg, #3D1E57 0%, #2D1540 100%) !important;
  }

  .free-access-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(16,185,129,0.4) !important; }

  .spot-buy-btn:hover {
    background: linear-gradient(135deg, #3D1E57 0%, #2D1540 100%) !important;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(45,21,64,0.5) !important;
    border-color: rgba(168,85,247,0.5) !important;
  }

  .show-more-btn:hover { background: rgba(124,58,237,0.1) !important; }
  .topic-item:hover { background: #FFFFFF !important; border-color: rgba(124,58,237,0.2) !important; }
  .license-code-wrapper:hover { border-color: #7C3AED !important; background: rgba(124,58,237,0.02) !important; }

  .modal-close-btn:hover { background: #EDE9FE !important; color: #7C3AED !important; }

  .download-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(45,21,64,0.5) !important;
    border-color: rgba(168,85,247,0.5) !important;
    background: linear-gradient(135deg, #3D1E57 0%, #2D1540 100%) !important;
  }

  .modal-close-action-btn:hover { background: #EDE9FE !important; }

  @media (max-width: 768px) {
    .header-content { flex-direction: column !important; }
    .price-section-inner { flex-direction: column !important; align-items: stretch !important; }
    .add-to-cart-btn { width: 100% !important; }
    .features-grid { grid-template-columns: 1fr !important; }
    .spot-info { flex-direction: column !important; text-align: center !important; }
    .section-header { flex-direction: column !important; align-items: stretch !important; }
  }

  @media (max-width: 480px) {
    .header { padding: 16px !important; }
    .section { padding: 16px !important; }
    .price-section { padding: 16px !important; }
    .modal { padding: 24px 20px !important; }
    .modal-title { font-size: 18px !important; }
    .license-code { font-size: 14px !important; }
    .modal-actions { flex-direction: column !important; }
    .download-btn, .modal-close-action-btn { width: 100% !important; }
  }
`;
document.head.appendChild(styleSheet);

export default PackageDetail;
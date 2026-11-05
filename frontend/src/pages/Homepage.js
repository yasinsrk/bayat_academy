import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchPackages } from '../features/packages/packageSlice';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import {
  FaInstagram, FaTelegram, FaWhatsapp, FaYoutube,
} from 'react-icons/fa';

// ===== SVG Icons =====
const Icons = {
  GradientCircle: ({ size = 36 }) => (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
      <defs>
        <linearGradient id="circGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>
      <circle cx="18" cy="18" r="15" stroke="url(#circGrad)" strokeWidth="2" fill="none" />
      <circle cx="18" cy="18" r="7" fill="url(#circGrad)" />
    </svg>
  ),
  CheckCircle: ({ size = 44 }) => (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <defs>
        <linearGradient id="chkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>
      <circle cx="22" cy="22" r="20" stroke="url(#chkGrad)" strokeWidth="1.5" fill="rgba(124,58,237,0.1)" />
      <path d="M15 22L20 27L29 17" stroke="url(#chkGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  ChevronDown: ({ size = 20, color = '#1A1A2E' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M6 9L12 15L18 9" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  ArrowLeftSmall: ({ size = 14, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M19 12H5M12 19L5 12L12 5" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  ArrowRightSmall: ({ size = 14, color = 'currentColor' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M5 12H19M12 5L19 12L12 19" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Grid: ({ size = 16, color = '#7C3AED' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke={color} strokeWidth="2" />
    </svg>
  ),
  Users: ({ size = 26, color = '#7C3AED' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  VideoIcon: ({ size = 26, color = '#EC4899' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ),
  BookOpen: ({ size = 26, color = '#10B981' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  Award: ({ size = 26, color = '#F59E0B' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  ),
  Brain: ({ size = 26, color = '#7C3AED' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
  ),
  Globe: ({ size = 26, color = '#EC4899' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  Headphones: ({ size = 26, color = '#10B981' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  ),
};

const services = [
  { id: 1, title: 'آموزش هوش مصنوعی', icon: 'Brain', description: 'آموزش ساده، کاربردی و قابل‌فهم هوش مصنوعی و ابزارهای نوین دیجیتال. از مبانی تا پیشرفته، همراه شما هستیم تا با جدیدترین تکنولوژی‌های دنیا آشنا شوید.' },
  { id: 2, title: 'تولید محتوا', icon: 'VideoIcon', description: 'آموزش تولید محتوای حرفه‌ای برای شبکه‌های اجتماعی و کسب‌وکارهای آنلاین. از ایده‌پردازی تا اجرا، همه چیز را به صورت عملی یاد می‌گیرید.' },
  { id: 3, title: 'مهارت‌های دیجیتال', icon: 'Globe', description: 'آموزش مهارت‌های کاربردی اینترنتی و امور دیجیتال که مستقیماً در کار، کسب‌وکار و زندگی روزمره به کار می‌آیند.' },
  { id: 4, title: 'پشتیبانی آنلاین', icon: 'Headphones', description: 'پاسخگویی ۲۴ ساعته به سوالات و مشکلات دانشجویان. تیم پشتیبانی ما همیشه در کنار شماست تا مسیر یادگیری را بدون دغدغه طی کنید.' },
];

const HERO_DOTS = [...Array(12)].map(() => Math.random() * 0.7 + 0.3);
const ABOUT_DOTS_TOP = [...Array(24)];

function Homepage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: packages, loading, error } = useSelector((state) => state.packages);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth <= 1024);
  const coursesScrollRef = useRef(null);
  const servicesScrollRef = useRef(null);

  useEffect(() => {
    let timeout;
    const handleResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const w = window.innerWidth;
        setIsMobile((prev) => {
          const next = w <= 768;
          return prev === next ? prev : next;
        });
        setIsTablet((prev) => {
          const next = w <= 1024;
          return prev === next ? prev : next;
        });
      }, 150);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => { dispatch(fetchPackages()); }, [dispatch]);

  const scrollCourses = (d) => {
    const amount = d === 'left' ? -380 : 380;
    coursesScrollRef.current?.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const scrollServices = (d) => {
    const amount = d === 'left' ? -340 : 340;
    servicesScrollRef.current?.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const goToPackage = (id) => navigate(`/package/${id}`);

  if (loading) return (
    <div style={styles.loading}><div style={styles.spinner}></div><p style={styles.loadingText}>در حال بارگذاری...</p></div>
  );
  if (error) return (
    <div style={styles.error}><h2 style={styles.errorTitle}>خطا در بارگذاری</h2>
      <button onClick={() => dispatch(fetchPackages())} style={styles.retryBtn}>تلاش مجدد</button></div>
  );

  const packagesList = Array.isArray(packages) ? packages : [];
  const latestPackages = packagesList.slice(0, 8);
  const formatPrice = (p) => p ? parseFloat(p).toLocaleString('fa-IR') : '0';

  return (
    <div style={styles.pageContainer}>
      <div style={styles.purpleBlobMain} className="purple-blob-main"></div>
      <div style={styles.purpleBlobGlow}></div>

      <div style={styles.heroDots} className="hero-dots">
        {HERO_DOTS.map((op, i) => (
          <span key={i} style={{ ...styles.heroDot, opacity: op }} />
        ))}
      </div>

      <Navbar />
      <Hero />

      {/* ===== ۱. دوره‌ها ===== */}
      <section style={styles.coursesSection} className="courses-section">
        <div style={styles.container} className="container">
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle} className="section-title-responsive">جدیدترین دوره های میثم بیات</h2>
            <span style={styles.sectionTitleEn} className="section-title-en-responsive">The Latest Courses</span>
          </div>

          <div style={styles.sliderWrapper} className="slider-wrapper">
            {!isMobile && (
              <button onClick={() => scrollCourses('left')} style={{ ...styles.arrowBtn, left: '-10px' }} className="arrow-btn" aria-label="قبلی">
                <Icons.ArrowLeftSmall size={16} color="#1A1A2E" />
              </button>
            )}

            <div ref={coursesScrollRef} style={styles.coursesRow} className="courses-row">
              {latestPackages.map((pkg) => {
                const finalPrice = pkg.has_discount ? formatPrice(pkg.discounted_price) : formatPrice(pkg.price);
                return (
                  <div
                    key={pkg.id}
                    style={styles.courseCard}
                    className="course-card"
                    onClick={() => goToPackage(pkg.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter') goToPackage(pkg.id); }}
                  >
                    <div style={styles.courseImageWrap} className="course-image-wrap">
                      <img
                        src={pkg.image || pkg.image_url}
                        alt={pkg.title}
                        style={styles.courseImage}
                        className="course-image"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => { e.target.style.background = 'linear-gradient(135deg, #7C3AED, #EC4899)'; }}
                      />
                    </div>

                    <div style={styles.courseInfoBox} className="course-info-box">
                      <p style={styles.courseInfoText} className="course-info-text">
                        {pkg.description ? pkg.description.substring(0, 85) + '...' : 'آموزش کامل این دوره با جدیدترین متدها'}
                      </p>
                    </div>

                    <div style={styles.gradientDivider} className="gradient-divider"></div>

                    <div style={styles.courseBottomRow} className="course-bottom-row">
                      <div style={styles.teacherInfo}>
                        <img
                          src="/media/teachers/teacher3.jpg"
                          alt="میثم بیات"
                          style={styles.teacherAvatar}
                          className="teacher-avatar"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => { e.target.style.background = 'linear-gradient(135deg, #7C3AED, #EC4899)'; }}
                        />
                        <div style={styles.teacherText}>
                          <span style={styles.teacherName} className="teacher-name">میثم</span>
                          <span style={styles.teacherFamily} className="teacher-family">بیات</span>
                        </div>
                      </div>
                      <div style={styles.priceWrap}>
                        <span style={styles.priceText} className="price-text">{finalPrice} تومان</span>
                      </div>
                      <Link
                        to={`/package/${pkg.id}`}
                        style={styles.registerBtn}
                        className="register-btn"
                        onClick={(e) => e.stopPropagation()}
                      >
                        ثبت نام
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {!isMobile && (
              <button onClick={() => scrollCourses('right')} style={{ ...styles.arrowBtn, right: '-10px' }} className="arrow-btn" aria-label="بعدی">
                <Icons.ArrowRightSmall size={16} color="#1A1A2E" />
              </button>
            )}
          </div>

          <div style={styles.moreWrapper}>
            <Link to="/packages" style={styles.moreBtn} className="more-btn">
              <Icons.Grid size={16} color="#7C3AED" />
              <span>همه دوره ها</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== ۲. خدمات ما ===== */}
      <section style={styles.servicesSection} className="services-section">
        <div style={styles.servicesGlow}></div>

        <div style={styles.servicesContainer} className="container">
          <div style={styles.servicesHeader}>
            <h2 style={styles.servicesTitle} className="services-title-responsive">خدمات ما</h2>
            <div style={styles.servicesTitleUnderline}></div>
            <p style={styles.servicesSubtitle} className="services-subtitle-responsive">
              ارائه دهنده آموزش های جامع و کاربردی در حوزه امور اینترنتی، ثبت‌نام‌های آنلاین و مهارت‌های دیجیتال
            </p>
          </div>

          <div style={styles.servicesSliderWrap} className="services-slider-wrapper">
            <button onClick={() => scrollServices('left')} style={{ ...styles.servicesArrow, left: '10px' }} className="service-arrow" aria-label="قبلی">
              <Icons.ArrowLeftSmall size={16} color="#1A1A2E" />
            </button>

            <div ref={servicesScrollRef} style={styles.servicesRow} className="services-row">
              {services.map((s) => (
                <div key={s.id} style={styles.serviceCard} className="service-card">
                  <div style={styles.serviceCircle}>
                    <Icons.GradientCircle size={36} />
                  </div>

                  <h3 style={styles.serviceTitle} className="service-title">{s.title}</h3>
                  <div style={styles.serviceTitleUnderline}></div>
                  <p style={styles.serviceDesc} className="service-desc">{s.description}</p>

                  <div style={styles.serviceCheckWrap} className="service-check">
                    <Icons.CheckCircle size={44} />
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => scrollServices('right')} style={{ ...styles.servicesArrow, right: '10px' }} className="service-arrow" aria-label="بعدی">
              <Icons.ArrowRightSmall size={16} color="#1A1A2E" />
            </button>
          </div>
        </div>

        <div style={styles.waveBottom}>
          <svg viewBox="0 0 1440 100" preserveAspectRatio="none" style={{ width: '100%', height: '100px', display: 'block' }}>
            <path d="M0,50 C360,100 720,0 1080,50 C1260,75 1380,60 1440,50 L1440,100 L0,100 Z" fill="#FFFFFF" />
          </svg>
          <div style={styles.chevronDown} className="chevron-down">
            <Icons.ChevronDown size={22} color="#1A1A2E" />
          </div>
        </div>
      </section>

      {/* ===== ۳. درباره من ===== */}
      <section style={styles.aboutSection} className="about-section">
        <div style={styles.aboutDotsTop} className="about-dots-top">
          {ABOUT_DOTS_TOP.map((_, i) => <span key={i} style={styles.aboutDotTop}/>)}
        </div>

        <div style={styles.container} className="container">
          <div style={styles.aboutGrid} className="about-grid">
            <div style={styles.aboutImageWrapper} className="about-image-wrapper">
              <img
                src="/media/teachers/about-us.jpg"
                alt="درباره میثم بیات"
                style={styles.aboutImage}
                className="about-image"
                loading="lazy"
                decoding="async"
                onError={(e) => { e.target.style.background = 'linear-gradient(135deg, #7C3AED, #EC4899)'; }}
              />
              <div style={styles.aboutBadge} className="about-badge">
                <span style={styles.aboutBadgeNumber} className="about-badge-number">+۱۰</span>
                <span style={styles.aboutBadgeText} className="about-badge-text">سال تجربه</span>
              </div>
            </div>

            <div style={styles.aboutContent}>
              <div style={styles.aboutTitleRow}>
                <div style={styles.aboutTitleLine}></div>
                <h2 style={styles.aboutTitle} className="about-title-responsive">درباره من</h2>
              </div>
              <div style={styles.titleUnderlineRight}></div>

              <p style={styles.aboutText} className="about-text">
                من میثم بیات هستم؛ متخصص امور اینترنتی، ثبت‌نام‌های آنلاین و آموزش مهارت‌های دیجیتال. سال‌هاست در حوزه
                خدمات اینترنتی فعالیت می‌کنم و تجربه زیادی در انجام و آموزش فرآیندهای آنلاین به دست آورده‌ام.
              </p>
              <p style={styles.aboutText} className="about-text">
                با گسترش هوش مصنوعی، مسیر فعالیت من وارد دنیای جدیدی شد؛ دنیایی که در آن فناوری می‌تواند بسیاری از کارها
                را ساده‌تر و سریع‌تر کند. آکادمی بیات را با هدف آموزش ساده، کاربردی و قابل‌فهم هوش مصنوعی و ابزارهای
                نوین دیجیتال راه‌اندازی کردم.
              </p>
              <p style={styles.aboutText} className="about-text">
                در این آکادمی، تمرکز من روی آموزش هوش مصنوعی، تولید محتوا و مهارت‌های کاربردی اینترنتی است. تلاش می‌کنم
                آموزش‌ها کاملاً عملی باشند تا بتوانید آن‌ها را مستقیماً در کار، کسب‌وکار و زندگی روزمره به کار بگیرید.
              </p>
              <p style={styles.aboutText} className="about-text">
                هدف من این است که استفاده از تکنولوژی و هوش مصنوعی برای همه، ساده، جذاب و قابل‌دسترس باشد. به آکادمی
                بیات خوش آمدید؛ جایی برای یادگیری، رشد و ساختن آینده‌ای هوشمندتر.
              </p>

              <div style={styles.socialRow}>
                <a href="https://instagram.com/bayatacademyy" target="_blank" rel="noopener noreferrer" style={styles.socialBtn} className="social-btn" aria-label="اینستاگرام">
                  <FaInstagram size={18}/>
                </a>
                <a href="https://t.me/meysamnet_ir" target="_blank" rel="noopener noreferrer" style={styles.socialBtn} className="social-btn" aria-label="تلگرام">
                  <FaTelegram size={18}/>
                </a>
                <a href="https://wa.me/989191203500" target="_blank" rel="noopener noreferrer" style={styles.socialBtn} className="social-btn" aria-label="واتساپ">
                  <FaWhatsapp size={18}/>
                </a>
                <a href="https://www.youtube.com/@BayatAcademyy" target="_blank" rel="noopener noreferrer" style={styles.socialBtn} className="social-btn" aria-label="یوتیوب">
                  <FaYoutube size={18}/>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ۴. آمار ===== */}
      <section style={styles.statsSection} className="stats-section">
        <div style={styles.container} className="container">
          <div style={styles.statsGrid} className="stats-grid">
            <div style={styles.statCard} className="stat-card">
              <div style={styles.statIconWrap} className="stat-icon-wrap"><Icons.Users size={28}/></div>
              <div style={styles.statNumber} className="stat-number">۱۰,۰۰۰+</div>
              <div style={styles.statLabel} className="stat-label">دانشجو</div>
              <div style={styles.statLine}></div>
            </div>
            <div style={styles.statCard} className="stat-card">
              <div style={{...styles.statIconWrap, background: 'rgba(236,72,153,0.08)'}} className="stat-icon-wrap">
                <Icons.VideoIcon size={28} color="#EC4899"/>
              </div>
              <div style={styles.statNumber} className="stat-number">۴,۰۰۰+</div>
              <div style={styles.statLabel} className="stat-label">ساعت ویدیو</div>
              <div style={{...styles.statLine, background: 'linear-gradient(90deg, transparent, #EC4899, transparent)'}}></div>
            </div>
            <div style={styles.statCard} className="stat-card">
              <div style={{...styles.statIconWrap, background: 'rgba(16,185,129,0.08)'}} className="stat-icon-wrap">
                <Icons.BookOpen size={28} color="#10B981"/>
              </div>
              <div style={styles.statNumber} className="stat-number">۳,۰۰۰+</div>
              <div style={styles.statLabel} className="stat-label">دوره آموزشی</div>
              <div style={{...styles.statLine, background: 'linear-gradient(90deg, transparent, #10B981, transparent)'}}></div>
            </div>
            <div style={styles.statCard} className="stat-card">
              <div style={{...styles.statIconWrap, background: 'rgba(245,158,11,0.08)'}} className="stat-icon-wrap">
                <Icons.Award size={28} color="#F59E0B"/>
              </div>
              <div style={styles.statNumber} className="stat-number">۱,۰۰۰+</div>
              <div style={styles.statLabel} className="stat-label">مدرک معتبر</div>
              <div style={{...styles.statLine, background: 'linear-gradient(90deg, transparent, #F59E0B, transparent)'}}></div>
            </div>
          </div>
        </div>
      </section>

      <Footer/>
    </div>
  );
}

const styles = {
  // ✅ FIXED: overflowX instead of overflow
  pageContainer: { position: 'relative', minHeight: '100vh', overflowX: 'hidden', backgroundColor: '#FFFFFF', fontFamily: 'Vazirmatn, sans-serif' },
  container: { maxWidth: '1240px', margin: '0 auto', padding: '0 24px' },

  loading: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' },
  spinner: { width: '36px', height: '36px', border: '2px solid rgba(124,58,237,0.1)', borderTop: '2px solid #7C3AED', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  loadingText: { color: 'rgba(26,26,46,0.5)', fontSize: '14px' },
  error: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' },
  errorTitle: { color: '#EC4899', fontSize: '18px' },
  retryBtn: { padding: '12px 28px', background: '#7C3AED', color: '#FFFFFF', border: 'none', borderRadius: '50px', cursor: 'pointer', fontSize: '14px', fontFamily: 'Vazirmatn, sans-serif' },

  purpleBlobMain: { position: 'absolute', top: '-50px', right: '-100px', width: '550px', height: '550px', background: 'linear-gradient(135deg, #A855F7 0%, #7C3AED 40%, #4C1D95 80%, #2E1065 100%)', borderRadius: '65% 35% 45% 55% / 55% 50% 50% 45%', zIndex: 0, pointerEvents: 'none', transform: 'rotate(-15deg)', contain: 'paint', willChange: 'transform' },
  purpleBlobGlow: { position: 'absolute', top: '100px', right: '-150px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)', zIndex: 0, pointerEvents: 'none', contain: 'paint' },

  heroDots: { position: 'absolute', top: '120px', right: '8%', width: '100px', display: 'flex', flexWrap: 'wrap', gap: '8px', zIndex: 2, pointerEvents: 'none' },
  heroDot: { width: '3px', height: '3px', borderRadius: '50%', background: '#A855F7' },

  coursesSection: { padding: '80px 0 40px', backgroundColor: '#FFFFFF', position: 'relative', zIndex: 1 },
  sectionHeader: { textAlign: 'center', marginBottom: '50px', position: 'relative', display: 'inline-block', width: '100%' },
  sectionTitle: { fontSize: 'clamp(22px, 2.8vw, 32px)', fontWeight: '800', color: '#1A1A2E', position: 'relative', zIndex: 2, display: 'inline-block', margin: 0 },
  sectionTitleEn: { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: 'clamp(34px, 5vw, 60px)', fontWeight: '800', color: 'rgba(124,58,237,0.05)', letterSpacing: '6px', whiteSpace: 'nowrap', zIndex: 1, textTransform: 'uppercase', pointerEvents: 'none', fontFamily: 'Arial, sans-serif' },

  sliderWrapper: { position: 'relative', padding: '0 12px' },
  arrowBtn: { position: 'absolute', top: '42%', transform: 'translateY(-50%)', width: '44px', height: '44px', borderRadius: '50%', background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 5, transition: 'background 0.3s ease' },
  coursesRow: { display: 'flex', gap: '24px', overflowX: 'auto', padding: '10px 4px 30px', scrollBehavior: 'smooth', scrollbarWidth: 'none', msOverflowStyle: 'none' },

  courseCard: { flex: '0 0 360px', display: 'flex', flexDirection: 'column', transition: 'transform 0.4s ease', cursor: 'pointer', borderRadius: '20px' },
  courseImageWrap: { width: '100%', height: '260px', borderRadius: '20px', overflow: 'hidden', backgroundColor: '#F5F3FF', position: 'relative' },
  courseImage: { width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease', display: 'block' },

  courseInfoBox: { backgroundColor: '#FFFFFF', padding: '16px 20px', borderRadius: '16px', marginTop: '-28px', marginLeft: '16px', marginRight: '16px', position: 'relative', zIndex: 4, boxShadow: '0 8px 24px rgba(0,0,0,0.06)', textAlign: 'center' },
  courseInfoText: { fontSize: '13px', color: '#1A1A2E', fontWeight: '600', lineHeight: '1.7', margin: 0 },
  gradientDivider: { height: '3px', width: '40%', margin: '18px auto', background: 'linear-gradient(90deg, transparent, #EC4899, transparent)', borderRadius: '10px', transition: 'width 0.4s ease' },
  courseBottomRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', padding: '0 8px' },
  teacherInfo: { display: 'flex', alignItems: 'center', gap: '8px' },
  teacherAvatar: { width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #F5F3FF' },
  teacherText: { display: 'flex', flexDirection: 'column', lineHeight: 1.2 },
  teacherName: { fontSize: '12px', fontWeight: '700', color: '#1A1A2E' },
  teacherFamily: { fontSize: '11px', fontWeight: '500', color: 'rgba(26,26,46,0.5)' },
  priceWrap: { display: 'flex', alignItems: 'center' },
  priceText: { fontSize: '13px', fontWeight: '800', color: '#10B981', whiteSpace: 'nowrap' },
  registerBtn: { padding: '8px 18px', borderRadius: '10px', background: 'linear-gradient(135deg, #34D399, #10B981)', color: '#FFFFFF', fontSize: '13px', fontWeight: '700', textDecoration: 'none', transition: 'background 0.3s ease, box-shadow 0.3s ease', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(16,185,129,0.25)' },

  moreWrapper: { display: 'flex', justifyContent: 'center', marginTop: '20px' },
  moreBtn: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 32px', borderRadius: '12px', background: 'transparent', border: '1.5px solid #7C3AED', color: '#1A1A2E', fontSize: '14px', fontWeight: '700', textDecoration: 'none', transition: 'background 0.3s ease, color 0.3s ease', fontFamily: 'Vazirmatn, sans-serif' },

  servicesSection: { position: 'relative', backgroundColor: '#0A0415', padding: '80px 0 120px', overflowX: 'hidden', marginTop: '20px' },
  servicesGlow: { position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%, -50%)', width: '900px', height: '500px', background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.25) 0%, rgba(236,72,153,0.06) 40%, transparent 70%)', pointerEvents: 'none', zIndex: 1, contain: 'paint' },
  servicesContainer: { maxWidth: '1280px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 2 },
  servicesHeader: { textAlign: 'center', marginBottom: '56px' },
  servicesTitle: { fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '800', color: '#FFFFFF', marginBottom: '14px', letterSpacing: '-0.5px' },
  servicesTitleUnderline: { width: '80px', height: '3px', margin: '0 auto 20px', background: 'linear-gradient(90deg, #7C3AED, #EC4899)', borderRadius: '10px' },
  servicesSubtitle: { fontSize: 'clamp(13px, 1.2vw, 15px)', color: '#EC4899', fontWeight: '500', maxWidth: '640px', margin: '0 auto', lineHeight: '1.9' },
  servicesSliderWrap: { position: 'relative', padding: '0 20px' },
  servicesRow: { display: 'flex', gap: '20px', overflowX: 'auto', padding: '20px 8px 30px', scrollBehavior: 'smooth', scrollbarWidth: 'none', msOverflowStyle: 'none' },
  servicesArrow: { position: 'absolute', top: '50%', transform: 'translateY(-50%)', width: '42px', height: '42px', borderRadius: '50%', background: '#FFFFFF', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 20px rgba(124,58,237,0.3)', zIndex: 5, transition: 'background 0.3s ease' },

  serviceCard: { flex: '0 0 320px', padding: '32px 24px 70px', background: 'linear-gradient(rgba(20, 12, 40, 0.98), rgba(20, 12, 40, 0.98)), linear-gradient(135deg, #7C3AED, #EC4899)', borderRadius: '20px', position: 'relative', border: '1.5px solid transparent', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box', transition: 'transform 0.3s ease', display: 'flex', flexDirection: 'column', cursor: 'pointer', minHeight: '400px', willChange: 'transform' },
  serviceCircle: { position: 'absolute', top: '-18px', right: '24px', background: '#0A0415', borderRadius: '50%', padding: '4px' },
  serviceTitle: { fontSize: '19px', fontWeight: '800', color: '#FFFFFF', marginBottom: '8px', textAlign: 'right', margin: '16px 0 0' },
  serviceTitleUnderline: { width: '40px', height: '3px', background: 'linear-gradient(90deg, #7C3AED, #EC4899)', borderRadius: '10px', marginBottom: '18px' },
  serviceDesc: { fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: '2', textAlign: 'right', fontWeight: '400', margin: 0, flex: 1 },
  serviceCheckWrap: { position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  waveBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, lineHeight: 0, zIndex: 3, transform: 'translateZ(0)', pointerEvents: 'none' },
  chevronDown: { position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 4, animation: 'bounceDown 2s infinite', background: '#FFFFFF', borderRadius: '50%', padding: '6px 8px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', willChange: 'transform' },

  aboutSection: { padding: '80px 0 70px', backgroundColor: '#FFFFFF', position: 'relative' },
  aboutDotsTop: { position: 'absolute', top: '30px', right: '15%', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px', opacity: 0.5 },
  aboutDotTop: { width: '3px', height: '3px', borderRadius: '50%', background: '#A855F7' },
  aboutGrid: { display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '50px', alignItems: 'center' },
  aboutImageWrapper: { position: 'relative', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(124,58,237,0.15)' },
  aboutImage: { width: '100%', height: '400px', objectFit: 'cover', display: 'block' },
  aboutBadge: { position: 'absolute', bottom: '20px', left: '20px', backgroundColor: '#FFFFFF', padding: '16px 24px', borderRadius: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  aboutBadgeNumber: { fontSize: '24px', fontWeight: '800', color: '#7C3AED' },
  aboutBadgeText: { fontSize: '12px', color: 'rgba(26,26,46,0.5)', fontWeight: '600' },
  aboutContent: { display: 'flex', flexDirection: 'column' },
  aboutTitleRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  aboutTitleLine: { width: '4px', height: '32px', background: 'linear-gradient(180deg, #A855F7, #EC4899)', borderRadius: '10px' },
  aboutTitle: { fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: '800', color: '#1A1A2E', margin: 0 },
  titleUnderlineRight: { width: '60px', height: '4px', margin: '10px 0 24px', background: 'linear-gradient(90deg, #7C3AED, #EC4899)', borderRadius: '10px' },
  aboutText: { fontSize: '15px', color: 'rgba(26,26,46,0.6)', lineHeight: '1.9', marginBottom: '16px' },
  socialRow: { display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' },
  socialBtn: { width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#FFFFFF', border: '1px solid rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C3AED', textDecoration: 'none', transition: 'background 0.3s ease, color 0.3s ease', boxShadow: '0 4px 12px rgba(124,58,237,0.06)' },

  statsSection: { padding: '60px 0', backgroundColor: '#F9FAFB', borderTop: '1px solid rgba(0,0,0,0.04)' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' },
  statCard: { padding: '28px 20px', backgroundColor: '#FFFFFF', borderRadius: '20px', boxShadow: '0 4px 24px rgba(124,58,237,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', border: '1px solid rgba(124,58,237,0.08)', transition: 'transform 0.3s ease, box-shadow 0.3s ease', position: 'relative' },
  statIconWrap: { width: '56px', height: '56px', borderRadius: '16px', backgroundColor: 'rgba(124,58,237,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statNumber: { fontSize: '26px', fontWeight: '800', color: '#1A1A2E' },
  statLabel: { fontSize: '13px', color: 'rgba(26,26,46,0.5)', fontWeight: '600' },
  statLine: { position: 'absolute', bottom: '8px', left: '30%', right: '30%', height: '2px', background: 'linear-gradient(90deg, transparent, #7C3AED, transparent)', borderRadius: '10px' },
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  @keyframes bounceDown {
    0%, 100% { transform: translate3d(-50%, 0, 0); }
    50% { transform: translate3d(-50%, 6px, 0); }
  }

  .courses-row::-webkit-scrollbar, .services-row::-webkit-scrollbar { display: none; }

  /* Hover (desktop only) */
  @media (hover: hover) {
    .course-card:hover { transform: translate3d(0, -10px, 0); }
    .course-card:hover .course-image { transform: scale(1.15); }
    .course-card:hover .register-btn {
      background: linear-gradient(135deg, #7C3AED, #5B21B6) !important;
      box-shadow: 0 8px 20px rgba(124,58,237,0.4) !important;
      color: #FFFFFF !important;
    }
    .course-card:hover .gradient-divider { width: 70%; }
    .register-btn:hover { box-shadow: 0 8px 20px rgba(16,185,129,0.4); }
    .arrow-btn:hover { background: #7C3AED !important; }
    .arrow-btn:hover svg path { stroke: #FFFFFF !important; }
    .more-btn:hover { background: #7C3AED !important; color: #FFFFFF !important; }
    .more-btn:hover svg rect { stroke: #FFFFFF !important; }
    .social-btn:hover { background: #7C3AED !important; color: #FFFFFF !important; }
    .stat-card:hover { transform: translate3d(0, -6px, 0); box-shadow: 0 12px 40px rgba(124,58,237,0.12); }
    .service-card:hover { transform: translate3d(0, -6px, 0); box-shadow: 0 20px 50px rgba(124,58,237,0.35); }
    .service-arrow:hover { background: linear-gradient(135deg, #7C3AED, #EC4899) !important; }
    .service-arrow:hover svg path { stroke: #FFFFFF !important; }
  }

  /* Tablet */
  @media (max-width: 1024px) {
    .courses-section { padding: 60px 0 30px !important; }
    .services-section { padding: 60px 0 100px !important; }
    .about-section { padding: 60px 0 50px !important; }
    .stats-section { padding: 40px 0 !important; }

    .about-grid { grid-template-columns: 1fr !important; gap: 30px !important; }
    .about-image-wrapper { max-width: 600px !important; margin: 0 auto !important; width: 100% !important; }
    .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }

    .section-title-en-responsive { letter-spacing: 4px !important; }
    .hero-dots { display: none !important; }
    .purple-blob-main { opacity: 0.7 !important; }
  }

  /* Mobile ≤768 */
  @media (max-width: 768px) {
    .courses-section { padding: 50px 0 20px !important; }
    .services-section { padding: 50px 0 80px !important; }
    .about-section { padding: 50px 0 40px !important; }
    .stats-section { padding: 30px 0 !important; }

    .container { padding: 0 16px !important; }

    .section-title-responsive { font-size: 22px !important; }
    .section-title-en-responsive { font-size: 32px !important; letter-spacing: 3px !important; }

    .course-card { flex: 0 0 300px !important; }
    .course-image-wrap { height: 220px !important; }
    .teacher-avatar { width: 40px !important; height: 40px !important; }

    .service-card {
      flex: 0 0 280px !important;
      min-height: 360px !important;
      padding: 24px 20px 60px !important;
    }
    .services-title-responsive { font-size: 28px !important; }
    .services-subtitle-responsive { font-size: 13px !important; }

    .arrow-btn, .service-arrow { display: none !important; }

    .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .stat-card { padding: 22px 14px !important; }
    .stat-number { font-size: 22px !important; }
    .stat-icon-wrap { width: 48px !important; height: 48px !important; }

    .about-title-responsive { font-size: 24px !important; }
    .about-dots-top { display: none !important; }
    .about-image { height: 320px !important; }

    .slider-wrapper, .services-slider-wrapper { padding: 0 8px !important; }

    /* Perf: kill transitions, hide blobs */
    .course-card, .service-card, .stat-card {
      transition: none !important;
      will-change: auto !important;
    }
    .course-image { transition: none !important; }
    .purple-blob-main { display: none !important; }
    .hero-dots { display: none !important; }

    * {
      -webkit-tap-highlight-color: transparent;
      -webkit-touch-callout: none;
    }
  }

  /* Mobile ≤480 */
  @media (max-width: 480px) {
    .courses-section { padding: 40px 0 20px !important; }
    .services-section { padding: 40px 0 70px !important; }
    .about-section { padding: 40px 0 30px !important; }

    .section-title-responsive { font-size: 19px !important; }
    .section-title-en-responsive { font-size: 26px !important; letter-spacing: 2px !important; }

    .course-card { flex: 0 0 270px !important; }
    .course-image-wrap { height: 190px !important; }
    .course-info-box {
      padding: 12px 14px !important;
      margin-left: 12px !important;
      margin-right: 12px !important;
    }
    .course-info-text { font-size: 12px !important; line-height: 1.6 !important; }
    .course-bottom-row { padding: 0 4px !important; gap: 6px !important; }

    .teacher-avatar { width: 44px !important; height: 44px !important; }
    .teacher-name { font-size: 13px !important; }
    .teacher-family { font-size: 12px !important; }
    .price-text { font-size: 12px !important; }
    .register-btn { font-size: 12px !important; padding: 8px 14px !important; }

    .service-card {
      flex: 0 0 260px !important;
      min-height: 340px !important;
      padding: 20px 16px 56px !important;
    }
    .service-title { font-size: 16px !important; }
    .service-desc { font-size: 12px !important; line-height: 1.9 !important; }
    .services-title-responsive { font-size: 24px !important; }
    .services-subtitle-responsive { font-size: 12px !important; }

    .about-title-responsive { font-size: 22px !important; }
    .about-image { height: 260px !important; }
    .about-badge {
      padding: 12px 18px !important;
      bottom: 14px !important;
      left: 14px !important;
    }
    .about-badge-number { font-size: 20px !important; }
    .about-badge-text { font-size: 11px !important; }
    .about-text { font-size: 14px !important; line-height: 1.85 !important; }

    .social-btn { width: 42px !important; height: 42px !important; }

    .stat-card { padding: 18px 10px !important; gap: 8px !important; }
    .stat-number { font-size: 20px !important; }
    .stat-label { font-size: 12px !important; }
    .stat-icon-wrap { width: 44px !important; height: 44px !important; }
    .stat-icon-wrap svg { width: 24px !important; height: 24px !important; }

    .more-btn { padding: 12px 28px !important; font-size: 14px !important; }
  }

  @media (max-width: 360px) {
    .course-card { flex: 0 0 250px !important; }
    .service-card { flex: 0 0 240px !important; }
    .section-title-responsive { font-size: 17px !important; }
    .section-title-en-responsive { font-size: 22px !important; }

    .stats-grid { grid-template-columns: 1fr !important; }
    .stat-card { padding: 16px 12px !important; }

    .about-image { height: 220px !important; }
    .about-badge { padding: 10px 14px !important; }
    .about-badge-number { font-size: 18px !important; }
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  .courses-row, .services-row {
    transform: translateZ(0);
    -webkit-overflow-scrolling: touch;
  }
`;
document.head.appendChild(styleSheet);

export default Homepage;
import React, { useState, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaInstagram, FaPlay, FaBrain, FaGlobe, FaGraduationCap
} from 'react-icons/fa';

// ===== لیست دقیق عکس‌های موجود =====
const ALL_TEACHER_IMAGES = [
  '/media/teachers/teacher1.jpg',
  '/media/teachers/teacher2.jpg',
  '/media/teachers/teacher3.jpg',
  '/media/teachers/teacher4.jpg',
  '/media/teachers/teacher5.jpg',
  '/media/teachers/teacher6.jpg',
  '/media/teachers/teacher7.jpg',
  '/media/teachers/teacher8.jpg',
  '/media/teachers/teacher9.jpg',
  '/media/teachers/teacher10.jpg',
  '/media/teachers/teacher11.jpg',
  '/media/teachers/teacher12.jpg',
  '/media/teachers/teacher13.jpg',
  '/media/teachers/teacher14.jpg',
  '/media/teachers/teacher15.jpg',
  '/media/teachers/teacher16.jpg',
  '/media/teachers/teacher17.jpg',
  '/media/teachers/teacher18.jpg',
  '/media/teachers/teacher19.jpg',
  '/media/teachers/teacher20.jpg',
  '/media/teachers/teacher21.jpg',
  '/media/teachers/teacher22.jpg',
  '/media/teachers/teacher23.jpg',
];

const GRID_SLOTS = 7;

const getRandomTeacherImages = () => {
  const images = [];
  const usedIndexes = new Set();
  while (images.length < GRID_SLOTS) {
    const idx = Math.floor(Math.random() * ALL_TEACHER_IMAGES.length);
    if (!usedIndexes.has(idx)) {
      usedIndexes.add(idx);
      images.push(ALL_TEACHER_IMAGES[idx]);
    }
  }
  return images;
};

const TOP_DOTS = [...Array(20)].map(() => Math.random() * 0.7 + 0.3);

const TeacherCard = memo(({ src, marginTop = 0 }) => (
  <div
    style={{ ...styles.teacherImgCard, marginTop: marginTop ? `${marginTop}px` : 0 }}
    className="teacher-img-card"
  >
    <img
      src={src}
      alt=""
      style={styles.teacherMasonryImg}
      loading="lazy"
      decoding="async"
      onError={(e) => { e.target.style.background = 'linear-gradient(135deg, #7C3AED, #EC4899)'; }}
    />
  </div>
));

const FadedCard = memo(({ type }) => {
  if (type === 'followers') {
    return (
      <div style={styles.teacherImgCardFaded} className="teacher-faded-card">
        <span style={styles.fadedText}>Personal</span>
        <span style={styles.fadedSubText}>GALLERY</span>
      </div>
    );
  }
  if (type === 'play') {
    return (
      <div style={styles.teacherImgCardFaded} className="teacher-faded-card">
        <FaPlay size={18} color="#A78BFA" />
      </div>
    );
  }
  if (type === 'instagram') {
    return (
      <div style={styles.teacherImgCardFaded} className="teacher-faded-card">
        <FaInstagram size={20} color="#A78BFA" />
      </div>
    );
  }
  if (type === 'handle') {
    return (
      <div style={styles.teacherImgCardFaded} className="teacher-faded-card">
        <span style={styles.fadedHandle}>bayatacademyy@</span>
      </div>
    );
  }
  return null;
});

function Hero() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [teacherImages, setTeacherImages] = useState(getRandomTeacherImages);

  useEffect(() => {
    if (typeof window === 'undefined' || window.innerWidth <= 768) return;

    const interval = setInterval(() => {
      setTeacherImages(getRandomTeacherImages());
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.hero} className="hero-root">
      <div style={styles.bgCircle1} className="hero-bg-decor"></div>
      <div style={styles.bgCircle2} className="hero-bg-decor"></div>
      <div style={styles.bgCircle3} className="hero-bg-decor"></div>
      <div style={styles.centerGlow} className="hero-bg-decor"></div>

      <div style={styles.topDots} className="hero-top-dots">
        {TOP_DOTS.map((op, i) => (
          <span key={i} style={{ ...styles.topDot, opacity: op }} />
        ))}
      </div>

      <div style={styles.container}>
        <div style={styles.grid} className="hero-grid">

          {/* ============ ستون چپ ============ */}
          <div style={styles.leftCol}>
            <div style={styles.heroImageWrap} className="hero-image-wrap">
              <div style={styles.heroImageCircle} className="hero-image-circle"></div>

              <img
                src="/media/teachers/yman.png"
                alt="میثم بیات"
                style={styles.heroMainImage}
                className="hero-main-image"
                loading="eager"
                decoding="async"
                onError={(e) => { e.target.style.display = 'none'; }}
              />

              {/* کارت ۳ آیکون خدمات */}
              <div style={styles.servicesIconsCard} className="services-icons-card">
                <div style={styles.servicesIconsRow} className="services-icons-row">
                  <div style={styles.serviceIconItem} className="service-icon-item">
                    <div style={styles.serviceIconCircle} className="service-icon-circle">
                      <FaBrain size={20} color="#FFFFFF" />
                    </div>
                    <span style={styles.serviceIconLabel} className="service-icon-label">هوش مصنوعی</span>
                  </div>
                  <div style={styles.serviceIconItem} className="service-icon-item">
                    <div style={styles.serviceIconCircle} className="service-icon-circle">
                      <FaGlobe size={20} color="#FFFFFF" />
                    </div>
                    <span style={styles.serviceIconLabel} className="service-icon-label">امور اینترنتی</span>
                  </div>
                  <div style={styles.serviceIconItem} className="service-icon-item">
                    <div style={styles.serviceIconCircle} className="service-icon-circle">
                      <FaGraduationCap size={20} color="#FFFFFF" />
                    </div>
                    <span style={styles.serviceIconLabel} className="service-icon-label">مهارت‌های دیجیتال</span>
                  </div>
                </div>
              </div>

              {/* کارت دانشجو */}
              <div style={styles.studentCard} className="student-card">
                <span style={styles.studentHighlight} className="student-highlight">از همین الان</span>
                <span style={styles.studentText} className="student-text">یادگیری رو بدون دردسر شروع کن</span>
              </div>

              {/* دکمه Play */}
              <button style={styles.playBtn} className="play-btn" aria-label="پخش ویدیو">
                <FaPlay size={11} color="#FFFFFF" />
              </button>

              {/* مکعب ۳بعدی */}
              <div style={styles.cube3D} className="cube-3d">
                <div style={styles.cubeInner}></div>
              </div>

              <div style={styles.floatingDot1} className="floating-dot-1" />
              <div style={styles.floatingDot2} className="floating-dot-2" />
            </div>

            {/* Photo grid — hidden on mobile via CSS */}
            <div style={styles.teachersMasonry} className="teachers-masonry">
              <div style={styles.masonryCol}>
                <TeacherCard src={teacherImages[0]} />
                <FadedCard type="followers" />
              </div>
              <div style={styles.masonryCol}>
                <TeacherCard src={teacherImages[1]} marginTop={30} />
                <FadedCard type="play" />
              </div>
              <div style={styles.masonryCol}>
                <TeacherCard src={teacherImages[2]} />
                <TeacherCard src={teacherImages[3]} />
              </div>
              <div style={styles.masonryCol}>
                <TeacherCard src={teacherImages[4]} marginTop={20} />
                <FadedCard type="instagram" />
              </div>
              <div style={styles.masonryCol}>
                <TeacherCard src={teacherImages[5]} marginTop={40} />
                <FadedCard type="handle" />
              </div>
              <div style={styles.masonryCol}>
                <TeacherCard src={teacherImages[6]} />
                <FadedCard type="play" />
              </div>
            </div>
          </div>

          {/* ============ ستون راست ============ */}
          <div style={styles.textWrapper} className="text-wrapper">
            <div style={styles.topLineWrap}>
              <span style={styles.instagramTag}>تولید محتوا و هوش مصنوعی با</span>
            </div>

            <div style={styles.titleRow} className="title-row">
              <h1 style={styles.title} className="hero-title">میثم بیات</h1>
              <div style={styles.titleHorizontalLine} className="hero-title-line"></div>
            </div>

            <p style={styles.subtitle} className="hero-subtitle">
              متخصص امور اینترنتی، ثبت‌نام‌های آنلاین و آموزش مهارت‌های دیجیتال
            </p>

            <div style={styles.bottomRow} className="hero-bottom-row">
              <a
                href="https://instagram.com/bayatacademyy"
                target="_blank"
                rel="noopener noreferrer"
                style={styles.instagramBtn}
                className="instagram-btn"
              >
                <FaInstagram size={16} color="#A78BFA"/>
                <span style={styles.instagramBtnText}>پیج اینستاگرام</span>
              </a>
              <Link to="/register" style={styles.consultBtn} className="consult-btn">
                <span style={styles.consultBtnIcon}>↗</span>
                <span>ثبت نام</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  hero: {
    position: 'relative',
    paddingTop: '100px',
    paddingBottom: '60px',
    backgroundColor: '#0A0415',
    overflowX: 'hidden',
    minHeight: '800px',
    fontFamily: 'Vazirmatn, sans-serif',
  },

  bgCircle1: { position: 'absolute', top: '5%', left: '20%', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.35) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 },
  bgCircle2: { position: 'absolute', bottom: '15%', left: '0%', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.25) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 },
  bgCircle3: { position: 'absolute', top: '40%', left: '40%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.18) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 },

  centerGlow: { position: 'absolute', top: '30%', left: '30%', transform: 'translate(-50%, -50%)', width: '800px', height: '500px', background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.28) 0%, rgba(236,72,153,0.08) 40%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 },

  topDots: { position: 'absolute', top: '50px', right: '8%', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', zIndex: 3, pointerEvents: 'none' },
  topDot: { width: '4px', height: '4px', borderRadius: '50%', background: '#A78BFA' },

  container: { maxWidth: '1400px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 },
  grid: { display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '50px', alignItems: 'flex-start' },

  leftCol: { display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' },

  heroImageWrap: { position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: '650px', minHeight: '420px', marginBottom: '30px' },

  heroImageCircle: { position: 'absolute', top: '5%', left: '50%', transform: 'translateX(-50%)', width: '340px', height: '340px', borderRadius: '50%', background: 'linear-gradient(135deg, #A855F7 0%, #7C3AED 50%, #5B21B6 100%)', opacity: 0.95, zIndex: 0, boxShadow: '0 0 100px rgba(168,85,247,0.6)' },

  heroMainImage: { width: '100%', maxWidth: '460px', height: 'auto', objectFit: 'contain', position: 'relative', zIndex: 2, filter: 'drop-shadow(0 20px 60px rgba(168,85,247,0.5))' },

  servicesIconsCard: {
    position: 'absolute', top: '0', right: '0',
    display: 'flex', alignItems: 'center',
    padding: '14px 18px',
    background: 'linear-gradient(135deg, #EC4899 0%, #7C3AED 100%)',
    borderRadius: '22px',
    boxShadow: '0 16px 40px rgba(236,72,153,0.5), 0 0 40px rgba(124,58,237,0.3)',
    zIndex: 5,
    border: '1.5px solid rgba(255,255,255,0.15)',
  },
  servicesIconsRow: { display: 'flex', alignItems: 'center', gap: '14px' },
  serviceIconItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' },
  serviceIconCircle: { width: '38px', height: '38px', borderRadius: '12px', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px solid rgba(255,255,255,0.35)' },
  serviceIconLabel: { fontSize: '9px', fontWeight: '700', color: '#FFFFFF', whiteSpace: 'nowrap' },

  studentCard: {
    position: 'absolute', bottom: '5%', left: '0',
    display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px',
    padding: '18px 22px',
    background: 'rgba(20, 12, 40, 0.9)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
    zIndex: 5, maxWidth: '240px',
    border: '1.5px solid transparent',
    backgroundImage: `linear-gradient(rgba(20, 12, 40, 0.9), rgba(20, 12, 40, 0.9)), linear-gradient(135deg, #7C3AED, #EC4899)`,
    backgroundOrigin: 'border-box',
    backgroundClip: 'padding-box, border-box',
  },
  studentHighlight: { fontSize: '16px', fontWeight: '800', color: '#EC4899' },
  studentText: { fontSize: '14px', fontWeight: '700', color: '#FFFFFF', lineHeight: '1.5' },

  playBtn: { position: 'absolute', top: '52%', right: '5%', transform: 'translateY(-50%)', width: '52px', height: '52px', borderRadius: '50%', background: '#0A0A1A', border: '3px solid #FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.4), 0 0 30px rgba(124,58,237,0.4)', zIndex: 6, transition: 'background 0.3s ease', paddingLeft: '4px' },

  cube3D: { position: 'absolute', top: '0', left: '5%', width: '55px', height: '55px', zIndex: 4 },
  cubeInner: { width: '100%', height: '100%', borderRadius: '14px', background: 'linear-gradient(135deg, #F59E0B 0%, #EC4899 50%, #7C3AED 100%)', boxShadow: '0 10px 30px rgba(236,72,153,0.6), inset -5px -5px 15px rgba(0,0,0,0.3), inset 5px 5px 15px rgba(255,255,255,0.3)', transform: 'rotate(-10deg)' },

  floatingDot1: { position: 'absolute', top: '28%', left: '12%', width: '14px', height: '14px', borderRadius: '50%', background: '#EC4899', zIndex: 4, boxShadow: '0 4px 12px rgba(236,72,153,0.7)' },
  floatingDot2: { position: 'absolute', top: '40%', left: '16%', width: '10px', height: '10px', borderRadius: '50%', background: '#A855F7', zIndex: 4, boxShadow: '0 4px 12px rgba(168,85,247,0.7)' },

  teachersMasonry: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '14px', width: '100%', maxWidth: '820px', marginTop: '20px' },
  masonryCol: { display: 'flex', flexDirection: 'column', gap: '14px' },

  teacherImgCard: { width: '100%', height: '160px', borderRadius: '20px', overflow: 'hidden', backgroundColor: 'rgba(20, 12, 40, 0.5)', position: 'relative', transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease', cursor: 'pointer', border: '1.5px solid rgba(124,58,237,0.2)', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' },
  teacherMasonryImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' },

  teacherImgCardFaded: { width: '100%', height: '110px', borderRadius: '20px', overflow: 'hidden', backgroundColor: 'rgba(20, 12, 40, 0.5)', border: '1.5px solid rgba(124,58,237,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', position: 'relative', transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease' },
  fadedText: { fontSize: '20px', fontWeight: '800', color: '#A78BFA', lineHeight: 1 },
  fadedSubText: { fontSize: '9px', fontWeight: '700', color: '#A78BFA', letterSpacing: '2px' },
  fadedHandle: { fontSize: '9px', fontWeight: '600', color: '#A78BFA', letterSpacing: '0.5px' },

  textWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', paddingTop: '120px', position: 'sticky', top: '120px' },

  topLineWrap: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' },
  instagramTag: { fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: '500' },

  titleRow: { display: 'flex', alignItems: 'center', gap: '16px', width: '100%', marginBottom: '16px' },
  title: { fontSize: 'clamp(34px, 4.2vw, 54px)', fontWeight: '800', lineHeight: '1.1', color: '#FFFFFF', letterSpacing: '-1.5px', margin: 0, whiteSpace: 'nowrap', textShadow: '0 4px 30px rgba(124,58,237,0.5)' },
  titleHorizontalLine: { flex: 1, minWidth: '80px', height: '7px', background: 'linear-gradient(90deg, #A855F7, #EC4899)', borderRadius: '10px', boxShadow: '0 0 20px rgba(168,85,247,0.6)' },

  subtitle: { fontSize: 'clamp(13px, 1.1vw, 15px)', color: 'rgba(255,255,255,0.6)', fontWeight: '500', marginBottom: '36px', lineHeight: '1.9' },

  bottomRow: { display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' },

  instagramBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: 'rgba(124,58,237,0.15)', borderRadius: '12px', border: '1px solid rgba(124,58,237,0.3)', textDecoration: 'none', transition: 'background 0.3s ease' },
  instagramBtnText: { fontSize: '13px', color: '#A78BFA', fontWeight: '600' },

  consultBtn: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', background: 'transparent', border: '1.5px solid #EC4899', color: '#FFFFFF', fontSize: '14px', fontWeight: '700', textDecoration: 'none', borderRadius: '12px', transition: 'background 0.3s ease, color 0.3s ease', fontFamily: 'Vazirmatn, sans-serif', boxShadow: '0 0 20px rgba(236,72,153,0.2)' },
  consultBtnIcon: { fontSize: '14px', color: '#EC4899' },
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  /* ===== Hover (desktop only) ===== */
  @media (hover: hover) {
    .consult-btn:hover { background: #EC4899; color: #FFFFFF; }
    .instagram-btn:hover { background: #7C3AED; border-color: transparent; }
    .instagram-btn:hover span { color: #FFFFFF; }
    .instagram-btn:hover svg { color: #FFFFFF !important; }
    .play-btn:hover { background: #7C3AED; }
    .teacher-img-card:hover { transform: translate3d(0, -4px, 0); box-shadow: 0 16px 40px rgba(124,58,237,0.4); border-color: rgba(168,85,247,0.4); }
    .teacher-img-card:hover img { transform: scale(1.08); }
    .teacher-faded-card:hover { transform: translate3d(0, -4px, 0); box-shadow: 0 16px 40px rgba(124,58,237,0.4); border-color: rgba(168,85,247,0.4); }
  }

  /* ===== Animations ===== */
  @keyframes floatDot1 {
    0%, 100% { transform: translate3d(0, 0, 0); }
    50% { transform: translate3d(0, -8px, 0); }
  }
  @keyframes floatDot2 {
    0%, 100% { transform: translate3d(0, 0, 0); }
    50% { transform: translate3d(0, 8px, 0); }
  }
  @keyframes cubeFloat {
    0%, 100% { transform: translate3d(0, 0, 0) rotate(-10deg); }
    50% { transform: translate3d(0, -12px, 0) rotate(-5deg); }
  }

  .floating-dot-1 { animation: floatDot1 3s ease-in-out infinite; will-change: transform; }
  .floating-dot-2 { animation: floatDot2 4s ease-in-out infinite; will-change: transform; }
  .cube-3d { animation: cubeFloat 4s ease-in-out infinite; will-change: transform; }

  /* ===== Tablet (≤ 1100px) ===== */
  @media (max-width: 1100px) {
    .hero-grid {
      grid-template-columns: 1fr !important;
      gap: 60px !important;
    }
    .text-wrapper {
      padding-top: 20px !important;
      position: static !important;
    }
    .teachers-masonry {
      grid-template-columns: repeat(4, 1fr) !important;
    }
  }

  /* ===== Mobile (≤ 768px) ===== */
  @media (max-width: 768px) {
    .hero-root {
      padding-top: 90px !important;
      padding-bottom: 40px !important;
      min-height: auto !important;
    }

    .teachers-masonry { display: none !important; }
    .hero-bg-decor { display: none !important; }
    .hero-top-dots { display: none !important; }

    .hero-grid {
      grid-template-columns: 1fr !important;
      gap: 24px !important;
    }

    .hero-image-wrap {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: flex-start !important;
      min-height: auto !important;
      max-width: 100% !important;
      width: 100% !important;
      margin-bottom: 8px !important;
      padding: 0 !important;
      position: relative !important;
    }

    .services-icons-card {
      position: relative !important;
      top: auto !important;
      right: auto !important;
      left: auto !important;
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
      justify-content: center !important;
      margin: 0 0 12px 0 !important;
      padding: 12px 10px !important;
      border-radius: 18px !important;
      order: 1 !important;
    }

    .services-icons-row {
      gap: 8px !important;
      justify-content: space-between !important;
      width: 100% !important;
    }

    .service-icon-item {
      flex: 1 !important;
      min-width: 0 !important;
    }

    .service-icon-circle {
      width: 34px !important;
      height: 34px !important;
    }

    /* ✅ Fixed: label wraps cleanly, doesn't overflow */
    .service-icon-label {
      font-size: 7.5px !important;
      white-space: normal !important;
      text-align: center !important;
      line-height: 1.15 !important;
      word-break: break-word !important;
      max-width: 60px !important;
      overflow: hidden !important;
      display: block !important;
    }

    .hero-image-circle {
      width: 240px !important;
      height: 240px !important;
      top: 25% !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      position: absolute !important;
    }

    .hero-main-image {
      max-width: 260px !important;
      width: 100% !important;
      margin: 0 auto !important;
      display: block !important;
      position: relative !important;
      z-index: 2 !important;
      order: 2 !important;
    }

    .play-btn {
      width: 42px !important;
      height: 42px !important;
      top: 55% !important;
      right: 15% !important;
      z-index: 10 !important;
    }

    .cube-3d {
      width: 42px !important;
      height: 42px !important;
      top: 6% !important;
      left: 10% !important;
      z-index: 6 !important;
    }

    .floating-dot-1 { width: 10px !important; height: 10px !important; left: 15% !important; top: 30% !important; }
    .floating-dot-2 { width: 8px !important; height: 8px !important; left: 20% !important; top: 45% !important; }

    .student-card {
      position: relative !important;
      bottom: auto !important;
      left: auto !important;
      width: 100% !important;
      max-width: 100% !important;
      box-sizing: border-box !important;
      margin: 12px 0 0 0 !important;
      padding: 14px 18px !important;
      text-align: center !important;
      align-items: center !important;
      order: 3 !important;
    }

    .student-card .student-highlight { font-size: 14px !important; }
    .student-card .student-text { font-size: 13px !important; }

    .text-wrapper {
      padding-top: 0 !important;
      align-items: center !important;
      text-align: center !important;
      position: static !important;
    }

    .top-line-wrap,
    .hero-bottom-row {
      justify-content: center !important;
      align-items: center !important;
      width: 100% !important;
    }

    /* ✅ Fixed: title row — line sits next to title */
    .title-row {
      justify-content: center !important;
      align-items: center !important;
      width: 100% !important;
      gap: 10px !important;
    }

    .hero-title {
      font-size: 32px !important;
      white-space: normal !important;
      text-align: center !important;
    }

    /* ✅ Fixed: line now visible on mobile */
    .hero-title-line {
      display: block !important;
      flex: 1 !important;
      min-width: 40px !important;
      max-width: 100px !important;
      height: 5px !important;
      margin-right: 12px !important;
    }

    .hero-subtitle {
      font-size: 13px !important;
      text-align: center !important;
      margin-bottom: 24px !important;
    }

    .instagram-btn,
    .consult-btn {
      flex: 1 1 auto !important;
      justify-content: center !important;
    }
  }

  /* ===== Very Small Mobile (≤ 480px) ===== */
  @media (max-width: 480px) {
    .hero-root {
      padding-top: 84px !important;
    }

    .hero-image-wrap {
      min-height: auto !important;
    }

    .hero-image-circle {
      width: 200px !important;
      height: 200px !important;
      top: 28% !important;
    }

    .hero-main-image {
      max-width: 220px !important;
    }

    .hero-title {
      font-size: 28px !important;
    }

    .services-icons-card {
      padding: 10px 8px !important;
    }

    .service-icon-circle {
      width: 30px !important;
      height: 30px !important;
    }
    .service-icon-circle svg {
      width: 15px !important;
      height: 15px !important;
    }
    .service-icon-label {
      font-size: 7px !important;
      max-width: 55px !important;
    }

    .play-btn {
      width: 36px !important;
      height: 36px !important;
      right: 12% !important;
    }

    .cube-3d {
      width: 34px !important;
      height: 34px !important;
    }

    .hero-title-line {
      min-width: 30px !important;
      max-width: 70px !important;
      height: 4px !important;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .floating-dot-1, .floating-dot-2, .cube-3d {
      animation: none !important;
    }
  }
`;
document.head.appendChild(styleSheet);

export default Hero;
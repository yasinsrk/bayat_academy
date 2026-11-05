// frontend/src/components/ImageCropper.js
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCrop, FaUndo, FaCheck, FaTimes, FaSearchPlus, FaSearchMinus } from 'react-icons/fa';

/**
 * ImageCropper - کراپ تصویر به نسبت 16:9
 *
 * props:
 * - image: فایل تصویر (File)
 * - onCropComplete: کال‌بک با فایل نهایی کراپ‌شده
 * - onCancel: کال‌بک انصراف
 * - aspectRatio: نسبت تصویر (پیش‌فرض 16/9)
 */
function ImageCropper({ image, onCropComplete, onCancel, aspectRatio = 16 / 9 }) {
  const [imgSrc, setImgSrc] = useState('');
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  const containerRef = useRef(null);
  const imgRef = useRef(null);

  // ===== لود کردن تصویر =====
  useEffect(() => {
    if (!image) return;

    const reader = new FileReader();
    reader.onload = () => setImgSrc(reader.result);
    reader.readAsDataURL(image);
  }, [image]);

  // ===== وقتی تصویر لود شد =====
  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    setImageSize({ width: naturalWidth, height: naturalHeight });

    // محاسبه‌ی scale اولیه برای پوشش کامل کادر
    const container = containerRef.current;
    if (container) {
      const containerWidth = container.offsetWidth;
      const containerHeight = containerWidth / aspectRatio;

      const scaleX = containerWidth / naturalWidth;
      const scaleY = containerHeight / naturalHeight;
      const initialScale = Math.max(scaleX, scaleY);

      setScale(initialScale);
      setPosition({ x: 0, y: 0 });
    }
  };

  // ===== شروع drag =====
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  // ===== ادامه drag =====
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  // ===== پایان drag =====
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // ===== zoom =====
  const handleZoomIn = () => setScale((s) => Math.min(s * 1.1, 5));
  const handleZoomOut = () => setScale((s) => Math.max(s * 0.9, 0.1));

  // ===== ریست =====
  const handleReset = () => {
    setPosition({ x: 0, y: 0 });
    const container = containerRef.current;
    if (container && imageSize.width > 0) {
      const containerWidth = container.offsetWidth;
      const containerHeight = containerWidth / aspectRatio;
      const scaleX = containerWidth / imageSize.width;
      const scaleY = containerHeight / imageSize.height;
      setScale(Math.max(scaleX, scaleY));
    }
  };

  // ===== اعمال کراپ =====
  const handleApply = () => {
    if (!imgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const containerWidth = container.offsetWidth;
    const containerHeight = containerWidth / aspectRatio;

    // ابعاد نهایی خروجی (1280x720)
    const outputWidth = 1280;
    const outputHeight = 720;

    const canvas = document.createElement('canvas');
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const ctx = canvas.getContext('2d');

    // ===== پس‌زمینه سفید =====
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, outputWidth, outputHeight);

    // ===== محاسبه‌ی موقعیت تصویر روی canvas =====
    const img = imgRef.current;
    const ratioX = outputWidth / containerWidth;
    const ratioY = outputHeight / containerHeight;

    const drawWidth = img.naturalWidth * scale * ratioX;
    const drawHeight = img.naturalHeight * scale * ratioY;

    const drawX = (outputWidth - drawWidth) / 2 + position.x * ratioX;
    const drawY = (outputHeight - drawHeight) / 2 + position.y * ratioY;

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

    // ===== تبدیل به Blob و فایل =====
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const croppedFile = new File([blob], 'cropped-cover.webp', {
          type: 'image/webp',
        });
        onCropComplete(croppedFile);
      },
      'image/webp',
      0.9
    );
  };

  if (!imgSrc) return null;

  const containerWidth = containerRef.current?.offsetWidth || 600;
  const containerHeight = containerWidth / aspectRatio;

  return (
    <div style={styles.overlay}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={styles.modal}
      >
        {/* ===== Header ===== */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <FaCrop style={styles.headerIcon} />
            <h3 style={styles.headerTitle}>کراپ تصویر کاور</h3>
          </div>
          <button onClick={onCancel} style={styles.closeBtn}>
            <FaTimes />
          </button>
        </div>

        {/* ===== Cropper Area ===== */}
        <div
          ref={containerRef}
          style={{
            ...styles.cropArea,
            paddingBottom: `${100 / aspectRatio}%`,
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            ref={imgRef}
            src={imgSrc}
            alt="crop"
            onLoad={handleImageLoad}
            draggable={false}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: 'center center',
              cursor: isDragging ? 'grabbing' : 'grab',
              userSelect: 'none',
              maxWidth: 'none',
              maxHeight: 'none',
              pointerEvents: 'none',
            }}
          />

          {/* ===== Overlay: خطوط راهنما ===== */}
          <div style={styles.gridOverlay}>
            <div style={styles.gridLineV1} />
            <div style={styles.gridLineV2} />
            <div style={styles.gridLineH1} />
            <div style={styles.gridLineH2} />
          </div>
        </div>

        {/* ===== Controls ===== */}
        <div style={styles.controls}>
          <div style={styles.controlsLeft}>
            <button onClick={handleZoomOut} style={styles.controlBtn} title="کوچک‌تر">
              <FaSearchMinus />
            </button>
            <button onClick={handleZoomIn} style={styles.controlBtn} title="بزرگ‌تر">
              <FaSearchPlus />
            </button>
            <button onClick={handleReset} style={styles.controlBtn} title="ریست">
              <FaUndo />
            </button>
          </div>

          <div style={styles.controlsRight}>
            <button onClick={onCancel} style={styles.cancelBtn}>
              <FaTimes /> انصراف
            </button>
            <button onClick={handleApply} style={styles.applyBtn}>
              <FaCheck /> ذخیره
            </button>
          </div>
        </div>

        {/* ===== Hint ===== */}
        <div style={styles.hint}>
          💡 با کشیدن تصویر، موقعیت رو تنظیم کنید. اندازه‌ی نهایی: <strong>1280×720</strong>
        </div>
      </motion.div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(8px)',
    zIndex: 10000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  modal: {
    background: '#FFFFFF',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '720px',
    maxHeight: '95vh',
    overflowY: 'auto',
    padding: '24px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid #F0F0F5',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  headerIcon: {
    color: '#4A6CF7',
    fontSize: '20px',
  },
  headerTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1A1A2E',
    fontFamily: 'Vazirmatn, sans-serif',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#C0C0D0',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '4px',
    transition: 'color 0.3s ease',
  },
  cropArea: {
    position: 'relative',
    width: '100%',
    background: '#0A0A0A',
    borderRadius: '12px',
    overflow: 'hidden',
    cursor: 'grab',
  },
  gridOverlay: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
  },
  gridLineV1: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '33.33%',
    width: '1px',
    background: 'rgba(255,255,255,0.15)',
  },
  gridLineV2: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '66.66%',
    width: '1px',
    background: 'rgba(255,255,255,0.15)',
  },
  gridLineH1: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '33.33%',
    height: '1px',
    background: 'rgba(255,255,255,0.15)',
  },
  gridLineH2: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '66.66%',
    height: '1px',
    background: 'rgba(255,255,255,0.15)',
  },
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    marginTop: '20px',
    flexWrap: 'wrap',
  },
  controlsLeft: {
    display: 'flex',
    gap: '8px',
  },
  controlsRight: {
    display: 'flex',
    gap: '8px',
  },
  controlBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: '#F5F6FA',
    border: '1px solid #E8E8EE',
    color: '#4A4A5A',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    fontFamily: 'Vazirmatn, sans-serif',
  },
  cancelBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: '#F5F6FA',
    border: '1px solid #E8E8EE',
    borderRadius: '10px',
    color: '#4A4A5A',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    fontFamily: 'Vazirmatn, sans-serif',
    transition: 'all 0.3s ease',
  },
  applyBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 24px',
    background: 'linear-gradient(135deg, #4A6CF7, #6C63FF)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: 'Vazirmatn, sans-serif',
    boxShadow: '0 4px 16px rgba(74,108,247,0.25)',
    transition: 'all 0.3s ease',
  },
  hint: {
    marginTop: '16px',
    padding: '12px 16px',
    background: 'rgba(74,108,247,0.04)',
    borderRadius: '10px',
    fontSize: '13px',
    color: 'rgba(26,26,46,0.6)',
    textAlign: 'center',
    fontFamily: 'Vazirmatn, sans-serif',
  },
};

export default ImageCropper;
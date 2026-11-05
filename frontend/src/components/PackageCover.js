// frontend/src/components/PackageCover.js
import React, { useState } from 'react';
import { FaImage, FaSpinner } from 'react-icons/fa';

function PackageCover({
  src,
  alt = 'کاور دوره',
  size = 'medium',
  rounded = 'lg',
  className = '',
  showOverlay = false,
  children,
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const radiusMap = {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    none: '0',
  };

  const widthMap = {
    small: '280px',
    medium: '100%',
    large: '100%',
    hero: '100%',
  };

  const hasImage = src && !error;

  const containerStyle = {
    position: 'relative',
    width: widthMap[size],
    aspectRatio: '16 / 9',
    borderRadius: radiusMap[rounded],
    overflow: 'hidden',
    background: hasImage
      ? '#F0F1F5'
      : 'linear-gradient(135deg, #E8ECF1 0%, #D8DEE9 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const imgStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center',
    opacity: loading ? 0 : 1,
    transition: 'opacity 0.3s ease',
  };

  const placeholderStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    color: 'rgba(74, 108, 247, 0.3)',
  };

  return (
    <div style={containerStyle} className={className}>
      {hasImage && loading && (
        <div style={placeholderStyle}>
          <FaSpinner style={{ fontSize: '24px', animation: 'spin 1s linear infinite' }} />
        </div>
      )}

      {!hasImage && (
        <div style={placeholderStyle}>
          <FaImage style={{ fontSize: '32px' }} />
          <span style={{ fontSize: '12px', fontWeight: '500' }}>بدون کاور</span>
        </div>
      )}

      {hasImage && (
        <img
          src={src}
          alt={alt}
          style={imgStyle}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
          loading="lazy"
        />
      )}

      {showOverlay && hasImage && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(26,25,50,0.75) 0%, transparent 60%)',
            pointerEvents: 'none',
          }}
        />
      )}

      {children}
    </div>
  );
}

if (typeof document !== 'undefined' && !document.getElementById('package-cover-styles')) {
  const style = document.createElement('style');
  style.id = 'package-cover-styles';
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export default PackageCover;
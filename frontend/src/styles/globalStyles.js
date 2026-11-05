// src/styles/globalStyles.js

export const colors = {
  primary: '#6C63FF',
  primaryLight: '#8B83FF',
  primaryDark: '#5A52D5',
  secondary: '#4D96FF',
  accent: '#FFD93D',
  danger: '#FF6B6B',
  success: '#4CAF50',
  text: '#1a1a2e',
  textLight: 'rgba(26,26,46,0.4)',
  textLighter: 'rgba(26,26,46,0.2)',
  background: '#f8f6f2',
  white: '#ffffff',
  glassBg: 'rgba(255,255,255,0.55)',
  glassBorder: 'rgba(255,255,255,0.4)',
  glassShadow: '0 8px 60px rgba(0,0,0,0.02)',
  glassInset: 'inset 0 0.5px 0 rgba(255,255,255,0.8)',
};

export const glass = {
  card: {
    background: 'rgba(255,255,255,0.55)',
    backdropFilter: 'blur(40px) saturate(180%)',
    WebkitBackdropFilter: 'blur(40px) saturate(180%)',
    borderRadius: '32px',
    border: '0.5px solid rgba(255,255,255,0.4)',
    boxShadow: '0 8px 60px rgba(0,0,0,0.02), inset 0 0.5px 0 rgba(255,255,255,0.8)',
  },
  light: {
    background: 'rgba(255,255,255,0.4)',
    backdropFilter: 'blur(30px) saturate(180%)',
    WebkitBackdropFilter: 'blur(30px) saturate(180%)',
    borderRadius: '24px',
    border: '0.5px solid rgba(255,255,255,0.3)',
    boxShadow: '0 4px 24px rgba(0,0,0,0.02), inset 0 0.5px 0 rgba(255,255,255,0.6)',
  },
  button: {
    background: 'rgba(255,255,255,0.3)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: '0.5px solid rgba(255,255,255,0.3)',
    borderRadius: '14px',
    boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.6)',
  },
};

export const typography = {
  title: {
    fontSize: 'clamp(28px, 3vw, 38px)',
    fontWeight: '700',
    color: '#1a1a2e',
  },
  subtitle: {
    fontSize: 'clamp(16px, 1.5vw, 20px)',
    fontWeight: '500',
    color: 'rgba(26,26,46,0.5)',
  },
  body: {
    fontSize: 'clamp(14px, 1.2vw, 17px)',
    color: 'rgba(26,26,46,0.3)',
    lineHeight: '1.8',
  },
  small: {
    fontSize: '13px',
    color: 'rgba(26,26,46,0.25)',
  },
};

export const spacing = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
  },
  section: {
    padding: '40px 0',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
};

export const button = {
  primary: {
    background: 'linear-gradient(135deg, #6C63FF, #4D96FF)',
    color: 'white',
    border: 'none',
    borderRadius: '14px',
    padding: '14px 32px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 30px rgba(108,99,255,0.15)',
    fontFamily: 'Vazirmatn, sans-serif',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 40px rgba(108,99,255,0.25)',
    },
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
      transform: 'none',
    },
  },
  outline: {
    background: 'rgba(255,255,255,0.3)',
    backdropFilter: 'blur(20px)',
    border: '0.5px solid rgba(255,255,255,0.3)',
    borderRadius: '14px',
    padding: '12px 28px',
    fontSize: '15px',
    fontWeight: '500',
    color: '#1a1a2e',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: 'Vazirmatn, sans-serif',
    boxShadow: 'inset 0 0.5px 0 rgba(255,255,255,0.6)',
    '&:hover': {
      background: 'rgba(255,255,255,0.5)',
      transform: 'translateY(-2px)',
    },
  },
};

export const input = {
  wrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  field: {
    width: '100%',
    padding: '14px 44px 14px 16px',
    background: 'rgba(255,255,255,0.4)',
    border: '1px solid rgba(0,0,0,0.04)',
    borderRadius: '14px',
    fontSize: '15px',
    color: '#1a1a2e',
    transition: 'all 0.3s ease',
    fontFamily: 'Vazirmatn, sans-serif',
    '&:focus': {
      outline: 'none',
      borderColor: '#6C63FF',
      background: 'rgba(255,255,255,0.7)',
      boxShadow: '0 0 0 4px rgba(108,99,255,0.04)',
    },
    '&::placeholder': {
      color: 'rgba(26,26,46,0.12)',
    },
  },
  icon: {
    position: 'absolute',
    right: '14px',
    color: 'rgba(26,26,46,0.12)',
    fontSize: '16px',
  },
  error: {
    display: 'block',
    color: '#FF6B6B',
    fontSize: '12px',
    marginTop: '4px',
  },
};
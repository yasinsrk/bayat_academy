// src/styles/adminTheme.js
export const theme = {
  colors: {
    // Neutrals
    bg: '#F7F8FA',
    surface: '#FFFFFF',
    surfaceAlt: '#F3F4F6',
    surfaceSunken: '#EDEFF3',

    // Borders
    border: '#E5E7EB',
    borderStrong: '#D1D5DB',
    borderSoft: '#F1F3F5',

    // Text
    text: '#0F172A',
    textMuted: '#475569',
    textSubtle: '#64748B',
    textFaint: '#94A3B8',

    // Accent (Indigo)
    accent: '#4F46E5',
    accentHover: '#4338CA',
    accentDeep: '#3730A3',
    accentSoft: '#EEF2FF',
    accentBorder: '#C7D2FE',
    accentGlow: 'rgba(79,70,229,0.25)',

    // Sidebar (Deep Navy)
    sidebarBg: '#0B0F1A',
    sidebarBgElev: '#141826',
    sidebarBgHover: '#1C2130',
    sidebarBorder: '#1F2434',
    sidebarText: '#8B93A7',
    sidebarTextActive: '#FFFFFF',
    sidebarTextMuted: '#5A6278',

    // Semantic
    success: '#10B981',
    successSoft: '#ECFDF5',
    warning: '#F59E0B',
    warningSoft: '#FFFBEB',
    danger: '#EF4444',
    dangerSoft: '#FEF2F2',
    info: '#3B82F6',
    infoSoft: '#EFF6FF',

    // KPI tints
    tintIndigo: '#4F46E5',
    tintIndigoSoft: '#EEF2FF',
    tintSky: '#0284C7',
    tintSkySoft: '#E0F2FE',
    tintEmerald: '#059669',
    tintEmeraldSoft: '#D1FAE5',
    tintAmber: '#D97706',
    tintAmberSoft: '#FEF3C7',
    tintViolet: '#7C3AED',
    tintVioletSoft: '#EDE9FE',
    tintRose: '#E11D48',
    tintRoseSoft: '#FFE4E6',
  },

  font: {
    family: 'Vazirmatn, -apple-system, BlinkMacSystemFont, sans-serif',
    sizes: {
      xs: '11px', sm: '12px', base: '13px', md: '14px',
      lg: '15px', xl: '18px', '2xl': '22px', '3xl': '28px',
      '4xl': '32px', '5xl': '40px',
    },
    weights: { normal: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800 },
  },

  space: {
    xs: '4px', sm: '8px', md: '12px', lg: '16px',
    xl: '20px', '2xl': '24px', '3xl': '32px', '4xl': '40px',
  },

  radius: {
    sm: '6px', md: '8px', lg: '10px', xl: '12px',
    '2xl': '16px', '3xl': '20px', full: '9999px',
  },

  shadow: {
    xs: '0 1px 2px rgba(15,23,42,0.04)',
    sm: '0 1px 2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.03)',
    md: '0 4px 8px -2px rgba(15,23,42,0.06), 0 2px 4px -2px rgba(15,23,42,0.03)',
    lg: '0 10px 24px -6px rgba(15,23,42,0.08), 0 4px 8px -4px rgba(15,23,42,0.04)',
    xl: '0 20px 40px -12px rgba(15,23,42,0.12), 0 8px 16px -4px rgba(15,23,42,0.05)',
  },

  // Breakpoints — used in JS where needed
  bp: {
    xs: 480,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },

  transition: {
    fast: 'all 0.15s ease',
    base: 'all 0.2s ease',
    slow: 'all 0.3s ease',
  },
};

export const card = {
  background: theme.colors.surface,
  border: `1px solid ${theme.colors.border}`,
  borderRadius: theme.radius['2xl'],
  boxShadow: theme.shadow.sm,
};

export const pageTitle = {
  fontSize: 'clamp(20px, 3vw, 26px)',
  fontWeight: 700,
  color: theme.colors.text,
  letterSpacing: '-0.5px',
  margin: 0,
  lineHeight: 1.15,
};

export const pageSubtitle = {
  fontSize: theme.font.sizes.md,
  color: theme.colors.textSubtle,
  margin: '6px 0 0',
};

export const sectionLabel = {
  fontSize: theme.font.sizes.xs,
  fontWeight: 700,
  color: theme.colors.textSubtle,
  textTransform: 'uppercase',
  letterSpacing: '0.6px',
};

export default theme;
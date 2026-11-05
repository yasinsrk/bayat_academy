// src/components/Breadcrumbs.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaHome } from 'react-icons/fa';
import theme from '../styles/adminTheme';

/**
 * items = [
 *   { label: 'تیکت‌ها', to: '/admin/tickets' },
 *   { label: '#123' },              ← آخرین آیتم، لینک نداره
 * ]
 */
function Breadcrumbs({ items = [] }) {
  return (
    <nav style={S.wrap} className="ds-breadcrumbs">
      <Link to="/admin/dashboard" style={S.link} className="ds-bc-link">
        <FaHome size={10} />
        <span>داشبورد</span>
      </Link>

      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <React.Fragment key={i}>
            <FaChevronLeft size={8} style={S.sep} />
            {item.to && !isLast ? (
              <Link to={item.to} style={S.link} className="ds-bc-link">
                {item.label}
              </Link>
            ) : (
              <span style={{ ...S.link, ...S.current }}>{item.label}</span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

const S = {
  wrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 12,
    color: theme.colors.textSubtle,
    flexWrap: 'wrap',
  },
  link: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    color: theme.colors.textSubtle,
    textDecoration: 'none',
    fontWeight: 500,
    fontFamily: theme.font.family,
  },
  sep: {
    color: theme.colors.textFaint,
    flexShrink: 0,
  },
  current: {
    color: theme.colors.text,
    fontWeight: 600,
  },
};

if (typeof document !== 'undefined' && !document.getElementById('ds-breadcrumbs-styles')) {
  const style = document.createElement('style');
  style.id = 'ds-breadcrumbs-styles';
  style.textContent = `
    .ds-bc-link:hover {
      color: ${theme.colors.accent} !important;
    }
  `;
  document.head.appendChild(style);
}

export default Breadcrumbs;
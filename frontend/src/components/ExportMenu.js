// src/components/ExportMenu.js
import React, { useState, useEffect, useRef } from 'react';
import {
  FaDownload, FaFileExcel, FaFilePdf, FaPrint, FaChevronDown,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import theme from '../styles/adminTheme';
import { formatJalali, formatJalaliDateTime } from '../utils/jalali';

/**
 * Detect an ISO-ish date string and convert it to Jalali.
 * Any value that doesn't look like a date is returned as-is.
 */
function toJalaliIfDate(value) {
  if (value === null || value === undefined) return '';

  // If it's already a JS Date
  if (value instanceof Date) {
    return formatJalali(value);
  }

  const str = String(value);
  // Match ISO: YYYY-MM-DD or YYYY-MM-DDTHH:MM
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return formatJalali(str);
  }
  return str;
}

function ExportMenu({ data = [], filename = 'report', title = 'گزارش' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // ── CSV Export (Excel-compatible, Jalali dates) ──
  const exportCSV = () => {
    if (!data || data.length === 0) {
      toast.warning('داده‌ای برای خروجی وجود ندارد');
      setOpen(false);
      return;
    }

    const headers = Object.keys(data[0]);

    const rows = data.map((row) =>
      headers.map((h) => {
        const raw = row[h];
        const str = toJalaliIfDate(raw);
        // Escape quotes and wrap in quotes
        return `"${String(str).replace(/"/g, '""')}"`;
      }).join(',')
    );

    // BOM so Excel detects UTF-8 (Persian characters + Persian digits)
    const csv = '\uFEFF' + headers.join(',') + '\n' + rows.join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    // Use Jalali date in the filename too
    const today = formatJalali(new Date(), 'jYYYY-jMM-jDD');
    a.href = url;
    a.download = `${filename}-${today}.csv`;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('فایل اکسل دانلود شد');
    setOpen(false);
  };

  // ── PDF Export (via browser print, Jalali dates) ──
  const exportPDF = () => {
    if (!data || data.length === 0) {
      toast.warning('داده‌ای برای خروجی وجود ندارد');
      setOpen(false);
      return;
    }

    const headers = Object.keys(data[0]);

    const rowsHtml = data
      .map(
        (row) =>
          `<tr>${headers
            .map((h) => `<td>${toJalaliIfDate(row[h])}</td>`)
            .join('')}</tr>`
      )
      .join('');

    const generatedAt = formatJalaliDateTime(new Date());

    const html = `
      <!doctype html>
      <html dir="rtl" lang="fa">
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <link href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css" rel="stylesheet" type="text/css" />
        <style>
          * { font-family: Vazirmatn, Tahoma, sans-serif; }
          body { padding: 24px; color: #0F172A; }
          h1 { font-size: 20px; margin: 0 0 6px; }
          .meta { font-size: 12px; color: #64748B; margin-bottom: 20px; }
          .brand {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 16px;
            font-weight: 700;
            font-size: 14px;
            color: #4F46E5;
          }
          .brand-mark {
            width: 26px; height: 26px; border-radius: 8px;
            background: linear-gradient(135deg, #4F46E5 0%, #7C5CE7 100%);
            color: #FFFFFF;
            display: inline-flex; align-items: center; justify-content: center;
            font-weight: 800;
          }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { padding: 8px 10px; border: 1px solid #E5E7EB; text-align: right; }
          th { background: #F3F4F6; font-weight: 700; color: #0F172A; }
          tr:nth-child(even) { background: #FAFAFB; }
          .footer {
            margin-top: 20px;
            font-size: 11px;
            color: #94A3B8;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="brand">
          <span class="brand-mark">ب</span>
          بیات آکادمی
        </div>
        <h1>${title}</h1>
        <div class="meta">تاریخ تولید گزارش: ${generatedAt}</div>
        <table>
          <thead>
            <tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
        <div class="footer">تولید شده توسط پنل مدیریت بیات آکادمی</div>
        <script>window.onload = () => { window.print(); }</script>
      </body>
      </html>
    `;

    const w = window.open('', '_blank', 'width=1000,height=700');
    if (!w) {
      toast.error('پاپ‌آپ را فعال کنید');
      setOpen(false);
      return;
    }
    w.document.write(html);
    w.document.close();
    setOpen(false);
  };

  const handlePrint = () => {
    window.print();
    setOpen(false);
  };

  return (
    <div ref={ref} style={S.wrap}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={S.btn}
        className="ds-export-btn"
      >
        <FaDownload size={11} />
        <span>گزارش</span>
        <FaChevronDown
          size={8}
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.15s',
          }}
        />
      </button>

      {open && (
        <div style={S.menu}>
          <button onClick={exportCSV} style={S.item} className="ds-export-item">
            <div style={{ ...S.iconBox, background: '#ECFDF5' }}>
              <FaFileExcel size={12} color="#059669" />
            </div>
            <div style={S.itemBody}>
              <div style={S.itemLabel}>خروجی اکسل</div>
              <div style={S.itemSub}>CSV با تاریخ شمسی</div>
            </div>
          </button>

          <button onClick={exportPDF} style={S.item} className="ds-export-item">
            <div style={{ ...S.iconBox, background: '#FEF2F2' }}>
              <FaFilePdf size={12} color="#DC2626" />
            </div>
            <div style={S.itemBody}>
              <div style={S.itemLabel}>خروجی PDF</div>
              <div style={S.itemSub}>ذخیره با تاریخ شمسی</div>
            </div>
          </button>

          <button onClick={handlePrint} style={S.item} className="ds-export-item">
            <div style={{ ...S.iconBox, background: '#EFF6FF' }}>
              <FaPrint size={12} color="#2563EB" />
            </div>
            <div style={S.itemBody}>
              <div style={S.itemLabel}>چاپ</div>
              <div style={S.itemSub}>چاپ صفحه فعلی</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

const S = {
  wrap: { position: 'relative' },
  btn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '9px 15px',
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 10,
    fontSize: 12.5,
    fontWeight: 500,
    color: theme.colors.textMuted,
    fontFamily: theme.font.family,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  menu: {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    left: 0,
    minWidth: 220,
    background: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: 12,
    boxShadow: theme.shadow.xl,
    padding: 6,
    zIndex: 500,
    animation: 'ds-fade-in 0.12s ease-out',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    padding: '9px 10px',
    background: 'transparent',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    textAlign: 'right',
    fontFamily: theme.font.family,
    color: theme.colors.text,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  itemBody: { flex: 1, minWidth: 0 },
  itemLabel: {
    fontSize: 12.5,
    fontWeight: 600,
    color: theme.colors.text,
  },
  itemSub: {
    fontSize: 10.5,
    color: theme.colors.textSubtle,
    marginTop: 2,
  },
};

if (typeof document !== 'undefined' && !document.getElementById('ds-export-styles')) {
  const style = document.createElement('style');
  style.id = 'ds-export-styles';
  style.textContent = `
    @keyframes ds-fade-in {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .ds-export-btn:hover {
      background: ${theme.colors.surfaceAlt} !important;
      color: ${theme.colors.text} !important;
    }
    .ds-export-item:hover {
      background: ${theme.colors.surfaceAlt} !important;
    }
  `;
  document.head.appendChild(style);
}

export default ExportMenu;
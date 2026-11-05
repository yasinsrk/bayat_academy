// src/utils/jalali.js
import moment from 'moment-jalaali';

// Set Persian locale
moment.loadPersian({ usePersianDigits: true, dialect: 'persian-modern' });

/**
 * Format a date as Jalali (Shamsi)
 *
 * Usage:
 *   formatJalali('2024-10-15')            → '۱۴۰۳/۰۷/۲۴'
 *   formatJalali(new Date())              → '۱۴۰۳/۰۷/۲۴'
 *   formatJalali(date, 'jYYYY/jMM/jDD')   → '۱۴۰۳/۰۷/۲۴'
 *   formatJalali(date, 'jYYYY/jMMMM/jDD') → '۱۴۰۳/مهر/۲۴'
 *   formatJalali(date, 'HH:mm')           → '۱۴:۳۰'
 *   formatJalali(date, 'jYYYY/jMM/jDD HH:mm') → '۱۴۰۳/۰۷/۲۴ ۱۴:۳۰'
 */
export function formatJalali(date, format = 'jYYYY/jMM/jDD') {
  if (!date) return '-';
  try {
    return moment(date).format(format);
  } catch {
    return '-';
  }
}

/**
 * Format date + time
 */
export function formatJalaliDateTime(date) {
  return formatJalali(date, 'jYYYY/jMM/jDD - HH:mm');
}

/**
 * Format time only
 */
export function formatJalaliTime(date) {
  return formatJalali(date, 'HH:mm');
}

/**
 * Format as relative time: "۵ دقیقه پیش"
 */
export function formatJalaliRelative(date) {
  if (!date) return '-';
  try {
    return moment(date).fromNow();
  } catch {
    return '-';
  }
}

/**
 * Long form: "۲۴ مهر ۱۴۰۳"
 */
export function formatJalaliLong(date) {
  return formatJalali(date, 'jDD jMMMM jYYYY');
}

export default {
  formatJalali,
  formatJalaliDateTime,
  formatJalaliTime,
  formatJalaliRelative,
  formatJalaliLong,
};
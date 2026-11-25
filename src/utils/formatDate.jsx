/**
 * Date Formatting Utility for MOVORA
 */

/**
 * Format a date string into readable format (e.g. "November 22, 2025")
 * @param {string|Date} date
 * @param {Intl.DateTimeFormatOptions} [options]
 * @returns {string}
 */
export function formatDate(date, options = { year: 'numeric', month: 'long', day: 'numeric' }) {
  if (!date) return '';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return String(date);
    return new Intl.DateTimeFormat('en-US', options).format(d);
  } catch {
    return String(date);
  }
}

/**
 * Extract release year from date string or return fallback
 * @param {string|number} yearOrDate
 * @returns {string}
 */
export function getReleaseYear(yearOrDate) {
  if (!yearOrDate) return '';
  const str = String(yearOrDate).trim();
  if (/^\d{4}$/.test(str)) return str;
  const match = str.match(/\b(19\d{2}|20\d{2})\b/);
  return match ? match[0] : str;
}

export default formatDate;

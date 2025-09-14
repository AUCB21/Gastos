// Utility functions for date handling to avoid timezone issues

/**
 * Parse a date string (YYYY-MM-DD) in local timezone instead of UTC
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {Date} - Date object in local timezone
 */
export const parseLocalDate = (dateString) => {
  const [year, month, day] = dateString.split('-');
  return new Date(year, month - 1, day); // month is 0-indexed
};

/**
 * Format a date string (YYYY-MM-DD) for display in local timezone
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @param {string} locale - Locale for formatting (default: 'es-AR')
 * @returns {string} - Formatted date string
 */
export const formatLocalDate = (dateString, locale = 'es-AR') => {
  const localDate = parseLocalDate(dateString);
  return localDate.toLocaleDateString(locale);
};

/**
 * Get today's date in YYYY-MM-DD format (local timezone)
 * @returns {string} - Today's date in YYYY-MM-DD format
 */
export const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
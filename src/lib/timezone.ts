/**
 * Timezone utilities for formatting dates in GMT+1 (CET - fixed offset, no DST)
 * Uses fixed UTC+1 offset regardless of season
 */

export const TIMEZONE = 'Etc/GMT-1'; // Fixed GMT+1 (no DST)

/**
 * Format a date string to display in GMT+1 timezone
 * @param dateString - ISO date string (e.g., "2025-01-15T10:30:00Z")
 * @returns Formatted date string in GMT+1
 */
export function formatDateGMT1(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: TIMEZONE,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch {
    // Fallback to original format if parsing fails
    return dateString.split('T')[0];
  }
}

/**
 * Format a date string to display time in GMT+1 timezone
 * @param dateString - ISO date string (e.g., "2025-01-15T10:30:00Z")
 * @returns Formatted time string in GMT+1 (HH:mm:ss)
 */
export function formatTimeGMT1(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date);
  } catch {
    // Fallback to original format if parsing fails
    return dateString.split('T')[1]?.split('.')[0] || dateString;
  }
}

/**
 * Format a date string to display both date and time in GMT+1 timezone
 * @param dateString - ISO date string (e.g., "2025-01-15T10:30:00Z")
 * @returns Formatted datetime string in GMT+1
 */
export function formatDateTimeGMT1(dateString: string): string {
  return `${formatDateGMT1(dateString)} ${formatTimeGMT1(dateString)}`;
}
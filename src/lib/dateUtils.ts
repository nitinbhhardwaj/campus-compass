/**
 * Formats a Date object into a local 'YYYY-MM-DD' string.
 * Avoids date.toISOString() which converts to UTC and introduces off-by-one errors in non-UTC timezones.
 */
export function formatLocalDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
 * from a 'YYYY-MM-DD' local date string.
 */
export function getDayOfWeek(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day).getDay();
}

/**
 * Compares two 'YYYY-MM-DD' date strings.
 * Returns true if dateA is strictly earlier than dateB.
 */
export function isBefore(dateA: string, dateB: string): boolean {
  return dateA < dateB;
}

/**
 * Formats a 'YYYY-MM-DD' string for user-facing display (e.g., 'Saturday, Nov 21').
 */
export function formatDisplayDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

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
 * Adds or subtracts days from a local 'YYYY-MM-DD' string.
 * Uses local calendar math without time-of-day or UTC interference.
 */
export function addDays(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return formatLocalDate(date);
}

/**
 * Returns Monday-to-Sunday date range for the week containing `referenceDate`.
 */
export function getWeekRange(referenceDate: string): { startDate: string; endDate: string } {
  const [year, month, day] = referenceDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  // Calculate distance from Monday (1)
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(year, month - 1, day + diffToMonday);
  const sunday = new Date(year, month - 1, day + diffToMonday + 6);

  return {
    startDate: formatLocalDate(monday),
    endDate: formatLocalDate(sunday),
  };
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

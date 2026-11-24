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
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(year, month - 1, day + diffToMonday);
  const sunday = new Date(year, month - 1, day + diffToMonday + 6);

  return {
    startDate: formatLocalDate(monday),
    endDate: formatLocalDate(sunday),
  };
}

/**
 * Extracts 'YYYY-MM' from a 'YYYY-MM-DD' date string.
 */
export function getYearMonth(dateStr: string): string {
  return dateStr.slice(0, 7);
}

/**
 * Returns the preceding month in 'YYYY-MM' format.
 */
export function getPreviousMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number);
  const date = new Date(year, month - 2, 1);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/**
 * Returns the succeeding month in 'YYYY-MM' format.
 */
export function getNextMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number);
  const date = new Date(year, month, 1);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

/**
 * Formats a 'YYYY-MM' string into a friendly label (e.g. 'Nov 2026').
 */
export function formatMonthDisplay(yearMonth: string): string {
  const [year, month] = yearMonth.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    year: 'numeric',
  });
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

const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
] as const;

/**
 * Formats a 'YYYY-MM-DD' string into 'EEE d MMM' (e.g. 'Fri 20 Nov'), without year or comma.
 */
export function formatShortDate(dateStr: string): string {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return dateStr;
  const [year, month, day] = parts;
  const date = new Date(year, month - 1, day);
  const dayName = SHORT_DAYS[date.getDay()];
  const monthName = SHORT_MONTHS[date.getMonth()];
  return `${dayName} ${date.getDate()} ${monthName}`;
}

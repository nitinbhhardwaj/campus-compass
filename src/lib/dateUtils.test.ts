import { describe, it, expect } from 'vitest';
import { formatShortDate, formatLocalDate, getWeekRange } from './dateUtils';

describe('dateUtils', () => {
  describe('formatShortDate', () => {
    it('formats a date string as "EEE d MMM" without year or comma', () => {
      expect(formatShortDate('2026-11-20')).toBe('Fri 20 Nov');
      expect(formatShortDate('2026-11-21')).toBe('Sat 21 Nov');
      expect(formatShortDate('2026-01-01')).toBe('Thu 1 Jan');
      expect(formatShortDate('2026-12-31')).toBe('Thu 31 Dec');
    });

    it('returns empty string on empty input', () => {
      expect(formatShortDate('')).toBe('');
    });

    it('returns original input if date format is invalid', () => {
      expect(formatShortDate('invalid')).toBe('invalid');
    });
  });

  describe('formatLocalDate', () => {
    it('formats date object to local YYYY-MM-DD', () => {
      const d = new Date(2026, 10, 24);
      expect(formatLocalDate(d)).toBe('2026-11-24');
    });
  });

  describe('getWeekRange', () => {
    it('returns Monday to Sunday range', () => {
      const range = getWeekRange('2026-11-24'); // Tuesday
      expect(range.startDate).toBe('2026-11-23'); // Monday
      expect(range.endDate).toBe('2026-11-29'); // Sunday
    });
  });
});

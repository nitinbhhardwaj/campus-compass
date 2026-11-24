export interface CurrencyParseResult {
  amountPaise: number;
  isValid: boolean;
  error?: string;
}

/**
 * Pure function: Safely parses a user-entered Rupee string into integer paise.
 * Operates purely on string manipulation and integer parsing to avoid IEEE 754 floating-point inaccuracies.
 * Supports inputs like "12.5" -> 1250, "100" -> 10000, "0.75" -> 75.
 */
export function rupeeStringToPaise(input: string): CurrencyParseResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { amountPaise: 0, isValid: false, error: 'Amount is required.' };
  }

  if (trimmed.startsWith('-')) {
    return { amountPaise: 0, isValid: false, error: 'Amount must be positive.' };
  }

  // Regex strictly enforces positive digits with optional 1 or 2 decimal places
  const regex = /^\d+(\.\d{1,2})?$/;
  if (!regex.test(trimmed)) {
    return {
      amountPaise: 0,
      isValid: false,
      error: 'Enter a valid amount (e.g. 100 or 12.50).',
    };
  }

  const parts = trimmed.split('.');
  const wholePart = parts[0];
  const decimalPart = parts[1] || '';

  const wholePaise = parseInt(wholePart, 10) * 100;
  // Pad decimal: "5" -> "50", "05" -> "05", "" -> "00"
  const paddedDecimal = decimalPart.padEnd(2, '0');
  const fractionPaise = parseInt(paddedDecimal, 10);

  const totalPaise = wholePaise + fractionPaise;

  if (totalPaise <= 0) {
    return { amountPaise: 0, isValid: false, error: 'Amount must be greater than zero.' };
  }

  const MAX_PAISE = 100_000_000; // ₹10,00,000 sensible maximum
  if (totalPaise > MAX_PAISE) {
    return { amountPaise: 0, isValid: false, error: 'Amount cannot exceed ₹10,00,000.' };
  }

  return { amountPaise: totalPaise, isValid: true };
}

/**
 * Pure function: Formats integer paise into Indian Rupee currency display.
 * Conversion to floating rupees occurs only at the format boundary.
 */
export function formatPaiseToRupees(paise: number, forceDecimals = false): string {
  const rupees = paise / 100;
  const hasFractions = paise % 100 !== 0;

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: forceDecimals || hasFractions ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(rupees);
}

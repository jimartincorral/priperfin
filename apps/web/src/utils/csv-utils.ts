/**
 * CSV parsing and processing utilities.
 * Extracted from csv-wizard for testability.
 */

export type DateFormat = 'YYYY-MM-DD' | 'DD.MM.YYYY' | 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'DD-MM-YYYY';
export type NumberFormat = 'dot' | 'comma';

/**
 * Parse a date string according to the specified format.
 * Returns null if parsing fails.
 */
export function parseDate(dateStr: string, format: DateFormat): Date | null {
  if (!dateStr) return null;

  let date: Date | null = null;

  if (format === 'YYYY-MM-DD') {
    // Handle ISO 8601 formats including:
    // - YYYY-MM-DD
    // - YYYY-MM-DDTHH:mm:ss
    // - YYYY-MM-DDTHH:mm:ss+TZ
    date = new Date(dateStr);
  } else if (format === 'DD.MM.YYYY') {
    const [day, month, year] = dateStr.split('.');
    if (day && month && year) date = new Date(`${year}-${month}-${day}`);
  } else if (format === 'DD/MM/YYYY') {
    const [day, month, year] = dateStr.split('/');
    if (day && month && year) date = new Date(`${year}-${month}-${day}`);
  } else if (format === 'MM/DD/YYYY') {
    const [month, day, year] = dateStr.split('/');
    if (day && month && year) date = new Date(`${year}-${month}-${day}`);
  } else if (format === 'DD-MM-YYYY') {
    const [day, month, year] = dateStr.split('-');
    if (day && month && year) date = new Date(`${year}-${month}-${day}`);
  }

  // Validate the date
  if (!date || isNaN(date.getTime())) {
    return null;
  }

  return date;
}

/**
 * Parse an amount string according to the specified number format.
 * Handles currency symbols and thousand separators.
 */
export function parseAmount(amountStr: string, format: NumberFormat): number {
  if (typeof amountStr !== 'string') {
    return parseFloat(amountStr) || 0;
  }

  let cleaned = amountStr.trim();
  // Remove currency symbols and whitespace
  cleaned = cleaned.replace(/[€$£¥\s]/g, '');

  if (format === 'comma') {
    // European format: 1.234,56 -> 1234.56
    // Remove dots (thousands separator), replace comma with dot (decimal)
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else {
    // US/UK format: 1,234.56 -> 1234.56
    // Remove commas (thousands separator)
    cleaned = cleaned.replace(/,/g, '');
  }

  return parseFloat(cleaned) || 0;
}

/**
 * Check if a row is a duplicate of another row.
 * Compares date, amount, and description.
 */
export function isDuplicate(
  row: { date: string; amount: number; description: string },
  dup: { date: string; amount: number; description: string },
): boolean {
  return (
    new Date(row.date).getTime() === new Date(dup.date).getTime() &&
    Math.abs(row.amount - dup.amount) < 0.001 &&
    row.description === dup.description
  );
}

/**
 * Auto-map CSV headers to internal fields based on keyword matching.
 */
export function autoMapHeaders(headers: string[]): Record<string, string> {
  const lowerHeaders = headers.map((h) => h.toLowerCase());

  const findMatch = (keywords: string[]): string => {
    const idx = lowerHeaders.findIndex((h) => keywords.some((k) => h.includes(k)));
    return idx >= 0 ? headers[idx] : '';
  };

  return {
    date: findMatch(['date', 'time', 'when']),
    amount: findMatch(['amount', 'value', 'cost', 'price']),
    description: findMatch(['desc', 'memo', 'payee', 'narrative']),
    notes: findMatch(['note', 'comment', 'detail', 'ref']),
  };
}

/**
 * Process CSV row data into transaction objects.
 */
export function processRow(
  row: Record<string, string>,
  mapping: Record<string, string>,
  dateFormat: DateFormat,
  numberFormat: NumberFormat,
): { date: string; amount: number; description: string; notes: string } | null {
  const dateStr = row[mapping.date];
  const amountStr = row[mapping.amount];
  const descStr = row[mapping.description];
  const notesStr = row[mapping.notes];

  const date = parseDate(dateStr, dateFormat);
  if (!date) return null;

  const amount = parseAmount(amountStr, numberFormat);
  if (amount === 0) return null;

  return {
    date: date.toISOString(),
    amount,
    description: descStr || 'Imported Transaction',
    notes: notesStr || '',
  };
}

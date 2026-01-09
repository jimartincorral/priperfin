/**
 * Extracts and normalizes merchant names from bank transaction descriptions.
 *
 * Examples:
 *   "AMAZON.COM*AB12CD SEATTLE WA" → "amazon.com"
 *   "AMAZON MARKETPLACE"           → "amazon marketplace"
 *   "STARBUCKS #12345 NEW YORK"    → "starbucks new york"
 *   "SQ *COFFEE SHOP"              → "coffee shop"
 *   "PAYPAL *NETFLIX"              → "netflix"
 */
export function extractMerchant(description: string): string {
  if (!description) return '';

  let text = description.toLowerCase();

  // Remove common payment processor prefixes (keep the merchant after)
  text = text.replace(/^(sq \*|paypal \*|stripe \*|venmo \*|zelle \*|google \*)/i, '');

  // Remove asterisk suffixes with IDs (AMAZON.COM*ABC123 -> AMAZON.COM)
  text = text.replace(/[*#][A-Z0-9]+/gi, '');

  // Remove transaction reference numbers (often at end)
  text = text.replace(/\b[A-Z]{2,3}\d{6,}\b/gi, '');

  // Remove pure number sequences (IDs, card numbers) - 4+ digits
  text = text.replace(/\b\d{4,}\b/g, '');

  // Remove date patterns (MM/DD, MM/DD/YY, MM/DD/YYYY)
  text = text.replace(/\d{1,2}\/\d{1,2}(\/\d{2,4})?/g, '');

  // Remove state abbreviations at end (2 uppercase letters at end)
  text = text.replace(/\s+[A-Z]{2}$/i, '');

  // Remove zip codes (5 digits, optionally with -4)
  text = text.replace(/\b\d{5}(-\d{4})?\b/g, '');

  // Remove common noise words
  text = text.replace(
    /\b(purchase|payment|pos|debit|credit|card|visa|mastercard|authorization|auth|recurring|ach|web|online|mobile|app)\b/gi,
    '',
  );

  // Remove hash/pound followed by numbers (store numbers like #12345)
  text = text.replace(/#\d+/g, '');

  // Normalize multiple spaces and trim
  text = text.replace(/\s+/g, ' ').trim();

  // Remove trailing punctuation
  text = text.replace(/[.,;:]+$/, '').trim();

  return text;
}

/**
 * Extracts a shorter "core" merchant name for fuzzy matching.
 * Takes the first word or first N characters of the merchant.
 */
export function extractMerchantCore(description: string): string {
  const merchant = extractMerchant(description);
  if (!merchant) return '';

  // Split into words and take first significant word
  const words = merchant.split(' ').filter((w) => w.length > 2);
  if (words.length === 0) return merchant;

  // Return first word, max 10 chars
  return words[0].substring(0, 10);
}

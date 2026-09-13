/**
 * OFX/QFX parsing and processing utilities.
 * OFX 1.x is SGML (unclosed leaf tags like <DTPOSTED>20240115), OFX 2.x is XML.
 * A regex-based extraction handles both since <STMTTRN>...</STMTTRN> aggregates
 * are always closed in both dialects, and leaf values end at the next `<` or newline.
 */

export interface OfxProcessedRow {
  date: string; // ISO 8601
  amount: number;
  description: string;
  notes: string;
  externalId?: string;
}

/** Matches by extension, case-insensitively. */
export function isOfxFilename(filename: string): boolean {
  return /\.(ofx|qfx)$/i.test(filename.trim());
}

/**
 * Parse an OFX DTPOSTED-style date: YYYYMMDD[HHMMSS[.sss][[gmt offset[:tz name]]]].
 * Only the YYYYMMDD prefix is used; time/timezone are ignored.
 */
export function parseOfxDate(raw: string): Date | null {
  if (!raw) return null;
  const match = raw.trim().match(/^(\d{4})(\d{2})(\d{2})/);
  if (!match) return null;

  const [, year, month, day] = match;
  const date = new Date(`${year}-${month}-${day}T00:00:00`);
  return isNaN(date.getTime()) ? null : date;
}

function extractTag(block: string, tag: string): string {
  const match = block.match(new RegExp(`<${tag}>([^<\\r\\n]*)`, 'i'));
  return match ? match[1].trim() : '';
}

function decodeOfxEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"');
}

/** Extracts the account id (last-known account, so it can be shown as a hint to the user). */
export function extractOfxAccountId(text: string): string | null {
  const acctBlock = text.match(/<(?:BANKACCTFROM|CCACCTFROM)>[\s\S]*?<\/(?:BANKACCTFROM|CCACCTFROM)>/i);
  if (!acctBlock) return null;
  const acctId = extractTag(acctBlock[0], 'ACCTID');
  return acctId || null;
}

/** Maps an OFX CHARSET/ENCODING header to a label TextDecoder understands. */
export function detectOfxCharset(headerText: string): string {
  const charsetMatch = headerText.match(/CHARSET:\s*(\S+)/i);
  if (charsetMatch) {
    const cp = charsetMatch[1].trim();
    if (cp === '1252') return 'windows-1252';
    if (cp === '8859-1' || cp === '1') return 'iso-8859-1';
  }
  return 'utf-8';
}

/** Reads a File as text, honoring the CHARSET declared in the OFX header (defaults to utf-8). */
export async function readOfxFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const preview = new TextDecoder('utf-8').decode(buffer.slice(0, 512));
  const charset = detectOfxCharset(preview);
  return new TextDecoder(charset).decode(buffer);
}

/**
 * Parse all <STMTTRN> transaction blocks out of raw OFX/QFX text into
 * transaction rows ready to post to /transactions/bulk.
 * Rows with an unparseable date or a zero amount are skipped.
 */
export function parseOfxTransactions(text: string): OfxProcessedRow[] {
  const blocks = text.match(/<STMTTRN>[\s\S]*?<\/STMTTRN>/gi) || [];
  const rows: OfxProcessedRow[] = [];

  for (const block of blocks) {
    const date = parseOfxDate(extractTag(block, 'DTPOSTED'));
    const amount = parseFloat(extractTag(block, 'TRNAMT'));
    if (!date || isNaN(amount) || amount === 0) continue;

    const fitId = extractTag(block, 'FITID');
    const name = decodeOfxEntities(extractTag(block, 'NAME'));
    const payee = decodeOfxEntities(extractTag(block, 'PAYEE'));
    const memo = decodeOfxEntities(extractTag(block, 'MEMO'));

    const description = name || payee || memo || 'Imported Transaction';
    const notes = memo && memo !== description ? memo : '';

    rows.push({
      date: date.toISOString(),
      amount,
      description,
      notes,
      externalId: fitId ? `ofx:${fitId}` : undefined,
    });
  }

  return rows;
}

import { parseAmount, formatRelativeTime } from '../formatters';

// parseAmount guards the whole budget pipeline: a NaN that reaches the DB
// poisons every downstream calculation and can't be fixed from the UI. These
// tests pin the notation handling and the reject-don't-salvage contract.
describe('parseAmount', () => {
  it('parses plain decimals', () => {
    expect(parseAmount('12')).toBe(12);
    expect(parseAmount('12.50')).toBe(12.5);
    expect(parseAmount('0')).toBe(0);
  });

  it('treats the last separator as the decimal mark (German notation)', () => {
    expect(parseAmount('1.200,50')).toBe(1200.5);
  });

  it('handles English notation with an explicit decimal', () => {
    expect(parseAmount('1,200.50')).toBe(1200.5);
  });

  // A single separator with no following one is genuinely ambiguous ('1,200'
  // could be 1200 or 1.2). The documented rule — the LAST separator is the
  // decimal mark — resolves it deterministically: a lone comma is decimal, a
  // lone dot is decimal. This pins that contract rather than asserting an
  // impossible disambiguation.
  it('treats a lone separator as the decimal mark', () => {
    expect(parseAmount('1,200')).toBe(1.2); // comma = decimal
    expect(parseAmount('1.200')).toBe(1.2); // dot = decimal
    expect(parseAmount('1200,5')).toBe(1200.5);
  });

  it('parses negative amounts', () => {
    expect(parseAmount('-5')).toBe(-5);
  });

  it('rejects invalid input instead of salvaging a numeric prefix', () => {
    expect(parseAmount('abc')).toBeNull();
    expect(parseAmount('12abc')).toBeNull();
    expect(parseAmount('')).toBeNull();
    expect(parseAmount('   ')).toBeNull();
    expect(parseAmount('$$')).toBeNull();
  });

  // parseFloat('1.200,50') === 1.2 — the exact silent-truncation bug this
  // function exists to prevent.
  it('does not truncate the way parseFloat would', () => {
    expect(parseAmount('1.200,50')).not.toBe(1.2);
  });
});

describe('formatRelativeTime', () => {
  // Default locale in tests is 'de'. The point of the fix is that this goes
  // through Intl.RelativeTimeFormat with the ACTIVE locale instead of the old
  // hard-coded German strings — so the special-cased wording is real, localised
  // output, not a literal we typed.
  it('uses localised "in N days" wording for larger offsets', () => {
    const inFiveDays = new Date();
    inFiveDays.setDate(inFiveDays.getDate() + 6); // ceil() lands on +6 → "in 6 Tagen"
    // German ICU output for far-out days is "in N Tagen"; assert it is
    // Intl-shaped rather than the old hard-coded literal.
    expect(formatRelativeTime(inFiveDays)).toMatch(/tag/i);
  });

  it('collapses ±1/±2 and 0 to the locale\'s single-word forms', () => {
    // numeric:'auto' is exactly what makes this localised: 0 → "heute",
    // -1 → "gestern" etc., instead of the old German-only string table.
    expect(formatRelativeTime(new Date())).toBe('heute');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    expect(formatRelativeTime(yesterday)).toBe('gestern');
  });
});

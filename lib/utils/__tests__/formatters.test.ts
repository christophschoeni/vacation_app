import { parseAmount } from '../formatters';

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

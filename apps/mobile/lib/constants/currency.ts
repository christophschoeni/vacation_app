/**
 * The shared reference currency for a vacation's stored amounts.
 *
 * Every expense stores `amountCHF` (its value converted to this currency) plus
 * the `exchangeRate` used, and a vacation's budget/limits are held in its
 * `referenceCurrency` (defaults to this). This is deliberately NOT a user's
 * home currency: when a vacation is shared between people with different home
 * currencies, all stored totals must agree on one reference, and each device
 * only converts to its own home currency for *display*.
 *
 * The name "CHF" and the `amountCHF` column are kept for backwards
 * compatibility; semantically the value is "amount in the reference currency".
 */
export const REFERENCE_CURRENCY = 'CHF';

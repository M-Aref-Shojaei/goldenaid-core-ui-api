/**
 * @deprecated Import directly from the focused utility modules:
 *   - formatters.ts   — date, number, text formatting
 *   - validators.ts   — phone, OTP, session validation
 *   - role-utils.ts   — role names, badge colours, order status
 *   - array-utils.ts  — debounce, groupBy, sortBy, deepClone
 *
 * This barrel re-exports everything for backward compatibility.
 */
export * from './formatters';
export * from './validators';
export * from './role-utils';
export * from './array-utils';

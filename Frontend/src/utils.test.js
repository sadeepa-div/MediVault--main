import { describe, it, expect } from 'vitest';
import { statusFor, overallStatus, daysUntil } from './utils.js';

describe('statusFor', () => {
  it('returns out_of_stock for zero', () => expect(statusFor(0)).toBe('out_of_stock'));
  it('returns low for small quantities', () => expect(statusFor(5)).toBe('low'));
  it('returns in_stock for large quantities', () => expect(statusFor(50)).toBe('in_stock'));
});

describe('overallStatus', () => {
  it('prefers in_stock', () =>
    expect(overallStatus([{ status: 'low' }, { status: 'in_stock' }])).toBe('in_stock'));
  it('falls back to out_of_stock', () =>
    expect(overallStatus([{ status: 'out_of_stock' }])).toBe('out_of_stock'));
});

describe('daysUntil', () => {
  it('returns null without a date', () => expect(daysUntil(null)).toBeNull());
  it('is negative for past dates', () => expect(daysUntil('2000-01-01')).toBeLessThan(0));
});

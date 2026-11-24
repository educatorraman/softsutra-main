import { describe, expect, it } from 'vitest';
import { calculateEmi, calculateGst } from './finance';

describe('finance engines (decimal.js, ROUND_HALF_UP)', () => {
  it('calculates EMI for a standard loan', () => {
    const result = calculateEmi({ principal: 100000, annualRate: 12, months: 12 });
    expect(result.emi).toBe('8884.88');
    expect(result.totalInterest).toBe('6618.56');
  });

  it('handles a zero-interest loan without division by zero', () => {
    const result = calculateEmi({ principal: 12000, annualRate: 0, months: 12 });
    expect(result.emi).toBe('1000.00');
    expect(result.totalInterest).toBe('0.00');
  });

  it('splits inclusive GST into CGST and SGST', () => {
    const result = calculateGst({ amount: 11800, rate: 18, mode: 'inclusive', split: 'intra' });
    expect(result.taxableValue).toBe('10000.00');
    expect(result.totalTax).toBe('1800.00');
    expect(result.componentA).toBe('900.00');
    expect(result.componentB).toBe('900.00');
  });

  it('keeps inter-state GST in one IGST component', () => {
    const result = calculateGst({ amount: 10000, rate: 18, mode: 'exclusive', split: 'inter' });
    expect(result.totalAmount).toBe('11800.00');
    expect(result.componentA).toBe('1800.00');
    expect(result.componentB).toBe('0.00');
  });
});

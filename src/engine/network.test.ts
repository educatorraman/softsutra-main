import { describe, expect, it } from 'vitest';
import { summarizeLatency } from './network';

describe('latency preview engine', () => {
  it('computes min, mean and consecutive-sample jitter', () => {
    const result = summarizeLatency([20, 30, 22, 28]);
    expect(result.min).toBe(20);
    expect(result.average).toBe(25);
    expect(result.jitter).toBe(8);
    expect(result.rating).toBe('Excellent');
  });

  it('never divides by zero for empty samples', () => {
    expect(summarizeLatency([])).toEqual({ count: 0, min: 0, average: 0, jitter: 0, rating: 'Poor' });
  });
});

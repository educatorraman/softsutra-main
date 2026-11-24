export interface LatencySummary {
  count: number;
  min: number;
  average: number;
  jitter: number;
  rating: 'Excellent' | 'Good' | 'Fair' | 'Poor';
}

export function rateLatency(ms: number): LatencySummary['rating'] {
  if (ms < 30) return 'Excellent';
  if (ms < 80) return 'Good';
  if (ms < 150) return 'Fair';
  return 'Poor';
}

/** Jitter = mean absolute difference between consecutive RTT samples. */
export function summarizeLatency(samples: number[]): LatencySummary {
  const valid = samples.filter((value) => Number.isFinite(value) && value >= 0);
  if (valid.length === 0) {
    return { count: 0, min: 0, average: 0, jitter: 0, rating: 'Poor' };
  }
  const min = Math.min(...valid);
  const average = valid.reduce((sum, value) => sum + value, 0) / valid.length;
  let jitter = 0;
  for (let index = 1; index < valid.length; index += 1) {
    jitter += Math.abs(valid[index] - valid[index - 1]);
  }
  jitter = valid.length > 1 ? jitter / (valid.length - 1) : 0;
  return {
    count: valid.length,
    min: Math.round(min * 10) / 10,
    average: Math.round(average * 10) / 10,
    jitter: Math.round(jitter * 10) / 10,
    rating: rateLatency(average),
  };
}

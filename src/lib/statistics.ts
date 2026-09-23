/**
 * Statistical Calculation Engine for AR-DUINO-M Thesis System
 */

export interface VerbalInterpretation {
  range: string;
  interpretation: string;
}

export const VERBAL_INTERPRETATION_SCALE: VerbalInterpretation[] = [
  { range: '4.21 - 5.00', interpretation: 'Very Much Acceptable' },
  { range: '3.41 - 4.20', interpretation: 'Much Acceptable' },
  { range: '2.61 - 3.40', interpretation: 'Acceptable' },
  { range: '1.81 - 2.60', interpretation: 'Less Acceptable' },
  { range: '1.00 - 1.80', interpretation: 'Not Acceptable' },
];

export function getVerbalInterpretation(mean: number | null | undefined): string {
  if (mean === null || mean === undefined || isNaN(mean)) {
    return 'Insufficient data';
  }
  // Round to 2 decimal places for boundary comparison
  const rounded = Math.round(mean * 100) / 100;
  if (rounded >= 4.21) return 'Very Much Acceptable';
  if (rounded >= 3.41) return 'Much Acceptable';
  if (rounded >= 2.61) return 'Acceptable';
  if (rounded >= 1.81) return 'Less Acceptable';
  if (rounded >= 1.00) return 'Not Acceptable';
  return 'Not Acceptable';
}

export interface FrequencyDistribution {
  1: { count: number; percentage: number };
  2: { count: number; percentage: number };
  3: { count: number; percentage: number };
  4: { count: number; percentage: number };
  5: { count: number; percentage: number };
}

export function calculateFrequencies(ratings: number[]): FrequencyDistribution {
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of ratings) {
    if (r >= 1 && r <= 5) {
      counts[r as 1 | 2 | 3 | 4 | 5]++;
    }
  }
  const total = ratings.length;
  return {
    1: { count: counts[1], percentage: total > 0 ? (counts[1] / total) * 100 : 0 },
    2: { count: counts[2], percentage: total > 0 ? (counts[2] / total) * 100 : 0 },
    3: { count: counts[3], percentage: total > 0 ? (counts[3] / total) * 100 : 0 },
    4: { count: counts[4], percentage: total > 0 ? (counts[4] / total) * 100 : 0 },
    5: { count: counts[5], percentage: total > 0 ? (counts[5] / total) * 100 : 0 },
  };
}

export function calculateWeightedMean(ratings: number[]): number | null {
  if (!ratings || ratings.length === 0) return null;
  const sum = ratings.reduce((acc, val) => acc + val, 0);
  return sum / ratings.length;
}

export function calculateSampleSD(ratings: number[]): number | null {
  if (!ratings || ratings.length <= 1) return 0;
  const mean = calculateWeightedMean(ratings);
  if (mean === null) return null;
  const sumSquaredDiff = ratings.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
  return Math.sqrt(sumSquaredDiff / (ratings.length - 1));
}

// Regularized Incomplete Beta Function & Student's t-test p-value
function logGamma(x: number): number {
  const coef = [
    76.18009172947146,
    -86.50532032941677,
    24.01409824083091,
    -1.231739572450155,
    0.1208650973866179e-2,
    -0.5395239384953e-5,
  ];
  let y = x;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j <= 5; j++) {
    ser += coef[j] / ++y;
  }
  return -tmp + Math.log(2.5066282746310005 * ser / x);
}

function betacf(a: number, b: number, x: number): number {
  const MAXIT = 100;
  const EPS = 3.0e-7;
  const FPMIN = 1.0e-30;

  const qab = a + b;
  const qap = a + 1.0;
  const qam = a - 1.0;
  let c = 1.0;
  let d = 1.0 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1.0 / d;
  let h = d;

  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1.0 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1.0 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1.0 / d;
    h *= d * c;

    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1.0 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1.0 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1.0 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1.0) < EPS) break;
  }
  return h;
}

export function incBeta(a: number, b: number, x: number): number {
  if (x < 0.0 || x > 1.0) return 0.0;
  if (x === 0.0) return 0.0;
  if (x === 1.0) return 1.0;

  const bt = Math.exp(logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1.0 - x));

  if (x < (a + 1.0) / (a + b + 2.0)) {
    return (bt * betacf(a, b, x)) / a;
  } else {
    return 1.0 - (bt * betacf(b, a, 1.0 - x)) / b;
  }
}

export function studentT_pValue(t: number, df: number): number {
  if (df <= 0 || isNaN(t) || isNaN(df)) return 1.0;
  const absT = Math.abs(t);
  const x = df / (df + absT * absT);
  const p = incBeta(df / 2.0, 0.5, x);
  return Math.max(0.0, Math.min(1.0, p));
}

export interface TTestResult {
  variable: string;
  expertN: number;
  studentN: number;
  expertMean: number | null;
  studentMean: number | null;
  expertSD: number | null;
  studentSD: number | null;
  difference: number | null;
  tValue: number | null;
  degreesOfFreedom: number | null;
  pValue: number | null;
  decision: 'Reject H₀' | 'Fail to reject H₀' | 'Insufficient data';
  interpretation: 'Statistically significant difference' | 'No statistically significant difference' | 'Insufficient data';
}

export function calculateIndependentTTest(
  variable: string,
  expertValues: number[],
  studentValues: number[]
): TTestResult {
  const n1 = expertValues.length;
  const n2 = studentValues.length;

  if (n1 < 2 || n2 < 2) {
    return {
      variable,
      expertN: n1,
      studentN: n2,
      expertMean: calculateWeightedMean(expertValues),
      studentMean: calculateWeightedMean(studentValues),
      expertSD: calculateSampleSD(expertValues),
      studentSD: calculateSampleSD(studentValues),
      difference: null,
      tValue: null,
      degreesOfFreedom: null,
      pValue: null,
      decision: 'Insufficient data',
      interpretation: 'Insufficient data',
    };
  }

  const m1 = calculateWeightedMean(expertValues)!;
  const m2 = calculateWeightedMean(studentValues)!;
  const sd1 = calculateSampleSD(expertValues)!;
  const sd2 = calculateSampleSD(studentValues)!;

  const var1 = Math.pow(sd1, 2);
  const var2 = Math.pow(sd2, 2);

  // Equal variance pooled standard error
  const df = n1 + n2 - 2;
  const pooledVar = ((n1 - 1) * var1 + (n2 - 1) * var2) / df;
  const se = Math.sqrt(pooledVar * (1 / n1 + 1 / n2));

  let t = 0;
  if (se > 0) {
    t = (m1 - m2) / se;
  }

  const p = studentT_pValue(t, df);
  const isSignificant = p <= 0.05;

  return {
    variable,
    expertN: n1,
    studentN: n2,
    expertMean: m1,
    studentMean: m2,
    expertSD: sd1,
    studentSD: sd2,
    difference: m1 - m2,
    tValue: t,
    degreesOfFreedom: df,
    pValue: p,
    decision: isSignificant ? 'Reject H₀' : 'Fail to reject H₀',
    interpretation: isSignificant
      ? 'Statistically significant difference'
      : 'No statistically significant difference',
  };
}

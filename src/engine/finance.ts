import Decimal from 'decimal.js';

Decimal.set({ precision: 32, rounding: Decimal.ROUND_HALF_UP });

export interface EmiInput {
  principal: number | string;
  annualRate: number | string;
  months: number;
}

export interface EmiResult {
  emi: string;
  totalPayable: string;
  totalInterest: string;
  principal: string;
  monthlyRatePercent: string;
}

export interface GstInput {
  amount: number | string;
  rate: number | string;
  mode: 'inclusive' | 'exclusive';
  split: 'intra' | 'inter';
}

export interface GstResult {
  taxableValue: string;
  totalTax: string;
  totalAmount: string;
  componentA: string;
  componentB: string;
  componentALabel: string;
  componentBLabel: string;
}

const money = (value: Decimal) => value.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(2);
const dec = (value: number | string): Decimal => {
  const text = String(value ?? '').trim();
  if (!text || Number.isNaN(Number(text))) return new Decimal(0);
  return new Decimal(text);
};

/** Standard reducing-balance EMI with exact decimal arithmetic. */
export function calculateEmi(input: EmiInput): EmiResult {
  const principal = dec(input.principal);
  const annualRate = dec(input.annualRate);
  const months = Math.max(1, Math.floor(Number(input.months) || 0));
  const monthlyRate = annualRate.div(1200);
  let emi: Decimal;

  if (monthlyRate.isZero()) {
    emi = principal.div(months);
  } else {
    const factor = monthlyRate.plus(1).pow(months);
    emi = principal.times(monthlyRate).times(factor).div(factor.minus(1));
  }

  const displayedEmi = money(emi);
  const totalPayable = dec(displayedEmi).times(months);
  return {
    emi: displayedEmi,
    totalPayable: money(totalPayable),
    totalInterest: money(totalPayable.minus(principal)),
    principal: money(principal),
    monthlyRatePercent: monthlyRate.times(100).toDecimalPlaces(6).toString(),
  };
}

/** GST split for inclusive (tax already in price) or exclusive (tax added) amounts. */
export function calculateGst(input: GstInput): GstResult {
  const rate = dec(input.rate).div(100);
  const amount = dec(input.amount);
  let taxable: Decimal;
  let tax: Decimal;

  if (input.mode === 'inclusive') {
    taxable = amount.div(rate.plus(1));
    tax = amount.minus(taxable);
  } else {
    taxable = amount;
    tax = amount.times(rate);
  }

  const half = tax.div(2);
  const intra = input.split === 'intra';
  return {
    taxableValue: money(taxable),
    totalTax: money(tax),
    totalAmount: money(taxable.plus(tax)),
    componentA: money(intra ? half : tax),
    componentB: money(intra ? half : new Decimal(0)),
    componentALabel: intra ? 'CGST' : 'IGST',
    componentBLabel: intra ? 'SGST' : 'State tax (none)',
  };
}

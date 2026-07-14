import { TaxBracket } from "../types";

export interface TaxCalculationResult {
  grossIncome: number;
  taxableIncome: number;
  totalTax: number;
  totalNiOrFica: number;
  deductionAmount: number; // Personal allowance or standard deduction
  pensionContribution: number;
  netIncome: number;
  effectiveTaxRate: number;
  brackets: TaxBracket[];
}

// Calculate UK Tax
export function calculateUKTax(
  grossIncome: number,
  pensionRate: number, // percentage, e.g. 5
  isSelfEmployed: boolean
): TaxCalculationResult {
  // Pension contribution is deducted before tax (Salary Sacrifice)
  const pensionContribution = (grossIncome * pensionRate) / 100;
  let adjustedGross = Math.max(0, grossIncome - pensionContribution);

  // UK Personal Allowance Tapering: £12,570.
  // Reduces by £1 for every £2 of income over £100,000.
  let personalAllowance = 12570;
  if (adjustedGross > 100000) {
    const excess = adjustedGross - 100000;
    personalAllowance = Math.max(0, 12570 - excess / 2);
  }

  const taxableIncome = Math.max(0, adjustedGross - personalAllowance);

  // 2026/27 and 2025/26 Brackets (income after allowance)
  // Basic Rate: 20% on first £37,700 of taxable income (up to £50,270 adjusted gross if allowance is full)
  // Higher Rate: 40% up to £125,140
  // Additional Rate: 45% above £125,140
  const brackets: TaxBracket[] = [
    { rate: 20, threshold: 0, taxableAmount: 0, taxCharged: 0 },
    { rate: 40, threshold: 37700, taxableAmount: 0, taxCharged: 0 },
    { rate: 45, threshold: 112570, taxableAmount: 0, taxCharged: 0 },
  ];

  let remainingTaxable = taxableIncome;
  let totalTax = 0;

  // Compute bracket tax
  for (let i = 0; i < brackets.length; i++) {
    const bracket = brackets[i];
    const nextThreshold = i < brackets.length - 1 ? brackets[i + 1].threshold : Infinity;
    const bracketSize = nextThreshold - bracket.threshold;

    if (remainingTaxable > 0) {
      const taxableInBracket = Math.min(remainingTaxable, bracketSize);
      bracket.taxableAmount = taxableInBracket;
      bracket.taxCharged = (taxableInBracket * bracket.rate) / 100;
      totalTax += bracket.taxCharged;
      remainingTaxable -= taxableInBracket;
    }
  }

  // National Insurance
  // If Employed: Class 1 NI (8% on £12,570 - £50,270, 2% above £50,270)
  // If Self-Employed: Class 4 NI (6% on £12,570 - £50,270, 2% above £50,270)
  let totalNi = 0;
  const niThreshold1 = 12570;
  const niThreshold2 = 50270;
  const niRate1 = isSelfEmployed ? 6 : 8;
  const niRate2 = 2;

  if (grossIncome > niThreshold1) {
    if (grossIncome <= niThreshold2) {
      totalNi = ((grossIncome - niThreshold1) * niRate1) / 100;
    } else {
      totalNi = ((niThreshold2 - niThreshold1) * niRate1) / 100 + ((grossIncome - niThreshold2) * niRate2) / 100;
    }
  }

  const totalDeductions = totalTax + totalNi + pensionContribution;
  const netIncome = grossIncome - totalDeductions;
  const effectiveTaxRate = grossIncome > 0 ? ((totalTax + totalNi) / grossIncome) * 100 : 0;

  return {
    grossIncome,
    taxableIncome,
    totalTax,
    totalNiOrFica: totalNi,
    deductionAmount: personalAllowance,
    pensionContribution,
    netIncome,
    effectiveTaxRate,
    brackets,
  };
}

// Calculate US Tax (Single Filer)
export function calculateUSTax(
  grossIncome: number,
  pensionRate: number, // represented as traditional 401(k) deduction
  isSelfEmployed: boolean
): TaxCalculationResult {
  // 401k/Pension deduction
  const pensionContribution = (grossIncome * pensionRate) / 100;
  let preTaxIncome = Math.max(0, grossIncome - pensionContribution);

  // Self-Employment Tax (FICA) calculation
  let totalFica = 0;
  let seTaxDeduction = 0; // Half of SE tax is deductible from gross before calculating income tax

  if (isSelfEmployed) {
    // US SE Tax: 15.3% on 92.35% of net profit
    const netEarnings = preTaxIncome * 0.9235;
    // Social Security (12.4% up to cap of $168,600) + Medicare (2.9% on all)
    const ssCap = 168600;
    const ssTax = Math.min(netEarnings, ssCap) * 0.124;
    const medicareTax = netEarnings * 0.029;
    
    // Additional Medicare tax (0.9% for earnings above $200,000)
    const addMedicare = netEarnings > 200000 ? (netEarnings - 200000) * 0.009 : 0;
    
    totalFica = ssTax + medicareTax + addMedicare;
    seTaxDeduction = totalFica / 2;
  } else {
    // Standard Employee FICA: 6.2% SS up to $168.6k + 1.45% Medicare (+ 0.9% above $200k)
    const ssTax = Math.min(preTaxIncome, 168600) * 0.062;
    const medicareTax = preTaxIncome * 0.0145;
    const addMedicare = preTaxIncome > 200000 ? (preTaxIncome - 200000) * 0.009 : 0;
    totalFica = ssTax + medicareTax + addMedicare;
  }

  // Deduct half of SE tax (if self-employed)
  let adjustedGross = Math.max(0, preTaxIncome - seTaxDeduction);

  // Standard deduction for Single (approx. $15,000 for 2026 inflation estimate)
  const standardDeduction = 15000;
  const taxableIncome = Math.max(0, adjustedGross - standardDeduction);

  // 2026 US Single Brackets (estimated):
  // 10%: $0 - $11,600
  // 12%: $11,600 - $47,150
  // 22%: $47,150 - $100,525
  // 24%: $100,525 - $191,950
  // 32%: $191,950 - $243,725
  // 35%: $243,725 - $609,350
  // 37%: above $609,350
  const brackets: TaxBracket[] = [
    { rate: 10, threshold: 0, taxableAmount: 0, taxCharged: 0 },
    { rate: 12, threshold: 11600, taxableAmount: 0, taxCharged: 0 },
    { rate: 22, threshold: 47150, taxableAmount: 0, taxCharged: 0 },
    { rate: 24, threshold: 100525, taxableAmount: 0, taxCharged: 0 },
    { rate: 32, threshold: 191950, taxableAmount: 0, taxCharged: 0 },
    { rate: 35, threshold: 243725, taxableAmount: 0, taxCharged: 0 },
    { rate: 37, threshold: 609350, taxableAmount: 0, taxCharged: 0 },
  ];

  let remainingTaxable = taxableIncome;
  let totalTax = 0;

  for (let i = 0; i < brackets.length; i++) {
    const bracket = brackets[i];
    const nextThreshold = i < brackets.length - 1 ? brackets[i + 1].threshold : Infinity;
    const bracketSize = nextThreshold - bracket.threshold;

    if (remainingTaxable > 0) {
      const taxableInBracket = Math.min(remainingTaxable, bracketSize);
      bracket.taxableAmount = taxableInBracket;
      bracket.taxCharged = (taxableInBracket * bracket.rate) / 100;
      totalTax += bracket.taxCharged;
      remainingTaxable -= taxableInBracket;
    }
  }

  const totalDeductions = totalTax + totalFica + pensionContribution;
  const netIncome = grossIncome - totalDeductions;
  const effectiveTaxRate = grossIncome > 0 ? ((totalTax + totalFica) / grossIncome) * 100 : 0;

  return {
    grossIncome,
    taxableIncome,
    totalTax,
    totalNiOrFica: totalFica,
    deductionAmount: standardDeduction,
    pensionContribution,
    netIncome,
    effectiveTaxRate,
    brackets,
  };
}

// Custom simple flat tax calculation
export function calculateCustomTax(
  grossIncome: number,
  flatTaxRate: number, // percentage, e.g. 15%
  deductionAmount: number, // flat deduction, e.g. 5000
  flatSocialRate: number // flat social contribution, e.g. 5%
): TaxCalculationResult {
  const taxableIncome = Math.max(0, grossIncome - deductionAmount);
  const totalTax = (taxableIncome * flatTaxRate) / 100;
  const totalSocial = (grossIncome * flatSocialRate) / 100;
  const netIncome = grossIncome - (totalTax + totalSocial);
  const effectiveTaxRate = grossIncome > 0 ? ((totalTax + totalSocial) / grossIncome) * 100 : 0;

  const brackets: TaxBracket[] = [
    {
      rate: flatTaxRate,
      threshold: deductionAmount,
      taxableAmount: taxableIncome,
      taxCharged: totalTax,
    },
  ];

  return {
    grossIncome,
    taxableIncome,
    totalTax,
    totalNiOrFica: totalSocial,
    deductionAmount,
    pensionContribution: 0,
    netIncome,
    effectiveTaxRate,
    brackets,
  };
}

export interface DynamicCountryConfig {
  countryName: string;
  currencySymbol: string;
  currencyCode: string;
  standardDeduction: number;
  socialSecurityRate: number;
  brackets: { rate: number; threshold: number }[];
  notes?: string;
}

export function calculateDynamicTax(
  grossIncome: number,
  pensionRate: number,
  isSelfEmployed: boolean,
  config: DynamicCountryConfig
): TaxCalculationResult {
  const pensionContribution = (grossIncome * pensionRate) / 100;
  const preTaxIncome = Math.max(0, grossIncome - pensionContribution);
  const taxableIncome = Math.max(0, preTaxIncome - config.standardDeduction);

  const brackets: TaxBracket[] = config.brackets.map(b => ({
    rate: b.rate,
    threshold: b.threshold,
    taxableAmount: 0,
    taxCharged: 0,
  }));

  // Sort brackets by threshold to ensure progressive calculation
  brackets.sort((a, b) => a.threshold - b.threshold);

  let remainingTaxable = taxableIncome;
  let totalTax = 0;

  for (let i = 0; i < brackets.length; i++) {
    const bracket = brackets[i];
    const nextThreshold = i < brackets.length - 1 ? brackets[i + 1].threshold : Infinity;
    const bracketSize = nextThreshold - bracket.threshold;

    if (remainingTaxable > 0) {
      const taxableInBracket = Math.min(remainingTaxable, bracketSize);
      bracket.taxableAmount = taxableInBracket;
      bracket.taxCharged = (taxableInBracket * bracket.rate) / 100;
      totalTax += bracket.taxCharged;
      remainingTaxable -= taxableInBracket;
    }
  }

  // Social Security/Contributions: slightly higher if self-employed, or basic combined
  const seSurcharge = isSelfEmployed ? 1.2 : 1.0;
  const totalSocial = (grossIncome * (config.socialSecurityRate * seSurcharge)) / 100;

  const totalDeductions = totalTax + totalSocial + pensionContribution;
  const netIncome = grossIncome - totalDeductions;
  const effectiveTaxRate = grossIncome > 0 ? ((totalTax + totalSocial) / grossIncome) * 100 : 0;

  return {
    grossIncome,
    taxableIncome,
    totalTax,
    totalNiOrFica: totalSocial,
    deductionAmount: config.standardDeduction,
    pensionContribution,
    netIncome,
    effectiveTaxRate,
    brackets,
  };
}

import type { IncomeTaxParams, IncomeTaxResult } from '../data/types';
import { roundDownTo, clampMin } from './common';

export function calcIncomeTax(
  incomeAfterDeductions: number,
  params: IncomeTaxParams,
  basicDeduction: number,
): IncomeTaxResult {
  const taxableIncome = roundDownTo(clampMin(incomeAfterDeductions, 0), params.roundTaxableIncomeDownTo);

  let rate = 0;
  let bracketDeduction = 0;
  for (const b of params.brackets) {
    if (b.upperLimit === null || taxableIncome <= b.upperLimit) {
      rate = b.rate;
      bracketDeduction = b.deduction;
      break;
    }
  }

  const rawTax = clampMin(taxableIncome * rate - bracketDeduction, 0);
  const incomeTaxBeforeSurtax = roundDownTo(rawTax, params.roundTaxAmountDownTo);

  const reconstructionSurtax = Math.floor(incomeTaxBeforeSurtax * params.reconstructionSurtaxRate);
  const totalIncomeTax = incomeTaxBeforeSurtax + reconstructionSurtax;

  return {
    taxableIncome,
    incomeTaxBeforeSurtax,
    reconstructionSurtax,
    totalIncomeTax,
    basicDeduction,
    appliedBracketRate: rate,
  };
}

import type { ResidentTaxParams, ResidentTaxResult } from '../data/types';
import { roundDownTo, clampMin } from './common';

export function calcResidentTax(
  incomeAfterDeductions: number,
  params: ResidentTaxParams,
): ResidentTaxResult {
  const taxableIncome = roundDownTo(clampMin(incomeAfterDeductions, 0), params.roundTaxableIncomeDownTo);

  const incomeLevy = roundDownTo(taxableIncome * params.incomeRate, params.roundTaxAmountDownTo);
  const perCapitaLevy = taxableIncome > 0 ? params.perCapitaLevy : 0;
  const totalResidentTax = incomeLevy + perCapitaLevy;

  return {
    taxableIncome,
    incomeLevy,
    perCapitaLevy,
    totalResidentTax,
    basicDeduction: params.basicDeduction,
  };
}

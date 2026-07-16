import type { IncomeTaxParams, IncomeTaxResult } from '../data/types';
import { roundDownTo, clampMin } from './common';

/**
 * 所得税額（復興特別所得税を含む）を計算する。
 * @param incomeAfterDeductions 所得控除後の金額（合計所得 − 所得控除合計）
 * @param params 税率表・端数処理などの税制パラメータ
 * @param basicDeduction 適用された基礎控除額（所得に応じた逓減計算は呼び出し側で解決済み）
 * @returns 課税所得・所得税額・復興特別所得税・適用税率・基礎控除額を含む計算結果
 */
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

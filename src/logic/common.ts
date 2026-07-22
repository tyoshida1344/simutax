import type { PrefectureData, ResidentTaxParams } from '../data/types';

export function roundDownTo(value: number, unit: number): number {
  return Math.floor(value / unit) * unit;
}

export function clampMin(value: number, min: number): number {
  return Math.max(value, min);
}

export function buildPrefResidentTaxParams(
  base: ResidentTaxParams,
  pref: PrefectureData,
): ResidentTaxParams {
  return { ...base, incomeRate: pref.residentTaxIncomeRate, perCapitaLevy: pref.residentTaxPerCapitaLevy };
}

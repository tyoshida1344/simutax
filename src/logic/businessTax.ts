import type { BusinessTaxParams, BusinessTaxResult } from '../data/types';
import { clampMin } from './common';

export function calcBusinessTax(
  businessIncome: number,
  businessTypeKey: string,
  params: BusinessTaxParams,
): BusinessTaxResult {
  const typeEntry = params.types[businessTypeKey] ?? params.types[params.defaultType];
  const rate = typeEntry.rate;

  const taxBase = clampMin(businessIncome - params.businessOwnerDeduction, 0);
  const totalBusinessTax = Math.floor(taxBase * rate);

  return {
    taxableIncome: businessIncome,
    businessOwnerDeduction: params.businessOwnerDeduction,
    taxBase,
    rate,
    totalBusinessTax,
  };
}

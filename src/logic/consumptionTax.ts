import type {
  ConsumptionTaxParams,
  ConsumptionTaxResult,
  ConsumptionTaxMethod,
  ConsumptionTaxMethodResult,
} from '../data/types';
import { clampMin } from './common';

export function calcConsumptionTax(
  revenue: number,
  expenses: number,
  basePeriodSales: 'under10m' | 'over10m' | 'over50m',
  invoiceRegistered: boolean,
  taxablePurchaseRatio: number,
  simplifiedCategoryKey: string,
  selectedMethod: ConsumptionTaxMethod | null,
  taxYear: number,
  params: ConsumptionTaxParams,
): ConsumptionTaxResult {
  const [num, denom] = params.taxRateFraction;
  const isTaxableByThreshold = basePeriodSales !== 'under10m';
  const isTaxable = isTaxableByThreshold || invoiceRegistered;

  if (!isTaxable) {
    const zeroMethod = { amount: 0, applicable: false, reason: null };
    return {
      isTaxable: false,
      taxableReason: null,
      salesTax: 0,
      purchaseTax: 0,
      standardMethod: zeroMethod,
      simplifiedMethod: zeroMethod,
      special20Method: zeroMethod,
      recommendedMethod: null,
      appliedMethod: null,
      appliedAmount: 0,
    };
  }

  const taxableReason = isTaxableByThreshold
    ? '基準期間の課税売上高が1,000万円超'
    : 'インボイス発行事業者';

  const salesTax = Math.floor(revenue * num / denom);
  const purchaseTax = Math.floor(expenses * (taxablePurchaseRatio / 100) * num / denom);

  // 本則課税
  const standardMethod: ConsumptionTaxMethodResult = {
    amount: clampMin(salesTax - purchaseTax, 0),
    applicable: true,
    reason: null,
  };

  // 簡易課税: salesTax - salesTax*みなし仕入率 で計算（浮動小数点誤差を回避）
  const simplifiedApplicable = basePeriodSales !== 'over50m';
  const category = params.simplifiedCategories[simplifiedCategoryKey]
    ?? params.simplifiedCategories[params.defaultSimplifiedCategory];
  const simplifiedMethod: ConsumptionTaxMethodResult = {
    amount: simplifiedApplicable ? salesTax - Math.floor(salesTax * category.deemedPurchaseRate) : 0,
    applicable: simplifiedApplicable,
    reason: simplifiedApplicable ? null : '基準期間の課税売上高が5,000万円超のため適用不可',
  };

  // 2割特例
  const special20Eligible =
    invoiceRegistered &&
    !isTaxableByThreshold &&
    params.twentyPercentSpecialEligibleYears.includes(taxYear);
  const special20Method: ConsumptionTaxMethodResult = {
    amount: special20Eligible ? Math.floor(salesTax * params.twentyPercentSpecialRate) : 0,
    applicable: special20Eligible,
    reason: isTaxableByThreshold
      ? '基準期間の課税売上高が1,000万円超のため適用不可'
      : !invoiceRegistered
        ? 'インボイス発行事業者でないため適用不可'
        : !params.twentyPercentSpecialEligibleYears.includes(taxYear)
          ? `${taxYear}年は2割特例の適用期間外`
          : null,
  };

  const methods: Record<ConsumptionTaxMethod, ConsumptionTaxMethodResult> = {
    standard: standardMethod,
    simplified: simplifiedMethod,
    special20: special20Method,
  };

  // 適用可能な方式から最小額のものを推奨
  const recommendedMethod = (Object.keys(methods) as ConsumptionTaxMethod[])
    .filter((m) => methods[m].applicable)
    .sort((a, b) => methods[a].amount - methods[b].amount)[0];

  const appliedMethod = selectedMethod && methods[selectedMethod].applicable
    ? selectedMethod
    : recommendedMethod;

  return {
    isTaxable,
    taxableReason,
    salesTax,
    purchaseTax,
    standardMethod,
    simplifiedMethod,
    special20Method,
    recommendedMethod,
    appliedMethod,
    appliedAmount: methods[appliedMethod].amount,
  };
}

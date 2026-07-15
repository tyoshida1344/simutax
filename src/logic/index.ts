import type { TaxParams, SimulatorInput, SimulatorResult } from '../data/types';
import { clampMin } from './common';
import { getBlueReturnDeduction, calcDeductionsForIncomeTax, calcDeductionsForResidentTax } from './deductions';
import { calcIncomeTax } from './incomeTax';
import { calcResidentTax } from './residentTax';
import { calcBusinessTax } from './businessTax';
import { calcConsumptionTax } from './consumptionTax';
import { calcSocialInsurance } from './socialInsurance';

export function simulate(input: SimulatorInput, params: TaxParams): SimulatorResult {
  const businessIncome = clampMin(input.revenue - input.expenses, 0);

  const blueReturnDeduction = getBlueReturnDeduction(input.filingType, params.blueReturnDeductions);
  const totalIncome = clampMin(businessIncome - blueReturnDeduction, 0);

  const si = calcSocialInsurance(
    totalIncome,
    input.age,
    input.householdMembers,
    input.nhiModel,
    params.socialInsurance,
  );

  const socialInsuranceDeduction =
    input.manualSocialInsurance !== null
      ? input.manualSocialInsurance
      : si.totalSocialInsurance;

  const incomeTaxDeductions = calcDeductionsForIncomeTax(
    totalIncome,
    params.incomeTax,
    socialInsuranceDeduction,
    input.iDeCoContribution,
    input.smallBusinessMutualAid,
    input.dependentCount,
    input.spouseDeduction,
    input.lifeInsuranceDeduction,
    input.medicalExpenseDeduction,
  );

  const residentTaxDeductions = calcDeductionsForResidentTax(
    params.residentTax,
    socialInsuranceDeduction,
    input.iDeCoContribution,
    input.smallBusinessMutualAid,
    input.dependentCount,
    input.spouseDeduction,
    input.lifeInsuranceDeduction,
    input.medicalExpenseDeduction,
  );

  const incomeTax = calcIncomeTax(totalIncome - incomeTaxDeductions.total, params.incomeTax);
  incomeTax.basicDeduction = incomeTaxDeductions.basicDeduction;

  const residentTax = calcResidentTax(totalIncome - residentTaxDeductions.total, params.residentTax);

  // 事業税は青色申告控除を戻した事業所得で計算
  const businessTax = calcBusinessTax(businessIncome, input.businessType, params.businessTax);

  const consumptionTax = calcConsumptionTax(
    input.revenue,
    input.expenses,
    input.basePeriodSales,
    input.invoiceRegistered,
    input.taxablePurchaseRatio,
    params.consumptionTax.defaultSimplifiedCategory,
    input.selectedConsumptionTaxMethod,
    params.meta.taxYear,
    params.consumptionTax,
  );

  const totalTax = incomeTax.totalIncomeTax + residentTax.totalResidentTax + businessTax.totalBusinessTax + consumptionTax.appliedAmount;
  const totalSocialInsurance = si.totalSocialInsurance;
  const savingsDeduction = input.iDeCoContribution + input.smallBusinessMutualAid;

  const disposableIncome = input.revenue - input.expenses - totalTax - totalSocialInsurance - savingsDeduction;
  const effectiveBurdenRate = input.revenue > 0
    ? (totalTax + totalSocialInsurance) / input.revenue
    : 0;

  return {
    revenue: input.revenue,
    expenses: input.expenses,
    businessIncome,
    blueReturnDeduction,
    totalIncome,
    incomeTax,
    residentTax,
    businessTax,
    consumptionTax,
    socialInsurance: si,
    totalTax,
    totalSocialInsurance,
    savingsDeduction,
    disposableIncome,
    effectiveBurdenRate,
  };
}

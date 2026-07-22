import type {
  TaxParams,
  IncorporationInput,
  IncorporationResult,
  CorporateTaxBracket,
  EmploymentIncomeDeductionBracket,
} from '../data/types';
import { clampMin, roundDownTo, buildPrefResidentTaxParams } from './common';
import { calcIncomeTax } from './incomeTax';
import { calcResidentTax } from './residentTax';
import { calcDeductionsForIncomeTax, calcDeductionsForResidentTax } from './deductions';

function calcGraduatedTax(
  taxableIncome: number,
  brackets: CorporateTaxBracket[],
): number {
  let remaining = taxableIncome;
  let tax = 0;
  let prevLimit = 0;

  for (const b of brackets) {
    const limit = b.upperLimit ?? Infinity;
    const amountInBracket = Math.min(remaining, limit - prevLimit);
    tax += amountInBracket * b.rate;
    remaining -= amountInBracket;
    prevLimit = limit;
    if (remaining <= 0) break;
  }

  return tax;
}

function calcEmploymentIncomeDeduction(
  annualSalary: number,
  brackets: EmploymentIncomeDeductionBracket[],
): number {
  for (const b of brackets) {
    if (b.upperLimit === null || annualSalary <= b.upperLimit) {
      return Math.floor(annualSalary * b.rate + b.base);
    }
  }
  return 0;
}

function calcCorporateSocialInsurance(
  monthlyCompensation: number,
  age: number,
  kyokaiKenpoRate: number,
  params: TaxParams,
): { employerShare: number; employeeShare: number } {
  const csi = params.corporateSocialInsurance;

  const healthBase = Math.min(monthlyCompensation, csi.healthInsurance.maxMonthlyCompensation);
  const healthMonthly = healthBase * kyokaiKenpoRate;

  const nursingMonthly =
    age >= csi.nursingCare.minAge && age <= csi.nursingCare.maxAge
      ? healthBase * csi.nursingCare.rate
      : 0;

  const pensionBase = Math.min(monthlyCompensation, csi.employeesPension.maxMonthlyCompensation);
  const pensionMonthly = pensionBase * csi.employeesPension.rate;

  const totalMonthly = healthMonthly + nursingMonthly + pensionMonthly;
  const halfMonthly = Math.floor(totalMonthly / 2);

  return {
    employerShare: halfMonthly * 12,
    employeeShare: halfMonthly * 12,
  };
}

export function calcIncorporation(
  input: IncorporationInput,
  params: TaxParams,
): IncorporationResult {
  const pref = params.prefectures[input.prefecture];
  const annualCompensation = input.officerCompensation * 12;

  const si = calcCorporateSocialInsurance(input.officerCompensation, input.age, pref.kyokaiKenpoRate, params);

  // --- Corporate side ---
  const rawCorporateIncome = input.businessProfit - annualCompensation - si.employerShare - input.additionalCosts;
  const corporateTaxableIncome = roundDownTo(
    clampMin(rawCorporateIncome, 0),
    params.corporateTax.roundTaxableIncomeDownTo,
  );

  const corporateTax = roundDownTo(
    calcGraduatedTax(corporateTaxableIncome, params.corporateTax.brackets),
    params.corporateTax.roundTaxAmountDownTo,
  );

  const localCorporateTax = roundDownTo(
    corporateTax * params.corporateTax.localCorporateTaxRate,
    params.corporateTax.roundTaxAmountDownTo,
  );

  const residentTaxLevy = roundDownTo(
    corporateTax * pref.corporateResidentTaxLevyRate,
    100,
  );

  const capitalOption =
    params.corporateResidentTax.perCapitaLevy[input.capitalRange] ??
    params.corporateResidentTax.perCapitaLevy[params.corporateResidentTax.defaultCapitalRange];
  const residentPerCapita = capitalOption.amount;

  const enterpriseTax = roundDownTo(
    calcGraduatedTax(corporateTaxableIncome, params.corporateEnterpriseTax.brackets),
    params.corporateEnterpriseTax.roundTaxAmountDownTo,
  );

  const specialEnterpriseTax = roundDownTo(
    enterpriseTax * params.corporateEnterpriseTax.specialTaxRate,
    params.corporateEnterpriseTax.roundTaxAmountDownTo,
  );

  const totalCorporateTax =
    corporateTax + localCorporateTax + residentTaxLevy + residentPerCapita + enterpriseTax + specialEnterpriseTax;
  const totalCorporateCost = totalCorporateTax + si.employerShare + input.additionalCosts;

  // --- Individual side ---
  const employmentIncomeDeduction = calcEmploymentIncomeDeduction(
    annualCompensation,
    params.employmentIncomeDeduction.brackets,
  );
  const employmentIncome = clampMin(annualCompensation - employmentIncomeDeduction, 0);

  const incomeTaxDeductions = calcDeductionsForIncomeTax(
    employmentIncome,
    params.incomeTax,
    si.employeeShare,
    input.iDeCoContribution,
    input.smallBusinessMutualAid,
    input.dependentCount,
    input.spouseDeduction,
    input.lifeInsuranceDeduction,
    input.medicalExpenseDeduction,
  );

  const prefResidentTaxParams = buildPrefResidentTaxParams(params.residentTax, pref);

  const residentTaxDeductions = calcDeductionsForResidentTax(
    prefResidentTaxParams,
    si.employeeShare,
    input.iDeCoContribution,
    input.smallBusinessMutualAid,
    input.dependentCount,
    input.spouseDeduction,
    input.lifeInsuranceDeduction,
    input.medicalExpenseDeduction,
  );

  const incomeTax = calcIncomeTax(
    employmentIncome - incomeTaxDeductions.total,
    params.incomeTax,
    incomeTaxDeductions.basicDeduction,
  );

  const residentTax = calcResidentTax(
    employmentIncome - residentTaxDeductions.total,
    prefResidentTaxParams,
    residentTaxDeductions.basicDeduction,
  );

  const totalIndividualTax = incomeTax.totalIncomeTax + residentTax.totalResidentTax;
  const totalIndividualCost = totalIndividualTax + si.employeeShare;

  const totalBurden = totalCorporateCost + totalIndividualCost;
  const disposableIncome = input.businessProfit - totalBurden;

  return {
    corporateSide: {
      taxableIncome: corporateTaxableIncome,
      corporateTax,
      localCorporateTax,
      residentTaxLevy,
      residentPerCapita,
      enterpriseTax,
      specialEnterpriseTax,
      socialInsurance: si.employerShare,
      additionalCosts: input.additionalCosts,
      totalCorporateTax,
      totalCorporateCost,
    },
    individualSide: {
      annualCompensation,
      employmentIncomeDeduction,
      employmentIncome,
      incomeTax,
      residentTax,
      socialInsurance: si.employeeShare,
      totalIndividualTax,
      totalIndividualCost,
    },
    totalBurden,
    disposableIncome,
  };
}

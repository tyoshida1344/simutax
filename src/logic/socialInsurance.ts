import type {
  SocialInsuranceParams,
  SocialInsuranceResult,
  NationalPensionResult,
  NHIResult,
  NHICategoryParams,
  NHIModelParams,
} from '../data/types';
import { clampMin } from './common';

export function calcNationalPension(
  params: SocialInsuranceParams['nationalPension'],
): NationalPensionResult {
  return {
    monthlyAmount: params.monthlyAmount,
    annualAmount: params.monthlyAmount * params.months,
  };
}

function calcNHICategory(
  basis: number,
  householdMembers: number,
  category: NHICategoryParams,
): number {
  const incomeComponent = Math.floor(basis * category.incomeRate);
  const perCapitaComponent = category.perCapita * householdMembers;
  const perHouseholdComponent = category.perHousehold;
  return Math.min(incomeComponent + perCapitaComponent + perHouseholdComponent, category.cap);
}

export function calcNHI(
  totalIncome: number,
  age: number,
  householdMembers: number,
  model: NHIModelParams,
  baseDeduction: number,
): NHIResult {
  const basis = clampMin(totalIncome - baseDeduction, 0);

  const medical = calcNHICategory(basis, householdMembers, model.medical);
  const elderlySupport = calcNHICategory(basis, householdMembers, model.elderlySupport);

  const nc = model.nursingCare;
  const nursingCare =
    nc.minAge !== undefined && nc.maxAge !== undefined && age >= nc.minAge && age <= nc.maxAge
      ? calcNHICategory(basis, householdMembers, nc)
      : 0;

  return {
    medical,
    elderlySupport,
    nursingCare,
    totalNHI: medical + elderlySupport + nursingCare,
  };
}

export function calcSocialInsurance(
  totalIncome: number,
  age: number,
  householdMembers: number,
  nhiModel: NHIModelParams,
  params: SocialInsuranceParams,
): SocialInsuranceResult {
  const nationalPension = calcNationalPension(params.nationalPension);
  const nhi = calcNHI(totalIncome, age, householdMembers, nhiModel, params.nationalHealthInsurance.baseDeduction);

  return {
    nationalPension,
    nhi,
    totalSocialInsurance: nationalPension.annualAmount + nhi.totalNHI,
  };
}

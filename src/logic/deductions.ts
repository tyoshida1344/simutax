import type {
  FilingType,
  BlueReturnDeductions,
  BasicDeductionBracket,
  IncomeTaxParams,
  ResidentTaxParams,
} from '../data/types';

export function getBlueReturnDeduction(
  filingType: FilingType,
  table: BlueReturnDeductions,
): number {
  return table[filingType];
}

export function getIncomeTaxBasicDeduction(
  totalIncome: number,
  brackets: BasicDeductionBracket[],
): number {
  for (const b of brackets) {
    if (b.totalIncomeUpperLimit === null || totalIncome <= b.totalIncomeUpperLimit) {
      return b.amount;
    }
  }
  return 0;
}

export function getResidentTaxBasicDeduction(params: ResidentTaxParams): number {
  return params.basicDeduction;
}

const DEPENDENT_DEDUCTION_INCOME_TAX = 380000;
const DEPENDENT_DEDUCTION_RESIDENT_TAX = 330000;
const SPOUSE_DEDUCTION_INCOME_TAX = 380000;
const SPOUSE_DEDUCTION_RESIDENT_TAX = 330000;

export interface DeductionBreakdown {
  total: number;
  basicDeduction: number;
  socialInsuranceDeduction: number;
  smallBusinessDeduction: number;
  dependentDeduction: number;
  spouseDeduction: number;
  lifeInsuranceDeduction: number;
  medicalExpenseDeduction: number;
}

export function calcDeductionsForIncomeTax(
  totalIncome: number,
  params: IncomeTaxParams,
  socialInsuranceAmount: number,
  iDeCo: number,
  smallBusinessMutualAid: number,
  dependentCount: number,
  hasSpouse: boolean,
  lifeInsurance: number,
  medicalExpense: number,
): DeductionBreakdown {
  const basicDeduction = getIncomeTaxBasicDeduction(totalIncome, params.basicDeduction);
  const smallBusinessDeduction = iDeCo + smallBusinessMutualAid;
  const dependentDeduction = dependentCount * DEPENDENT_DEDUCTION_INCOME_TAX;
  const spouseDeduction = hasSpouse ? SPOUSE_DEDUCTION_INCOME_TAX : 0;

  const total =
    basicDeduction +
    socialInsuranceAmount +
    smallBusinessDeduction +
    dependentDeduction +
    spouseDeduction +
    lifeInsurance +
    medicalExpense;

  return {
    total,
    basicDeduction,
    socialInsuranceDeduction: socialInsuranceAmount,
    smallBusinessDeduction,
    dependentDeduction,
    spouseDeduction,
    lifeInsuranceDeduction: lifeInsurance,
    medicalExpenseDeduction: medicalExpense,
  };
}

export function calcDeductionsForResidentTax(
  params: ResidentTaxParams,
  socialInsuranceAmount: number,
  iDeCo: number,
  smallBusinessMutualAid: number,
  dependentCount: number,
  hasSpouse: boolean,
  lifeInsurance: number,
  medicalExpense: number,
): DeductionBreakdown {
  const basicDeduction = getResidentTaxBasicDeduction(params);
  const smallBusinessDeduction = iDeCo + smallBusinessMutualAid;
  const dependentDeduction = dependentCount * DEPENDENT_DEDUCTION_RESIDENT_TAX;
  const spouseDeduction = hasSpouse ? SPOUSE_DEDUCTION_RESIDENT_TAX : 0;

  const total =
    basicDeduction +
    socialInsuranceAmount +
    smallBusinessDeduction +
    dependentDeduction +
    spouseDeduction +
    lifeInsurance +
    medicalExpense;

  return {
    total,
    basicDeduction,
    socialInsuranceDeduction: socialInsuranceAmount,
    smallBusinessDeduction,
    dependentDeduction,
    spouseDeduction,
    lifeInsuranceDeduction: lifeInsurance,
    medicalExpenseDeduction: medicalExpense,
  };
}

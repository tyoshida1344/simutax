export interface TaxParamsMeta {
  taxYear: number;
  eraYear: string;
  lastVerified: string;
  sources: string[];
}

export interface TaxBracket {
  upperLimit: number | null;
  rate: number;
  deduction: number;
}

export interface BasicDeductionBracket {
  totalIncomeUpperLimit: number | null;
  amount: number;
}

export interface IncomeTaxParams {
  brackets: TaxBracket[];
  reconstructionSurtaxRate: number;
  basicDeduction: BasicDeductionBracket[];
  roundTaxableIncomeDownTo: number;
  roundTaxAmountDownTo: number;
}

export interface ResidentTaxParams {
  incomeRate: number;
  perCapitaLevy: number;
  basicDeduction: number;
  roundTaxableIncomeDownTo: number;
  roundTaxAmountDownTo: number;
}

export interface BusinessTaxType {
  label: string;
  rate: number;
}

export interface BusinessTaxParams {
  businessOwnerDeduction: number;
  types: Record<string, BusinessTaxType>;
  defaultType: string;
}

export interface BlueReturnDeductions {
  blue65: number;
  blue55: number;
  blue10: number;
  white: number;
}

export interface NHICategoryParams {
  incomeRate: number;
  perCapita: number;
  perHousehold: number;
  cap: number;
  minAge?: number;
  maxAge?: number;
}

export interface NHIModelParams {
  label: string;
  medical: NHICategoryParams;
  elderlySupport: NHICategoryParams;
  nursingCare: NHICategoryParams;
}

export interface NationalPensionParams {
  monthlyAmount: number;
  months: number;
}

export interface SocialInsuranceParams {
  nationalPension: NationalPensionParams;
  nationalHealthInsurance: {
    models: Record<string, NHIModelParams>;
    baseDeduction: number;
  };
}

export interface SimplifiedCategory {
  label: string;
  deemedPurchaseRate: number;
}

export interface ConsumptionTaxParams {
  taxRate: number;
  taxRateFraction: [number, number];
  taxableThreshold: number;
  simplifiedThreshold: number;
  simplifiedCategories: Record<string, SimplifiedCategory>;
  defaultSimplifiedCategory: string;
  twentyPercentSpecialRate: number;
  twentyPercentSpecialEligibleYears: number[];
  sources: string[];
}

export interface TaxParams {
  meta: TaxParamsMeta;
  incomeTax: IncomeTaxParams;
  residentTax: ResidentTaxParams;
  businessTax: BusinessTaxParams;
  blueReturnDeductions: BlueReturnDeductions;
  consumptionTax: ConsumptionTaxParams;
  socialInsurance: SocialInsuranceParams;
}

export type FilingType = 'blue65' | 'blue55' | 'blue10' | 'white';

export type ConsumptionTaxMethod = 'standard' | 'simplified' | 'special20';

export interface SimulatorInput {
  revenue: number;
  expenses: number;
  filingType: FilingType;
  businessType: string;
  iDeCoContribution: number;
  smallBusinessMutualAid: number;
  dependentCount: number;
  spouseDeduction: boolean;
  lifeInsuranceDeduction: number;
  medicalExpenseDeduction: number;
  manualSocialInsurance: number | null;
  age: number;
  householdMembers: number;
  nhiModel: string;
  basePeriodSales: 'under10m' | 'over10m' | 'over50m';
  invoiceRegistered: boolean;
  taxablePurchaseAmount: number;
  selectedConsumptionTaxMethod: ConsumptionTaxMethod | null;
}

export interface IncomeTaxResult {
  taxableIncome: number;
  incomeTaxBeforeSurtax: number;
  reconstructionSurtax: number;
  totalIncomeTax: number;
  basicDeduction: number;
  appliedBracketRate: number;
}

export interface ResidentTaxResult {
  taxableIncome: number;
  incomeLevy: number;
  perCapitaLevy: number;
  totalResidentTax: number;
  basicDeduction: number;
}

export interface BusinessTaxResult {
  taxableIncome: number;
  businessOwnerDeduction: number;
  taxBase: number;
  rate: number;
  totalBusinessTax: number;
}

export interface NationalPensionResult {
  monthlyAmount: number;
  annualAmount: number;
}

export interface NHIResult {
  medical: number;
  elderlySupport: number;
  nursingCare: number;
  totalNHI: number;
}

export interface SocialInsuranceResult {
  nationalPension: NationalPensionResult;
  nhi: NHIResult;
  totalSocialInsurance: number;
}

export interface ConsumptionTaxMethodResult {
  amount: number;
  applicable: boolean;
  reason: string | null;
}

export interface ConsumptionTaxResult {
  isTaxable: boolean;
  taxableReason: string | null;
  salesTax: number;
  purchaseTax: number;
  standardMethod: ConsumptionTaxMethodResult;
  simplifiedMethod: ConsumptionTaxMethodResult;
  special20Method: ConsumptionTaxMethodResult;
  recommendedMethod: ConsumptionTaxMethod | null;
  appliedMethod: ConsumptionTaxMethod | null;
  appliedAmount: number;
}

export interface SimulatorResult {
  revenue: number;
  expenses: number;
  businessIncome: number;
  blueReturnDeduction: number;
  totalIncome: number;
  incomeTax: IncomeTaxResult;
  residentTax: ResidentTaxResult;
  businessTax: BusinessTaxResult;
  consumptionTax: ConsumptionTaxResult;
  socialInsurance: SocialInsuranceResult;
  totalTax: number;
  totalSocialInsurance: number;
  savingsDeduction: number;
  disposableIncome: number;
  effectiveBurdenRate: number;
}

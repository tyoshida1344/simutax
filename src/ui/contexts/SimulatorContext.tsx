import { createContext, useContext } from 'react';
import type { SimulatorInput, SimulatorResult } from '../../data/types';
import { simulate } from '../../logic';
import { taxParams } from '../../data/taxParams';

export const sampleInput: SimulatorInput = {
  revenue: 6_000_000,
  expenses: 1_000_000,
  filingType: 'blue65',
  businessType: 'type1',
  iDeCoContribution: 0,
  smallBusinessMutualAid: 0,
  dependentCount: 0,
  spouseDeduction: false,
  lifeInsuranceDeduction: 0,
  medicalExpenseDeduction: 0,
  manualSocialInsurance: null,
  age: 35,
  householdMembers: 1,
  nhiModel: 'standard',
  basePeriodSales: 'under10m',
  invoiceRegistered: false,
  taxablePurchaseAmount: 0,
  selectedConsumptionTaxMethod: null,
  isIncorporation: false,
  officerCompensation: 300_000,
  incorporationAdditionalCosts: 0,
  capitalRange: 'under10m',
};

const sampleResult = simulate(sampleInput, taxParams);

interface SimulatorContextValue {
  input: SimulatorInput;
  result: SimulatorResult;
}

const SimulatorContext = createContext<SimulatorContextValue | null>(null);

export const SimulatorProvider = SimulatorContext.Provider;

export function useSimulatorContext() {
  const ctx = useContext(SimulatorContext);
  const isSample = !ctx;
  const value = ctx ?? { input: sampleInput, result: sampleResult };
  return { ...value, isSample };
}

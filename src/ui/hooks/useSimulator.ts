import { useState, useMemo } from 'react';
import type { SimulatorInput, SimulatorResult, IncorporationResult } from '../../data/types';
import { simulate, calcIncorporation } from '../../logic';
import { taxParams } from '../../data/taxParams';

const params = taxParams;

const defaultInput: SimulatorInput = {
  revenue: 4000000,
  expenses: 500000,
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
  prefecture: 'tokyo',
  basePeriodSales: 'under10m',
  invoiceRegistered: false,
  taxablePurchaseAmount: 0,
  selectedConsumptionTaxMethod: null,
  isIncorporation: false,
  officerCompensation: 300000,
  incorporationAdditionalCosts: 0,
  capitalRange: 'under10m',
};

export function useSimulator() {
  const [input, setInput] = useState<SimulatorInput>(defaultInput);

  const result: SimulatorResult = useMemo(() => simulate(input, params), [input]);

  const incorporationResult: IncorporationResult | null = useMemo(() => {
    if (!input.isIncorporation) return null;
    return calcIncorporation(
      {
        businessProfit: result.businessIncome,
        officerCompensation: input.officerCompensation,
        additionalCosts: input.incorporationAdditionalCosts,
        capitalRange: input.capitalRange,
        age: input.age,
        prefecture: input.prefecture,
        iDeCoContribution: input.iDeCoContribution,
        smallBusinessMutualAid: input.smallBusinessMutualAid,
        dependentCount: input.dependentCount,
        spouseDeduction: input.spouseDeduction,
        lifeInsuranceDeduction: input.lifeInsuranceDeduction,
        medicalExpenseDeduction: input.medicalExpenseDeduction,
      },
      params,
    );
  }, [input, result.businessIncome, params]);

  const updateField = <K extends keyof SimulatorInput>(field: K, value: SimulatorInput[K]) => {
    setInput((prev) => ({ ...prev, [field]: value }));
  };

  return { input, result, updateField, incorporationResult };
}

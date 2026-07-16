import { useState, useMemo } from 'react';
import type { SimulatorInput, SimulatorResult } from '../../data/types';
import { simulate } from '../../logic';
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
  nhiModel: 'standard',
  basePeriodSales: 'under10m',
  invoiceRegistered: false,
  taxablePurchaseAmount: 0,
  selectedConsumptionTaxMethod: null,
};

export function useSimulator() {
  const [input, setInput] = useState<SimulatorInput>(defaultInput);

  const result: SimulatorResult = useMemo(() => simulate(input, params), [input]);

  const updateField = <K extends keyof SimulatorInput>(field: K, value: SimulatorInput[K]) => {
    setInput((prev) => ({ ...prev, [field]: value }));
  };

  return { input, result, updateField, params };
}

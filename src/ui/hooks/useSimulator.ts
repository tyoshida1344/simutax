import { useState, useMemo } from 'react';
import type { SimulatorInput, SimulatorResult, TaxParams } from '../../data/types';
import { simulate } from '../../logic';
import taxParams from '../../data/taxParams.2026.json';

const params = taxParams as unknown as TaxParams;

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
};

export function useSimulator() {
  const [input, setInput] = useState<SimulatorInput>(defaultInput);

  const result: SimulatorResult = useMemo(() => simulate(input, params), [input]);

  const updateField = <K extends keyof SimulatorInput>(field: K, value: SimulatorInput[K]) => {
    setInput((prev) => ({ ...prev, [field]: value }));
  };

  return { input, result, updateField, params };
}

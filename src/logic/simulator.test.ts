import { describe, it, expect } from 'vitest';
import { simulate } from './index';
import taxParams from '../data/taxParams.2026.json';
import type { TaxParams, SimulatorInput } from '../data/types';

const params = taxParams as unknown as TaxParams;

function makeInput(overrides: Partial<SimulatorInput> = {}): SimulatorInput {
  return {
    revenue: 0,
    expenses: 0,
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
    basePeriodSales: 0,
    invoiceRegistered: false,
    taxablePurchaseRatio: 0,
    simplifiedTaxCategory: 'cat5',
    selectedConsumptionTaxMethod: null,
    ...overrides,
  };
}

describe('simulate 統合テスト', () => {
  it('売上0 → 全て0', () => {
    const r = simulate(makeInput(), params);
    expect(r.businessIncome).toBe(0);
    expect(r.totalTax).toBe(0);
    expect(r.disposableIncome).toBeLessThanOrEqual(0);
    expect(r.effectiveBurdenRate).toBe(0);
  });

  it('売上=経費 → 事業所得0', () => {
    const r = simulate(makeInput({ revenue: 5000000, expenses: 5000000 }), params);
    expect(r.businessIncome).toBe(0);
    expect(r.totalIncome).toBe(0);
    expect(r.incomeTax.totalIncomeTax).toBe(0);
    expect(r.residentTax.incomeLevy).toBe(0);
    expect(r.businessTax.totalBusinessTax).toBe(0);
  });

  it('自由に使えるお金 = 売上 - 経費 - 税金 - 社保 - 積立', () => {
    const input = makeInput({
      revenue: 8000000,
      expenses: 2000000,
      iDeCoContribution: 23000 * 12,
      smallBusinessMutualAid: 70000 * 12,
    });
    const r = simulate(input, params);
    const expected = input.revenue - input.expenses - r.totalTax - r.totalSocialInsurance - r.savingsDeduction;
    expect(r.disposableIncome).toBe(expected);
  });

  it('実効負担率 = (税+社保) / 売上', () => {
    const input = makeInput({ revenue: 8000000, expenses: 2000000 });
    const r = simulate(input, params);
    const expected = (r.totalTax + r.totalSocialInsurance) / input.revenue;
    expect(r.effectiveBurdenRate).toBe(expected);
    expect(r.effectiveBurdenRate).toBeGreaterThan(0);
    expect(r.effectiveBurdenRate).toBeLessThan(1);
  });

  it('事業税は青色控除を戻して計算する', () => {
    const input = makeInput({ revenue: 6000000, expenses: 1000000 });
    const r = simulate(input, params);
    // businessIncome = 5,000,000 (控除前)
    // 事業税の課税所得は5,000,000であるべき（650,000の青色控除は引かない）
    expect(r.businessTax.taxableIncome).toBe(5000000);
    expect(r.businessTax.taxBase).toBe(5000000 - 2900000);
  });

  it('所得税と住民税で基礎控除が異なる', () => {
    const input = makeInput({ revenue: 5000000, expenses: 1000000 });
    const r = simulate(input, params);
    // totalIncome = 4,000,000 - 650,000 = 3,350,000
    expect(r.incomeTax.basicDeduction).toBe(1040000); // 489万以下
    expect(r.residentTax.basicDeduction).toBe(430000); // 固定
  });

  it('白色申告 vs 青色65万で税額が異なる', () => {
    const base = { revenue: 8000000, expenses: 2000000 };
    const rWhite = simulate(makeInput({ ...base, filingType: 'white' }), params);
    const rBlue65 = simulate(makeInput({ ...base, filingType: 'blue65' }), params);
    expect(rBlue65.totalTax).toBeLessThan(rWhite.totalTax);
    expect(rBlue65.disposableIncome).toBeGreaterThan(rWhite.disposableIncome);
  });

  it('社会保険料の手入力上書き', () => {
    const input = makeInput({
      revenue: 8000000,
      expenses: 2000000,
      manualSocialInsurance: 1000000,
    });
    const r = simulate(input, params);
    // 社保控除は手入力の100万を使用（ただし実際の社保負担額はauto計算のまま）
    // 所得控除に100万が反映されるため、税額に影響する
    expect(r.totalSocialInsurance).not.toBe(1000000); // 実負担額は自動計算
  });

  it('手計算シナリオ: 売上800万/経費200万/青色65万/35歳', () => {
    const input = makeInput({ revenue: 8000000, expenses: 2000000 });
    const r = simulate(input, params);

    // 事業所得 = 800万 - 200万 = 600万
    expect(r.businessIncome).toBe(6000000);

    // 合計所得 = 600万 - 65万(青色控除) = 535万
    expect(r.blueReturnDeduction).toBe(650000);
    expect(r.totalIncome).toBe(5350000);

    // 社会保険が計算されている
    expect(r.socialInsurance.nationalPension.annualAmount).toBe(17510 * 12);
    expect(r.socialInsurance.nhi.totalNHI).toBeGreaterThan(0);

    // 各税が正の値
    expect(r.incomeTax.totalIncomeTax).toBeGreaterThan(0);
    expect(r.residentTax.totalResidentTax).toBeGreaterThan(0);
    expect(r.businessTax.totalBusinessTax).toBeGreaterThan(0);

    // 手取りは正で売上未満
    expect(r.disposableIncome).toBeGreaterThan(0);
    expect(r.disposableIncome).toBeLessThan(input.revenue);
  });

  it('高所得シナリオ: 売上2000万', () => {
    const input = makeInput({ revenue: 20000000, expenses: 5000000 });
    const r = simulate(input, params);

    expect(r.businessIncome).toBe(15000000);
    expect(r.totalIncome).toBe(14350000);
    expect(r.incomeTax.appliedBracketRate).toBeGreaterThanOrEqual(0.33);
    expect(r.disposableIncome).toBeGreaterThan(0);
  });
});

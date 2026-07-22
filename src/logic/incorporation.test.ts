import { describe, it, expect } from 'vitest';
import { calcIncorporation } from './incorporation';
import { taxParams } from '../data/taxParams';
import type { IncorporationInput } from '../data/types';

const params = taxParams;
const tokyoKenpoRate = params.prefectures['tokyo'].kyokaiKenpoRate;

function makeInput(overrides: Partial<IncorporationInput> = {}): IncorporationInput {
  return {
    businessProfit: 5000000,
    officerCompensation: 300000,
    additionalCosts: 0,
    capitalRange: 'under10m',
    age: 35,
    prefecture: 'tokyo',
    iDeCoContribution: 0,
    smallBusinessMutualAid: 0,
    dependentCount: 0,
    spouseDeduction: false,
    lifeInsuranceDeduction: 0,
    medicalExpenseDeduction: 0,
    ...overrides,
  };
}

describe('calcIncorporation', () => {
  it('役員報酬0 → 全額が法人課税所得', () => {
    const r = calcIncorporation(makeInput({ officerCompensation: 0 }), params);
    expect(r.corporateSide.taxableIncome).toBe(5000000);
    expect(r.individualSide.annualCompensation).toBe(0);
    expect(r.individualSide.incomeTax.totalIncomeTax).toBe(0);
    expect(r.individualSide.residentTax.totalResidentTax).toBe(0);
    expect(r.individualSide.socialInsurance).toBe(0);
  });

  it('事業利益0 → 法人課税所得0・法人税0', () => {
    const r = calcIncorporation(makeInput({ businessProfit: 0, officerCompensation: 0 }), params);
    expect(r.corporateSide.taxableIncome).toBe(0);
    expect(r.corporateSide.corporateTax).toBe(0);
    expect(r.corporateSide.localCorporateTax).toBe(0);
    expect(r.corporateSide.enterpriseTax).toBe(0);
    expect(r.corporateSide.residentPerCapita).toBe(70000);
  });

  it('法人税: 800万以下は15%', () => {
    const r = calcIncorporation(makeInput({
      businessProfit: 8000000,
      officerCompensation: 0,
    }), params);
    expect(r.corporateSide.corporateTax).toBe(1200000);
  });

  it('法人税: 800万超は段階税率', () => {
    const r = calcIncorporation(makeInput({
      businessProfit: 10000000,
      officerCompensation: 0,
    }), params);
    const expected = 8000000 * 0.15 + 2000000 * 0.232;
    expect(r.corporateSide.corporateTax).toBe(Math.floor(expected / 100) * 100);
  });

  it('地方法人税 = 法人税 × 10.3%', () => {
    const r = calcIncorporation(makeInput({
      businessProfit: 8000000,
      officerCompensation: 0,
    }), params);
    const expected = Math.floor(Math.floor(r.corporateSide.corporateTax * 0.103) / 100) * 100;
    expect(r.corporateSide.localCorporateTax).toBe(expected);
  });

  it('法人住民税法人税割 = 法人税 × 都道府県別税率', () => {
    const r = calcIncorporation(makeInput({
      businessProfit: 8000000,
      officerCompensation: 0,
    }), params);
    const prefRate = params.prefectures['tokyo'].corporateResidentTaxLevyRate;
    const expected = Math.floor(Math.floor(r.corporateSide.corporateTax * prefRate) / 100) * 100;
    expect(r.corporateSide.residentTaxLevy).toBe(expected);
  });

  it('均等割は資本金区分で決まる', () => {
    const r1 = calcIncorporation(makeInput({ capitalRange: 'under10m' }), params);
    expect(r1.corporateSide.residentPerCapita).toBe(70000);

    const r2 = calcIncorporation(makeInput({ capitalRange: 'under100m' }), params);
    expect(r2.corporateSide.residentPerCapita).toBe(180000);

    const r3 = calcIncorporation(makeInput({ capitalRange: 'under1b' }), params);
    expect(r3.corporateSide.residentPerCapita).toBe(290000);
  });

  it('不明な資本金区分はデフォルトにフォールバック', () => {
    const r = calcIncorporation(makeInput({ capitalRange: 'unknown' }), params);
    expect(r.corporateSide.residentPerCapita).toBe(70000);
  });

  it('法人事業税: 段階税率', () => {
    const r = calcIncorporation(makeInput({
      businessProfit: 10000000,
      officerCompensation: 0,
    }), params);
    const expected = 4000000 * 0.035 + 4000000 * 0.053 + 2000000 * 0.070;
    expect(r.corporateSide.enterpriseTax).toBe(Math.floor(expected / 100) * 100);
  });

  it('特別法人事業税 = 法人事業税 × 37%', () => {
    const r = calcIncorporation(makeInput({
      businessProfit: 10000000,
      officerCompensation: 0,
    }), params);
    const expected = Math.floor(Math.floor(r.corporateSide.enterpriseTax * 0.37) / 100) * 100;
    expect(r.corporateSide.specialEnterpriseTax).toBe(expected);
  });

  it('給与所得控除: 最低65万円', () => {
    const r = calcIncorporation(makeInput({ officerCompensation: 100000 }), params);
    expect(r.individualSide.employmentIncomeDeduction).toBe(650000);
    expect(r.individualSide.employmentIncome).toBe(
      Math.max(100000 * 12 - 650000, 0),
    );
  });

  it('給与所得控除: 収入850万超は195万上限', () => {
    const r = calcIncorporation(makeInput({
      businessProfit: 20000000,
      officerCompensation: 1000000,
    }), params);
    expect(r.individualSide.employmentIncomeDeduction).toBe(1950000);
  });

  it('社保: 35歳なら介護保険なし', () => {
    const r = calcIncorporation(makeInput({ officerCompensation: 300000, age: 35 }), params);
    const healthMonthly = 300000 * tokyoKenpoRate;
    const pensionMonthly = 300000 * 0.18300;
    const halfMonthly = Math.floor((healthMonthly + pensionMonthly) / 2);
    expect(r.corporateSide.socialInsurance).toBe(halfMonthly * 12);
    expect(r.individualSide.socialInsurance).toBe(halfMonthly * 12);
  });

  it('社保: 45歳なら介護保険あり', () => {
    const r = calcIncorporation(makeInput({ officerCompensation: 300000, age: 45 }), params);
    const healthMonthly = 300000 * tokyoKenpoRate;
    const nursingMonthly = 300000 * 0.0160;
    const pensionMonthly = 300000 * 0.18300;
    const halfMonthly = Math.floor((healthMonthly + nursingMonthly + pensionMonthly) / 2);
    expect(r.corporateSide.socialInsurance).toBe(halfMonthly * 12);
  });

  it('厚生年金: 月額65万超で上限適用', () => {
    const r = calcIncorporation(makeInput({ officerCompensation: 1000000, age: 35 }), params);
    const healthMonthly = 1000000 * tokyoKenpoRate;
    const pensionMonthly = 650000 * 0.18300;
    const halfMonthly = Math.floor((healthMonthly + pensionMonthly) / 2);
    expect(r.corporateSide.socialInsurance).toBe(halfMonthly * 12);
  });

  it('健保: 月額139万超で上限適用', () => {
    const r = calcIncorporation(makeInput({
      businessProfit: 20000000,
      officerCompensation: 1500000,
      age: 35,
    }), params);
    const healthMonthly = 1390000 * tokyoKenpoRate;
    const pensionMonthly = 650000 * 0.18300;
    const halfMonthly = Math.floor((healthMonthly + pensionMonthly) / 2);
    expect(r.corporateSide.socialInsurance).toBe(halfMonthly * 12);
  });

  it('追加コストは法人側コストに加算', () => {
    const r1 = calcIncorporation(makeInput({ additionalCosts: 0 }), params);
    const r2 = calcIncorporation(makeInput({ additionalCosts: 500000 }), params);
    expect(r2.corporateSide.additionalCosts).toBe(500000);
    expect(r2.corporateSide.totalCorporateCost).toBeGreaterThan(
      r1.corporateSide.totalCorporateCost - 500000,
    );
  });

  it('役員報酬が事業利益を超える → 法人課税所得0', () => {
    const r = calcIncorporation(makeInput({
      businessProfit: 3000000,
      officerCompensation: 300000,
    }), params);
    expect(r.corporateSide.taxableIncome).toBe(0);
    expect(r.corporateSide.corporateTax).toBe(0);
  });

  it('手取り = 事業利益 - 総負担', () => {
    const r = calcIncorporation(makeInput(), params);
    expect(r.disposableIncome).toBe(r.corporateSide.taxableIncome > 0
      ? makeInput().businessProfit - r.totalBurden
      : makeInput().businessProfit - r.totalBurden);
    expect(r.disposableIncome).toBe(5000000 - r.totalBurden);
  });

  it('総負担 = 法人側コスト + 個人側コスト', () => {
    const r = calcIncorporation(makeInput(), params);
    expect(r.totalBurden).toBe(
      r.corporateSide.totalCorporateCost + r.individualSide.totalIndividualCost,
    );
  });

  it('手計算シナリオ: 事業利益800万・役員報酬40万/月', () => {
    const input = makeInput({
      businessProfit: 8000000,
      officerCompensation: 400000,
      age: 35,
    });
    const r = calcIncorporation(input, params);

    const annualComp = 400000 * 12;
    expect(r.individualSide.annualCompensation).toBe(annualComp);

    const healthMonthly = 400000 * tokyoKenpoRate;
    const pensionMonthly = 400000 * 0.18300;
    const halfMonthly = Math.floor((healthMonthly + pensionMonthly) / 2);
    const annualSI = halfMonthly * 12;

    const corpIncome = 8000000 - annualComp - annualSI;
    expect(corpIncome).toBeGreaterThan(0);
    expect(r.corporateSide.taxableIncome).toBe(
      Math.floor(corpIncome / 1000) * 1000,
    );

    expect(r.totalBurden).toBeLessThan(8000000);
    expect(r.disposableIncome).toBeGreaterThan(0);
  });

  it('都道府県による協会けんぽ料率の違い', () => {
    const rTokyo = calcIncorporation(makeInput({ prefecture: 'tokyo' }), params);
    const rSaga = calcIncorporation(makeInput({ prefecture: 'saga' }), params);
    // 佐賀は協会けんぽ料率が最も高い
    expect(rSaga.corporateSide.socialInsurance).toBeGreaterThan(rTokyo.corporateSide.socialInsurance);
  });
});

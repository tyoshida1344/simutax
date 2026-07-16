import { describe, it, expect } from 'vitest';
import { calcNationalPension, calcNHI, calcSocialInsurance } from './socialInsurance';
import { taxParams } from '../data/taxParams';

const params = taxParams.socialInsurance;

describe('calcNationalPension', () => {
  it('月額×12ヶ月', () => {
    const r = calcNationalPension(params.nationalPension);
    expect(r.monthlyAmount).toBe(17510);
    expect(r.annualAmount).toBe(17510 * 12);
  });
});

describe('calcNHI', () => {
  const nhiParams = params.nationalHealthInsurance;

  it('所得が基礎控除以下 → 均等割+平等割のみ', () => {
    const r = calcNHI(430000, 35, 1, 'standard', nhiParams);
    // basis = 0 → 所得割なし
    const model = nhiParams.models['standard'];
    const medical = model.medical.perCapita * 1 + model.medical.perHousehold;
    const elderly = model.elderlySupport.perCapita * 1 + model.elderlySupport.perHousehold;
    expect(r.medical).toBe(medical);
    expect(r.elderlySupport).toBe(elderly);
    expect(r.nursingCare).toBe(0); // 35歳は介護分なし
  });

  it('40歳以上65歳未満 → 介護分あり', () => {
    const r = calcNHI(5000000, 45, 1, 'standard', nhiParams);
    expect(r.nursingCare).toBeGreaterThan(0);
  });

  it('39歳 → 介護分なし', () => {
    const r = calcNHI(5000000, 39, 1, 'standard', nhiParams);
    expect(r.nursingCare).toBe(0);
  });

  it('65歳 → 介護分なし', () => {
    const r = calcNHI(5000000, 65, 1, 'standard', nhiParams);
    expect(r.nursingCare).toBe(0);
  });

  it('世帯人数が増えると均等割が増える', () => {
    const r1 = calcNHI(5000000, 35, 1, 'standard', nhiParams);
    const r2 = calcNHI(5000000, 35, 3, 'standard', nhiParams);
    expect(r2.medical).toBeGreaterThan(r1.medical);
  });

  it('賦課限度額でキャップされる', () => {
    const r = calcNHI(50000000, 35, 1, 'standard', nhiParams);
    expect(r.medical).toBeLessThanOrEqual(650000);
    expect(r.elderlySupport).toBeLessThanOrEqual(240000);
  });

  it('高所得+40歳以上で介護分もキャップ', () => {
    const r = calcNHI(50000000, 45, 1, 'standard', nhiParams);
    expect(r.nursingCare).toBeLessThanOrEqual(170000);
  });

  it('手計算: 所得500万、35歳、1人世帯', () => {
    const model = nhiParams.models['standard'];
    const basis = 5000000 - 430000; // 4,570,000

    const medicalExpected = Math.min(
      Math.floor(basis * model.medical.incomeRate) + model.medical.perCapita + model.medical.perHousehold,
      model.medical.cap,
    );
    const elderlyExpected = Math.min(
      Math.floor(basis * model.elderlySupport.incomeRate) + model.elderlySupport.perCapita + model.elderlySupport.perHousehold,
      model.elderlySupport.cap,
    );

    const r = calcNHI(5000000, 35, 1, 'standard', nhiParams);
    expect(r.medical).toBe(medicalExpected);
    expect(r.elderlySupport).toBe(elderlyExpected);
    expect(r.nursingCare).toBe(0);
    expect(r.totalNHI).toBe(medicalExpected + elderlyExpected);
  });
});

describe('calcSocialInsurance', () => {
  it('年金+国保の合計', () => {
    const r = calcSocialInsurance(5000000, 35, 1, 'standard', params);
    expect(r.totalSocialInsurance).toBe(r.nationalPension.annualAmount + r.nhi.totalNHI);
  });
});

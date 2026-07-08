import { describe, it, expect } from 'vitest';
import {
  getBlueReturnDeduction,
  getIncomeTaxBasicDeduction,
  getResidentTaxBasicDeduction,
  calcDeductionsForIncomeTax,
  calcDeductionsForResidentTax,
} from './deductions';
import taxParams from '../data/taxParams.2026.json';
import type { TaxParams } from '../data/types';

const params = taxParams as unknown as TaxParams;

describe('getBlueReturnDeduction', () => {
  it('青色65万', () => {
    expect(getBlueReturnDeduction('blue65', params.blueReturnDeductions)).toBe(650000);
  });
  it('青色55万', () => {
    expect(getBlueReturnDeduction('blue55', params.blueReturnDeductions)).toBe(550000);
  });
  it('青色10万', () => {
    expect(getBlueReturnDeduction('blue10', params.blueReturnDeductions)).toBe(100000);
  });
  it('白色は0', () => {
    expect(getBlueReturnDeduction('white', params.blueReturnDeductions)).toBe(0);
  });
});

describe('getIncomeTaxBasicDeduction (令和8年二層構造)', () => {
  const brackets = params.incomeTax.basicDeduction;

  it('合計所得489万以下 → 104万', () => {
    expect(getIncomeTaxBasicDeduction(4890000, brackets)).toBe(1040000);
    expect(getIncomeTaxBasicDeduction(3000000, brackets)).toBe(1040000);
    expect(getIncomeTaxBasicDeduction(0, brackets)).toBe(1040000);
  });

  it('489万超〜655万以下 → 67万', () => {
    expect(getIncomeTaxBasicDeduction(4890001, brackets)).toBe(670000);
    expect(getIncomeTaxBasicDeduction(6550000, brackets)).toBe(670000);
  });

  it('655万超〜2350万以下 → 62万', () => {
    expect(getIncomeTaxBasicDeduction(6550001, brackets)).toBe(620000);
    expect(getIncomeTaxBasicDeduction(23500000, brackets)).toBe(620000);
  });

  it('2350万超〜2400万以下 → 48万', () => {
    expect(getIncomeTaxBasicDeduction(23500001, brackets)).toBe(480000);
    expect(getIncomeTaxBasicDeduction(24000000, brackets)).toBe(480000);
  });

  it('2400万超〜2450万以下 → 32万', () => {
    expect(getIncomeTaxBasicDeduction(24000001, brackets)).toBe(320000);
  });

  it('2450万超〜2500万以下 → 16万', () => {
    expect(getIncomeTaxBasicDeduction(24500001, brackets)).toBe(160000);
  });

  it('2500万超 → 0', () => {
    expect(getIncomeTaxBasicDeduction(25000001, brackets)).toBe(0);
  });
});

describe('getResidentTaxBasicDeduction', () => {
  it('常に43万円', () => {
    expect(getResidentTaxBasicDeduction(params.residentTax)).toBe(430000);
  });
});

describe('所得税と住民税の基礎控除の非対称性', () => {
  it('同じ所得300万でも基礎控除が異なる', () => {
    const incomeTaxBasic = getIncomeTaxBasicDeduction(3000000, params.incomeTax.basicDeduction);
    const residentTaxBasic = getResidentTaxBasicDeduction(params.residentTax);
    expect(incomeTaxBasic).toBe(1040000);
    expect(residentTaxBasic).toBe(430000);
    expect(incomeTaxBasic).not.toBe(residentTaxBasic);
  });
});

describe('calcDeductionsForIncomeTax', () => {
  it('全控除を合算する', () => {
    const result = calcDeductionsForIncomeTax(
      3000000,
      params.incomeTax,
      500000, // 社会保険料
      23000 * 12, // iDeCo
      70000 * 12, // 小規模企業共済
      1, // 扶養1人
      true, // 配偶者控除
      50000, // 生命保険料
      100000, // 医療費
    );
    expect(result.basicDeduction).toBe(1040000);
    expect(result.smallBusinessDeduction).toBe(23000 * 12 + 70000 * 12);
    expect(result.dependentDeduction).toBe(380000);
    expect(result.spouseDeduction).toBe(380000);
    expect(result.total).toBe(
      1040000 + 500000 + (23000 + 70000) * 12 + 380000 + 380000 + 50000 + 100000,
    );
  });
});

describe('calcDeductionsForResidentTax', () => {
  it('住民税ベースの控除額で合算する', () => {
    const result = calcDeductionsForResidentTax(
      params.residentTax,
      500000,
      0,
      0,
      1,
      true,
      0,
      0,
    );
    expect(result.basicDeduction).toBe(430000);
    expect(result.dependentDeduction).toBe(330000);
    expect(result.spouseDeduction).toBe(330000);
    expect(result.total).toBe(430000 + 500000 + 330000 + 330000);
  });
});

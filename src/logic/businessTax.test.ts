import { describe, it, expect } from 'vitest';
import { calcBusinessTax } from './businessTax';
import { taxParams } from '../data/taxParams';

const params = taxParams.businessTax;

describe('calcBusinessTax', () => {
  it('事業所得290万以下 → 税額0', () => {
    const r = calcBusinessTax(2900000, 'type1', params);
    expect(r.taxBase).toBe(0);
    expect(r.totalBusinessTax).toBe(0);
  });

  it('事業所得200万 → 税額0', () => {
    const r = calcBusinessTax(2000000, 'type1', params);
    expect(r.totalBusinessTax).toBe(0);
  });

  it('事業所得500万 第1種(5%) → (500万-290万)*5% = 10.5万', () => {
    const r = calcBusinessTax(5000000, 'type1', params);
    expect(r.taxBase).toBe(2100000);
    expect(r.rate).toBe(0.05);
    expect(r.totalBusinessTax).toBe(105000);
  });

  it('第2種(4%)', () => {
    const r = calcBusinessTax(5000000, 'type2', params);
    expect(r.rate).toBe(0.04);
    expect(r.totalBusinessTax).toBe(Math.floor(2100000 * 0.04));
  });

  it('第3種(3%)', () => {
    const r = calcBusinessTax(5000000, 'type3_3pct', params);
    expect(r.rate).toBe(0.03);
    expect(r.totalBusinessTax).toBe(Math.floor(2100000 * 0.03));
  });

  it('非課税業種 → 税額0', () => {
    const r = calcBusinessTax(10000000, 'exempt', params);
    expect(r.rate).toBe(0);
    expect(r.totalBusinessTax).toBe(0);
  });

  it('不明な業種はデフォルト(type1)にフォールバック', () => {
    const r = calcBusinessTax(5000000, 'unknown', params);
    expect(r.rate).toBe(0.05);
  });

  it('青色申告控除は適用しない（入力は控除前の事業所得）', () => {
    // 仕様: 事業税は青色特別控除を「戻す」
    // エンジンには控除前の事業所得（売上-経費）を渡す
    const businessIncome = 6000000; // 売上 - 経費
    const r = calcBusinessTax(businessIncome, 'type1', params);
    expect(r.taxableIncome).toBe(businessIncome);
    expect(r.taxBase).toBe(businessIncome - 2900000);
  });
});

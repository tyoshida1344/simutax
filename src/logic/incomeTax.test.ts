import { describe, it, expect } from 'vitest';
import { calcIncomeTax } from './incomeTax';
import { taxParams } from '../data/taxParams';

const params = taxParams.incomeTax;

describe('calcIncomeTax', () => {
  it('所得0 → 税額0', () => {
    const r = calcIncomeTax(0, params);
    expect(r.taxableIncome).toBe(0);
    expect(r.totalIncomeTax).toBe(0);
  });

  it('負の所得 → 税額0', () => {
    const r = calcIncomeTax(-500000, params);
    expect(r.taxableIncome).toBe(0);
    expect(r.totalIncomeTax).toBe(0);
  });

  it('課税所得195万（5%ブラケット上限）', () => {
    const r = calcIncomeTax(1950000, params);
    expect(r.taxableIncome).toBe(1950000);
    expect(r.incomeTaxBeforeSurtax).toBe(97500);
    expect(r.appliedBracketRate).toBe(0.05);
    expect(r.reconstructionSurtax).toBe(Math.floor(97500 * 0.021));
    expect(r.totalIncomeTax).toBe(97500 + Math.floor(97500 * 0.021));
  });

  it('課税所得195万1円（10%ブラケットに入る）', () => {
    const r = calcIncomeTax(1950001, params);
    expect(r.taxableIncome).toBe(1950000); // 1000円未満切捨て
    expect(r.appliedBracketRate).toBe(0.05); // 195万なのでまだ5%
  });

  it('課税所得330万（10%ブラケット上限）', () => {
    const r = calcIncomeTax(3300000, params);
    expect(r.incomeTaxBeforeSurtax).toBe(3300000 * 0.10 - 97500);
    expect(r.appliedBracketRate).toBe(0.10);
  });

  it('課税所得500万（20%ブラケット）', () => {
    const r = calcIncomeTax(5000000, params);
    expect(r.taxableIncome).toBe(5000000);
    const expected = 5000000 * 0.20 - 427500;
    expect(r.incomeTaxBeforeSurtax).toBe(Math.floor(expected / 100) * 100);
  });

  it('課税所得900万（23%ブラケット上限）', () => {
    const r = calcIncomeTax(9000000, params);
    expect(r.appliedBracketRate).toBe(0.23);
  });

  it('課税所得4000万超（45%ブラケット）', () => {
    const r = calcIncomeTax(50000000, params);
    expect(r.appliedBracketRate).toBe(0.45);
  });

  it('1000円未満切捨ての端数処理', () => {
    const r = calcIncomeTax(1234567, params);
    expect(r.taxableIncome).toBe(1234000);
  });

  it('100円未満切捨ての端数処理（税額）', () => {
    const r = calcIncomeTax(2000000, params);
    const rawTax = 2000000 * 0.10 - 97500;
    expect(r.incomeTaxBeforeSurtax).toBe(Math.floor(rawTax / 100) * 100);
  });

  it('復興特別所得税は所得税の2.1%（1円未満切捨て）', () => {
    const r = calcIncomeTax(5000000, params);
    expect(r.reconstructionSurtax).toBe(Math.floor(r.incomeTaxBeforeSurtax * 0.021));
    expect(r.totalIncomeTax).toBe(r.incomeTaxBeforeSurtax + r.reconstructionSurtax);
  });

  it('手計算シナリオ: 課税所得350万', () => {
    // 350万 × 20% - 427,500 = 272,500
    const r = calcIncomeTax(3500000, params);
    expect(r.incomeTaxBeforeSurtax).toBe(272500);
    expect(r.reconstructionSurtax).toBe(Math.floor(272500 * 0.021)); // 5,722
    expect(r.totalIncomeTax).toBe(272500 + 5722);
  });
});

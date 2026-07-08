import { describe, it, expect } from 'vitest';
import { calcResidentTax } from './residentTax';
import taxParams from '../data/taxParams.2026.json';
import type { TaxParams } from '../data/types';

const params = (taxParams as unknown as TaxParams).residentTax;

describe('calcResidentTax', () => {
  it('所得0 → 均等割もなし', () => {
    const r = calcResidentTax(0, params);
    expect(r.taxableIncome).toBe(0);
    expect(r.incomeLevy).toBe(0);
    expect(r.perCapitaLevy).toBe(0);
    expect(r.totalResidentTax).toBe(0);
  });

  it('負の所得 → 税額0', () => {
    const r = calcResidentTax(-100000, params);
    expect(r.totalResidentTax).toBe(0);
  });

  it('課税所得300万 → 所得割30万+均等割5000円', () => {
    const r = calcResidentTax(3000000, params);
    expect(r.taxableIncome).toBe(3000000);
    expect(r.incomeLevy).toBe(300000);
    expect(r.perCapitaLevy).toBe(5000);
    expect(r.totalResidentTax).toBe(305000);
  });

  it('1000円未満切捨て', () => {
    const r = calcResidentTax(3456789, params);
    expect(r.taxableIncome).toBe(3456000);
  });

  it('所得割は100円未満切捨て', () => {
    const r = calcResidentTax(1555555, params);
    // 1,555,000 * 0.10 = 155,500
    expect(r.taxableIncome).toBe(1555000);
    expect(r.incomeLevy).toBe(155500);
  });

  it('均等割に森林環境税を含む（5000円）', () => {
    const r = calcResidentTax(1000000, params);
    expect(r.perCapitaLevy).toBe(5000);
  });
});

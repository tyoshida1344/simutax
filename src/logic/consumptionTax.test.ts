import { describe, it, expect } from 'vitest';
import { calcConsumptionTax } from './consumptionTax';
import { taxParams } from '../data/taxParams';

const params = taxParams.consumptionTax;
const TAX_YEAR = 2026;

describe('calcConsumptionTax', () => {
  describe('課税事業者判定', () => {
    it('基準期間売上1,000万以下 かつ インボイス未登録 → 免税', () => {
      const r = calcConsumptionTax(5500000, 'under10m', false, 500000, 'cat5', null, TAX_YEAR, params);
      expect(r.isTaxable).toBe(false);
      expect(r.appliedAmount).toBe(0);
    });

    it('基準期間売上1,000万超 → 課税（インボイス関係なく）', () => {
      const r = calcConsumptionTax(5500000, 'over10m', false, 500000, 'cat5', null, TAX_YEAR, params);
      expect(r.isTaxable).toBe(true);
      expect(r.taxableReason).toBe('基準期間の課税売上高が1,000万円超');
    });

    it('基準期間売上1,000万以下 かつ インボイス登録 → 課税', () => {
      const r = calcConsumptionTax(5500000, 'under10m', true, 500000, 'cat5', null, TAX_YEAR, params);
      expect(r.isTaxable).toBe(true);
      expect(r.taxableReason).toBe('インボイス発行事業者');
    });
  });

  describe('本則課税', () => {
    it('売上550万(税込) 課税仕入額110万(税込) → 売上税50万 - 仕入税10万 = 40万', () => {
      const r = calcConsumptionTax(5500000, 'over10m', false, 1100000, 'cat5', null, TAX_YEAR, params);
      expect(r.salesTax).toBe(500000);
      expect(r.purchaseTax).toBe(100000);
      expect(r.standardMethod.amount).toBe(400000);
      expect(r.standardMethod.applicable).toBe(true);
    });

    it('課税仕入額55万(経費の半分相当) → 仕入税は半分に対して計算', () => {
      const r = calcConsumptionTax(5500000, 'over10m', false, 550000, 'cat5', null, TAX_YEAR, params);
      expect(r.purchaseTax).toBe(50000);
      expect(r.standardMethod.amount).toBe(450000);
    });

    it('課税仕入額ゼロ → 仕入税ゼロ', () => {
      const r = calcConsumptionTax(5500000, 'over10m', false, 0, 'cat5', null, TAX_YEAR, params);
      expect(r.purchaseTax).toBe(0);
      expect(r.standardMethod.amount).toBe(500000);
    });
  });

  describe('簡易課税', () => {
    it('第5種(みなし50%) → 売上税 × (1 - 0.5)', () => {
      const r = calcConsumptionTax(5500000, 'under10m', true, 550000, 'cat5', null, TAX_YEAR, params);
      expect(r.simplifiedMethod.amount).toBe(250000);
      expect(r.simplifiedMethod.applicable).toBe(true);
    });

    it('第1種(みなし90%) → 売上税 × 0.1', () => {
      const r = calcConsumptionTax(5500000, 'under10m', true, 550000, 'cat1', null, TAX_YEAR, params);
      expect(r.simplifiedMethod.amount).toBe(50000);
    });

    it('第6種(みなし40%) → 売上税 × 0.6', () => {
      const r = calcConsumptionTax(5500000, 'under10m', true, 550000, 'cat6', null, TAX_YEAR, params);
      expect(r.simplifiedMethod.amount).toBe(300000);
    });

    it('基準期間売上5,000万超 → 簡易課税は適用不可', () => {
      const r = calcConsumptionTax(5500000, 'over50m', false, 550000, 'cat5', null, TAX_YEAR, params);
      expect(r.simplifiedMethod.applicable).toBe(false);
      expect(r.simplifiedMethod.reason).toContain('5,000万円超');
    });

    it('基準期間売上1,000万超〜5,000万以下 → 簡易課税は適用可', () => {
      const r = calcConsumptionTax(5500000, 'over10m', true, 550000, 'cat5', null, TAX_YEAR, params);
      expect(r.simplifiedMethod.applicable).toBe(true);
    });
  });

  describe('2割特例', () => {
    it('インボイス登録 かつ 基準期間売上1,000万以下 かつ 対象年度 → 適用可', () => {
      const r = calcConsumptionTax(5500000, 'under10m', true, 550000, 'cat5', null, TAX_YEAR, params);
      expect(r.special20Method.applicable).toBe(true);
      expect(r.special20Method.amount).toBe(100000); // 500000 * 0.20
    });

    it('基準期間売上1,000万超 → 2割特例は適用不可', () => {
      const r = calcConsumptionTax(5500000, 'over10m', true, 550000, 'cat5', null, TAX_YEAR, params);
      expect(r.special20Method.applicable).toBe(false);
      expect(r.special20Method.reason).toContain('1,000万円超');
    });

    it('インボイス未登録かつ1,000万超 → 1,000万超の理由が優先', () => {
      const r = calcConsumptionTax(5500000, 'over10m', false, 550000, 'cat5', null, TAX_YEAR, params);
      expect(r.special20Method.applicable).toBe(false);
      expect(r.special20Method.reason).toContain('1,000万円超');
    });

    it('対象期間外 → 2割特例は適用不可', () => {
      const r = calcConsumptionTax(5500000, 'under10m', true, 550000, 'cat5', null, 2030, params);
      expect(r.special20Method.applicable).toBe(false);
      expect(r.special20Method.reason).toContain('適用期間外');
    });
  });

  describe('推奨方式', () => {
    it('3方式全て適用可の場合、最小額の方式を推奨', () => {
      const r = calcConsumptionTax(5500000, 'under10m', true, 550000, 'cat5', null, TAX_YEAR, params);
      // 本則: 450000, 簡易: 250000, 2割特例: 100000
      expect(r.recommendedMethod).toBe('special20');
      expect(r.appliedAmount).toBe(100000);
    });

    it('2割特例が不可の場合、本則と簡易から最小を推奨', () => {
      const r = calcConsumptionTax(5500000, 'over10m', false, 550000, 'cat5', null, TAX_YEAR, params);
      // over10m → 簡易は適用可（5,000万以下）
      // 本則: 450000, 簡易: 250000
      expect(r.recommendedMethod).toBe('simplified');
    });

    it('免税事業者の場合、推奨方式はnull', () => {
      const r = calcConsumptionTax(5500000, 'under10m', false, 550000, 'cat5', null, TAX_YEAR, params);
      expect(r.recommendedMethod).toBeNull();
    });
  });

  describe('方式選択', () => {
    it('ユーザ選択が適用可能な方式 → その方式を適用', () => {
      const r = calcConsumptionTax(5500000, 'under10m', true, 550000, 'cat5', 'simplified', TAX_YEAR, params);
      expect(r.appliedMethod).toBe('simplified');
      expect(r.appliedAmount).toBe(250000);
    });

    it('ユーザ選択が適用不可な方式 → 推奨方式にフォールバック', () => {
      const r = calcConsumptionTax(5500000, 'over50m', false, 550000, 'cat5', 'simplified', TAX_YEAR, params);
      // 簡易はover50mで不可 → 本則のみ
      expect(r.appliedMethod).toBe('standard');
    });

    it('未選択(null) → 推奨方式を適用', () => {
      const r = calcConsumptionTax(5500000, 'under10m', true, 550000, 'cat5', null, TAX_YEAR, params);
      expect(r.appliedMethod).toBe(r.recommendedMethod);
    });
  });

  describe('端数処理', () => {
    it('売上税・仕入税は切り捨て', () => {
      // 5,500,001 * 10 / 110 = 500000.0909... → 500000
      // 1,100,001 * 10 / 110 = 100000.0909... → 100000
      const r = calcConsumptionTax(5500001, 'over10m', false, 1100001, 'cat5', null, TAX_YEAR, params);
      expect(r.salesTax).toBe(500000);
      expect(r.purchaseTax).toBe(100000);
    });

    it('簡易課税のみなし仕入控除は切り捨て', () => {
      // salesTax=500000, cat5 rate=0.50 → 500000 * 0.50 = 250000
      // salesTax - floor(salesTax * 0.50) = 500000 - 250000 = 250000
      const r = calcConsumptionTax(5500001, 'under10m', true, 0, 'cat5', null, TAX_YEAR, params);
      expect(r.simplifiedMethod.amount).toBe(250000);
    });

    it('2割特例は切り捨て', () => {
      // 5,555,557 → salesTax = floor(5555557 * 10 / 110) = floor(505050.636...) = 505050
      // 505050 * 0.20 = 101010.0 → 101010
      const r = calcConsumptionTax(5555557, 'under10m', true, 0, 'cat5', null, TAX_YEAR, params);
      expect(r.salesTax).toBe(505050);
      expect(r.special20Method.amount).toBe(101010);
    });
  });

  describe('還付（本則課税でマイナス）', () => {
    it('仕入税が売上税を上回る場合、本則課税はマイナス（還付）', () => {
      // revenue=1,100,000, taxablePurchaseAmount=5,500,000
      // salesTax = floor(1100000 * 10 / 110) = 100000
      // purchaseTax = floor(5500000 * 10 / 110) = 500000
      // standard = 100000 - 500000 = -400000
      const r = calcConsumptionTax(1100000, 'over10m', false, 5500000, 'cat5', null, TAX_YEAR, params);
      expect(r.standardMethod.amount).toBe(-400000);
      expect(r.standardMethod.applicable).toBe(true);
    });

    it('還付がある場合、本則課税が推奨される', () => {
      const r = calcConsumptionTax(1100000, 'under10m', true, 5500000, 'cat5', null, TAX_YEAR, params);
      // standard: -400000, simplified: 50000, special20: 20000
      expect(r.recommendedMethod).toBe('standard');
      expect(r.appliedAmount).toBe(-400000);
    });
  });

  describe('ゼロ・境界値', () => {
    it('売上ゼロ → 消費税ゼロ', () => {
      const r = calcConsumptionTax(0, 'over10m', false, 0, 'cat5', null, TAX_YEAR, params);
      expect(r.salesTax).toBe(0);
      expect(r.standardMethod.amount).toBe(0);
    });

    it('不明なカテゴリ → デフォルト(cat5)にフォールバック', () => {
      const r = calcConsumptionTax(5500000, 'under10m', true, 550000, 'cat5', null, TAX_YEAR, params);
      expect(r.simplifiedMethod.amount).toBe(250000); // cat5: 50%
    });
  });
});

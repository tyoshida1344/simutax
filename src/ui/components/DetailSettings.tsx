import { useState } from 'react';
import type { SimulatorInput } from '../../data/types';
import taxParams from '../../data/taxParams.2026.json';
import type { TaxParams } from '../../data/types';
import { NumberInput } from './NumberInput';
import styles from '../styles/DetailSettings.module.css';

const params = taxParams as unknown as TaxParams;
const simplifiedCategories = Object.entries(params.consumptionTax.simplifiedCategories).map(
  ([value, cat]) => ({ value, label: cat.label }),
);

interface Props {
  input: SimulatorInput;
  updateField: <K extends keyof SimulatorInput>(field: K, value: SimulatorInput[K]) => void;
}

const businessTypeOptions = [
  {
    value: 'type1',
    label: '税率5%（一般）',
    hint: '物品販売・飲食・デザイン・コンサル・IT など大半の業種',
  },
  {
    value: 'type3_3pct',
    label: '税率3%（鍼灸等）',
    hint: 'あん摩・鍼灸・柔道整復など',
  },
  {
    value: 'exempt',
    label: '非課税',
    hint: '文筆業・漫画家・音楽家・農業など',
  },
];

export function DetailSettings({ input, updateField }: Props) {
  const [open, setOpen] = useState(false);

  const selectedType = businessTypeOptions.find((o) => o.value === input.businessType)
    ?? businessTypeOptions[0];

  return (
    <section className={styles.section}>
      <button
        onClick={() => setOpen(!open)}
        className={styles.toggle}
        aria-expanded={open}
      >
        <span>詳細設定</span>
        <span className={open ? styles.toggleIconOpen : styles.toggleIcon}>▼</span>
      </button>

      {open && (
        <div className={styles.content}>
          <div className={styles.field}>
            <label className={styles.label}>事業の種類</label>
            <select
              value={selectedType.value}
              onChange={(e) => updateField('businessType', e.target.value)}
            >
              {businessTypeOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <p className={styles.hint}>{selectedType.hint}</p>
          </div>

          <p className={styles.groupLabel}>所得控除</p>

          <NumberInput
            label="iDeCo（年額）"
            value={input.iDeCoContribution}
            onChange={(v) => updateField('iDeCoContribution', v)}
            suffix="円"
          />
          <NumberInput
            label="小規模企業共済（年額）"
            value={input.smallBusinessMutualAid}
            onChange={(v) => updateField('smallBusinessMutualAid', v)}
            suffix="円"
          />
          <NumberInput
            label="扶養親族の人数"
            value={input.dependentCount}
            onChange={(v) => updateField('dependentCount', v)}
            suffix="人"
          />
          <div className={styles.checkboxRow}>
            <input
              type="checkbox"
              id="spouse"
              checked={input.spouseDeduction}
              onChange={(e) => updateField('spouseDeduction', e.target.checked)}
            />
            <label htmlFor="spouse" className={styles.checkboxLabel}>
              配偶者控除を適用
            </label>
          </div>
          <NumberInput
            label="生命保険料控除"
            value={input.lifeInsuranceDeduction}
            onChange={(v) => updateField('lifeInsuranceDeduction', v)}
            suffix="円"
          />
          <NumberInput
            label="医療費控除"
            value={input.medicalExpenseDeduction}
            onChange={(v) => updateField('medicalExpenseDeduction', v)}
            suffix="円"
          />

          <p className={styles.groupLabel}>国民健康保険</p>

          <div className={styles.checkboxRow}>
            <input
              type="checkbox"
              id="nursingCareAge"
              checked={input.age >= 40 && input.age <= 64}
              onChange={(e) => updateField('age', e.target.checked ? 45 : 35)}
            />
            <label htmlFor="nursingCareAge" className={styles.checkboxLabel}>
              40〜64歳である（介護分が加算されます）
            </label>
          </div>
          <NumberInput
            label="国保の加入人数（世帯）"
            value={input.householdMembers}
            onChange={(v) => updateField('householdMembers', Math.max(1, v))}
            suffix="人"
          />

          <p className={styles.groupLabel}>消費税</p>

          <NumberInput
            label="基準期間の課税売上高（2年前）"
            value={input.basePeriodSales}
            onChange={(v) => updateField('basePeriodSales', v)}
            suffix="円"
          />
          <div className={styles.checkboxRow}>
            <input
              type="checkbox"
              id="invoiceRegistered"
              checked={input.invoiceRegistered}
              onChange={(e) => updateField('invoiceRegistered', e.target.checked)}
            />
            <label htmlFor="invoiceRegistered" className={styles.checkboxLabel}>
              インボイス発行事業者に登録済み
            </label>
          </div>
          <NumberInput
            label="課税仕入の割合"
            value={input.taxablePurchaseRatio}
            onChange={(v) => updateField('taxablePurchaseRatio', Math.min(100, v))}
            suffix="%"
          />
          <div className={styles.field}>
            <label htmlFor="simplifiedTaxCategory" className={styles.label}>簡易課税の事業区分</label>
            <select
              id="simplifiedTaxCategory"
              value={input.simplifiedTaxCategory}
              onChange={(e) => updateField('simplifiedTaxCategory', e.target.value)}
            >
              {simplifiedCategories.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </section>
  );
}

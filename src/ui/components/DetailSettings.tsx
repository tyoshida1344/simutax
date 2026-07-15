import { useState } from 'react';
import type { SimulatorInput, SimulatorResult } from '../../data/types';
import { NumberInput } from './NumberInput';
import { ConsumptionTaxComparison } from './ConsumptionTaxComparison';
import styles from '../styles/DetailSettings.module.css';

interface Props {
  input: SimulatorInput;
  result: SimulatorResult;
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

function AccordionGroup({
  label,
  defaultOpen,
  children,
}: {
  label: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);

  return (
    <div className={styles.group}>
      <button
        onClick={() => setOpen(!open)}
        className={styles.groupToggle}
        aria-expanded={open}
        type="button"
      >
        <span className={open ? styles.groupIconOpen : styles.groupIcon}>▶</span>
        <span className={styles.groupLabel}>{label}</span>
      </button>
      {open && (
        <div className={styles.groupContent}>
          {children}
        </div>
      )}
    </div>
  );
}

export function DetailSettings({ input, result, updateField }: Props) {
  const [open, setOpen] = useState(false);

  const selectedType = businessTypeOptions.find((o) => o.value === input.businessType)
    ?? businessTypeOptions[0];

  return (
    <section className={styles.section}>
      <button
        onClick={() => setOpen(!open)}
        className={styles.toggle}
        aria-expanded={open}
        type="button"
      >
        <span className={open ? styles.toggleIconOpen : styles.toggleIcon}>▶</span>
        <span>詳細設定</span>
      </button>

      {open && (
        <div className={styles.content}>
          <AccordionGroup label="事業の種類" defaultOpen>
            <div className={styles.field}>
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
          </AccordionGroup>

          <AccordionGroup label="所得控除">
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
          </AccordionGroup>

          <AccordionGroup label="国民健康保険">
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
          </AccordionGroup>

          <AccordionGroup label="消費税">
            <div className={styles.field}>
              <label className={styles.label} htmlFor="basePeriodSales">基準期間の課税売上高（2年前）</label>
              <select
                id="basePeriodSales"
                value={input.basePeriodSales}
                onChange={(e) => updateField('basePeriodSales', e.target.value as 'under10m' | 'over10m' | 'over50m')}
              >
                <option value="under10m">1,000万円以下</option>
                <option value="over10m">1,000万円超〜5,000万円以下</option>
                <option value="over50m">5,000万円超</option>
              </select>
            </div>
            <div className={styles.checkboxRow}>
              <input
                type="checkbox"
                id="invoiceRegistered"
                checked={input.invoiceRegistered}
                onChange={(e) => updateField('invoiceRegistered', e.target.checked)}
              />
              <label htmlFor="invoiceRegistered" className={styles.checkboxLabel}>
                インボイス発行事業者
              </label>
            </div>
            <NumberInput
              label="課税仕入の割合"
              value={input.taxablePurchaseRatio}
              onChange={(v) => updateField('taxablePurchaseRatio', Math.min(100, v))}
              suffix="%"
            />
            <ConsumptionTaxComparison
              result={result.consumptionTax}
              updateField={updateField}
            />
          </AccordionGroup>
        </div>
      )}
    </section>
  );
}

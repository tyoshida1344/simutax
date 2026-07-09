import { useState } from 'react';
import type { SimulatorInput, TaxParams } from '../../data/types';
import { NumberInput } from './NumberInput';
import styles from '../styles/DetailSettings.module.css';

interface Props {
  input: SimulatorInput;
  updateField: <K extends keyof SimulatorInput>(field: K, value: SimulatorInput[K]) => void;
  params: TaxParams;
}

export function DetailSettings({ input, updateField, params }: Props) {
  const [open, setOpen] = useState(false);

  const businessTypes = Object.entries(params.businessTax.types);

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
              value={input.businessType}
              onChange={(e) => updateField('businessType', e.target.value)}
            >
              {businessTypes.map(([key, t]) => (
                <option key={key} value={key}>
                  {t.label}
                </option>
              ))}
            </select>
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

          <NumberInput
            label="年齢"
            value={input.age}
            onChange={(v) => updateField('age', v)}
            suffix="歳"
          />
          <NumberInput
            label="国保の加入人数（世帯）"
            value={input.householdMembers}
            onChange={(v) => updateField('householdMembers', Math.max(1, v))}
            suffix="人"
          />
        </div>
      )}
    </section>
  );
}

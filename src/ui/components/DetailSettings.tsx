import { useState } from 'react';
import type { SimulatorInput, TaxParams } from '../../data/types';

interface Props {
  input: SimulatorInput;
  updateField: <K extends keyof SimulatorInput>(field: K, value: SimulatorInput[K]) => void;
  params: TaxParams;
}

function NumberInput({
  label,
  value,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
          min={0}
          inputMode="numeric"
          placeholder="0"
        />
        {suffix && <span style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{suffix}</span>}
      </div>
    </div>
  );
}

export function DetailSettings({ input, updateField, params }: Props) {
  const [open, setOpen] = useState(false);

  const businessTypes = Object.entries(params.businessTax.types);

  return (
    <section style={{ marginBottom: 20 }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          padding: '10px 0',
          background: 'none',
          border: 'none',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: 'var(--font)',
          fontSize: 14,
          color: 'var(--text-secondary)',
        }}
      >
        <span>詳細設定</span>
        <span style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          ▼
        </span>
      </button>

      {open && (
        <div style={{ padding: '16px 0' }}>
          <div style={{ marginBottom: 12 }}>
            <label>事業の種類</label>
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

          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '16px 0 8px', fontWeight: 500 }}>
            所得控除
          </p>

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
          <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              id="spouse"
              checked={input.spouseDeduction}
              onChange={(e) => updateField('spouseDeduction', e.target.checked)}
              style={{ width: 'auto' }}
            />
            <label htmlFor="spouse" style={{ marginBottom: 0 }}>
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

          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '16px 0 8px', fontWeight: 500 }}>
            国民健康保険
          </p>

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

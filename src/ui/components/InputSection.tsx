import type { SimulatorInput, FilingType } from '../../data/types';

const filingOptions: { value: FilingType; label: string }[] = [
  { value: 'blue65', label: '青色申告（65万円控除）' },
  { value: 'blue55', label: '青色申告（55万円控除）' },
  { value: 'blue10', label: '青色申告（10万円控除）' },
  { value: 'white', label: '白色申告' },
];

interface Props {
  input: SimulatorInput;
  updateField: <K extends keyof SimulatorInput>(field: K, value: SimulatorInput[K]) => void;
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
    <div style={{ marginBottom: 16 }}>
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

export function InputSection({ input, updateField }: Props) {
  return (
    <section>
      <NumberInput
        label="年間売上（税込）"
        value={input.revenue}
        onChange={(v) => updateField('revenue', v)}
        suffix="円"
      />
      <NumberInput
        label="必要経費"
        value={input.expenses}
        onChange={(v) => updateField('expenses', v)}
        suffix="円"
      />
      <div style={{ marginBottom: 16 }}>
        <label>申告区分</label>
        <select
          value={input.filingType}
          onChange={(e) => updateField('filingType', e.target.value as FilingType)}
        >
          {filingOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}

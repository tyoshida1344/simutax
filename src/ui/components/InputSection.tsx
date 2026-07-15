import type { SimulatorInput, FilingType } from '../../data/types';
import { NumberInput } from './NumberInput';
import { MAX_AMOUNT } from '../constants';
import styles from '../styles/InputSection.module.css';

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

export function InputSection({ input, updateField }: Props) {
  return (
    <section className={styles.section}>
      <NumberInput
        label="年間売上（税込）"
        value={input.revenue}
        onChange={(v) => updateField('revenue', v)}
        suffix="円"
        max={MAX_AMOUNT}
      />
      <NumberInput
        label="必要経費"
        value={input.expenses}
        onChange={(v) => updateField('expenses', v)}
        suffix="円"
        max={MAX_AMOUNT}
      />
      <div className={styles.field}>
        <label className={styles.label}>申告区分</label>
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

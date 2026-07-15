import { useState } from 'react';
import type { SimulatorInput, FilingType } from '../../data/types';
import { NumberInput } from './NumberInput';
import { FilingTypeChecker, filingTypeLabels } from './FilingTypeChecker';
import { MAX_AMOUNT } from '../constants';
import styles from '../styles/InputSection.module.css';

const filingOptions = (Object.keys(filingTypeLabels) as FilingType[]).map((value) => ({
  value,
  label: filingTypeLabels[value],
}));

interface Props {
  input: SimulatorInput;
  updateField: <K extends keyof SimulatorInput>(field: K, value: SimulatorInput[K]) => void;
}

export function InputSection({ input, updateField }: Props) {
  const [showChecker, setShowChecker] = useState(false);

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
        <button
          type="button"
          className={styles.helperLink}
          onClick={() => setShowChecker(true)}
        >
          申告区分が分からない場合
        </button>
      </div>
      {showChecker && (
        <FilingTypeChecker
          onApply={(filingType) => {
            updateField('filingType', filingType);
            setShowChecker(false);
          }}
          onClose={() => setShowChecker(false)}
        />
      )}
    </section>
  );
}

import { useState } from 'react';
import type { SimulatorInput, FilingType } from '../../data/types';
import { NumberInput } from './NumberInput';
import { FilingTypeChecker } from './FilingTypeChecker';
import { HelpPopover } from './HelpPopover';
import { MAX_AMOUNT, filingTypeLabels } from '../constants';
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
        help={
          <HelpPopover
            description="事業で得た収入の合計額（消費税込み）。税金はここから経費を引いた「所得」に対して計算されます。"
            linkTo="/learn/income-tax"
          />
        }
      />
      <NumberInput
        label="必要経費"
        value={input.expenses}
        onChange={(v) => updateField('expenses', v)}
        suffix="円"
        max={MAX_AMOUNT}
        help={
          <HelpPopover
            description="事業に必要な仕入れ・交通費・通信費・家賃按分等の支出。売上から差し引いて事業所得を計算します。"
            linkTo="/learn/income-tax"
          />
        }
      />
      <div className={styles.field}>
        <div className={styles.labelRow}>
          <div className={styles.labelWithHelp}>
            <label className={styles.label}>申告区分</label>
            <HelpPopover
              description="青色申告の控除額は、帳簿の記帳方法や申告方法で異なります。複式簿記＋e-Taxで最大65万円の控除を受けられます。"
              linkTo="/glossary?term=aoiro-tokubetsu-koujo"
            />
          </div>
          <button
            type="button"
            className={styles.helperLink}
            onClick={() => setShowChecker(true)}
          >
            分からない場合
          </button>
        </div>
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

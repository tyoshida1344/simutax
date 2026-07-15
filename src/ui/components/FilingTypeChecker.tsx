import { useState } from 'react';
import type { FilingType } from '../../data/types';
import { Modal } from './Modal';
import styles from '../styles/FilingTypeChecker.module.css';

const questions = [
  '青色申告承認申請書を提出していますか？',
  '複式簿記で記帳していますか？',
  '貸借対照表と損益計算書を添付できますか？',
  '期限内に申告しますか？',
  'e-Taxで申告、または優良な電子帳簿保存をしていますか？',
];

export const filingTypeLabels: Record<FilingType, string> = {
  blue65: '青色申告（65万円控除）',
  blue55: '青色申告（55万円控除）',
  blue10: '青色申告（10万円控除）',
  white: '白色申告',
};

function resolve(step: number, yes: boolean): FilingType | null {
  if (step === 0 && !yes) return 'white';
  if (step >= 1 && step <= 3 && !yes) return 'blue10';
  if (step === 4) return yes ? 'blue65' : 'blue55';
  return null;
}

interface Props {
  onApply: (filingType: FilingType) => void;
  onClose: () => void;
}

export function FilingTypeChecker({ onApply, onClose }: Props) {
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<FilingType | null>(null);

  function handleAnswer(yes: boolean) {
    const determined = resolve(step, yes);
    if (determined) {
      setResult(determined);
    } else {
      setStep(step + 1);
    }
  }

  function handleReset() {
    setStep(0);
    setResult(null);
  }

  return (
    <Modal title="申告区分の判定" onClose={onClose}>
      {result === null ? (
        <div>
          <p className={styles.step}>
            質問 {step + 1} / {questions.length}
          </p>
          <p className={styles.question}>{questions[step]}</p>
          <div className={styles.buttons}>
            <button
              type="button"
              className={styles.answerButton}
              onClick={() => handleAnswer(true)}
              autoFocus
            >
              はい
            </button>
            <button
              type="button"
              className={styles.answerButton}
              onClick={() => handleAnswer(false)}
            >
              いいえ
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p className={styles.resultLabel}>あなたの申告区分</p>
          <p className={styles.resultValue}>{filingTypeLabels[result]}</p>
          <button
            type="button"
            className={styles.applyButton}
            onClick={() => onApply(result)}
          >
            この区分をシミュレータに反映
          </button>
          <button
            type="button"
            className={styles.resetButton}
            onClick={handleReset}
          >
            最初からやり直す
          </button>
        </div>
      )}
    </Modal>
  );
}

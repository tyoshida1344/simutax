import { useState } from 'react';
import type { FilingType } from '../../data/types';
import { Modal } from './Modal';
import { filingTypeLabels } from '../constants';
import styles from '../styles/FilingTypeChecker.module.css';

const questions: { text: string; hint?: string }[] = [
  {
    text: '青色申告承認申請書を税務署に提出していますか？',
    hint: '開業時などに「青色申告で確定申告します」と届け出る書類です',
  },
  {
    text: '正規の簿記の原則（複式簿記）で記帳していますか？',
    hint: '会計ソフト（freee・マネーフォワード等）を使っていれば通常は複式簿記です',
  },
  {
    text: '貸借対照表と損益計算書を確定申告書に添付できますか？',
    hint: '会計ソフトで自動作成できる、資産・負債の一覧表と収支の一覧表です',
  },
  {
    text: '確定申告の期限内（通常3月15日まで）に申告しますか？',
  },
  {
    text: 'e-Taxで申告、または仕訳帳・総勘定元帳の電子帳簿保存をしていますか？',
    hint: 'e-Taxは国税庁のオンライン申告システムです。freee・マネーフォワード等からe-Tax連携で申告する場合も該当します',
  },
];

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
          <div className={styles.questionArea}>
            <p className={styles.question}>{questions[step].text}</p>
            {questions[step].hint && (
              <p className={styles.hint}>{questions[step].hint}</p>
            )}
          </div>
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

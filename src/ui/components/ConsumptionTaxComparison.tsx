import { Link } from 'react-router-dom';
import type { ConsumptionTaxResult, ConsumptionTaxMethod, ConsumptionTaxMethodResult, SimulatorInput } from '../../data/types';
import { formatYen } from '../format';
import styles from '../styles/ConsumptionTaxComparison.module.css';

interface Props {
  result: ConsumptionTaxResult;
  input: SimulatorInput;
  updateField: <K extends keyof SimulatorInput>(field: K, value: SimulatorInput[K]) => void;
}

const METHODS: { key: ConsumptionTaxMethod; label: string; description: string; resultKey: keyof Pick<ConsumptionTaxResult, 'standardMethod' | 'simplifiedMethod' | 'special20Method'> }[] = [
  { key: 'standard', label: '本則課税', description: '売上消費税から仕入消費税を差し引いて計算', resultKey: 'standardMethod' },
  { key: 'simplified', label: '簡易課税', description: '業種ごとのみなし仕入率で簡易に計算', resultKey: 'simplifiedMethod' },
  { key: 'special20', label: '2割特例', description: 'インボイス登録者向けの時限特例措置', resultKey: 'special20Method' },
];

function MethodCard({
  label,
  description,
  methodResult,
  isSelected,
  isRecommended,
  onSelect,
}: {
  label: string;
  description: string;
  methodResult: ConsumptionTaxMethodResult;
  isSelected: boolean;
  isRecommended: boolean;
  onSelect: () => void;
}) {
  const cardClass = !methodResult.applicable
    ? styles.cardDisabled
    : isSelected
      ? styles.cardSelected
      : styles.card;

  return (
    <button
      className={cardClass}
      onClick={methodResult.applicable ? onSelect : undefined}
      disabled={!methodResult.applicable}
      type="button"
    >
      <div className={styles.cardHeader}>
        <span className={styles.cardTitle}>{label}</span>
        {isRecommended && methodResult.applicable && (
          <span className={styles.recommendedBadge}>おすすめ</span>
        )}
      </div>
      <p className={styles.cardDescription}>{description}</p>
      {methodResult.applicable ? (
        <p className={styles.cardAmount}>{formatYen(methodResult.amount)}</p>
      ) : (
        <p className={styles.cardReason}>{methodResult.reason}</p>
      )}
      {isSelected && methodResult.applicable && (
        <p className={styles.cardSelectedLabel}>選択中</p>
      )}
    </button>
  );
}

export function ConsumptionTaxComparison({ result, input, updateField }: Props) {
  const handleSelect = (method: ConsumptionTaxMethod) => {
    updateField('selectedConsumptionTaxMethod', method);
  };

  return (
    <div>
      <header className={styles.header}>
        <Link to="/" className={styles.backLink} aria-label="メイン画面に戻る">← 戻る</Link>
        <h1 className={styles.title}>消費税 3方式比較</h1>
      </header>

      {!result.isTaxable ? (
        <div className={styles.exemptNotice}>
          <p className={styles.exemptTitle}>免税事業者</p>
          <p className={styles.exemptDescription}>
            基準期間の課税売上高が1,000万円以下で、インボイス発行事業者に登録していないため、消費税の納付義務はありません。
          </p>
        </div>
      ) : (
        <>
          <p className={styles.taxableNotice}>
            課税事業者（{result.taxableReason}）
          </p>

          <div className={styles.taxSummary}>
            <div className={styles.taxSummaryRow}>
              <span>売上にかかる消費税</span>
              <span>{formatYen(result.salesTax)}</span>
            </div>
            <div className={styles.taxSummaryRow}>
              <span>仕入にかかる消費税</span>
              <span>{formatYen(result.purchaseTax)}</span>
            </div>
          </div>

          <p className={styles.sectionLabel}>方式を選択してください</p>

          <div className={styles.cards}>
            {METHODS.map((m) => (
              <MethodCard
                key={m.key}
                label={m.label}
                description={m.description}
                methodResult={result[m.resultKey]}
                isSelected={input.selectedConsumptionTaxMethod === m.key || (!input.selectedConsumptionTaxMethod && result.appliedMethod === m.key)}
                isRecommended={result.recommendedMethod === m.key}
                onSelect={() => handleSelect(m.key)}
              />
            ))}
          </div>

          <div className={styles.appliedSummary}>
            <span>メイン画面に反映される消費税額</span>
            <span className={styles.appliedAmount}>{formatYen(result.appliedAmount)}</span>
          </div>
        </>
      )}
    </div>
  );
}

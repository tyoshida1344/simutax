import { useState } from 'react';
import type { SimulatorResult } from '../../data/types';
import { formatYen } from '../format';
import styles from '../styles/BreakdownFlow.module.css';

interface Props {
  result: SimulatorResult;
}

function BreakdownRow({
  label,
  amount,
  prefix,
  bold,
  expandable,
  children,
}: {
  label: string;
  amount: number;
  prefix?: string;
  bold?: boolean;
  expandable?: boolean;
  children?: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);

  const rowClass = bold
    ? styles.rowBold
    : expandable
      ? styles.rowExpandable
      : styles.row;

  const handleKeyDown = expandable
    ? (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setExpanded(!expanded);
        }
      }
    : undefined;

  return (
    <div>
      <div
        onClick={expandable ? () => setExpanded(!expanded) : undefined}
        onKeyDown={handleKeyDown}
        className={rowClass}
        role={expandable ? 'button' : undefined}
        tabIndex={expandable ? 0 : undefined}
        aria-expanded={expandable ? expanded : undefined}
      >
        <span className={styles.rowLabel}>
          {expandable && (
            <span className={expanded ? styles.expandIconOpen : styles.expandIcon}>
              ▶
            </span>
          )}
          {label}
        </span>
        <span className={bold ? styles.rowAmountBold : styles.rowAmount}>
          {prefix}{formatYen(amount)}
        </span>
      </div>
      {expanded && children && (
        <div className={styles.subRows}>
          {children}
        </div>
      )}
    </div>
  );
}

function Arrow() {
  return <div className={styles.arrow}>↓</div>;
}

function SubRow({ label, amount }: { label: string; amount: number }) {
  return (
    <div className={styles.subRow}>
      <span>{label}</span>
      <span className={styles.subRowAmount}>{formatYen(amount)}</span>
    </div>
  );
}

export function BreakdownFlow({ result }: Props) {
  return (
    <section className={styles.section}>
      <p className={styles.sectionLabel}>内訳</p>
      <BreakdownRow label="年間売上" amount={result.revenue} />
      <Arrow />
      <BreakdownRow label="経費" amount={result.expenses} prefix="− " />
      <Arrow />
      <BreakdownRow label="税金" amount={result.totalTax} prefix="− " expandable>
        <SubRow label="所得税＋復興特別所得税" amount={result.incomeTax.totalIncomeTax} />
        <SubRow label="住民税" amount={result.residentTax.totalResidentTax} />
        <SubRow label="個人事業税" amount={result.businessTax.totalBusinessTax} />
      </BreakdownRow>
      <Arrow />
      <BreakdownRow label="社会保険料" amount={result.totalSocialInsurance} prefix="− " expandable>
        <SubRow label="国民年金" amount={result.socialInsurance.nationalPension.annualAmount} />
        <SubRow label="国民健康保険" amount={result.socialInsurance.nhi.totalNHI} />
      </BreakdownRow>
      {result.savingsDeduction > 0 && (
        <>
          <Arrow />
          <BreakdownRow label="積立（iDeCo・共済）" amount={result.savingsDeduction} prefix="− " />
        </>
      )}
      <Arrow />
      <BreakdownRow label="自由に使えるお金" amount={result.disposableIncome} bold />

      <p className={styles.burdenRate}>
        実効負担率（税+社保/売上）: {(result.effectiveBurdenRate * 100).toFixed(1)}%
      </p>
    </section>
  );
}

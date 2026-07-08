import { useState } from 'react';
import type { SimulatorResult } from '../../data/types';
import { formatYen } from '../format';

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

  return (
    <div>
      <div
        onClick={expandable ? () => setExpanded(!expanded) : undefined}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 0',
          borderBottom: '1px solid var(--border)',
          cursor: expandable ? 'pointer' : 'default',
          fontWeight: bold ? 600 : 400,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {expandable && (
            <span
              style={{
                fontSize: 10,
                transform: expanded ? 'rotate(90deg)' : 'none',
                transition: 'transform 0.15s',
                display: 'inline-block',
              }}
            >
              ▶
            </span>
          )}
          {label}
        </span>
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>
          {prefix}{formatYen(amount)}
        </span>
      </div>
      {expanded && children && (
        <div style={{ paddingLeft: 20, background: 'var(--bg-section)' }}>
          {children}
        </div>
      )}
    </div>
  );
}

function SubRow({ label, amount }: { label: string; amount: number }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '6px 8px',
        fontSize: 13,
        color: 'var(--text-secondary)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <span>{label}</span>
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>{formatYen(amount)}</span>
    </div>
  );
}

export function BreakdownFlow({ result }: Props) {
  return (
    <section style={{ marginBottom: 20 }}>
      <BreakdownRow label="年間売上" amount={result.revenue} />
      <BreakdownRow label="経費" amount={result.expenses} prefix="− " />
      <BreakdownRow label="税金" amount={result.totalTax} prefix="− " expandable>
        <SubRow label="所得税＋復興特別所得税" amount={result.incomeTax.totalIncomeTax} />
        <SubRow label="住民税" amount={result.residentTax.totalResidentTax} />
        <SubRow label="個人事業税" amount={result.businessTax.totalBusinessTax} />
      </BreakdownRow>
      <BreakdownRow label="社会保険料" amount={result.totalSocialInsurance} prefix="− " expandable>
        <SubRow label="国民年金" amount={result.socialInsurance.nationalPension.annualAmount} />
        <SubRow label="国民健康保険" amount={result.socialInsurance.nhi.totalNHI} />
      </BreakdownRow>
      {result.savingsDeduction > 0 && (
        <BreakdownRow label="積立（iDeCo・共済）" amount={result.savingsDeduction} prefix="− " />
      )}
      <BreakdownRow label="自由に使えるお金" amount={result.disposableIncome} bold />

      <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'right', marginTop: 8 }}>
        実効負担率（税+社保/売上）: {(result.effectiveBurdenRate * 100).toFixed(1)}%
      </p>
    </section>
  );
}

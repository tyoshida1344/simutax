import { formatYen } from '../format';

interface Props {
  amount: number;
  savingsDeduction: number;
}

export function DisposableIncome({ amount, savingsDeduction }: Props) {
  return (
    <section
      style={{
        textAlign: 'center',
        padding: '24px 0',
        marginBottom: 8,
      }}
    >
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4 }}>
        自由に使えるお金
      </p>
      <p
        style={{
          fontSize: 40,
          fontWeight: 700,
          lineHeight: 1.2,
          color: amount >= 0 ? 'var(--text)' : 'var(--negative)',
        }}
      >
        {formatYen(amount)}
      </p>
      {savingsDeduction > 0 && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
          ※ iDeCo・小規模企業共済の積立 {formatYen(savingsDeduction)} を差引き済み
        </p>
      )}
    </section>
  );
}

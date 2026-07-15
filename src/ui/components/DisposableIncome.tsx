import { formatYen } from '../format';
import styles from '../styles/DisposableIncome.module.css';

interface Props {
  amount: number;
  savingsDeduction: number;
  effectiveBurdenRate: number;
}

export function DisposableIncome({ amount, savingsDeduction, effectiveBurdenRate }: Props) {
  return (
    <section className={styles.section}>
      <p className={styles.label}>自由に使えるお金</p>
      <p className={`${styles.amount} ${amount >= 0 ? styles.positive : styles.negative}`}>
        {formatYen(amount)}
      </p>
      <p className={styles.burdenRate}>
        実効負担率（税+社保/売上）: {(effectiveBurdenRate * 100).toFixed(1)}%
      </p>
      {savingsDeduction > 0 && (
        <p className={styles.note}>
          ※ iDeCo・小規模企業共済の積立 {formatYen(savingsDeduction)} を差引き済み
        </p>
      )}
    </section>
  );
}

import styles from '../styles/CalcFormula.module.css';

export function CalcFormula({ formulas }: { formulas: string[] }) {
  return (
    <div className={styles.box}>
      {formulas.map((f, i) => (
        <div key={i} className={styles.formula}>{f}</div>
      ))}
    </div>
  );
}

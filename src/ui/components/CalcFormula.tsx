import { renderTermLinks } from '../utils/termLink';
import styles from '../styles/CalcFormula.module.css';

export function CalcFormula({ formulas }: { formulas: string[] }) {
  return (
    <div className={styles.box}>
      {formulas.map((f, i) => (
        <div key={i} className={styles.formula}>{renderTermLinks(f)}</div>
      ))}
    </div>
  );
}

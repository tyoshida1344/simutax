import { Link } from 'react-router-dom';
import styles from '../styles/CalcFormula.module.css';

function renderFormula(text: string) {
  const parts = text.split(/\[\[([^\]]+)\]\]/g);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      const sep = part.indexOf('|');
      const termId = part.slice(0, sep);
      const display = part.slice(sep + 1);
      return (
        <Link key={i} to={`/glossary?term=${termId}`} className={styles.termLink}>
          {display}
        </Link>
      );
    }
    return part;
  });
}

export function CalcFormula({ formulas }: { formulas: string[] }) {
  return (
    <div className={styles.box}>
      {formulas.map((f, i) => (
        <div key={i} className={styles.formula}>{renderFormula(f)}</div>
      ))}
    </div>
  );
}

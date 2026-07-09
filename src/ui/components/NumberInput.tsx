import { useId } from 'react';
import styles from '../styles/NumberInput.module.css';

interface Props {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
}

export function NumberInput({ label, value, onChange, suffix }: Props) {
  const id = useId();

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      <div className={styles.inputRow}>
        <input
          id={id}
          type="number"
          value={value || ''}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
          min={0}
          inputMode="numeric"
          placeholder="0"
        />
        {suffix && <span className={styles.suffix}>{suffix}</span>}
      </div>
    </div>
  );
}

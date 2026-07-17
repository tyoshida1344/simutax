import { useId, type ReactNode } from 'react';
import styles from '../styles/NumberInput.module.css';

interface Props {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  min?: number;
  max?: number;
  help?: ReactNode;
}

export function NumberInput({ label, value, onChange, suffix, min = 0, max, help }: Props) {
  const id = useId();

  const clamp = (v: number): number => {
    let clamped = Math.max(min, v);
    if (max !== undefined) clamped = Math.min(max, clamped);
    return clamped;
  };

  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label htmlFor={id} className={styles.label}>{label}</label>
        {help}
      </div>
      <div className={styles.inputRow}>
        <input
          id={id}
          type="number"
          className={styles.input}
          value={value || ''}
          onChange={(e) => onChange(clamp(Number(e.target.value) || 0))}
          min={min}
          max={max}
          inputMode="numeric"
          placeholder="0"
        />
        {suffix && <span className={styles.suffix}>{suffix}</span>}
      </div>
    </div>
  );
}

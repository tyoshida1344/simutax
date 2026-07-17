import { formatYen } from '../format';
import styles from '../styles/StepFlow.module.css';

export interface StepFlowStep {
  label: string;
  value?: number;
  highlight?: boolean;
  connector?: {
    operator: string;
    label?: string;
  };
}

interface Props {
  steps: StepFlowStep[];
}

export function StepFlow({ steps }: Props) {
  return (
    <div className={styles.container}>
      {steps.map((step, i) => (
        <div key={i} className={styles.stepGroup}>
          <div className={step.highlight ? styles.stepHighlight : styles.step}>
            <span className={styles.stepLabel}>{step.label}</span>
            {step.value != null && (
              <span className={step.highlight ? styles.stepValueHighlight : styles.stepValue}>
                {formatYen(step.value)}
              </span>
            )}
          </div>
          {step.connector && i < steps.length - 1 && (
            <div className={styles.arrow}>
              <span className={styles.arrowLine}>↓</span>
              <span className={styles.arrowLabel}>
                {step.connector.operator}
                {step.connector.label && ` ${step.connector.label}`}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

import { useSimulator } from './hooks/useSimulator';
import { InputSection } from './components/InputSection';
import { DetailSettings } from './components/DetailSettings';
import { DisposableIncome } from './components/DisposableIncome';
import { BreakdownFlow } from './components/BreakdownFlow';
import { Disclaimer } from './components/Disclaimer';
import { ArrowDown } from './components/ArrowDown';
import styles from './styles/App.module.css';

export function App() {
  const { input, result, updateField } = useSimulator();

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>フリーランス税金シミュレータ</h1>
        <p className={styles.subtitle}>令和8年（2026年）分</p>
      </header>
      <InputSection input={input} updateField={updateField} />
      <DetailSettings input={input} updateField={updateField} />
      <ArrowDown size="md" />
      <DisposableIncome amount={result.disposableIncome} savingsDeduction={result.savingsDeduction} />
      <BreakdownFlow result={result} />
      <Disclaimer />
    </>
  );
}

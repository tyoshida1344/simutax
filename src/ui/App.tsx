import { Routes, Route } from 'react-router-dom';
import { useSimulator } from './hooks/useSimulator';
import { InputSection } from './components/InputSection';
import { DetailSettings } from './components/DetailSettings';
import { DisposableIncome } from './components/DisposableIncome';
import { BreakdownFlow } from './components/BreakdownFlow';
import { Disclaimer } from './components/Disclaimer';
import { ArrowDown } from './components/ArrowDown';
import styles from './styles/App.module.css';

function SimulatorPage({
  input,
  result,
  updateField,
  incorporationResult,
}: ReturnType<typeof useSimulator>) {
  const savingsDeduction = result.savingsDeduction;

  let displayAmount: number;
  let displayBurdenRate: number;

  if (incorporationResult) {
    displayAmount = incorporationResult.disposableIncome - savingsDeduction;
    const incTax = incorporationResult.corporateSide.totalCorporateTax + incorporationResult.individualSide.totalIndividualTax;
    const incSI = incorporationResult.corporateSide.socialInsurance + incorporationResult.individualSide.socialInsurance;
    displayBurdenRate = result.revenue > 0 ? (incTax + incSI) / result.revenue : 0;
  } else {
    displayAmount = result.disposableIncome;
    displayBurdenRate = result.effectiveBurdenRate;
  }

  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.title}>フリーランス税金シミュレータ</h1>
        <p className={styles.subtitle}>令和8年（2026年）分</p>
      </header>
      <InputSection input={input} updateField={updateField} />
      <DetailSettings
        input={input}
        result={result}
        updateField={updateField}
      />
      <ArrowDown size="md" />
      <DisposableIncome amount={displayAmount} savingsDeduction={savingsDeduction} effectiveBurdenRate={displayBurdenRate} />
      <BreakdownFlow result={result} incorporationResult={incorporationResult} />
      <Disclaimer />
    </>
  );
}

export function App() {
  const simulator = useSimulator();

  return (
    <Routes>
      <Route path="/" element={<SimulatorPage {...simulator} />} />
    </Routes>
  );
}

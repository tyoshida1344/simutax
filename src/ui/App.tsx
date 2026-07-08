import { useSimulator } from './hooks/useSimulator';
import { InputSection } from './components/InputSection';
import { DetailSettings } from './components/DetailSettings';
import { DisposableIncome } from './components/DisposableIncome';
import { BreakdownFlow } from './components/BreakdownFlow';
import { Disclaimer } from './components/Disclaimer';

export function App() {
  const { input, result, updateField, params } = useSimulator();

  return (
    <>
      <h1>フリーランス税金シミュレータ</h1>
      <InputSection input={input} updateField={updateField} />
      <DetailSettings input={input} updateField={updateField} params={params} />
      <DisposableIncome amount={result.disposableIncome} savingsDeduction={result.savingsDeduction} />
      <BreakdownFlow result={result} />
      <Disclaimer />
    </>
  );
}

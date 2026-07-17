import { useState, useMemo } from 'react';
import type { SimulatorInput, SimulatorResult, TaxParams, IncorporationResult } from '../../data/types';
import { calcIncorporation } from '../../logic';
import { formatYen } from '../format';
import { NumberInput } from './NumberInput';
import { MAX_AMOUNT } from '../constants';
import styles from '../styles/IncorporationComparison.module.css';

interface Props {
  input: SimulatorInput;
  result: SimulatorResult;
  params: TaxParams;
}

const capitalRangeOptions = [
  { value: 'under10m', label: '1,000万円以下' },
  { value: 'under100m', label: '1,000万円超〜1億円以下' },
  { value: 'under1b', label: '1億円超〜10億円以下' },
];

function ComparisonColumn({
  title,
  totalBurden,
  disposableIncome,
  children,
}: {
  title: string;
  totalBurden: number;
  disposableIncome: number;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.column}>
      <p className={styles.columnTitle}>{title}</p>
      <div className={styles.columnTotal}>
        <p className={styles.totalLabel}>総負担（税＋社保）</p>
        <p className={styles.totalAmount}>{formatYen(totalBurden)}</p>
      </div>
      <div className={styles.breakdown}>{children}</div>
      <div className={styles.takeHome}>
        <p className={styles.takeHomeLabel}>手取り</p>
        <p className={`${styles.takeHomeAmount} ${disposableIncome >= 0 ? styles.takeHomePositive : styles.takeHomeNegative}`}>
          {formatYen(disposableIncome)}
        </p>
      </div>
    </div>
  );
}

function Row({ label, amount }: { label: string; amount: number }) {
  return (
    <div className={styles.breakdownRow}>
      <span>{label}</span>
      <span className={styles.breakdownAmount}>{formatYen(amount)}</span>
    </div>
  );
}

function DifferenceBar({ soleProprietorBurden, incorporationBurden }: { soleProprietorBurden: number; incorporationBurden: number }) {
  const diff = soleProprietorBurden - incorporationBurden;

  if (diff === 0) {
    return (
      <div className={`${styles.differenceBar} ${styles.differenceNeutral}`}>
        <p className={`${styles.differenceText} ${styles.differenceNeutralText}`}>負担額は同じです</p>
      </div>
    );
  }

  const isBetter = diff > 0;

  return (
    <div className={`${styles.differenceBar} ${isBetter ? styles.differenceBetter : styles.differenceWorse}`}>
      <p className={`${styles.differenceText} ${isBetter ? styles.differenceBetterText : styles.differenceWorseText}`}>
        法人化で年間 {formatYen(Math.abs(diff))} {isBetter ? 'お得' : '負担増'}
      </p>
    </div>
  );
}

export function IncorporationComparison({ input, result, params }: Props) {
  const [open, setOpen] = useState(false);
  const [officerCompensation, setOfficerCompensation] = useState(300000);
  const [additionalCosts, setAdditionalCosts] = useState(0);
  const [capitalRange, setCapitalRange] = useState('under10m');

  const incResult: IncorporationResult = useMemo(
    () =>
      calcIncorporation(
        {
          businessProfit: result.businessIncome,
          officerCompensation,
          additionalCosts,
          capitalRange,
          age: input.age,
          iDeCoContribution: input.iDeCoContribution,
          smallBusinessMutualAid: input.smallBusinessMutualAid,
          dependentCount: input.dependentCount,
          spouseDeduction: input.spouseDeduction,
          lifeInsuranceDeduction: input.lifeInsuranceDeduction,
          medicalExpenseDeduction: input.medicalExpenseDeduction,
        },
        params,
      ),
    [
      result.businessIncome,
      officerCompensation,
      additionalCosts,
      capitalRange,
      input.age,
      input.iDeCoContribution,
      input.smallBusinessMutualAid,
      input.dependentCount,
      input.spouseDeduction,
      input.lifeInsuranceDeduction,
      input.medicalExpenseDeduction,
      params,
    ],
  );

  const soleProprietorBurden = result.totalTax + result.totalSocialInsurance;
  const soleProprietorDisposable = result.businessIncome - soleProprietorBurden - result.savingsDeduction;

  return (
    <section className={styles.section}>
      <button
        onClick={() => setOpen(!open)}
        className={styles.toggle}
        aria-expanded={open}
        type="button"
      >
        <span className={open ? styles.toggleIconOpen : styles.toggleIcon}>▶</span>
        <span>法人成りと比較</span>
      </button>

      {open && (
        <div className={styles.wideWrapper}>
          <div className={styles.content}>
            <div className={styles.inputs}>
              <div className={styles.sliderGroup}>
                <div className={styles.sliderHeader}>
                  <span className={styles.sliderLabel}>役員報酬（月額）</span>
                  <span className={styles.sliderValue}>{formatYen(officerCompensation)}</span>
                </div>
                <input
                  type="range"
                  className={styles.slider}
                  min={0}
                  max={1500000}
                  step={10000}
                  value={officerCompensation}
                  onChange={(e) => setOfficerCompensation(Number(e.target.value))}
                  aria-label="役員報酬（月額）"
                />
              </div>
              <div className={styles.inputRow}>
                <NumberInput
                  label="追加コスト（税理士報酬等・年額）"
                  value={additionalCosts}
                  onChange={setAdditionalCosts}
                  suffix="円"
                  max={MAX_AMOUNT}
                />
                <div className={styles.field}>
                  <label className={styles.fieldLabel} htmlFor="capitalRange">資本金</label>
                  <select
                    id="capitalRange"
                    value={capitalRange}
                    onChange={(e) => setCapitalRange(e.target.value)}
                  >
                    {capitalRangeOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className={styles.comparison}>
              <ComparisonColumn
                title="個人事業のまま"
                totalBurden={soleProprietorBurden}
                disposableIncome={soleProprietorDisposable}
              >
                <Row label="所得税＋復興特別所得税" amount={result.incomeTax.totalIncomeTax} />
                <Row label="住民税" amount={result.residentTax.totalResidentTax} />
                <Row label="個人事業税" amount={result.businessTax.totalBusinessTax} />
                {result.consumptionTax.isTaxable && (
                  <Row label="消費税" amount={result.consumptionTax.appliedAmount} />
                )}
                <Row label="国民年金" amount={result.socialInsurance.nationalPension.annualAmount} />
                <Row label="国民健康保険" amount={result.socialInsurance.nhi.totalNHI} />
              </ComparisonColumn>

              <ComparisonColumn
                title="法人成りした場合"
                totalBurden={incResult.totalBurden}
                disposableIncome={incResult.disposableIncome}
              >
                <Row label="法人税" amount={incResult.corporateSide.corporateTax} />
                <Row label="地方法人税" amount={incResult.corporateSide.localCorporateTax} />
                <Row label="法人住民税（税割）" amount={incResult.corporateSide.residentTaxLevy} />
                <Row label="法人住民税（均等割）" amount={incResult.corporateSide.residentPerCapita} />
                <Row label="法人事業税" amount={incResult.corporateSide.enterpriseTax} />
                <Row label="特別法人事業税" amount={incResult.corporateSide.specialEnterpriseTax} />
                <Row label="社保・会社負担" amount={incResult.corporateSide.socialInsurance} />
                {incResult.corporateSide.additionalCosts > 0 && (
                  <Row label="追加コスト" amount={incResult.corporateSide.additionalCosts} />
                )}
                <Row label="個人 所得税" amount={incResult.individualSide.incomeTax.totalIncomeTax} />
                <Row label="個人 住民税" amount={incResult.individualSide.residentTax.totalResidentTax} />
                <Row label="社保・本人負担" amount={incResult.individualSide.socialInsurance} />
              </ComparisonColumn>
            </div>

            <DifferenceBar
              soleProprietorBurden={soleProprietorBurden}
              incorporationBurden={incResult.totalBurden}
            />

            <p className={styles.disclaimer}>
              ※ この比較は簡易モデルです。退職金活用・消費税免税期間・配偶者役員・社会保険の標準報酬月額テーブル等は考慮していません。実際の法人化判断は税理士にご相談ください。
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

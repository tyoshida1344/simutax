import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { SimulatorResult, IncorporationResult } from '../../data/types';
import { formatYen } from '../format';
import styles from '../styles/BreakdownFlow.module.css';

interface Props {
  result: SimulatorResult;
  incorporationResult?: IncorporationResult | null;
}

function BreakdownRow({
  label,
  amount,
  prefix,
  bold,
  deduction,
  expandable,
  children,
}: {
  label: string;
  amount: number;
  prefix?: string;
  bold?: boolean;
  deduction?: boolean;
  expandable?: boolean;
  children?: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);

  const rowClass = bold
    ? styles.rowBold
    : expandable
      ? styles.rowExpandable
      : styles.row;

  const amountClass = bold
    ? styles.rowAmountBold
    : deduction
      ? styles.rowAmountDeduction
      : styles.rowAmount;

  const handleKeyDown = expandable
    ? (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setExpanded(!expanded);
        }
      }
    : undefined;

  return (
    <div>
      <div
        onClick={expandable ? () => setExpanded(!expanded) : undefined}
        onKeyDown={handleKeyDown}
        className={rowClass}
        role={expandable ? 'button' : undefined}
        tabIndex={expandable ? 0 : undefined}
        aria-expanded={expandable ? expanded : undefined}
      >
        <span className={styles.rowLabel}>
          {expandable && (
            <span className={expanded ? styles.expandIconOpen : styles.expandIcon}>
              ▶
            </span>
          )}
          {label}
        </span>
        <span className={amountClass}>
          {prefix}{formatYen(amount)}
        </span>
      </div>
      {expanded && children && (
        <div className={styles.subRows}>
          {children}
        </div>
      )}
    </div>
  );
}

function SubRow({ label, amount, linkTo }: { label: string; amount: number; linkTo?: string }) {
  return (
    <div className={styles.subRow}>
      {linkTo ? (
        <Link to={linkTo} className={styles.subRowLink}>{label}</Link>
      ) : (
        <span>{label}</span>
      )}
      <span className={styles.subRowAmount}>{formatYen(amount)}</span>
    </div>
  );
}

export function BreakdownFlow({ result, incorporationResult }: Props) {
  if (incorporationResult) {
    const inc = incorporationResult;
    const totalSI = inc.corporateSide.socialInsurance + inc.individualSide.socialInsurance;
    const disposable = inc.disposableIncome - result.savingsDeduction;

    return (
      <section className={styles.section}>
        <p className={styles.sectionLabel}>内訳</p>
        <BreakdownRow label="年間売上" amount={result.revenue} />
        <BreakdownRow label="経費" amount={result.expenses} prefix="− " deduction />
        <BreakdownRow label="法人の税金" amount={inc.corporateSide.totalCorporateTax} prefix="− " deduction expandable>
          <SubRow label="法人税" amount={inc.corporateSide.corporateTax} />
          <SubRow label="地方法人税" amount={inc.corporateSide.localCorporateTax} />
          <SubRow label="法人住民税（税割）" amount={inc.corporateSide.residentTaxLevy} />
          <SubRow label="法人住民税（均等割）" amount={inc.corporateSide.residentPerCapita} />
          <SubRow label="法人事業税" amount={inc.corporateSide.enterpriseTax} />
          <SubRow label="特別法人事業税" amount={inc.corporateSide.specialEnterpriseTax} />
        </BreakdownRow>
        <BreakdownRow label="個人の税金" amount={inc.individualSide.totalIndividualTax} prefix="− " deduction expandable>
          <SubRow label="所得税＋復興特別所得税" amount={inc.individualSide.incomeTax.totalIncomeTax} linkTo="/learn/income-tax" />
          <SubRow label="住民税" amount={inc.individualSide.residentTax.totalResidentTax} linkTo="/learn/resident-tax" />
        </BreakdownRow>
        <BreakdownRow label="社会保険料" amount={totalSI} prefix="− " deduction expandable>
          <SubRow label="会社負担" amount={inc.corporateSide.socialInsurance} />
          <SubRow label="本人負担" amount={inc.individualSide.socialInsurance} />
        </BreakdownRow>
        {inc.corporateSide.additionalCosts > 0 && (
          <BreakdownRow label="追加コスト" amount={inc.corporateSide.additionalCosts} prefix="− " deduction />
        )}
        {result.savingsDeduction > 0 && (
          <BreakdownRow label="積立（iDeCo・共済）" amount={result.savingsDeduction} prefix="− " deduction />
        )}
        <BreakdownRow label="自由に使えるお金" amount={disposable} bold />
        <LearnLink />
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <p className={styles.sectionLabel}>内訳</p>
      <BreakdownRow label="年間売上" amount={result.revenue} />
      <BreakdownRow label="経費" amount={result.expenses} prefix="− " deduction />
      <BreakdownRow label="税金" amount={result.totalTax} prefix="− " deduction expandable>
        <SubRow label="所得税＋復興特別所得税" amount={result.incomeTax.totalIncomeTax} linkTo="/learn/income-tax" />
        <SubRow label="住民税" amount={result.residentTax.totalResidentTax} linkTo="/learn/resident-tax" />
        <SubRow label="個人事業税" amount={result.businessTax.totalBusinessTax} linkTo="/learn/business-tax" />
        {result.consumptionTax.isTaxable && (
          <SubRow label="消費税" amount={result.consumptionTax.appliedAmount} linkTo="/learn/consumption-tax" />
        )}
      </BreakdownRow>
      <BreakdownRow label="社会保険料" amount={result.totalSocialInsurance} prefix="− " deduction expandable>
        <SubRow label="国民年金" amount={result.socialInsurance.nationalPension.annualAmount} linkTo="/learn/social-insurance" />
        <SubRow label="国民健康保険" amount={result.socialInsurance.nhi.totalNHI} linkTo="/learn/social-insurance" />
      </BreakdownRow>
      {result.savingsDeduction > 0 && (
        <BreakdownRow label="積立（iDeCo・共済）" amount={result.savingsDeduction} prefix="− " deduction />
      )}
      <BreakdownRow label="自由に使えるお金" amount={result.disposableIncome} bold />
      <LearnLink />
    </section>
  );
}

function LearnLink() {
  return (
    <Link to="/learn" className={styles.learnLink}>
      計算のしくみを見る →
    </Link>
  );
}

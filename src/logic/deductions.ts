import type {
  FilingType,
  BlueReturnDeductions,
  BasicDeductionBracket,
  IncomeTaxParams,
  ResidentTaxParams,
} from '../data/types';

/**
 * 申告区分に対応する青色申告特別控除額を返す。
 * @param filingType 申告区分（blue65 / blue55 / blue10 / white）
 * @param table 申告区分ごとの控除額テーブル
 * @returns 青色申告特別控除額（白色申告の場合は0）
 */
export function getBlueReturnDeduction(
  filingType: FilingType,
  table: BlueReturnDeductions,
): number {
  return table[filingType];
}

/**
 * 合計所得金額に応じた所得税の基礎控除額を返す（令和8年二層構造対応）。
 * @param totalIncome 合計所得金額
 * @param brackets 所得帯ごとの基礎控除額テーブル（昇順）
 * @returns 基礎控除額（2500万超は0）
 */
export function getIncomeTaxBasicDeduction(
  totalIncome: number,
  brackets: BasicDeductionBracket[],
): number {
  for (const b of brackets) {
    if (b.totalIncomeUpperLimit === null || totalIncome <= b.totalIncomeUpperLimit) {
      return b.amount;
    }
  }
  return 0;
}

/**
 * 住民税の基礎控除額を返す（所得によらず固定）。
 * @param params 住民税パラメータ
 * @returns 基礎控除額（43万円固定）
 */
export function getResidentTaxBasicDeduction(params: ResidentTaxParams): number {
  return params.basicDeduction;
}

export interface DeductionBreakdown {
  total: number;
  basicDeduction: number;
  socialInsuranceDeduction: number;
  smallBusinessDeduction: number;
  dependentDeduction: number;
  spouseDeduction: number;
  lifeInsuranceDeduction: number;
  medicalExpenseDeduction: number;
}

/**
 * 所得控除の合計と内訳を計算する共通ロジック。
 * 所得税・住民税で異なる基礎控除額・扶養控除額・配偶者控除額は呼び出し側から注入する。
 * @returns 所得控除の合計額と各控除の内訳
 */
function calcDeductions(
  basicDeduction: number,
  socialInsuranceAmount: number,
  iDeCo: number,
  smallBusinessMutualAid: number,
  dependentCount: number,
  hasSpouse: boolean,
  dependentAmount: number,
  spouseAmount: number,
  lifeInsurance: number,
  medicalExpense: number,
): DeductionBreakdown {
  const smallBusinessDeduction = iDeCo + smallBusinessMutualAid;
  const dependentDeduction = dependentCount * dependentAmount;
  const spouseDeduction = hasSpouse ? spouseAmount : 0;

  const total =
    basicDeduction +
    socialInsuranceAmount +
    smallBusinessDeduction +
    dependentDeduction +
    spouseDeduction +
    lifeInsurance +
    medicalExpense;

  return {
    total,
    basicDeduction,
    socialInsuranceDeduction: socialInsuranceAmount,
    smallBusinessDeduction,
    dependentDeduction,
    spouseDeduction,
    lifeInsuranceDeduction: lifeInsurance,
    medicalExpenseDeduction: medicalExpense,
  };
}

/**
 * 所得税用の所得控除合計と内訳を計算する。
 * 基礎控除は合計所得に応じた逓減テーブルから決定する。
 * @param totalIncome 合計所得金額
 * @param params 所得税パラメータ（基礎控除テーブル・扶養控除額・配偶者控除額を含む）
 * @param socialInsuranceAmount 社会保険料控除額
 * @param iDeCo iDeCo掛金（小規模企業共済等掛金控除の一部）
 * @param smallBusinessMutualAid 小規模企業共済掛金
 * @param dependentCount 扶養親族の人数
 * @param hasSpouse 配偶者控除の適用有無
 * @param lifeInsurance 生命保険料控除額
 * @param medicalExpense 医療費控除額
 * @returns 所得税用の所得控除合計額と各控除の内訳
 */
export function calcDeductionsForIncomeTax(
  totalIncome: number,
  params: IncomeTaxParams,
  socialInsuranceAmount: number,
  iDeCo: number,
  smallBusinessMutualAid: number,
  dependentCount: number,
  hasSpouse: boolean,
  lifeInsurance: number,
  medicalExpense: number,
): DeductionBreakdown {
  return calcDeductions(
    getIncomeTaxBasicDeduction(totalIncome, params.basicDeduction),
    socialInsuranceAmount,
    iDeCo,
    smallBusinessMutualAid,
    dependentCount,
    hasSpouse,
    params.dependentDeduction,
    params.spouseDeduction,
    lifeInsurance,
    medicalExpense,
  );
}

/**
 * 住民税用の所得控除合計と内訳を計算する。
 * 基礎控除は所得によらず固定額。扶養控除・配偶者控除は所得税と異なる金額を適用する。
 * @param params 住民税パラメータ（基礎控除額・扶養控除額・配偶者控除額を含む）
 * @param socialInsuranceAmount 社会保険料控除額
 * @param iDeCo iDeCo掛金（小規模企業共済等掛金控除の一部）
 * @param smallBusinessMutualAid 小規模企業共済掛金
 * @param dependentCount 扶養親族の人数
 * @param hasSpouse 配偶者控除の適用有無
 * @param lifeInsurance 生命保険料控除額
 * @param medicalExpense 医療費控除額
 * @returns 住民税用の所得控除合計額と各控除の内訳
 */
export function calcDeductionsForResidentTax(
  params: ResidentTaxParams,
  socialInsuranceAmount: number,
  iDeCo: number,
  smallBusinessMutualAid: number,
  dependentCount: number,
  hasSpouse: boolean,
  lifeInsurance: number,
  medicalExpense: number,
): DeductionBreakdown {
  return calcDeductions(
    getResidentTaxBasicDeduction(params),
    socialInsuranceAmount,
    iDeCo,
    smallBusinessMutualAid,
    dependentCount,
    hasSpouse,
    params.dependentDeduction,
    params.spouseDeduction,
    lifeInsurance,
    medicalExpense,
  );
}

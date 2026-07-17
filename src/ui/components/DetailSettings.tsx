import { useMemo, useState } from 'react';
import type { SimulatorInput, SimulatorResult } from '../../data/types';
import { NumberInput } from './NumberInput';
import { Modal } from './Modal';
import { ConsumptionTaxComparison } from './ConsumptionTaxComparison';
import { MAX_AMOUNT, MAX_PEOPLE, MAX_PERCENT } from '../constants';
import styles from '../styles/DetailSettings.module.css';

interface Props {
  input: SimulatorInput;
  result: SimulatorResult;
  updateField: <K extends keyof SimulatorInput>(field: K, value: SimulatorInput[K]) => void;
}

const purchaseCategories = [
  { key: 'materials', label: '仕入・材料費' },
  { key: 'outsourcing', label: '外注費' },
  { key: 'communication', label: '通信費' },
  { key: 'supplies', label: '消耗品費' },
  { key: 'transportation', label: '交通費・旅費' },
  { key: 'rent', label: '家賃（事務所）' },
  { key: 'utilities', label: '水道光熱費' },
  { key: 'other', label: 'その他の課税仕入' },
];

const defaultBreakdown: Record<string, number> = Object.fromEntries(
  purchaseCategories.map((c) => [c.key, 0]),
);

const businessTypeOptions = [
  { value: 'type1', label: '一般的な事業（物品販売・飲食・IT等）' },
  { value: 'type3_3pct', label: '施術業（あん摩・鍼灸等）' },
  { value: 'exempt', label: '文筆業・漫画家・音楽家・農業等' },
];

const capitalRangeOptions = [
  { value: 'under10m', label: '1,000万円以下' },
  { value: 'under100m', label: '1,000万円超〜1億円以下' },
  { value: 'under1b', label: '1億円超〜10億円以下' },
];

function AccordionGroup({
  label,
  defaultOpen,
  extra,
  children,
}: {
  label: string;
  defaultOpen?: boolean;
  extra?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);

  return (
    <div className={styles.group}>
      <div className={styles.groupHeader}>
        <button
          onClick={() => setOpen(!open)}
          className={styles.groupToggle}
          aria-expanded={open}
          type="button"
        >
          <span className={open ? styles.groupIconOpen : styles.groupIcon}>▶</span>
          <span className={styles.groupLabel}>{label}</span>
        </button>
        {extra}
      </div>
      {open && (
        <div className={styles.groupContent}>
          {children}
        </div>
      )}
    </div>
  );
}

function BusinessTypeInfo({ onClose }: { onClose: () => void }) {
  return (
    <Modal title="事業税の業種分類" onClose={onClose}>
      <div className={styles.popoverSection}>
        <p className={styles.popoverCategory}>一般的な事業（税率5%）</p>
        <p className={styles.popoverDetail}>
          物品販売業 / 製造業 / 請負業 / 飲食店業 / 不動産貸付業 / 運送業 / 広告業 / 出版業 / 写真業 / 旅館業 / 周旋業 / 代理業 / 仲立業 / 問屋業 / 印刷業 / デザイン業 / コンサルタント業 / IT関連業 など
        </p>
        <p className={styles.popoverNote}>※ 第1種事業（37業種）および第3種事業の大部分が該当</p>
      </div>
      <div className={styles.popoverSection}>
        <p className={styles.popoverCategory}>施術業（税率3%）</p>
        <p className={styles.popoverDetail}>
          あん摩マッサージ指圧業 / はり業 / きゅう業 / 柔道整復業 / その他の医業に類する事業
        </p>
        <p className={styles.popoverNote}>※ 医師・歯科医師・薬剤師等は上記「一般的な事業」（税率5%）に該当します</p>
      </div>
      <div className={styles.popoverSection}>
        <p className={styles.popoverCategory}>非課税の業種</p>
        <p className={styles.popoverDetail}>
          文筆業（作家・ライター）/ 漫画家 / 画家 / 音楽家 / スポーツ選手 / 芸能人 / 農業 / 林業 など
        </p>
        <p className={styles.popoverNote}>※ 上記の法定70業種に含まれない事業が該当</p>
      </div>
      <p className={styles.popoverLinks}>
        詳細は<a href="https://www.tax.metro.tokyo.lg.jp/kazei/work/kojin_ji#:~:text=%E4%B8%80%E8%A6%A7%E3%81%B8%E6%88%BB%E3%82%8B-,%EF%BC%94%20%E6%B3%95%E5%AE%9A%E6%A5%AD%E7%A8%AE%E3%81%A8%E7%A8%8E%E7%8E%87,-%E5%8C%BA%E5%88%86" target="_blank" rel="noopener noreferrer" className={styles.popoverLink}>東京都主税局のページ</a>を参照
      </p>
    </Modal>
  );
}

export function DetailSettings({ input, result, updateField }: Props) {
  const [open, setOpen] = useState(false);
  const [showBusinessTypeInfo, setShowBusinessTypeInfo] = useState(false);
  const [showPurchaseCalculator, setShowPurchaseCalculator] = useState(false);
  const [purchaseBreakdown, setPurchaseBreakdown] = useState(defaultBreakdown);
  const purchaseTotal = useMemo(() => Object.values(purchaseBreakdown).reduce((sum, v) => sum + v, 0), [purchaseBreakdown]);

  return (
    <section className={styles.section}>
      <button
        onClick={() => setOpen(!open)}
        className={styles.toggle}
        aria-expanded={open}
        type="button"
      >
        <span className={open ? styles.toggleIconOpen : styles.toggleIcon}>▶</span>
        <span>詳細設定</span>
      </button>

      {open && (
        <div className={styles.content}>
          <AccordionGroup
            label="事業の種類"
            defaultOpen
            extra={
              <button
                className={styles.infoLink}
                onClick={() => setShowBusinessTypeInfo(true)}
                type="button"
              >
                業種分類について
              </button>
            }
          >
            <select
              value={input.businessType}
              onChange={(e) => updateField('businessType', e.target.value)}
            >
              {businessTypeOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            {showBusinessTypeInfo && (
              <BusinessTypeInfo onClose={() => setShowBusinessTypeInfo(false)} />
            )}
          </AccordionGroup>

          <AccordionGroup label="所得控除">
            <NumberInput
              label="iDeCo（年額）"
              value={input.iDeCoContribution}
              onChange={(v) => updateField('iDeCoContribution', v)}
              suffix="円"
              max={MAX_AMOUNT}
            />
            <NumberInput
              label="小規模企業共済（年額）"
              value={input.smallBusinessMutualAid}
              onChange={(v) => updateField('smallBusinessMutualAid', v)}
              suffix="円"
              max={MAX_AMOUNT}
            />
            <NumberInput
              label="扶養親族の人数"
              value={input.dependentCount}
              onChange={(v) => updateField('dependentCount', v)}
              suffix="人"
              max={MAX_PEOPLE}
            />
            <div className={styles.checkboxRow}>
              <input
                type="checkbox"
                id="spouse"
                checked={input.spouseDeduction}
                onChange={(e) => updateField('spouseDeduction', e.target.checked)}
              />
              <label htmlFor="spouse" className={styles.checkboxLabel}>
                配偶者控除を適用
              </label>
            </div>
            <NumberInput
              label="生命保険料控除"
              value={input.lifeInsuranceDeduction}
              onChange={(v) => updateField('lifeInsuranceDeduction', v)}
              suffix="円"
              max={MAX_AMOUNT}
            />
            <NumberInput
              label="医療費控除"
              value={input.medicalExpenseDeduction}
              onChange={(v) => updateField('medicalExpenseDeduction', v)}
              suffix="円"
              max={MAX_AMOUNT}
            />
          </AccordionGroup>

          <AccordionGroup label="国民健康保険">
            <div className={styles.checkboxRow}>
              <input
                type="checkbox"
                id="nursingCareAge"
                checked={input.age >= 40 && input.age <= 64}
                onChange={(e) => updateField('age', e.target.checked ? 45 : 35)}
              />
              <label htmlFor="nursingCareAge" className={styles.checkboxLabel}>
                40〜64歳である（介護分が加算されます）
              </label>
            </div>
            <NumberInput
              label="国保の加入人数（世帯）"
              value={input.householdMembers}
              onChange={(v) => updateField('householdMembers', v)}
              suffix="人"
              min={1}
              max={MAX_PEOPLE}
            />
          </AccordionGroup>

          <AccordionGroup label="消費税">
            <div className={styles.field}>
              <label className={styles.label} htmlFor="basePeriodSales">基準期間の課税売上高（2年前）</label>
              <select
                id="basePeriodSales"
                value={input.basePeriodSales}
                onChange={(e) => updateField('basePeriodSales', e.target.value as 'under10m' | 'over10m' | 'over50m')}
              >
                <option value="under10m">1,000万円以下</option>
                <option value="over10m">1,000万円超〜5,000万円以下</option>
                <option value="over50m">5,000万円超</option>
              </select>
            </div>
            <div className={styles.checkboxRow}>
              <input
                type="checkbox"
                id="invoiceRegistered"
                checked={input.invoiceRegistered}
                onChange={(e) => updateField('invoiceRegistered', e.target.checked)}
              />
              <label htmlFor="invoiceRegistered" className={styles.checkboxLabel}>
                インボイス発行事業者
              </label>
            </div>
            <div className={styles.fieldWithExtra}>
              <NumberInput
                label="課税仕入の割合"
                value={input.expenses > 0 ? Math.min(Math.round(input.taxablePurchaseAmount / input.expenses * 100), 100) : 0}
                onChange={(v) => updateField('taxablePurchaseAmount', Math.floor(input.expenses * v / 100))}
                suffix="%"
                max={MAX_PERCENT}
              />
              <button
                className={`${styles.infoLink} ${styles.fieldExtra}`}
                onClick={() => setShowPurchaseCalculator(true)}
                type="button"
              >
                計算する
              </button>
            </div>
            {showPurchaseCalculator && (
              <Modal title="課税仕入額の計算" onClose={() => setShowPurchaseCalculator(false)}>
                <p className={styles.popoverNote}>
                  経費のうち消費税がかかっている取引の金額を入力してください
                </p>
                <div className={styles.calculatorBody}>
                  {purchaseCategories.map((cat) => (
                    <NumberInput
                      key={cat.key}
                      label={cat.label}
                      value={purchaseBreakdown[cat.key]}
                      onChange={(v) => setPurchaseBreakdown((prev) => ({ ...prev, [cat.key]: v }))}
                      suffix="円"
                      max={MAX_AMOUNT}
                    />
                  ))}
                </div>
                <div className={styles.calculatorFooter}>
                  <span className={styles.calculatorTotal}>
                    合計: ¥{purchaseTotal.toLocaleString()}
                  </span>
                  <button
                    className={styles.applyButton}
                    type="button"
                    onClick={() => {
                      updateField('taxablePurchaseAmount', Math.min(purchaseTotal, input.expenses));
                      setShowPurchaseCalculator(false);
                    }}
                  >
                    反映して閉じる
                  </button>
                </div>
              </Modal>
            )}
            <ConsumptionTaxComparison
              result={result.consumptionTax}
              updateField={updateField}
            />
          </AccordionGroup>

          <AccordionGroup label="法人">
            <div className={styles.checkboxRow}>
              <input
                type="checkbox"
                id="isIncorporation"
                checked={input.isIncorporation}
                onChange={(e) => updateField('isIncorporation', e.target.checked)}
              />
              <label htmlFor="isIncorporation" className={styles.checkboxLabel}>
                法人として計算する
              </label>
            </div>
            {input.isIncorporation && (
              <>
                <NumberInput
                  label="役員報酬（月額）"
                  value={input.officerCompensation}
                  onChange={(v) => updateField('officerCompensation', v)}
                  suffix="円"
                  max={MAX_AMOUNT}
                />
                <NumberInput
                  label="追加コスト（税理士報酬等・年額）"
                  value={input.incorporationAdditionalCosts}
                  onChange={(v) => updateField('incorporationAdditionalCosts', v)}
                  suffix="円"
                  max={MAX_AMOUNT}
                />
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="capitalRange">資本金</label>
                  <select
                    id="capitalRange"
                    value={input.capitalRange}
                    onChange={(e) => updateField('capitalRange', e.target.value)}
                  >
                    {capitalRangeOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </AccordionGroup>
        </div>
      )}
    </section>
  );
}

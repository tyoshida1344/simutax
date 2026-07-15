import { useState } from 'react';
import type { SimulatorInput, SimulatorResult } from '../../data/types';
import { NumberInput } from './NumberInput';
import { ConsumptionTaxComparison } from './ConsumptionTaxComparison';
import styles from '../styles/DetailSettings.module.css';

interface Props {
  input: SimulatorInput;
  result: SimulatorResult;
  updateField: <K extends keyof SimulatorInput>(field: K, value: SimulatorInput[K]) => void;
}

const businessTypeOptions = [
  { value: 'type1', label: '一般的な事業（物品販売・飲食・IT等）' },
  { value: 'type3_3pct', label: '施術業（あん摩・鍼灸等）' },
  { value: 'exempt', label: '文筆業・漫画家・音楽家・農業等' },
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
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popover} onClick={(e) => e.stopPropagation()}>
        <button className={styles.popoverClose} onClick={onClose} type="button" aria-label="閉じる">
          ×
        </button>
        <p className={styles.popoverTitle}>事業税の業種分類</p>
        <div className={styles.popoverSection}>
          <p className={styles.popoverCategory}>一般的な事業（税率5%）</p>
          <p className={styles.popoverDetail}>
            物品販売業 / 製造業 / 請負業 / 飲食店業 / 不動産貸付業 / 運送業 / 広告業 / 出版業 / 写真業 / 旅館業 / 周旋業 / 代理業 / 仲立業 / 問屋業 / 印刷業 / デザイン業 / コンサルタント業 / IT関連業 など
          </p>
          <p className={styles.popoverNote}>
            ※ 第1種事業（37業種）および第3種事業の大部分が該当（
            <a href="https://www.tax.metro.tokyo.lg.jp/kazei/work/kojin_ji" target="_blank" rel="noopener noreferrer" className={styles.popoverLink}>全業種一覧 - 東京都主税局</a>
            ）
          </p>
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
          <p className={styles.popoverNote}>
            ※ 上記の法定70業種に含まれない事業が該当（
            <a href="https://www.soumu.go.jp/main_sosiki/jichi_zeisei/czaisei/czaisei_seido/150790_07.html" target="_blank" rel="noopener noreferrer" className={styles.popoverLink}>個人事業税の概要 - 総務省</a>
            ）
          </p>
        </div>
      </div>
    </div>
  );
}

export function DetailSettings({ input, result, updateField }: Props) {
  const [open, setOpen] = useState(false);
  const [showBusinessTypeInfo, setShowBusinessTypeInfo] = useState(false);

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
            />
            <NumberInput
              label="小規模企業共済（年額）"
              value={input.smallBusinessMutualAid}
              onChange={(v) => updateField('smallBusinessMutualAid', v)}
              suffix="円"
            />
            <NumberInput
              label="扶養親族の人数"
              value={input.dependentCount}
              onChange={(v) => updateField('dependentCount', v)}
              suffix="人"
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
            />
            <NumberInput
              label="医療費控除"
              value={input.medicalExpenseDeduction}
              onChange={(v) => updateField('medicalExpenseDeduction', v)}
              suffix="円"
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
              onChange={(v) => updateField('householdMembers', Math.max(1, v))}
              suffix="人"
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
            <NumberInput
              label="課税仕入の割合"
              value={input.taxablePurchaseRatio}
              onChange={(v) => updateField('taxablePurchaseRatio', Math.min(100, v))}
              suffix="%"
            />
            <ConsumptionTaxComparison
              result={result.consumptionTax}
              updateField={updateField}
            />
          </AccordionGroup>
        </div>
      )}
    </section>
  );
}

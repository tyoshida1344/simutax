import type { SimulatorInput, SimulatorResult, TaxParams } from '../data/types';
import type { StepFlowStep } from '../ui/components/StepFlow';

export interface LearnTopic {
  id: string;
  title: string;
  description: string;
  introduction: string;
  getSteps: (input: SimulatorInput, result: SimulatorResult, params: TaxParams) => StepFlowStep[];
  getNotes: (params: TaxParams) => string[];
  relatedTerms: string[];
}

export const learnTopics: LearnTopic[] = [
  {
    id: 'income-tax',
    title: '所得税',
    description: 'フリーランスの所得にかかる国税',
    introduction:
      '所得税は、1年間の所得（もうけ）に対してかかる国税です。所得が多いほど税率が上がる「累進課税」方式で、税率は5%〜45%の7段階。東日本大震災の復興財源として、所得税額の2.1%が復興特別所得税として上乗せされます。',
    getSteps: (_input, result, _params) => [
      {
        label: '年間売上',
        value: result.revenue,
        connector: { operator: '−', label: '必要経費' },
      },
      {
        label: '事業所得',
        value: result.businessIncome,
        connector: { operator: '−', label: '青色申告特別控除' },
      },
      {
        label: '所得金額',
        value: result.totalIncome,
        connector: { operator: '−', label: '所得控除（基礎控除・社保控除等）' },
      },
      {
        label: '課税所得金額',
        value: result.incomeTax.taxableIncome,
        connector: { operator: '×', label: `税率${(result.incomeTax.appliedBracketRate * 100).toFixed(0)}% − 控除額` },
      },
      {
        label: '所得税＋復興特別所得税',
        value: result.incomeTax.totalIncomeTax,
        highlight: true,
      },
    ],
    getNotes: (params) => {
      const brackets = params.incomeTax.brackets;
      const lines = brackets.map((b) => {
        const upper = b.upperLimit ? `${(b.upperLimit / 10000).toLocaleString()}万円以下` : 'それ以上';
        return `${upper}: ${(b.rate * 100).toFixed(0)}%`;
      });
      return [
        `所得税の税率（${params.meta.eraYear}分）: ${lines.join(' / ')}`,
        `復興特別所得税: 所得税額 × ${(params.incomeTax.reconstructionSurtaxRate * 100).toFixed(1)}%（2037年まで）`,
      ];
    },
    relatedTerms: ['ruishin-kazei', 'kiso-koujo', 'kazei-shotoku', 'fukkou-tokubetsu-zei', 'aoiro-tokubetsu-koujo'],
  },
  {
    id: 'resident-tax',
    title: '住民税',
    description: '都道府県・市区町村に納める地方税',
    introduction:
      '住民税は、前年の所得をもとに都道府県と市区町村に納める地方税です。所得に応じた「所得割」（税率10%）と、所得に関係なく定額の「均等割」の合計で算出されます。所得税とは基礎控除額などが異なる点に注意が必要です。',
    getSteps: (_input, result, _params) => [
      {
        label: '所得金額',
        value: result.totalIncome,
        connector: { operator: '−', label: '所得控除（住民税用）' },
      },
      {
        label: '課税所得金額',
        value: result.residentTax.taxableIncome,
        connector: { operator: '×', label: '税率10%' },
      },
      {
        label: '所得割',
        value: result.residentTax.incomeLevy,
        connector: { operator: '+', label: '均等割' },
      },
      {
        label: '住民税',
        value: result.residentTax.totalResidentTax,
        highlight: true,
      },
    ],
    getNotes: (params) => [
      `所得割の税率: ${(params.residentTax.incomeRate * 100).toFixed(0)}%（市区町村6% + 道府県4%）`,
      `均等割: 年額${params.residentTax.perCapitaLevy.toLocaleString()}円（森林環境税を含む）`,
      `基礎控除: ${(params.residentTax.basicDeduction / 10000).toLocaleString()}万円（所得税とは異なり一律）`,
    ],
    relatedTerms: ['shotokuwari', 'kintouwari', 'kiso-koujo'],
  },
  {
    id: 'business-tax',
    title: '個人事業税',
    description: '一定の事業を営む個人にかかる地方税',
    introduction:
      '個人事業税は、法律で定められた業種の事業を営む個人事業主にかかる地方税です。事業所得から290万円の事業主控除を差し引いた金額に、業種ごとの税率（3%〜5%）を掛けて計算します。事業所得が290万円以下なら課税されません。',
    getSteps: (_input, result, _params) => [
      {
        label: '事業所得',
        value: result.businessTax.taxableIncome,
        connector: { operator: '−', label: '事業主控除' },
      },
      {
        label: '課税標準',
        value: result.businessTax.taxBase,
        connector: { operator: '×', label: `税率${(result.businessTax.rate * 100).toFixed(0)}%` },
      },
      {
        label: '個人事業税',
        value: result.businessTax.totalBusinessTax,
        highlight: true,
      },
    ],
    getNotes: (params) => [
      `事業主控除: 年額${(params.businessTax.businessOwnerDeduction / 10000).toLocaleString()}万円`,
      `税率: 業種により3%〜5%（大半の業種は5%）`,
      `非課税業種: 文筆業・漫画家・音楽家など`,
    ],
    relatedTerms: ['jigyounushi-koujo'],
  },
  {
    id: 'consumption-tax',
    title: '消費税',
    description: '商品・サービスの販売にかかる間接税',
    introduction:
      '消費税は、商品やサービスの販売時にかかる間接税です。フリーランスが課税事業者の場合、受け取った消費税から仕入れ等で支払った消費税を差し引いて納付します。計算方法は原則課税・簡易課税・2割特例の3つから選べます。',
    getSteps: (_input, result, params) => {
      const steps: StepFlowStep[] = [
        {
          label: '売上にかかる消費税',
          value: result.consumptionTax.salesTax,
          connector: { operator: '−', label: '仕入にかかる消費税' },
        },
      ];

      if (result.consumptionTax.standardMethod.applicable) {
        steps.push({
          label: '原則課税',
          value: result.consumptionTax.standardMethod.amount,
        });
      }
      if (result.consumptionTax.simplifiedMethod.applicable) {
        steps.push({
          label: `簡易課税（みなし仕入率${(params.consumptionTax.simplifiedCategories[params.consumptionTax.defaultSimplifiedCategory].deemedPurchaseRate * 100).toFixed(0)}%）`,
          value: result.consumptionTax.simplifiedMethod.amount,
        });
      }
      if (result.consumptionTax.special20Method.applicable) {
        steps.push({
          label: '2割特例',
          value: result.consumptionTax.special20Method.amount,
        });
      }

      if (result.consumptionTax.isTaxable) {
        steps.push({
          label: '納付する消費税',
          value: result.consumptionTax.appliedAmount,
          highlight: true,
        });
      }

      return steps;
    },
    getNotes: (params) => {
      const ct = params.consumptionTax;
      const years = ct.twentyPercentSpecialEligibleYears;
      return [
        `消費税率: ${(ct.taxRate * 100).toFixed(0)}%`,
        `免税事業者の基準: 基準期間の課税売上高${(ct.taxableThreshold / 10000).toLocaleString()}万円以下`,
        `簡易課税の適用条件: 基準期間の課税売上高${(ct.simplifiedThreshold / 10000).toLocaleString()}万円以下`,
        `2割特例: インボイス登録で新たに課税事業者になった場合に利用可能（${years[0]}〜${years[years.length - 1]}年分）`,
      ];
    },
    relatedTerms: ['invoice', 'kijun-kikan', 'minashi-shiirritsu', 'niwari-tokurei', 'kani-kazei'],
  },
  {
    id: 'social-insurance',
    title: '国保・国民年金',
    description: 'フリーランスが加入する公的保険制度',
    introduction:
      'フリーランスは国民健康保険と国民年金に加入します。国民年金は定額の保険料を毎月納付します。国民健康保険は前年の所得をもとに市区町村が算定し、医療分・後期高齢者支援金分・介護分の3区分で計算されます。',
    getSteps: (_input, result, params) => {
      const baseDeduction = params.socialInsurance.nationalHealthInsurance.baseDeduction;
      return [
        {
          label: `国民年金（月額${params.socialInsurance.nationalPension.monthlyAmount.toLocaleString()}円 × 12か月）`,
          value: result.socialInsurance.nationalPension.annualAmount,
        },
        {
          label: '所得金額',
          value: result.totalIncome,
          connector: { operator: '−', label: `基礎控除${(baseDeduction / 10000).toFixed(0)}万円` },
        },
        {
          label: '算定基礎額',
          value: Math.max(result.totalIncome - baseDeduction, 0),
          connector: { operator: '→', label: '各区分の所得割+均等割+世帯割' },
        },
        {
          label: '国民健康保険料',
          value: result.socialInsurance.nhi.totalNHI,
          highlight: true,
        },
      ];
    },
    getNotes: (params) => {
      const nhi = params.socialInsurance.nationalHealthInsurance.models['standard'];
      return [
        `国民年金保険料: 月額${params.socialInsurance.nationalPension.monthlyAmount.toLocaleString()}円（${params.meta.eraYear}度）`,
        `国保の賦課限度額: 医療分${(nhi.medical.cap / 10000).toLocaleString()}万円 + 後期高齢者支援金分${(nhi.elderlySupport.cap / 10000).toLocaleString()}万円 + 介護分${(nhi.nursingCare.cap / 10000).toLocaleString()}万円`,
        `介護分は40歳以上65歳未満の場合に加算`,
      ];
    },
    relatedTerms: ['kokumin-kenko-hoken', 'kokumin-nenkin', 'fuka-gendo-gaku'],
  },
];

export function getTopicById(id: string): LearnTopic | undefined {
  return learnTopics.find((t) => t.id === id);
}

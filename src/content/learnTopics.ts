import type { TaxParams } from '../data/types';

export interface NoteTable {
  type: 'table';
  title: string;
  headers: string[];
  rows: string[][];
}

export type NoteItem = string | NoteTable;

export interface TopicReference {
  label: string;
  url: string;
  description?: string;
}

export interface LearnTopic {
  id: string;
  title: string;
  description: string;
  introduction: string;
  getFormula: (params: TaxParams) => string[];
  getNotes: (params: TaxParams) => NoteItem[];
  references?: TopicReference[];
  relatedTerms: string[];
}

export const learnTopics: LearnTopic[] = [
  {
    id: 'income-tax',
    title: '所得税',
    description: 'フリーランスの所得にかかる国税',
    introduction:
      '所得税は、1年間の所得（もうけ）に対してかかる国税です。所得が多いほど税率が上がる「累進課税」方式で、税率は5%〜45%の7段階。東日本大震災の復興財源として、所得税額の2.1%が復興特別所得税として上乗せされます。',
    getFormula: () => [
      '売上 − 経費 − [[aoiro-tokubetsu-koujo|青色申告特別控除]] = ①',
      '① − [[kiso-koujo|基礎控除]]48万円 − [[shakai-hokenryou|社会保険料]]など = ②',
      '② × 税率（速算表で5〜45%）= 所得税',
    ],
    getNotes: (params) => {
      const brackets = params.incomeTax.brackets;
      return [
        {
          type: 'table',
          title: `所得税の速算表（${params.meta.eraYear}分）`,
          headers: ['課税所得金額', '税率', '控除額'],
          rows: brackets.map((b) => [
            b.upperLimit ? `${(b.upperLimit / 10000).toLocaleString()}万円以下` : `${(brackets[brackets.length - 2].upperLimit! / 10000).toLocaleString()}万円超`,
            `${(b.rate * 100).toFixed(0)}%`,
            `${b.deduction.toLocaleString()}円`,
          ]),
        },
        `復興特別所得税: 所得税額 × ${(params.incomeTax.reconstructionSurtaxRate * 100).toFixed(1)}%（2037年まで）`,
      ];
    },
    references: [
      { label: '所得税のしくみ（国税庁）', url: 'https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/2260.htm' },
      { label: '確定申告書等作成コーナー', url: 'https://www.keisan.nta.go.jp/kyoutu/ky/sm/top', description: 'e-Taxで確定申告書を作成・提出できる' },
      { label: '青色申告承認申請書の提出（国税庁）', url: 'https://www.nta.go.jp/taxes/tetsuzuki/shinsei/annai/shinkoku/annai/09.htm', description: '青色申告を始めるための届出' },
    ],
    relatedTerms: ['ruishin-kazei', 'kiso-koujo', 'kazei-shotoku', 'fukkou-tokubetsu-zei', 'aoiro-tokubetsu-koujo'],
  },
  {
    id: 'resident-tax',
    title: '住民税',
    description: '都道府県・市区町村に納める地方税',
    introduction:
      '住民税は、前年の所得をもとに都道府県と市区町村に納める地方税です。所得に応じた「所得割」（税率10%）と、所得に関係なく定額の「均等割」の合計で算出されます。所得税とは基礎控除額などが異なる点に注意が必要です。',
    getFormula: (params) => [
      '売上 − 経費 − [[aoiro-tokubetsu-koujo|青色控除]] − [[kiso-koujo|基礎控除]]43万円 − [[shakai-hokenryou|社会保険料]]など = ①',
      `① × ${(params.residentTax.incomeRate * 100).toFixed(0)}% + [[kintouwari|均等割]] = 住民税`,
    ],
    getNotes: (params) => [
      `所得割の税率: ${(params.residentTax.incomeRate * 100).toFixed(0)}%（市区町村6% + 道府県4%）`,
      `均等割: 年額${params.residentTax.perCapitaLevy.toLocaleString()}円（森林環境税を含む）`,
      `基礎控除: ${(params.residentTax.basicDeduction / 10000).toLocaleString()}万円（所得税とは異なり一律）`,
    ],
    references: [
      { label: '個人住民税のしくみ（総務省）', url: 'https://www.soumu.go.jp/main_sosiki/jichi_zeisei/czaisei/czaisei_seido/150790_06.html' },
    ],
    relatedTerms: ['shotokuwari', 'kintouwari', 'kiso-koujo'],
  },
  {
    id: 'business-tax',
    title: '個人事業税',
    description: '一定の事業を営む個人にかかる地方税',
    introduction:
      '個人事業税は、法律で定められた業種の事業を営む個人事業主にかかる地方税です。青色申告特別控除を適用する前の事業所得から290万円の事業主控除を差し引いた金額に、業種ごとの税率（3%〜5%）を掛けて計算します。事業所得が290万円以下なら課税されません。',
    getFormula: (params) => [
      `（売上 − 経費 − ${(params.businessTax.businessOwnerDeduction / 10000).toLocaleString()}万円）× 税率（3〜5%）= 個人事業税`,
      '※[[aoiro-tokubetsu-koujo|青色申告特別控除]]は差し引けない',
    ],
    getNotes: (params) => [
      `事業主控除: 年額${(params.businessTax.businessOwnerDeduction / 10000).toLocaleString()}万円`,
      `税率: 業種により3%〜5%（大半の業種は5%）`,
      `非課税業種: 文筆業・漫画家・音楽家など`,
    ],
    references: [
      { label: '個人事業税（東京都主税局）', url: 'https://www.tax.metro.tokyo.lg.jp/kazei/kojin_ji.html' },
    ],
    relatedTerms: ['jigyounushi-koujo'],
  },
  {
    id: 'consumption-tax',
    title: '消費税',
    description: '商品・サービスの販売にかかる間接税',
    introduction:
      '消費税は、商品やサービスの販売時にかかる間接税です。フリーランスが課税事業者の場合、受け取った消費税から仕入れ等で支払った消費税を差し引いて納付します。計算方法は原則課税・簡易課税・2割特例の3つから選べます。',
    getFormula: () => [
      '売上の消費税 = 税込売上 × 10/110',
      '原則課税: 売上の消費税 − 仕入で払った消費税',
      '簡易課税: 売上の消費税 ×（1 − [[minashi-shiirritsu|みなし仕入率]]）',
      '[[niwari-tokurei|2割特例]]: 売上の消費税 × 20%',
    ],
    getNotes: (params) => {
      const ct = params.consumptionTax;
      const years = ct.twentyPercentSpecialEligibleYears;
      const categories = Object.values(ct.simplifiedCategories);
      return [
        `消費税率: ${(ct.taxRate * 100).toFixed(0)}%`,
        `免税事業者の基準: 基準期間の課税売上高${(ct.taxableThreshold / 10000).toLocaleString()}万円以下`,
        {
          type: 'table',
          title: '簡易課税のみなし仕入率',
          headers: ['業種区分', 'みなし仕入率'],
          rows: categories.map((c) => [c.label, `${(c.deemedPurchaseRate * 100).toFixed(0)}%`]),
        },
        `簡易課税の適用条件: 基準期間の課税売上高${(ct.simplifiedThreshold / 10000).toLocaleString()}万円以下`,
        `2割特例: インボイス登録で新たに課税事業者になった場合に利用可能（${years[0]}〜${years[years.length - 1]}年分）`,
      ];
    },
    references: [
      { label: '消費税のしくみ（国税庁）', url: 'https://www.nta.go.jp/taxes/shiraberu/taxanswer/shohi/6505.htm' },
      { label: '簡易課税制度（国税庁）', url: 'https://www.nta.go.jp/taxes/shiraberu/taxanswer/shohi/6509.htm' },
    ],
    relatedTerms: ['invoice', 'kijun-kikan', 'minashi-shiirritsu', 'niwari-tokurei', 'kani-kazei'],
  },
  {
    id: 'invoice',
    title: 'インボイス制度',
    description: '適格請求書による仕入税額控除の仕組み',
    introduction:
      'インボイス制度（適格請求書等保存方式）は、消費税の仕入税額控除を受けるために「適格請求書（インボイス）」の保存を求める制度です。2023年10月に開始されました。登録するかどうかは「取引先が誰か」で判断します。取引先が企業（BtoB）なら、登録しないと取引先が消費税を余分に負担することになり、値下げや取引解消を求められるリスクがあります。取引先が一般消費者（BtoC）中心なら、登録しなくても実務上の影響は小さいです。',
    getFormula: () => [
      '登録した場合: 売上の消費税 × 20%（[[niwari-tokurei|2割特例]]）を納付',
      '登録しない場合: 消費税の納付は不要',
    ],
    getNotes: (params) => {
      const ct = params.consumptionTax;
      const years = ct.twentyPercentSpecialEligibleYears;
      return [
        {
          type: 'table',
          title: '取引先のタイプ別・登録の判断目安',
          headers: ['取引先', '登録の必要性', '理由'],
          rows: [
            ['企業（BtoB）が中心', '登録した方がよい', '未登録だと取引先が仕入税額控除できず、値下げ交渉や取引見直しの原因になる'],
            ['一般消費者（BtoC）が中心', '登録しなくてよい場合が多い', '消費者は仕入税額控除を使わないため、未登録でも取引に影響しにくい'],
            ['両方いる', 'BtoB取引の割合で判断', 'BtoB取引が売上の大部分なら登録を検討'],
          ],
        },
        {
          type: 'table',
          title: '登録する場合・しない場合の比較',
          headers: ['', '登録する', '登録しない'],
          rows: [
            ['消費税の納付', '必要', '不要'],
            ['インボイスの発行', 'できる', 'できない'],
            ['取引先の仕入税額控除', '全額控除可能', '控除不可'],
            ['2割特例の利用', `可能（${years[years.length - 1]}年分まで）`, '−'],
          ],
        },
        `登録した場合でも、2割特例を使えば売上税額の2割の納付で済む（${years[0]}〜${years[years.length - 1]}年分）。売上500万円（税込）なら年間約9万円の負担`,
        '登録の届出は「適格請求書発行事業者の登録申請書」を税務署に提出する（e-Taxでも可能）',
      ];
    },
    references: [
      { label: 'インボイス制度の概要（国税庁）', url: 'https://www.nta.go.jp/taxes/shiraberu/zeimokubetsu/shohi/keigenzeiritsu/invoice_about.htm' },
      { label: '適格請求書発行事業者の登録申請（e-Tax）', url: 'https://www.e-tax.nta.go.jp/invoice/index.htm', description: 'オンラインで登録申請ができる' },
      { label: '2割特例の概要（国税庁）', url: 'https://www.nta.go.jp/publication/pamph/shohi/kaisei/202308/01.htm', description: '新たに課税事業者になった場合の負担軽減措置' },
    ],
    relatedTerms: ['invoice', 'kijun-kikan', 'niwari-tokurei', 'kani-kazei', 'tekikaku-seikyusho'],
  },
  {
    id: 'social-insurance',
    title: '国保・国民年金',
    description: 'フリーランスが加入する公的保険制度',
    introduction:
      'フリーランスは国民健康保険と国民年金に加入します。国民年金は定額の保険料を毎月納付します。国民健康保険は前年の所得をもとに市区町村が算定し、医療分・後期高齢者支援金分・介護分の3区分で計算されます。',
    getFormula: (params) => [
      `（売上 − 経費 − [[aoiro-tokubetsu-koujo|青色控除]] − ${(params.socialInsurance.nationalHealthInsurance.baseDeduction / 10000).toFixed(0)}万円）× [[shotokuwari|所得割]]率 + [[kintouwari|均等割]] = 国保`,
      `国保 + 国民年金（月額${params.socialInsurance.nationalPension.monthlyAmount.toLocaleString()}円 × 12）= 社会保険料`,
    ],
    getNotes: (params) => {
      const nhi = params.socialInsurance.nationalHealthInsurance.models['standard'];
      return [
        `国民年金保険料: 月額${params.socialInsurance.nationalPension.monthlyAmount.toLocaleString()}円（${params.meta.eraYear}度）`,
        `国保の賦課限度額: 医療分${(nhi.medical.cap / 10000).toLocaleString()}万円 + 後期高齢者支援金分${(nhi.elderlySupport.cap / 10000).toLocaleString()}万円 + 介護分${(nhi.nursingCare.cap / 10000).toLocaleString()}万円`,
        `介護分は40歳以上65歳未満の場合に加算`,
      ];
    },
    references: [
      { label: '国民年金の届出・手続き（日本年金機構）', url: 'https://www.nenkin.go.jp/service/kokunen/kanyu/index.html', description: '加入手続き・保険料の納付方法' },
      { label: '国民健康保険の届出（各市区町村）', url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryouhoken/index.html', description: '退職後14日以内に届出が必要' },
    ],
    relatedTerms: ['kokumin-kenko-hoken', 'kokumin-nenkin', 'fuka-gendo-gaku'],
  },
  {
    id: 'withholding-tax',
    title: '源泉徴収',
    description: '報酬から天引きされる所得税の前払い',
    introduction:
      '源泉徴収とは、報酬を支払う側（クライアント）が、支払額から所得税分を差し引いて国に納付する仕組みです。フリーランスが受け取る報酬のうち、原稿料・デザイン料・コンサルティング料などの特定の報酬は源泉徴収の対象となります。天引きされた税額は確定申告で精算し、納めすぎた分は還付されます。',
    getFormula: () => [
      '1回の報酬 × 10.21% = 天引きされる額',
      '年間の天引き合計 − 確定した所得税 → 差額が還付 or 追加納付',
    ],
    getNotes: (params) => {
      const wt = params.withholdingTax;
      return [
        {
          type: 'table',
          title: '報酬に対する源泉徴収税率',
          headers: ['支払金額', '源泉徴収税額'],
          rows: wt.brackets.map((b) =>
            b.upperLimit
              ? [
                  `${(b.upperLimit / 10000).toLocaleString()}万円以下`,
                  `支払金額 × ${(b.rate * 100).toFixed(2)}%`,
                ]
              : [
                  `${(wt.brackets[0].upperLimit! / 10000).toLocaleString()}万円超`,
                  `(支払金額 − ${(wt.brackets[0].upperLimit! / 10000).toLocaleString()}万円) × ${(b.rate * 100).toFixed(2)}% + ${b.base.toLocaleString()}円`,
                ],
          ),
        },
        `税率には復興特別所得税（${(wt.reconstructionSurtaxRate * 100).toFixed(1)}%）が含まれている`,
        '源泉徴収の対象となる報酬: 原稿料、デザイン料、講演料、コンサルティング料、弁護士・税理士等の報酬など',
        '源泉徴収されない報酬: プログラミング、Web制作、物品販売など（業務委託契約の内容による）',
        '確定申告で源泉徴収額を申告すると、納めすぎた税金が還付される。経費が多い場合や各種控除を適用する場合は還付になることが多い',
      ];
    },
    references: [
      { label: '報酬等に対する源泉徴収（国税庁）', url: 'https://www.nta.go.jp/taxes/shiraberu/taxanswer/gensen/2795.htm' },
      { label: '源泉徴収税額表（国税庁）', url: 'https://www.nta.go.jp/publication/pamph/gensen/zeigakuhyo2024/02.htm', description: '報酬・料金等の源泉徴収税額の算出方法' },
    ],
    relatedTerms: ['gensen-choushu', 'gensen-choushu-hyou', 'kanpu-shinkoku'],
  },
  {
    id: 'ideco',
    title: 'iDeCo（個人型確定拠出年金）',
    description: '掛金が全額所得控除になる老後資金の積立制度',
    introduction:
      'iDeCo（個人型確定拠出年金）は、自分で掛金を出して運用し、老後資金を準備する私的年金制度です。掛金は全額が所得控除の対象となり、節税しながら将来に備えることができます。運用益も非課税で、受取時にも税制優遇があります。ただし原則60歳まで引き出せないため、手元資金に余裕がある場合に向いています。',
    getFormula: (params) => {
      const max = params.savingsDeduction.iDeCo.maxMonthlyContribution;
      return [
        '掛金は全額、所得から引ける → 税金がかかる金額が減る',
        '節税の目安 = 掛金 ×（所得税率 + 住民税率10%）',
        `例: 月額${max.toLocaleString()}円 × 12か月 = 年${(max * 12).toLocaleString()}円の所得控除`,
      ];
    },
    getNotes: (params) => {
      const ideco = params.savingsDeduction.iDeCo;
      return [
        `掛金: 月額${ideco.minMonthlyContribution.toLocaleString()}円〜${ideco.maxMonthlyContribution.toLocaleString()}円（1,000円単位）`,
        `年間最大控除額: ${(ideco.maxMonthlyContribution * ideco.months).toLocaleString()}円`,
        '受取時期: 原則60歳以降',
        '中途解約: 原則不可（掛金の停止・減額は可能）',
        '運用: 自分で運用商品（投資信託・定期預金など）を選択',
        '所得控除の種類: 小規模企業共済等掛金控除',
      ];
    },
    references: [
      { label: 'iDeCo公式サイト', url: 'https://www.ideco-koushiki.jp/', description: '加入手続き・金融機関の選び方・運用商品の情報' },
      { label: 'iDeCo加入の申込み', url: 'https://www.ideco-koushiki.jp/start/', description: '金融機関（運営管理機関）を通じて申込む' },
    ],
    relatedTerms: ['ideco', 'shotoku-koujo-zeigaku-koujo'],
  },
  {
    id: 'shoukibo-kyousai',
    title: '小規模企業共済',
    description: 'フリーランスのための退職金積立制度',
    introduction:
      '小規模企業共済は、個人事業主や小規模企業の経営者のための退職金制度です。掛金は全額が所得控除の対象となり、廃業・退職時にまとまった共済金を受け取れます。iDeCoと異なり、必要なときに解約して資金を引き出せる柔軟さがあります（ただし早期解約は元本割れの可能性あり）。',
    getFormula: (params) => {
      const max = params.savingsDeduction.smallBusinessMutualAid.maxMonthlyContribution;
      return [
        '掛金は全額、所得から引ける → 税金がかかる金額が減る',
        '節税の目安 = 掛金 ×（所得税率 + 住民税率10%）',
        `例: 月額${max.toLocaleString()}円 × 12か月 = 年${(max * 12).toLocaleString()}円の所得控除`,
      ];
    },
    getNotes: (params) => {
      const sb = params.savingsDeduction.smallBusinessMutualAid;
      return [
        `掛金: 月額${sb.minMonthlyContribution.toLocaleString()}円〜${sb.maxMonthlyContribution.toLocaleString()}円（500円単位）`,
        `年間最大控除額: ${(sb.maxMonthlyContribution * sb.months).toLocaleString()}円`,
        '受取時期: 廃業・退職時',
        '中途解約: 可能（20年未満の任意解約は元本割れあり）',
        '運用: 機構が運用（予定利率は変動あり）',
        '所得控除の種類: 小規模企業共済等掛金控除',
        '契約者貸付制度あり（掛金の範囲内で事業資金を借りられる）',
      ];
    },
    references: [
      { label: '小規模企業共済（中小機構）', url: 'https://www.smrj.go.jp/kyosai/skyosai/', description: '制度の概要・シミュレーション・加入手続き' },
      { label: '小規模企業共済の加入申込み', url: 'https://www.smrj.go.jp/kyosai/skyosai/entry/index.html', description: '金融機関の窓口または郵送で申込む' },
    ],
    relatedTerms: ['shoukibo-kyousai', 'shotoku-koujo-zeigaku-koujo'],
  },
];

export function getTopicById(id: string): LearnTopic | undefined {
  return learnTopics.find((t) => t.id === id);
}

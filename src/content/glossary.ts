export interface GlossaryTerm {
  id: string;
  term: string;
  reading: string;
  category: GlossaryCategory;
  definition: string;
  relatedTopicId?: string;
}

export type GlossaryCategory =
  | 'filing'
  | 'deduction'
  | 'calculation'
  | 'socialInsurance'
  | 'consumptionTax'
  | 'withholding';

export const categoryLabels: Record<GlossaryCategory, string> = {
  filing: '申告・届出',
  deduction: '控除・節税',
  calculation: '税額計算',
  socialInsurance: '社会保険',
  consumptionTax: 'インボイス・消費税',
  withholding: '源泉徴収',
};

export const glossaryTerms: GlossaryTerm[] = [
  {
    id: 'kakutei-shinkoku',
    term: '確定申告',
    reading: 'かくていしんこく',
    category: 'filing',
    definition:
      '1月1日から12月31日までの1年間の所得と税額を計算し、翌年の2月16日〜3月15日に税務署へ申告・納税する手続き。フリーランスは原則として毎年行う必要がある。',
    relatedTopicId: 'income-tax',
  },
  {
    id: 'aoiro-shinkoku',
    term: '青色申告',
    reading: 'あおいろしんこく',
    category: 'filing',
    definition:
      '事前に税務署へ「青色申告承認申請書」を提出して行う申告方法。帳簿の記帳方法に応じて最大65万円の特別控除が受けられるほか、赤字の繰越控除（3年間）などの特典がある。',
    relatedTopicId: 'income-tax',
  },
  {
    id: 'etax',
    term: 'e-Tax',
    reading: 'いーたっくす',
    category: 'filing',
    definition:
      '国税庁が提供するオンライン申告・納税システム。e-Taxで確定申告を行うと、青色申告特別控除が55万円から65万円に引き上げられる。マイナンバーカードとICカードリーダー（またはスマートフォン）が必要。',
    relatedTopicId: 'income-tax',
  },
  {
    id: 'aoiro-shinsei',
    term: '青色申告承認申請書',
    reading: 'あおいろしんこくしょうにんしんせいしょ',
    category: 'filing',
    definition:
      '青色申告を行うために税務署に提出する届出書。開業から2か月以内、または適用を受けたい年の3月15日までに提出する必要がある。',
    relatedTopicId: 'income-tax',
  },
  {
    id: 'kiso-koujo',
    term: '基礎控除',
    reading: 'きそこうじょ',
    category: 'deduction',
    definition:
      'すべての納税者に適用される所得控除。所得税では合計所得金額に応じて段階的に減額され、2,500万円超でゼロになる。住民税では一律43万円。令和8年分は時限特例により、所得税の基礎控除が引き上げられている。',
    relatedTopicId: 'income-tax',
  },
  {
    id: 'aoiro-tokubetsu-koujo',
    term: '青色申告特別控除',
    reading: 'あおいろとくべつこうじょ',
    category: 'deduction',
    definition:
      '青色申告者が事業所得から差し引ける控除。複式簿記＋e-Tax申告で65万円、複式簿記のみで55万円、簡易簿記で10万円の3段階。白色申告にはこの控除はない。',
    relatedTopicId: 'income-tax',
  },
  {
    id: 'shotoku-koujo-zeigaku-koujo',
    term: '所得控除と税額控除の違い',
    reading: 'しょとくこうじょとぜいがくこうじょのちがい',
    category: 'deduction',
    definition:
      '所得控除は課税所得を計算する前に所得金額から差し引くもの（基礎控除・社会保険料控除など）。税額控除は算出された税額から直接差し引くもの（住宅ローン控除など）。所得控除は税率分だけ税額が減るのに対し、税額控除は金額がそのまま税額から減る。',
    relatedTopicId: 'income-tax',
  },
  {
    id: 'shoukibo-kyousai',
    term: '小規模企業共済',
    reading: 'しょうきぼきぎょうきょうさい',
    category: 'deduction',
    definition:
      '個人事業主や小規模企業の経営者のための退職金制度。月額1,000円〜70,000円の掛金を積み立て、廃業・退職時に共済金を受け取れる。掛金は全額が所得控除の対象となるため、節税効果が高い。',
    relatedTopicId: 'savings-deduction',
  },
  {
    id: 'ideco',
    term: 'iDeCo（個人型確定拠出年金）',
    reading: 'いでこ',
    category: 'deduction',
    definition:
      '自分で掛金を拠出し、運用方法を選んで老後資金を準備する私的年金制度。フリーランスは月額最大68,000円まで拠出でき、掛金は全額が所得控除の対象。運用益も非課税で、受取時にも税制優遇がある。',
    relatedTopicId: 'savings-deduction',
  },
  {
    id: 'fuyou-koujo',
    term: '扶養控除',
    reading: 'ふようこうじょ',
    category: 'deduction',
    definition:
      '16歳以上の扶養親族がいる場合に受けられる所得控除。一般の扶養親族で38万円（所得税）。扶養親族の合計所得金額が48万円以下であることが条件。',
    relatedTopicId: 'income-tax',
  },
  {
    id: 'haiguusha-koujo',
    term: '配偶者控除',
    reading: 'はいぐうしゃこうじょ',
    category: 'deduction',
    definition:
      '配偶者の合計所得金額が48万円以下の場合に受けられる所得控除。納税者の合計所得金額が1,000万円以下の場合に適用され、最大38万円（所得税）。',
    relatedTopicId: 'income-tax',
  },
  {
    id: 'gokei-shotoku-shuunyuu',
    term: '合計所得金額と収入の違い',
    reading: 'ごうけいしょとくきんがくとしゅうにゅうのちがい',
    category: 'calculation',
    definition:
      '収入（売上）は事業で得た金額そのもの。所得は収入から必要経費を差し引いた金額。フリーランスの場合、「事業所得 ＝ 売上 − 必要経費」。税金は所得に対して計算される。',
    relatedTopicId: 'income-tax',
  },
  {
    id: 'kazei-shotoku',
    term: '課税所得',
    reading: 'かぜいしょとく',
    category: 'calculation',
    definition:
      '所得金額から各種所得控除（基礎控除・社会保険料控除など）を差し引いた金額。この金額に税率を掛けて税額を計算する。1,000円未満の端数は切り捨て。',
    relatedTopicId: 'income-tax',
  },
  {
    id: 'ruishin-kazei',
    term: '累進課税',
    reading: 'るいしんかぜい',
    category: 'calculation',
    definition:
      '所得が多くなるほど高い税率が適用される仕組み。所得税は5%〜45%の7段階で、課税所得が一定額を超えた部分にのみ高い税率が適用される（超過累進税率）。',
    relatedTopicId: 'income-tax',
  },
  {
    id: 'fukkou-tokubetsu-zei',
    term: '復興特別所得税',
    reading: 'ふっこうとくべつしょとくぜい',
    category: 'calculation',
    definition:
      '東日本大震災の復興財源として、所得税額に2.1%を上乗せして徴収される税金。2037年（令和19年）まで課税される。',
    relatedTopicId: 'income-tax',
  },
  {
    id: 'kintouwari',
    term: '均等割',
    reading: 'きんとうわり',
    category: 'calculation',
    definition:
      '住民税のうち、所得の金額に関係なく定額で課される部分。市区町村民税と道府県民税の合計で年額5,000円（森林環境税を含む）。',
    relatedTopicId: 'resident-tax',
  },
  {
    id: 'shotokuwari',
    term: '所得割',
    reading: 'しょとくわり',
    category: 'calculation',
    definition:
      '住民税のうち、前年の課税所得金額に税率（一律10%）を掛けて計算する部分。市区町村民税6%＋道府県民税4%の合計。',
    relatedTopicId: 'resident-tax',
  },
  {
    id: 'jigyounushi-koujo',
    term: '事業主控除',
    reading: 'じぎょうぬしこうじょ',
    category: 'calculation',
    definition:
      '個人事業税の計算で事業所得から差し引ける控除額。年額290万円。事業所得がこの金額以下であれば、個人事業税は課税されない。',
    relatedTopicId: 'business-tax',
  },
  {
    id: 'kokumin-kenko-hoken',
    term: '国民健康保険',
    reading: 'こくみんけんこうほけん',
    category: 'socialInsurance',
    definition:
      '会社の健康保険に加入しない自営業者・フリーランス等が加入する公的医療保険。保険料は前年の所得をもとに市区町村が算定し、医療分・後期高齢者支援金分・介護分の3区分で計算される。',
    relatedTopicId: 'social-insurance',
  },
  {
    id: 'kokumin-nenkin',
    term: '国民年金',
    reading: 'こくみんねんきん',
    category: 'socialInsurance',
    definition:
      '20歳以上60歳未満のすべての国民が加入する公的年金制度（第1号被保険者）。保険料は定額で、所得に関係なく一律。将来の老齢基礎年金の受給資格に必要。',
    relatedTopicId: 'social-insurance',
  },
  {
    id: 'fuka-gendo-gaku',
    term: '賦課限度額',
    reading: 'ふかげんどがく',
    category: 'socialInsurance',
    definition:
      '国民健康保険料の年間上限額。医療分・後期高齢者支援金分・介護分のそれぞれに上限が設定されており、所得がいくら高くてもこの額を超えることはない。',
    relatedTopicId: 'social-insurance',
  },
  {
    id: 'invoice',
    term: 'インボイス制度',
    reading: 'いんぼいすせいど',
    category: 'consumptionTax',
    definition:
      '適格請求書等保存方式。登録を受けた事業者（適格請求書発行事業者）のみが、仕入税額控除の対象となる請求書（インボイス）を発行できる制度。登録すると課税事業者となり、消費税の申告・納税が必要になる。',
    relatedTopicId: 'invoice',
  },
  {
    id: 'tekikaku-seikyusho',
    term: '適格請求書',
    reading: 'てきかくせいきゅうしょ',
    category: 'consumptionTax',
    definition:
      'インボイス制度で定められた記載事項を満たす請求書。登録番号・税率ごとの消費税額・適用税率などの記載が必要。適格請求書発行事業者として登録した事業者のみが発行できる。',
    relatedTopicId: 'invoice',
  },
  {
    id: 'kijun-kikan',
    term: '基準期間',
    reading: 'きじゅんきかん',
    category: 'consumptionTax',
    definition:
      '消費税の課税事業者かどうかを判定する基準となる期間。個人事業主の場合は2年前（前々年）の1月1日〜12月31日。この期間の課税売上高が1,000万円を超えると、当年は課税事業者となる。',
    relatedTopicId: 'consumption-tax',
  },
  {
    id: 'minashi-shiirritsu',
    term: 'みなし仕入率',
    reading: 'みなししいれりつ',
    category: 'consumptionTax',
    definition:
      '簡易課税制度で業種ごとに定められた仕入割合。実際の仕入額を計算せず、売上にこの率を掛けた金額を仕入額とみなして消費税を計算する。第1種（卸売）90%〜第6種（不動産）40%の6段階。',
    relatedTopicId: 'consumption-tax',
  },
  {
    id: 'niwari-tokurei',
    term: '2割特例',
    reading: 'にわりとくれい',
    category: 'consumptionTax',
    definition:
      'インボイス制度の導入に伴い、新たに課税事業者となった事業者が利用できる特例措置。売上にかかる消費税額の2割を納税額とする。届出不要で確定申告時に選択可能。',
    relatedTopicId: 'consumption-tax',
  },
  {
    id: 'kani-kazei',
    term: '簡易課税',
    reading: 'かんいかぜい',
    category: 'consumptionTax',
    definition:
      '基準期間の課税売上高が5,000万円以下の事業者が選択できる消費税の計算方法。実際の仕入額の代わりに、業種ごとの「みなし仕入率」を使って消費税額を計算する。事前に届出書の提出が必要。',
    relatedTopicId: 'consumption-tax',
  },
  {
    id: 'gensen-choushu',
    term: '源泉徴収',
    reading: 'げんせんちょうしゅう',
    category: 'withholding',
    definition:
      '報酬や給与を支払う側が、支払額から所得税を差し引いて国に納付する仕組み。フリーランスの場合、原稿料・デザイン料・講演料・コンサルティング料などの報酬が対象となる。天引きされた額は確定申告で精算される。',
    relatedTopicId: 'withholding-tax',
  },
  {
    id: 'gensen-choushu-hyou',
    term: '源泉徴収税額表',
    reading: 'げんせんちょうしゅうぜいがくひょう',
    category: 'withholding',
    definition:
      '源泉徴収する税額を求めるための国税庁が公開する表。フリーランスへの報酬は「報酬・料金等」の区分で、1回の支払金額が100万円以下なら10.21%、100万円超の部分は20.42%の税率が適用される。',
    relatedTopicId: 'withholding-tax',
  },
  {
    id: 'kanpu-shinkoku',
    term: '還付申告',
    reading: 'かんぷしんこく',
    category: 'withholding',
    definition:
      '源泉徴収等で納めすぎた税金の還付を受けるための確定申告。フリーランスは経費や各種控除を適用すると、源泉徴収された金額よりも実際の税額が少なくなることが多く、差額が還付される。還付申告は翌年1月1日から5年間提出可能。',
    relatedTopicId: 'withholding-tax',
  },
];

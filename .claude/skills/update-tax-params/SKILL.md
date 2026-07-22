---
name: update-tax-params
description: 税制パラメータを新年度に更新するスキル。taxParams.YYYY.json の全パラメータを一次資料から検証し、新年度用のJSONファイルを作成する。年度更新、税率更新、パラメータ更新、来年度対応などの文脈で使用する。
---

# Update Tax Params — 税制パラメータ年度更新

`taxParams.YYYY.json` の全パラメータを新年度の値に更新する。
税率・控除額・保険料は年度ごとに変わりうるため、一次資料で検証してから値を確定する。

## 入力

対象年度を受け取る。引数（例: `update-tax-params 2027`）でも、文中（「来年度に更新して」）でもよい。
年度が不明な場合は、現在の `taxParams.*.json` のファイル名から現行年度を特定し、次の年度を提案する。

## 全体フロー

1. 現行 JSON をコピーして新年度ファイルを作成
2. パラメータを優先度順に検証・更新
3. `taxParams.ts` のインポートを切り替え
4. テストを実行し、失敗ケースを報告

## ステップ1: 新年度ファイルの準備

```sh
cp src/data/taxParams.CURRENT.json src/data/taxParams.NEXT.json
```

`meta` セクションを更新する:
- `taxYear`: 新年度の西暦
- `eraYear`: 対応する和暦（例: `"令和9年"`）
- `lastVerified`: 今日の日付

## ステップ2: パラメータの検証と更新

パラメータを **毎年変わるもの** → **制度改正で変わるもの** の順に確認する。
各カテゴリについて、WebSearch で一次資料を検索し、値を取得・提案する。
**1カテゴリごとにユーザへ確認を取ってから次に進む。** まとめて一括確認はしない。

> **参照**: 各カテゴリの詳細な取得元URL・ページの見方・注意事項は `references/data-sources.md` にまとめてある。
> 各カテゴリの作業を始める前に該当セクションを読んでから検索・取得を行うこと。

### 優先度A: 毎年変わるパラメータ

これらは毎年度の改定が確実なので、必ず最新値を確認する。

#### A1. 国民年金保険料（4月改定）

- 検索キーワード: `国民年金保険料 令和○年度 月額`
- 一次資料: 日本年金機構 https://www.nenkin.go.jp/
- 更新箇所: `socialInsurance.nationalPension.monthlyAmount`
- 注意: 月額のみ。`months: 12` は固定

#### A2. 国民健康保険の賦課限度額（4月改定）

- 検索キーワード: `国民健康保険 賦課限度額 令和○年度`
- 一次資料: 厚生労働省 https://www.mhlw.go.jp/
- 更新箇所:
  - `socialInsurance.nationalHealthInsurance.models.standard` の各 `cap`
  - 全47都道府県の `prefectures.*.nhi.*.cap`（賦課限度額は国の上限なので全国同一だが、市独自に低い上限を設定する場合がある）
- 賦課限度額は医療分・後期高齢者支援金分・介護分の3区分

#### A3. 47都道府県庁所在地の国保料率（4〜6月に各市が公表）

- 一次資料: 各市の公式サイト（「○○市 国民健康保険料 令和○年度」で検索）
- 更新箇所: `prefectures.*.nhi` の各カテゴリ（`incomeRate`, `perCapita`, `perHousehold`, `cap`）
- 47市分あるため、作業量が大きい。以下の手順で進める:
  1. まず主要都市（東京・大阪・名古屋・横浜・札幌・福岡）を検索して傾向を掴む
  2. 残りの都市を地方ブロックごとに検索
  3. 検索で見つからない市は、前年度の値を据え置きとしてマークし、ユーザに確認
- **据え置き判断が必要な場合は必ずユーザに報告する**

#### A4. 協会けんぽ都道府県別料率（3月に公表）

- 検索キーワード: `協会けんぽ 都道府県別保険料率 令和○年度`
- 一次資料: 全国健康保険協会 https://www.kyoukaikenpo.or.jp/
- 更新箇所:
  - `prefectures.*.kyokaiKenpoRate`（47都道府県）
  - `corporateSocialInsurance.healthInsurance.rate`（全国平均、法人側のデフォルト値）
- 協会けんぽのサイトには全都道府県の料率が一覧で掲載されている
- 介護保険料率も確認: `corporateSocialInsurance.nursingCare.rate`

#### A5. 厚生年金保険料率・標準報酬月額上限

- 検索キーワード: `厚生年金保険料率 令和○年度`
- 一次資料: 日本年金機構 https://www.nenkin.go.jp/
- 更新箇所:
  - `corporateSocialInsurance.employeesPension.rate`
  - `corporateSocialInsurance.employeesPension.maxMonthlyCompensation`
  - `corporateSocialInsurance.healthInsurance.maxMonthlyCompensation`
- 厚生年金保険料率は2017年9月以降18.3%で固定されているが、上限額は改定されうる

### 優先度B: 制度改正で変わりうるパラメータ

これらは毎年変わるとは限らないが、税制改正大綱で変更されることがある。
WebSearch で `令和○年度 税制改正` を検索し、関連する改正がないか確認する。

#### B1. 所得税率・控除

- 一次資料: 国税庁 https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/2260.htm
- 更新箇所: `incomeTax.brackets`, `incomeTax.basicDeduction`
- 注意: 令和8年の基礎控除は時限特例（58万→104万）を含む。特例の適用期限を確認し、終了していれば元に戻す
- 復興特別所得税率（2.1%）は2037年まで継続

#### B2. 住民税

- 一次資料: 総務省 https://www.soumu.go.jp/
- 更新箇所: `residentTax` の各フィールド
- 注意: 均等割は森林環境税（1,000円）の扱いを確認
- 都道府県ごとの超過課税: `prefectures.*.residentTaxIncomeRate`, `prefectures.*.residentTaxPerCapitaLevy`

#### B3. 個人事業税

- 一次資料: 各都道府県の税務サイト
- 更新箇所: `businessTax`
- 事業主控除（290万円）や税率は地方税法で固定されており、滅多に変わらない

#### B4. 消費税

- 一次資料: 国税庁 https://www.nta.go.jp/
- 更新箇所: `consumptionTax`
- 重要: `twentyPercentSpecialEligibleYears` の適用期限を確認。2割特例は2026年分まで。延長されなければ新年度で配列から外す

#### B5. 法人税・法人住民税・法人事業税

- 一次資料: 国税庁、総務省
- 更新箇所: `corporateTax`, `corporateResidentTax`, `corporateEnterpriseTax`
- `prefectures.*.corporateResidentTaxLevyRate` も確認（超過課税は大法人向けのため通常7.0%）

#### B6. 給与所得控除

- 一次資料: 国税庁 https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1410.htm
- 更新箇所: `employmentIncomeDeduction.brackets`

#### B7. iDeCo・小規模企業共済

- 一次資料: iDeCo公式、中小機構
- 更新箇所: `savingsDeduction`
- iDeCoの掛金上限は制度改正で変わることがある

#### B8. 源泉徴収税

- 一次資料: 国税庁
- 更新箇所: `withholdingTax`

### 優先度C: 表示用データ

#### C1. 青色申告控除額

- 更新箇所: `blueReturnDeductions`
- 65万/55万/10万/0 は法定額。改正がない限り据え置き

### 確認完了後

全カテゴリの確認が終わったら、`meta.sources` を更新する:
- 参照した一次資料のURLを追加
- リンク切れになったURLを差し替え

## ステップ3: インポートの切り替え

`src/data/taxParams.ts` のインポートを新年度ファイルに切り替える:

```ts
import rawTaxParams from './taxParams.NEXT.json';
```

旧年度のJSONファイルは削除せず残す（過去の参照用）。

## ステップ4: テスト実行と差分レポート

```sh
npx vitest run
npx tsc -b
```

テスト結果を以下の形式で報告する:

```
### テスト差分レポート

**パス**: X / Y テスト通過
**失敗**: Z テスト

失敗テスト一覧:
- `ファイル:テスト名` — 失敗理由（期待値 vs 実際値）
  → 原因: パラメータ変更による期待値のずれ / ロジックへの影響

**次のアクション**: テストの期待値を新年度の値に合わせて修正する必要があります
```

テストの期待値は自動修正しない。ユーザに報告し、判断を仰ぐ。

## 注意事項

- **二次情報を鵜呑みにしない**: ブログ記事やまとめサイトではなく、必ず官公庁・公的機関の一次資料で値を確認する
- **未確定の値を入れない**: 年度初めは一部パラメータが未公表の場合がある。確定前の値は入れず、前年度の値を据え置きとしてマークする
- **変更理由を記録する**: 各パラメータの変更時、何が変わったかをコミットメッセージに含める

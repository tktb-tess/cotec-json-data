
[戻る](/.)

## 何

[かえる](https://github.com/kaeru2193) さんのリポジトリ [人工言語リスト 処理用プログラム群](https://github.com/kaeru2193/Conlang-List-Works/) にある Cotec 形式ファイルを JSON 変換する処理を行い、保管するためのリポジトリです。

[Cotec形式についてはこちら](https://migdal.jp/cl_kiita/cotec-conlang-table-expression-powered-by-csv-clakis-rfc-2h86)

## 詳細

人工言語リスト 処理用プログラム群からデータ取得したのち、独自定義のJSON形式にパースして [`./out/conlinguistics-wiki-list-cotec.json`](./out/conlinguistics-wiki-list-cotec.json) に保管されます。

**※[`./parsed-from-conlinguistics-wiki-list.ctc.json`](./parsed-from-conlinguistics-wiki-list.ctc.json) は形式が異なる古いファイルであり、2025/08/02 以降は更新されていません。一応残してありますが、更新はされませんので注意してください。**

更新は毎月**2**日UTC0時頃です。（若干遅れる場合あり）

## 仕様

### Typescriptでの型

```typescript
type MoyuneClass =
  | 'INT'
  | 'ART'
  | 'EXP'
  | 'PHI'
  | 'HYP'
  | 'NAT'
  | 'REA'
  | 'IMG'
  | 'CIN'
  | 'CDE'
  | 'GEN'
  | 'SPE'
  | 'SON'
  | 'LIT'
  | 'KIN'
  | 'SER'
  | 'JOK'
  | 'PAV'
  | 'AAV'
  | 'PWL'
  | 'AWL'
  | 'TOL'
  | 'PRI'
  | 'PUB'
  | 'FIX';

type CotecMetadata = {
  datasize: [number, number];
  title: string;
  author: string[];
  createdDate: string;
  lastUpdate: string;
  license: { 
    name: string;
    content: string;
  };
  advanced: number;
  label: string[];
  type: string[];
};

type CotecContent = {
  messier?: unknown;
  name: string[];
  kanji: string[];
  desc: string[];
  creator: string[];
  period?: string;
  site?: {
    name?: string;
    url: string;
  }[];
  twitter?: string[];
  dict?: string[];
  grammar?: string[];
  world?: string[];
  category?: {
    name: string;
    content?: string;
  }[];
  moyune?: MoyuneClass[];
  clav3?: {
    dialect: string;
    language: string;
    family: string;
    creator: string;
  };
  part?: string;
  example?: string[];
  script?: string[];
};

export type Cotec = {
  metadata: CotecMetadata;
  contents: CotecContent[];
};
```

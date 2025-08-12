
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
  jsonLastUpdate: string;
  license: { 
    name: string;
    content: string;
  };
  advanced: number;
  label: string[];
  type: string[];
};

type CotecContent = {
  id: string;
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

### 例

#### CotecContent

```json
[
  {
    "id": "jOEC2TtTSuxM6Bklu1delpwx3FzaT2jMNHt0__el8rw",
    "name": ["ヴェッセンズラン語"],
    "kanji": [],
    "desc": ["古英語からあまり屈折が衰退しなかった娘言語"],
    "creator": ["Tessyrrhaqt", "テセラクト", "斗琴庭暁響"],
    "period": "2023",
    "site": [{ "url": "https://tktb-tess.github.io/" }],
    "twitter": ["https://twitter.com/Triethylamineq"],
    "dict": ["https://zpdic.ziphil.com/dictionary/633"],
    "category": [
      { "name": "アポステリオリ言語" },
      { "name": "モユネ分類", "content": "NAT/IMG/CDE/SER/AWL" }
    ],
    "moyune": ["NAT", "IMG", "CDE", "SER", "AWL"]
  }
]
```

#### CotecMetadata

```json
{
  "datasize": [785, 17],
  "title": "日本語圏の人工言語の一覧表 Cotec変換済みデータ",
  "author": [
    "みかぶる (Mikanixonable)",
    "かえる (kaeru2193)",
    "人工言語学Wiki上の記事編集者"
  ],
  "createdDate": "2024-03-09T00:00:00.000Z",
  "lastUpdate": "2025-08-01T02:33:12.782Z",
  "jsonLastUpdate": "2025-08-12T02:36:24.715Z",
  "license": {
    "name": "CC BY-SA 4.0",
    "content": "© みかぶる (Mikanixonable), かえる (kaeru2193), 人工言語学Wiki上の記事編集者 under CC BY-SA 4.0"
  },
  "advanced": 0,
  "label": [
    "messier",
    "name",
    "kanji",
    "desc",
    "creator",
    "period",
    "site",
    "twitter",
    "dict",
    "grammar",
    "world",
    "category",
    "moyune",
    "cla",
    "part",
    "example",
    "script"
  ],
  "type": [
    "Any",
    "Array[NString]",
    "Array[NString]",
    "Array[NString]",
    "Array[NString]",
    "DateRange",
    "Array[Url]",
    "Array[Url]",
    "Array[NString]",
    "Array[NString]",
    "Array[NString]",
    "Array[Union[Pair[NString,NString],NString]]",
    "Array[MoyuneClass]",
    "Array[LangCode]",
    "Any",
    "Array[NString]",
    "Array[NString]"
  ]
}
```

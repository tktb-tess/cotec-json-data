import type { CotecContent, CotecMetadata, MoyuneClass } from './cotec';
import { isMoyune } from './cotec';

/** by ChatGPT */
const parseCSV = (csvString: string) => {
  const rows: string[][] = [];
  let row: string[] = [];
  let currentField = '';
  let is_inside_of_quote = false;

  for (let i = 0; i < csvString.length; i++) {
    const char = csvString[i];

    if (char === '"' && (i === 0 || csvString[i - 1] !== '\\')) {
      // ダブルクォート（not エスケープ）に入った/出た時にトグル
      is_inside_of_quote = !is_inside_of_quote;
    } else if (char === ',' && !is_inside_of_quote) {
      // クォート内でないコンマ
      row.push(currentField.trim()); // フィールドを列配列に追加
      currentField = ''; // クリア
    } else if (char === '\n' && !is_inside_of_quote) {
      // クォート内でない改行
      row.push(currentField.trim()); // フィールドを列配列に追加
      rows.push(row); // 列配列を2次元配列に追加
      row = []; // 列配列, フィールドをクリア
      currentField = '';
    } else {
      // フィールドに文字を追加
      currentField += char;
    }
  }

  // 最後のセルと行を追加
  row.push(currentField.trim());
  rows.push(row);

  return rows;
};

export const cotecToJSON = async (raw: string) => {
  const contents: CotecContent[] = [];

  const parsed_data = parseCSV(raw);
  const row_meta = parsed_data[0];

  // メタデータ
  const datasize = ((): [number, number] => {
    const datasize = row_meta[0]
      .split('x')
      .map((size) => Number.parseInt(size));
    return [datasize[0], datasize[1]];
  })();

  const title = row_meta[1];
  const author = row_meta[2].split(',').map((str) => str.trim());
  const date_created = row_meta[3];
  const date_last_updated = row_meta[4];
  const license = { name: row_meta[5], content: row_meta[6] } as const;
  const advanced = Number.parseInt(row_meta[7]);

  // if (advanced !== 0) {
  //     /* 何か処理 */;
  // }

  const label = parsed_data[1];
  const type = parsed_data[2];

  const metadata: CotecMetadata = {
    datasize,
    title,
    author,
    date_created,
    date_last_updated,
    license,
    advanced,
    label,
    type,
  };

  // messier,name,kanji,desc,creator,period,site,twitter,dict,grammar,world,category,moyune,cla,part,example,script
  for (let i = 3; i < parsed_data.length - 1; i++) {
    const row = parsed_data[i];

    const cotec_one_content: CotecContent = {
      messier: null,
      name: [],
      kanji: [],
      desc: [],
      creator: [],
      period: null,
      site: [],
      twitter: [],
      dict: [],
      grammar: [],
      world: [],
      category: [],
      moyune: [],
      clav3: null,
      part: null,
      example: [],
      script: [],
    };

    // messier, name, kanji
    if (row[0]) cotec_one_content.messier = row[0];
    if (row[1])
      cotec_one_content.name = row[1].split(';').map((datum) => datum.trim());
    if (row[2])
      cotec_one_content.kanji = row[2].split(';').map((datum) => datum.trim());

    // desc
    if (row[3]) {
      const descs = row[3].split(';').map((datum) => datum.trim());

      // urlがあったら抽出してsiteに追加
      const regexurl =
        /(?:https:\/\/web\.archive\.org\/web\/[0-9]+\/)?https?:\/\/[\w.-]+[\w-]+(?:\/[\w?+\-_~=.&@#%]*)*/gu;

      for (const desc of descs) {
        cotec_one_content.desc.push(desc);
        const matchurls = desc.match(regexurl);

        if (matchurls) {
          const urlarray = Array.from(matchurls);

          urlarray.forEach((url) => {
            const res = { url, name: null };
            cotec_one_content.site.push(res);
          });
        }
      }
    }

    // creator, period
    if (row[4])
      cotec_one_content.creator = row[4]
        .split(';')
        .map((datum) => datum.trim());
    if (row[5]) cotec_one_content.period = row[5];

    // site
    if (row[6]) {
      const site_p = row[6];

      const regex_for_site =
        /(?:(?<name>(?:\p{Script=Han}|\p{Script=Hiragana}|\p{Script=Katakana})+\d*):\s?|\s|^)(?<url>(?:https:\/\/web\.archive\.org\/web\/[0-9]+\/)?https?:\/\/[\w\-.]+[\w-]+(?:\/[\w?+\-_~=.&@#%]*)*)/gu;
      const matches = site_p.matchAll(regex_for_site);

      for (const match of matches) {
        if (match.groups) {
          const res = match.groups;
          const { name, url } = res;

          if (!url) throw Error('parse error: site.url is empty');

          const s_ = name ? { name, url } : { name: null, url };

          cotec_one_content.site.push(s_);
        }
      }
    }

    // 辞書・文法のsiteをdict, grammarにパース
    if (cotec_one_content.site) {
      cotec_one_content.site.forEach((elem) => {
        if (typeof elem !== 'object' || Array.isArray(elem)) return;

        if (elem.name) {
          if (elem.name.includes('文法'))
            cotec_one_content.grammar.push(elem.url);
          if (elem.name.includes('辞書')) cotec_one_content.dict.push(elem.url);
        }
      });
    }

    // twitter
    if (row[7])
      cotec_one_content.twitter = row[7].split(';').map((s) => s.trim());

    // dict
    if (row[8]) cotec_one_content.dict = row[8].split(';').map((s) => s.trim());

    // grammar
    if (row[9])
      cotec_one_content.grammar = row[9].split(';').map((s) => s.trim());

    // world
    if (row[10])
      cotec_one_content.world = row[10].split(';').map((s) => s.trim());

    // category
    if (row[11]) {
      const category_p = row[11].split(';').map((s) => s.trim());

      const regex = /^(?<name>[^:]+)(?::(?<content>.+))?$/u;

      for (const elem of category_p) {
        const match = regex.exec(elem);

        if (match && match.groups) {
          const { name, content } = match.groups;

          const c_ = content ? { name, content } : { name, content: null };

          cotec_one_content.category.push(c_);
        }
      }
    }

    // モユネ分類・CLA v3をmoyune, clav3にパース
    cotec_one_content.category.forEach((elem) => {
      if (typeof elem !== 'object' || Array.isArray(elem)) return;

      switch (elem.name) {
        case 'CLA v3': {
          if (elem.content) {
            const clav3_regex =
              /^(?<dialect>~|[a-z]{2})_(?<language>[a-z]{2})_(?<family>~|[a-z]{3})_(?<creator>[a-z]{3})$/;
            const match = clav3_regex.exec(elem.content);

            if (match && match.groups) {
              const { dialect, language, family, creator } = match.groups;

              const clav3 = {
                dialect,
                language,
                family,
                creator,
              } as const;

              cotec_one_content.clav3 = clav3;
            }
          }
          break;
        }
        case 'モユネ分類': {
          if (elem.content) {
            const m: MoyuneClass[] = [];
            const parsed = Array.from(elem.content.match(/[A-Z]{3}/g) ?? []);
            parsed.forEach((s) => {
              if (isMoyune(s)) m.push(s);
            });
            cotec_one_content.moyune = m;
            cotec_one_content.moyune.sort();
          }
          break;
        }
        default:
          break;
      }
    });

    // moyune
    if (row[12]) {
      const m: MoyuneClass[] = [];
      const parsed = Array.from(row[12].match(/[A-Z]{3}/g) ?? []);

      parsed.forEach((s) => {
        if (isMoyune(s)) m.push(s);
      });

      cotec_one_content.moyune = m;
      cotec_one_content.moyune.sort();
    }

    // clav3
    if (row[13]) {
      const clav3_regex =
        /^(?<dialect>~|[a-z]{2})_(?<language>[a-z]{2})_(?<family>~|[a-z]{3})_(?<creator>[a-z]{3})$/;
      const match = clav3_regex.exec(row[13]);

      if (match && match.groups) {
        const { dialect, language, family, creator } = match.groups;

        const clav3 = {
          dialect,
          language,
          family,
          creator,
        } as const;

        cotec_one_content.clav3 = clav3;
      }
    }

    // part
    if (row[14]) cotec_one_content.part = row[14].trim();

    // example, script
    if (row[15])
      cotec_one_content.example = row[15].split(';').map((s) => s.trim());

    if (row[16])
      cotec_one_content.script = row[16].split(';').map((s) => s.trim());

    contents.push(cotec_one_content);
  }

  console.log('fetching & parsing cotec file was successful');
  return { metadata, contents };
};

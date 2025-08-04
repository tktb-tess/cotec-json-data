import type { CotecContent, CotecMetadata, MoyuneClass } from './type';
import { isMoyune } from './type';

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

const removeDoubling = <T>(arr: T[]) => {
  const set = new Set(arr);
  return [...set.values()];
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
  const createdDate = row_meta[3];
  const lastUpdate = row_meta[4];
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
    createdDate,
    lastUpdate,
    license,
    advanced,
    label,
    type,
  };

  // messier,name,kanji,desc,creator,period,site,twitter,dict,grammar,world,category,moyune,cla,part,example,script
  for (let i = 3; i < parsed_data.length - 1; i++) {
    const row = parsed_data[i];

    let messier: unknown;
    let name: string[] = [];
    let kanji: string[] = [];
    let desc: string[] = [];
    let creator: string[] = [];
    let period: string | undefined;
    let site: { name?: string; url: string }[] = [];
    let twitter: string[] = [];
    let dict: string[] = [];
    let grammar: string[] = [];
    let world: string[] = [];
    let category: { name: string; content?: string }[] = [];
    let moyune: MoyuneClass[] = [];
    let clav3:
      | {
          dialect: string;
          language: string;
          family: string;
          creator: string;
        }
      | undefined;
    let part: string | undefined;
    let example: string[] = [];
    let script: string[] = [];

    // messier, name, kanji
    messier = row[0] || undefined;
    name = name.concat(row[1].split(';').map((datum) => datum.trim()));
    kanji = kanji.concat(row[2].split(';').map((datum) => datum.trim()));

    // desc
    if (row[3]) {
      const descs = row[3].split(';').map((datum) => datum.trim());

      // urlがあったら抽出してsiteに追加
      const regexurl =
        /(?:https:\/\/web\.archive\.org\/web\/[0-9]+\/)?https?:\/\/[\w.-]+[\w-]+(?:\/[\w?+\-_~=.&@#%]*)*/gu;

      for (const dsc of descs) {
        desc.push(dsc);
        const matchurls = dsc.match(regexurl);

        if (matchurls) {
          const urlarray = Array.from(matchurls);

          urlarray.forEach((url) => {
            const res = { url };
            site.push(res);
          });
        }
      }
    }

    // creator, period
    creator = creator.concat(row[4].split(';').map((datum) => datum.trim()));
    period = row[5] || undefined;

    // site
    if (row[6]) {
      const site_p = row[6];

      const regex_for_site =
        /(?:(?<name>(?:\p{Script=Han}|\p{Script=Hiragana}|\p{Script=Katakana})+\d*):\s?|\s|^)(?<url>(?:https:\/\/web\.archive\.org\/web\/[0-9]+\/)?https?:\/\/[\w\-.]+[\w-]+(?:\/[\w?+\-_~=.&@#%]*)*)/gu;
      const matches = site_p.matchAll(regex_for_site);

      for (const match of matches) {
        if (match.groups) {
          const { name, url } = match.groups;
          if (!url) throw Error('parse error: site.url is empty');
          site.push({ name: name || undefined, url });
        }
      }
    }

    // 辞書・文法のsiteをdict, grammarにパース
    if (site) {
      site.forEach((elem) => {
        if (elem.name) {
          if (elem.name.includes('文法')) {
            grammar.push(elem.url);
          }
          if (elem.name.includes('辞書')) {
            dict.push(elem.url);
          }
        }
      });
    }

    // twitter
    if (row[7]) {
      twitter = twitter.concat(row[7].split(';').map((s) => s.trim()));
    }

    // dict
    if (row[8]) {
      dict = dict.concat(row[8].split(';').map((s) => s.trim()));
    }

    // grammar
    if (row[9]) {
      grammar = grammar.concat(row[9].split(';').map((s) => s.trim()));
    }

    // world
    if (row[10]) {
      world = world.concat(row[10].split(';').map((s) => s.trim()));
    }

    // category
    if (row[11]) {
      const cat_regex = /(?<name>[^:;]+)(?::(?<content>[^;]+))?/gu;
      const matches = row[11].matchAll(cat_regex);

      for (const match of matches) {
        if (match.groups) {
          const { name, content } = match.groups;

          category.push({ name, content: content || undefined });
        }
      }
    }

    // モユネ分類・CLA v3をmoyune, clav3にパース
    category.forEach((elem) => {
      switch (elem.name) {
        case 'CLA v3': {
          if (elem.content) {
            const clav3_regex =
              /^(?<dialect>~|[a-z]{2})_(?<language>[a-z]{2})_(?<family>~|[a-z]{3})_(?<creator>[a-z]{3})$/;
            const match = clav3_regex.exec(elem.content);

            if (match && match.groups) {
              const { dialect, language, family, creator } = match.groups;
              clav3 = {
                dialect,
                language,
                family,
                creator,
              };
            }
          }
          break;
        }
        case 'モユネ分類': {
          if (elem.content) {
            const parsed = Array.from(elem.content.match(/[A-Z]{3}/g) ?? []);
            moyune = moyune.concat(parsed.filter((m) => isMoyune(m)));
          }
          break;
        }
        default:
          break;
      }
    });

    // moyune
    if (row[12]) {
      const parsed = Array.from(row[12].match(/[A-Z]{3}/g) ?? []);

      moyune = moyune.concat(parsed.filter((m) => isMoyune(m)));
    }

    // clav3
    if (row[13]) {
      const clav3_regex =
        /^(?<dialect>~|[a-z]{2})_(?<language>[a-z]{2})_(?<family>~|[a-z]{3})_(?<creator>[a-z]{3})$/;
      const match = clav3_regex.exec(row[13]);

      if (match && match.groups) {
        const { dialect, language, family, creator } = match.groups;

        clav3 = {
          dialect,
          language,
          family,
          creator,
        };
      }
    }

    // part
    part = row[14] || undefined;

    // example, script
    if (row[15]) {
      example = example.concat(row[15].split(';').map((s) => s.trim()));
    }

    if (row[16]) {
      script = script.concat(row[16].split(';').map((s) => s.trim()));
    }

    name = removeDoubling(name.sort());
    kanji = removeDoubling(kanji.sort());
    desc = removeDoubling(desc.sort());
    creator = removeDoubling(creator.sort());
    site = removeDoubling(site);
    twitter = removeDoubling(twitter.sort());
    dict = removeDoubling(dict.sort());
    grammar = removeDoubling(grammar.sort());
    world = removeDoubling(world.sort());
    category = removeDoubling(category);
    moyune = removeDoubling(moyune.sort());
    example = removeDoubling(example.sort());
    script = removeDoubling(script.sort());

    contents.push({
      messier,
      name,
      kanji,
      desc,
      creator,
      period,
      site: site.length > 0 ? site : undefined,
      twitter: twitter.length > 0 ? twitter : undefined,
      dict: dict.length > 0 ? dict : undefined,
      grammar: grammar.length > 0 ? grammar : undefined,
      world:grammar.length > 0 ? grammar : undefined,
      category: category.length > 0 ? category : undefined,
      moyune: moyune.length > 0 ? moyune : undefined,
      clav3,
      part,
      example: example.length > 0 ? example : undefined,
      script: script.length > 0 ? script : undefined,
    });
  }

  console.log('fetching & parsing cotec file was successful');
  return { metadata, contents };
};

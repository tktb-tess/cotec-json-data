import type {
  Cotec,
  CotecContent,
  CotecMetadata,
  MoyuneClass,
} from './type.ts';
import { isMoyune } from './type.ts';
import { strictAt, removeDoubling, getCodePoints, getId } from './funcs.ts';
import type { ReadonlyDeep } from 'type-fest';
import Papa from 'papaparse';

const parseMetadata = (metadataRows: string[][]): CotecMetadata => {
  const rowMeta = strictAt(metadataRows, 0);
  // メタデータ
  const datasize = ((): [number, number] => {
    const datasize = strictAt(rowMeta, 0)
      .split('x')
      .map((size) => Number.parseInt(size));

    return [strictAt(datasize, 0), strictAt(datasize, 1)];
  })();

  const title = strictAt(rowMeta, 1);
  const author = strictAt(rowMeta, 2)
    .split(',')
    .map((str) => str.trim());
  const createdDate = strictAt(rowMeta, 3);
  const lastUpdate = strictAt(rowMeta, 4);
  const license = {
    name: strictAt(rowMeta, 5),
    content: strictAt(rowMeta, 6),
  } as const;

  const advanced = Number.parseInt(strictAt(rowMeta, 7)) || 0;

  // if (advanced !== 0) {
  //     /* 何か処理 */
  // }

  const label = strictAt(metadataRows, 1);
  const type = strictAt(metadataRows, 2);

  return {
    datasize,
    title,
    author,
    createdDate,
    lastUpdate,
    jsonLastUpdate: new Date().toISOString(),
    license,
    advanced,
    label,
    type,
  };
};

const parseRow = async (row: readonly string[]): Promise<CotecContent> => {
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
  messier = row[0]?.trim() || undefined;

  if (row[1]) {
    name = name.concat(row[1].split(';').map((datum) => datum.trim()));
  }

  if (row[2]) {
    kanji = kanji.concat(row[2].split(';').map((datum) => datum.trim()));
  }

  // desc
  if (row[3]) {
    const descs = row[3].split(';').map((datum) => datum.trim());

    // urlがあったら抽出してsiteに追加
    const regexurl =
      /(?:https:\/\/web\.archive\.org\/web\/[0-9]+\/)?https?:\/\/[\w.-]+[\w-]+(?:\/[\w?+\-_~=.&@#%]*)*/gu;

    for (const dsc of descs) {
      desc.push(dsc);
      const matchurls = dsc.matchAll(regexurl);

      if (matchurls) {
        const urlarray = Array.from(matchurls, (m) => m[0]);

        urlarray.forEach((url) => {
          const res = { url };
          site.push(res);
        });
      }
    }
  }

  // creator, period
  if (row[4]) {
    creator = creator.concat(row[4].split(';').map((datum) => datum.trim()));
  }

  period = row[5]?.trim() || undefined;

  // site
  if (row[6]) {
    const site_p = row[6];

    const regex_for_site =
      /(?:(?<name>(?:\p{Script=Han}|\p{Script=Hiragana}|\p{Script=Katakana})+\d*):\s?|\s|^)(?<url>(?:https:\/\/web\.archive\.org\/web\/[0-9]+\/)?https?:\/\/[\w\-.]+[\w-]+(?:\/[\w?+\-_~=.&@#%]*)*)/gu;
    const matches = site_p.matchAll(regex_for_site);

    for (const match of matches) {
      if (match.groups) {
        const { name, url } = match.groups;
        if (!url)
          throw TypeError(
            `parse error: site.url is empty\nrow: ${row.join(', ')}`,
          );
        site.push({ name: name || undefined, url });
      }
    }
  }

  // 辞書・文法のsiteをdict, grammarにパース

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

        if (name == null) {
          throw TypeError(`name is nullable\nrow: ${row.join(', ')}`);
        }

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

            if (
              dialect == null ||
              language == null ||
              family == null ||
              creator == null
            ) {
              throw TypeError(`CLA code is nullable\nrow: ${row.join(', ')}`);
            }

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
          const parsed = Array.from(
            elem.content.matchAll(/[A-Z]{3}/g),
            (r) => r[0],
          );
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
    const parsed = Array.from(row[12].matchAll(/[A-Z]{3}/g), (r) => r[0]);
    moyune = moyune.concat(parsed.filter((m) => isMoyune(m)));
  }

  // clav3
  if (row[13]) {
    const clav3_regex =
      /^(?<dialect>~|[a-z]{2})_(?<language>[a-z]{2})_(?<family>~|[a-z]{3})_(?<creator>[a-z]{3})$/;
    const match = clav3_regex.exec(row[13]);

    if (match && match.groups) {
      const { dialect, language, family, creator } = match.groups;

      if (
        dialect == null ||
        language == null ||
        family == null ||
        creator == null
      ) {
        throw TypeError(`CLA code is nullable\nrow: ${row.join(', ')}`);
      }

      clav3 = {
        dialect,
        language,
        family,
        creator,
      };
    }
  }

  // part
  part = row[14]?.trim() || undefined;

  // example, script
  if (row[15]) {
    example = example.concat(row[15].split(';').map((s) => s.trim()));
  }

  if (row[16]) {
    script = script.concat(row[16].split(';').map((s) => s.trim()));
  }

  // 他のプロパティとの重複を削除
  site = site.filter((s) => {
    const sName = s.name;
    if (!sName) return true;

    return !sName.includes('文法') && !sName.includes('辞書');
  });

  category = category.filter((c) => {
    const cName = c.name;

    return !cName.includes('CLA v3') && !cName.includes('モユネ分類');
  });

  // ダブリングを消す
  name = removeDoubling(name);
  kanji = removeDoubling(kanji);
  site = removeDoubling(site);
  desc = removeDoubling(desc);
  creator = removeDoubling(creator);
  twitter = removeDoubling(twitter);
  dict = removeDoubling(dict);
  grammar = removeDoubling(grammar);
  category = removeDoubling(category);
  world = removeDoubling(world);
  moyune = removeDoubling(moyune);
  example = removeDoubling(example);
  script = removeDoubling(script);

  const pre = {
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
    world: world.length > 0 ? world : undefined,
    category: category.length > 0 ? category : undefined,
    moyune: moyune.length > 0 ? moyune : undefined,
    clav3,
    part,
    example: example.length > 0 ? example : undefined,
    script: script.length > 0 ? script : undefined,
  } satisfies Omit<CotecContent, 'id'>;

  const id = await getId(pre);

  // console.log('parsed', name[0]);

  return { id, ...pre };
};

export const cotecToJSON = async (
  raw: string,
): Promise<ReadonlyDeep<Cotec>> => {
  try {
    console.log('start parsing...');

    const parsedData = Papa.parse<string[]>(raw, { header: false }).data;
    const metaDataRows = parsedData.slice(0, 3);
    const contentRows = parsedData.slice(3, -1);

    console.log('parsing metadata...');

    const metadata = parseMetadata(metaDataRows);

    console.log('successfully parsed metadata');
    console.log('parsing contents...');

    // messier, name, kanji, desc, creator, period, site, twitter, dict, grammar, world, category, moyune, cla, part, example, script
    const contents = await Promise.all(contentRows.map(parseRow));
    const sorted = contents.toSorted((a, b) => {
      const [aCres, bCres] = [a.creator[0], b.creator[0]];

      if (!aCres && !bCres) {
        return 0;
      } else if (!aCres) {
        return -1;
      } else if (!bCres) {
        return 1;
      }

      const [aCodes, bCodes] = [getCodePoints(aCres), getCodePoints(bCres)];

      const minLen = Math.min(aCodes.length, bCodes.length);

      for (let i = 0; i < minLen; i++) {
        const [aCode, bCode] = [strictAt(aCodes, i), strictAt(bCodes, i)];
        if (aCode !== bCode) {
          return aCode - bCode;
        }
      }

      if (aCodes.length === bCodes.length) {
        return 0;
      }

      return aCodes.length < bCodes.length ? -1 : 1;
    });

    // 重複を消す
    const removedDoubling = removeDoubling(sorted);

    if (metadata.datasize[0] !== removedDoubling.length) {
      metadata.datasize[0] = removedDoubling.length;
    }

    console.log(
      'successfully parsed contents',
      removedDoubling.length,
      'langs',
    );

    return { metadata, contents: removedDoubling };
  } catch (e) {
    throw Error('an error occured in cotecToJSON', { cause: e });
  }
};

import { fetchCotec } from './fetch.ts';
import { cotecToJSON } from './parsing.ts';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import type { Cotec } from './type.ts';
import type { ReadonlyDeep } from 'type-fest';
import { filePath, filePathOld } from './const.ts';

const main = async () => {
  const mode = process.argv.at(2);

  if (mode != null && mode !== 'dry') {
    throw TypeError('invalid argumant', { cause: mode });
  }

  const ctc = await fetchCotec(mode);
  const ctcJson: ReadonlyDeep<Cotec> = await cotecToJSON(ctc);

  if (mode === 'dry') {
    console.log('dry run');
    console.log(ctcJson.contents.map((c) => c.name[0]).join(', '));
    console.log('all tasks were finished');
    return;
  }

  const json = JSON.stringify(ctcJson, null, 2);
  await mkdir('./public/out', { recursive: true });

  await readFile(filePath, { encoding: 'utf-8' }).then(
    async (old) => {
      console.log(`copying from ${filePath} to ${filePathOld}...`);
      await writeFile(filePathOld, old);
    },
    () => console.log(`no previous version. skipped`),
  );

  console.log(`writing to ${filePath}...`);
  await writeFile(filePath, json);

  console.log('writing the file was successful');
  console.log('all tasks were finished');
};

main();

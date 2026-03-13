import { fetchCotec } from './fetch.ts';
import { cotecToJSON } from './parsing.ts';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const main = async () => {
  const mode = process.argv.at(2);

  if (mode != null && mode !== 'dry') {
    throw TypeError('invalid argumant', { cause: mode });
  }

  const filePath = './public/out/conlinguistics-wiki-list-cotec.json';
  const filePathOld = './public/out/conlinguistics-wiki-list-cotec-old.json';
  const ctc = await fetchCotec();
  const parsed = await cotecToJSON(ctc);

  if (mode === 'dry') {
    console.log('dry run');
    console.log(parsed.contents.map((c) => c.name[0]).join(', '));
    console.log('all tasks were finished');
    return;
  }

  const json = JSON.stringify(parsed, null, 2);
  await mkdir('./public/out', { recursive: true });

  await readFile(filePath, { encoding: 'utf-8' })
    .then(async (old) => {
      console.log(
        'copying previous version to conlinguistics-wiki-list-cotec-old.json...',
      );
      await writeFile(filePathOld, old);
    })
    .catch(() => console.log(`no previous version. skipped`));

  console.log('writing conlinguistics-wiki-list-cotec.json...');
  await writeFile(filePath, json);

  console.log('writing the file was successful');
  console.log('all tasks were finished');
};

main();

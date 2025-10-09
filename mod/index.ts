import { fetchCotec } from './fetch';
import { cotecToJSON } from './parsing';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const main = async () => {
  try {
    const ctc = await fetchCotec();
    const parsed = await cotecToJSON(ctc);
    const json = JSON.stringify(parsed, null, 2);
    const filePath = './public/out/conlinguistics-wiki-list-cotec.json';
    const filePathOld = './public/out/conlinguistics-wiki-list-cotec-old.json';

    await mkdir('./public/out', { recursive: true });

    await readFile(filePath, { encoding: 'utf8' })
      .then(async (old) => {
        console.log(
          'copying previous version to conlinguistics-wiki-list-cotec-old.json...'
        );
        await writeFile(filePathOld, old);
      })
      .catch(() => console.log(`no previous version. skipped`));

    // await writeFile(filePathOld, prev);
    console.log('writing conlinguistics-wiki-list-cotec.json...');
    await writeFile(filePath, json);

    console.log('writing the file was successful');
    console.log('all tasks were finished');
  } catch (e) {
    console.error(e);
    return Promise.reject(e);
  }
};

main();

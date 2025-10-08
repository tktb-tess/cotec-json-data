import { fetchCotec } from './fetch';
import { cotecToJSON } from './parsing';
import { mkdir, writeFile } from 'node:fs/promises';

const main = async () => {
  try {
    const ctc = await fetchCotec();
    const parsed = await cotecToJSON(ctc);
    const json = JSON.stringify(parsed);

    await mkdir('./public/out', { recursive: true });
    console.log('writing conlinguistics-wiki-list-cotec.json...');
    await writeFile('./public/out/conlinguistics-wiki-list-cotec.json', json);

    console.log('writing the file was successful');
  } catch (e) {
    console.error(e);
    return Promise.reject(e);
  }
};

main();

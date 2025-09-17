import { fetchCotec } from './fetch';
import { cotecToJSON } from './parsing';
import { mkdir, writeFile } from 'node:fs/promises';

const main = async () => {
  try {
    const ctc = await fetchCotec();
    const parsed = await cotecToJSON(ctc);

    await mkdir('./out', { recursive: true });
    await writeFile(
      './out/conlinguistics-wiki-list-cotec.json',
      JSON.stringify(parsed)
    );
    console.log('writing the file was successful');
  } catch (e) {
    console.error(e);
    throw e;
  }
};

main();

import { fetchCotec } from './src/fetch';
import { cotecToJSON } from './src/parsing';
import { writeFile } from 'node:fs/promises';

const main = async () => {
  try {
    const ctc = await fetchCotec();
    const parsed = await cotecToJSON(ctc);

    await writeFile(
      'parsed-from-conlinguistics-wiki-list.ctc.json',
      JSON.stringify(parsed)
    );
    console.log('writing the file was successful');
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

main();

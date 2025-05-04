import { fetchCotec } from './src/fetch';
import { cotecToJSON } from './src/parsing';
import { writeFile } from 'node:fs';

(async () => {
  try {
    const ctc = await fetchCotec();
    const parsed = await cotecToJSON(ctc);

    writeFile(
      'parsed-from-conlinguistics-wiki-list.ctc.json',
      JSON.stringify(parsed),
      (e) => {
        if (e) {
          console.error(e);
          process.exit(1);
        } else console.log('writing to a file was successful');
      }
    );
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();

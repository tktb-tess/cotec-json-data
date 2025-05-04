import { fetchCotec } from "./src/fetch";
import { cotecToJSON } from "./src/parsing";
import { writeFile } from 'node:fs';

(async () => {
    const ctc = await fetchCotec();

    if (ctc instanceof Error) {
        console.error(ctc);
        return;
    }
    
    const parsed = await cotecToJSON(ctc);

    writeFile('parsed-from-conlinguistics-wiki-list.ctc.json', JSON.stringify(parsed), (e) => {
        if (e) console.error(e);
        else console.log('writing to a file was successful');
    });
})();


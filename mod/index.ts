import { fetchCotec } from './fetch.ts';
import { cotecToJSON } from './parsing.ts';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { filePath, filePathOld } from './const.ts';
import type { Cotec } from './type.ts';
import type { ReadonlyDeep } from 'type-fest';

async function main() {
  const mode = process.argv.at(2);

  if (mode != null && mode !== 'dry' && mode !== 'preserve-old') {
    throw TypeError(`invalid argumant: ${mode}`);
  }

  const ctc = await fetchCotec(mode);
  const ctcJson = await cotecToJSON(ctc);

  if (mode === 'dry') {
    console.log('dry-run mode:');
    ctcJson.contents.forEach((l) => {
      console.log('id:', l.id);
      console.log('creator:', l.creator.join(', '));
      console.log('name:', l.name.join(', '));
      console.log('description:', l.desc.join(''));
      console.log('');
    });
    console.log('all tasks were finished');
    process.exit();
  }

  const prev = await readFile(filePath, { encoding: 'utf-8' })
    .then((j) => JSON.parse(j) as ReadonlyDeep<Cotec>)
    .catch(() => null);

  if (prev && prev.metadata.lastUpdate === ctcJson.metadata.lastUpdate) {
    console.log('no update exists. exit');
    process.exit();
  }

  const json = JSON.stringify(ctcJson, null, 2);
  await mkdir('./public/out', { recursive: true });

  if (mode === 'preserve-old') {
    console.log(`preserve-old mode: skip to copy previous json`);
  } else if (prev) {
    console.log(`copying from ${filePath} to ${filePathOld}...`);
    await writeFile(filePathOld, JSON.stringify(prev));
  } else {
    console.log("previous json doesn't exist");
  }

  console.log(`writing to ${filePath}...`);
  await writeFile(filePath, json);

  console.log('writing the file was successful');
  console.log('all tasks were finished');
}

main();

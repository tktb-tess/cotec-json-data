import { readFile } from 'node:fs/promises';
import { url, samplePath } from './const.ts';

export const fetchCotec = async (mode?: 'dry' | 'preserve-old') => {
  if (mode === 'dry') {
    return readFile(samplePath, { encoding: 'utf-8' });
  }

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort('Timeout'), 20000);
  console.log(`start fetching ${url}...`);
  const res = await fetch(url, { method: 'GET', signal: controller.signal });
  clearTimeout(id);

  if (!res.ok) {
    throw Error(`failed to fetch: ${res.status} ${res.statusText}`, {
      cause: res,
    });
  }

  console.log(`successfully fetched ${url}`);
  return res.text();
};

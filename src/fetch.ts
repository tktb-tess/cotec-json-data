const controller = new AbortController();

export const fetchCotec = async () => {
  const url =
    'https://kaeru2193.github.io/Conlang-List-Works/conlinguistics-wiki-list.ctc';

  const id = setTimeout(() => controller.abort(), 20000);
  const res = await fetch(url, { method: 'GET', signal: controller.signal });
  clearTimeout(id);
  if (!res.ok) {
    throw Error(`failed to fetch: ${res.status} ${res.statusText}`);
  }

  console.log('fetching was successful');
  return res.text();
};

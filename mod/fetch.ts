const controller = new AbortController();
const { signal } = controller;

export const fetchCotec = async () => {
  const url =
    'https://kaeru2193.github.io/Conlang-List-Works/conlinguistics-wiki-list.ctc';

  const id = setTimeout(() => controller.abort(), 20000);
  console.log(`start fetching ${url}...`);
  const res = await fetch(url, { method: 'GET', signal });
  clearTimeout(id);

  if (!res.ok) {
    throw Error(`failed to fetch: ${res.status} ${res.statusText}`, {
      cause: res,
    });
  }

  console.log(`successfully fetched ${url}`);
  return res.text();
};

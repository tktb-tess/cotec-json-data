
export const fetchCotec = async () => {
    const url = 'https://kaeru2193.github.io/Conlang-List-Works/conlinguistics-wiki-list.ctc';
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) {
        return Error(`failed to fetch: ${res.status}`);
    }

    return res.text();
};

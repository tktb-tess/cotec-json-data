const moyunes = [
	'INT',
	'ART',
	'EXP',
	'PHI',
	'HYP',
	'NAT',
	'REA',
	'IMG',
	'CIN',
	'CDE',
	'GEN',
	'SPE',
	'SON',
	'LIT',
	'KIN',
	'SER',
	'JOK',
	'PAV',
	'AAV',
	'PWL',
	'AWL',
	'TOL',
	'PRI',
	'PUB',
	'FIX'
] as const;

export type MoyuneClass = (typeof moyunes)[number];

export const isMoyune = (str: string): str is MoyuneClass => {
	for (const moyune of moyunes) {
		if (moyune === str) return true;
	}
	return false;
};

export type CotecMetadata = {
	datasize: [number, number];
	title: string;
	author: string[];
	date_created: string;
	date_last_updated: string;
	license: { name: string; content: string };
	advanced: number;
	label: string[];
	type: string[];
};

export type CotecContent = {
	messier: string | null;
	name: string[];
	kanji: string[];
	desc: string[];
	creator: string[];
	period: string | null;
	site: { name: string | null; url: string }[];
	twitter: string[];
	dict: string[];
	grammar: string[];
	world: string[];
	category: { name: string; content: string | null }[];
	moyune: MoyuneClass[];
	clav3: {
		dialect: string;
		language: string;
		family: string;
		creator: string;
	} | null;
	part: string | null;
	example: string[];
	script: string[];
};

export type Cotec = {
	metadata: CotecMetadata;
	contents: CotecContent[];
};
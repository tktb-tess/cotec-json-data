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
  'FIX',
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
  createdDate: string;
  lastUpdate: string;
  jsonLastUpdate: string;
  license: { name: string; content: string };
  advanced: number;
  label: string[];
  type: string[];
};

export type CotecContent = {
  id: string;
  messier?: unknown;
  name: string[];
  kanji: string[];
  desc: string[];
  creator: string[];
  period?: string;
  site?: { name?: string; url: string }[];
  twitter?: string[];
  dict?: string[];
  grammar?: string[];
  world?: string[];
  category?: { name: string; content?: string }[];
  moyune?: MoyuneClass[];
  clav3?: {
    dialect: string;
    language: string;
    family: string;
    creator: string;
  };
  part?: string;
  example?: string[];
  script?: string[];
};

export type Cotec = {
  metadata: CotecMetadata;
  contents: CotecContent[];
};

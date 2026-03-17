// Shared section definitions — used by homepage, section pages, and navigation
import statsData from './stats.json';

export interface HistoryPoint {
  year: number;
  value: number;
}

export interface Details {
  chartType?: string;
  chartLabel?: string;
  history?: HistoryPoint[];
}

export interface Stat {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  description?: string;
  source?: string;
  change?: number;
  highlight?: boolean;
  details?: Details;
}

export interface Section {
  title: string;
  description: string;
  stats: Stat[];
}

export interface SectionDef {
  id: string;
  slug: string;
  dataKey: string;
  data: Section;
  icon: string;
}

const data = statsData as Record<string, any>;
export const meta = data.meta as { lastUpdated: string; version: string };

export const sectionIcons: Record<string, string> = {
  'demografie': '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  'ekonomika': '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
  'bydleni': '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  'vzdelani': '<path d="M22 10v6"/><path d="M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5"/>',
  'zdravotnictvi': '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  'bezpecnost': '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  'geografie': '<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>',
  'doprava': '<rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
  'energie': '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  'zivotni-prostredi': '<path d="M17 22v-2"/><path d="M7 22v-2"/><path d="M12 2L7 7h3l-4 5h3l-5 6h16l-5-6h3l-4-5h3z"/>',
  'digitalizace': '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
  'kultura': '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  'turismus': '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  'zajimavosti': '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
};

// Section order + slug mapping
const sectionDefs: { id: string; slug: string; dataKey: string }[] = [
  { id: 'demografie', slug: 'demografie', dataKey: 'demografie' },
  { id: 'ekonomika', slug: 'ekonomika', dataKey: 'ekonomika' },
  { id: 'bydleni', slug: 'bydleni', dataKey: 'bydleni' },
  { id: 'vzdelani', slug: 'vzdelani', dataKey: 'vzdelani' },
  { id: 'zdravotnictvi', slug: 'zdravotnictvi', dataKey: 'zdravotnictvi' },
  { id: 'bezpecnost', slug: 'bezpecnost', dataKey: 'bezpecnost' },
  { id: 'geografie', slug: 'geografie', dataKey: 'geografie' },
  { id: 'doprava', slug: 'doprava', dataKey: 'doprava' },
  { id: 'energie', slug: 'energie', dataKey: 'energie' },
  { id: 'zivotni-prostredi', slug: 'zivotni-prostredi', dataKey: 'zivotniProstredi' },
  { id: 'digitalizace', slug: 'digitalizace', dataKey: 'digitalizace' },
  { id: 'kultura', slug: 'kultura', dataKey: 'kultura' },
  { id: 'turismus', slug: 'turismus', dataKey: 'turismus' },
  { id: 'zajimavosti', slug: 'zajimavosti', dataKey: 'zajimavosti' },
];

export const sections: SectionDef[] = sectionDefs.map(s => ({
  ...s,
  data: data[s.dataKey] as Section,
  icon: sectionIcons[s.id] || '',
}));

// SEO descriptions per section
export const seoDescriptions: Record<string, string> = {
  'demografie': 'Počet obyvatel, věková struktura, porodnost a migrace v České republice. Aktuální demografické statistiky z ČSÚ.',
  'ekonomika': 'HDP, nezaměstnanost, inflace, průměrná mzda a státní dluh České republiky. Ekonomické ukazatele z ČSÚ a Eurostatu.',
  'bydleni': 'Ceny bytů, nájemné, bytová výstavba a vlastnické bydlení v ČR. Data z Českého statistického úřadu.',
  'vzdelani': 'Počet studentů, vysoké školy a vzdělávací systém v České republice. Statistiky vzdělávání.',
  'zdravotnictvi': 'Počet lékařů, nemocnic, zdravotních sester a zdravotnických zařízení v ČR.',
  'bezpecnost': 'Kriminalita, objasněnost trestných činů a dopravní nehody v České republice. Statistiky Policie ČR.',
  'geografie': 'Rozloha, kraje, obce a geografické údaje o České republice.',
  'doprava': 'Silnice, dálnice, železnice a počet automobilů v České republice.',
  'energie': 'Výroba elektřiny, jaderné elektrárny, obnovitelné zdroje a energetický mix ČR.',
  'zivotni-prostredi': 'Emise CO₂, recyklace, chráněná území a stav životního prostředí v ČR.',
  'digitalizace': 'Internet v domácnostech, e-government, ICT odborníci a rychlost internetu v České republice.',
  'kultura': 'Knihovny, muzea, galerie a divadla v České republice. Kulturní statistiky z NIPOS.',
  'turismus': 'Počet turistů, UNESCO památky a cestovní ruch v České republice.',
  'zajimavosti': 'Spotřeba piva, počet hradů, zámků, rybníků a pivovarů v ČR. Unikátní česká čísla.',
};

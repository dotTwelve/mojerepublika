#!/usr/bin/env node
/**
 * Data fetcher for mojerepublika.cz
 *
 * Stahuje ověřená data z oficiálních zdrojů:
 * - ČSÚ (czso.cz) — hlavní zdroj
 * - Eurostat — EU srovnání
 * - Policie ČR — kriminalita
 *
 * Použití:
 *   node scripts/fetch-data.js
 *
 * Výstup:
 *   Vypíše nalezená data a kde je ručně ověřit.
 *   NEUPRAVUJE stats.json automaticky — musíš data zkontrolovat a doplnit ručně.
 *
 * ČSÚ API dokumentace: https://vdb.czso.cz/pll/eweb/package_show?id=cz-czso-310
 */

const CZSO_API = 'https://vdb.czso.cz/pll/eweb';

// Data co potřebujeme ověřit a stáhnout
const dataRequests = [
  // ===== STÁVAJÍCÍ DATA K OVĚŘENÍ =====
  {
    section: 'demografie',
    stat: 'population',
    label: 'Počet obyvatel',
    manualSource: 'https://vdb.czso.cz/vdbvo2/faces/cs/index.jsf?page=vystup-objekt&pvo=DEM01&z=T',
    note: 'ČSÚ → Obyvatelstvo → Počet obyvatel (stav k 31.12.)'
  },
  {
    section: 'demografie',
    stat: 'life-expectancy',
    label: 'Naděje dožití',
    manualSource: 'https://vdb.czso.cz/vdbvo2/faces/cs/index.jsf?page=vystup-objekt&pvo=DEM09&z=T',
    note: 'ČSÚ → Obyvatelstvo → Naděje dožití při narození'
  },
  {
    section: 'ekonomika',
    stat: 'gdp',
    label: 'HDP',
    manualSource: 'https://apl.czso.cz/pll/rocenka/rocenka.presmsocas',
    note: 'ČSÚ → Makroekonomika → HDP. Eurostat: nama_10_gdp'
  },
  {
    section: 'ekonomika',
    stat: 'unemployment',
    label: 'Nezaměstnanost',
    manualSource: 'https://vdb.czso.cz/vdbvo2/faces/cs/index.jsf?page=vystup-objekt&pvo=ZAM01-A&z=T',
    note: 'ČSÚ → Zaměstnanost → Obecná míra nezaměstnanosti (VŠPS)'
  },
  {
    section: 'ekonomika',
    stat: 'inflation',
    label: 'Inflace',
    manualSource: 'https://vdb.czso.cz/vdbvo2/faces/cs/index.jsf?page=vystup-objekt&pvo=CEN08&z=T',
    note: 'ČSÚ → Ceny → Indexy spotřebitelských cen → Průměrná roční míra inflace'
  },
  {
    section: 'ekonomika',
    stat: 'average-wage',
    label: 'Průměrná mzda',
    manualSource: 'https://vdb.czso.cz/vdbvo2/faces/cs/index.jsf?page=vystup-objekt&pvo=MZD01-A&z=T',
    note: 'ČSÚ → Práce a mzdy → Průměrná hrubá měsíční mzda'
  },

  // ===== NOVÁ DATA K DOPLNĚNÍ =====

  // Bydlení
  {
    section: 'bydleni',
    stat: 'apartment-price',
    label: 'Cena bytu (Kč/m²)',
    manualSource: 'https://vdb.czso.cz/vdbvo2/faces/cs/index.jsf?page=vystup-objekt&pvo=CEN11&z=T',
    note: 'ČSÚ → Ceny → Ceny sledovaných druhů nemovitostí. Alternativně Deloitte Property Index.'
  },
  {
    section: 'bydleni',
    stat: 'completed-dwellings',
    label: 'Dokončené byty',
    manualSource: 'https://vdb.czso.cz/vdbvo2/faces/cs/index.jsf?page=vystup-objekt&pvo=BYT04&z=T',
    note: 'ČSÚ → Stavebnictví, byty → Bytová výstavba → Dokončené byty'
  },
  {
    section: 'bydleni',
    stat: 'home-ownership',
    label: 'Vlastnické bydlení (%)',
    manualSource: 'https://ec.europa.eu/eurostat/databrowser/view/ilc_lvho02/default/table',
    note: 'Eurostat → Living conditions → Housing → Distribution of population by tenure status (ilc_lvho02)'
  },
  {
    section: 'bydleni',
    stat: 'avg-rent',
    label: 'Průměrný nájem',
    manualSource: 'https://vdb.czso.cz/vdbvo2/faces/cs/index.jsf?page=vystup-objekt&pvo=CEN10&z=T',
    note: 'ČSÚ → Ceny → Tržní nájemné bytů'
  },

  // Digitalizace
  {
    section: 'digitalizace',
    stat: 'internet-households',
    label: 'Domácnosti s internetem (%)',
    manualSource: 'https://vdb.czso.cz/vdbvo2/faces/cs/index.jsf?page=vystup-objekt&pvo=ICT01&z=T',
    note: 'ČSÚ → Informační společnost v číslech → Domácnosti s připojením k internetu. Historická data 2015-2024 dostupná.'
  },
  {
    section: 'digitalizace',
    stat: 'egovernment',
    label: 'E-government využití (%)',
    manualSource: 'https://vdb.czso.cz/vdbvo2/faces/cs/index.jsf?page=vystup-objekt&pvo=ICT06&z=T',
    note: 'ČSÚ → Informační společnost → Jednotlivci komunikující s veřejnou správou přes internet'
  },
  {
    section: 'digitalizace',
    stat: 'ict-workers',
    label: 'ICT odborníci (tis.)',
    manualSource: 'https://vdb.czso.cz/vdbvo2/faces/cs/index.jsf?page=vystup-objekt&pvo=ICT10&z=T',
    note: 'ČSÚ → Informační společnost → ICT odborníci'
  },

  // Kultura
  {
    section: 'kultura',
    stat: 'libraries',
    label: 'Veřejné knihovny',
    manualSource: 'https://statistikakultury.cz/knihovny/',
    note: 'NIPOS → Statistika kultury → Knihovny. ČR má jednu z nejhustších sítí na světě.'
  },
  {
    section: 'kultura',
    stat: 'museums',
    label: 'Muzea a galerie',
    manualSource: 'https://statistikakultury.cz/muzea-a-galerie/',
    note: 'NIPOS → Statistika kultury → Muzea a galerie'
  },
  {
    section: 'kultura',
    stat: 'museum-visitors',
    label: 'Návštěvnost muzeí (mil.)',
    manualSource: 'https://statistikakultury.cz/muzea-a-galerie/',
    note: 'NIPOS → Statistika kultury → Muzea a galerie → Návštěvnost'
  },
  {
    section: 'kultura',
    stat: 'theaters',
    label: 'Divadla',
    manualSource: 'https://statistikakultury.cz/divadla/',
    note: 'NIPOS → Statistika kultury → Divadla'
  },

  // Bezpečnost
  {
    section: 'bezpecnost',
    stat: 'crime-total',
    label: 'Trestné činy celkem (tis.)',
    manualSource: 'https://www.policie.cz/statistiky-kriminality.aspx',
    note: 'Policie ČR → Statistiky kriminality → Přehled kriminality. Historická data dostupná.'
  },
  {
    section: 'bezpecnost',
    stat: 'crime-clearance',
    label: 'Objasněnost (%)',
    manualSource: 'https://www.policie.cz/statistiky-kriminality.aspx',
    note: 'Policie ČR → Statistiky kriminality → Objasněnost'
  },
  {
    section: 'bezpecnost',
    stat: 'traffic-accidents',
    label: 'Dopravní nehody (tis.)',
    manualSource: 'https://www.policie.cz/clanek/statistika-nehodovosti-900835.aspx',
    note: 'Policie ČR → Dopravní nehodovost'
  },

  // Zajímavosti
  {
    section: 'zajimavosti',
    stat: 'beer-consumption',
    label: 'Spotřeba piva (l/osobu)',
    manualSource: 'https://www.ceske-pivo.cz/statistiky',
    note: 'Český svaz pivovarů a sladoven → Statistiky. ČR je #1 na světě.'
  },
  {
    section: 'zajimavosti',
    stat: 'castles',
    label: 'Hrady a zámky',
    manualSource: 'https://www.npu.cz/cs/npu-a-pamatkova-pece/npu/spravovane-pamatkove-objekty',
    note: 'Národní památkový ústav → Spravované objekty'
  },
  {
    section: 'zajimavosti',
    stat: 'breweries',
    label: 'Pivovary',
    manualSource: 'https://www.ceske-pivo.cz/statistiky',
    note: 'Český svaz pivovarů → Počet aktivních pivovarů'
  },
];

console.log('='.repeat(70));
console.log('MOJEREPUBLIKA — Průvodce doplněním dat');
console.log('='.repeat(70));
console.log();
console.log('Tento skript NESTAHUJE data automaticky.');
console.log('Vypisuje přesné zdroje odkud každé číslo získat.');
console.log('Po ověření doplň hodnoty do src/data/stats.json.');
console.log();

// Group by section
const grouped = {};
for (const req of dataRequests) {
  if (!grouped[req.section]) grouped[req.section] = [];
  grouped[req.section].push(req);
}

for (const [section, items] of Object.entries(grouped)) {
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`📂 ${section.toUpperCase()}`);
  console.log(`${'─'.repeat(50)}`);

  for (const item of items) {
    console.log(`\n  📊 ${item.label}`);
    console.log(`     ID: ${item.stat}`);
    console.log(`     📎 ${item.note}`);
    console.log(`     🔗 ${item.manualSource}`);
  }
}

console.log(`\n${'='.repeat(70)}`);
console.log('DOPORUČENÍ PRO HISTORICKÁ DATA (grafy):');
console.log('='.repeat(70));
console.log(`
Statistiky kde má smysl mít historii 2015-2024:

STÁVAJÍCÍ (ověřit):
  ✅ Počet obyvatel — má historii
  ✅ Medián věku — má historii
  ✅ Naděje dožití — má historii
  ✅ HDP růst — má historii
  ✅ Nezaměstnanost — má historii
  ✅ Inflace — má historii
  ✅ Průměrná mzda — má historii
  ✅ Emise CO₂ — má historii
  ✅ Podíl OZE — má historii
  ✅ Turisté — má historii

NOVÉ — přidat historii:
  📈 Domácnosti s internetem (ČSÚ ICT01) — dostupné 2005+
  📈 Trestné činy celkem (Policie ČR) — dostupné 2000+
  📈 Cena bytu Kč/m² (ČSÚ CEN11) — dostupné 2010+
  📈 Dokončené byty (ČSÚ BYT04) — dostupné 2000+

STÁVAJÍCÍ — rozšířit o historii:
  📈 HDP na obyvatele (Eurostat) — přidat historii
  📈 Minimální mzda (MPSV) — přidat historii

Po doplnění dat spusť: npm run build
`);

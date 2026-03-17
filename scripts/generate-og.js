#!/usr/bin/env node
/**
 * Generates OG images from stats.json data
 * - /public/og-image.png (homepage)
 * - /public/og/[section].png (per section)
 */

import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const stats = JSON.parse(readFileSync(resolve(__dirname, '../src/data/stats.json'), 'utf-8'));
const lastUpdated = new Date(stats.meta.lastUpdated).toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' });

const WIDTH = 1200;
const HEIGHT = 630;

const sectionMap = {
  demografie: 'demografie', ekonomika: 'ekonomika', bydleni: 'bydleni',
  vzdelani: 'vzdelani', zdravotnictvi: 'zdravotnictvi', bezpecnost: 'bezpecnost',
  geografie: 'geografie', doprava: 'doprava', energie: 'energie',
  zivotniProstredi: 'zivotni-prostredi', digitalizace: 'digitalizace',
  kultura: 'kultura', turismus: 'turismus', zajimavosti: 'zajimavosti',
  politika: 'politika',
};

function renderSvg(title, subtitle, statCards) {
  const cards = statCards.slice(0, 4).map((stat, i) => {
    const x = 60 + i * 270;
    const y = 320;
    const val = String(stat.value);
    const unit = stat.unit || '';
    return `
      <g>
        <rect x="${x}" y="${y}" width="245" height="100" rx="12" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
        <text x="${x + 20}" y="${y + 28}" fill="#64748B" font-family="Arial, sans-serif" font-size="11" letter-spacing="1.5">${stat.label.toUpperCase().slice(0, 20)}</text>
        <text x="${x + 20}" y="${y + 65}" fill="white" font-family="Georgia, serif" font-size="30" font-weight="700">${val}</text>
        <text x="${x + 20}" y="${y + 85}" fill="#64748B" font-family="Arial, sans-serif" font-size="13">${unit}</text>
      </g>
    `;
  }).join('');

  return `
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#1E293B"/>
    </linearGradient>
    <linearGradient id="tricolor" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="50%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#d80c13"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#0369A1"/>
      <stop offset="100%" stop-color="#0EA5E9"/>
    </linearGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <rect x="0" y="0" width="${WIDTH}" height="6" fill="url(#tricolor)"/>
  <g opacity="0.03">
    ${Array.from({length: 18}, (_, i) => `<line x1="${i * 70}" y1="0" x2="${i * 70}" y2="${HEIGHT}" stroke="white" stroke-width="1"/>`).join('')}
  </g>

  <!-- Flag -->
  <g transform="translate(60, 50)">
    <rect width="50" height="34" rx="3" fill="#d80c13"/>
    <rect width="50" height="17" rx="3" fill="#ffffff"/>
    <polygon points="0,0 25,17 0,34" fill="#0F172A"/>
  </g>

  <text x="124" y="72" fill="white" font-family="Georgia, serif" font-size="28" font-weight="700">Moje Republika</text>
  <text x="124" y="94" fill="#94A3B8" font-family="Arial, sans-serif" font-size="13" letter-spacing="2">${subtitle}</text>

  <rect x="60" y="116" width="180" height="2" fill="url(#accent)" rx="1"/>

  <text x="60" y="175" fill="#94A3B8" font-family="Arial, sans-serif" font-size="13" letter-spacing="2">${title.toUpperCase()}</text>
  <text x="60" y="250" fill="white" font-family="Georgia, serif" font-size="56" font-weight="700">${title}</text>

  ${cards}

  <rect x="0" y="${HEIGHT - 60}" width="${WIDTH}" height="60" fill="rgba(0,0,0,0.3)"/>
  <text x="60" y="${HEIGHT - 28}" fill="#64748B" font-family="Arial, sans-serif" font-size="13">mojerepublika.cz</text>
  <text x="${WIDTH - 60}" y="${HEIGHT - 28}" fill="#475569" font-family="Arial, sans-serif" font-size="12" text-anchor="end">Aktualizace: ${lastUpdated}</text>

  <rect x="0" y="${HEIGHT - 4}" width="${WIDTH}" height="4" fill="url(#tricolor)"/>
</svg>`;
}

function renderPng(svg, outputPath) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: WIDTH },
    font: { loadSystemFonts: true },
  });
  const png = resvg.render().asPng();
  writeFileSync(outputPath, png);
  return png.length;
}

// --- Generate homepage OG ---
const population = stats.demografie.stats.find(s => s.id === 'population');
const gdp = stats.ekonomika.stats.find(s => s.id === 'gdp');
const unemployment = stats.ekonomika.stats.find(s => s.id === 'unemployment');
const area = stats.geografie.stats.find(s => s.id === 'area');

const homeSvg = renderSvg('Česká republika v číslech', '15 SEKCÍ · 75+ STATISTIK · OTEVŘENÁ DATA', [
  { label: 'Obyvatel', value: population?.value + ' mil.', unit: '' },
  { label: 'HDP', value: gdp?.value, unit: 'mld. €' },
  { label: 'Nezaměstnanost', value: unemployment?.value, unit: '%' },
  { label: 'Rozloha', value: area?.value, unit: 'km²' },
]);
const homeSize = renderPng(homeSvg, resolve(__dirname, '../public/og-image.png'));
console.log(`✓ og-image.png (${(homeSize / 1024).toFixed(0)} KB)`);

// --- Generate per-section OG images ---
const ogDir = resolve(__dirname, '../public/og');
if (!existsSync(ogDir)) mkdirSync(ogDir, { recursive: true });

for (const [dataKey, slug] of Object.entries(sectionMap)) {
  const section = stats[dataKey];
  if (!section) continue;

  const topStats = section.stats.slice(0, 4).map(s => ({
    label: s.label,
    value: String(s.value),
    unit: s.unit || '',
  }));

  const svg = renderSvg(section.title, 'MOJE REPUBLIKA · OTEVŘENÁ DATA', topStats);
  const size = renderPng(svg, resolve(ogDir, `${slug}.png`));
  console.log(`✓ og/${slug}.png (${(size / 1024).toFixed(0)} KB)`);
}

console.log(`\n✓ Celkem: 1 homepage + ${Object.keys(sectionMap).length} section OG images`);

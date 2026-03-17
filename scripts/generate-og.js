#!/usr/bin/env node
/**
 * Generates dynamic OG image from stats.json data
 * Run: node scripts/generate-og.js
 * Output: public/og-image.png (1200x630)
 */

import { Resvg } from '@resvg/resvg-js';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const stats = JSON.parse(readFileSync(resolve(__dirname, '../src/data/stats.json'), 'utf-8'));

// Extract key stats for OG image
const population = stats.demografie.stats.find(s => s.id === 'population');
const gdp = stats.ekonomika.stats.find(s => s.id === 'gdp');
const unemployment = stats.ekonomika.stats.find(s => s.id === 'unemployment');
const tourists = stats.turismus.stats.find(s => s.id === 'tourists');
const area = stats.geografie.stats.find(s => s.id === 'area');
const beer = stats.zajimavosti.stats.find(s => s.id === 'beer-consumption');

const lastUpdated = new Date(stats.meta.lastUpdated).toLocaleDateString('cs-CZ', { month: 'long', year: 'numeric' });

const WIDTH = 1200;
const HEIGHT = 630;

const svg = `
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#1E293B"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#0369A1"/>
      <stop offset="100%" stop-color="#0EA5E9"/>
    </linearGradient>
    <linearGradient id="tricolor" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="50%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#d80c13"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>

  <!-- Top tricolor bar -->
  <rect x="0" y="0" width="${WIDTH}" height="6" fill="url(#tricolor)"/>

  <!-- Subtle grid pattern -->
  <g opacity="0.04">
    ${Array.from({length: 20}, (_, i) => `<line x1="${i * 65}" y1="0" x2="${i * 65}" y2="${HEIGHT}" stroke="white" stroke-width="1"/>`).join('')}
    ${Array.from({length: 10}, (_, i) => `<line x1="0" y1="${i * 70}" x2="${WIDTH}" y2="${i * 70}" stroke="white" stroke-width="1"/>`).join('')}
  </g>

  <!-- Flag icon -->
  <g transform="translate(60, 50)">
    <rect width="56" height="38" rx="3" fill="#d80c13"/>
    <rect width="56" height="19" rx="3" fill="#ffffff"/>
    <polygon points="0,0 28,19 0,38" fill="#0F172A"/>
  </g>

  <!-- Title -->
  <text x="130" y="75" fill="white" font-family="Georgia, serif" font-size="32" font-weight="700">Moje Republika</text>
  <text x="130" y="98" fill="#94A3B8" font-family="Arial, sans-serif" font-size="14" letter-spacing="3">ČESKÁ REPUBLIKA V ČÍSLECH</text>

  <!-- Divider -->
  <rect x="60" y="120" width="200" height="2" fill="url(#accent)" rx="1"/>

  <!-- Main stat: Population -->
  <text x="60" y="185" fill="#94A3B8" font-family="Arial, sans-serif" font-size="13" letter-spacing="2" text-transform="uppercase">OBYVATEL</text>
  <text x="60" y="240" fill="white" font-family="Georgia, serif" font-size="64" font-weight="700">${population?.value || '10,9'}</text>
  <text x="280" y="240" fill="#64748B" font-family="Arial, sans-serif" font-size="28">milionů</text>

  <!-- Stat cards row -->
  ${[
    { label: 'HDP', value: `${gdp?.value || 290}`, unit: 'mld. €', change: gdp?.change },
    { label: 'NEZAMĚSTNANOST', value: `${unemployment?.value || 2.8}`, unit: '%', change: null },
    { label: 'TURISTŮ', value: `${tourists?.value || '22,8'}`, unit: 'mil./rok', change: tourists?.change },
    { label: 'ROZLOHA', value: `${area?.value || '78 871'}`, unit: 'km²', change: null },
  ].map((stat, i) => {
    const x = 60 + i * 275;
    const y = 300;
    return `
      <g>
        <rect x="${x}" y="${y}" width="250" height="110" rx="12" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
        <text x="${x + 20}" y="${y + 30}" fill="#64748B" font-family="Arial, sans-serif" font-size="11" letter-spacing="1.5">${stat.label}</text>
        <text x="${x + 20}" y="${y + 70}" fill="white" font-family="Georgia, serif" font-size="34" font-weight="700">${stat.value}</text>
        <text x="${x + 20}" y="${y + 92}" fill="#64748B" font-family="Arial, sans-serif" font-size="14">${stat.unit}${stat.change ? ` · ${stat.change > 0 ? '↑' : '↓'} ${Math.abs(stat.change)}%` : ''}</text>
      </g>
    `;
  }).join('')}

  <!-- Bottom bar -->
  <rect x="0" y="${HEIGHT - 80}" width="${WIDTH}" height="80" fill="rgba(0,0,0,0.3)"/>
  <text x="60" y="${HEIGHT - 40}" fill="#64748B" font-family="Arial, sans-serif" font-size="14">mojerepublika.cz</text>
  <text x="350" y="${HEIGHT - 40}" fill="#475569" font-family="Arial, sans-serif" font-size="13">15 sekcí · 75+ statistik · Otevřená data</text>
  <text x="${WIDTH - 60}" y="${HEIGHT - 40}" fill="#475569" font-family="Arial, sans-serif" font-size="13" text-anchor="end">Aktualizace: ${lastUpdated}</text>

  <!-- Bottom tricolor -->
  <rect x="0" y="${HEIGHT - 4}" width="${WIDTH}" height="4" fill="url(#tricolor)"/>
</svg>
`;

// Render to PNG
const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: WIDTH },
  font: {
    loadSystemFonts: true,
  },
});

const png = resvg.render().asPng();
const outputPath = resolve(__dirname, '../public/og-image.png');
writeFileSync(outputPath, png);

console.log(`✓ OG image generated: ${outputPath} (${(png.length / 1024).toFixed(0)} KB)`);

# 🇨🇿 Moje Republika

Otevřená statistická stránka prezentující data o České republice.

**Live:** [mojerepublika.cz](https://mojerepublika.cz)

## Tech Stack

- **Framework:** [Astro](https://astro.build) v5
- **Hosting:** [Vercel](https://vercel.com)
- **Doména:** Forpsi

## Lokální vývoj

```bash
# Instalace závislostí
npm install

# Spuštění dev serveru
npm run dev

# Build pro produkci
npm run build

# Preview produkčního buildu
npm run preview
```

## Struktura projektu

```
mojerepublika/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   └── StatCard.astro
│   ├── layouts/
│   │   └── Layout.astro
│   ├── pages/
│   │   └── index.astro
│   └── styles/
│       └── global.css
├── astro.config.mjs
└── package.json
```

## Přidání nových statistik

1. Otevři `src/pages/index.astro`
2. Přidej novou `<StatCard>` komponentu s parametry:
   - `label` – název statistiky
   - `value` – hodnota
   - `unit` – jednotka (volitelné)
   - `description` – popis (volitelné)
   - `change` – změna v % (volitelné, zobrazí trend)
   - `source` – zdroj dat (volitelné)
   - `highlight` – zvýrazněná karta (volitelné)

```astro
<StatCard 
  label="Název"
  value="123"
  unit="jednotka"
  description="Popis statistiky"
  change={2.5}
  source="Zdroj, rok"
/>
```

## Deployment

Projekt je automaticky deployován na Vercel při push do `main` větve.

### Nastavení domény

1. V Vercel dashboardu přidej doménu `mojerepublika.cz`
2. Na Forpsi nastav DNS záznamy:
   - `A` záznam: `76.76.21.21`
   - `CNAME` pro `www`: `cname.vercel-dns.com`

## Zdroje dat

- [Český statistický úřad (ČSÚ)](https://www.czso.cz)
- [Eurostat](https://ec.europa.eu/eurostat)
- [Česká národní banka (ČNB)](https://www.cnb.cz)

## Licence

MIT

## Přispívání

Příspěvky jsou vítány! Otevři issue nebo pošli pull request.

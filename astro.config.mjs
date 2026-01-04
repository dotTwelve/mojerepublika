import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://mojerepublika.cz',
  output: 'static',
  build: {
    assets: 'assets'
  },
  vite: {
    build: {
      cssMinify: true
    }
  }
});

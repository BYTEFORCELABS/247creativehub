// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Set SITE_URL to the production domain when deploying (used for canonical URLs,
// Open Graph tags and the sitemap). Falls back to the current hosted address.
const site = process.env.SITE_URL || 'https://supply-chain-solutions.agu-desmond811800.chatgpt.site';

export default defineConfig({
  site,
  trailingSlash: 'ignore',
  integrations: [sitemap({ filter: (page) => !page.includes('/404') })],
  build: { inlineStylesheets: 'auto' },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
});

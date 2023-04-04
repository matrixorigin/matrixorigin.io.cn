import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'
import AutoImport from 'astro-auto-import'
import mdx from '@astrojs/mdx'
import solidJs from '@astrojs/solid-js'

import vitesseDark from './src/styles/vitesse-dark.json'
import { astroAsides, asideAutoImport } from './src/integrations/astro-asides'
import { astroMKDocsLink } from './src/integrations/astro-mkdocs-link'

// https://astro.build/config
export default defineConfig({
  markdown: {
    shikiConfig: {
      theme: vitesseDark,
    },
  },
  integrations: [
    AutoImport({
      imports: [asideAutoImport],
    }),
    tailwind(),
    astroMKDocsLink(),
    astroAsides(),
    mdx(),
    solidJs(),
  ],
})

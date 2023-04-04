import { resolve } from 'node:path'

import { defineConfig } from 'vite'

/**
 * Enable using aliased modules outside standard `astro` dirs, where modules are processed by its own **fresh** Vite dev server.
 * @see https://github.com/withastro/astro/issues/5990
 */
export default defineConfig({
  resolve: {
    alias: {
      '~': resolve('./src'),
    },
  },
})

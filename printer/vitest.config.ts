/// <reference types="vitest" />
import { getViteConfig } from 'astro/config'

export default getViteConfig({
  test: {
    exclude: ['tests/print.spec.ts', 'node_modules'],
  },
})

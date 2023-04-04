import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import type { AstroIntegration } from 'astro'
import type { Root as MdastRoot } from 'mdast'
import type {
  Plugin as UnifiedPlugin,
  Transformer as UnifiedTransformer,
} from 'unified'
import { visit } from 'unist-util-visit'

import { extractMainTitle } from '../shared'

const DOCS_ABS_DIR = join(process.cwd(), '../docs')

function remarkMKDocsLink(): UnifiedPlugin<[], MdastRoot> {
  const transformer: UnifiedTransformer<MdastRoot> = async (tree, file) => {
    const linkTasks: Promise<void>[] = []
    // Walk the tree
    visit(tree, (node) => {
      if (node.type === 'link') {
        // Link url
        const url = node.url
        // Bypass hyper links.
        if (/^https?:\/\//.test(url)) {
          return
        }
        // Bypass non-file links.
        if (!/.mdx?$/.test(url)) {
          return
        }
        // Absolute dirname
        const dir = file.dirname
        // Link target file path
        let path = /^MatrixOne\//.test(url)
          ? join(DOCS_ABS_DIR, url)
          : join(dir, url)
        existsSync(path) || (path += 'x')
        linkTasks.push(
          readFile(path, 'utf8').then((src) => {
            const title = extractMainTitle(src)
            node.url = `#${title}`
          })
        )
      }
    })
    await Promise.all(linkTasks)
  }

  return () => transformer
}

export function astroMKDocsLink(): AstroIntegration {
  return {
    name: '@astrojs/mkdocs-link',
    hooks: {
      'astro:config:setup': ({ updateConfig }) => {
        updateConfig({
          markdown: {
            remarkPlugins: [remarkMKDocsLink()],
          },
        })
      },
    },
  }
}

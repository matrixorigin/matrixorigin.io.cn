import type { AstroIntegration } from 'astro'
import type { Root as MdastRoot, Paragraph as MdastParagraph } from 'mdast'
import type {
  Plugin as UnifiedPlugin,
  Transformer as UnifiedTransformer,
} from 'unified'
import remarkDirective from 'remark-directive'
import { visit } from 'unist-util-visit'
import { remove } from 'unist-util-remove'

import type { TupleToUnion } from '../shared'
import { constructComponentNode, isMDXFile } from './utils'

const ASIDE_TAG_NAME = 'AutoImportAside'
export const ASIDE_VARIANTS = ['info', 'note', 'warn'] as const
export type AsideVariant = TupleToUnion<typeof ASIDE_VARIANTS>

export const asideAutoImport: Record<string, [string, string][]> = {
  '~/components/Aside.astro': [['default', ASIDE_TAG_NAME]],
}

function remarkAsides(): UnifiedPlugin<[], MdastRoot> {
  const transformer: UnifiedTransformer<MdastRoot> = (tree, file) => {
    // Walk the tree
    visit(tree, (node, index, parent) => {
      // Co-work with remark-directive
      if (node.type !== 'containerDirective') {
        return
      }
      const type = node.name
      if (!ASIDE_VARIANTS.includes(type as AsideVariant)) {
        return
      }

      let title: string | undefined
      // Extract the title prop, then remove the corresponding node.
      remove(node, (child) => {
        // Co-work with remark-directive
        if (child.data?.directiveLabel) {
          if ('children' in child && Array.isArray(child.children)) {
            title = child.children[0]?.value
          }
          return true
        }
        return false
      })

      // Replace this node with the aside component it represents.
      if (parent && index) {
        parent.children[index] = constructComponentNode(
          ASIDE_TAG_NAME,
          { mdx: isMDXFile(file), attributes: { type, title } },
          ...node.children
        ) as MdastParagraph
      }
    })
  }

  // Returns a Remark Plugin
  return function attacher() {
    return transformer
  }
}

export function astroAsides(): AstroIntegration {
  return {
    name: '@astrojs/asides',
    hooks: {
      'astro:config:setup': ({ updateConfig }) => {
        updateConfig({
          markdown: {
            remarkPlugins: [remarkDirective, remarkAsides()],
          },
        })
      },
    },
  }
}

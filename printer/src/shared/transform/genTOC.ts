import type { PostNode } from './types'

/** Generate TOC from post nodes */
export function genTOC(nodes: PostNode[], level = 1) {
  let toc = ''

  for (const { title, children, path } of nodes) {
    // Indentation is 4 whitespaces.
    toc += `${'    '.repeat(level - 1)}"${title}"${path ? ' $$' : ''}\n`
    // Recursively generate TOC for children.
    if (children.length > 0) {
      toc += genTOC(children, level + 1)
    }
  }

  return toc
}

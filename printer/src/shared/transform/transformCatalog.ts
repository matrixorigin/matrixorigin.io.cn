import type { PostNode, NestedObject } from './types'

/**
 * Transform catalog object to post nodes.
 * @param obj Catalog object.
 */
export function transformCatalog(obj: object) {
  const rootRawFolder = obj['MatrixOne'] as NestedObject[]

  const result: PostNode[] = transform(rootRawFolder)

  return result
}

/** Traverse recursively */
function transform(objs: NestedObject[]) {
  const result: PostNode[] = []

  for (const obj of objs) {
    const [key, val] = Object.entries(obj)[0]

    const node: PostNode = {
      title: key,
      path: '',
      children: [],
    }

    if (typeof val === 'string') {
      /** Edge case which should be resolve from `/docs/` */
      if (val === 'README.md') {
        node.path = '../README.md'
      } else {
        node.path = val.replace(/^\s*MatrixOne\//, '')
      }
    } else {
      node.children = transform(val)
    }

    result.push(node)
  }

  return result
}

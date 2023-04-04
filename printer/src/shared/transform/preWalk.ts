import type { PostNode } from './types'

/** Preorder traversal for `PostNode`s. */
export async function preWalk(
  root: PostNode,
  callback: (node: PostNode) => Promise<void>
) {
  await callback(root)
  for (const child of root.children) {
    await preWalk(child, callback)
  }
}

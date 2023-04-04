import type { VFile } from 'vfile'
import type { BlockContent, DefinitionContent } from 'mdast'

type Primitive = string | boolean | number | bigint | symbol | undefined | null

export interface NodeProps {
  attributes?: Record<string, Exclude<Primitive, bigint | symbol>>
}

function constructAFMDComponentNode(
  hName: string,
  { attributes }: NodeProps,
  ...children: (BlockContent | DefinitionContent)[]
) {
  return {
    name: '',
    type: 'afmdJsxFlowElement',
    data: { hName, hProperties: attributes },
    children,
  }
}

function constructMDXComponentNode(
  name: string,
  { attributes = {} }: NodeProps = {},
  ...children: (BlockContent | DefinitionContent)[]
) {
  return {
    type: 'mdxJsxFlowElement',
    name,
    attributes: Object.entries(attributes)
      // Filter out non-truthy attributes to avoid empty attrs being parsed as `true`.
      .filter(([, v]) => v !== false && Boolean(v))
      .map(([name, value]) => ({ type: 'mdxJsxAttribute', name, value })),
    children,
  }
}

interface ComponentNodeProps extends NodeProps {
  mdx: boolean
}

export function constructComponentNode(
  tagName: string,
  { mdx, ...opts }: ComponentNodeProps,
  ...children: (BlockContent | DefinitionContent)[]
) {
  const factory = mdx ? constructMDXComponentNode : constructAFMDComponentNode
  return factory(tagName, opts, ...children)
}

export function isMDXFile(file: VFile) {
  return file.history[0]?.endsWith('.mdx') ?? false
}

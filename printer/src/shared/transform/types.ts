export interface NestedObject {
  [key: string]: NestedObject[] | string
}

export interface PostNode {
  title: string
  path: string
  children: PostNode[]
}

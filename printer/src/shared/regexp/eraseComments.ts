const COMMENT_PATTERN = /<!--(.(?!-->))*.-->/gs

export function eraseComments(src: string) {
  return src.replace(COMMENT_PATTERN, '')
}

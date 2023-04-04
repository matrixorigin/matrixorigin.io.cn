const BARE_LINK_PATTERN = /<(https?:\/\/(.(?!>))*.)>/g

export function unwrapBareLink(src: string) {
  return src.replace(BARE_LINK_PATTERN, (_, p1) => p1)
}

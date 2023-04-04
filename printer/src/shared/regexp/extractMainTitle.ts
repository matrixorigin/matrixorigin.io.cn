import { slug } from 'github-slugger'

const MAIN_TITLE_PATTERN = /# (.*)(\n|\r\n)/

export function extractMainTitle(src: string) {
  const title =
    src
      .match(MAIN_TITLE_PATTERN)?.[1]
      .trim()
      .replace(/(^\*{2})|(\*{2}$)/, '') ?? ''

  return slug(title)
}

const ADMONITIONS_PATTERN =
  /!!![^\r\n\S]*(?<type>[^\s]+)?[^\r\n\S]*(?<title>[^\s]+)?((.(?!\n\n|\r\n\r\n))*.)/gs

/**
 * Replace MKDocs style admonitions with
 * the [generic directives proposal](https://talk.commonmark.org/t/generic-directives-plugins-syntax/444) style.
 * @param src Markdown content.
 */
export function replaceAdmonitions(src: string) {
  return src.replace(
    ADMONITIONS_PATTERN,
    (_, type: string, title: string, content: string) => {
      return `:::${type ?? 'info'}[${title ?? '注意'}]${content}\n:::`
    }
  )
}

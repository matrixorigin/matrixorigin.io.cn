const LEFT_ARROW_BRACKET_PATTERN =
  /<(?!https?|p|h\d|a\s|c\s|img\s|br|!--|\/\w)/g

export function escapeArrowBrackets(src: string) {
  // eslint-disable-next-line no-useless-escape
  return src.replace(LEFT_ARROW_BRACKET_PATTERN, '<')
}

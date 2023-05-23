/**
 * Merge toc title and page number
 */
export function mergeTocTitleAndPageNum(
  titlesStr: string,
  pageNumsStr: string
) {
  let mergeRes = ''

  const titles = titlesStr.split('\n')
  const titlesLen = titles.length
  const pageNums = pageNumsStr.split('\n')
  const pageNumsLen = pageNums.length

  let titlePtr = 0
  let pageNumPtr = 0

  while (titlePtr < titlesLen && pageNumPtr < pageNumsLen) {
    const currTitle = titles[titlePtr] as string
    const currPageNum = pageNums[pageNumPtr] as string

    const pageNum = currPageNum.match(/\d+$/)?.[0] ?? 'unknown'
    if (currTitle.includes('$$')) {
      mergeRes += currTitle.replace('$$', pageNum) + '\n'
      pageNumPtr++
    } else if (currTitle) {
      mergeRes += currTitle + ` ${pageNum}\n`
    }
    titlePtr++
  }

  return mergeRes
}

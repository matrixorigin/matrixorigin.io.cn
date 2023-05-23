import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { mergeTocTitleAndPageNum } from '~/shared'

const titlesStr = await readFile(join(process.cwd(), 'toc-titles'), 'utf8')
const pageNumsStr = await readFile(join(process.cwd(), 'toc-pagenums'), 'utf8')

const merged = mergeTocTitleAndPageNum(titlesStr, pageNumsStr)

await writeFile(join(process.cwd(), 'toc'), merged, 'utf8')

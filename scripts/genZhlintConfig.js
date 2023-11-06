import { writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * `zhlint` 配置
 * @type {import('zhlint').Options}
 * @see https://github.com/zhlint-project/zhlint#supported-rules
 */
const config = {
  preset: 'default',
  rules: {
    // 半角标点
    halfWidthPunctuation: '',
    // 全角标点
    fullWidthPunctuation: '',
    // 忽略首尾的空格
    trimSpace: false,
    // 忽略引号相关的空格问题
    adjustedFullWidthPunctuation: ''
  }
}

/**
 * 跳过校验的情况：
 * - `<br>`标签；
 */
const ignoredCases = [
  {
    textStart: '<br>',
    textEnd: ''
  },
].reduce((prev, { textStart, textEnd }) => prev + textStart + ',' + textEnd + '\n', '')

await Promise.all([
  writeFile(resolve(__dirname, '..', '.zhlintrc'), JSON.stringify(config)),
  writeFile(resolve(__dirname, '..', '.zhlintignore'), ignoredCases)
])

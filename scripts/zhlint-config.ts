import { writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { type Config } from 'zhlint'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * `zhlint` 配置
 * @see https://github.com/zhlint-project/zhlint#supported-rules
 */
const config: Config = {
  preset: 'default',
  rules: {
    // 半角标点
    halfwidthPunctuation: '',
    // 全角标点
    fullwidthPunctuation: '',
    // 忽略首尾的空格
    trimSpace: false,
    // 忽略引号相关的空格问题
    adjustedFullwidthPunctuation: ''
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

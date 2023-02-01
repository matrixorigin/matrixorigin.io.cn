const { writeFileSync } = require('fs')
const { resolve } = require('path')

const MAX_INDEX_NUM = 15

/**
 * 跳过对标题序号的半角句号校验，对`1...15`的序号有效
 * @example
 * ``` markdown
 * ## 1. 安装部署 Go 语言
 * ```
 * 上面的`"."`不会被替换为`"。"`
 */
const indexesOfTitle = Array.from({ length: MAX_INDEX_NUM }, (_, index) => index + 1 + '. ')

/** zhlint 配置 */
const config = {
  preset: 'default',
  rules: {
    // 半角标点
    halfWidthPunctuation: '',
    // 全角标点
    fullWidthPunctuation: `，。：；！`,
    // 对以下缩写，跳过全角标点校验
    skipAbbrs: [
      'Mr.',
      'Mrs.',
      'Dr.',
      'Jr.',
      'Sr.',
      'vs.',
      'etc.',
      'i.e.',
      'e.g.',
      'a.k.a',
      ...indexesOfTitle,
    ],
    // 忽略首尾的空格
    trimSpace: false,
  },
}

/**
 * 跳过校验的情况：
 * - `<br>`标签；
 */
const ignoredCases = [
  {
    textStart: '<br>',
    textEnd: ''
  }
].reduce((prev, { textStart, textEnd }) => prev + textStart + ',' + textEnd + '\n', '')

writeFileSync(resolve(__dirname, '..', '.zhlintrc'), JSON.stringify(config))
writeFileSync(resolve(__dirname, '..', '.zhlintignore'), ignoredCases)

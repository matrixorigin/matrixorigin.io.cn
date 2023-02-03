const { writeFileSync } = require('fs')
const { resolve } = require('path')

/** zhlint 配置 */
const config = {
  preset: 'default',
  rules: {
    // 半角标点
    halfWidthPunctuation: '',
    // 全角标点
    fullWidthPunctuation: '',
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

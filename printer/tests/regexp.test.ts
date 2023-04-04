/* eslint-disable no-useless-escape */
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { assert, describe, test } from 'vitest'

import {
  replaceAdmonitions,
  extractMainTitle,
  escapeArrowBrackets,
  eraseComments,
  unwrapBareLink,
} from '../src/shared'

test('Should replace MKDocs-style admonitions with generic directives', async () => {
  const [input, output] = await Promise.all([
    readFile(join(process.cwd(), './tests/input.md'), {
      encoding: 'utf8',
    }),
    readFile(join(process.cwd(), './tests/output.md'), {
      encoding: 'utf8',
    }),
  ])

  const result = replaceAdmonitions(input)

  assert.equal(result, output)
})

describe('Should generate proper markdown headings', () => {
  test('matrixone-v070-发布报告', () => {
    assert.equal(
      extractMainTitle('# **MatrixOne v0.7.0 发布报告**\n'),
      'matrixone-v070-发布报告'
    )
  })

  test('matrixone-版本发布历史记录', () => {
    assert.equal(
      extractMainTitle('# **MatrixOne 版本发布历史记录**\n'),
      'matrixone-版本发布历史记录'
    )
  })

  test('matrixone-v010-release-notes', () => {
    assert.equal(
      extractMainTitle('# **MatrixOne v0.1.0 Release Notes**\r\n'),
      'matrixone-v010-release-notes'
    )
  })

  test('事务通用概念', () => {
    assert.equal(extractMainTitle('# 事务通用概念  \n'), '事务通用概念')
  })

  test('matrixone-的显式事务', () => {
    assert.equal(
      extractMainTitle('# MatrixOne 的显式事务    \r\n'),
      'matrixone-的显式事务'
    )
  })
})

test('Should escape left arrow brackets which are not html tags', () => {
  const src = `\n<select-list>\n<br>\n\nType a < and << operator.\n\n<img src="#" />\n\n<a href="#" ></a>\n\n<c name="workflow"></c>\n\n<br/>\n\n<!-- This a comment line. -->`

  const result = escapeArrowBrackets(src)

  assert.strictEqual(
    result,
    `\n<select-list>\n<br>\n\nType a \< and \<\< operator.\n\n<img src="#" />\n\n<a href="#" ></a>\n\n<c name="workflow"></c>\n\n<br/>\n\n<!-- This a comment line. -->`
  )
})

test('Should erase html style comments', () => {
  const src = `I <!-- Maybe you? -->am <!-- perhaps -->a database <!-- What the heck is that -->rockstar.<!-- Yea\nh\nh\nhhhh-->`

  const result = eraseComments(src)

  assert.equal(result, 'I am a database rockstar.')
})

test('Should unwrap <> style bare links', () => {
  const src = `For more info, you can refer to <https://docs.matrixorigin.cn>.`

  const result = unwrapBareLink(src)

  assert.equal(
    result,
    `For more info, you can refer to https://docs.matrixorigin.cn.`
  )
})

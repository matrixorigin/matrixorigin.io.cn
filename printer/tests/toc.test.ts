import { test, assert } from 'vitest'

import { mergeTocTitleAndPageNum } from '../src/shared'

test('Should generate the catalog', () => {
  const titlesStr = `"主页" $$
"关于 MatrixOne"
    "MatrixOne 简介" $$
    "MatrixOne 功能列表" $$
    "MatrixOne 技术架构"
        "架构概述" $$
        "功能特性" $$
    "MySQL 兼容性" $$
    "最新动态" $$
"快速开始"
    "单机部署 MatrixOne"
        "单机部署 MatrixOne 概述" $$
        "在 macOS 上部署"
            "使用源代码部署" $$
            "使用二进制包部署" $$
            "使用 Docker 部署" $$
        "在 Linux 上部署"
            "使用源代码部署" $$
            "使用二进制包部署" $$
            "使用 Docker 部署" $$
    "SQL 的基本操作" $$`
  const pageNumsStr = `"MatrixOne ⽂档" 12
"MatrixOne 简介" 13
"MatrixOne 功能列表" 15
"MatrixOne 架构设计" 21
"MatrixOne 功能特性" 25
"MySQL 兼容性" 27
"最新发布" 30
"单机部署 MatrixOne" 31
"使⽤源代码部署" 32
"使⽤⼆进制包部署" 36
"使⽤ Docker 部署" 40
"使⽤源代码部署" 43
"使⽤⼆进制包部署" 47
"使⽤ Docker 部署" 51
"MatrixOne 的 SQL 基本操作" 54`
  const merged = mergeTocTitleAndPageNum(titlesStr, pageNumsStr)

  assert.equal(
    merged,
    `"主页" 12
"关于 MatrixOne" 13
    "MatrixOne 简介" 13
    "MatrixOne 功能列表" 15
    "MatrixOne 技术架构" 21
        "架构概述" 21
        "功能特性" 25
    "MySQL 兼容性" 27
    "最新动态" 30
"快速开始" 31
    "单机部署 MatrixOne" 31
        "单机部署 MatrixOne 概述" 31
        "在 macOS 上部署" 32
            "使用源代码部署" 32
            "使用二进制包部署" 36
            "使用 Docker 部署" 40
        "在 Linux 上部署" 43
            "使用源代码部署" 43
            "使用二进制包部署" 47
            "使用 Docker 部署" 51
    "SQL 的基本操作" 54
`
  )
})

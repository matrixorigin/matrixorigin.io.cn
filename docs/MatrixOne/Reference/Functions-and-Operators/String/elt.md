---
title: "ELT()"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: false
since: v3.0.11
last_updated: 2026-05-08
llms_summary: "ELT 返回从 1 开始计数的第 N 个字符串参数，当 N 越界或引用的任意参数为 NULL 时返回 NULL。"
---

# **ELT()**

> `ELT(N, str1, str2, ...)` 返回从 1 开始计数的第 N 个字符串参数，当
> `N` 为 `NULL`、`N < 1`、`N` 超过字符串参数数量、或所选字符串参数本身
> 为 `NULL` 时返回 `NULL`。

## 函数说明

`ELT()` 返回第 `N` 个字符串参数，从 `1` 开始计数。`ELT(1, str1, str2, ...)`
返回 `str1`，`ELT(2, ...)` 返回 `str2`，以此类推。

以下情况函数返回 `NULL`：

- `N` 为 `NULL`，或所选索引处的字符串参数为 `NULL`。
- `N < 1` 或 `N` 大于提供的字符串参数数量。
- `N` 是值超出有效范围的整数类型（`UINT64`、`BIT`）。

至少需要两个参数（索引和一个字符串）；否则在绑定时调用被拒绝。非字符串
的其余参数会转换为 `VARCHAR`。当任一其余参数为 `BINARY` / `VARBINARY` /
`BLOB` 时，结果类型为 `BLOB`；否则为 `VARCHAR`。

## 函数语法

```
> ELT(N, str1, str2, str3, ...)
```

## 参数释义

| 参数 | 说明 |
| ---- | ---- |
| N | 必填。选择返回哪个字符串的整数表达式。`BOOL`、`INT`、`FLOAT` 和 `DECIMAL` 类型会转换为 `INT64`；`UINT64` / `BIT` 按原值使用。 |
| str1, str2, ... | 必填。一个或多个字符串表达式。非字符串类型会转换为 `VARCHAR`。 |

## 示例

```sql
DROP DATABASE IF EXISTS elt_demo;
CREATE DATABASE elt_demo;
USE elt_demo;

SELECT ELT(1, 'Aa', 'Bb', 'Cc', 'Dd') AS r1;
SELECT ELT(3, 'Aa', 'Bb', 'Cc', 'Dd') AS r2;
SELECT ELT(0, 'Aa', 'Bb', 'Cc', 'Dd') AS out_of_range;
SELECT ELT(5, 'Aa', 'Bb', 'Cc', 'Dd') AS out_of_range2;
SELECT ELT(NULL, 'Aa', 'Bb')          AS n_is_null;

DROP DATABASE elt_demo;
```

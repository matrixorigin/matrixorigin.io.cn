---
title: "ADDTIME()"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: false
since: v3.0.11
last_updated: 2026-05-08
llms_summary: "ADDTIME 将 TIME 表达式加到 TIME、DATETIME、TIMESTAMP 或字符串值上，结果类型遵循输入类型，且标度取两个输入中标度较大者。"
---

# **ADDTIME()**

> `ADDTIME(expr1, expr2)` 返回 `expr1 + expr2`，其中 `expr2` 是一个
> `TIME` 表达式；结果类型遵循 `expr1`（TIME → TIME，DATETIME / TIMESTAMP
> → DATETIME，字符串 → DATETIME(6)），标度取两个输入中标度较大者。

## 函数说明

`ADDTIME()` 将 `expr2` 加到 `expr1` 上并返回结果。`expr1` 是 `TIME`、
`DATETIME` 或 `TIMESTAMP` 值（或可被解析为上述类型的字符串）；`expr2`
是一个 `TIME` 表达式（可以包含天部分，例如 `'1 1:1:1.000002'`）。返回类
型遵循输入类型：

- 当 `expr1` 为 `TIME` 时，结果为 `TIME`。
- 当 `expr1` 为 `DATETIME` 或 `TIMESTAMP` 时，结果为 `DATETIME`。
- 当 `expr1` 为字符串时，结果为标度为 6 的 `DATETIME`（微秒精度）。

结果的标度为两个输入值标度中的较大者。当任一参数为 `NULL` 或无法解析时，
函数返回 `NULL`。

## 函数语法

```
> ADDTIME(expr1, expr2)
```

## 参数释义

| 参数 | 说明 |
| ---- | ---- |
| expr1 | 必填。被加的 `TIME`、`DATETIME`、`TIMESTAMP` 或字符串值。 |
| expr2 | 必填。`TIME` 值，或可被解析为 `TIME` 的字符串。 |

## 示例

```sql
DROP DATABASE IF EXISTS addtime_demo;
CREATE DATABASE addtime_demo;
USE addtime_demo;

SELECT ADDTIME('2007-12-31 23:59:59.999999', '1 1:1:1.000002') AS r1;
SELECT ADDTIME('01:00:00.999999', '02:00:00.999998')           AS r2;
SELECT ADDTIME(CAST('10:00:00' AS TIME), '01:30:00')            AS r3;

DROP DATABASE addtime_demo;
```

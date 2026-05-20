---
title: "TIMESTAMPADD()"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: false
since: v3.0.11
last_updated: 2026-05-08
llms_summary: "TIMESTAMPADD 将指定单位的整数间隔加到日期、DATETIME、TIMESTAMP 或字符串表达式上，返回类型与输入类型对齐。"
---

# **TIMESTAMPADD()**

> `TIMESTAMPADD(unit, interval, datetime_expr)` 将给定 `unit`（MICROSECOND /
> SECOND / MINUTE / HOUR / DAY / WEEK / MONTH / QUARTER / YEAR）的整数
> `interval` 加到日期、DATETIME、TIMESTAMP 或字符串表达式上；返回类型与
> 输入类型对齐。

## 函数说明

`TIMESTAMPADD()` 将指定 `unit` 的整数 `interval` 加到日期、DATETIME 或
TIMESTAMP 表达式 `datetime_expr` 上并返回结果。

返回类型与输入类型对齐：

- 当 `datetime_expr` 为 `DATE` 且 `unit` 为日期单位（`DAY`、`WEEK`、
  `MONTH`、`QUARTER`、`YEAR`）时，结果为 `DATE`。
- 当 `datetime_expr` 为 `DATE` 且 `unit` 为时间单位（`HOUR`、`MINUTE`、
  `SECOND`、`MICROSECOND`）时，结果为 `DATETIME`（MySQL 兼容的类型提升）。
- 当 `datetime_expr` 为 `DATETIME` 时，结果为 `DATETIME`。
- 当 `datetime_expr` 为 `TIMESTAMP` 时，结果为 `TIMESTAMP`。
- 当 `datetime_expr` 为字符串时，结果以字符串形式返回。

`MICROSECOND` 结果带有标度 6；其他时间单位带有标度 0。如果 `interval` 或
`datetime_expr` 为 `NULL`，或加法将溢出最大可表示日期时间，则函数返回
`NULL`。

## 函数语法

```
> TIMESTAMPADD(unit, interval, datetime_expr)
```

## 参数释义

| 参数 | 说明 |
| ---- | ---- |
| unit | 必填。`MICROSECOND`、`SECOND`、`MINUTE`、`HOUR`、`DAY`、`WEEK`、`MONTH`、`QUARTER`、`YEAR` 之一。 |
| interval | 必填。整数；可以为负数以表示减法。 |
| datetime_expr | 必填。`DATE`、`DATETIME`、`TIMESTAMP` 或字符串表达式。 |

## 示例

```sql
DROP DATABASE IF EXISTS timestampadd_demo;
CREATE DATABASE timestampadd_demo;
USE timestampadd_demo;

SELECT TIMESTAMPADD(DAY,    5,  DATE '2023-01-01')                  AS r1;
SELECT TIMESTAMPADD(HOUR,   2,  CAST('2023-01-01' AS DATE))          AS r2;
SELECT TIMESTAMPADD(MINUTE, 30, CAST('2023-01-01 10:00:00' AS DATETIME)) AS r3;
SELECT TIMESTAMPADD(MICROSECOND, 500, CAST('2023-01-01 10:00:00' AS DATETIME)) AS r4;
SELECT TIMESTAMPADD(MONTH,  -3, CAST('2023-05-15' AS DATE))          AS r5;

DROP DATABASE timestampadd_demo;
```

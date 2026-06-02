---
title: TRUNCATE()
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: false
since: v3.0.14
last_updated: 2026-06-02
llms_summary: TRUNCATE() 函数将数值截断到指定小数位数，直接丢弃多余小数位，与 ROUND() 不同不会四舍五入。
---

# **TRUNCATE()**

> 将数字截断到指定小数位数，保留指定精度，不作四舍五入处理。与 `ROUND()` 不同，`TRUNCATE()` 直接丢弃多余的小数位。

## **函数说明**

`TRUNCATE()` 函数将数字 `X` 截断到 `D` 位小数。若 `D` 为 0，结果没有小数点或小数部分。`D` 可以为负数，表示将小数点左边 `D` 位数字置零。与 `ROUND()` 不同，`TRUNCATE()` 不作任何四舍五入。

## 语法

```
> TRUNCATE(X, D)
```

## 参数释义

|  参数   | 说明  |
|  ----  | ----  |
| X | 必要参数。需要截断的数字。 |
| D | 必要参数。要保留的小数位数。 |

## 示例

```sql
DROP DATABASE IF EXISTS truncate_tests;
CREATE DATABASE truncate_tests;
USE truncate_tests;

CREATE TABLE t1(a DOUBLE, b INT);
INSERT INTO t1 VALUES (4.567, 2), (4.567, 0), (-4.567, 2), (10.123456, 3), (-10.123456, 3);
SELECT a, b, TRUNCATE(a, b) AS truncated FROM t1;

DROP DATABASE truncate_tests;
```

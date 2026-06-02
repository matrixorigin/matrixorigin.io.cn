---
title: SIGN()
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: false
since: v3.0.14
last_updated: 2026-06-02
llms_summary: SIGN() 函数返回给定数值的符号：负数返回 -1，零返回 0，正数返回 1。
---

# **SIGN()**

> 返回给定数值的符号：负数为 -1、零为 0、正数为 1。常用于数值方向判断与分类计算，结果始终为整数类型。输入为 NULL 时返回 NULL。

## **函数说明**

`SIGN()` 函数返回给定数值的符号。负数为 -1，零为 0，正数为 1。

## 语法

```
> SIGN(number)
```

## 参数释义

|  参数   | 说明  |
|  ----  | ----  |
| number | 必要参数，可取任意数值数据类型 |

## 示例

```sql
DROP DATABASE IF EXISTS sign_tests;
CREATE DATABASE sign_tests;
USE sign_tests;

CREATE TABLE t1(a INT, b DOUBLE);
INSERT INTO t1 VALUES (5, 5.5), (0, 0.0), (-5, -5.5), (100, 100.5), (-100, -100.5);
SELECT a, SIGN(a) AS sign_a, b, SIGN(b) AS sign_b FROM t1;

DROP DATABASE sign_tests;
```

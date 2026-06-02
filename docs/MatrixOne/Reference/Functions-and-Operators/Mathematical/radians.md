---
title: RADIANS()
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: false
since: v3.0.14
last_updated: 2026-06-02
llms_summary: RADIANS() 函数将角度值从度转换为弧度，转换公式为 X * PI() / 180。
---

# **RADIANS()**

> 将角度值从度转换为弧度，转换公式为 `X * PI() / 180`。与 `DEGREES()` 互为逆运算，三角函数计算前需用此函数将角度转为弧度。输入为 NULL 时返回 NULL。

## **函数说明**

`RADIANS()` 函数将输入的角度值从度转换为弧度，转换公式为 `X * PI() / 180`。

## 语法

```
> RADIANS(X)
```

## 参数释义

|  参数   | 说明  |
|  ----  | ----  |
| X | 必要参数。以度为单位的角。支持任意数值类型。 |

## 示例

```sql
DROP DATABASE IF EXISTS radians_tests;
CREATE DATABASE radians_tests;
USE radians_tests;

SELECT RADIANS(180) AS half_circle;
SELECT RADIANS(90) AS right_angle;
SELECT RADIANS(0) AS zero;
SELECT RADIANS(-180) AS neg_half_circle;
SELECT RADIANS(NULL) AS null_result;

DROP DATABASE radians_tests;
```

---
title: DEGREES()
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: false
since: v3.0.14
last_updated: 2026-06-02
llms_summary: DEGREES() 函数将弧度值转换为角度值，转换公式为 X * 180 / PI()。
---

# **DEGREES()**

> 将弧度值转换为角度值，转换公式为 `X * 180 / PI()`。与 `RADIANS()` 互为逆运算，适用于坐标旋转等需要角度显示的场景。输入为 NULL 时返回 NULL。

## **函数说明**

`DEGREES()` 函数将输入的弧度值转换为角度值，转换公式为 `X * 180 / PI()`。

## 语法

```
> DEGREES(X)
```

## 参数释义

|  参数   | 说明  |
|  ----  | ----  |
| X | 必要参数。以弧度为单位的角。支持任意数值类型。 |

## 示例

```sql
DROP DATABASE IF EXISTS degrees_tests;
CREATE DATABASE degrees_tests;
USE degrees_tests;

SELECT DEGREES(PI()) AS half_circle;
SELECT DEGREES(PI()/2) AS right_angle;
SELECT DEGREES(0) AS zero;
SELECT DEGREES(-PI()) AS neg_half_circle;
SELECT DEGREES(NULL) AS null_result;

DROP DATABASE degrees_tests;
```

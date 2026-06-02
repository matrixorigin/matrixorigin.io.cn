---
title: ATAN2()
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: false
since: v3.0.14
last_updated: 2026-06-02
llms_summary: ATAN2() 函数返回 Y/X 的反正切，利用两个参数的符号确定结果所在的象限。
---

# **ATAN2()**

> 返回 `Y / X` 的反正切，结果以弧度表示。与 `ATAN(Y/X)` 不同，`ATAN2(Y, X)` 利用两个参数的符号确定结果所在的正确象限。

## **函数说明**

`ATAN2()` 函数返回正 x 轴与点 `(X, Y)` 之间的夹角（以弧度表示）。`X` 和 `Y` 均可为任意数值类型。结果在 `[-PI, PI]` 范围内。

## 语法

```
> ATAN2(Y, X)
```

## 参数释义

|  参数   | 说明  |
|  ----  | ----  |
| Y | 必要参数。y 坐标。 |
| X | 必要参数。x 坐标。 |

## 示例

```sql
DROP DATABASE IF EXISTS atan2_tests;
CREATE DATABASE atan2_tests;
USE atan2_tests;

SELECT ATAN2(1, 1) AS quadrant1;
SELECT ATAN2(1, -1) AS quadrant2;
SELECT ATAN2(-1, -1) AS quadrant3;
SELECT ATAN2(-1, 1) AS quadrant4;
SELECT ATAN2(0, -1) AS pi_result;
SELECT ATAN2(NULL, 1) AS null_y;
SELECT ATAN2(1, NULL) AS null_x;

DROP DATABASE atan2_tests;
```

---
title: "MAKETIME()"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: false
since: v3.0.15
last_updated: 2026-07-06
llms_summary: "根据给定的时、分、秒参数构造 TIME 值，最大支持 838:59:59，超出范围或 NULL 输入返回 NULL。"
---
# MAKETIME()

> 根据给定的 `hour`、`minute` 和 `second` 参数构造一个 `TIME` 值。小时的有效范围是 0–838。如果任何参数超出范围或为 NULL，返回 NULL。浮点输入会被截断为整数。

## 函数说明

`MAKETIME()` 函数从三个整数参数构造 `TIME` 值。MySQL 的 `TIME` 类型支持超过 24 的小时值（最多 838），常用于表示时间间隔或偏移量。

## 语法

```
> MAKETIME(hour, minute, second)
```

## 参数释义

| 参数 | 说明 |
| ---- | ---- |
| hour | 必需。整数 0–838。负数或超过 838 的值返回 NULL。 |
| minute | 必需。整数 0–59。超出此范围的值返回 NULL。 |
| second | 必需。整数 0–59。超出此范围的值返回 NULL。 |

## 示例

```sql
DROP DATABASE IF EXISTS maketime_demo;
CREATE DATABASE maketime_demo;
USE maketime_demo;

SELECT MAKETIME(12, 15, 30) AS result1;
SELECT MAKETIME(0, 0, 0) AS zero_time;
SELECT MAKETIME(23, 59, 59) AS max_time;
SELECT MAKETIME(838, 59, 59) AS max_hours;
SELECT MAKETIME(100, 0, 0) AS interval_time;

-- 超出范围的参数返回 NULL。
SELECT MAKETIME(-1, 15, 30) AS null_hour_oob;
SELECT MAKETIME(12, 60, 30) AS null_minute_oob;
SELECT MAKETIME(12, 15, 60) AS null_second_oob;

SELECT MAKETIME(NULL, 15, 30) AS null_hour;
SELECT MAKETIME(12, NULL, 30) AS null_minute;

CREATE TABLE t1(h INT, m INT, s INT);
INSERT INTO t1 VALUES (12, 15, 30), (0, 0, 0), (23, 59, 59);
SELECT MAKETIME(h, m, s) AS time_value FROM t1;
DROP TABLE t1;

DROP DATABASE maketime_demo;
```

---
title: "TIME_FORMAT()"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: false
since: v3.0.15
last_updated: 2026-07-06
llms_summary: "按照指定格式字符串格式化 TIME 值，使用与 DATE_FORMAT() 相同的格式说明符，但仅限于时间相关部分。"
---
# TIME_FORMAT()

> 按照指定格式字符串格式化 `TIME` 值。使用与 `DATE_FORMAT()` 相同的格式说明符，但只有时间相关说明符（`%H`、`%i`、`%s`、`%r`、`%T`、`%p`、`%f`、`%h`、`%k`、`%l`、`%I`、`%S`）有意义。如果任一参数为 NULL，返回 NULL。

## 函数说明

`TIME_FORMAT()` 函数使用格式说明符来格式化 `TIME` 值。它是 `DATE_FORMAT()` 的时间专用版本，适合格式化不包含日期的时间值。

支持的格式说明符：
- `%H`：小时（00–23）
- `%h` / `%I`：小时（01–12）
- `%k`：小时（0–23，无前导零）
- `%l`：小时（1–12，无前导零）
- `%i`：分钟（00–59）
- `%s` / `%S`：秒（00–59）
- `%p`：`AM` 或 `PM`
- `%r`：12 小时制时间（`hh:mm:ss AM/PM`）
- `%T`：24 小时制时间（`hh:mm:ss`）
- `%f`：微秒（000000–999999）

## 语法

```
> TIME_FORMAT(time, format)
```

## 参数释义

| 参数 | 说明 |
| ---- | ---- |
| time | 必需。要格式化的 `TIME` 值。 |
| format | 必需。包含时间格式说明符的格式字符串。如果为 NULL，返回 NULL。 |

## 示例

```sql
DROP DATABASE IF EXISTS time_format_demo;
CREATE DATABASE time_format_demo;
USE time_format_demo;

SELECT TIME_FORMAT('15:30:45', '%H:%i:%s') AS basic;
SELECT TIME_FORMAT('15:30:45', '%T') AS t_format;
SELECT TIME_FORMAT('23:59:59', '%H:%i:%s') AS max_time;
SELECT TIME_FORMAT('15:30:45', '%h:%i:%s %p') AS hour12;
SELECT TIME_FORMAT('15:30:45', '%r') AS r_format;
SELECT TIME_FORMAT('00:00:00', '%r') AS midnight;
SELECT TIME_FORMAT('15:30:45.123456', '%H:%i:%s.%f') AS with_ms;
SELECT TIME_FORMAT(NULL, '%H:%i:%s') AS null_time;

CREATE TABLE t1(t TIME);
INSERT INTO t1 VALUES ('15:30:45'), ('00:00:00'), ('23:59:59'), ('12:34:56');
SELECT t, TIME_FORMAT(t, '%H:%i:%s') AS formatted FROM t1;
DROP TABLE t1;

DROP DATABASE time_format_demo;
```

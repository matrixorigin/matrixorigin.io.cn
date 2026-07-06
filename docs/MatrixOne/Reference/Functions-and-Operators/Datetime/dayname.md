---
title: "DAYNAME()"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: false
since: v3.0.15
last_updated: 2026-07-06
llms_summary: "返回给定日期的星期名称，如 'Monday' 或 'Saturday'，支持 DATE、DATETIME 和 TIMESTAMP 类型。"
---
# DAYNAME()

> 返回给定日期的星期名称。返回的名称使用当前 locale 的星期名称（例如 `'Monday'`、`'Saturday'`）。支持 `DATE`、`DATETIME` 和 `TIMESTAMP` 类型。如果参数为 NULL，返回 NULL。

## 函数说明

`DAYNAME()` 函数返回日期值的完整英文星期名称。它等效于调用 `DATE_FORMAT(date, '%W')`。

## 语法

```
> DAYNAME(date)
```

## 参数释义

| 参数 | 说明 |
| ---- | ---- |
| date | 必需。类型为 `DATE`、`DATETIME` 或 `TIMESTAMP` 的值。如果为 NULL，返回 NULL。 |

## 示例

```sql
DROP DATABASE IF EXISTS dayname_demo;
CREATE DATABASE dayname_demo;
USE dayname_demo;

SELECT DAYNAME('2007-02-03') AS saturday;
SELECT DAYNAME('2007-02-05') AS monday;
SELECT DAYNAME('2007-02-03 12:30:45') AS dt_saturday;
SELECT DAYNAME(NULL) AS null_result;

CREATE TABLE t1(d DATE, dt DATETIME);
INSERT INTO t1 VALUES ('2007-02-03', '2007-02-03 12:00:00'), ('2007-02-04', '2007-02-04 12:00:00');
SELECT DAYNAME(d) AS day_from_date, DAYNAME(dt) AS day_from_datetime FROM t1;
DROP TABLE t1;

CREATE TABLE t2(d DATE);
INSERT INTO t2 VALUES ('2007-02-03'), ('2007-02-04'), ('2007-02-05');
SELECT * FROM t2 WHERE DAYNAME(d) = 'Saturday';
DROP TABLE t2;

DROP DATABASE dayname_demo;
```

---
title: "MONTHNAME()"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: false
since: v3.0.15
last_updated: 2026-07-06
llms_summary: "返回给定日期的月份全名，如 'January' 或 'December'，支持 DATE、DATETIME 和 TIMESTAMP 类型。"
---
# MONTHNAME()

> 返回给定日期的月份全名（例如 `'January'`、`'December'`）。支持 `DATE`、`DATETIME` 和 `TIMESTAMP` 类型。如果参数为 NULL，返回 NULL。

## 函数说明

`MONTHNAME()` 函数返回日期值的完整英文月份名称。它等效于调用 `DATE_FORMAT(date, '%M')`。

## 语法

```
> MONTHNAME(date)
```

## 参数释义

| 参数 | 说明 |
| ---- | ---- |
| date | 必需。类型为 `DATE`、`DATETIME` 或 `TIMESTAMP` 的值。如果为 NULL，返回 NULL。 |

## 示例

```sql
DROP DATABASE IF EXISTS monthname_demo;
CREATE DATABASE monthname_demo;
USE monthname_demo;

SELECT MONTHNAME('2007-02-03') AS february;
SELECT MONTHNAME('2007-12-25') AS december;
SELECT MONTHNAME('2007-07-04 12:30:45') AS dt_july;
SELECT MONTHNAME(NULL) AS null_result;

CREATE TABLE t1(d DATE);
INSERT INTO t1 VALUES ('2007-01-15'), ('2007-06-20'), ('2007-12-31');
SELECT d, MONTHNAME(d) AS month_name FROM t1;
DROP TABLE t1;

DROP DATABASE monthname_demo;
```

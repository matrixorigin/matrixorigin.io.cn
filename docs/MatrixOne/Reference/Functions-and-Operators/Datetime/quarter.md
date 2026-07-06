---
title: "QUARTER()"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: false
since: v3.0.15
last_updated: 2026-07-06
llms_summary: "返回给定日期的季度值，范围为 1 到 4 的整数，NULL 输入返回 NULL。"
---
# QUARTER()

> 返回给定日期所在年份的季度值，为 1–4 的整数。1–3 月返回 1，4–6 月返回 2，7–9 月返回 3，10–12 月返回 4。如果参数为 NULL，返回 NULL。

## 函数说明

`QUARTER()` 函数从日期中提取季度编号，适用于按财年或日历年季度进行分组或过滤。

## 语法

```
> QUARTER(date)
```

## 参数释义

| 参数 | 说明 |
| ---- | ---- |
| date | 必需。类型为 `DATE`、`DATETIME` 或 `TIMESTAMP` 的值。如果为 NULL，返回 NULL。 |

## 示例

```sql
DROP DATABASE IF EXISTS quarter_demo;
CREATE DATABASE quarter_demo;
USE quarter_demo;

SELECT QUARTER('2007-01-15') AS q1;
SELECT QUARTER('2007-04-20') AS q2;
SELECT QUARTER('2007-08-05') AS q3;
SELECT QUARTER('2007-11-30') AS q4;
SELECT QUARTER('2007-06-15 12:30:45') AS dt_q2;
SELECT QUARTER(NULL) AS null_result;

CREATE TABLE t1(d DATE);
INSERT INTO t1 VALUES ('2007-02-01'), ('2007-05-15'), ('2007-09-10'), ('2007-12-25');
SELECT d, QUARTER(d) AS quarter_num FROM t1;
DROP TABLE t1;

DROP DATABASE quarter_demo;
```

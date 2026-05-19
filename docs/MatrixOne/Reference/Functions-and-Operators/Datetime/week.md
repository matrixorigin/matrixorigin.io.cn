---
title: WEEK()
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: 用于计算给定日期的周数。该函数返回一个整数，表示指定日期所在的周数。如果 date 为 NULL，则返回 NULL。
---

# **WEEK()**


> 用于计算给定日期的周数。该函数返回一个整数，表示指定日期所在的周数。如果 date 为 NULL，则返回 NULL。

## **函数说明**

`WEEK()` 返回给定日期或 datetime 表达式所在周次。可选参数 `mode`（0–7）控制周的起始日和返回值范围。如果 `date` 为 `NULL`，则返回 `NULL`。

## **函数语法**

```
> WEEK(date)
> WEEK(date, mode)
```

## **参数释义**

|  参数   | 说明 |
|  ----  | ----  |
| date  | 必要参数。要计算周数的日期或 datetime 表达式。支持 `DATE`、`DATETIME`、`TIMESTAMP` 及字符串类型。 |
| mode | 可选参数。0–7 的整数，指定周起始日和返回值范围。省略时默认为 0（周日为起始日，范围 0–53）。 |

### mode 取值表

| Mode | 周起始日 | 返回值范围 | 第 1 周的定义 |
| ---- | ---- | ---- | ---- |
| 0 | 周日 | 0–53 | 本年中第一个含周日的周 |
| 1 | 周一 | 0–53 | 本年中第一个含 4 天及以上的周 |
| 2 | 周日 | 1–53 | 本年中第一个含周日的周 |
| 3 | 周一 | 1–53 | 本年中第一个含 4 天及以上的周 |
| 4 | 周日 | 0–53 | 本年中第一个含 4 天及以上的周 |
| 5 | 周一 | 0–53 | 本年中第一个含周一的周 |
| 6 | 周日 | 1–53 | 本年中第一个含 4 天及以上的周 |
| 7 | 周一 | 1–53 | 本年中第一个含周一的周 |

## **示例**

```sql
DROP DATABASE IF EXISTS week_demo;
CREATE DATABASE week_demo;
USE week_demo;

-- 基本用法：返回周数，默认 mode 0
SELECT WEEK('2026-05-19');

-- mode=1（周一为起始，0-53 范围）
SELECT WEEK('2026-05-19', 1);

DROP DATABASE week_demo;
```

```sql
DROP DATABASE IF EXISTS week_tbl_demo;
CREATE DATABASE week_tbl_demo;
USE week_tbl_demo;

CREATE TABLE events (
    id INT PRIMARY KEY,
    event_date DATE
);
INSERT INTO events VALUES (1, '2026-01-01'), (2, '2026-05-19'), (3, '2026-12-31');

SELECT id, event_date, WEEK(event_date) AS wk FROM events;

DROP DATABASE week_tbl_demo;
```

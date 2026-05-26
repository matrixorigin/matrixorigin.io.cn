---
title: "YEARWEEK()"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: false
since: v3.0.13
last_updated: 2026-05-19
llms_summary: "YEARWEEK(date, [mode]) 返回给定日期的年份和周数，以 YYYYWW 整数格式表示，可选 mode 参数（0-7）控制周的编号规则。"
---
# YEARWEEK()

> 返回给定日期或 datetime 表达式的年份和周数，以整数 `YYYYWW` 格式表示。可选参数 `mode` 控制周的编号规则。

## 语法说明

`YEARWEEK()` 返回 `date` 或 `datetime` 表达式对应的年份和周数，结果为 `YYYYWW` 格式的整数——例如 `202623` 表示 2026 年第 23 周。可选参数 `mode`（0–7）控制周起始日和返回值范围。

## 语法结构

```
> YEARWEEK(date)
> YEARWEEK(date, mode)
```

## 参数释义

|  参数  | 说明 |
|  ----  | ----  |
| date | 必填。要计算年周组合的日期或 datetime 表达式。支持 `DATE`、`DATETIME`、`TIMESTAMP` 及字符串类型。若 `date` 为 `NULL`，返回 `NULL`。 |
| mode | 可选。0–7 的整数，指定周起始日和返回值范围。省略时默认为 0。 |

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

## 示例

```sql
DROP DATABASE IF EXISTS yearweek_demo;
CREATE DATABASE yearweek_demo;
USE yearweek_demo;

-- 基本用法：返回 YYYYWW 格式
SELECT YEARWEEK('2026-05-15');
-- 例如 202620

-- mode=1（周一为起始，0-53 范围）
SELECT YEARWEEK('2026-05-15', 1);

CREATE TABLE events (
    id INT PRIMARY KEY,
    event_date DATE
);
INSERT INTO events VALUES (1, '2026-01-01'), (2, '2026-05-19'), (3, '2026-12-31');

SELECT id, event_date, YEARWEEK(event_date) AS yw FROM events;

DROP DATABASE yearweek_demo;
```

## 注意事项

- 返回值为 `year * 100 + week`。若某年 52 周的某几天落入下一年 1 月，可能返回类似 `202652` 的值。
- 当 `date` 为 `NULL` 时，函数返回 `NULL`。

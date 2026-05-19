---
title: "GET_FORMAT()"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: false
since: v3.0.11
last_updated: 2026-05-08
llms_summary: "GET_FORMAT 返回 MySQL 风格的语言环境特定格式字符串，适用于 DATE、TIME 或 DATETIME 值，覆盖 USA、EUR、JIS、ISO 和 INTERNAL 区域。"
---

# **GET_FORMAT()**

> `GET_FORMAT(type, region)` 返回 MySQL 风格的语言环境特定格式字符串，适
> 用于 `DATE`、`TIME` 或 `DATETIME` 值，覆盖 `USA`、`EUR`、`JIS`、`ISO`
> 和 `INTERNAL` 区域；对于不支持的类型或区域返回 `NULL`。

## 函数说明

`GET_FORMAT()` 返回 MySQL 风格的语言环境特定日期/时间格式化格式字符串，
适用于给定的类型（`DATE`、`TIME` 或 `DATETIME`）和区域（`EUR`、`USA`、
`JIS`、`ISO` 或 `INTERNAL`）。返回的字符串可以传递给 `DATE_FORMAT()` 或
`STR_TO_DATE()`。

如果类型或区域不是支持的值之一，函数返回 `NULL`。

MatrixOne 中实现的完整映射如下：

| 类型 | USA | EUR | JIS | ISO | INTERNAL |
| ---- | ---- | ---- | ---- | ---- | ---- |
| DATE | `%m.%d.%Y` | `%d.%m.%Y` | `%Y-%m-%d` | `%Y-%m-%d` | `%Y%m%d` |
| TIME | `%h:%i:%s %p` | `%H.%i.%s` | `%H:%i:%s` | `%H:%i:%s` | `%H%i%s` |
| DATETIME | `%Y-%m-%d %H.%i.%s` | `%Y-%m-%d %H.%i.%s` | `%Y-%m-%d %H:%i:%s` | `%Y-%m-%d %H:%i:%s` | `%Y%m%d%H%i%s` |

## 函数语法

```
> GET_FORMAT({DATE | TIME | DATETIME}, {'EUR' | 'USA' | 'JIS' | 'ISO' | 'INTERNAL'})
```

## 参数释义

| 参数 | 说明 |
| ---- | ---- |
| type | 必填。字面量关键字 `DATE`、`TIME` 或 `DATETIME` 之一。 |
| region | 必填。选择语言环境的字符串字面量：`'EUR'`、`'USA'`、`'JIS'`、`'ISO'` 或 `'INTERNAL'`。 |

## 示例

```sql
DROP DATABASE IF EXISTS get_format_demo;
CREATE DATABASE get_format_demo;
USE get_format_demo;

SELECT GET_FORMAT(DATE,     'USA')      AS date_usa,
       GET_FORMAT(DATE,     'ISO')      AS date_iso,
       GET_FORMAT(TIME,     'USA')      AS time_usa,
       GET_FORMAT(DATETIME, 'INTERNAL') AS dt_internal;

SELECT DATE_FORMAT('2023-10-05 12:34:56', GET_FORMAT(DATETIME, 'JIS')) AS formatted;

DROP DATABASE get_format_demo;
```

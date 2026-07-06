---
title: "QUOTE()"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: false
since: v3.0.15
last_updated: 2026-07-06
llms_summary: "对字符串进行引号包裹和转义，生成可在 SQL 语句中安全使用的数据值。NULL 输入返回 NULL。"
---
# QUOTE()

> 对字符串进行引号包裹和转义，生成可在 SQL 语句中安全使用的数据值。单引号和反斜杠会被转义；NULL 字节（`\0`）和控制字符（`Ctrl+Z`）也会被转义。如果参数为 NULL，返回 NULL。

## 函数说明

`QUOTE()` 函数接受一个字符串并返回其带引号包裹的版本，其中特殊字符被转义以便在 SQL 语句中安全使用。结果以单引号包裹，内部单引号会加倍，反斜杠会加倍。这与 MySQL 的 `QUOTE()` 行为一致。

## 语法

```
> QUOTE(str)
```

## 参数释义

| 参数 | 说明 |
| ---- | ---- |
| str | 必需。要转义的字符串。如果为 NULL，返回 NULL。 |

## 示例

```sql
DROP DATABASE IF EXISTS quote_demo;
CREATE DATABASE quote_demo;
USE quote_demo;

SELECT QUOTE('Hello') AS basic;
SELECT QUOTE('Don''t') AS with_quote;
SELECT QUOTE('C:\\path') AS with_backslash;
SELECT QUOTE('') AS empty_result;
SELECT QUOTE(NULL) AS null_result;

CREATE TABLE t1(str VARCHAR(100));
INSERT INTO t1 VALUES ('Hello'), ('Don''t'), ('It''s'), ('C:\\path');
SELECT str, QUOTE(str) AS quoted FROM t1;
DROP TABLE t1;

DROP DATABASE quote_demo;
```

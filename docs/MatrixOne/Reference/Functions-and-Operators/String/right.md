---
title: "RIGHT()"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: false
since: v3.0.15
last_updated: 2026-07-06
llms_summary: "返回字符串 str 最右边的 len 个字符。如果 len 为负数则返回空字符串，如果 str 为 NULL 则返回 NULL。"
---
# RIGHT()

> 返回字符串 `str` 最右边的 `len` 个字符。如果 `len` 为负数，返回空字符串。如果 `len` 超过字符串长度，返回整个字符串。如果 `str` 为 NULL，返回 NULL。

## 函数说明

`RIGHT()` 函数从给定字符串的右侧提取子字符串。该函数是多字节安全的，可正确处理 Unicode 字符，包括中文、日文等多字节编码。

## 语法

```
> RIGHT(str, len)
```

## 参数释义

| 参数 | 说明 |
| ---- | ---- |
| str | 必需。要提取的字符串。 |
| len | 必需。要提取的字符数。如果为负数，返回空字符串。如果大于字符串长度，返回整个字符串。如果为 NULL，返回 NULL。 |

## 示例

```sql
DROP DATABASE IF EXISTS right_demo;
CREATE DATABASE right_demo;
USE right_demo;

SELECT RIGHT('Hello World', 5) AS result1;
SELECT RIGHT('Hello', 10) AS result2;
SELECT RIGHT('Hello', 0) AS result3;
SELECT RIGHT('abcde', -1) AS neg_result;
SELECT RIGHT('', 5) AS empty_str_result;
SELECT RIGHT(NULL, 5) AS null_str_result;

CREATE TABLE t1(str VARCHAR(50), len INT);
INSERT INTO t1 VALUES ('Hello World', 5), ('Hello', 10), ('Hello', 0), ('abcde', 3), ('test', 1);
SELECT str, len, RIGHT(str, len) AS right_result FROM t1;
DROP TABLE t1;

CREATE TABLE t2(str VARCHAR(50));
INSERT INTO t2 VALUES ('Hello World'), ('Hello'), ('test'), ('abcde');
SELECT * FROM t2 WHERE RIGHT(str, 5) = 'World';
SELECT * FROM t2 WHERE RIGHT(str, 1) = 'o';
DROP TABLE t2;

DROP DATABASE right_demo;
```

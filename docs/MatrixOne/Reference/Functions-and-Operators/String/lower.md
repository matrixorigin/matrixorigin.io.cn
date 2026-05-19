---
title: LOWER()
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: LOWER() 用于将给定的字符串转换为小写形式。
---

# **LOWER()**


> LOWER() 用于将给定的字符串转换为小写形式。

## **函数说明**

`LOWER()` 用于将给定的字符串转换为小写形式。

## **函数语法**

```
> LOWER(str)
```

## **参数释义**

|  参数   | 说明  |
|  ----  | ----  |
| str | 必要参数，字母字符。|

## **示例**

```sql
mysql> select lower('HELLO');
+--------------+
| lower(HELLO) |
+--------------+
| hello        |
+--------------+
1 row in set (0.02 sec)

mysql> select lower('A'),lower('B'),lower('C');
+----------+----------+----------+
| lower(A) | lower(B) | lower(C) |
+----------+----------+----------+
| a        | b        | c        |
+----------+----------+----------+
1 row in set (0.03 sec)
```

---
title: UPPER()
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: UPPER() 用于将给定的字符串转换为大写形式。
---

# **UPPER()**


> UPPER() 用于将给定的字符串转换为大写形式。

## **函数说明**

`UPPER()` 用于将给定的字符串转换为大写形式。

## **函数语法**

```
> UPPER(str)
```

## **参数释义**

|  参数   | 说明  |
|  ----  | ----  |
| str | 必要参数，字母字符。|

## **示例**

```sql
mysql> select upper('hello');
+--------------+
| upper(hello) |
+--------------+
| HELLO        |
+--------------+
1 row in set (0.03 sec)

mysql> select upper('a'),upper('b'),upper('c');
+----------+----------+----------+
| upper(a) | upper(b) | upper(c) |
+----------+----------+----------+
| A        | B        | C        |
+----------+----------+----------+
1 row in set (0.03 sec)
```

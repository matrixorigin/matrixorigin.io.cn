---
title: UCASE()
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: UCASE() 用于将给定的字符串转换为大写形式，为 UPPER() 的近义词。
---

# **UCASE()**


> UCASE() 用于将给定的字符串转换为大写形式，为 UPPER() 的近义词。

## **函数说明**

`UCASE()` 用于将给定的字符串转换为大写形式，为 [`UPPER()`](upper.md) 的近义词。

## **函数语法**

```
> UCASE(str)
```

## **参数释义**

|  参数   | 说明  |
|  ----  | ----  |
| str | 必要参数，字母字符。|

## **示例**

```sql
mysql> select ucase('hello');
+--------------+
| ucase(hello) |
+--------------+
| HELLO        |
+--------------+
1 row in set (0.03 sec)

mysql> select ucase('a'),ucase('b'),ucase('c');
+----------+----------+----------+
| ucase(a) | ucase(b) | ucase(c) |
+----------+----------+----------+
| A        | B        | C        |
+----------+----------+----------+
1 row in set (0.03 sec)
```

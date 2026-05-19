---
title: UNHEX()
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: UNHEX() 函数用于将十六进制字符串转换为相应的二进制字符串。对于 NULL 参数，此函数返回 NULL。
---

# UNHEX()

> UNHEX() 函数用于将十六进制字符串转换为相应的二进制字符串。对于 NULL 参数，此函数返回 NULL。


## 函数说明

`UNHEX()` 函数用于将十六进制字符串转换为相应的二进制字符串。对于 `NULL` 参数，此函数返回 `NULL`。

## 函数语法

```
> UNHEX(str)
```

## 参数释义

|  参数   | 说明 |
|  ----  | ----  |
| str | 必要参数。必须为合法的十六进制值。 |

## 示例

```SQL
mysql> SELECT UNHEX('4d6174726978204f726967696e');
+-----------------------------------+
| unhex(4d6174726978204f726967696e) |
+-----------------------------------+
| Matrix Origin                     |
+-----------------------------------+
1 row in set (0.00 sec)

mysql> select unhex(NULL);
+-------------+
| unhex(null) |
+-------------+
| NULL        |
+-------------+
1 row in set (0.00 sec)
```

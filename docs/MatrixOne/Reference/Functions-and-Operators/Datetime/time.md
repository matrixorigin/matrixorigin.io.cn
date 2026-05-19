---
title: TIME()
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: 提取时间或日期时间表达式 expr 的时间部分并将其作为字符串返回。如果 expr 为 NULL，则返回 NULL。
---

# **TIME()**


> 提取时间或日期时间表达式 expr 的时间部分并将其作为字符串返回。如果 expr 为 NULL，则返回 NULL。

## **函数说明**

提取时间或日期时间表达式 `expr` 的时间部分并将其作为字符串返回。如果 `expr` 为 `NULL`，则返回 `NULL`。

## **函数语法**

```
> TIME(expr)
```

## **参数释义**

|  参数   | 说明 |
|  ----  | ----  |
| expr  | 必要参数。需要提取时间的 date 或者 datetime 格式的输入值  |

## **示例**

```sql
mysql> SELECT TIME('2003-12-31 01:02:03');
+---------------------------+
| time(2003-12-31 01:02:03) |
+---------------------------+
| 01:02:03                  |
+---------------------------+
1 row in set (0.01 sec)
```

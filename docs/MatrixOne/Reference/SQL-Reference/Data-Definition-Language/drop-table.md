---
title: DROP TABLE
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: 该语句用于从当前所选的数据库中删除表，如果表不存在则会报错，除非使用 IF EXISTS 修饰符。
---

# **DROP TABLE**


> 该语句用于从当前所选的数据库中删除表，如果表不存在则会报错，除非使用 IF EXISTS 修饰符。

## **语法说明**

该语句用于从当前所选的数据库中删除表，如果表不存在则会报错，除非使用 `IF EXISTS` 修饰符。

## **语法结构**

```
> DROP TABLE [IF EXISTS] [db.]name
```

## **示例**

```sql
CREATE TABLE table01(a int);

mysql> DROP TABLE table01;
Query OK, 0 rows affected (0.01 sec)
```

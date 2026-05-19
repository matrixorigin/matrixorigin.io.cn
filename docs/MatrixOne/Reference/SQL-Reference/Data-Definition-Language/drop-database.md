---
title: DROP DATABASE
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: 该语句用于删除一个数据库。
---

# **DROP DATABASE**


> 该语句用于删除一个数据库。

## **语法说明**

该语句用于删除一个数据库。

## **语法结构**

```
> DROP DATABASE [IF EXISTS] <database_name>
```

## **示例**

```sql
CREATE DATABASE test01;

mysql> DROP DATABASE test01;
Query OK, 0 rows affected (0.01 sec)
```

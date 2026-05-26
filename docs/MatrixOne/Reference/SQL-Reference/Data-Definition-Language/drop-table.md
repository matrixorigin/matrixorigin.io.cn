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

该语句用于从当前所选的数据库中删除一张或多张表。从 v3.0.13 开始，一条
`DROP TABLE` 语句可以通过逗号分隔一次删除多张表，每张表名可以单独携带
库名前缀，未显式指定库名时使用当前数据库。每个目标表的权限独立校验。

- 带 `IF EXISTS` 时，列表中不存在的表会被静默跳过。
- 未带 `IF EXISTS` 时，遇到第一个不存在的表即失败并报错
  `no such table <db>.<name>`。

## **语法结构**

```
> DROP TABLE [IF EXISTS] [db.]name [, [db.]name ...]
```

## **示例**

```sql
CREATE TABLE table01(a int);

mysql> DROP TABLE table01;
Query OK, 0 rows affected (0.01 sec)
```

```sql
create table t1(a int);
create table t2(a int);
create table t3(a int);

mysql> drop table if exists t1, t2, t3;
Query OK, 0 rows affected (0.02 sec)
```

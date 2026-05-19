---
title: SHOW CREATE TABLE
doc_type: reference
mysql_compat: partial
differs_from_mysql:
- Output reflects MatrixOne-specific extensions (CLUSTER BY, USING IVFFLAT/HNSW, etc.)
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: 以列表的形式展现当前数据库创建的某个表的表结构。
---

# **SHOW CREATE TABLE**


> 以列表的形式展现当前数据库创建的某个表的表结构。

## **语法说明**

以列表的形式展现当前数据库创建的某个表的表结构。

## **语法结构**

```
> SHOW CREATE TABLE tbl_name
```

## **示例**

```sql
drop table if exists t1;
create table t1(
col1 int comment 'First column',
col2 float comment '"%$^&*()_+@!',
col3 varchar comment 'ZD5lTndyuEzw49gxR',
col4 bool comment ''
);
mysql> show create table t1;
+-------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                                                                                                                     |
+-------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| t1    | CREATE TABLE `t1` (
`col1` INT DEFAULT NULL COMMENT 'First column',
`col2` FLOAT DEFAULT NULL COMMENT '"%$^&*()_+@!',
`col3` VARCHAR(65535) DEFAULT NULL COMMENT 'ZD5lTndyuEzw49gxR',
`col4` BOOL DEFAULT NULL
) |
+-------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)
```

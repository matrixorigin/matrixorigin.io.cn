---
title: DROP STAGE
doc_type: reference
mysql_compat: mo_only
differs_from_mysql: []
mo_only:
- DROP STAGE
since: unknown
last_updated: 2026-05-08
llms_summary: DROP STAGE 用于在 MatrixOne 中删除指定的 stage。需要注意的是，删除 stage 后，stage 所关联的外部存储位置中的文件不会被移除，仅会删除与 stage 的映射关系。
---

# **DROP STAGE**


> DROP STAGE 用于在 MatrixOne 中删除指定的 stage。需要注意的是，删除 stage 后，stage
> 所关联的外部存储位置中的文件不会被移除，仅会删除与 stage 的映射关系。

## **语法说明**

`DROP STAGE` 用于在 MatrixOne 中删除指定的 stage。需要注意的是，删除 stage 后，stage 所关联的外部存储位置中的文件不会被移除，仅会删除与 stage 的映射关系。

## **语法结构**

```
> DROP STAGE [IF EXISTS] {stage_name};
```

## **示例**

```sql
mysql> create stage stage_fs url = 'file:///Users/admin/test';

mysql>drop stage stage_fs;
```

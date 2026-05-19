---
title: DROP ACCOUNT
doc_type: reference
mysql_compat: mo_only
differs_from_mysql: []
mo_only:
- DROP ACCOUNT
since: unknown
last_updated: 2026-05-08
llms_summary: 将指定的租户从某个集群成员中移除。
---

# **DROP ACCOUNT**


> 将指定的租户从某个集群成员中移除。

## **语法说明**

将指定的租户从某个集群成员中移除。

## **语法结构**

```
> DROP ACCOUNT  [IF EXISTS] account
```

## **示例**

```sql
> drop account if exists tenant_test;
Query OK, 0 rows affected (0.12 sec)
```

!!! note
    如果租户正在会话中，当租户被移除，会话随即断开，无法再连接 MatrixOne。

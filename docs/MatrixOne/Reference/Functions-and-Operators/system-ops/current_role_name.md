---
title: CURRENT_ROLE_NAME()
doc_type: reference
mysql_compat: mo_only
differs_from_mysql: []
mo_only:
- 'MatrixOne multi-account/role system management function (compat doc: System Management Functions).'
since: unknown
last_updated: 2026-05-08
llms_summary: CURRENT_ROLE_NAME() 用于查询你当前所登录的用户所拥有的角色的名称。
---

# **CURRENT_ROLE_NAME()**


> CURRENT_ROLE_NAME() 用于查询你当前所登录的用户所拥有的角色的名称。

## **函数说明**

`CURRENT_ROLE_NAME()` 用于查询你当前所登录的用户所拥有的角色的名称。

## **函数语法**

```
> CURRENT_ROLE_NAME()
```

## **示例**

```sql
mysql> select current_role_name();
+---------------------+
| current_role_name() |
+---------------------+
| moadmin             |
+---------------------+
1 row in set (0.00 sec)
```

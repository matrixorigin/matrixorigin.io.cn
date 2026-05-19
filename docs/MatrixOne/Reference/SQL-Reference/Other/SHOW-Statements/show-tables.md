---
title: SHOW TABLES
doc_type: reference
mysql_compat: partial
differs_from_mysql:
- Result column is named 'name' rather than MySQL's 'Tables_in_<dbname>'.
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: 以列表的形式展现当前数据库创建的所有表。
---

# **SHOW TABLES**


> 以列表的形式展现当前数据库创建的所有表。

## **语法说明**

以列表的形式展现当前数据库创建的所有表。

## **语法结构**

```
> SHOW TABLES  [LIKE 'pattern' | WHERE expr | FROM 'pattern' | IN 'pattern']
```

## **示例**

```sql
> SHOW TABLES;
+---------------+
| name          |
+---------------+
| clusters      |
| contributors  |
| databases     |
| functions     |
| numbers       |
| numbers_local |
| numbers_mt    |
| one           |
| processes     |
| settings      |
| tables        |
| tracing       |
+---------------+
```

---
title: USE
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: USE 语句用于选择当前数据库，在此数据库进行后续操作。
---

# **USE**


> USE 语句用于选择当前数据库，在此数据库进行后续操作。

## **语法说明**

`USE` 语句用于选择当前数据库，在此数据库进行后续操作。

## **语法结构**

```
> USE db_name
```

## **示例**

```
> USE db1;
> SELECT COUNT(*) FROM mytable; 
```
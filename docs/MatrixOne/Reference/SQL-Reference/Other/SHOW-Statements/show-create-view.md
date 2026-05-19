---
title: SHOW CREATE VIEW
doc_type: reference
mysql_compat: partial
differs_from_mysql:
- DEFINER = user clause absent from output; SQL SECURITY {DEFINER|INVOKER} is emitted
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: 这个语句显示了创建命名视图的 CREATE VIEW 语句。
---

# **SHOW CREATE VIEW**


> 这个语句显示了创建命名视图的 CREATE VIEW 语句。

## **语法说明**

这个语句显示了创建命名视图的 `CREATE VIEW` 语句。

## **语法结构**

```
> SHOW CREATE VIEW view_name
```

## **示例**

```sql
create table test_table(col1 int, col2 float, col3 bool, col4 Date, col5 varchar(255), col6 text);
create view test_view as select * from test_table;
mysql> show create view test_view;
+-----------+---------------------------------------------------+
| View      | Create View                                       |
+-----------+---------------------------------------------------+
| test_view | create view test_view as select * from test_table |
+-----------+---------------------------------------------------+
1 row in set (0.01 sec)
```

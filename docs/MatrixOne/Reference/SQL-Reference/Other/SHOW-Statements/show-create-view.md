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

从 v3.0.12 开始，`Create View` 列中始终会在 `CREATE` 与 `VIEW` 关键字之间
渲染出 `SQL SECURITY DEFINER` 或 `SQL SECURITY INVOKER`，即使最初的 DDL
并未显式指定安全类型。该安全类型来源于视图的元数据；视图体中恰巧出现的
`SQL SECURITY` 文本不会被当作安全子句解析。

## **语法结构**

```
> SHOW CREATE VIEW view_name
```

## **示例**

```sql
create table test_table(col1 int, col2 float, col3 bool, col4 Date, col5 varchar(255), col6 text);
create view test_view as select * from test_table;
mysql> show create view test_view;
+-----------+------------------------------------------------------------------------+
| View      | Create View                                                            |
+-----------+------------------------------------------------------------------------+
| test_view | create sql security definer view test_view as select * from test_table |
+-----------+------------------------------------------------------------------------+
1 row in set (0.01 sec)
```

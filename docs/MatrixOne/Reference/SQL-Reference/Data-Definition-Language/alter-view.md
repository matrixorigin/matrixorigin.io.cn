---
title: ALTER VIEW
doc_type: reference
mysql_compat: partial
differs_from_mysql:
- 'Inherits CREATE VIEW limitations: no WITH CHECK OPTION, no DEFINER = user clause'
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: ALTER VIEW 用于更改视图。
---

# **ALTER VIEW**

> ALTER VIEW 用于更改视图。

## **语法说明**

`ALTER VIEW` 用于更改视图。

如果语法参数列表中命名的视图不存在，则语句报错：该视图无效。

从 v3.0.12 开始，`ALTER VIEW` 支持可选的 `SQL SECURITY` 子句，用于更新
视图元数据中保存的安全类型。`DEFINER` 与 `INVOKER` 的含义参见
[CREATE VIEW](create-view.md)。若未显式带该子句，MatrixOne 会以当前会话
变量 `view_security_type` 的值重新写入视图的安全类型。

## **语法结构**

```
> ALTER [SQL SECURITY { DEFINER | INVOKER }] VIEW view_name [(column_list)]
  AS select_statement
  [WITH [CASCADED | LOCAL] CHECK OPTION]
```

## **示例**

```sql
drop table if exists t1;
create table t1 (a int);
insert into t1 values(1),(2),(3),(4);
create view v5 as select * from t1;

mysql> select * from v5;
+------+
| a    |
+------+
|    1 |
|    2 |
|    3 |
|    4 |
+------+
4 rows in set (0.01 sec)

alter view v5 as select * from t1 where a=1;

mysql> select * from v5;
+------+
| a    |
+------+
|    1 |
+------+
1 row in set (0.01 sec)

alter view v5 as select * from t1 where a > 2;

mysql> select * from v5;
+------+
| a    |
+------+
|    3 |
|    4 |
+------+
2 rows in set (0.00 sec)
```

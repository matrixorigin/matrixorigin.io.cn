---
title: CREATE VIEW
doc_type: reference
mysql_compat: partial
differs_from_mysql:
- WITH CHECK OPTION clause not supported
- DEFINER = user clause not supported; SQL SECURITY {DEFINER | INVOKER} is supported
- ALGORITHM = {UNDEFINED | MERGE | TEMPTABLE} clause not supported
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: 视图是基于 SQL 语句的结果集的可视化的表。
---

# **CREATE VIEW**

> 视图是基于 SQL 语句的结果集的可视化的表。

## **语法说明**

视图是基于 SQL 语句的结果集的可视化的表。

视图包含行和列，就像一个真实的表。视图中的字段就是来自一个或多个数据库中的真实的表中的字段。

您可以向视图添加 SQL 函数，`WHERE` 或者 `JOIN` 语句，也同样可以呈现数据，类似于这些数据来自于某个单一的表一样。

`CREATE VIEW` 语句用于创建一个视图。

从 v3.0.13 开始，MatrixOne 支持在 `CREATE VIEW` 上显式指定 `SQL SECURITY`
子句，用于控制查询视图时的权限校验路径：

- `SQL SECURITY DEFINER`（默认）：以视图创建者（definer）所属角色的权限
  校验。调用者只需对视图本身拥有 `SELECT` 权限，无需持有视图底层表的权限。
- `SQL SECURITY INVOKER`：以调用者当前角色的权限校验。调用者必须同时拥有
  视图的 `SELECT` 权限，以及视图引用到的所有底层表对应的权限。

当 DDL 未显式带 `SQL SECURITY` 子句时，由会话变量 `view_security_type`
（取值 `DEFINER` / `INVOKER`，默认 `DEFINER`）决定最终写入视图元数据的
安全类型。

## **语法结构**

```
> CREATE [ OR REPLACE ] [SQL SECURITY { DEFINER | INVOKER }] VIEW view_name AS
  SELECT column1, column2, ...
  FROM table_name
  WHERE condition;
```

!!! note
    视图总是显示最新的数据。每当你查询视图时，数据库引擎通过使用视图的 SQL 语句重建数据。

!!! note
    视图元数据中保存的 `SQL SECURITY` 类型可以通过 [SHOW CREATE VIEW](../Other/SHOW-Statements/show-create-view.md) 查看。输出的 `Create View` 列会在 `CREATE` 与 `VIEW` 之间渲染出 `SQL SECURITY DEFINER` 或 `SQL SECURITY INVOKER`。

## **示例**

- 示例 1：

```sql
CREATE TABLE t00(a INTEGER);
INSERT INTO t00 VALUES (1),(2);
CREATE TABLE t01(a INTEGER);
INSERT INTO t01 VALUES (1);
CREATE OR REPLACE VIEW v0 AS SELECT t00.a, t01.a AS b FROM t00 LEFT JOIN t01 USING(a);

mysql> SELECT t00.a, t01.a AS b FROM t00 LEFT JOIN t01 USING(a);
+------+------+
| a    | b    |
+------+------+
|    1 |    1 |
|    2 | NULL |
+------+------+
2 rows in set (0.01 sec)

mysql> SELECT * FROM v0 WHERE b >= 0;
+------+------+
| a    | b    |
+------+------+
|    1 |    1 |
+------+------+
1 row in set (0.01 sec)

mysql> SHOW CREATE VIEW v0;
+------+---------------------------------------------------------------------------------------+
| View | Create View                                                                           |
+------+---------------------------------------------------------------------------------------+
| v0   | CREATE OR REPLACE VIEW v0 AS SELECT t00.a, t01.a AS b FROM t00 LEFT JOIN t01 USING(a) |
+------+---------------------------------------------------------------------------------------+
1 row in set (0.00 sec)
```

- 示例 2：

```sql
drop table if exists t1;
create table t1 (id int,ti tinyint unsigned,si smallint,bi bigint unsigned,fl float,dl double,de decimal,ch char(20),vch varchar(20),dd date,dt datetime);
insert into t1 values(1,1,4,3,1113.32,111332,1113.32,'hello','subquery','2022-04-28','2022-04-28 22:40:11');
insert into t1 values(2,2,5,2,2252.05,225205,2252.05,'bye','sub query','2022-04-28','2022-04-28 22:40:11');
insert into t1 values(3,6,6,3,3663.21,366321,3663.21,'hi','subquery','2022-04-28','2022-04-28 22:40:11');
insert into t1 values(4,7,1,5,4715.22,471522,4715.22,'good morning','my subquery','2022-04-28','2022-04-28 22:40:11');
insert into t1 values(5,1,2,6,51.26,5126,51.26,'byebye',' is subquery?','2022-04-28','2022-04-28 22:40:11');
insert into t1 values(6,3,2,1,632.1,6321,632.11,'good night','maybe subquery','2022-04-28','2022-04-28 22:40:11');
insert into t1 values(7,4,4,3,7443.11,744311,7443.11,'yes','subquery','2022-04-28','2022-04-28 22:40:11');
insert into t1 values(8,7,5,8,8758.00,875800,8758.11,'nice to meet','just subquery','2022-04-28','2022-04-28 22:40:11');
insert into t1 values(9,8,4,9,9849.312,9849312,9849.312,'see you','subquery','2022-04-28','2022-04-28 22:40:11');
drop table if exists t2;
create table t2 (id int,ti tinyint unsigned,si smallint,bi bigint unsigned,fl float,dl double,de decimal,ch char(20),vch varchar(20),dd date,dt datetime);
insert into t2 values(1,1,4,3,1113.32,111332,1113.32,'hello','subquery','2022-04-28','2022-04-28 22:40:11');
insert into t2 values(2,2,5,2,2252.05,225205,2252.05,'bye','sub query','2022-04-28','2022-04-28 22:40:11');
insert into t2 values(3,6,6,3,3663.21,366321,3663.21,'hi','subquery','2022-04-28','2022-04-28 22:40:11');
insert into t2 values(4,7,1,5,4715.22,471522,4715.22,'good morning','my subquery','2022-04-28','2022-04-28 22:40:11');
insert into t2 values(5,1,2,6,51.26,5126,51.26,'byebye',' is subquery?','2022-04-28','2022-04-28 22:40:11');
insert into t2 values(6,3,2,1,632.1,6321,632.11,'good night','maybe subquery','2022-04-28','2022-04-28 22:40:11');
insert into t2 values(7,4,4,3,7443.11,744311,7443.11,'yes','subquery','2022-04-28','2022-04-28 22:40:11');
insert into t2 values(8,7,5,8,8758.00,875800,8758.11,'nice to meet','just subquery','2022-04-28','2022-04-28 22:40:11');
insert into t2 values(9,8,4,9,9849.312,9849312,9849.312,'see you','subquery','2022-04-28','2022-04-28 22:40:11');

mysql> select * from (select * from t1) sub where id > 4;
+------+------+------+------+----------+---------+------+--------------+----------------+------------+---------------------+
| id   | ti   | si   | bi   | fl       | dl      | de   | ch           | vch            | dd         | dt                  |
+------+------+------+------+----------+---------+------+--------------+----------------+------------+---------------------+
|    5 |    1 |    2 |    6 |    51.26 |    5126 |   51 | byebye       |  is subquery?  | 2022-04-28 | 2022-04-28 22:40:11 |
|    6 |    3 |    2 |    1 |    632.1 |    6321 |  632 | good night   | maybe subquery | 2022-04-28 | 2022-04-28 22:40:11 |
|    7 |    4 |    4 |    3 |  7443.11 |  744311 | 7443 | yes          | subquery       | 2022-04-28 | 2022-04-28 22:40:11 |
|    8 |    7 |    5 |    8 |     8758 |  875800 | 8758 | nice to meet | just subquery  | 2022-04-28 | 2022-04-28 22:40:11 |
|    9 |    8 |    4 |    9 | 9849.312 | 9849312 | 9849 | see you      | subquery       | 2022-04-28 | 2022-04-28 22:40:11 |
+------+------+------+------+----------+---------+------+--------------+----------------+------------+---------------------+
5 rows in set (0.01 sec)

create view v1 as select * from (select * from t1) sub where id > 4;
create view v2 as select ti as t,fl as f from (select * from t1) sub where dl <> 4;
create view v3 as select * from (select ti as t,fl as f from t1 where dl <> 4) sub;
create view v4 as select id,min(ti) from (select * from t1) sub group by id;
create view v5 as select * from (select id,min(ti) from (select * from t1) t1 group by id) sub;

mysql> select * from v1;
+------+------+------+------+----------+---------+------+--------------+----------------+------------+---------------------+
| id   | ti   | si   | bi   | fl       | dl      | de   | ch           | vch            | dd         | dt                  |
+------+------+------+------+----------+---------+------+--------------+----------------+------------+---------------------+
|    5 |    1 |    2 |    6 |    51.26 |    5126 |   51 | byebye       |  is subquery?  | 2022-04-28 | 2022-04-28 22:40:11 |
|    6 |    3 |    2 |    1 |    632.1 |    6321 |  632 | good night   | maybe subquery | 2022-04-28 | 2022-04-28 22:40:11 |
|    7 |    4 |    4 |    3 |  7443.11 |  744311 | 7443 | yes          | subquery       | 2022-04-28 | 2022-04-28 22:40:11 |
|    8 |    7 |    5 |    8 |     8758 |  875800 | 8758 | nice to meet | just subquery  | 2022-04-28 | 2022-04-28 22:40:11 |
|    9 |    8 |    4 |    9 | 9849.312 | 9849312 | 9849 | see you      | subquery       | 2022-04-28 | 2022-04-28 22:40:11 |
+------+------+------+------+----------+---------+------+--------------+----------------+------------+---------------------+
5 rows in set (0.00 sec)

mysql> select * from v2;
+------+----------+
| t    | f        |
+------+----------+
|    1 |  1113.32 |
|    2 |  2252.05 |
|    6 |  3663.21 |
|    7 |  4715.22 |
|    1 |    51.26 |
|    3 |    632.1 |
|    4 |  7443.11 |
|    7 |     8758 |
|    8 | 9849.312 |
+------+----------+
9 rows in set (0.00 sec)

mysql> select * from v3;
+------+----------+
| t    | f        |
+------+----------+
|    1 |  1113.32 |
|    2 |  2252.05 |
|    6 |  3663.21 |
|    7 |  4715.22 |
|    1 |    51.26 |
|    3 |    632.1 |
|    4 |  7443.11 |
|    7 |     8758 |
|    8 | 9849.312 |
+------+----------+
9 rows in set (0.00 sec)

mysql> select * from v4;
+------+---------+
| id   | min(ti) |
+------+---------+
|    1 |       1 |
|    2 |       2 |
|    3 |       6 |
|    4 |       7 |
|    5 |       1 |
|    6 |       3 |
|    7 |       4 |
|    8 |       7 |
|    9 |       8 |
+------+---------+
9 rows in set (0.00 sec)

mysql> select * from v5;
+------+---------+
| id   | min(ti) |
+------+---------+
|    1 |       1 |
|    2 |       2 |
|    3 |       6 |
|    4 |       7 |
|    5 |       1 |
|    6 |       3 |
|    7 |       4 |
|    8 |       7 |
|    9 |       8 |
+------+---------+
9 rows in set (0.01 sec)
```

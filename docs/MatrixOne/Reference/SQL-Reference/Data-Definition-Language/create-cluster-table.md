# **CREATE CLUSTER TABLE**

## **语法说明**

集群表是指在系统租户下的系统库 `mo_catalog` 创建的表，该表会在其它租户下同时生效。系统租户下可对该表进行 DDL 与 DML 操作，其它租户只能进行查询或基于该表创建视图。

本篇文档将讲述如何在 MatrixOne 数据库建立集群表。

## **语法结构**

```
> CREATE CLUSTER TABLE [IF NOT EXISTS] tbl_name
    (create_definition,...)
    [table_options]
    [partition_options]
```

## **使用说明**

- 创建集群表仅限于 sys 租户管理员角色才能创建。

- sys 租户的集群表包含所有数据，其它租户下可能只会看到部分数据。

- 在集群表中，`account_id` 字段是自动生成的，表示在插入或 LOAD DATA 时指定数据的可见租户的 id，每条数据只能选择一个可见租户，若您想多个租户都能查看该数据，需要多次插入指定不同租户 id，该字段数据在其它租户中查询不会返回。

- 集群表不能为外表或临时表，在所有租户下的表结构完全相同。

## 示例

```sql
--创建两个租户 test1 和 test2
mysql> create account test1 admin_name = 'root' identified by '111' open comment 'tenant_test';
Query OK, 0 rows affected (0.44 sec)

mysql> create account test2 admin_name = 'root' identified by '111' open comment 'tenant_test';
Query OK, 0 rows affected (0.51 sec)

--在 sys 租户下创建集群表
mysql> use mo_catalog;
Database changed
mysql> drop table if exists t1;
Query OK, 0 rows affected (0.00 sec)

mysql> create cluster table t1(a int);
Query OK, 0 rows affected (0.01 sec)

--查看租户 id
mysql> select * from mo_account;
+------------+--------------+--------+---------------------+----------------+---------+----------------+
| account_id | account_name | status | created_time        | comments       | version | suspended_time |
+------------+--------------+--------+---------------------+----------------+---------+----------------+
|          0 | sys          | open   | 2024-01-11 08:56:57 | system account |       1 | NULL           |
|          6 | test1        | open   | 2024-01-15 03:15:40 | tenant_test    |       7 | NULL           |
|          7 | test2        | open   | 2024-01-15 03:15:48 | tenant_test    |       8 | NULL           |
+------------+--------------+--------+---------------------+----------------+---------+----------------+
3 rows in set (0.01 sec)

--在集群表 t1 中插入数据只对 test1 租户可见
mysql> insert into t1 values(1,6),(2,6),(3,6);
Query OK, 3 rows affected (0.01 sec)

--在 sys 租户中查看 t1 的数据，可看到包含`account_id`字段在内的所有数据
mysql> select * from t1;
+------+------------+
| a    | account_id |
+------+------------+
|    1 |          6 |
|    2 |          6 |
|    3 |          6 |
+------+------------+
3 rows in set (0.00 sec)

--在 test1 租户中查看 t1 的数据，可以看到非`account_id`字段的数据
mysql> select * from t1;
+------+
| a    |
+------+
|    1 |
|    2 |
|    3 |
+------+
3 rows in set (0.01 sec)

--在 test2 租户中查看 t1 的数据，不会看到有数据
mysql> select * from t1;
Empty set (0.01 sec)

--在 test1 租户中创建基于 t1 的视图
mysql> create view t1_view as select * from mo_catalog.t1;
Query OK, 0 rows affected (0.01 sec)

mysql> select * from t1_view;
+------+
| a    |
+------+
|    1 |
|    2 |
|    3 |
+------+
3 rows in set (0.00 sec)

--在 test2 租户中创建基于 t1 的视图
mysql> create view t1_view as select * from mo_catalog.t1;
Query OK, 0 rows affected (0.01 sec)

mysql> select * from t1_view;
Empty set (0.01 sec)
```

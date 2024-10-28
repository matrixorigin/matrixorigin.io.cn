# **CREATE...FROM...PUBLICATION...**

## **语法说明**

`CREATE...FROM...PUBLICATION...` 是订阅方订阅一个由发布方创建的发布，用来获取发布方的共享数据。

## **语法结构**

```
CREATE DATABASE database_name
FROM account_name
PUBLICATION pubname;
```

## 语法解释

- database_name：订阅方创建的数据库名称。
- pubname：发布方已发布的发布名称。
- account_name：可获取该发布的租户名称。

## **示例**

```sql
create account acc01 admin_name 'root' identified by '111';
create database db1;
use db1;
create table t1(n1 int);
create table t2(n1 int);

--创建发布
create publication db_pub1 database db1 account acc01;
create publication tab_pub1 database db1 table t1,t2 account acc01;

--连接租户 acc01
mysql> show subscriptions all;
+----------+-------------+--------------+------------+-------------+---------------------+----------+----------+--------+
| pub_name | pub_account | pub_database | pub_tables | pub_comment | pub_time            | sub_name | sub_time | status |
+----------+-------------+--------------+------------+-------------+---------------------+----------+----------+--------+
| tab_pub1 | sys         | db1          | t1,t2      |             | 2024-10-25 17:06:06 | NULL     | NULL     |      0 |
| db_pub1  | sys         | db1          | *          |             | 2024-10-25 17:05:54 | NULL     | NULL     |      0 |
+----------+-------------+--------------+------------+-------------+---------------------+----------+----------+--------+
2 rows in set (0.00 sec)

create database db_sub1 from sys publication db_pub1;
create database tab_sub1 from sys publication tab_pub1;

mysql> show subscriptions;
+----------+-------------+--------------+------------+-------------+---------------------+----------+---------------------+--------+
| pub_name | pub_account | pub_database | pub_tables | pub_comment | pub_time            | sub_name | sub_time            | status |
+----------+-------------+--------------+------------+-------------+---------------------+----------+---------------------+--------+
| tab_pub1 | sys         | db1          | t1,t2      |             | 2024-10-25 17:06:06 | tab_sub1 | 2024-10-25 17:09:24 |      0 |
| db_pub1  | sys         | db1          | *          |             | 2024-10-25 17:05:54 | db_sub1  | 2024-10-25 17:09:23 |      0 |
+----------+-------------+--------------+------------+-------------+---------------------+----------+---------------------+--------+
2 rows in set (0.00 sec)
```

!!! note
    如果需要取消订阅，可以直接删除已订阅的数据库名称，使用 [`DROP DATABASE`](drop-database.md)。

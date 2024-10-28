# **SHOW SUBSCRIPTIONS**

## **语法说明**

返回所有发布名、发布租户名、发布的数据库名、发布的表名、备注、发布给该租户的时间、订阅名、创建该订阅的时间和订阅状态（0：可正常订阅；1：发布存在，但无订阅权限；2：本来订阅了发布，但是又删除了发布）。

## **语法结构**

```
SHOW SUBSCRIPTIONS [ALL];
```

## **语法解释**

- **ALL** 选项可以看到所有有权限的订阅，未订阅的 sub_time, sub_name 为 null，不加 **ALL** 只能看到已订阅的发布信息。

## **示例**

```sql

-- 在 sys 租户执行

create account acc01 admin_name 'root' identified by '111';
create account acc02 admin_name 'root' identified by '111';
create database db1;
use db1;
create table t1(n1 int);
create table t2(n1 int);

--数据库级别发布
create publication db_pub1 database db1 account acc01,acc02;

--表级别发布
create publication tab_pub1 database db1 table t1,t2 account acc01,acc02;

-- 在 acc01 租户执行
mysql> show subscriptions all;
+----------+-------------+--------------+------------+-------------+---------------------+----------+----------+--------+
| pub_name | pub_account | pub_database | pub_tables | pub_comment | pub_time            | sub_name | sub_time | status |
+----------+-------------+--------------+------------+-------------+---------------------+----------+----------+--------+
| tab_pub1 | sys         | db1          | t1,t2      |             | 2024-10-14 19:00:21 | NULL     | NULL     |      0 |
| db_pub1  | sys         | db1          | *          |             | 2024-10-14 19:00:16 | NULL     | NULL     |      0 |
+----------+-------------+--------------+------------+-------------+---------------------+----------+----------+--------+
2 rows in set (0.00 sec)

mysql> show subscriptions;
Empty set (0.00 sec)

create database db_sub1 from sys publication db_pub1;
create database tab_sub1 from sys publication tab_pub1;

mysql> show subscriptions all;
+----------+-------------+--------------+------------+-------------+---------------------+----------+---------------------+--------+
| pub_name | pub_account | pub_database | pub_tables | pub_comment | pub_time            | sub_name | sub_time            | status |
+----------+-------------+--------------+------------+-------------+---------------------+----------+---------------------+--------+
| tab_pub1 | sys         | db1          | t1,t2      |             | 2024-10-14 19:00:21 | tab_sub1 | 2024-10-14 19:01:41 |      0 |
| db_pub1  | sys         | db1          | *          |             | 2024-10-14 19:00:16 | db_sub1  | 2024-10-14 19:01:30 |      0 |
+----------+-------------+--------------+------------+-------------+---------------------+----------+---------------------+--------+
2 rows in set (0.00 sec)

mysql> show subscriptions;
+----------+-------------+--------------+------------+-------------+---------------------+----------+---------------------+--------+
| pub_name | pub_account | pub_database | pub_tables | pub_comment | pub_time            | sub_name | sub_time            | status |
+----------+-------------+--------------+------------+-------------+---------------------+----------+---------------------+--------+
| tab_pub1 | sys         | db1          | t1,t2      |             | 2024-10-14 19:00:21 | tab_sub1 | 2024-10-14 19:01:41 |      0 |
| db_pub1  | sys         | db1          | *          |             | 2024-10-14 19:00:16 | db_sub1  | 2024-10-14 19:01:30 |      0 |
+----------+-------------+--------------+------------+-------------+---------------------+----------+---------------------+--------+
2 rows in set (0.00 sec)
```

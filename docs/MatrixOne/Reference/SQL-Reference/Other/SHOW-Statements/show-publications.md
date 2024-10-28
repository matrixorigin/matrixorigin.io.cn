# **SHOW PUBLICATIONS**

## **语法说明**

返回所有发布名、发布的数据库/表名、发布创建时间、发布最新修改时间、发布指定的租户名列表（如果是所有则展示 "*"）等信息。

如需查看更多信息，需要拥有租户管理员权限，查看系统表 mo_pubs 查看更多参数。

## **语法结构**

```
SHOW PUBLICATIONS;
```

## **示例**

```sql
create account acc0 admin_name 'root' identified by '111';
create account acc1 admin_name 'root' identified by '111';
create account acc2 admin_name 'root' identified by '111';
create database t;
create publication pub3 database t account acc0,acc1;

mysql> show publications;
+-------------+----------+--------+-------------+---------------------+---------------------+-------------+----------+
| publication | database | tables | sub_account | subscribed_accounts | create_time         | update_time | comments |
+-------------+----------+--------+-------------+---------------------+---------------------+-------------+----------+
| pub3        | t        | *      | acc0,acc1   |                     | 2024-10-25 16:36:04 | NULL        |          |
+-------------+----------+--------+-------------+---------------------+---------------------+-------------+----------+
1 row in set (0.00 sec)
```

# **ALTER PUBLICATION**

## **语法说明**

`ALTER PUBLICATION` 修改发布内容。

## **语法结构**

```
ALTER PUBLICATION pubname 
    [ACCOUNT 
            { ALL
            | account_name, [, ... ]
            | ADD account_name, [, ... ]
            | DROP account_name, [, ... ]]
    [COMMENT 'string']
    [DATABASE database_name]
```

## 语法解释

- pubname：已存在的发布名称。
- account_name：可获取该发布的租户名称。
- database_name：要修改成的发布库名称。

## **示例**

```sql
create account acc0 admin_name 'root' identified by '111';
create account acc1 admin_name 'root' identified by '111';
create account acc2 admin_name 'root' identified by '111';
create database t;
create publication pub3 database t account acc0,acc1;

alter publication pub3 account add accx;--修改发布范围
mysql> show create publication pub3;
+-------------+-----------------------------------------------------------------------+
| Publication | Create Publication                                                    |
+-------------+-----------------------------------------------------------------------+
| pub3        | CREATE PUBLICATION `pub3` DATABASE `t` ACCOUNT `acc0`, `acc1`, `accx` |
+-------------+-----------------------------------------------------------------------+
1 row in set (0.01 sec)

mysql> show publications;
+-------------+----------+---------------------+---------------------+----------------+----------+
| publication | database | create_time         | update_time         | sub_account    | comments |
+-------------+----------+---------------------+---------------------+----------------+----------+
| pub3        | t        | 2024-04-24 11:17:37 | 2024-04-24 11:17:44 | acc0,acc1,accx |          |
+-------------+----------+---------------------+---------------------+----------------+----------+
1 row in set (0.01 sec)

alter publication pub3  comment "this is pubs";--修改发布备注
mysql> show publications;
+-------------+----------+---------------------+---------------------+----------------+--------------+
| publication | database | create_time         | update_time         | sub_account    | comments     |
+-------------+----------+---------------------+---------------------+----------------+--------------+
| pub3        | t        | 2024-04-24 11:17:37 | 2024-04-24 11:41:43 | acc0,acc1,accx | this is pubs |
+-------------+----------+---------------------+---------------------+----------------+--------------+
1 row in set (0.00 sec)

create database new_pub3;
alter publication pub3 database new_pub3;--修改发布数据库
mysql> show publications;
+-------------+----------+---------------------+---------------------+----------------+--------------+
| publication | database | create_time         | update_time         | sub_account    | comments     |
+-------------+----------+---------------------+---------------------+----------------+--------------+
| pub3        | new_pub3 | 2024-04-24 11:17:37 | 2024-04-24 11:43:36 | acc0,acc1,accx | this is pubs |
+-------------+----------+---------------------+---------------------+----------------+--------------+
1 row in set (0.00 sec)
```

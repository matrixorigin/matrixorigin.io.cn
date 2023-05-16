# **ALTER PUBLICATION**

## **语法说明**

`ALTER PUBLICATION` 将一个新的发布添加到当前数据库中。

## **语法结构**

```
ALTER PUBLICATION pubname ACCOUNT 
    { ALL
    | account_name, [, ... ]
    | ADD account_name, [, ... ]
    | DROP account_name, [, ... ]
    [ COMMENT 'string']
```

## 语法解释

- pubname：已存在的发布名称。
- account_name：可获取该发布的租户名称。

## **示例**

```sql
create account acc0 admin_name 'root' identified by '111';
create account acc1 admin_name 'root' identified by '111';
create account acc2 admin_name 'root' identified by '111';
create database t;
create publication pub3 database t account acc0,acc1;
mysql> alter publication pub3 account add accx;
show create publication pub3;
Query OK, 0 rows affected (0.00 sec)

mysql> show create publication pub3;
+-------------+-----------------------------------------------------------------------+
| Publication | Create Publication                                                    |
+-------------+-----------------------------------------------------------------------+
| pub3        | CREATE PUBLICATION `pub3` DATABASE `t` ACCOUNT `acc0`, `acc1`, `accx` |
+-------------+-----------------------------------------------------------------------+
1 row in set (0.01 sec)

mysql> show publications;
+------+----------+
| Name | Database |
+------+----------+
| pub3 | t        |
+------+----------+
1 row in set (0.00 sec)
```

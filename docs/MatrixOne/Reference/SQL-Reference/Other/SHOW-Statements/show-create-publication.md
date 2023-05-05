# **SHOW CREATE PUBLICATION**

## **语法说明**

返回 PUBLICATION 创建时的 SQL 语句。

## **语法结构**

```
SHOW CREATE PUBLICATION pubname;
```

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
```

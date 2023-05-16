# **DROP PUBLICATION**

## **语法说明**

`DROP PUBLICATION` 将一个已存在的发布删除。

## **语法结构**

```
DROP PUBLICATION pubname;
```

## 语法解释

- pubname：已存在的发布名称。

## **示例**

```sql
create account acc0 admin_name 'root' identified by '111';
create account acc1 admin_name 'root' identified by '111';
create account acc2 admin_name 'root' identified by '111';
create database t;
create publication pub3 database t account acc0,acc1;

mysql> show publications;
+------+----------+
| Name | Database |
+------+----------+
| pub3 | t        |
+------+----------+
1 row in set (0.00 sec)

mysql> drop publication pub3;
Query OK, 0 rows affected (0.01 sec)

mysql> show publications;
Empty set (0.00 sec)  
```

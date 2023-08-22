# **SHOW ROLES**

## **函数说明**

列出为你的账户下创建的角色的元信息，包括角色名称、创建者、创建时间以及注释内容。

__Note:__ 如果需要查询你当前所使用的角色，使用 [`select current_role()`](../../../Functions-and-Operators/system-ops/current_role.md) 语句。

## **函数语法**

```
> SHOW ROLES [LIKE 'pattern'];
```

## **示例**

```sql
-- 展示当前你账户下的角色
mysql> show roles;
+-----------+---------+---------------------+----------+
| ROLE_NAME | CREATOR | CREATED_TIME        | COMMENTS |
+-----------+---------+---------------------+----------+
| moadmin   |       0 | 2023-04-19 06:37:58 |          |
| public    |       0 | 2023-04-19 06:37:58 |          |
+-----------+---------+---------------------+----------+
2 rows in set (0.01 sec)

-- 创建一个新的角色 rolex
mysql> create role rolex;
Query OK, 0 rows affected (0.02 sec)

-- 再次查看当前你账户下的角色
mysql> show roles;
+-----------+---------+---------------------+----------+
| ROLE_NAME | CREATOR | CREATED_TIME        | COMMENTS |
+-----------+---------+---------------------+----------+
| rolex     |       1 | 2023-04-19 06:43:29 |          |
| moadmin   |       0 | 2023-04-19 06:37:58 |          |
| public    |       0 | 2023-04-19 06:37:58 |          |
+-----------+---------+---------------------+----------+
3 rows in set (0.01 sec)

-- 查询当前你所使用的角色
mysql> select current_role();
+----------------+
| current_role() |
+----------------+
| moadmin        |
+----------------+
1 row in set (0.00 sec)
```

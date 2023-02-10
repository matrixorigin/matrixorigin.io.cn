# **REVOKE**

## **语法说明**

将某个用户或者角色上被赋予的权限收回。

## **语法结构**

```
> REVOKE [IF EXISTS]
    priv_type [(column_list)]
      [, priv_type [(column_list)]] ...
    ON object_type priv_level

> REVOKE [IF EXISTS] role [, role ] ...
    FROM user_or_role [, user_or_role ] ...
```

## **示例**

```sql
> CREATE USER mouser IDENTIFIED BY '111';
Query OK, 0 rows affected (0.10 sec)

> CREATE ROLE role_r1;
Query OK, 0 rows affected (0.05 sec)

> GRANT role_r1 to mouser;
Query OK, 0 rows affected (0.04 sec)

> GRANT create table on database * to role_r1;
Query OK, 0 rows affected (0.03 sec)

> SHOW GRANTS for mouser@localhost;
+-------------------------------------------------------+
| Grants for mouser@localhost                           |
+-------------------------------------------------------+
| GRANT create table ON database * `mouser`@`localhost` |
| GRANT connect ON account  `mouser`@`localhost`        |
+-------------------------------------------------------+
2 rows in set (0.02 sec)

> REVOKE role_r1 from mouser;
Query OK, 0 rows affected (0.04 sec)

> SHOW GRANT for mouser@localhost;
+------------------------------------------------+
| Grants for mouser@localhost                    |
+------------------------------------------------+
| GRANT connect ON account  `mouser`@`localhost` |
+------------------------------------------------+
1 row in set (0.02 sec)
```

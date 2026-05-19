# **REVOKE**

## **语法说明**

将某个用户或者角色上被赋予的权限收回。

从 v3.0.11 开始，`object_type` 新增 `VIEW`，与 `TABLE` / `FUNCTION` /
`PROCEDURE` 并列。`REVOKE ... ON TABLE ...` 只会回收表对象上的授权，不会
隐式回收对应视图上的授权；需要回收视图权限时使用 `ON VIEW`：

```
revoke select on view db1.v1 from role1;
```

## **语法结构**

```
> REVOKE [IF EXISTS]
    priv_type [(column_list)]
      [, priv_type [(column_list)]] ...
    ON object_type priv_level

> REVOKE [IF EXISTS] role [, role ] ...
    FROM user_or_role [, user_or_role ] ...

object_type: {
    TABLE
  | VIEW
  | FUNCTION
  | PROCEDURE
}
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

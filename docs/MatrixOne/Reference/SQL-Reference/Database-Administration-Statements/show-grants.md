# **SHOW GRANTS**

## **语法说明**

使用 `SHOW GRANTS` 语句显示用户的所有授权信息。`SHOW GRANTS` 语句显示使用 `GRANT` 命令分配给用户的权限。

`SHOW GRANTS` 需要 MatrixOne 系统模式的 `SELECT` 权限，但显示当前用户的权限和角色除外。

要为 `SHOW GRANTS` 命名帐户或角色，即使用与 `GRANT` 语句相同的格式，例如：

```
show grants for 'root'@'localhost';
```

## **语法结构**

```
> SHOW GRANTS FOR {username[@hostname] | rolename};
```

## **示例**

```sql
> create role role1;
> grant all on table *.* to role1;
> grant create table, drop table on database *.* to role1;
> create user user1 identified by 'pass1';
> grant role1 to user1;
> show grants for 'user1'@'localhost';
+--------------------------------------------------------+
| Grants for user1@localhost                             |
+--------------------------------------------------------+
| GRANT connect ON account  `user1`@`localhost`          |
| GRANT table all ON table *.* `user1`@`localhost`       |
| GRANT create table ON database *.* `user1`@`localhost` |
| GRANT drop table ON database *.* `user1`@`localhost`   |
+--------------------------------------------------------+
4 rows in set (0.00 sec)
```

## **限制**

当前 MatrixOne 还不支持查看角色权限，即暂不支持 `SHOW GRANTS FOR {rolename}`。

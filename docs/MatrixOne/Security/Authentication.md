# 身份鉴别与认证

用户在访问 MatrixOne 数据库时需要进行身份鉴别与认证，目前 MatrixOne 仅支持用户名密码验证方式登录。数据库会对访问数据的用户进行身份验证，确认该用户是否能够与某一个数据库用户进行关联，并检查其提供的密码是否有效。

## 登录语法

在 MatrixOne 中，用户的登录身份鉴别由 `acccount_name`，`user_name`，`host`，`password` 共同组成。完整的登录语法如下：

```
mysql -h host -p password -u accountname:username -P port
```

其中 `-h`、`-p`、`-P` 参数与 MySQL 相同。不同之处在于：

* `-u` 代表用户，在 MatrixOne 的用户体系中，用户是位于租户 `account` 以下一层的概念，因此登录时需要先指定租户 `account_name`，再指定租户中的用户 `username` 才能完成登录。如果不指定 `account_name`，则默认为系统租户 `sys`。

示例：

```
> mysql -h 127.0.0.1 -P6001 -utenant1:u1 -p111
```

!!! note
    对于单机版 MatrixOne，可以通过参数配置将连接字符串简化到 [mo_ctl 工具](../Maintain/mo_ctl.md) 中，以简化登录操作。

## 查询当前用户

登录后要获取有关当前用户的信息，可以使用 `user()` 或 `current_user()` 函数。

```
mysql> select user();
+--------------------+
| user()             |
+--------------------+
| tenant1:u1@0.0.0.0 |
+--------------------+
1 row in set (0.00 sec)
mysql> select current_user();
+--------------------+
| current_user()     |
+--------------------+
| tenant1:u1@0.0.0.0 |
+--------------------+
1 row in set (0.00 sec)
```

!!! note
    目前 MatrixOne 不支持 IP 白名单，因此无论从任何位置登录查看的用户都为 0.0.0.0。

## 查询所有用户

每个用户身份具有唯一性，每个具有 `accountadmin` 角色的用户可以查看该租户下的所有用户。

```
mysql> select * from mo_catalog.mo_user;
+---------+-----------+-----------+-------------------------------------------+--------+---------------------+--------------+------------+---------+-------+--------------+
| user_id | user_host | user_name | authentication_string                     | status | created_time        | expired_time | login_type | creator | owner | default_role |
+---------+-----------+-----------+-------------------------------------------+--------+---------------------+--------------+------------+---------+-------+--------------+
|   10001 | localhost | u1        | *832EB84CB764129D05D498ED9CA7E5CE9B8F83EB | unlock | 2023-07-10 06:43:44 | NULL         | PASSWORD   |       0 |     0 |            1 |
|       0 | localhost | root      | *832EB84CB764129D05D498ED9CA7E5CE9B8F83EB | unlock | 2023-07-08 03:17:27 | NULL         | PASSWORD   |       0 |     0 |            0 |
|       1 | localhost | dump      | *832EB84CB764129D05D498ED9CA7E5CE9B8F83EB | unlock | 2023-07-08 03:17:27 | NULL         | PASSWORD   |       0 |     0 |            0 |
+---------+-----------+-----------+-------------------------------------------+--------+---------------------+--------------+------------+---------+-------+--------------+
3 rows in set (0.01 sec)
```

!!! note
    MatrixOne 中用户表的记录位置和表结构与 MySQL 不同。MatrixOne 中的用户元数据信息不存储在 `mysql.user` 表中，而是存储在 `mo_catalog.mo_user` 中。

## 使用限制

1. MatrixOne 目前没有强制要求密码复杂度，建议用户自行设置强密码。有关修改密码的操作，请参阅[密码管理](password-mgmt.md)。
2. MatrixOne 的初始用户（`sys` 租户的 `root` 用户）初始密码为 111。用户修改密码后需要自行记住新密码，一旦忘记密码，MatrixOne 目前没有提供找回或绕过安全验证进行密码重置的方法，必须重新安装 MatrixOne。

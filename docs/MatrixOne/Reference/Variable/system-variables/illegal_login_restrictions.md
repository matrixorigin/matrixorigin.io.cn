# 非法登录限制

在数据安全日益重要的今天，合理的连接控制和密码管理策略是数据库防护的关键。MatrixOne 提供了一系列全局参数，旨在加强连接安全和密码管理，防止恶意攻击和未授权访问。

- 连接控制参数
    - `connection_control_failed_connections_threshold`：该参数设置在短时间内允许的最大失败连接次数。当超过阈值后，MatrixOne 将拒绝该客户端的进一步连接尝试，从而有效防止暴力破解和恶意攻击。
    - `connection_control_max_connection_delay`：该参数指定客户端连接失败后需要等待的最大延迟时间。该延迟将在连接失败次数达到阈值后应用，以阻止进一步的连接尝试，增加恶意攻击的成本。

- 密码管理参数
    - `default_password_lifetime`：该参数指定用户密码的有效期，单位为天，默认值为 0，表示密码永不过期。当密码过期时，用户仍可登录数据库，但无法执行 SQL 操作，除非通过 `ALTER USER` 修改密码。
    - `password_history`：此参数限制用户在更改密码时不能使用最近的历史密码。如果设置为 5，用户将不能重用最近的 5 个密码。此配置可有效避免密码重用带来的安全隐患。
    - `password_reuse_interval`：该参数控制用户在密码过期后，不能在指定时间范围内重用历史密码。单位为天，默认值为 0，表示不进行历史密码的重用检查。

## 查看

```sql
SELECT @@global.connection_control_failed_connections_threshold; --默认值为 3
SELECT @@global.connection_control_max_connection_delay; --默认值为 0
SELECT @@global.default_password_lifetime; --默认值为 0
SELECT @@global.password_history; --默认值为 0
SELECT @@global.password_reuse_interval; --默认值为 0
```

## 设置

设置后需退出重连方可生效。

```sql
set global connection_control_failed_connections_threshold=xx;
set global connection_control_max_connection_delay=xx;--单位:ms
set global default_password_lifetime=xx;--单位为天
set global password_history=xx;
set global password_reuse_interval=xx;--单位为天
```

## 示例

### connection_control_failed_connections_threshold & connection_control_max_connection_delay

```sql
mysql> SELECT @@global.connection_control_failed_connections_threshold;
+---------------------------------------------------+
| @@connection_control_failed_connections_threshold |
+---------------------------------------------------+
| 3                                                 |
+---------------------------------------------------+
1 row in set (0.00 sec)

mysql> SELECT @@global.connection_control_max_connection_delay;
+-------------------------------------------+
| @@connection_control_max_connection_delay |
+-------------------------------------------+
| 0                                         |
+-------------------------------------------+
1 row in set (0.00 sec)

set global connection_control_failed_connections_threshold=2;
set global connection_control_max_connection_delay=10000;

--exit，退出后重新连接
mysql> SELECT @@global.connection_control_failed_connections_threshold;
+---------------------------------------------------+
| @@connection_control_failed_connections_threshold |
+---------------------------------------------------+
| 2                                                 |
+---------------------------------------------------+
1 row in set (0.00 sec)

mysql> SELECT @@global.connection_control_max_connection_delay;
+-------------------------------------------+
| @@connection_control_max_connection_delay |
+-------------------------------------------+
| 10000                                     |
+-------------------------------------------+
1 row in set (0.00 sec)

--创建普通用户并赋权
create user user1 identified by '111';
create role role1;
grant create database on account * to role1;
grant alter user on account * to role1;
grant role1 to user1;
```

用错误密码尝试登录 user1 用户

```bash
#第一次：用错误密码登录
(base) admin@admindeMacBook-Pro matrixorigin.io.cn % mysql -u user1 -h 127.0.0.1 -P 6001 -p123
mysql: [Warning] Using a password on the command line interface can be insecure.
ERROR 1045 (28000): Access denied for user user1. internal error: check password failed

#第二次：用错误密码登录
(base) admin@admindeMacBook-Pro matrixorigin.io.cn % mysql -u user1 -h 127.0.0.1 -P 6001 -p123
mysql: [Warning] Using a password on the command line interface can be insecure.
ERROR 1045 (28000): Access denied for user user1. internal error: check password failed

#第三次：用正确密码登录
(base) admin@admindeMacBook-Pro matrixorigin.io.cn % mysql -u user1 -h 127.0.0.1 -P 6001 -p111
mysql: [Warning] Using a password on the command line interface can be insecure.
ERROR 20101 (HY000): internal error: user is locked, please try again later

#等待十秒左右，再次登录，登录成功
(base) admin@admindeMacBook-Pro matrixorigin.io.cn % mysql -u user1 -h 127.0.0.1 -P 6001 -p111
mysql: [Warning] Using a password on the command line interface can be insecure.
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 2662
Server version: 8.0.30-MatrixOne-v MatrixOne

Copyright (c) 2000, 2018, Oracle and/or its affiliates. All rights reserved.

Oracle is a registered trademark of Oracle Corporation and/or its
affiliates. Other names may be trademarks of their respective
owners.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

mysql> 

```

### default_password_lifetime

```sql
mysql> SELECT @@global.default_password_lifetime;
+-----------------------------+
| @@default_password_lifetime |
+-----------------------------+
| 0                           |
+-----------------------------+
1 row in set (0.00 sec)

set global default_password_lifetime=1;

mysql> SELECT @@global.default_password_lifetime; --重连后生效
+-----------------------------+
| @@default_password_lifetime |
+-----------------------------+
| 1                           |
+-----------------------------+
1 row in set (0.00 sec)
```

停止 mo，并修改系统时间为 1 个月后

```bash
# 停止mo
>mo_ctl stop

# 修改系统时间为1个月后
> sudo date "122518302024"
Wed Dec 25 18:30:00 CST 2024

#查看修改后时间
> date
Wed Dec 25 18:30:02 CST 2024

#启动mo
>mo_ctl start

#root用户连接mo，确认当前时间
>mo_ctl connect

mysql> select current_timestamp;
+----------------------------+
| current_timestamp()        |
+----------------------------+
| 2024-12-25 18:32:30.664877 |
+----------------------------+
1 row in set (0.00 sec)

#尝试以普通用户登录，预期可以登陆，但无法执行除alter user xxx identified by 'xxxx';以外的sql语句；而dump用户则不受此限制。
>mysql -u sys:user1:role1 -h 127.0.0.1 -P 6001 -p123

mysql> create database db1;
ERROR 20101 (HY000): internal error: password has expired, please change the password
mysql> alter user user1 identified by '123';
Query OK, 0 rows affected (0.01 sec)

#以修改后的密码登录
>mysql -u sys:user1:role1 -h 127.0.0.1 -P 6001 -p123

mysql> create database db1;
Query OK, 1 row affected (0.03 sec)
```

### password_history

```sql
mysql> SELECT @@global.password_history;
+--------------------+
| @@password_history |
+--------------------+
| 0                  |
+--------------------+
1 row in set (0.00 sec)

set global password_history=2;

mysql> SELECT @@global.password_history;
+--------------------+
| @@password_history |
+--------------------+
| 2                  |
+--------------------+
1 row in set (0.01 sec)

mysql> create user user2 identified by '111';
Query OK, 0 rows affected (0.03 sec)
--修改密码为'123'，成功
mysql> alter user user2 identified by '123';
Query OK, 0 rows affected (0.02 sec)

--修改密码为 111，失败，因为 password_history=2，MatrixOne 会保留最近 2 个密码的历史记录
mysql> alter user user2 identified by '111';
ERROR 20301 (HY000): invalid input: The password has been used before, please change another one.

--修改密码为'123'，成功
mysql> alter user user2 identified by '234';
Query OK, 0 rows affected (0.02 sec)

--再次修改密码为'111'，成功
mysql> alter user user2 identified by '111';
Query OK, 0 rows affected (0.01 sec)
```

### password_reuse_interval

```sql
mysql> select @@global.password_reuse_interval;
+---------------------------+
| @@password_reuse_interval |
+---------------------------+
| 0                         |
+---------------------------+
1 row in set (0.00 sec)

mysql> set global password_reuse_interval=30;
Query OK, 0 rows affected (0.00 sec)

mysql> select @@global.password_reuse_interval; --重连后生效
+---------------------------+
| @@password_reuse_interval |
+---------------------------+
| 30                        |
+---------------------------+
1 row in set (0.02 sec)

--创建用户 user3
create user user3 identified by '111';

--修改用户密码，成功
mysql> alter user user3 identified by '123';
Query OK, 0 rows affected (0.02 sec)

--更改系统时间为十天后在重启 mo，修改 user3 密码为‘111’，失败
mysql> alter user user3 identified by '111';
ERROR 20301 (HY000): invalid input: The password has been used before, please change another one

--更改系统时间为两个月后在重启 mo，修改 user3 密码为‘111’，成功
mysql>  alter user user3 identified by '111';
Query OK, 0 rows affected (0.01 sec)
```
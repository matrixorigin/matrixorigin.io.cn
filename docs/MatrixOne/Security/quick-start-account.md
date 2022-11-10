# 快速开始：创建租户、用户和角色

本篇文档将介绍使用 `root` 账号如何快速创建租户、用户以及角色。

## 开始前准备

- 已安装部署 MatrixOne 集群。
- 已连接 MatrixOne 集群。
- 需要使用 `root` 账号登录 MatrixOne 集群。

   + Root 账号名：root
   + 密码：111

## 创建租户（Account)

使用 `root` 账号登录 MatrixOne 集群，`root` 账号默认拥有 `MOADMIN` 角色，且具有创建租户（Account）的权限，你可以使用 `root` 账号做一下操作：

1. 创建命名为 `a1` 的租户（Account）。
2. 指定 `a1` 为管理员 `admin`。
3. 设置密码为：`test123`。

代码示例如下：

```sql
> mysql -h 127.0.0.1 -P 6001 -u root -p
> create account a1 ADMIN_NAME 'admin' IDENTIFIED BY 'test123';
```

### 使用 `a1` 访问 MatrixOne

在 MatrixOne 中，租户（Account)之间的访问控制体系和数据都是完全隔离的，所以在访问不同的租户（Account)时，需要分别做登录鉴权。

你可以使用刚才创建的管理员用户 `a1` 登录 MatrixOne，代码示例如下：

```
> mysql -h 127.0.0.1 -P 6001 -u a1:admin -p
```

### 查看角色表、用户表和授权表

通过 `mo_role` 表可以查看到在 `a1` 中默认初始化了两个系统角色 `accountadmin` 和 `public`，并且它们的创建者是 `1`，Owner 是 `0`，对应的登录账户是 `root`，角色是 `MOADMIN`。

代码示例如下：

```sql
> select * from mo_catalog.mo_role;
+---------+--------------+---------+-------+---------------------+----------+
| role_id | role_name    | creator | owner | created_time        | comments |
+---------+--------------+---------+-------+---------------------+----------+
|       2 | accountadmin |       1 |     0 | 2022-11-08 06:30:42 |          |
|       1 | public       |       1 |     0 | 2022-11-08 06:30:42 |          |
+---------+--------------+---------+-------+---------------------+----------+

通过查看 `mo_user` 表和 `mo_user_grant` 表可以知道，`admin` 用户拥有 `accountadmin` 和 `public` 两种角色，且默认使用角色是 `accountadmin`。代码示例如下：

```sql
> select * from mo_catalog.mo_user;
+---------+-----------+-----------+-----------------------+--------+---------------------+--------------+------------+---------+-------+--------------+
| user_id | user_host | user_name | authentication_string | status | created_time        | expired_time | login_type | creator | owner | default_role |
+---------+-----------+-----------+-----------------------+--------+---------------------+--------------+------------+---------+-------+--------------+
|       2 | localhost | admin     | test123               | unlock | 2022-11-08 06:30:42 | NULL         | PASSWORD   |       1 |     0 |            2 |
+---------+-----------+-----------+-----------------------+--------+---------------------+--------------+------------+---------+-------+--------------+
> select * from mo_catalog.mo_user_grant;
+---------+---------+---------------------+-------------------+
| role_id | user_id | granted_time        | with_grant_option |
+---------+---------+---------------------+-------------------+
|       2 |       2 | 2022-11-08 06:30:42 | true              |
|       1 |       2 | 2022-11-08 06:30:42 | true              |
+---------+---------+---------------------+-------------------+
```

通过查看 `mo_role_privs` 表可以查看 `accountadmin` 角色所拥有的权限。代码示例如下：

```sql
> select * from mo_catalog.mo_role_privs;
+---------+--------------+----------+--------+--------------+--------------------+-----------------+-------------------+---------------------+-------------------+
| role_id | role_name    | obj_type | obj_id | privilege_id | privilege_name     | privilege_level | operation_user_id | granted_time        | with_grant_option |
+---------+--------------+----------+--------+--------------+--------------------+-----------------+-------------------+---------------------+-------------------+
|       2 | accountadmin | account  |      0 |            3 | create user        | *               |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | account  |      0 |            4 | drop user          | *               |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | account  |      0 |            5 | alter user         | *               |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | account  |      0 |            6 | create role        | *               |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | account  |      0 |            7 | drop role          | *               |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | account  |      0 |            9 | create database    | *               |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | account  |      0 |           10 | drop database      | *               |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | account  |      0 |           11 | show databases     | *               |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | account  |      0 |           12 | connect            | *               |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | account  |      0 |           13 | manage grants      | *               |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | account  |      0 |           14 | account all        | *               |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | database |      0 |           18 | show tables        | *               |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | database |      0 |           20 | create table       | *               |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | database |      0 |           23 | drop table         | *               |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | database |      0 |           26 | alter table        | *               |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | database |      0 |           21 | create view        | *               |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | database |      0 |           24 | drop view          | *               |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | database |      0 |           27 | alter view         | *               |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | database |      0 |           28 | database all       | *               |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | database |      0 |           29 | database ownership | *               |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | table    |      0 |           30 | select             | *.*             |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | table    |      0 |           31 | insert             | *.*             |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | table    |      0 |           32 | update             | *.*             |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | table    |      0 |           33 | truncate           | *.*             |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | table    |      0 |           34 | delete             | *.*             |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | table    |      0 |           35 | reference          | *.*             |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | table    |      0 |           36 | index              | *.*             |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | table    |      0 |           37 | table all          | *.*             |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | table    |      0 |           38 | table ownership    | *.*             |                 1 | 2022-11-08 06:30:42 | true              |
|       2 | accountadmin | table    |      0 |           41 | values             | t               |                 1 | 2022-11-08 06:30:42 | true              |
|       1 | public       | account  |      0 |           12 | connect            | *               |                 1 | 2022-11-08 06:30:42 | true              |
+---------+--------------+----------+--------+--------------+--------------------+-----------------+-------------------+---------------------+-------------------+
```

## 自定义用户和角色

使用自定义的用户和角色可以更灵活的管理用户数据。以下内容将讲述如何自定义创建用户和角色。

1. 创建命名为 `db1` 的数据库及命名为 `t1` 的表。代码示例如下：

    ```sql
    > create database db1;
    > create table db1.t1(c1 int,c2 varchar);
    ```

2. 查看表 `t1` 的 `owner`，下述代码示例中可以看到 `owner` 是 `accountadmin`：

    代码示例如下：

    ```sql
    > select * from mo_catalog.mo_tables where relname='t1';
    +--------+---------+-------------+----------------+----------------+---------+-------------+-----------------------------------------+---------------------+---------+-------+------------+--------------------------+------------------+
    | rel_id | relname | reldatabase | reldatabase_id | relpersistence | relkind | rel_comment | rel_createsql                           | created_time        | creator | owner | account_id | partitioned              | viewdef          |
    +--------+---------+-------------+----------------+----------------+---------+-------------+-----------------------------------------+---------------------+---------+-------+------------+--------------------------+------------------+
    |   1085 | t1      | db1         |           1009 | p              | r       |             | create table db1.t1 (c1 int,c2 varchar) | 2022-11-08 19:02:06 |       2 |     2 |          1 | 0x                       | 0x               |
    +--------+---------+-------------+----------------+----------------+---------+-------------+-----------------------------------------+---------------------+---------+-------+------------+--------------------------+------------------+
    > select * from mo_role;
    +---------+--------------+---------+-------+---------------------+----------+
    | role_id | role_name    | creator | owner | created_time        | comments |
    +---------+--------------+---------+-------+---------------------+----------+
    |       2 | accountadmin |       1 |     0 | 2022-11-08 06:30:42 |          |
    |       1 | public       |       1 |     0 | 2022-11-08 06:30:42 |          |
    +---------+--------------+---------+-------+---------------------+----------+
    ```

3. 创建新用户 `u1`、`u2`，新角色 `r1`、`r2`。代码示例如下：

    ```sql
    > create user u1 identified by 'user123';
    > create user u2 identified by 'user123';
    > create role r1;
    > create role r2;
    ```

4. 将 `db1.t1` 的 `select` 权限授予给角色 `r1`，`insert` 权限授予给角色 `r2`。代码示例如下：

    ```sql
    > grant select on table db1.t1 to r1;
    > grant insert on table db1.t1 to r2;
    ```

5. 查看表 `mo_role_privs` 检查是否授权成功。代码示例如下：

    ```sql
    > select * from mo_role_privs where role_name='r1' or role_name='r2';
    +---------+-----------+----------+--------+--------------+----------------+-----------------+-------------------+---------------------+-------------------+
    | role_id | role_name | obj_type | obj_id | privilege_id | privilege_name | privilege_level | operation_user_id | granted_time        | with_grant_option |
    +---------+-----------+----------+--------+--------------+----------------+-----------------+-------------------+---------------------+-------------------+
    |       4 | r2        | table    |   1085 |           31 | insert         | d.t             |                 2 | 2022-11-08 11:30:20 | false             |
    |       3 | r1        | table    |   1085 |           30 | select         | d.t             |                 2 | 2022-11-08 11:26:20 | false             |
    +---------+-----------+----------+--------+--------------+----------------+-----------------+-------------------+---------------------+-------------------+
    ```

6. 将角色 `r1` 赋予 `u1`，将角色 `r2` 赋予 `u2`。代码示例如下：

    ```sql
    > grant r1 to u1;
    > grant r2 to u2;
    ```

7. 查看表 `mo_user_grant` 检查是否授权成功。代码示例如下：

    ```sql
    > select * from mo_user_grant where user_id = 3 or user_id = 4;
    +---------+---------+---------------------+-------------------+
    | role_id | user_id | granted_time        | with_grant_option |
    +---------+---------+---------------------+-------------------+
    |       1 |       3 | 2022-11-08 10:22:07 | true              |
    |       1 |       4 | 2022-11-08 11:08:11 | true              |
    |       3 |       3 | 2022-11-08 11:13:55 | false             |
    |       4 |       4 | 2022-11-08 11:14:01 | false             |
    +---------+---------+---------------------+-------------------+
    ```

8. 可以看到用户 `u1` 被授予了 `r1` 角色，且 `r1` 被授予了 `db1.t1` 的 `select` 权限，所以 `u1` 具备 `db1.t1` 的 `select` 权限，即表示用户 `u1` 可以查看 `db1.t1` 的数据；同理用户 `u2` 拥有 `insert` 操作权限，即表示用户 `u2` 可以向 `db1.t1` 中插入数据。

![](https://github.com/matrixorigin/artwork/blob/main/docs/security/custom-user.png?raw=true)

9. 分别使用 `u1` 和 `u2` 登录至租户 `a1` 下的数据库，检查权限是否生效。代码示例如下：

    ```sql
    > mysql -h 127.0.0.1 -P 6001 -u a1:u2:r2 -p
    > insert into db1.t1 values (1,'shanghai'),(2,'beijing');
    Query OK, 2 rows affected (0.05 sec)
    > select * from db1.t1;
    ERROR 20101 (HY000): internal error: do not have privilege to execute the statement

    > mysql -h 127.0.0.1 -P 6001 -u a1:u1:r1 -p
    > select * from db1.t1;
    +------+----------+
    | c1   | c2       |
    +------+----------+
    |    1 | shanghai |
    |    2 | beijing  |
    +------+----------+
    > insert into db1.t1 values (3,'guangzhou');
    ERROR 20101 (HY000): internal error: do not have privilege to execute the statement
    ```

# 创建新租户，并由新租户创建用户、创建角色和授权

初始化接入 MatrixOne 集群，系统会自动生成一个默认账号，即集群管理员。集群管理员默认用户名为 *root*，*root* 既是集群管理员，同时也是系统租户管理员，*root* 可以创建和管理其他普通租户（非系统租户管理员）。

本篇文档将指导你创建一个新的租户，并切换至新租户登录，用新租户账号创建用户、创建角色、创建权限，并赋予用户权限。

## 前提条件

- 已完成 MatrixOne 集群的部署与连接。
- 已获取集群管理员用户名和密码（默认初始用户名为 root，密码为 111）。

## 操作步骤

### 步骤一：创建新租户

1. 使用集群管理员的用户名（默认 root）和密码登录 MatrixOne：

    ```
    mysql -h 127.0.0.1 -P 6001 -u root -p
    ```

2. 创建一个新的租户 *a1*，用户名和密码分别为：admin，test123：

    ```
    create account a1 ADMIN_NAME 'admin' IDENTIFIED BY 'test123';
    ```

    查看集群中的所有租户信息（仅 root 可查看）：

    ```
    mysql> select * from mo_catalog.mo_account;
    +------------+--------------+--------+---------------------+----------------+----------------+
    | account_id | account_name | status | created_time        | comments       | suspended_time |
    +------------+--------------+--------+---------------------+----------------+----------------+
    |          1 | a1           | open   | 2022-12-19 14:47:19 |                | NULL           |
    |          0 | sys          | open   | 2022-12-07 11:00:58 | system account | NULL           |
    +------------+--------------+--------+---------------------+----------------+----------------+
    ```

### 步骤二：登录新租户账号，创建用户、创建角色和授权

1. 你可以重新打开一个新的会话，使用 admin 登录租户 *a1*：

    ```
    mysql -h 127.0.0.1 -P 6001 -u a1:admin -p
    ```

2. 现在你可以作为租户 *a1* 查看租户下的默认用户和角色：

    ```
    mysql> select * from mo_catalog.mo_role;
    +---------+--------------+---------+-------+---------------------+----------+
    | role_id | role_name    | creator | owner | created_time        | comments |
    +---------+--------------+---------+-------+---------------------+----------+
    |       2 | accountadmin |       0 |     0 | 2022-12-19 14:47:20 |          |
    |       1 | public       |       0 |     0 | 2022-12-19 14:47:20 |          |
    +---------+--------------+---------+-------+---------------------+----------+
    2 rows in set (0.01 sec)

    mysql> select * from mo_catalog.mo_user;
    +---------+-----------+-----------+-----------------------+--------+---------------------+--------------+------------+---------+-------+--------------+
    | user_id | user_host | user_name | authentication_string | status | created_time        | expired_time | login_type | creator | owner | default_role |
    +---------+-----------+-----------+-----------------------+--------+---------------------+--------------+------------+---------+-------+--------------+
    |       2 | localhost | admin     | test123               | unlock | 2022-12-19 14:47:20 | NULL         | PASSWORD   |       0 |     0 |            2 |
    +---------+-----------+-----------+-----------------------+--------+---------------------+--------------+------------+---------+-------+--------------+
    1 row in set (0.00 sec)
    ```

    租户 a1 被创建成功后便默认拥有了租户管理员权限，所以可以查看租户 a1 下的系统表信息。在 *mo_user* 表中可以观察到当前有一个用户名为 *admin* 的用户账号，即创建租户时指定的；此外，还有 *accountadmin* 和 *public* 两个默认角色：

    - *accountadmin* 拥有租户的最高权限，且默认授予用户名为 *admin* 的账号；
    - 系统会为每一个新的普通用户默认授权 *public* 角色，*public* 角色初始化的权限是 `connect`，即连接 MatrixOne。

    此外，你还可以在系统表中查看到这些默认角色的权限集合：

    ```
    mysql> select * from mo_catalog.mo_role_privs;
    +---------+--------------+----------+--------+--------------+--------------------+-----------------+-------------------+---------------------+-------------------+
    | role_id | role_name    | obj_type | obj_id | privilege_id | privilege_name     | privilege_level | operation_user_id | granted_time        | with_grant_option |
    +---------+--------------+----------+--------+--------------+--------------------+-----------------+-------------------+---------------------+-------------------+
    |       2 | accountadmin | account  |      0 |            3 | create user        | *               |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | account  |      0 |            4 | drop user          | *               |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | account  |      0 |            5 | alter user         | *               |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | account  |      0 |            6 | create role        | *               |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | account  |      0 |            7 | drop role          | *               |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | account  |      0 |            9 | create database    | *               |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | account  |      0 |           10 | drop database      | *               |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | account  |      0 |           11 | show databases     | *               |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | account  |      0 |           12 | connect            | *               |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | account  |      0 |           13 | manage grants      | *               |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | account  |      0 |           14 | account all        | *               |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | database |      0 |           18 | show tables        | *               |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | database |      0 |           20 | create table       | *               |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | database |      0 |           23 | drop table         | *               |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | database |      0 |           26 | alter table        | *               |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | database |      0 |           21 | create view        | *               |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | database |      0 |           24 | drop view          | *               |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | database |      0 |           27 | alter view         | *               |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | database |      0 |           28 | database all       | *               |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | database |      0 |           29 | database ownership | *               |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | table    |      0 |           30 | select             | *.*             |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | table    |      0 |           31 | insert             | *.*             |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | table    |      0 |           32 | update             | *.*             |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | table    |      0 |           33 | truncate           | *.*             |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | table    |      0 |           34 | delete             | *.*             |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | table    |      0 |           35 | reference          | *.*             |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | table    |      0 |           36 | index              | *.*             |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | table    |      0 |           37 | table all          | *.*             |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | table    |      0 |           38 | table ownership    | *.*             |                 0 | 2022-12-19 14:47:20 | true              |
    |       2 | accountadmin | table    |      0 |           41 | values             | t               |                 0 | 2022-12-19 14:47:20 | true              |
    |       1 | public       | account  |      0 |           12 | connect            | *               |                 0 | 2022-12-19 14:47:20 | true              |
    +---------+--------------+----------+--------+--------------+--------------------+-----------------+-------------------+---------------------+-------------------+
    ```

3. 在租户 a1 中，创建新的用户和角色：

    - 用户 u1 的用户名和密码分别为：u1，user123
    - 用户 *u2* 的用户名和密码分别为：u2，user456
    - 角色 r1 的命名为：r1
    - 角色 r2 的命名为：r2

    ```
    create user u1 identified by 'user123';
    create user u2 identified by 'user456';
    create role r1;
    create role r2;
    ```

4. 创建数据库 *db1*，并在 *db1* 中创建表 *t1*：

    ```
    create database db1;
    create table db1.t1(c1 int,c2 varchar);
    ```

5. 将 *db1.t1* 的 `select` 权限授予给 *r1*，`insert` 权限授予给 *r2*：

    ```
    grant select on table db1.t1 to r1;
    grant insert on table db1.t1 to r2;
    ```

6. 将角色 *r1* 授予给用户 *u1*；将角色 *r2* 授予给用户 *u2*：

    ```
    grant r1 to u1;
    grant r2 to u2;
    ```

    此时，新建的用户、角色、对象权限关系如下图所示：

    ![](https://community-shared-data-1308875761.cos.ap-beijing.myqcloud.com/artwork/docs/security/role-user.png)

### 步骤三：验证授权生效

分别使用用户 *u1* 和 *u2* 登录租户 *a1*，验证权限是否生效。

由于 *u2* 被授予了 *r2* 角色，且 *r2* 被授予了 *db1.t1* 的 `insert` 权限，所以 *u2* 具备 *db1.t1* 的 `insert` 权限，即可以向 *db1.t1* 插入数据，

使用 *u1* 登录 *a1* 进行验证：

```
mysql -h 127.0.0.1 -P 6001 -u a1:u2:r2 -p

mysql> insert into db1.t1 values (1,'shanghai'),(2,'beijing');
Query OK, 2 rows affected (0.04 sec)

mysql> select * from db1.t1;
ERROR 20101 (HY000): internal error: do not have privilege to execute the statement
```

*u2* 可以成功向表 *db1.t1* 插入数据，但无法查看 *db1.t1* 表里的数据。

同样的，你可以使用 *u1* 登录 *a1* 进行权限验证：

```
mysql -h 127.0.0.1 -P 6001 -u a1:u1:r1 -p

mysql> select * from db1.t1;
+------+----------+
| c1   | c2       |
+------+----------+
|    1 | shanghai |
|    2 | beijing  |
+------+----------+
2 rows in set (0.01 sec)

mysql> insert into db1.t1 values (3,'guangzhou');
ERROR 20101 (HY000): internal error: do not have privilege to execute the statement
```

如上述代码所示，*u1* 可以成功的查询表 *db1.t1* 的数据，但不能向其插入数据。

!!! note
    上述操作步骤中，更多有关查看的系统表信息，参见 [MatrixOne 系统数据库和表](../../Reference/System-tables.md)

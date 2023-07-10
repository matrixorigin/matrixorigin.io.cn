# 创建租户，验证资源隔离

初始化接入 MatrixOne 集群，系统会自动生成一个默认账号，即集群管理员。集群管理员被自动默认赋予管理租户账号的权限，但不能管理租户下的资源。

本篇文档将指导你使用集群管理员的账号创建两个新的租户，并赋予租户管理员的权限，并检查是否实现了租户之间的资源隔离。

## 前提条件

- 已完成 MatrixOne 集群的部署与连接。
- 已获取集群管理员用户名和密码（用户名一般为 root，密码请联系 MatrixOne 的产品经理或者销售代表获取）。

## 操作步骤

1. 使用集群管理员的用户名（默认 root）和密码登录 MatrixOne：

    ```
    mysql -h 127.0.0.1 -P 6001 -u root -p
    ```

2. 创建新的租户：

    - 租户 *a1* 的登录用户名和密码分别为：admin1，test123
    - 租户 *a2* 的登录用户名和密码分别为：admin2，test456

    ```
    create account a1 ADMIN_NAME 'admin1' IDENTIFIED BY 'test123';
    create account a2 ADMIN_NAME 'admin2' IDENTIFIED BY 'test456';
    ```

3. 使用 admin1 登录租户 *a1*，并创建数据表 *db1.t1*：

    ```
    mysql -h 127.0.0.1 -P 6001 -u a1:admin1 -p
    create database db1;
    create table db1.t1(c1 int,c2 varchar);
    insert into db1.t1 values (1,'shanghai'),(2,'beijing');
    ```

    验证租户 *a1* 是否成功创建表：

    ```
    mysql> select * from db1.t1;
    +------+----------+
    | c1   | c2       |
    +------+----------+
    |    1 | shanghai |
    |    2 | beijing  |
    +------+----------+
    2 rows in set (0.01 sec)
    ```

4. 使用 admin2 登录租户 *a2*：

    ```
    mysql -h 127.0.0.1 -P 6001 -u a2:admin2 -p
    ```

    查看租户 *a1* 中的 *db1.t1* 数据：

    ```
    mysql> select * from db1.t1;
    ERROR 1064 (HY000): SQL parser error: table "t1" does not exist
    ```

    上述命令运行报错，证明在租户 *a2* 中，并不能看到租户 *a1* 中的数据库 *db1*：

5. 在租户 *a2* 中也可以创建库 *db1* 和表 *db1.t1*：

    ```
    mysql> create database db1;
    Query OK, 0 rows affected (0.03 sec)

    mysql> create table db1.t1(c1 int,c2 varchar);
    Query OK, 0 rows affected (0.05 sec)

    mysql> insert into db1.t1 values (3,'guangzhou');
    Query OK, 1 row affected (0.05 sec)
    ```

    在租户 *a2* 的 *db1.t1* 这张表内插入与租户 *a1* 中表 *db1.t1* 不同的数据并查看：

    ```
    mysql> insert into db1.t1 values (3,'guangzhou');
    Query OK, 1 row affected (0.05 sec)

    mysql> select * from db1.t1;
    +------+-----------+
    | c1   | c2        |
    +------+-----------+
    |    3 | guangzhou |
    +------+-----------+
    1 row in set (0.01 sec)
    ```

    可以看到，即使与租户 *a1* 中的数据库与表重名，但是这两个数据库与表互不干扰，完全隔离。

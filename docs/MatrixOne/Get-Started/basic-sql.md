# MatrixOne 的 SQL 基本操作

MatrixOne 兼容 MySQL，你可以使用 MySQL 客户端或其他方式连接 MatrixOne。参加 [MySQL 兼容性](../Overview/feature/mysql-compatibility.md)和[客户端连接 MatrixOne 服务](../Develop/connect-mo/database-client-tools.md)。

## 什么是 SQL 语言？

SQL (Structured Query Language: 结构化查询语言) 是用于管理关系数据库管理系统（RDBMS）。SQL 的范围包括数据插入、查询、更新和删除，数据库模式创建和修改，以及数据访问控制。

## MatrixOne 的 SQL 都分为哪几类？

SQL 语言通常按照功能划分成以下的 6 个部分：

- DDL (Data Definition Language)：数据定义语言，用来定义数据库对象，包括库、表、视图等。例如，`CREATE`，`ALTER`，和 `DROP` 等。

- DML (Data Manipulation Language)：数据修改语言，用来修改和业务相关的记录。例如，`SELECT`，`DELETE`，或 `INSERT` 等。

- DQL (Data Query Language)：数据查询语言，用来查询经过条件筛选的记录。例如，`SELECT...FROM...[WHERE]` 这种多个子句组合而成的 SQL 语句。

- TCL（Transaction Control Language）：事务控制语言，用于事务管控。例如，`COMMIT`，`ROLLBACK`，或 `SET TRANSACTION` 等。

- DCL (Data Control Language)：数据控制语言，用来分配与回收资源，创建和阐述用户与角色，授权和回收权限。例如，`CREATET ACCOUNT`，`DROP ACCOUNT`，或 `GRANT` 等。

- 其他：其他类型的管理语言在 MatrixOne 中，与数据没有直接关联，对数据库参数、资源分配的获取与修改的总称。例如，`SHOW`，`SET variable`，或 `KILL` 等。

## 查看、创建和删除数据库

MatrixOne 中的数据库是表的集合。

- 查看数据库列表，使用 `SHOW DATABASES` 语句：

```sql
SHOW DATABASES;
```

- 新建一个名称为 *dbdemo* 的数据库，使用 `CREATE DATABASE db_name [options];` 语句，例如：

```sql
CREATE DATABASE dbdemo;
```

或：

```sql
CREATE DATABASE IF NOT EXISTS dbdemo;
```

添加 `IF NOT EXISTS` 条件可以防止错误。

- 使用命名为 *dbdemo* 的数据库，使用如下语句：

```sql
USE dbdemo;
```

- 使用 `SHOW TABLES` 语句查看数据库中所有的表，例如：

```sql
SHOW TABLES FROM dbdemo;
```

- 除数据库，使用 `DROP DATABASE` 语句：

```sql
DROP DATABASE dbdemo;
```

## 创建、查看和删除表

- 创建表，使用 `CREATE TABLE` 语句：

```sql
CREATE TABLE table_name column_name data_type constraint;
```

例如，要创建一个名为 *person* 的表，包括编号、名字、生日等字段，可使用以下语句：

```sql
CREATE TABLE person (
    id INT(11),
    name VARCHAR(255),
    birthday DATE
    );
```

- 查看新建的表，使用 `SHOW CREATE` 语句：

```sql
SHOW CREATE table person;
```

结果如下所示：

```sql
+--------+-----------------------------------------------------------------------------------------------------------------+
| Table  | Create Table                                                                                                    |
+--------+-----------------------------------------------------------------------------------------------------------------+
| person | CREATE TABLE `person` (
`id` INT DEFAULT NULL,
`name` VARCHAR(255) DEFAULT NULL,
`birthday` DATE DEFAULT NULL
) |
+--------+-----------------------------------------------------------------------------------------------------------------+
1 row in set (0.01 sec)
```

- 删除表，使用 `DROP TABLE` 语句：

```sql
DROP TABLE person;
```

## 增加、删除、修改表记录

通用的 DML 即增删改表记录，基本的语句为 `INSERT`，`UPDATE` 和 `DELETE`。

- 向表中插入数据，使用 `INSERT` 语句：

```sql
INSERT INTO person VALUES(1,'tom','20170912');
```

- 向表内插入包含部分字段数据的表记录，使用 `INSERT` 语句，例如：

```sql
INSERT INTO person(id,name) VALUES('2','bob');
```

- 向表内修改表记录的部分字段数据，使用 `UPDATE` 语句，例如：

```sql
UPDATE person SET birthday='20180808' WHERE id=2;
```

- 向表内删除部分表记录，使用 `DELETE` 语句，例如：

```sql
DELETE FROM person WHERE id=2;
```

!!!note
   `UPDATE` 和 `DELETE` 操作如果不带 `WHERE` 过滤条件则是对全表进行操作。

## 查询数据

DQL 用于从一个表或多个表检索所需的数据行。

- 查看表内数据，使用 `SELECT` 语句：

```sql
SELECT * FROM person;
```

结果如下所示：

```sql
+------+------+------------+
| id   | name | birthday   |
+------+------+------------+
|    1 | tom  | 2017-09-12 |
+------+------+------------+
1 row in set (0.00 sec)
```

- 查询某一列，使用 `SELECT` 语句加上要查询的列名：

```sql
SELECT name FROM person;
+------+
| name |
+------+
| tom  |
+------+
1 rows in set (0.00 sec)
```

使用 `WHERE` 子句，对所有记录进行是否符合条件的筛选后再返回。例如：

```sql
SELECT * FROM person where id<5;
```

结果如下所示：

```sql
+------+------+------------+
| id   | name | birthday   |
+------+------+------------+
|    1 | tom  | 2017-09-12 |
+------+------+------------+
1 row in set (0.00 sec)
```

## 创建、授权和删除用户

如果你[安装部署单机版的 MatrixOne](../Get-Started/install-standalone-matrixone.md)，连接登录 MatrixOne 时，你本身便具有最高权限，你可以参考下面的内容创建用户并授权，以便体验 MatrixOne 集群的权限管理功能。

- 使用 `CREATE USER` 语句创建一个用户 *mouser*，密码为 *111*：

```sql
> CREATE USER mouser IDENTIFIED BY '111';
Query OK, 0 rows affected (0.10 sec)
```

- 创建角色 *role_r1* 测试是否能够创建成功：

```sql
> CREATE ROLE role_r1;
Query OK, 0 rows affected (0.05 sec)
```

- 将角色 *role_r1* 赋予用户 *mouser*：

```sql
> GRANT role_r1 to mouser;
Query OK, 0 rows affected (0.04 sec)
```

- 授权角色 *role_r1* 可以在 *dbdemo* 数据库里建表的权限：

```sql
> GRANT create table on database * to role_r1;
Query OK, 0 rows affected (0.03 sec)
```

- 查询用户 mouser 的权限：

```sql
> SHOW GRANTS for mouser@localhost;
+-------------------------------------------------------+
| Grants for mouser@localhost                           |
+-------------------------------------------------------+
| GRANT create table ON database * `mouser`@`localhost` |
| GRANT connect ON account  `mouser`@`localhost`        |
+-------------------------------------------------------+
2 rows in set (0.02 sec)
```

你可以看到你已经成功把在 *dbdemo* 数据库里建表的权限授予给了 *mouser*。

- 删除用户 *mouser*：

```sql
DROP USER mouser;
```

权限管理是数据库中体系庞大但是非常有用的功能，如果你想了解更多，参见[权限管理](../Security/about-privilege-management.md)。

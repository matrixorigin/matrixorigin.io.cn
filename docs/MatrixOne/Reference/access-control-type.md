# MatrixOne 权限分类

本篇文章主要介绍 MatrixOne 中的权限分类。

MatrixOne 的访问控制权限分为**系统权限**和**对象权限**，在授予角色权限时可做参考。

## 系统权限

系统权限为集群管理员（默认用户名为 root）的权限，它可以初始化所拥有的权限。集群管理员可以创建、删除其他租户，并管理租户；集群管理员不能管理其他租户下的其他资源。

|权限 | 含义|
|---|---|
|CREATE ACCOUNT|创建租户，仅集群管理员拥有|
|DROP ACCOUNT|删除租户，仅集群管理员拥有|
|ALTER ACCOUNT|管理租户资源，仅集群管理员拥有|

## 对象权限

对象权限可以按照赋权的对象细分为**租户权限**、**用户权限**、**角色权限**、**数据库权限**、**表权限**、**发布订阅权限**。

### 租户权限

拥有*租户权限*的对象可以拥有以下权限：

|权限 | 含义|
|---|---|
|CREATE USER|创建用户|
|DROP USER|删除用户|
|ALTER USER|修改用户|
|CREATE ROLE|创建角色|
|DROP ROLE|删除角色|
|CREATE DATABASE|创建数据库|
|DROP DATABASE|删除数据库|
|SHOW DATABASES|查看当前租户下所有数据库|
|CONNECT|允许使用 ``use [database | role]``，可执行不涉及具体对象的 `SELECT`|
|MANAGE GRANTS|权限管理。包括角色授权、角色继承的权限|
|ALL [PRIVILEGES]|Account 的所有权限|
|OWNERSHIP|Account 的所有权限，可以通过 `WITH GRANT OPTION` 设置权限|

### 用户权限

拥有*用户权限*的对象可以拥有以下权限：

|权限 | 含义|
|---|---|
|Ownership|管理用户所有的权限，包括修改用户信息、密码、删除用户，且可以将这些权限传递给其他角色。|

### 角色权限

拥有*角色权限*的对象可以拥有以下权限：

|权限 | 含义|
|---|---|
|Ownership|管理角色的所有权限，包括修改角色名称、描述、删除角色，且可以将这些权限传递给其他角色。|

### 数据库权限

拥有*数据库权限*的对象可以拥有以下权限：

|权限 | 含义|
|---|---|
|SHOW TABLES|查看当前数据库下所有表|
|CREATE TABLE|建表权限|
|DROP TABLE|删表权限|
|CREATE VIEW|创建视图权限，无对应权限时创建视图无法查询|
|DROP VIEW|删除视图|
|ALTER TABLE|修改表权限|
|ALTER VIEW|修改视图权限，无对应权限时无法修改视图|
|ALL [PRIVILEGES]|数据库的所有权限|
|OWNERSHIP|数据库的所有权限，附加 `WITH GRANT OPTION`|

### 表权限

拥有*表权限*的对象可以拥有以下权限：

|权限 | 含义|
|---|---|
|SELECT|对表执行 `SELECT` 命令|
|INSERT|对表执行 `INSERT` 命令|
|UPDATE|对表执行 `UPDATE` 命令|
|TRUNCATE|对表执行 `TRUNCATE TABLE` 命令|
|DELETE|对表执行 `DELETE` 命令|
|REFERENCE|允许将表引用为外键约束的唯一/主键表。通过 `DESCRIBE` 或 `SHOW` 命令查看表的结构|
|INDEX|创建删除 INDEX|
|ALL|指定表的所有权限|
|OWNERSHIP|指定表的所有权限，附加 `WITH GRANT OPTION`|

### 表执行权限

拥有*表执行权限*的对象可以拥有以下权限：

|权限 | 含义|
|---|---|
|EXECUTE|允许执行函数或存储过程的权限|

### 发布订阅权限

在 MatrixOne 中，发布订阅是对 MatrixOne 中指定数据库发起的数据共享访问。

__Note:__ 当前 MatrixOne 中仅支持 *moadmin* 和 *accountadmin* 角色才可以进行发布订阅操作。

- **发布端**

发布端，即发布共享、同步数据的一方。

|权限 | 含义|
|---|---|
|CREATE PUBLICATION|创建发布|
|ALTER PUBLICATION|修改发布|
|DROP PUBLICATION|删除发布|
|SHOW PUBLICATION|查看发布|
|SHOW CREATE PUBLICATION|查看创建发布语句|

- **订阅端**

订阅端，即获取已共享、同步数据的一方。

|权限 | 含义|
|---|---|
|CREATE DATABASE db_name FROM account_name PUBLICATION|创建订阅|
|SHOW SUBSCRIPTIONS|查看订阅|

# **GRANT**

## **语法说明**

`GRANT` 语句将权限和角色分配给 MatrixOne 用户和角色。

### GRANT 概述

系统权限是初始系统租户管理员（对应的是 *root* 用户）的权限。系统租户管理员可以创建和删除其他*租户（Accounts）*，管理*租户（Accounts）*。系统租户管理员不能管理其他*租户（Accounts）*名下的资源。

要使用 `GRANT` 授予其他用户或角色权限，你首先必须具有 `WITH GRANT OPTION` 权限，并且你必须具有你正在授予的权限。了解你当前角色的授权情况或其他角色的授权情况，请使用 `SHOW GRANTS` 语句，更多信息，参见 [SHOW GRANTS](../Other/SHOW-Statements/show-grants.md)。

`REVOKE` 语句与 `GRANT` 相关，允许租户删除用户权限。有关 `REVOKE` 的更多信息，请参阅 [REVOKE](revoke.md)。

一般情况下，一个集群默认有一个 *root*，*root* 首先使用 `CREATE ACCOUNT` 创建一个新账户，并定义它的非特权权限，例如它的密码，然后租户使用 `CREATE USER` 创建用户并使用 `GRANT` 对其赋权。`ALTER ACCOUNT` 可用于修改现有租户的非特权特征。`REVOKE` 用于修改现有用户的权限特征。如需了解 MatrixOne 支持的权限以及不同层级的权限，请参阅 [MatrixOne 权限分类](../../access-control-type.md)。

`GRANT` 在成功执行后，得到结果 `Query OK, 0 rows affected`。要查看操作产生的权限，请使用 [SHOW GRANTS](../Other/SHOW-Statements/show-grants.md)

## **语法结构**

```
> GRANT
    priv_type [(column_list)]
      [, priv_type [(column_list)]] ...
    ON [object_type] priv_level
    TO user_or_role [, user_or_role] ...

GRANT role [, role] ...
    TO user_or_role [, user_or_role] ...
    [WITH ADMIN OPTION]

object_type: {
    TABLE
  | FUNCTION
  | PROCEDURE
}

priv_level: {
    *
  | *.*
  | db_name.*
  | db_name.tbl_name
  | tbl_name
  | db_name.routine_name
}
```

### 参数释义

`GRANT` 语句允许*租户（Accounts）*授予权限和角色，这些权限和角色可以授予用户和角色。语法使用说明如下：

- `GRANT` 不能在同一语句中同时授予权限和角色。

- `ON` 子句区分语句是否授予权限或角色：

   + 使用 `ON`，该语句授予权限。

   + 如果没有 `ON`，则该语句授予角色。

   + 必须使用单独的 `GRANT` 语句将权限和角色分配给一个用户，每个 `GRANT` 语句的语法都与要授予的内容相适应。

#### 数据库权限

数据库权限适用于给定数据库中的所有对象。要分配数据库级权限，请使用 `ON db_name *` 语法，示例如下：

```
grant all on database * to role1;
```

#### 表权限

表权限适用于给定表中的所有列。要分配表级权限，请使用 `ON db_name.tbl_name` 语法，示例如下：

```
grant all on table *.* to role1;
```

#### 授权角色

不携带 `ON` 子句的 `GRANT` 语法将赋权给角色，而不是赋权给个人。角色是权限的命名集合。示例如下：

```
grant role3 to role_user;
```

要授权给角色或者要授权给用户，必须确保用户和角色都存在。

授予角色需要这些权限：

- 你有权向用户或角色授予或撤销任何角色。

## **示例**

```sql
> drop user if exists user_prepare_01;
> drop role if exists role_prepare_1;
> create user user_prepare_01 identified by '123456';
> create role role_prepare_1;
> create database if not exists p_db;
> grant create table ,drop table on database *.*  to role_prepare_1;
Query OK, 0 rows affected (0.01 sec)

> grant connect on account * to role_prepare_1;
Query OK, 0 rows affected (0.01 sec)

> grant insert,select on table *.* to role_prepare_1;
Query OK, 0 rows affected (0.01 sec)

> grant role_prepare_1 to user_prepare_01;
Query OK, 0 rows affected (0.01 sec)
```

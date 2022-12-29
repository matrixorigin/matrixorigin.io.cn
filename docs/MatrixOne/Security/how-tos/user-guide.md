# 权限管理操作

## 管理租户

- 前提条件：拥有集群管理员（默认账户为 root）才可以进行租户管理。

有关 root 账号对应的角色和权限如下表所示：

| **用户名** | **解释** | **所拥有的角色** | **所拥有的权限** | **描述** |
| --- | --- | --- | --- | --- |
| root | 集群管理员 | MOADMIN | 创建、编辑、删除租户 | 集群创建后自动生成并授予 |
| root | 系统租户管理员 | MOADMIN | 管理系统租户下的所有资源，包含用户、角色、数据库/表/视图，授权管理 |集群创建后自动生成并授予 |

### 创建租户

**SQL 语法**

```
create account <account_name> admin_name='<user_name>' identified by '<password>';
```

**参数解释**

|参数|参数解释|
|---|---|
|<account_name>|新建租户的名称|
|<user_name>|新建租户的管理员用户名，其会被自动授予租户的最高权限角色，即 `ACCOUNTADMIN`|
|<password>|新建的租户管理员密码|

更多信息，参见[CREATE ACCOUNT](../../Reference/SQL-Reference/Database-Administration-Statements/create-account.md)。

### 查看租户

**SQL 语法**

```
select * from mo_catalog.mo_account;
```

### 删除租户

**SQL 语法**

```
drop account if exists <account_name>;
```

**参数解释**

|参数|参数解释|
|---|---|
|<account_name>|需要删除的租户名称|

!!! note
    删除租户后则无法恢复，包括租户账号下的所有数据，请谨慎使用。

更多信息，参见[DROP ACCOUNT](../../Reference/SQL-Reference/Database-Administration-Statements/drop-account.md)。

## 管理用户

### 创建用户

- 前提条件： 拥有 `CREATE USER` 权限。

    · 默认拥有这个权限的角色为 MOADMIN 或 ACCOUNTADMIN：集群管理员（默认账户为 root）和由集群管理员创建的租户管理员默认拥有权限。

- 操作说明：在当前租户中创建一个用户的用户名和密码。

**SQL 语法**

```
create user <user_name> identified by '<password>';
```

**参数解释**

|参数|参数解释|
|---|---|
|<user_name>|新建用户的名称|
|<password>|新建的用户密码|

更多信息，参见[CREATE USER](../../Reference/SQL-Reference/Database-Administration-Statements/create-user.md)。

### 查看用户

- 前提条件： 拥有查看用户的权限。

    · 默认拥有这个权限的角色为 MOADMIN 或 ACCOUNTADMIN：集群管理员（默认账户为 root）和由集群管理员创建的租户管理员默认拥有权限。

- 操作说明：查看当前租户下所有的用户。

**SQL 语法**

```
select * from mo_catalog.mo_user;
```

### 删除用户

- 前提条件： 拥有 `DROP USER` 权限。

    · 默认拥有这个权限的角色为 MOADMIN 或 ACCOUNTADMIN：集群管理员（默认账户为 root）和由集群管理员创建的租户管理员默认拥有权限。

- 操作说明：删除当前租户下的指定的用户。

**SQL 语法**

```
drop user if exist <user_name>;
```

**参数解释**

|参数|参数解释|
|---|---|
|<user_name>|新建用户的名称|

更多信息，参见[DROP USER](../../Reference/SQL-Reference/Database-Administration-Statements/drop-user.md)。

## 管理角色

### 创建角色

- 前提条件： 拥有 `CREATE ROLE` 权限。

    · 默认拥有这个权限的角色为 MOADMIN 或 ACCOUNTADMIN：集群管理员（默认账户为 root）和由集群管理员创建的租户管理员默认拥有权限。

- 操作说明：在当前租户下创建一个自定义角色。

**SQL 语法**

```
create role <role_name>;
```

**参数解释**

|参数|参数解释|
|---|---|
|<role_name>|新建角色的名称|

更多信息，参见[CREATE ROLE](../../Reference/SQL-Reference/Database-Administration-Statements/create-role.md)。

### 查看角色

- 前提条件： 拥有查看角色权限。

    · 默认拥有这个权限的角色为 MOADMIN 或 ACCOUNTADMIN：集群管理员（默认账户为 root）和由集群管理员创建的租户管理员默认拥有权限。

- 操作说明：查看当前租户下所有的角色。

**SQL 语法**

```
select * from mo_catalog.mo_role;
```

### 切换角色

- 前提条件：拥有 `SET ROLE` 权限。

    · 默认拥有这个权限的角色为 MOADMIN 或 ACCOUNTADMIN：集群管理员（默认账户为 root）和由集群管理员创建的租户管理员默认拥有权限。

- 操作说明：在租户中切换用户的主要角色，获取主要角色的权限，以便执行相应的 SQL。

**SQL 语法**

```
set role <role_name>;
```

**参数解释**

|参数|参数解释|
|---|---|
|<role_name>|新建角色的名称|

更多信息，参见[SET ROLE](../../Reference/SQL-Reference/Database-Administration-Statements/set-role.md)。

### 删除角色

- 前提条件： 拥有 `DROP ROLE` 权限。

    · 默认拥有这个权限的角色为 MOADMIN 或 ACCOUNTADMIN：集群管理员（默认账户为 root）和由集群管理员创建的租户管理员默认拥有权限。

- 操作说明：删除当前租户下的特定角色。

**SQL 语法**

```
drop role if exists <role_name>;
```

**参数解释**

|参数|参数解释|
|---|---|
|<role_name>|新建角色的名称|

更多信息，参见[DROP ROLE](../../Reference/SQL-Reference/Database-Administration-Statements/drop-role.md)。

## 管理权限

### 向角色授予某个对象权限

- 前提条件：拥有 `MANAGE GRANTS`  权限。

     · 默认拥有这个权限的角色为 MOADMIN 或 ACCOUNTADMIN：集群管理员（默认账户为 root）和由集群管理员创建的租户管理员默认拥有权限。

- 操作说明：向某个角色授予某个对象的某个权限

**SQL 语法**

```
grant <privilege> on <object_type> <object_name> to <role_name>
```

**参数解释**

|参数|参数解释|
|---|---|
|<privilege>|权限|
|<object_type>|对象类型|
|<object_name>|对象名称|
|<role_name>|被赋予权限的角色|

更多信息，参见[DRANT PRIVILEGES](../../Reference/SQL-Reference/Database-Administration-Statements/grant-privileges.md)。

### 向角色授予某类对象权限

- 前提条件：拥有 `MANAGE GRANTS`  权限。

     · 默认拥有这个权限的角色为 MOADMIN 或 ACCOUNTADMIN：集群管理员（默认账户为 root）和由集群管理员创建的租户管理员默认拥有权限。

- 操作说明：向角色授予所有数据库/数据表的某个权限

**SQL 语法**

```
grant <privilege> on database * to <role_name>;
grant <privilege> on table *.* to <role_name>;
```

**参数解释**

|参数|参数解释|
|---|---|
|<privilege>|权限|
|<role_name>|被赋予权限的角色|

!!! note
    该操作虽然在授权多个相同类别对象时比较简便，但也很容易发生权限泄漏，请谨慎使用。

更多信息，参见[DRANT PRIVILEGES](../../Reference/SQL-Reference/Database-Administration-Statements/grant-privileges.md)。

### 向用户授予角色

- 前提条件：拥有 `MANAGE GRANTS`  权限。

     · 默认拥有这个权限的角色为 MOADMIN 或 ACCOUNTADMIN：集群管理员（默认账户为 root）和由集群管理员创建的租户管理员默认拥有权限。

- 操作说明：向某个用户授予某个角色

**SQL 语法**

```
grant <role_name> to <user_name>;
```

**参数解释**

|参数|参数解释|
|---|---|
|<role_name>|被赋予权限的角色|
|<user_name>|被赋予权限的用户|

更多信息，参见[DRANT ROLE](../../Reference/SQL-Reference/Database-Administration-Statements/grant-role.md)。

### 让一个角色继承另一个角色的权限

- 前提条件：拥有 `MANAGE GRANTS`  权限。

     · 默认拥有这个权限的角色为 MOADMIN 或 ACCOUNTADMIN：集群管理员（默认账户为 root）和由集群管理员创建的租户管理员默认拥有权限。

- 操作说明：让 role_b 继承 role_a 的所有权限

**SQL 语法**

```
grant <role_a> to <role_b>;
```

!!! note
    该权限继承为动态继承，若 role_a 的权限发生改变，则 role_b 所继承的权限也会动态更改。MatrixOne 不允许角色环继承，即 role1 继承 role2，role2 继承 role3，role3 继承 role1。

更多信息，参见[DRANT ROLE](../../Reference/SQL-Reference/Database-Administration-Statements/grant-role.md)。

### 查看某一用户所拥有的权限

- 前提条件：拥有 `SHOW GRANTS` 权限。

     · 默认拥有这个权限的角色为 MOADMIN 或 ACCOUNTADMIN：集群管理员（默认账户为 root）和由集群管理员创建的租户管理员默认拥有权限。

- 操作说明：查看所指定用户当前所拥有的全部权限

**SQL 语法**

```
show grants for <user_name>@<localhost>
```

**参数解释**

|参数|参数解释|
|---|---|
|<user_name>|被赋予权限的用户|

更多信息，参见[SHOW GRANTS](../../Reference/SQL-Reference/Database-Administration-Statements/show-grants.md)。

### 回收角色的授权用户

- 前提条件：拥有 `REVOKE` 权限。

     · 默认拥有这个权限的角色为 MOADMIN 或 ACCOUNTADMIN：集群管理员（默认账户为 root）和由集群管理员创建的租户管理员默认拥有权限。

- 操作说明：将某一用户的某一角色移除

**SQL 语法**

```
revoke <role_name> from <user_name>
```

**参数解释**

|参数|参数解释|
|---|---|
|<role_name>|被赋予权限的角色|
|<user_name>|被赋予权限的用户|

更多信息，参见[REVOKE](../../Reference/SQL-Reference/Database-Administration-Statements/revoke.md)。

### 回收角色的授权权限

- 前提条件：拥有 `REVOKE` 权限。

     · 默认拥有这个权限的角色为 MOADMIN 或 ACCOUNTADMIN：集群管理员（默认账户为 root）和由集群管理员创建的租户管理员默认拥有权限。

- 操作说明：回收角色中的某个对象权限

**SQL 语法**

```
revoke <privilege> on <object_type> <object_name> to <role_name>;
```

**参数解释**

|参数|参数解释|
|---|---|
|<privilege>|权限|
|<object_type>|对象类型|
|<object_name>|对象名称|
|<role_name>|被赋予权限的角色|

更多信息，参见[REVOKE](../../Reference/SQL-Reference/Database-Administration-Statements/revoke.md)。

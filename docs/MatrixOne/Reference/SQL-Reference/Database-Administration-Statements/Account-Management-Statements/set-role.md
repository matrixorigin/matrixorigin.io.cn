# **SET ROLE**

## **语法说明**

设置会话的活动/当前主要角色。为当前活动的主角色设置上下文，以确定当前用户是否拥有执行 `CREATE <object>` 语句或执行任何其他 SQL 操作所需的权限。

除了创建对象之外，任何 SQL 操作的授权都可以由次级角色执行。

## **语法结构**

```
> SET SECONDARY ROLE {
    NONE
  | ALL  
}
SET ROLE role
```

### 语法说明

角色是权限的集合，一个用户可以对应多个角色。

例如，user1 拥有主要角色 role1，次要角色 role2 和 role3, role1 被授予 pri1 和 pri2 权限；role2 被赋予权限 pri3；role3 被赋予权限 pri4，授权示例表如下：

|用户名|角色名|权限名|
|---|---|---|
|user1|role1|pri1,pri2|
||role2|pri3|
||role3|pri4|

为了更容易理解，你可以参考如下示例：

|用户|角色|权限名|
|---|---|---|
|Tom|应用开发者（Application Developer）|读数据（Read Data），写数据（Write Data）|
||运维专家（O&M expert）|读数据（Read data）|
||数据库管理员（Database Administrator）|管理员权限（Administrator Privileges）|

此时 Tom 的主要角色是应用开发者，Tom 需要调用*管理员权限*，那么 Tom 可以使用以下两种方法：

—使用 `SET role role` 语句将其角色切换为 “数据库管理员”。

—如果需要使用主、从角色的所有权限，可以使用 `SET secondary ROLE all`。

这两种语句解释如下:

#### SET SECONDARY ROLE ALL

将该用户所有的 ROLE 取并集。

#### SET SECONDARY ROLE NONE

将除 PRIMARY ROLE 之外的所有角色从当前会话中去除。

#### SET ROLE role

将当前角色切换为新角色。

## **示例**

```sql
> drop role if exists use_role_1,use_role_2,use_role_3,use_role_4,use_role_5;
> drop user if exists use_user_1,use_user_2;
> drop database if exists use_db_1;
> create role use_role_1,use_role_2,use_role_3,use_role_4,use_role_5;
> create database use_db_1;
> create user use_user_1 identified by '123456' default role use_role_1;
#把所有表的 select，insert 和 update 权限授权给 use_role_1
> grant select ,insert ,update on table *.* to use_role_1;
#把数据库的所有权限授权给 use_role_2
> grant all on database * to use_role_2;
#把角色 use_role_2 分配给用户 use_user_1
> grant use_role_2 to use_user_1;
#创建表 use_table_1
> create table use_db_1.use_table_1(a int,b varchar(20),c double );
#设置用户 use_user_1 主要角色和次要角色全部可用
> set secondary role all;
#查看用户 use_user_1 现在拥有的权限
> show grants for 'use_user_1'@'localhost';
+-----------------------------------------------------------+
| Grants for use_user_1@localhost                           |
+-----------------------------------------------------------+
| GRANT select ON table *.* `use_user_1`@`localhost`        |
| GRANT insert ON table *.* `use_user_1`@`localhost`        |
| GRANT update ON table *.* `use_user_1`@`localhost`        |
| GRANT connect ON account  `use_user_1`@`localhost`        |
| GRANT database all ON database * `use_user_1`@`localhost` |
+-----------------------------------------------------------+
5 rows in set (0.01 sec)
#可以看到，用户 use_user_1 拥有默认的连接 MatrixOne 的权限 connect；也拥有对所有表的 select，insert 和 update 权限，同时也拥有对数据库的全部权限
```

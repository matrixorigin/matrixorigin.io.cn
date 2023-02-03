# **CREATE USER**

## **语法说明**

在系统中创建一个新的用户。

使用 `CREATE USER`，你需要拥有 `CREATE USER` 权限。

- 默认拥有 `CREATE USER` 权限的角色为 MOADMIN 或 ACCOUNTADMIN：集群管理员（默认账户为 root）和由集群管理员创建的租户管理员默认拥有权限。

## **语法结构**

```
> CREATE USER [IF NOT EXISTS]
    user auth_option [, user auth_option] ...
    [DEFAULT ROLE role]  
    [COMMENT 'comment_string' | ATTRIBUTE 'json_object']
auth_option: {
    IDENTIFIED BY 'auth_string'
}
```

### 语法说明

首次创建的用户没有权限，默认角色为 `NONE`。要分配权限或角色，请使用 [GRANT](grant.md) 语句。

`CREAT USER` 的基本 SQL 语句如下：

```
create user user_name identified by 'password';
```

#### IDENTIFIED BY auth_string

`CREATE USER` 允许这些 `auth_option` ：

- 'auth_string'：在 MatrixOne 中，'auth_string' 为密码，即将密码存储在 *mo_user* 系统表的帐户行中。

#### DEFAULT ROLE

`DEFAULT ROLE` 子句定义当用户连接到 MatrixOne 并进行身份验证时，或者当用户在会话期间执行 `SET ROLE` 语句时，角色会变为激活/使用状态。

```
create user user_name identified by 'password' default role role_rolename;
```

`DEFAULT ROLE` 子句允许列出一个或多个以逗号分隔的角色名称。这些角色必须在执行 `CREATE USER` 前就已经被创建好；否则该语句会引发错误，并且创建用户失败。

## **示例**

```sql
> create user userx identified by '111';
Query OK, 0 rows affected (0.04 sec)
```

## **限制**

MatrxiOne 暂不支持 `CREAT USER COMMENT` 和 `CREAT USER ATTRIBUTE`。

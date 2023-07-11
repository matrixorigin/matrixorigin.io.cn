# 权限管理应用场景

## 场景概述

- 如果你所在的企业部署了 MatrixOne 集群，那么部署完成后，集群初始化时即自动存在一个集群管理员账户，你可以联系 MatrxiOne 的项目经理或销售代表获取账号信息和初始密码。使用集群管理员的账号，你可以新建租户，管理租户生命周期，并将租户账号密码分配给你所在企业对应的负责人。管理租户的操作说明，详见[快速开始：创建租户，验证资源隔离](../how-tos/quick-start-create-account.md)或[权限管理操作指南](../how-tos/user-guide.md)。

- 如果你所在的企业仅需使用 MatrixOne 集群租户资源，完成部署后，MatrixOne 集群管理员会帮你开通租户管理员的账号，你可以联系 MatrxiOne 的项目经理或销售代表获取账号信息和初始密码。使用租户管理员的账号，你可以新建用户，管理用户生命周期、租户内的资源（用户、角色和权限），并将用户账号密码分配给你所在企业对应的负责人。管理用户的操作说明，详见[快速开始：创建用户、创建角色和授权](../how-tos/quick-start-create-user.md)或[权限管理操作指南](../how-tos/user-guide.md)。

## 场景一：新建数据管理员并赋权

### 场景介绍

在实际应用场景中，需要设立一个数据管理员的岗位，他负责管理整个数据库中资源分配的情况，比如说，公司其他成员需要被分配一个用户账号和密码，被分配角色，并被授予最低的使用权限。

### 前提条件

- 你首先需要拥有**租户管理员**的账号

- 已经连接上 MatrixOne 集群

### 解决方案

创建一个数据管理员的角色，授予他租户内的全局管理的权限，那么你需要做到如下几点：

- 创建一个新的用户账号，用户名为：dbauser；密码为：123456。
- 给这个用户账号分配一个数据管理员的角色，角色命名为：dba。
- 这个角色需要有以下权限：
    * 拥有租户对象的全部权限：拥有这个权限，那么数据管理员就可以创建新用户、新角色、分配权限给其他用户。
    * 拥有数据库对象的全部权限：拥有这个权限，那么数据管理员就可以新建、编辑、删除数据库。
    * 拥有表对象的全部权限：拥有这个权限，那么数据管理员就可以新建、编辑、删除数据表。

### 操作步骤

#### 步骤一：租户管理员开通并授权数据库管理员账号

1. 使用你所拥有的租户管理员账号登录租户：

    __Note__: 此处的租户管理员账号 *account1* 为示例，你可以在创建租户管理员时进行自定义。

    ```
    mysql -h 127.0.0.1 -P 6001 -u account1:admin:admin -p
    ```

2. 创建一个用户账号，命名为 *dbauser*，密码为 *123456*：

    ```
    create user dbauser identified by "123456";
    ```

3. 创建一个数据管理员的角色，命名为 *dba*：

    ```
    create role dba;
    ```

4. 授权权限给角色如下权限：

    - 租户对象的全部权限
    - 数据库对象的全部权限
    - 表对象的全部权限

    ```
    grant all on account * to dba with grant option;
    grant all on database * to dba with grant option;
    grant all on table *.* to dba with grant option;
    ```

5. 授权角色 *dba* 给用户 *dbauser*：

    ```
    grant dba to dbauser;
    ```

6. 查看权限授予情况：

    ```
    show grants for dbauser@localhost;
    ```

#### 步骤二：数据管理员登录账号并进行测试

1. 使用数据管理员账号 *dbauser* 登录 MatrixOne：

    ```
    mysql -h 127.0.0.1 -P 6001 -u account1:dbauser:dba -p
    ```

2. 查看 *dbauser* 所拥有的权限：

    ```
    show grants for dbauser@localhost;
    ```

3. 查看 *dbauser* 的角色：

    ```
    SET SECONDARY ROLE ALL;
    use mo_catalog;
    select mu.user_name,mr.role_name from mo_role mr,mo_user mu,mo_user_grant mug where mu.user_id=mug.user_id and mr.role_id=mug.role_id and mu.user_name='dbauser';
    ```

4. 实际操作一个数据库进行验证：

    ```
    drop database if exists test;
    create database test;
    use test;
    create table t1(a int);
    insert into t1 values(1),(2),(3);
    select * from t1;
    ```

5. 上面代码表示验证成功。

## 场景二：新系统上线

### 场景介绍

应用系统上线时，会根据应用系统的使用需求，创建新的数据库与对应数据库用户，并且授予这个用户拥有目标数据库的所有权限。

### 前提条件

- 你首先需要具有租户管理员的账号和权限（或者你本身作为一个用户，已经拥有创建新用户并可以授权给新用户数据库对象全部权限）
- 连接上 MatrixOne 集群

### 解决方案

- 需求 1：应用系统需要一套新的数据库专门应用于应用的开发。
    * 解决方案：创建新的数据库，命名为 *appdb*。

- 需求 2：该应用系统需要专门的角色。
    * 解决方案：创建新的数据库角色，命名为 *approle*，授权给这个角色全部的数据库权限。

- 需求 3：该应用系统需要专门的负责人管理这个数据库。
    * 解决方案：创建新的数据库用户，命名为 *appuser*，把角色授权给这个用户。

### 操作步骤

#### 步骤一：租户管理员开通并授权数据库用户账号

1. 使用你所拥有的租户管理员账号登录租户：

    __Note__: 此处的租户管理员账号 *account1* 为示例，你可以在创建租户管理员时进行自定义。

    ```
    mysql -h 127.0.0.1 -P 6001 -u account1:admin:admin -p
    ```

2. 创建应用所需要的数据库，给数据库命名为 *appdb*：

    ```
    create database appdb;
    ```

3. 创建一个命名为 *approle* 的角色，并授权给这个角色对于数据库 *appdb* 的全部操作权限：

    ```
    create role approle;
    grant all on database appdb to approle;
    grant all on table appdb.* to approle;
    ```

4. 创建数据库用户 *appuser*，密码为 *123456*，并将角色 *approle* 分配给 *appuser*：

    ```
    create user appuser identified by "123456" default role approle;
    ```

#### 步骤二：数据库用户登录账号并进行测试

1. 使用数据库用户账号 *appuser* 登录 MatrixOne：

    ```
    mysql -h127.0.0.1 -utest:appuser -P6001 -p123456
    ```

2. 验证数据用户账号 *appuser* 的权限：

    ```
    set secondary role all;
    use appdb;
    create table t1(a int);
    insert into t1 values(1),(2),(3);
    select * from t1;
    drop table t1;
    ```

3. 上面代码表示验证成功。

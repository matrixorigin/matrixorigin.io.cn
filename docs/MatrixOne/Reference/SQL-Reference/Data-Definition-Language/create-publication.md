# **CREATE PUBLICATION**

## **语法说明**

`CREATE PUBLICATION` 将一个新的发布添加到当前数据库中。

## **语法结构**

```
CREATE PUBLICATION <pubname>
    DATABASE <database_name>[<table_name>] ACCOUNT
    [ { ALL
    | account_name, [, ... ] }]
    [ COMMENT 'string']
```

## 语法解释

- pubname：发布名称。发布名称必须与当前数据库中任何现有发布的名称不同。
- database_name：当前租户下已存在的某个数据库名称。
- account_name：可获取该发布的租户名称。

## **示例**

```sql
create account acc01 admin_name 'root' identified by '111';
create account acc02 admin_name 'root' identified by '111';
create database db1;
use db1;
create table t1(n1 int);
create table t2(n1 int);

--数据库级别发布
create publication db_pub1 database db1 account acc01,acc02;

--表级别发布
create publication tab_pub1 database db1 table t1,t2 account acc01,acc02;
```

## 限制

- 数据库级别的发布，目前仅支持一次发布一个数据库数据。

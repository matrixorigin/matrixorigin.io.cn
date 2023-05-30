# **CREATE PUBLICATION**

## **语法说明**

`CREATE PUBLICATION` 将一个新的发布添加到当前数据库中。

## **语法结构**

```
CREATE PUBLICATION pubname
    DATABASE database_name ACCOUNT
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
create database t;
create account acc0 admin_name 'root' identified by '111';
create account acc1 admin_name 'root' identified by '111';
mysql> create publication pub1 database t account acc0,acc1;
Query OK, 0 rows affected (0.01 sec)
```

## 限制

MatrxiOne 当前仅支持一次发布一个数据库数据。

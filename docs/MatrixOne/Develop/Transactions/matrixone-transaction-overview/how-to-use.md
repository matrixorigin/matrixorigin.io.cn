# 事务使用指南

本章节向你介绍如何简单的开启、提交、回滚一个事务，以及如何自动提交事务。

## 开启事务

开启事务可以通过使用 `START TRANSACTION` 开始一个事务，也可以用方言命令 `BEGIN`。
代码示例：

```
START TRANSACTION;
insert into t1 values(123,'123');
```

或：

```
BEGIN;
insert into t1 values(123,'123');
```

## 提交事务

提交事务时，MatrixOne 接受 `COMMIT` 命令作为提交命令。代码示例如下：

```
START TRANSACTION;
insert into t1 values(123,'123');
commit;
```

## 回滚事务

回滚事务时，MatrixOne 接受 `ROLLBACK` 命令作为提交命令。代码示例如下：

```
START TRANSACTION;
insert into t1 values(123,'123');
rollback;
```

## 自动提交

在 MatrixOne 中，有一个参数 `AUTOCOMMIT`，决定了没有 `START TRANSACTION` 或 `BEGIN` 的情况下，单条 SQL 语句的是否被当做独立事务自动提交。语法如下：

```sql
-- 设置该参数的值
SET AUTOCOMMIT={on|off|0|1}  
SHOW VARIABLES LIKE 'AUTOCOMMIT';
```

在该参数设置为 ON 或 1 的时候，意味着自动提交，所有不在 `START TRANSACTION` 或 `BEGIN` 中的单条 SQL 语句，都会在执行时自动提交。

```sql
-- 此时自动提交
insert into t1 values(1,2,3);   
```

在该参数设置为 OFF 或 0 的时候，意味着非自动提交，所有不在 `START TRANSACTION` 或 `BEGIN` 中的 SQL 语句，需要用 `COMMIT` 或 `ROLLBACK` 来执行提交或回滚。

```sql
insert into t1 values(1,2,3);
-- 此处需要手动提交
COMMIT；  
```

## 切换事务模式

MatrixOne 默认采用悲观事务与 RC 隔离级别。但若你需要切换至乐观事务模式，相应的隔离级别将自动更改为快照隔离。

在 *matrixone/etc/launch-with-proxy/* 目录下的配置文件 *cn.toml* 中添加如下配置参数以切换事务模式：

```toml
[cn.Txn]
mode = "optimistic"
isolation = "SI"
```

__Note:__ 如果你只添加事务模式参数 `mode = "optimistic"`，但未添加 `isolation = "SI"`，系统也将默认在乐观事务模式下的隔离级别为 SI 隔离。

重启 MatrixOne，便能使切换后的事务模式生效。

更多关于配置参数信息，参见[分布式版通用参数配置](../../../Reference/System-Parameters/distributed-configuration-settings.md)。

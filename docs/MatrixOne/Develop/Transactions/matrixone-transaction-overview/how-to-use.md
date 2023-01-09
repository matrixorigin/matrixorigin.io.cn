# 如何使用 MatrixOne 事务

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

在 MatrixOne 中，有一个参数 `AUTOCOMMIT`，决定了没有 `START TRANSACTION` 或 `BEGIN` 的情况下，没有单条 SQL 语句的是否被当做独立事务自动提交。语法如下：

```
SET AUTOCOMMIT={on|off|0|1}  //设置该参数的值
SHOW VARIABLES LIKE 'AUTOCOMMIT';
```

在该参数设置为 ON 或 1 的时候，意味着自动提交，所有不在 `START TRANSACTION` 或 `BEGIN` 中 的单条 SQL 语句，都会在执行时自动提交。

```
insert into t1 values(1,2,3);   //此时自动提交
```

在该参数设置为 OFF 或 0 的时候，意味着非自动提交，所有不在 `START TRANSACTION` 或 `BEGIN` 中的 SQL 语句，需要用 `COMMIT` 或 `ROLLBACK` 来执行提交或回滚。

```
insert into t1 values(1,2,3);
COMMIT；  //此处需要手动提交
```

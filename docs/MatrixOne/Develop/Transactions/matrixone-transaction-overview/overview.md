# MatrixOne 的事务概述

## 什么是 MatrixOne 的事务？

MatrixOne 事务遵循数据库事务的标准定义与基本特征(ACID)。它旨在帮助用户在分布式数据库环境下，确保每一次数据库数据操作行为，都能够令结果保证数据的一致性和完整性，在并发请求下互相隔离不受干扰。

## MatrixOne 的事务类型

在 MatrixOne 中，事务与通用事务一样，也分为以下两大类：
- 按照是否有明确的起止分为显式事务和隐式事务。
- 按照对资源锁的使用阶段分为乐观事务和悲观事务。

这两大类事务的分类彼此不受对方限制，一个显式事务可以是乐观事务或悲观事务，同时一个悲观事务可能是显式事务也可能是隐式事务。

__Note__: MatrixOne 暂不支持悲观事务。

## [显式事务](explicit-transaction.md)

在 MatrixOne 中，一个事务以 `START TRANSACTION` 显式声明，即成为一个显式事务。

## [隐式事务](implicit-transaction.md)

在 MatrixOne 中，如果一个事务并没有通过 `START TRANSACTION` 或 `BEGIN` 来显式声明，那么为隐式事务。

## [乐观事务](optimistic-transaction.md)

在乐观事务开始时，会假定事务相关的表处于一个不会发生写冲突的状态，把对数据的插入、修改或删除缓存在内存中，在这一阶段不会对数据加锁，而在数据提交时对相应的数据表或数据行上锁，在完成提交后解锁。

## [MatrixOne 的事务隔离级别](snapshot-isolation.md)

### 快照隔离

与 SQL 标准所定义的四个隔离级别不同，在 MatrixOne 中，支持的隔离级别是快照隔离（Snapshot Isolation），该级别的隔离在 SQL-92 标准的 **REPEATABLE READ** 和 **SERIALIZABLE** 之间。与其他隔离级别有所区别的是，快照隔离具备如下特性：

- 快照隔离对于指定事务内读取的数据不会反映其他同步的事务对数据所做的更改。指定事务使用本次事务开始时读取的数据行。

- 读取数据时不会对数据进行锁定，因此快照事务不会阻止其他事务写入数据。

- 写入数据的事务也不会阻止快照事务读取数据。

与其他隔离级别相比，快照隔离对于脏读(读取未提交数据)、脏写（写了修改后未提交的记录）、幻读(前后多次读取，数据总量不一致)等场景也实现了有效回避：

|Isolation Level|P0 Dirty Write|P1 Dirty Read|P4C Cursor Lost Update|P4 Lost Update|P2 Fuzzy Read|P3 Phantom|A5A Read Skew|A5B Write Skew|
|---|---|---|---|---|---|---|---|---|
|MatrixOne's Snapshot Isolation|Not Possible|Not Possible|Not Possible|Not Possible|Not Possible|Not Possible|Not Possible| Possible|

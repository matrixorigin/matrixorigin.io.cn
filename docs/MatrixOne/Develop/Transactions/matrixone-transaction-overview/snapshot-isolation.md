# MatrixOne 快照隔离

在 MatrixOne 中，支持的隔离级别是快照隔离（Snapshot Isolation），该级别的隔离实现原理如下：

## 快照隔离原理

- 当一个事务开始时，数据库会为该事务生成一个事务 ID，这是一个独一无二的 ID。
- 在生成该事务 ID 的时间戳，生成一个对应数据的快照，此时事务的所有操作都是基于该快照来执行。
- 当事务提交完成对数据的修改后，释放事务 ID 与数据快照。

## 快照隔离示例

你可以参加下面的示例，来帮助理解快照隔离。

首先在 MatrixOne 中，我们建立一个数据库 *test* 与表 *t1*：

```
create database test;
use test;
CREATE TABLE t1
(
tid INT NOT NULL primary key,
tname VARCHAR(50) NOT NULL
);
INSERT INTO t1 VALUES(1,'version1');
INSERT INTO t1 VALUES(2,'version2');
```

在会话 1 中，开启一个事务：

```
use test;
begin;
UPDATE t1 SET tname='version3' WHERE tid=2;
SELECT * FROM t1;
```

在会话 1 中，我们可以看到的结果是如下，根据快照的数据所进行的修改结果：

```
+------+----------+
| tid  | tname    |
+------+----------+
|    2 | version3 |
|    1 | version1 |
+------+----------+
```

此时开启会话 2，去查询 t1 的内容：

```
use test;
SELECT * FROM t1;
```

看到的结果仍然是原始数据：

```
+------+----------+
| tid  | tname    |
+------+----------+
|    1 | version1 |
|    2 | version2 |
+------+----------+
```

在会话 1 中，我们将事务提交：

```
COMMIT;
```

此时，在会话 2 中查询 *t1* 的内容就变成了提交后的数据：

```
SELECT * FROM t1;
+------+----------+
| tid  | tname    |
+------+----------+
|    1 | version1 |
|    2 | version3 |
+------+----------+
```

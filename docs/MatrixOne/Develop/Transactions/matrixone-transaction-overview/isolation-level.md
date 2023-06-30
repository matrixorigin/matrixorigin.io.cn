# 隔离级别

## 读已提交

MatrixOne 默认**读已提交（Read Committed）**隔离级别，它的特点如下：

- 在不同的事务之间，只能读到其他事务已经提交的数据，对于未提交的数据，无法查看。
- 读已提交的隔离级别，能够有效防止脏写和脏读，但是不能避免不可重复读与幻读。

### 读已提交原理

- 当一个事务开始时，数据库会为该事务生成一个独一无二的事务 ID。
- 在生成该事务 ID 的时间戳，在每次对数据进行增、删、改、查时，TAE 自动检测对应表中是否有已被更新的时间戳，如果有，则更新时间戳为最新。
- 在对数据操作时，TAE 将操作的数据缓存在内存中，提交事务时，TAE 将内存中的数据写入到磁盘内（数据存储到的 S3 路径，或本地磁盘路径）。

### 读已提交示例

你可以参加下面的示例，来理解**读已提交**隔离级别。

首先在 MatrixOne 中，我们建立一个命名为 `test` 的数据库与表 `t1`，并插入数据：

```sql
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

```sql
use test;
begin;
UPDATE t1 SET tname='version3' WHERE tid=2;
SELECT * FROM t1;
```

在会话 1 中，我们可以看到的结果是如下：

```sql
+------+----------+
| tid  | tname    |
+------+----------+
|    2 | version3 |
|    1 | version1 |
+------+----------+
```

此时开启会话 2，开启一个新事务去查询 t1 的内容：

```sql
use test;
begin;
SELECT * FROM t1;
```

看到的结果仍然是原始数据：

```sql
+------+----------+
| tid  | tname    |
+------+----------+
|    1 | version1 |
|    2 | version2 |
+------+----------+
```

在会话 2 中，修改 `tid=1` 的行：

```sql
UPDATE t1 SET tname='version0' WHERE tid=1;
```

此时，在会话 1 中查询 `t1` 的内容仍然还是修改后的数据：

```sql
SELECT * FROM t1;
+------+----------+
| tid  | tname    |
+------+----------+
|    1 | version1 |
|    2 | version3 |
+------+----------+
```

在会话 2 提交自己的数据后，再查询会话 1，会发现，此时会话 1 的内容已经变成了会话 2 提交之后的数据：

- 会话 2：

```sql
-- 在会话 2 中提交数据：
COMMIT;
```

- 会话 1：

```sql
-- 查询会话 1 的内容是否已经变成了会话 2 提交之后的数据：
SELECT * FROM t1;
+------+----------+
| tid  | tname    |
+------+----------+
|    1 | version0 |
|    2 | version3 |
+------+----------+
```

## 快照隔离

在 MatrixOne 中，支持的隔离级别是快照隔离（Snapshot Isolation），为了与 MySQL 隔离级别保持一致，MatixOne 快照隔离又叫做可重复读（REPEATABLE READS）。该级别的隔离实现原理如下：

### 快照隔离原理

- 当一个事务开始时，数据库会为该事务生成一个事务 ID，这是一个独一无二的 ID。
- 在生成该事务 ID 的时间戳，生成一个对应数据的快照，此时事务的所有操作都是基于该快照来执行。
- 当事务提交完成对数据的修改后，释放事务 ID 与数据快照。

### 快照隔离示例

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

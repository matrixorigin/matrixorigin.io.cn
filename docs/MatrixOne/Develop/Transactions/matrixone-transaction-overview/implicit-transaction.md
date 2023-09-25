# 隐式事务

在 MatrixOne 的事务类别中，隐式事务还遵循以下规则：

## 隐式事务规则

- MatrixOne 在 `AUTOCOMMIT` 发生变化时，对于隐式事务未提交的情况会进行错误处理，并向用户提示需要先提交变化。

- 在 `AUTOCOMMIT=0` 且当前存在活跃事务的情况下，禁止修改自动提交与隔离级别，以及管理类与参数设置命令，例如 `SET`、`CREATE USER/ROLE` 或授权操作也将被限制。

- 当 `AUTOCOMMIT=1` 时，每条 DML 语句都被视为一个单独的事务，在执行后立即进行提交。

- 而在 `AUTOCOMMIT=0` 的情况下，每条 DML 语句在执行后并不会立即提交，需要手动执行 `COMMIT` 或 `ROLLBACK` 操作。若在尚未提交或回滚的状态下退出客户端，则默认进行回滚操作。

- 在 `AUTOCOMMIT=0` 的情况下，DML 与 DDL 可以同时存在于一个隐式事务中，但 DDL 的对象类型不能为数据库与序列。

- 若在 `AUTOCOMMIT=0` 的状态下出现 `CREATE/DROP DATABASE` 或 `CREATE/DROP SEQUENCE` 操作，则会强制提交之前未提交的所有内容。同时，`CREATE/DROP DATABASE` 操作将会立即作为一个独立的事务进行提交。

- 当存在未提交内容的隐式事务时，若启动一个显式事务，则会强制提交之前未提交的内容。

## MatrixOne 与 MySQL 隐式事务的区别

在 MatrixOne 中，如果开启了隐式事务（`SET AUTOCOMMIT=0`），则所有操作都需要手动执行 `COMMIT` 或 `ROLLBACK` 来结束事务。相比之下，MySQL 在遇到 DDL 或类似 `SET` 语句时会自动提交。

### MySQL 隐式事务行为

|事务类型|开启自动提交|关闭自动提交|
|---|---|---|
|隐式事务与自动提交|当 `AUTOCOMMIT=1` 时，MySQL不会对事务进行任何更改，每个语句都是一个单独的自动提交事务。|当 `AUTOCOMMIT=0` 时，MySQL 也不会对事务进行任何更改，但随后的语句将继续在当前事务中执行，直到显式提交或回滚事务。|
|隐式事务与非自动提交|当 `AUTOCOMMIT=1` 时，MySQL会在每个语句执行后自动提交未提交的事务。 | 当 `AUTOCOMMIT=0` 时，MySQL 会继续在当前事务中执行随后的语句，直到显式提交或回滚事务。 |

**MySQL 隐式事务行为示例**

```sql
mysql> select @@SQL_SELECT_LIMIT;
+----------------------+
| @@SQL_SELECT_LIMIT   |
+----------------------+
| 18446744073709551615 |
+----------------------+
1 row in set (0.01 sec)

mysql> set autocommit=0;
Query OK, 0 rows affected (0.00 sec)

mysql> set SQL_SELECT_LIMIT = 1;
Query OK, 0 rows affected (0.00 sec)

mysql> select @@SQL_SELECT_LIMIT;
+--------------------+
| @@SQL_SELECT_LIMIT |
+--------------------+
|                  1 |
+--------------------+
1 row in set (0.01 sec)

mysql> rollback;
Query OK, 0 rows affected (0.00 sec)

mysql> select @@SQL_SELECT_LIMIT;
+--------------------+
| @@SQL_SELECT_LIMIT |
+--------------------+
|                  1 |
+--------------------+
1 row in set (0.00 sec)

mysql> set autocommit=0;
Query OK, 0 rows affected (0.00 sec)

mysql> set SQL_SELECT_LIMIT = default;
Query OK, 0 rows affected (0.00 sec)

mysql> select @@SQL_SELECT_LIMIT;
+----------------------+
| @@SQL_SELECT_LIMIT   |
+----------------------+
| 18446744073709551615 |
+----------------------+
1 row in set (0.00 sec)

mysql> rollback;
Query OK, 0 rows affected (0.00 sec)

mysql> select @@SQL_SELECT_LIMIT;
+----------------------+
| @@SQL_SELECT_LIMIT   |
+----------------------+
| 18446744073709551615 |
+----------------------+
1 row in set (0.00 sec)
```

**MatrixOne 隐式事务行为示例**

```sql
mysql> select @@SQL_SELECT_LIMIT;
+----------------------+
| @@SQL_SELECT_LIMIT   |
+----------------------+
| 18446744073709551615 |
+----------------------+
1 row in set (0.01 sec)

mysql> set autocommit=0;
Query OK, 0 rows affected (0.00 sec)

mysql> set SQL_SELECT_LIMIT = 1;
Query OK, 0 rows affected (0.00 sec)

mysql> select @@SQL_SELECT_LIMIT;
+--------------------+
| @@SQL_SELECT_LIMIT |
+--------------------+
| 1                  |
+--------------------+
1 row in set (0.00 sec)

mysql> rollback;
Query OK, 0 rows affected (0.00 sec)

mysql> select @@SQL_SELECT_LIMIT;
+--------------------+
| @@SQL_SELECT_LIMIT |
+--------------------+
| 1                  |
+--------------------+
1 row in set (0.01 sec)

mysql> set autocommit=0;
ERROR 20101 (HY000): internal error: Uncommitted transaction exists. Please commit or rollback first.
```

## 隐式事务示例

例如，对 *t1* 插入数据 (4,5,6)，即成为一个隐式事务。而该隐式事务是否立即提交，取决于 `AUTOCOMMIT` 参数的值：

```sql
CREATE TABLE t1(a bigint, b varchar(10), c varchar(10));
START TRANSACTION;
INSERT INTO t1 values(1,2,3);
COMMIT;

-- 查看 AUTOCOMMIT 开关参数
mysql> SHOW VARIABLES LIKE 'AUTOCOMMIT';
+---------------+-------+
| Variable_name | Value |
+---------------+-------+
| autocommit    | 1     |
+---------------+-------+
1 row in set (0.00 sec)
-- 此处开始一个隐式事务，在 AUTOCOMMIT=1 的情况下，每一条 DML 在执行后立即提交
insert into t1 values(4,5,6);

-- 隐式事务自动提交，表数据如下所示
mysql> select * from t1;
+------+------+------+
| a    | b    | c    |
+------+------+------+
|    1 | 2    | 3    |
|    4 | 5    | 6    |
+------+------+------+
2 rows in set (0.00 sec)
```

# 显式事务

在 MatrixOne 的事务类别中，显式事务还遵循以下规则：

## 显式事务规则

- 显式事务是指以 `BEGIN...END` 或 `START TRANSACTION...COMMIT` 或 `ROLLBACK` 作为起始结束。
- 在显式事务中，DML（Data Manipulation Language，数据操纵语言）与 DDL（Data Definition Language，数据库定义语言）可以同时存在，支持除数据库与序列之外的所有对象类型的 DDL。
- 显式事务中，无法嵌套其他显式事务，例如 `START TRANSACTIONS` 之后再遇到 `START TRANSACTIONS`，两个 `START TRANSACTIONS` 之间的所有语句都会强制提交，无论 `AUTOCOMMIT` 的值是 1 或 0。
- 显式事务中，不能存在 `SET` 命令与管理类命令（`CREATE USER/ROLE` 或 `GRANT`），只能包含 DML 与 DDL。
- 显式事务中，如果在未发生显式提交或回滚而开启一个新事务而发生写写冲突，之前未提交的事务将会回滚并报错。

## 与 MySQL 显式事务的区别

|事务类型 | 开启自动提交 | 关闭自动提交|
|---|---|---|
|显式事务与自动提交 | 当 `AUTOCOMMIT=1` 时，MySQL 不会对事务进行任何更改，每个语句都会在一个新的自动提交事务中执行。|当 `AUTOCOMMIT=0` 时，每个语句都会在显式开启的事务中执行，直到显式提交或回滚事务。|
|显式事务与非自动提交 | 当 `AUTOCOMMIT=1` 时，MySQL 会在每个语句执行后自动提交未提交的事务。|当 `AUTOCOMMIT=0` 时，每个语句都会在显式开启的事务中执行，直到显式提交或回滚事务。|

**MySQL 与 MatrixOne 显式事务行为示例**

```sql
mysql> CREATE TABLE Accounts (account_number INT PRIMARY KEY, balance DECIMAL(10, 2));
Query OK, 0 rows affected (0.07 sec)

mysql> INSERT INTO Accounts (account_number, balance) VALUES (1, 1000.00), (2, 500.00);
Query OK, 2 rows affected (0.00 sec)

mysql> BEGIN;
Query OK, 0 rows affected (0.01 sec)

mysql> UPDATE Accounts SET balance = balance - 100.00 WHERE account_number = 1;
Query OK, 1 row affected (0.00 sec)

mysql> UPDATE Accounts SET balance = balance + 100.00 WHERE account_number = 2;
Query OK, 1 row affected (0.00 sec)

mysql> COMMIT;
Query OK, 0 rows affected (0.01 sec)

mysql> BEGIN;
Query OK, 0 rows affected (0.00 sec)

mysql> UPDATE Accounts SET balance = balance - 100.00 WHERE account_number = 1;
Query OK, 1 row affected (0.00 sec)

mysql> UPDATE Accounts SET invalid_column = 0 WHERE account_number = 2;
ERROR 20101 (HY000): internal error: column 'invalid_column' not found in table
Previous DML conflicts with existing constraints or data format. This transaction has to be aborted
mysql> ROLLBACK;
Query OK, 0 rows affected (0.00 sec)
mysql> SELECT * FROM Accounts;
+----------------+---------+
| account_number | balance |
+----------------+---------+
|              1 |  900.00 |
|              2 |  600.00 |
+----------------+---------+
2 rows in set (0.01 sec)
```

## 跨库事务行为示例

MatrixOne 支持跨库事务行为，这里将以一个简单的示例进行说明。

首先，让我们创建两个数据库（db1 和 db2）以及它们各自的表（table1 和 table2）：

```sql
-- 创建 db1 数据库
CREATE DATABASE db1;
USE db1;

-- 创建 db1 中的表 table1
CREATE TABLE table1 (
    id INT AUTO_INCREMENT PRIMARY KEY,
    field1 INT
);

-- 创建 db2 数据库
CREATE DATABASE db2;
USE db2;

-- 创建 db2 中的表 table2
CREATE TABLE table2 (
    id INT AUTO_INCREMENT PRIMARY KEY,
    field2 INT
);
```

现在，我们已经创建了两个数据库和它们的表。接下来，我们将插入一些数据：

```sql
-- 在 db1 的 table1 中插入数据
INSERT INTO db1.table1 (field1) VALUES (100), (200), (300);

-- 在 db2 的 table2 中插入数据
INSERT INTO db2.table2 (field2) VALUES (500), (600), (700);
```

现在，我们已经有了两个数据库中的数据。接下来，我们将执行一个跨库事务，同时修改这两个数据库中的数据：

```sql
-- 开始跨库事务
START TRANSACTION;

-- 在 db1 中更新 table1 的数据
UPDATE db1.table1 SET field1 = field1 + 10;

-- 在 db2 中更新 table2 的数据
UPDATE db2.table2 SET field2 = field2 - 50;

-- 提交跨库事务
COMMIT;
```

在上面的跨库事务中，首先使用 `START TRANSACTION;` 开始事务，然后分别在 db1 和 db2 中更新了各自的表数据，最后使用 `COMMIT;` 提交事务。如果在事务期间任何一步失败，整个事务将回滚，以确保数据的一致性。

这个示例展示了一个完整的跨库事务，在实际应用中，跨库事务可能更加复杂，这个简单的示例可以帮助理解基本的概念和操作。

# 显式事务

在 MatrixOne 的事务类别中，显式事务还遵循以下规则：

## 显式事务规则

- 显式事务是指以 `BEGIN...END` 或 `START TRANSACTION...COMMIT` 或 `ROLLBACK` 作为起始结束。
- 在显式事务中，DML（Data Manipulation Language，数据操纵语言）与 DDL（Data Definition Language，数据库定义语言）可以同时存在，支持除数据库与序列之外的所有对象类型的 DDL。
- 显式事务中，无法嵌套其他显式事务，例如 `START TRANSACTIONS` 之后再遇到 `START TRANSACTIONS`，两个 `START TRANSACTIONS` 之间的所有语句都会强制提交，无论 `AUTOCOMMIT` 的值是 1 或 0。
- 显式事务中，不能存在 `SET` 命令与管理类命令（`CREATE USER/ROLE` 或 `GRANT`），只能包含 DML 与 DDL。
- 显式事务中，如果在未发生显式提交或回滚而开启一个新事务而发生写写冲突，之前未提交的事务将会回滚并报错。

## 与 MySQL 显式事务的区别

|事务类型|开启自动提交|关闭自动提交|
|---|---|---|
|显式事务与自动提交|当 `AUTOCOMMIT=1` 时，MySQL不会对事务进行任何更改，每个语句都会在一个新的自动提交事务中执行。|当 `AUTOCOMMIT=0` 时，每个语句都会在显式开启的事务中执行，直到显式提交或回滚事务。|
|显式事务与非自动提交|当 `AUTOCOMMIT=1` 时，MySQL会在每个语句执行后自动提交未提交的事务。|当 `AUTOCOMMIT=0` 时，每个语句都会在显式开启的事务中执行，直到显式提交或回滚事务。|

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

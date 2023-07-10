# 显式事务

在 MatrixOne 的事务类别中，显式事务还遵循以下规则：

## 显式事务规则

- 显式事务是指以 `BEGIN...END` 或 `START TRANSACTION...COMMIT` 或 `ROLLBACK` 作为起始结束。
- 在显式事务中，DML（Data Manipulation Language，数据操纵语言）与 DDL（Data Definition Language，数据库定义语言）可以同时存在，支持所有对象类型的 DDL。
- 显式事务中，无法嵌套其他显式事务，例如 `START TRANSACTIONS` 之后再遇到 `START TRANSACTIONS`，两个 `START TRANSACTIONS` 之间的所有语句都会强制提交，无论 `AUTOCOMMIT` 的值是 1 或 0。
- 显式事务中，只能包含 DML 与 DDL，不能带有修改参数配置或管理命令，如 `set [parameter] = [value]`，`create user` 等等。
- 显式事务中，如果在未发生显式提交或回滚而开启一个新事务而发生写写冲突，之前未提交的事务将会回滚并报错。

## 显式事务示例

```
CREATE TABLE t1(a bigint, b varchar(10), c varchar(10));
START TRANSACTION;
INSERT INTO t1 values(1,2,3);
COMMIT;
```

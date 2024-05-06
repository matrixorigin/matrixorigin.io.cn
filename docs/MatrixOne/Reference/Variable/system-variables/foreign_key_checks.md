# 外键约束检查

在 MatrixOne 中，`foreign_key_checks` 是一个系统变量，用于控制外键约束的检查。这个变量可以是全局的，也可以是会话级别的。当设置为 1（默认值）时，MatrixOne 会检查外键约束的完整性，确保数据的参照完整性。如果设置为 0，则跳过这些检查。

!!! note
    与 MySQL 行为不一致的是，当关闭外键约束检查时，删除父表，MySQL 不会删除子表引用父表的外键关系，但 MatrixOne 会删除子表引用父表的外键关系，重建父表后会重新建立外键关系。

## 查看 foreign_key_checks

在 MatrixOne 中使用以下命令查看 foreign_key_checks：

```sql

--全局模式
SELECT @@global.foreign_key_checks;
SHOW global VARIABLES LIKE 'foreign_key_checks';

--会话模式
SELECT @@session.foreign_key_checks;
SHOW session VARIABLES LIKE 'foreign_key_checks';
```

## 设置 foreign_key_checks

在 MatrixOne 中使用以下命令设置 foreign_key_checks：

```sql
--全局模式，重新连接数据库生效
set global foreign_key_checks = 'xxx' 

--会话模式
set session foreign_key_checks = 'xxx'
```

## 示例

```sql
mysql>  SELECT @@session.foreign_key_checks;
+----------------------+
| @@foreign_key_checks |
+----------------------+
| 1                    |
+----------------------+
1 row in set (0.00 sec)

create table t2(a int primary key,b int);
create table t1( b int, constraint `c1` foreign key `fk1` (b) references t2(a));

insert into t2 values(1,2);
mysql> insert into t1 values(3);--开启外键约束检查时，不能插入违反约束的值
ERROR 20101 (HY000): internal error: Cannot add or update a child row: a foreign key constraint fails

mysql> drop table t2;--开启外键约束检查时，不能删除父表
ERROR 20101 (HY000): internal error: can not drop table 't2' referenced by some foreign key constraint

set session foreign_key_checks =0;--关闭外键约束检查
mysql>  SELECT @@session.foreign_key_checks;
+----------------------+
| @@foreign_key_checks |
+----------------------+
| 0                    |
+----------------------+
1 row in set (0.00 sec)

mysql> insert into t1 values(3);--关闭外键约束检查时，可以插入违反约束的值
Query OK, 1 row affected (0.01 sec)

mysql> drop table t2;--关闭外键约束检查时，可以删除父表，
Query OK, 0 rows affected (0.02 sec)

mysql> show create table t1;--删除父表，外键约束也被删除
+-------+--------------------------------------------+
| Table | Create Table                               |
+-------+--------------------------------------------+
| t1    | CREATE TABLE `t1` (
`b` INT DEFAULT NULL
) |
+-------+--------------------------------------------+
1 row in set (0.00 sec)

mysql> create table t2(n1 int);--重建被删除的父表 t2，需包含子表原外键引用列
ERROR 20101 (HY000): internal error: column 'a' no exists in table ''

mysql> create table t2(n1 int,a int primary key);--包含被引用的主键列 a，重建成功
Query OK, 0 rows affected (0.01 sec)

mysql> show create table t1;--重建 t2 后，外键关系会自动重新建立
+-------+-------------------------------------------------------------------------------------------------------------------------------------------+
| Table | Create Table                                                                                                                              |
+-------+-------------------------------------------------------------------------------------------------------------------------------------------+
| t1    | CREATE TABLE `t1` (
`b` INT DEFAULT NULL,
CONSTRAINT `c1` FOREIGN KEY (`b`) REFERENCES `t2` (`a`) ON DELETE RESTRICT ON UPDATE RESTRICT
) |
+-------+-------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)



```

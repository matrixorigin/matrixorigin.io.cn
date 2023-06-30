# PRIMARY KEY 主键约束

PRIMARY KEY 约束可用于确保表内的每一数据行都可以由某一个键值唯一地确定。
并且每个数据库表上最多只能定义一个 `PRIMARY KEY` 约束。

## 语法说明

```
> column_name data_type PRIMARY KEY;
```

## 示例

```sql
mysql> create table t1(a int primary key, b int, c int, primary key(b,c));
ERROR 20301 (HY000): invalid input: more than one primary key defined
mysql> create table t2(a int, b int, c int, primary key(b,c));
Query OK, 0 rows affected (0.01 sec)

mysql> create table t3(a int, b int, c int, primary key(a));
Query OK, 0 rows affected (0.02 sec)

mysql> insert into t2 values(1,1,1);
Query OK, 1 row affected (0.02 sec)

mysql> insert into t2 values(1,1,2);
Query OK, 1 row affected (0.01 sec)

mysql> insert into t3 values(1,1,1);
Query OK, 1 row affected (0.01 sec)

mysql> insert into t3 values(2,1,1);
Query OK, 1 row affected (0.01 sec)
```

**示例解释**：在上述示例中，t1 包含了两组主键，因此创建失败。t2 和 t3 只有一组主键，因此可以创建。四条插入语句都没有违反约束，均可成功执行。

## 限制

MatrixOne 暂不支持删除 `PRIMARY KEY` 约束。

# PRIMARY KEY 主键约束

PRIMARY KEY 约束可用于确保表内的每一数据行都可以由某一个键值唯一地确定。
并且每个数据库表上最多只能定义一个 `PRIMARY KEY` 约束。

**遵循规则**

定义主键时，需要遵守下列规则：

- **唯一性：** 主键列的值必须是唯一的，即表中的每一行都必须具有不同的主键值。

- **非空性：** 主键列的值不能为空，即它们不能包含 NULL 值。

- **不可更改性：** 主键列的值在插入后不能被更改或更新。这是为了保持主键的唯一性。如果确实需要更改主键值，通常需要先删除原始行，然后插入具有新主键值的新行。

- **最小性：** 主键可以由单个列或多个列组合而成。复合主键可以用于唯一标识行，但它们的复合值必须唯一，不能存在重复组合。

- **引用完整性：** 主键通常用作外键（Foreign Key）的引用。

- **自动创建索引：** 主键列会自动创建索引，以提高检索性能。

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

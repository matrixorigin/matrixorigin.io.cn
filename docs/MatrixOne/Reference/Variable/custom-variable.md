# 自定义变量

在 MatrixOne 中，自定义变量是一种用于存储和操作值的机制。自定义变量可以通过 `SET` 语句设置，并且可以在整个会话期间保持值不变。你可以通过 `SET` 命令进行变量的自定义，并且在 SQL 中使用。具体语法如下：

```sql
SET @variable_name = value;
```

`@variable_name` 是自定义变量的名称，`value` 是要分配给该变量的值。一旦定义了变量，可以在 SQL 语句中使用它来代替实际的值。

例如，以下语句将定义一个名为 `@max_salary` 的变量，并将其设置为 100000：

```sql
SET @max_salary = 100000;
-- 查看 @max_salary 变量设置的值
mysql> select @max_salary;
+-------------+
| @max_salary |
+-------------+
|      100000 |
+-------------+
1 row in set (0.01 sec)
```

在使用自定义变量时，可以将其包含在 SQL 语句中，使用 `@variable_name` 的形式引用。例如，以下语句将返回所有薪水小于 `@max_salary` 的员工记录：

```sql
SELECT * FROM employees WHERE salary < @max_salary;
```

可以通过更改自定义变量的值来影响 SQL 查询的结果。例如，以下语句将更改 `@max_salary` 的值，并返回新的查询结果：

```sql
SET @max_salary = 80000;
SELECT * FROM employees WHERE salary < @max_salary;
```

需要注意的是，自定义变量只在当前会话中保持有效，当会话结束时，变量将被删除并释放。此外，变量名必须以 `@` 符号开头，并且大小写敏感。

## 简单示例

现在以定义两个变量 a 和 b 为例：

```
> SET  @a=2, @b=3;
Query OK, 0 rows affected (0.00 sec)

> select @a;
+------+
| @a   |
+------+
|    2 |
+------+
1 row in set (0.00 sec)

> select @b;
+------+
| @b   |
+------+
|    3 |
+------+
1 row in set (0.00 sec)
```

在 SQL 中使用自定义变量：

```
> create table t1(a int,b varchar(1));
Query OK, 0 rows affected (0.02 sec)

> insert into t1 values(@a,@b);
Query OK, 1 row affected (0.02 sec)

> select * from t1;
+------+------+
| a    | b    |
+------+------+
|    2 | 3    |
+------+------+
1 row in set (0.01 sec)
```

!!! note
    变量 a 和 b 在此处都是 int 数据类型，如果想要一个字符串的 2 或 3，建议使用 `SET  @a='2', @b='3';`。

## MySQL 兼容性

MatrixOne 支持会话级别，与 MySQL 支持情况相同。

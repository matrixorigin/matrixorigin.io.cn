# 自定义变量

在 MatrixOne 中，你可以通过 `SET` 命令进行变量的自定义，并且在 SQL 中使用。具体语法如下：

```sql
SET variable = expr, [variable = expr ..,]
```

## 示例

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

# **DIV**

## **运算符说明**

`DIV` 运算符用于整数除法，截断小数部分只保留整数部分。

从 v3.0.13 开始，`DIV` 直接支持有符号/无符号整数类型以及 `DECIMAL(64)` /
`DECIMAL(128)`。对于 DECIMAL 入参，MatrixOne 会先对齐两侧的 scale，再做
截断整数除法，返回 `BIGINT` 范围内的整数。当结果超出 `BIGINT` 范围时会
报错。被除数为零（整数或 DECIMAL）时返回 `NULL`。

## **语法结构**

```
> SELECT value1 DIV value2;
```

```
> SELECT column1 DIV column2... FROM table_name;
```

## **示例**

```sql
mysql> SELECT 5 DIV 2, -5 DIV 2, 5 DIV -2, -5 DIV -2;
+---------+----------+----------+-----------+
| 5 div 2 | -5 div 2 | 5 div -2 | -5 div -2 |
+---------+----------+----------+-----------+
|       2 |       -2 |       -2 |         2 |
+---------+----------+----------+-----------+
1 row in set (0.00 sec)
```

```sql
create table t2(c1 int, c2 int);
insert into t2 values (-3, 2);
insert into t2 values (1, 2);

mysql> select c1 DIV 3 from t2;
+----------+
| c1 div 3 |
+----------+
|       -1 |
|        0 |
+----------+
2 rows in set (0.00 sec)

mysql> select c1 DIV c2 from t2;
+-----------+
| c1 div c2 |
+-----------+
|        -1 |
|         0 |
+-----------+
2 rows in set (0.00 sec)
```

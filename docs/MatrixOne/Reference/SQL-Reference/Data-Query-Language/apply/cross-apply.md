# **CROSS APPLY**

## **语法说明**

`CROSS APPLY` 是 MatrixOne 中的一个特殊连接操作符，主要用于将一个表的每一行与另一个返回结果集的表函数（如表值函数）进行连接。与 JOIN 不同，CROSS APPLY 允许右侧的子查询或表值函数依赖于左侧表的每一行，从而为每一行返回不同的结果。

## **语法结构**

```
> SELECT <columns>
FROM <table_name>
CROSS APPLY <table_function> <alias>;
```

## **示例**

```sql
mysql> create table t1(a int, b int);
Query OK, 0 rows affected (0.03 sec)

mysql> insert into t1 values(1,3),(1,-1);
Query OK, 2 rows affected (0.00 sec)

mysql> select * from t1 cross apply generate_series(t1.a,t1.b,1)g;
+------+------+--------+
| a    | b    | result |
+------+------+--------+
|    1 |    3 |      1 |
|    1 |    3 |      2 |
|    1 |    3 |      3 |
+------+------+--------+
3 rows in set (0.02 sec)
```

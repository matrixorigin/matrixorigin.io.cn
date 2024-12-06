# **OUTER APPLY**

## **语法说明**

`OUTER APPLY` 是用来将主表的每一行与一个函数或子查询的结果动态关联的。（右侧内容可以基于主表的行动态生成）。与 [`CROSS APPLY`](./cross-apply.md) 不同的是，即使右侧没有数据，也不会丢弃主表的记录，只是右侧列用 NULL 填充。（类似 LEFT JOIN 的效果，但右侧是动态生成的数据）。

## **语法结构**

```
> SELECT <columns>
FROM <table_name>
outer APPLY <table_function><alias>;
```

## **示例**

```sql
mysql> create table t1(a int, b int);
Query OK, 0 rows affected (0.03 sec)

mysql> insert into t1 values(1,3),(1,-1);
Query OK, 2 rows affected (0.00 sec)

mysql> select * from t1 outer apply generate_series(t1.a,t1.b,1)g;
+------+------+--------+
| a    | b    | result |
+------+------+--------+
|    1 |    3 |      1 |
|    1 |    3 |      2 |
|    1 |    3 |      3 |
|    1 |   -1 |   NULL |
+------+------+--------+
4 rows in set (0.01 sec)
```

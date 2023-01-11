# **AND,&&**

## **运算符说明**

`AND,&&` 逻辑运算符用作于*逻辑与*运算。如果所有操作数都非零且不为 `NULL`，则返回结果为 `true`；如果一个或多个操作数为 0，则返回结果为 `false`；如果一个或多个操作数非零且为 `NULL`，则返回 `NULL`。

## **语法结构**

```
> SELECT column_1 AND column_2 FROM table_name;
```

## **示例**

```sql
mysql> select 1 and 1;
+---------+
| 1 and 1 |
+---------+
| true    |
+---------+
mysql> select 1 and 0;
+---------+
| 1 and 0 |
+---------+
| false   |
+---------+
mysql> select 1 and null;
+------------+
| 1 and null |
+------------+
| NULL       |
+------------+
mysql> select null and 0;
+------------+
| null and 0 |
+------------+
| false      |
+------------+
1 row in set (0.01 sec)
```

```sql
create table t1 (a boolean,b bool);
insert into t1 values (0,1),(true,false),(true,1),(0,false),(NULL,NULL);
mysql> select a and b from t1;
+---------+
| a and b |
+---------+
| false   |
| false   |
| true    |
| false   |
| NULL    |
+---------+
5 rows in set (0.00 sec)
```

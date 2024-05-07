# **NOT,!**

## **运算符说明**

`NOT,!` 逻辑运算符用作于*逻辑非*运算。如果操作数为零，则返回结果为 `true`；如果操作数非零，则返回结果为 `false`；如果操作数为 `NOT NUL` 则返回 `NULL`。

## **语法结构**

```
> NOT|! value
```

## **示例**

```sql
mysql> select not 0;
+-------+
| not 0 |
+-------+
| true  |
+-------+
1 row in set (0.02 sec)

mysql> select ! null;
+-------+
| !null |
+-------+
| NULL  |
+-------+
1 row in set (0.00 sec)

mysql> select ! 1;
+-------+
| !1    |
+-------+
| false |
+-------+
1 row in set (0.01 sec)
```

```sql
create table t1 (a boolean,b bool);
insert into t1 values (0,1),(true,false),(true,1),(0,false),(NULL,NULL);
mysql> SELECT * FROM T1;
+-------+-------+
| a     | b     |
+-------+-------+
| false | true  |
| true  | false |
| true  | true  |
| false | false |
| NULL  | NULL  |
+-------+-------+
5 rows in set (0.01 sec)

mysql> select not a and not b from t1;
+-----------------+
| not a and not b |
+-----------------+
| false           |
| false           |
| false           |
| true            |
| NULL            |
+-----------------+
5 rows in set (0.00 sec)

mysql> select * from t1 where !(a=false);
+------+-------+
| a    | b     |
+------+-------+
| true | false |
| true | true  |
+------+-------+
2 rows in set (0.00 sec)
```

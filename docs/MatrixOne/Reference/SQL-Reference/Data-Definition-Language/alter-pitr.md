# **ALTER PITR**

## **语法说明**

`ALTER PITR` 用于更改 PITR。

## **语法结构**

```
> ALTER PITR <pitr_name> RANGE <value> <unit>
```

## **示例**

```sql
drop table if exists t1;
create table t1 (a int);
insert into t1 values(1),(2),(3),(4);
create view v5 as select * from t1;

mysql> select * from v5;
+------+
| a    |
+------+
|    1 |
|    2 |
|    3 |
|    4 |
+------+
4 rows in set (0.01 sec)

alter view v5 as select * from t1 where a=1;

mysql> select * from v5;
+------+
| a    |
+------+
|    1 |
+------+
1 row in set (0.01 sec)

alter view v5 as select * from t1 where a > 2;

mysql> select * from v5;
+------+
| a    |
+------+
|    3 |
|    4 |
+------+
2 rows in set (0.00 sec)
```

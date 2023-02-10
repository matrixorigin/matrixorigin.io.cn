# **INSERT**

## **语法描述**

`INSERT` 用于在表中插入新行。

## **语法结构**

```
> INSERT INTO [db.]table [(c1, c2, c3)] VALUES (v11, v12, v13), (v21, v22, v23), ...
```

## **示例**

```sql
drop table if exists t1;
create table t1(a int default (1+12), b int);
insert into t1(b) values(1), (1);

mysql> select * from t1;
+------+------+
| a    | b    |
+------+------+
|   13 |    1 |
|   13 |    1 |
+------+------+
2 rows in set (0.01 sec)

drop table if exists t1;
create table t1 (a date);
insert into t1 values(DATE("2017-06-15 09:34:21")),(DATE("2019-06-25 10:12:21")),(DATE("2019-06-25 18:20:49"));

mysql> select * from t1;
+------------+
| a          |
+------------+
| 2017-06-15 |
| 2019-06-25 |
| 2019-06-25 |
+------------+
3 rows in set (0.00 sec)

drop table if exists t;
CREATE TABLE t (i1 INT, d1 DOUBLE, e2 DECIMAL(5,2));
INSERT INTO t VALUES ( 6, 6.0, 10.0/3), ( null, 9.0, 10.0/3), ( 1, null, 10.0/3), ( 2, 2.0, null );

mysql> select * from t;
+------+------+------+
| i1   | d1   | e2   |
+------+------+------+
|    6 |    6 | 3.33 |
| NULL |    9 | 3.33 |
|    1 | NULL | 3.33 |
|    2 |    2 | NULL |
+------+------+------+
4 rows in set (0.01 sec)
```

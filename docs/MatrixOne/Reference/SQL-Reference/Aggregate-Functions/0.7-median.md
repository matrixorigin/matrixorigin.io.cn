# **MEDIAN()**

## **函数说明**

`MEDIAN()` 用于返回一组数值的中值，即将一组数值排序后返回居于中间的数值。如果参数集合中包含偶数个数值，该函数将返回位于中间的两个数的平均值。可以将其用作聚合或分析函数。

## **函数语法**

```
> MEDIAN(expr)
```

## **参数释义**

|  参数   | 说明  |
|  ----  | ----  |
| expr | 必要参数。指定要求中值的数组名称，参数类型属于数值数据类型或可以隐式转换为数字数据类型。 |

## **返回类型**

该函数返回与参数的数值数据类型相同的数据类型。

## **示例**

```sql
mysql> select median(null);
+--------------+
| median(null) |
+--------------+
|         NULL |
+--------------+
1 row in set (0.00 sec)

drop table if exists t1;
create table t1 (a int,b int);
insert into t1 values (1,null);

mysql> select median(b) from t1;
+-----------+
| median(b) |
+-----------+
|      NULL |
+-----------+
1 row in set (0.01 sec)

insert into t1 values (1,1);

mysql> select median(b) from t1;
+-----------+
| median(b) |
+-----------+
|         1 |
+-----------+
1 row in set (0.01 sec)

insert into t1 values (1,2);

mysql> select median(b) from t1;
+-----------+
| median(b) |
+-----------+
|       1.5 |
+-----------+
1 row in set (0.01 sec)

mysql> select median(b) from t1 group by a order by a;
+-----------+
| median(b) |
+-----------+
|       1.5 |
+-----------+
1 row in set (0.00 sec)

insert into t1 values (2,1),(2,2),(2,3),(2,4);

mysql> select median(b) from t1 group by a order by a;
+-----------+
| median(b) |
+-----------+
|       1.5 |
|       2.5 |
+-----------+
2 rows in set (0.01 sec)
```

# **ceiling()**

## **函数说明**

ceiling(X) 函数返回不小于 X 的最小整数。[`ceil()`](ceil.md) 同义。

## **函数语法**

```
> ceiling(X)
```

## **参数释义**

|  参数   | 说明  |
|  ----  | ----  |
| X | 必要参数，可取任意数值数据类型 |

对 int 类的绝对数值类型，返回值也是相同的绝对数值类型。对浮点数来说，返回值也是浮点数。

## **示例**

```sql
drop table if exists t1;
create table t1(a int ,b float);
insert into t1 values(1,0.5);
insert into t1 values(2,0.499);
insert into t1 values(3,0.501);
insert into t1 values(4,20.5);
insert into t1 values(5,20.499);
insert into t1 values(6,13.500);
insert into t1 values(7,-0.500);
insert into t1 values(8,-0.499);
insert into t1 values(9,-0.501);
insert into t1 values(10,-20.499);
insert into t1 values(11,-20.500);
insert into t1 values(12,-13.500);

mysql> select a,ceiling(b) from t1;
+------+------------+
| a    | ceiling(b) |
+------+------------+
|    1 |          1 |
|    2 |          1 |
|    3 |          1 |
|    4 |         21 |
|    5 |         21 |
|    6 |         14 |
|    7 |         -0 |
|    8 |         -0 |
|    9 |         -0 |
|   10 |        -20 |
|   11 |        -20 |
|   12 |        -13 |
+------+------------+
12 rows in set (0.00 sec)

mysql> select sum(ceiling(b)) from t1;
+-----------------+
| sum(ceiling(b)) |
+-----------------+
|               6 |
+-----------------+
1 row in set (0.01 sec)
```

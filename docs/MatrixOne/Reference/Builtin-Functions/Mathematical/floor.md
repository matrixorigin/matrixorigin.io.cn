# **FLOOR()**

## **函数说明**

`FLOOR()`函数返回不大于某个数字的相应数位的数。

## **函数语法**

```
> FLOOR(number, decimals)
> FLOOR(number)
```

## **参数释义**

|  参数  | 说明  |
|  ----  | ----  |
| number | 必要参数，任何当前支持的数值数据 |
| decimals| 可选参数，代表小数点后的位数。默认值为 0，代表四舍五入为整数，当为负数时四舍五入到小数点前的数位。|

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

mysql> select a,floor(b) from t1;
+------+----------+
| a    | floor(b) |
+------+----------+
|    1 |        0 |
|    2 |        0 |
|    3 |        0 |
|    4 |       20 |
|    5 |       20 |
|    6 |       13 |
|    7 |       -1 |
|    8 |       -1 |
|    9 |       -1 |
|   10 |      -21 |
|   11 |      -21 |
|   12 |      -14 |
+------+----------+
12 rows in set (0.01 sec)

mysql> select sum(floor(b)) from t1;
+---------------+
| sum(floor(b)) |
+---------------+
|            -6 |
+---------------+
1 row in set (0.00 sec)

mysql> select a,sum(floor(b)) from t1 group by a order by a;
+------+---------------+
| a    | sum(floor(b)) |
+------+---------------+
|    1 |             0 |
|    2 |             0 |
|    3 |             0 |
|    4 |            20 |
|    5 |            20 |
|    6 |            13 |
|    7 |            -1 |
|    8 |            -1 |
|    9 |            -1 |
|   10 |           -21 |
|   11 |           -21 |
|   12 |           -14 |
+------+---------------+
12 rows in set (0.00 sec)
```

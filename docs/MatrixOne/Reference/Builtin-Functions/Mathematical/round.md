# **ROUND()**

## **函数说明**

`ROUND()`函数返回了某个数字在特定位数四舍五入后的数值。
该函数返回指定位数上最接近的数字。如果给定的数字与周围的数字距离相等（比如为5），那么将采用“banker's rounding”（银行进位法）的方式进行舍入。

## **函数语法**

```
> ROUND(number, decimals)
> ROUND(number)
```

## **参数释义**

|  参数   | 说明  |
|  ----  | ----  |
| number | 必要参数，想要进行舍入的数值，可取任意数值数据类型 |
| decimals| 可选参数，表示将要舍入的小数点后的位数。默认值为0，代表舍入到整数。 <br> **decimals>0** 函数将舍入到小数点后的位数 <br> **decimals<0** 函数将舍入到小数点前的位数 <br> **decimals=0** 函数将舍入到整数|

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

mysql> select a,round(b) from t1;
+------+----------+
| a    | round(b) |
+------+----------+
|    1 |        0 |
|    2 |        0 |
|    3 |        1 |
|    4 |       20 |
|    5 |       20 |
|    6 |       14 |
|    7 |       -0 |
|    8 |       -0 |
|    9 |       -1 |
|   10 |      -20 |
|   11 |      -20 |
|   12 |      -14 |
+------+----------+
12 rows in set (0.00 sec)

mysql> select a,round(b,-1) from t1;
+------+--------------+
| a    | round(b, -1) |
+------+--------------+
|    1 |            0 |
|    2 |            0 |
|    3 |            0 |
|    4 |           20 |
|    5 |           20 |
|    6 |           10 |
|    7 |           -0 |
|    8 |           -0 |
|    9 |           -0 |
|   10 |          -20 |
|   11 |          -20 |
|   12 |          -10 |
+------+--------------+
12 rows in set (0.01 sec)

mysql> select round(a*b) from t1;
+--------------+
| round(a * b) |
+--------------+
|            0 |
|            1 |
|            2 |
|           82 |
|          102 |
|           81 |
|           -4 |
|           -4 |
|           -5 |
|         -205 |
|         -226 |
|         -162 |
+--------------+
12 rows in set (0.01 sec)
```

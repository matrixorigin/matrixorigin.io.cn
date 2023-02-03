# **POWER()**

## **函数说明**

POWER(X，Y) 返回 X 的 Y 次方指数值。

## **函数语法**

```
> POWER(X, Y)
```

## **参数释义**

|  参数   | 说明  |
|  ----  | ----  |
| X | 必要参数，任何当前支持的数值数据 |
| Y | 必要参数，任何当前支持的数值数据 |

## **示例**

````sql
drop table if exists t1;
create table t1(a int,b int);
insert into t1 values(5,-2),(10,3),(100,0),(4,3),(6,-3);

mysql> select power(a,b) from t1;
+----------------------+
| power(a, b)          |
+----------------------+
|                 0.04 |
|                 1000 |
|                    1 |
|                   64 |
| 0.004629629629629629 |
+----------------------+
5 rows in set (0.01 sec)

mysql> select power(a,2) as a1, power(b,2) as b1 from t1 where power(a,2) > power(b,2) order by a1 asc;
+-------+------+
| a1    | b1   |
+-------+------+
|    16 |    9 |
|    25 |    4 |
|    36 |    9 |
|   100 |    9 |
| 10000 |    0 |
+-------+------+
5 rows in set (0.01 sec)
```

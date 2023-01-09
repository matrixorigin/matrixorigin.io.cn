# **ABS()**

## **函数说明**

ABS(X) 返回 X 的绝对值，或者 NULL 如果 X 是 NULL.

## **函数语法**

```
> ABS(number)
```

## **参数释义**

|  参数   | 说明  |
|  ----  | ----  |
| number | 必要参数，可取任意数值数据类型 |

返回值类型与输入类型保持一致。

## **示例**

```sql
drop table if exists t1;
create table t1(a int,b float);
insert into t1 values(1,-3.1416);
insert into t1 values(-1,1.57);

mysql> select abs(a),abs(b) from t1;
+--------+--------------------+
| abs(a) | abs(b)             |
+--------+--------------------+
|      1 | 3.1415998935699463 |
|      1 | 1.5700000524520874 |
+--------+--------------------+
2 rows in set (0.01 sec)
```

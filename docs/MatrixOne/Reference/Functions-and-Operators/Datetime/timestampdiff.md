# **TIMESTAMPDIFF()**

## **函数说明**

`TIMESTAMPEDIFF()` 返回一个整数，表示在给定的时间单位内，从第一个日期时间表达式到第二个日期时间表达式之间的时间间隔。即 `datetime_expr2` 与 `datetime_expr1` 的差值。`datetime_expr1` 和 `datetime_expr2` 是日期或日期时间表达式；一个表达式可以是日期，另一个表达式可以是日期时间，日期值被视为具有时间部分 “00:00:00” 的日期时间。

如果 `datetime_expr1` 或 `datetime_expr2` 为 `NULL`，则此函数返回 `NULL`。


Returns datetime_expr2 − datetime_expr1, where datetime_expr1 and datetime_expr2 are date or datetime expressions. One expression may be a date and the other a datetime; a date value is treated as a datetime having the time part '00:00:00' where necessary. The unit for the result (an integer) is given by the unit argument. The legal values for unit are the same as those listed in the description of the TIMESTAMPADD() function.

This function returns NULL if datetime_expr1 or datetime_expr2 is NULL.

## **函数语法**

```
> TIMESTAMPDIFF(unit,datetime_expr1,datetime_expr2)
```

## **参数释义**

|  参数   | 说明  |
|  ----  | ----  |
|  unit| 是一个字符串，表示时间间隔的单位。这可以是 `MICROSECOND`、`SECOND`、`MINUTE`、`HOUR`、`DAY`、`WEEK`、`MONTH` 或 `YEAR` 等。 |
| datetime_expr1,datetime_expr2  | 必要参数。datetime_expr1 和 datetime_expr2 表达式需要具有相同的类型。datetime_expr1 和 datetime_expr2 是转换为 `TIME` 或 `DATETIME` 表达式的字符串。如果 datetime_expr1 或 datetime_expr2 为 `NULL` 则返回 `NULL`。 |

## **示例**

- 示例 1：

```sql
mysql> SELECT TIMESTAMPDIFF( MICROSECOND, '2017-12-01 12:15:12','2018-01-01 7:18:20');
+---------------------------------------------------------------------+
| timestampdiff(microsecond, 2017-12-01 12:15:12, 2018-01-01 7:18:20) |
+---------------------------------------------------------------------+
|                                                       2660588000000 |
+---------------------------------------------------------------------+
1 row in set (0.00 sec)
```

- 示例 2：

```sql
drop table if exists t1;
create table t1(a date,  b date);
insert into t1 values('2019-11-01 12:15:12', '2018-01-01 12:15:12');
insert into t1 values('2019-10-01 12:15:12', '2018-01-01 12:15:12');
insert into t1 values('2020-10-01 12:15:12', '2018-01-01 12:15:12');
insert into t1 values('2021-11-01 12:15:12', '2018-01-01 12:15:12');
insert into t1 values('2022-01-01 12:15:12', '2018-01-01 12:15:12');
insert into t1 values('2018-01-01 12:15:12', '2019-11-01 12:15:12');
insert into t1 values( '2018-01-01 12:15:12', '2019-10-01 12:15:12');
insert into t1 values( '2018-01-01 12:15:12', '2020-10-01 12:15:12');
insert into t1 values( '2018-01-01 12:15:12', '2021-11-01 12:15:12');
insert into t1 values( '2018-01-01 12:15:12', '2022-01-01 12:15:12');

mysql> SELECT a, b, TIMESTAMPDIFF(MICROSECOND, a, b) from t1;
+------------+------------+----------------------------------+
| a          | b          | timestampdiff(microsecond, a, b) |
+------------+------------+----------------------------------+
| 2019-11-01 | 2018-01-01 |                  -57801600000000 |
| 2019-10-01 | 2018-01-01 |                  -55123200000000 |
| 2020-10-01 | 2018-01-01 |                  -86745600000000 |
| 2021-11-01 | 2018-01-01 |                 -120960000000000 |
| 2022-01-01 | 2018-01-01 |                 -126230400000000 |
| 2018-01-01 | 2019-11-01 |                   57801600000000 |
| 2018-01-01 | 2019-10-01 |                   55123200000000 |
| 2018-01-01 | 2020-10-01 |                   86745600000000 |
| 2018-01-01 | 2021-11-01 |                  120960000000000 |
| 2018-01-01 | 2022-01-01 |                  126230400000000 |
+------------+------------+----------------------------------+
10 rows in set (0.00 sec)
```

# **TO_SECONDS()**

## **函数说明**

`TO_SECONDS(expr)` 函数用于计算给定日期或日期时间 expr 与公元 0 年 1 月 1 日 0 时 0 分 0 秒之间的秒数差。如果 `expr` 是 `NULL`，则返回 `NULL`。

!!! note
    `0000-00-00` 和 `0000-01-01` 日期本身被视为无效。MatrixOne 年份查询应该从 `0001` 年开始。查询 `0000-00-00` 和 `0000-01-01`，`TO_SECONDS()` 返回报错信息：

    ```sql
    mysql> SELECT TO_SECONDS('0000-00-00');
    ERROR 20301 (HY000): invalid input: invalid datatime value 0000-00-00
    mysql> SELECT TO_SECONDS('0000-01-01');
    ERROR 20301 (HY000): invalid input: invalid datatime value 0000-01-01
    ```

与 `TO_DAYS()` 函数相似，例如查询 `SELECT TO_SECONDS('08-10-07');`，MatrixOne 将年份 08 自动补全为 0008，与 MySQL 不同。更多信息，参见[日期中的两位数年份](../../Data-Types/date-time-data-types/year-type.md)。

## **函数语法**

```
> TO_SECONDS(expr)
```

`expr` 是日期时间值，可以是 `DATETIME`、`DATE` 或 `TIMESTAMP` 类型。

## **示例**

```sql
mysql> SELECT TO_SECONDS('0001-01-01');
+------------------------+
| to_seconds(0001-01-01) |
+------------------------+
|               31622400 |
+------------------------+
1 row in set (0.00 sec)

mysql> SELECT TO_SECONDS('2023-07-12 08:30:00');
+---------------------------------+
| to_seconds(2023-07-12 08:30:00) |
+---------------------------------+
|                     63856369800 |
+---------------------------------+
1 row in set (0.00 sec)

mysql> SELECT TO_SECONDS('2007-10-07');
+------------------------+
| to_seconds(2007-10-07) |
+------------------------+
|            63358934400 |
+------------------------+
1 row in set (0.00 sec)

mysql> SELECT TO_SECONDS('97-10-07');
+----------------------+
| to_seconds(97-10-07) |
+----------------------+
|           3085257600 |
+----------------------+
1 row in set (0.00 sec)
```

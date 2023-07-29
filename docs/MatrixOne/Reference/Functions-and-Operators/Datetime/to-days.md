# **TO_DAYS()**

## **函数说明**

`TO_DAYS()` 用于计算给定日期与公历日历的开始日期（0000 年 1 月 1 日）之间的天数差。如果 `date` 是 `NULL`，则返回 `NULL`。

!!! note
    `0000-00-00` 和 `0000-01-01` 该日期本身被视为无效。MatrixOne 年份查询应该从 `0001` 年开始。查询 `0000-00-00` 和 `0000-01-01`，`TO_DAYS()` 返回报错信息：

     ```sql
     mysql> SELECT TO_DAYS('0000-00-00');
     ERROR 20301 (HY000): invalid input: invalid datatime value 0000-00-00
     mysql> SELECT TO_DAYS('0000-01-01');
     ERROR 20301 (HY000): invalid input: invalid datatime value 0000-01-01
     ```

对于日期中的两位数年份，例如查询 `SELECT TO_DAYS('08-10-07');`，MatrixOne 将年份 08 自动补全为 0008，与 MySQL 不同。更多信息，参见[日期中的两位数年份](../../Data-Types/date-time-data-types/two-digit-years-in-dates.md)。

## **函数语法**

```
> TO_DAYS(date)
```

## **示例**

```sql
-- 查询将返回一个整数，表示日期'2023-07-12'与公历日历开始日期之间的天数差。
mysql> SELECT TO_DAYS('2023-07-12');
+---------------------+
| to_days(2023-07-12) |
+---------------------+
|              739078 |
+---------------------+
1 row in set (0.00 sec)

mysql> SELECT TO_DAYS('2008-10-07'), TO_DAYS('08-10-07');
+---------------------+-------------------+
| to_days(2008-10-07) | to_days(08-10-07) |
+---------------------+-------------------+
|              733687 |              3202 |
+---------------------+-------------------+
1 row in set (0.00 sec)
```

# **WEEK()**

## **函数说明**

用于计算给定日期的周数。该函数返回一个整数，表示指定日期所在的周数。如果 `date` 为 `NULL`，则返回 `NULL`。

## **函数语法**

```
> WEEK(date)
```

## **参数释义**

|  参数   | 说明 |
|  ----  | ----  |
| date  | 必要参数。表示要计算周数的日期。 MatrixOne 默认一周的起始日为星期一，返回值的范围为 0 到 53。 |

## **示例**

- 示例 1：

```sql
mysql> SELECT WEEK('2008-02-20');
+------------------+
| week(2008-02-20) |
+------------------+
|                8 |
+------------------+
1 row in set (0.01 sec)
```

- 示例 2：

```sql
drop table if exists t1;
CREATE TABLE t1(c1 DATETIME NOT NULL);
INSERT INTO t1 VALUES('2000-01-01');
INSERT INTO t1 VALUES('1999-12-31');
INSERT INTO t1 VALUES('2000-01-01');
INSERT INTO t1 VALUES('2006-12-25');
INSERT INTO t1 VALUES('2008-02-29');

mysql> SELECT WEEK(c1) FROM t1;
+----------+
| week(c1) |
+----------+
|       52 |
|       52 |
|       52 |
|       52 |
|        9 |
+----------+
5 rows in set (0.00 sec)
```

## **限制**

MatrixOne 的 `WEEK()` 函数仅支持 `date` 参数，不支持可选参数 `[, mode]`，这一点是与 MySQL 是不同的。

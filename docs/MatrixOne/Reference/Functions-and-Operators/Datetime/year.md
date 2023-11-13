# **YEAR()**

## **函数说明**

`YEAR()` 和 `TOYEAR()` 函数返回了给定日期的年份（从 1000 到 9999）。

## **函数语法**

```
> YEAR(date)
> TOYEAR(date)
```

## **参数释义**

|  参数  | 说明  |
|  ----  | ----  |
| date  | 必要参数，需要提取年份的日期 |

## **示例**

```sql
drop table if exists t1;
create table t1(a date, b datetime);
insert into t1 values('20211223','2021-10-22 09:23:23');
insert into t1 values('2021-12-23','2021-10-22 00:23:23');

mysql> select year(a) from t1;
+---------+
| year(a) |
+---------+
|    2021 |
|    2021 |
+---------+
2 rows in set (0.00 sec)
```

```sql
DROP TABLE IF EXISTS t3;
CREATE TABLE t3(c1 DATE NOT NULL);
INSERT INTO t3 VALUES('2000-01-01');
INSERT INTO t3 VALUES('1999-12-31');
INSERT INTO t3 VALUES('2000-01-01');
INSERT INTO t3 VALUES('2006-12-25');
INSERT INTO t3 VALUES('2008-02-29');
mysql> SELECT YEAR(c1) FROM t3;
+----------+
| year(c1) |
+----------+
|     2000 |
|     1999 |
|     2000 |
|     2006 |
|     2008 |
+----------+
5 rows in set (0.01 sec)
```

## **限制**

目前只支持 `yyyy-mm-dd` 和 `yyyymmdd` 的数据格式。

# **CURDATE()**

## **函数说明**

`CURDATE()` 函数返回当前日期的 `YYYY-MM-DD` 格式的值，根据函数是否用在字符串或数字语境中。

!!! note
    与 MySQL 行为不同的是：`curdate()+int` 表示当前日期至 1970-01-01 再加上 `int`（天数）的总天数。比如，`curdate()+1` 表示当前日期减去 1970-01-01 再加 1 天。

## **函数语法**

```
> CURDATE()
```

## **示例**

```sql
mysql> SELECT CURDATE();
+------------+
| curdate()  |
+------------+
| 2023-02-02 |
+------------+
1 row in set (0.00 sec)

mysql> SELECT CURDATE() + 0;
+---------------+
| curdate() + 0 |
+---------------+
|         19390 |
+---------------+
1 row in set (0.00 sec)

mysql> select cast(now() as date)=curdate() q;
+------+
| q    |
+------+
| true |
+------+
1 row in set (0.01 sec)

create table t1 (a int);
insert into t1 values (1),(2),(3);

mysql> select cast(now() as date)=curdate() q from t1;
+------+
| q    |
+------+
| true |
| true |
| true |
+------+
3 rows in set (0.01 sec)
```

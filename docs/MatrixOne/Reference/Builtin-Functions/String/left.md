# **LEFT()**

## **函数说明**

`LEFT()` 函数返回 *str* 字符串中最左边的长度字符。如果 *str* 或 *len* 参数为 `NULL`，则返回 `NULL` 值。

## **函数语法**

```
> LEFT(str,len)
```

## **参数释义**

|  参数   | 说明  |
|  ----  | ----  |
| str | 必要参数。要提取子字符串的字符串。|
| len | 必要参数。是一个正整数，指定将从左边返回的字符数。<br>如果 *len* 为 0 或为负，则 LEFT 函数返回一个空字符串。<br>如果 *len* 大于 *str* 字符串的长度，则 LEFT 函数返回整个 *str* 字符串。|

## **示例**

```SQL
mysql> select left('abcde', 3) from dual;
+----------------+
| left(abcde, 3) |
+----------------+
| abc            |
+----------------+
1 row in set (0.00 sec)

drop table if exists t1;
CREATE TABLE t1 (str VARCHAR(100) NOT NULL, len INT);
insert into t1 values('abcdefghijklmn',3);
insert into t1 values('  ABCDEFGH123456', 3);
insert into t1 values('ABCDEF  GHIJKLMN', 20);
insert into t1 values('ABCDEFGHijklmn   ', -1);
insert into t1 values('ABCDEFGH123456', -35627164);
insert into t1 values('', 3);
mysql> select left(str, len) from t1;
+------------------+
| left(str, len)   |
+------------------+
| abc              |
|   A              |
| ABCDEF  GHIJKLMN |
|                  |
|                  |
|                  |
+------------------+
6 rows in set (0.01 sec)

mysql> select left('sdfsdfsdfsdf', len) from t1;
+-------------------------+
| left(sdfsdfsdfsdf, len) |
+-------------------------+
| sdf                     |
| sdf                     |
| sdfsdfsdfsdf            |
|                         |
|                         |
| sdf                     |
+-------------------------+
6 rows in set (0.01 sec)
```

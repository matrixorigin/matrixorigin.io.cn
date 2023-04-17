# **SUBSTRING_INDEX()**

## **函数说明**

此函数 ``SUBSTRING_INDEX()`` 以分隔符为索引，获取不同索引位的字符。

如果 count 为正，则返回最后一个分隔符左侧（从左侧开始计数）的所有内容。

如果 count 为负数，则返回最后一个分隔符右侧（从右侧开始计数）的所有内容。

如果参数为 `NULL`，`SUBSTRING_INDEX()` 将返回 `NULL`。

## **语法说明**

```
> SUBSTRING_INDEX(str,delim,count)
```

即，substring_index（“待截取有用部分的字符串”，“截取数据依据的字符”，截取字符的位置 N）

## **参数释义**

|  参数   | 说明  |
|  ----  | ----  |
|str|	字符串|
|delim|	分隔符|
|count	|表示 delim 出现次数的整数。 |

## **示例**

```SQL
mysql> SELECT SUBSTRING_INDEX('www.mysql.com', '.', 2);
+--------------------------------------+
| substring_index(www.mysql.com, ., 2) |
+--------------------------------------+
| www.mysql                            |
+--------------------------------------+
1 row in set (0.03 sec)

mysql> select substring_index('xyz', 'abc', 9223372036854775808);
+------------------------------------------------+
| substring_index(xyz, abc, 9223372036854775808) |
+------------------------------------------------+
| xyz                                            |
+------------------------------------------------+
1 row in set (0.02 sec)

mysql> SELECT SUBSTRING_INDEX('www.mysql.com', '.', -2);
+---------------------------------------+
| substring_index(www.mysql.com, ., -2) |
+---------------------------------------+
| mysql.com                             |
+---------------------------------------+
1 row in set (0.02 sec)

mysql> SELECT SUBSTRING_INDEX(SUBSTRING_INDEX('192,168,8,203', ',', 2), ',',-1);
+--------------------------------------------------------------+
| substring_index(substring_index(192,168,8,203, ,, 2), ,, -1) |
+--------------------------------------------------------------+
| 168                                                          |
+--------------------------------------------------------------+
1 row in set (0.02 sec)

create table test(a varchar(100), b varchar(20), c int);
insert into test values('www.mysql.com', '.', 0);
insert into test values('www.mysql.com', '.', 1);
insert into test values('www.mysql.com', '.', 2);
insert into test values('www.mysql.com', '.', 3);
insert into test values('www.mysql.com', '.', 9223372036854775808);
insert into test values('www.mysql.com', '.', -1);
insert into test values('www.mysql.com', '.', -2);
insert into test values('www.mysql.com', '.', -3);
mysql> select SUBSTRING_INDEX(a, b, c) from test;
+--------------------------+
| substring_index(a, b, c) |
+--------------------------+
|                          |
| www                      |
| www.mysql                |
| www.mysql.com            |
| com                      |
| mysql.com                |
| www.mysql.com            |
+--------------------------+
7 rows in set (0.02 sec)
```

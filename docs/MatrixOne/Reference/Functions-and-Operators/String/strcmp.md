# **STRCMP()**

## **函数说明**

`STRCMP()` 函数用于比较两个字符串 *str1* 和 *str2*。如果两个字符串相同，则返回 0；如果根据当前字符集排序，*str1* 小于 *str2*，则返回 -1；如果 *str1* 大于 *str2*，则返回 1。如果任一参数为 `NULL`，则返回 `NULL`。

## **函数语法**

```
> STRCMP(str1, str2)
```

## **参数释义**

|  参数   | 说明  |
|  ----  | ----  |
| str1 | 必要参数。要比较的第一个字符串。|
| str2 | 必要参数。要比较的第二个字符串。|

## **示例**

```SQL
mysql> select strcmp('hello', 'hello') from dual;
+-------------------------+
| strcmp(hello, hello)    |
+-------------------------+
|                       0 |
+-------------------------+
1 row in set (0.00 sec)

mysql> select strcmp('apple', 'banana') from dual;
+---------------------------+
| strcmp(apple, banana)     |
+---------------------------+
|                        -1 |
+---------------------------+
1 row in set (0.00 sec)

mysql> select strcmp('banana', 'apple') from dual;
+---------------------------+
| strcmp(banana, apple)     |
+---------------------------+
|                         1 |
+---------------------------+
1 row in set (0.00 sec)

drop table if exists t1;
CREATE TABLE t1 (str1 VARCHAR(100), str2 VARCHAR(100));
insert into t1 values('hello', 'world');
insert into t1 values('abc', 'ABC');
insert into t1 values('test', 'test');
insert into t1 values(null, 'value');
insert into t1 values('value', null);

mysql> select strcmp(str1, str2) from t1;
+-------------------+
| strcmp(str1, str2) |
+-------------------+
|                -1 |
|                 1 |
|                 0 |
|              NULL |
|              NULL |
+-------------------+
5 rows in set (0.01 sec)
```
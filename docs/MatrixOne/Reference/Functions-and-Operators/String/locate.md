# **LOCATE()**

## **函数说明**

`LOCATE()` 函数是用于在字符串中查找子字符串所在位置的函数。它返回子字符串在字符串中的位置，如果未找到，则返回0。

由于`LOCATE()` 函数返回的是一个整数值，所以它可以嵌套在其他函数里面使用，比如可以用substring函数截取字符串。

关于大小写，`LOCATE()` 函数不区分大小写。

## **函数语法**

```
> LOCATE(subtr,str,pos)
```

## **参数释义**

|  参数   | 说明  |
|  ----  | ----  |
| substr | 必要参数。`substring` 是你正在查找的字符串。|
| str | 必要参数。`string` 是要在其中搜索的字符串。|
| pos | 非必要参数。`position` 是表示开始查询的位置。|

## **示例**

- 示例 1

```sql
mysql> SELECT LOCATE('bar', 'footbarbar');
+-------------------------+
| locate(bar, footbarbar) |
+-------------------------+
|                       5 |
+-------------------------+
1 row in set (0.00 sec)
```

- 示例 2

```sql
mysql>SELECT LOCATE('bar', 'footbarbar',6);
+----------------------------+
| locate(bar, footbarbar, 6) |
+----------------------------+
|                          8 |
+----------------------------+
1 row in set (0.00 sec)
```

- 示例 3

```sql
mysql>SELECT SUBSTRING('hello world',LOCATE('o','hello world'),5);
+---------------------------------------------------+
| substring(hello world, locate(o, hello world), 5) |
+---------------------------------------------------+
| o wor                                             |
+---------------------------------------------------+
1 row in set (0.00 sec)
```

- 示例 4

```sql
mysql>select locate('a','ABC');
+----------------+
| locate(a, ABC) |
+----------------+
|              1 |
+----------------+
1 row in set (0.00 sec)
```
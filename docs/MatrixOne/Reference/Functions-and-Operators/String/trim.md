# **TRIM()**

## **函数说明**

`TRIM()` 函数返回一个字符串，删除不需要的字符。

你可以使用 `LEADING`，`TRAILING` 或 `BOTH` 选项明确指示 `TRIM()` 函数从字符串中删除前导，尾随或前导和尾随的不必要的字符。

如果你没有指定任何内容，`TRIM()` 函数默认使用 `BOTH` 选项。

`[remstr]` 是要删除的字符串。默认是一个空格。即如果不指定特定的字符串，则 `TRIM()` 函数仅删除空格。

## **函数语法**

```
> TRIM([{BOTH | LEADING | TRAILING} [remstr] FROM] str), TRIM([remstr FROM] str)
```

## **参数释义**

|  参数   | 说明  |
|  ----  | ----  |
| str | 必要参数。是要删除子字符 `remstr` 的字符串。 |

## **示例**

```SQL
mysql> select trim(' abc '), trim('abc '), trim(' abc'), trim('abc');
+-------------+------------+------------+-----------+
| trim( abc ) | trim(abc ) | trim( abc) | trim(abc) |
+-------------+------------+------------+-----------+
| abc         | abc        | abc        | abc       |
+-------------+------------+------------+-----------+
1 row in set (0.00 sec)

drop table if exists t1;
create table t1(a varchar(100), b varchar(100));
insert into t1 values('abc', 'abc');
insert into t1 values('啊abc哦', '啊abc哦');
insert into t1 values('啊啊o', 'o');
insert into t1 values('啊啊o', '啊');
insert into t1 values('啊啊o', 'o啊');
mysql> select trim(both a from b) from t1;
+---------------------+
| trim(both a from b) |
+---------------------+
|                     |
|                     |
| o                   |
| 啊                  |
| o啊                 |
+---------------------+
5 rows in set (0.00 sec)

mysql> select trim(leading a from b) from t1;
+------------------------+
| trim(leading a from b) |
+------------------------+
|                        |
|                        |
| o                      |
| 啊                     |
| o啊                    |
+------------------------+
5 rows in set (0.01 sec)

mysql> select trim(trailing a from b) from t1;
+-------------------------+
| trim(trailing a from b) |
+-------------------------+
|                         |
|                         |
| o                       |
| 啊                      |
| o啊                     |
+-------------------------+
5 rows in set (0.00 sec)
```

# **REPEAT()**

## **函数说明**

`REPEAT()` 用于将输入的字符串 `str` 重复 `count` 次，并返回一个新的字符串。如果 `count` 小于 1，则返回一个空字符串。如果 `str` 或 `count` 为 `NULL`，则返回 `NULL`。

## **函数语法**

```
> REPEAT(str,count)
```

## **参数释义**

|  参数   | 说明  |
|  ----  | ----  |
| str | 必要参数。要重复的字符串。|
| count | 必要参数。要重复的次数|

## **示例**

```sql
mysql> SELECT repeat('abc', -1);
+-----------------+
| repeat(abc, -1) |
+-----------------+
|                 |
+-----------------+
1 row in set (0.00 sec)

mysql> SELECT repeat('abc', 1), repeat('abc', 2), repeat('abc', 3);
+----------------+----------------+----------------+
| repeat(abc, 1) | repeat(abc, 2) | repeat(abc, 3) |
+----------------+----------------+----------------+
| abc            | abcabc         | abcabcabc      |
+----------------+----------------+----------------+
1 row in set (0.00 sec)
```

# **LCASE()**

## **函数说明**

`LCASE()` 用于将给定的字符串转换为小写形式，为 [`LOWER()`](lower.md) 的近义词。

## **函数语法**

```
> LCASE(str)
```

## **参数释义**

|  参数   | 说明  |
|  ----  | ----  |
| str | 必要参数，字母字符。|

## **示例**

```sql
mysql> select lcase('HELLO');
+--------------+
| lcase(HELLO) |
+--------------+
| hello        |
+--------------+
1 row in set (0.02 sec)

mysql> select lcase('A'),lcase('B'),lcase('C');
+----------+----------+----------+
| lcase(A) | lcaser(B) | lcase(C) |
+----------+----------+----------+
| a        | b        | c        |
+----------+----------+----------+
1 row in set (0.03 sec)
```

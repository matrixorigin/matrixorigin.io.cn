# **CRC32()**

## **函数说明**

CRC32() 函数用于计算字符串的 CRC32 校验和。如果传递给 CRC32() 的参数是 NULL，则函数返回 NULL。

## **函数语法**

```
> CRC32(string)
```

## **参数释义**

|  参数   | 说明  |
|  ----  | ----  |
| string | 必要参数，要计算 CRC32 校验和的输入字符串 |

## **示例**

```sql
mysql> SELECT CRC32('hello world');
+--------------------+
| CRC32(hello world) |
+--------------------+
|          222957957 |
+--------------------+
1 row in set (0.00 sec)

mysql> SELECT CRC32('HELLOW WORLD');
+---------------------+
| CRC32(HELLOW WORLD) |
+---------------------+
|          1290240849 |
+---------------------+
1 row in set (0.00 sec)

mysql> SELECT CRC32(NULL);
+-------------+
| CRC32(null) |
+-------------+
|        NULL |
+-------------+
1 row in set (0.00 sec)
```

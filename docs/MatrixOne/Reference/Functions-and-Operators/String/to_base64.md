# TO_BASE64()

## 函数说明

`TO_BASE64()` 函数用于将字符串转换为 Base64 编码的字符串。如果参数不是字符串，则会在转换之前将其转换为字符串。如果参数为 NULL，则结果为 NULL。

可以使用 [`FROM_BASE64()`](from_base64.md) 函数对 Base64 编码字符串进行解码。

## 函数语法

```
> TO_BASE64(str)
```

## 参数释义

|  参数   | 说明 |
|  ----  | ----  |
| str | 必要参数。要转换为 Base64 编码的字符串 |

## 示例

```SQL
mysql> SELECT TO_BASE64('abc');
+----------------+
| to_base64(abc) |
+----------------+
| YWJj           |
+----------------+
1 row in set (0.00 sec)

mysql> SELECT TO_BASE64(255);
+----------------+
| to_base64(255) |
+----------------+
| MjU1           |
+----------------+
1 row in set (0.00 sec)

mysql> SELECT TO_BASE64(null);
+-----------------+
| to_base64(null) |
+-----------------+
| NULL            |
+-----------------+
1 row in set (0.01 sec)
```

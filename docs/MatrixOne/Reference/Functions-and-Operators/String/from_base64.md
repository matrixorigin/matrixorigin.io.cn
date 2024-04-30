# FROM_BASE64()

## 函数说明

`FROM_BASE64()` 用于将 Base64 编码的字符串转换回原始的二进制数据（或文本数据）。可以解码使用 [`TO_BASE64()`](to_base64.md) 函数进行 Base64 编码的数据。如果参数为 NULL，则结果为 NULL。

## 函数语法

```
> FROM_BASE64(str)
```

## 参数释义

|  参数   | 说明 |
|  ----  | ----  |
| str | 必要参数。要转换的 Base64 编码的字符串。 |

## 示例

```SQL
mysql> select from_base64('MjU1');
+-------------------+
| from_base64(MjU1) |
+-------------------+
| 255               |
+-------------------+
1 row in set (0.00 sec)

mysql> SELECT TO_BASE64('abc'), FROM_BASE64(TO_BASE64('abc'));
+----------------+-----------------------------+
| to_base64(abc) | from_base64(to_base64(abc)) |
+----------------+-----------------------------+
| YWJj           | abc                         |
+----------------+-----------------------------+
1 row in set (0.00 sec)

mysql> select from_base64(null);
+-------------------+
| from_base64(null) |
+-------------------+
| NULL              |
+-------------------+
1 row in set (0.01 sec)
```


# **JSON_QUOTE()**

## **函数说明**

`JSON_QUOTE` 函数用于将一个字符串值转换为 JSON 格式中的字符串。通过使用双引号包装字符串并转义内引号和其他字符，将字符串作为 JSON 值引用，然后将结果作为 `utf8mb4` 字符串返回。如果参数为 NULL，则返回 NULL。

`JSON_QUOTE` 函数通常用于生成有效的 JSON 字符串，以包含在 JSON 文档中。

## **语法结构**

```
select JSON_QUOTE(string_value);
```

## **参数说明**

`string_value` 是要转换为 JSON 字符串的字符串。该函数返回一个 JSON 格式的字符串，其中原始字符串已被引号包围并进行了适当的转义。

## **示例**

```sql
mysql> SELECT JSON_QUOTE('null'), JSON_QUOTE('"null"');
+------------------+--------------------+
| json_quote(null) | json_quote("null") |
+------------------+--------------------+
| "null"           | "\"null\""         |
+------------------+--------------------+
1 row in set (0.00 sec)
mysql> SELECT JSON_QUOTE('[1, 2, 3]');
+-----------------------+
| json_quote([1, 2, 3]) |
+-----------------------+
| "[1, 2, 3]"           |
+-----------------------+
1 row in set (0.00 sec)

mysql> SELECT JSON_QUOTE('hello world');
+-------------------------+
| json_quote(hello world) |
+-------------------------+
| "hello world"           |
+-------------------------+
1 row in set (0.00 sec)
```

可以看到，原始字符串被引号包围并且字符串中的双引号也被转义了。这样，可以将其用作 JSON 格式的值，例如，将其作为 JSON 对象的属性值。

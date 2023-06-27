# **NOT REGEXP**

## **函数说明**

`NOT REGEXP` 用于测试一个字符串是否不匹配指定的正则表达式。

如果 `column_name` 不匹配 `pattern`，则返回 `TRUE`。如果匹配，则返回 `FALSE`。

## **语法**

```
> column_name NOT REGEXP pattern
```

### 参数释义

- `column_name` 是要匹配的字段。

- `pattern` 是要应用的正则表达式。

## **示例**

```SQL
CREATE TABLE example (
         id INT AUTO_INCREMENT,
         text VARCHAR(255),
         PRIMARY KEY(id)
         );


INSERT INTO example (text)
  VALUES ('Hello1'),
         ('Hello2'),
         ('World'),
         ('HelloWorld'),
         ('Hello_World'),
         ('example'),
         ('example1'),
         ('example2');

mysql> SELECT * FROM example WHERE text NOT REGEXP '[0-9]';
+------+-------------+
| id   | text        |
+------+-------------+
|    3 | World       |
|    4 | HelloWorld  |
|    5 | Hello_World |
|    6 | example     |
+------+-------------+
4 rows in set (0.00 sec)
```

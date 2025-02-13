# **JSON_SET()**

## **函数说明**

`JSON_SET()` 用于在一个 JSON 文档中设置或更新某个键的值。如果该键不存在，JSON_SET 会将其添加到 JSON 文档中。

## **语法结构**

```sql
select json_set(json_doc, path, value[, path, value] ...)
```

## **参数释义**

|  参数   | 说明 |
|  ----  | ----  |
| json_doc  | 要修改的 JSON 文档。|
| path  | 要修改或插入的键路径。|
| value  | 要设置的值。|

## **示例**

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50),
    profile JSON
);

INSERT INTO users (name, profile)
VALUES
('Alice', '{"age": 30, "city": "New York", "email": "alice@example.com"}'),
('Bob', '{"age": 25, "city": "Los Angeles", "email": "bob@example.com"}');

mysql> select * from users;
+------+-------+----------------------------------------------------------------+
| id   | name  | profile                                                        |
+------+-------+----------------------------------------------------------------+
|    1 | Alice | {"age": 30, "city": "New York", "email": "alice@example.com"}  |
|    2 | Bob   | {"age": 25, "city": "Los Angeles", "email": "bob@example.com"} |
+------+-------+----------------------------------------------------------------+
2 rows in set (0.00 sec)

--更新 Alice 的 profile 中的 city 和 email 信息
UPDATE users
SET profile = JSON_SET(profile, '$.city', 'San Francisco', '$.email', 'alice@newdomain.com')
WHERE name = 'Alice';

mysql> SELECT * FROM users WHERE name = 'Alice';
+------+-------+----------------------------------------------------------------------+
| id   | name  | profile                                                              |
+------+-------+----------------------------------------------------------------------+
|    1 | Alice | {"age": 30, "city": "San Francisco", "email": "alice@newdomain.com"} |
+------+-------+----------------------------------------------------------------------+
1 row in set (0.00 sec)

--为 Bob 添加一个新的键 phone 到 profile 中
UPDATE users
SET profile = JSON_SET(profile, '$.phone', '123-456-7890')
WHERE name = 'Bob';

mysql> SELECT * FROM users WHERE name = 'Bob';
+------+------+-----------------------------------------------------------------------------------------+
| id   | name | profile                                                                                 |
+------+------+-----------------------------------------------------------------------------------------+
|    2 | Bob  | {"age": 25, "city": "Los Angeles", "email": "bob@example.com", "phone": "123-456-7890"} |
+------+------+-----------------------------------------------------------------------------------------+
1 row in set (0.00 sec)
```

# **JSON_EXTRACT()**

## **函数说明**

`JSON EXTRACT()` 是一个 JSON 查询函数，可用于查询 JSON 文档。

- 如果在 select 后面作为列，建议使用函数 [JSON_EXTRACT_STRING()](./json_extract_string.md) 和 [JSON_EXTRACT_FLOAT64()](./json_extract_float64.md)；
  
- 如果在 where 条件中进行比较：
    - 如果类型为 json 对象比较，使用 `JSON EXTRACT()`
    - 如果类型是字符串类型，使用 [JSON_EXTRACT_STRING()](./json_extract_string.md)；
    - 如果类型为 float 或者 int，使用 [JSON_EXTRACT_FLOAT64()](./json_extract_float64.md)。

## **语法结构**

```sql
select json_extract(json_doc, path[, path] ...);
```

## **参数释义**

|  参数   | 说明 |
|  ----  | ----  |
| jsonDoc  | 要查询的 JSON 文档或列。|
| path  | 要提取的 JSON 键路径或数组索引。路径以 '$'（表示根）开始，可以使用点表示法（例如：$.key）或数组索引（例如：$[0]）。可以指定多个路径，如果提供多个路径，函数将返回一个包含所有路径对应值的 JSON 数组。|

路径表达式必须以 `$` 字符开头：

- `.` 后跟键名，使用给定键命名对象中的成员。键名需要使用引号包含。

- `[N]`：选择数组的 *path* 后，将数组中位置 `N` 处的值命名。数组位置是从零开始的整数。如果数组是负数，则产生报错。

- 路径可以包含 `*` 或 `**` 通配符：

   + `.[*]` 计算 JSON 对象中所有成员的值。

   + `[*]` 计算 JSON 数组中所有元素的值。

   + `prefix**suffix`：计算以命名前缀开头并以命名后缀结尾的所有路径。

- 文档中不存在的路径（或不存在的数据）评估为 `NULL`。

如下一组 JSON 数组：

```
[3, {"a": [5, 6], "b": 10}, [99, 100]]
```

- `$[0]` 表示 3。

- `$[1]` 表示 {"a": [5, 6], "b": 10}。

- `$[2]` 表示 [99, 100]。

- `$[3]` 为 NULL (数组路径从 `$[0]` 开始，而 `$[3]` 表示第四组数据，这组数据不存在)。

由于 `$[1]` 与 `$[2]` 计算为非标量值，那么表达式可以嵌套。例如：

- `$[1].a` 表示 [5, 6]。

- `$[1].a[1]` 表示 6。

- `$[1].b` 表示 10。

- `$[2][0]` 表示 99。

键名在路径表达式中需要使用双引号。`$` 引用这个键值，也需要加双引号：

```
{"a fish": "shark", "a bird": "sparrow"}
```

这两个键都包含一个空格，必须用引号引起来：

- `$."a fish"` 表示 `shark`。

- `$."a bird"` 表示 `sparrow`。
  
## **示例**

### 示例 1：从简单的 JSON 对象中提取数据

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    data JSON
);

INSERT INTO users (data) VALUES
('{"name": "Alice", "age": 30, "city": "New York"}'),
('{"name": "Bob", "age": 25, "city": "San Francisco"}'),
('{"name": "Charlie", "age": 35, "city": "Los Angeles"}');

mysql> select * from users;
+------+-------------------------------------------------------+
| id   | data                                                  |
+------+-------------------------------------------------------+
|    1 | {"age": 30, "city": "New York", "name": "Alice"}      |
|    2 | {"age": 25, "city": "San Francisco", "name": "Bob"}   |
|    3 | {"age": 35, "city": "Los Angeles", "name": "Charlie"} |
+------+-------------------------------------------------------+
3 rows in set (0.00 sec)

--从简单的 JSON 对象中提取字段 name 和 city：

mysql> SELECT
    ->   JSON_EXTRACT(data, '$.name') AS name,
    ->   JSON_EXTRACT(data, '$.city') AS city
    -> FROM users;
+-----------+-----------------+
| name      | city            |
+-----------+-----------------+
| "Alice"   | "New York"      |
| "Bob"     | "San Francisco" |
| "Charlie" | "Los Angeles"   |
+-----------+-----------------+
3 rows in set (0.00 sec)

-- 使用多个路径来提取多个 JSON 值，返回一个包含这些值的 JSON 数组：
mysql> SELECT
    ->   JSON_EXTRACT(data, '$.name', '$.address.city') AS name_and_city
    -> FROM users;
+---------------+
| name_and_city |
+---------------+
| ["Alice"]     |
| ["Bob"]       |
| ["Charlie"]   |
| ["Alice"]     |
| ["Bob"]       |
| ["Charlie"]   |
+---------------+
6 rows in set (0.00 sec)

```

### 示例 2：从嵌套的 JSON 对象中提取数据

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    data JSON
);

INSERT INTO users (data) VALUES
('{"name": "Alice", "address": {"city": "New York", "zip": "10001"}}'),
('{"name": "Bob", "address": {"city": "San Francisco", "zip": "94101"}}'),
('{"name": "Charlie", "address": {"city": "Los Angeles", "zip": "90001"}}');

mysql> select * from users;
+------+-------------------------------------------------------------------------+
| id   | data                                                                    |
+------+-------------------------------------------------------------------------+
|    1 | {"address": {"city": "New York", "zip": "10001"}, "name": "Alice"}      |
|    2 | {"address": {"city": "San Francisco", "zip": "94101"}, "name": "Bob"}   |
|    3 | {"address": {"city": "Los Angeles", "zip": "90001"}, "name": "Charlie"} |
+------+-------------------------------------------------------------------------+
3 rows in set (0.00 sec)

--从嵌套的 address 对象中提取 city 和 zip 信息：
mysql> SELECT
    ->   JSON_EXTRACT(data, '$.address.city') AS city,
    ->   JSON_EXTRACT(data, '$.address.zip') AS zip
    -> FROM users;
+-----------------+---------+
| city            | zip     |
+-----------------+---------+
| "New York"      | "10001" |
| "San Francisco" | "94101" |
| "Los Angeles"   | "90001" |
+-----------------+---------+
3 rows in set (0.00 sec)

--查找 address 中包含 zip 值为 1001 的对象
mysql> SELECT *
    -> FROM users
    -> WHERE JSON_EXTRACT(data, '$.address.zip') = '"10001"';
+------+--------------------------------------------------------------------+
| id   | data                                                               |
+------+--------------------------------------------------------------------+
|    1 | {"address": {"city": "New York", "zip": "10001"}, "name": "Alice"} |
+------+--------------------------------------------------------------------+
1 row in set (0.00 sec)
```

### 示例 3：提取 JSON 数组中的元素

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    data JSON
);

INSERT INTO users (data) VALUES
('{"name": "Alice", "hobbies": ["reading", "traveling", "swimming"]}'),
('{"name": "Bob", "hobbies": ["gaming", "music", "reading"]}'),
('{"name": "Charlie", "hobbies": ["sports", "movies", "photography"]}');

mysql> select * from users;
+------+---------------------------------------------------------------------+
| id   | data                                                                |
+------+---------------------------------------------------------------------+
|    1 | {"hobbies": ["reading", "traveling", "swimming"], "name": "Alice"}  |
|    2 | {"hobbies": ["gaming", "music", "reading"], "name": "Bob"}          |
|    3 | {"hobbies": ["sports", "movies", "photography"], "name": "Charlie"} |
+------+---------------------------------------------------------------------+
3 rows in set (0.00 sec)

--提取 hobbies 数组中的第一个元素：
mysql> SELECT
    ->   JSON_EXTRACT(data, '$.hobbies[0]') AS first_hobby
    -> FROM users;
+-------------+
| first_hobby |
+-------------+
| "reading"   |
| "gaming"    |
| "sports"    |
+-------------+

--提取 hobbies 数组中的多个元素：
mysql> SELECT
    ->   JSON_EXTRACT(data, '$.hobbies[0]') AS hobby_1,
    ->   JSON_EXTRACT(data, '$.hobbies[1]') AS hobby_2
    -> FROM users;
+-----------+-------------+
| hobby_1   | hobby_2     |
+-----------+-------------+
| "reading" | "traveling" |
| "gaming"  | "music"     |
| "sports"  | "movies"    |
+-----------+-------------+
3 rows in set (0.01 sec)

--提取 hobbies 数组中的所有元素：

mysql> SELECT JSON_EXTRACT(data, '$.hobbies[*]') AS hobby_1 FROM users;
+--------------------------------------+
| hobby_1                              |
+--------------------------------------+
| ["reading", "traveling", "swimming"] |
| ["gaming", "music", "reading"]       |
| ["sports", "movies", "photography"]  |
+--------------------------------------+
3 rows in set (0.01 sec)

--查找 hobbies 数组中包含 "reading" 的对象
mysql> SELECT *
    -> FROM users
    -> WHERE JSON_EXTRACT(data, '$.hobbies') LIKE '%"reading"%';
+------+--------------------------------------------------------------------+
| id   | data                                                               |
+------+--------------------------------------------------------------------+
|    1 | {"hobbies": ["reading", "traveling", "swimming"], "name": "Alice"} |
|    2 | {"hobbies": ["gaming", "music", "reading"], "name": "Bob"}         |
+------+--------------------------------------------------------------------+
2 rows in set (0.00 sec)
```

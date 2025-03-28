# Create Fulltext Index

## 语法说明

MatrixOne 支持全文索引，允许用户对表中的文本数据进行高效的全文检索。全文索引适用于包含 `char`、`varchar`、`text`、`json` 和 `datalink` 数据类型的列，特别适合对英语以及 CJK（中文、日文、韩文）语言的文本数据进行优化搜索。

## 语法结构

### 启用全文索引

默认情况下，全文索引是关闭的。你需要通过以下 SQL 命令来启用它：

```sql
--开启全文索引
set experimental_fulltext_index=1;--默认为 0，表示关闭
```

### 选择 boolean 模式的相关性算法

可选 BM25 或 TF-IDF：

```sql
set ft_relevancy_algorithm= BM25|TF-IDF;--默认使用 TF-IDF 算法进行检索。
```

### 创建全文搜索引

```sql
CREATE FULLTEXT INDEX <index_name> 
ON <table_name> (col1, col2, ...) 
[WITH PARSER (default | ngram | json)];
```

- index_name: 你希望为全文索引指定的名称。
- table_name: 要在其上创建索引的表名。
- (col1, col2, ...): 包含在全文索引中的列列表。
- WITH PARSER: 可选。指定用于索引的解析器。可用的选项有：
    - default: 默认解析器。
    - ngram: 支持 n-gram 分词的解析器。
    - json: 专门用于 JSON 数据的解析器。

### 使用全文索引进行搜索

```sql
MATCH (col1, col2, ...) AGAINST (expr [search_modifier]);
```

- (col1, col2, ...): 要搜索的列。
- expr: 搜索表达式或关键字。
- search_modifier: 可选。指定搜索模式。可用的选项有：
    - IN NATURAL LANGUAGE MODE: 执行自然语言搜索。
    - IN BOOLEAN MODE: 执行布尔搜索，允许使用布尔运算符（如 +, -, *）。

## 示例

```sql
--启用全文索引
SET experimental_fulltext_index = 1;

CREATE TABLE example_table (
    id INT PRIMARY KEY,
    english_text TEXT,       -- 英文文本
    chinese_text TEXT,        -- 中文文本
    json_data JSON           -- JSON 数据
);
INSERT INTO example_table (id, english_text, chinese_text, json_data) VALUES
(1, 'Hello, world!', '你好世界', '{"name": "Alice", "age": 30}'),
(2, 'This is a test.', '这是一个测试', '{"name": "Bob", "age": 25}'),
(3, 'Full-text search is powerful.', '全文搜索很强大', '{"name": "Charlie", "age": 35}');

--使用 default 解析器创建全文索引
mysql> CREATE FULLTEXT INDEX idx_english_text ON example_table (english_text);
Query OK, 0 rows affected (0.03 sec)

--使用 ngram 解析器创建全文索引
mysql> CREATE FULLTEXT INDEX idx_chinese_text ON example_table (chinese_text) WITH PARSER ngram;
Query OK, 0 rows affected (0.02 sec)

--使用 json 解析器创建全文索引
mysql> CREATE FULLTEXT INDEX idx_json_data ON example_table (json_data) WITH PARSER json;
Query OK, 0 rows affected (0.01 sec)

mysql> show create table example_table;
+---------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| Table         | Create Table                                                                                                                                                                                                                                                                                                                                               |
+---------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
| example_table | CREATE TABLE `example_table` (
  `id` int NOT NULL,
  `english_text` text DEFAULT NULL,
  `chinese_text` text DEFAULT NULL,
  `json_data` json DEFAULT NULL,
  PRIMARY KEY (`id`),
 FULLTEXT `idx_english_text`(`english_text`),
 FULLTEXT `idx_chinese_text`(`chinese_text`) WITH PARSER ngram,
 FULLTEXT `idx_json_data`(`json_data`) WITH PARSER json
) |
+---------------+------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------+
1 row in set (0.00 sec)

--查询包含 "world" 的英文文本
mysql> SELECT * FROM example_table WHERE MATCH(english_text) AGAINST('world');
+------+---------------+--------------+------------------------------+
| id   | english_text  | chinese_text | json_data                    |
+------+---------------+--------------+------------------------------+
|    1 | Hello, world! | 你好世界     | {"age": 30, "name": "Alice"} |
+------+---------------+--------------+------------------------------+
1 row in set (0.02 sec)

--查询包含 "你好" 的中文文本
mysql> SELECT * FROM example_table WHERE MATCH(chinese_text) AGAINST('你好');
+------+---------------+--------------+------------------------------+
| id   | english_text  | chinese_text | json_data                    |
+------+---------------+--------------+------------------------------+
|    1 | Hello, world! | 你好世界     | {"age": 30, "name": "Alice"} |
+------+---------------+--------------+------------------------------+
1 row in set (0.01 sec)

--查询 JSON 数据中包含 "Alice" 的记录
mysql> SELECT * FROM example_table WHERE MATCH(json_data) AGAINST('Alice');
+------+---------------+--------------+------------------------------+
| id   | english_text  | chinese_text | json_data                    |
+------+---------------+--------------+------------------------------+
|    1 | Hello, world! | 你好世界     | {"age": 30, "name": "Alice"} |
+------+---------------+--------------+------------------------------+
1 row in set (0.01 sec)

--使用布尔模式进行搜索

mysql> set ft_relevancy_algorithm= "BM25";
Query OK, 0 rows affected (0.00 sec)

-- 1. 使用 "+" 运算符：必须包含 "test"
mysql> SELECT * FROM example_table WHERE MATCH(english_text) AGAINST('+test' IN BOOLEAN MODE);
+------+-----------------+--------------------+----------------------------+
| id   | english_text    | chinese_text       | json_data                  |
+------+-----------------+--------------------+----------------------------+
|    2 | This is a test. | 这是一个测试       | {"age": 25, "name": "Bob"} |
+------+-----------------+--------------------+----------------------------+
1 row in set (0.01 sec)

-- 2. 使用 "-" 运算符：必须不包含 "This"
mysql> SELECT * FROM example_table WHERE MATCH(english_text) AGAINST('+test -This' IN BOOLEAN MODE);
Empty set (0.00 sec)

-- 3. 使用 "*" 运算符：匹配以 "pow" 开头的单词
mysql> SELECT * FROM example_table WHERE MATCH(english_text) AGAINST('pow*' IN BOOLEAN MODE);
+------+-------------------------------+-----------------------+--------------------------------+
| id   | english_text                  | chinese_text          | json_data                      |
+------+-------------------------------+-----------------------+--------------------------------+
|    3 | Full-text search is powerful. | 全文搜索很强大        | {"age": 35, "name": "Charlie"} |
+------+-------------------------------+-----------------------+--------------------------------+
1 row in set (0.01 sec)

-- 4. 使用双引号 "" 运算符：匹配整个短语 "search is powerful"
mysql> mysql> SELECT * FROM example_table WHERE MATCH(english_text) AGAINST('"search is powerful"' IN BOOLEAN MODE);
+------+-------------------------------+-----------------------+--------------------------------+
| id   | english_text                  | chinese_text          | json_data                      |
+------+-------------------------------+-----------------------+--------------------------------+
|    3 | Full-text search is powerful. | 全文搜索很强大        | {"age": 35, "name": "Charlie"} |
+------+-------------------------------+-----------------------+--------------------------------+
1 row in set (0.02 sec)
```

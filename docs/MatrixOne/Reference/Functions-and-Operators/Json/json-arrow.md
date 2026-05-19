---
title: "JSON 箭头运算符 -> 和 ->>"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: false
since: v3.0.11
last_updated: 2026-05-08
llms_summary: "JSON 箭头运算符 -> 和 ->> 是 json_extract 和 json_unquote(json_extract(...)) 的解析器简写形式，按路径提取 JSON 值或去引号的字符串。"
---

# **JSON 箭头运算符 `->` 和 `->>`**

> `->` 和 `->>` 运算符是 JSON 路径提取的解析器简写形式：
> `col -> '$.path'` 被重写为 `json_extract(col, '$.path')`，而
> `col ->> '$.path'` 被重写为 `json_unquote(json_extract(col, '$.path'))`。

## 运算符说明

JSON 箭头运算符 `->` 和 `->>` 是按路径从 JSON 文档中提取值的简写形式。两
个运算符在解析时被重写为等价的基础 JSON 函数调用；它们的结果类型和行为
与底层函数调用一致。

| 运算符 | 等价重写为 | 返回值 |
| ---- | ---- | ---- |
| `json_col -> 'json_path'` | [`json_extract`](json_extract.md)`(json_col, 'json_path')` | JSON 值（可以是 JSON 标量、对象或数组）。 |
| `json_col ->> 'json_path'` | [`json_unquote`](json_unquote.md)`(`[`json_extract`](json_extract.md)`(json_col, 'json_path'))` | `VARCHAR` 字符串，外围 JSON 引号已剥离。 |

由于重写在解析时发生，运算符可以完全替代函数调用。`JSON_EXTRACT()` 的路
径表达式规则同样适用：路径必须以 `$` 开头，点记法访问对象成员，`[N]` 索
引数组，支持 `*` / `**` 通配符。

当调用方希望将提取的值作为 JSON 值使用时（例如传递给另一个 JSON 函数），
使用 `->`。当调用方希望获得去引号的字符串形式时（例如与纯字符串字面量比
较），使用 `->>`。

## 语法结构

```
> json_col ->  'json_path'
> json_col ->> 'json_path'
```

## 参数释义

| 参数 | 说明 |
| ---- | ---- |
| json_col | 必填。产生 JSON 的 JSON 列或表达式。 |
| json_path | 必填。包含 JSON 路径表达式的字符串字面量。完整路径语法参见 [`JSON_EXTRACT()`](json_extract.md)。 |

## 示例

```sql
DROP DATABASE IF EXISTS json_arrow_demo;
CREATE DATABASE json_arrow_demo;
USE json_arrow_demo;

CREATE TABLE t1 (id INT, payload JSON);
INSERT INTO t1 VALUES
  (1, '{"name": "Alice",   "age": 30, "tags": ["admin", "dev"]}'),
  (2, '{"name": "Bob",     "age": 25, "tags": ["dev"]}'),
  (3, '{"name": "Charlie", "age": 40, "tags": []}');

-- `->` 返回提取的值（仍为 JSON）；字符串 "Alice" 带引号。
SELECT id, payload -> '$.name' AS name_json FROM t1 ORDER BY id;

-- `->>` 将结果去引号，返回裸 VARCHAR。
SELECT id, payload ->> '$.name' AS name_str FROM t1 ORDER BY id;

-- 链式访问嵌套数组成员。
SELECT id, payload ->> '$.tags[0]' AS primary_tag FROM t1 ORDER BY id;

-- 箭头形式与函数调用形式等价。
SELECT id,
       payload -> '$.age'                AS via_arrow,
       JSON_EXTRACT(payload, '$.age')    AS via_func
FROM t1 ORDER BY id;

DROP TABLE t1;
DROP DATABASE json_arrow_demo;
```

## 参考

- [`JSON_EXTRACT()`](json_extract.md)
- [`JSON_UNQUOTE()`](json_unquote.md)

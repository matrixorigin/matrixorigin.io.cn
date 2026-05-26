---
title: "SET 类型"
doc_type: reference
mysql_compat: partial
differs_from_mysql: ["不支持 ALTER MODIFY 缩减成员列表"]
mo_only: false
since: v3.0.13
last_updated: 2026-05-19
llms_summary: "SET 类型以紧凑位图存储一组预定义的字符串值，支持按名称或数值索引插入、LOAD DATA、DISTINCT、GROUP BY 以及 ALTER MODIFY 扩展成员列表。"
---

# SET 类型

> SET 类型以紧凑的位图形式存储一组预定义字符串值。各列的成员列表在创建表时定义，可通过名称（如 `'red,blue'`）或数值索引的加和来插入值。ALTER MODIFY 可以扩展但不可缩减成员列表。

## 语法

```
SET('value1', 'value2', ..., 'valueN')
```

SET 列可包含其定义列表中的零个或多个成员。在内部，每个成员对应一个位（1, 2, 4, 8, ...），存储值为所有存在成员的按位或结果。例如，对于 `SET('red','green','blue')`，`'red,blue'` 存储为 `1 | 4 = 5`。

## 参数

| 参数 | 说明 |
|---|---|
| `value1, value2, ..., valueN` | 逗号分隔的字符串成员列表。每个 SET 最多支持 64 个成员。 |

## 使用说明

- 按名称插入时，成员匹配不区分大小写。
- 插入未出现在定义列表中的成员会触发错误。
- 空字符串 `''` 表示空集合（未选取任何成员）。
- NULL 与空集合是不同的值。
- `ALTER TABLE MODIFY COLUMN` 可以扩展成员列表（添加新成员），但若新列表移除了先前定义的任何成员，则操作被拒绝。
- SET 列可用于索引以及 `DISTINCT`、`GROUP BY` 子句。

## 示例

```
DROP DATABASE IF EXISTS set_demo_db;
CREATE DATABASE set_demo_db;
USE set_demo_db;

CREATE TABLE set01 (
    id INT PRIMARY KEY,
    colors SET('red', 'green', 'blue')
);

-- 按名称插入
INSERT INTO set01 VALUES (1, 'red'), (2, 'blue,red'), (3, ''), (4, NULL);

-- 按数值索引插入（red=1, green=2, blue=4，因此 3 = red+green）
INSERT INTO set01 VALUES (5, 3);

SELECT * FROM set01 ORDER BY id;

-- 按集合值过滤
SELECT * FROM set01 WHERE colors = 'red,green' ORDER BY id;

-- 插入无效成员会报错
-- Expected-Success: false
INSERT INTO set01 VALUES (6, 'yellow');
-- ERROR: invalid set value 'yellow'

-- ALTER MODIFY 扩展成员列表（成功）
ALTER TABLE set01 MODIFY COLUMN colors SET('red','green','blue','yellow');
INSERT INTO set01 VALUES (7, 'red,yellow');
SELECT * FROM set01 WHERE id = 7;

DROP TABLE set01;

-- ALTER MODIFY 缩减成员列表被拒绝
CREATE TABLE set_modify (id INT PRIMARY KEY, tags SET('a','b','c'));
INSERT INTO set_modify VALUES (1, 'a,c'), (2, 'b');
-- Expected-Success: false
ALTER TABLE set_modify MODIFY COLUMN tags SET('a','b');
-- ERROR: cannot shrink SET member list

DROP TABLE set_modify;

-- SET 列上使用 DISTINCT 和 GROUP BY
CREATE TABLE set02 (
    id INT PRIMARY KEY,
    colors SET('red', 'green', 'blue')
);
INSERT INTO set02 VALUES (1, 'red'), (2, 'red,green'), (3, 'red'), (4, 'blue');
SELECT DISTINCT colors FROM set02 ORDER BY colors;
SELECT colors, COUNT(*) AS cnt FROM set02 GROUP BY colors ORDER BY colors;

DROP TABLE set02;

-- SET 类型与 DEFAULT 配合使用
CREATE TABLE set03 (
    id INT PRIMARY KEY,
    tags SET('x', 'y') NOT NULL DEFAULT 'x'
);
INSERT INTO set03 VALUES (1, DEFAULT);
INSERT INTO set03 VALUES (2, 3);
SELECT * FROM set03 ORDER BY id;

DROP TABLE set03;
DROP DATABASE set_demo_db;
```

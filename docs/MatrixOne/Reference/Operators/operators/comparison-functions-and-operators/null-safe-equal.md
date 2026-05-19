---
title: "<=>"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: false
since: v3.0.11
last_updated: 2026-05-08
llms_summary: "NULL 安全等值运算符，两侧完全相等（含两侧均为 NULL）时返回 1，否则返回 0，且自身永远不会返回 NULL。"
---

# **<=>**

> `<=>` 是 NULL 安全的等值比较运算符。当两个操作数完全相等（包括两侧均
> 为 `NULL` 的情况）时返回 `1`，否则返回 `0`，且该运算符自身永远不会返
> 回 `NULL`。适合在 WHERE 或 JOIN 条件中把两侧同为 `NULL` 视为相等。

## 运算符说明

`<=>` 在语义上等价于一个 NULL 安全的 `=`：与 `=` 在任一操作数为 `NULL`
时返回 `NULL` 不同，`<=>` 总是返回整数 `0` 或 `1`。它的类型提升规则与
`=` 一致，会把数值、字符串、日期时间、DECIMAL 等类型先统一到共同的比较
类型；两侧都是 DECIMAL 时会先对齐 scale，再做等值比较。

## 语法结构

```
> SELECT value1 <=> value2;
```

```
> SELECT column1 <=> column2 FROM table_name;
```

## 参数释义

| 参数 | 说明 |
| ---- | ---- |
| value1 | 必填。左操作数，允许为 `NULL`。可接受数值、字符串、日期时间或 DECIMAL 类型；参与比较前会与右操作数统一到共同的比较类型。 |
| value2 | 必填。右操作数，允许为 `NULL`。两侧均为 DECIMAL 且 scale 不同时，会把较小的 scale 对齐到较大一侧后再做等值判断。 |

返回值恒为布尔整数：两操作数相等（包括两侧均为 `NULL`）返回 `1`，否则返
回 `0`。该运算符自身永远不会返回 `NULL`。

## 示例

```sql
DROP DATABASE IF EXISTS null_safe_equal_demo;
CREATE DATABASE null_safe_equal_demo;
USE null_safe_equal_demo;

SELECT 1 <=> 1 AS a, 1 <=> 0 AS b, 1 <=> NULL AS c, NULL <=> NULL AS d;

SELECT 'a' <=> 'a' AS a, 'a' <=> 'b' AS b, 'a' <=> NULL AS c;

CREATE TABLE t1 (id INT PRIMARY KEY, val INT);
INSERT INTO t1 VALUES (1, 1), (2, 0), (3, NULL);

SELECT id, val,
       val <=> 1     AS eq_1,
       val <=> 0     AS eq_0,
       val <=> NULL  AS eq_null
FROM t1
ORDER BY id;

SELECT CAST(1.10 AS DECIMAL(10,2)) <=> CAST(1.1 AS DECIMAL(10,1)) AS dec_eq;

DROP TABLE t1;
DROP DATABASE null_safe_equal_demo;
```

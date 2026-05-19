---
title: TRY_JQ()
doc_type: reference
mysql_compat: mo_only
differs_from_mysql: []
mo_only:
- MatrixOne integration of the jq JSON query language; no MySQL equivalent.
since: unknown
last_updated: 2026-05-08
llms_summary: TRY_JQ() 函数用于根据 jq 表达式解析和转换 JSON 数据。与 JQ() 不同的是，TRY_JQ() 支持出错时返回空值，而 JQ() 遇到错误则直接抛出异常。
---

# **TRY_JQ()**


> TRY_JQ() 函数用于根据 jq 表达式解析和转换 JSON 数据。与 JQ() 不同的是，TRY_JQ() 支持出错时返回空值，而
> JQ() 遇到错误则直接抛出异常。

## **函数说明**

`TRY_JQ()` 函数用于根据 jq 表达式解析和转换 JSON 数据。与 [`JQ()`](./jq.md) 不同的是，`TRY_JQ()` 支持出错时返回空值，而 `JQ()` 遇到错误则直接抛出异常。

## **语法结构**

```sql
select try_jq(jsonDoc, pathExpression);
```

## **参数释义**

|  参数   | 说明 |
|  ----  | ----  |
| jsonDoc  | 这是包含 JSON 数据的列或表达式。|
| pathExpression  | 用于指定如何从 JSON 数据中提取字段|

## **示例**

```sql
mysql> select try_jq('{"foo": 128}', '.foo');
+----------------------------+
| try_jq({"foo": 128}, .foo) |
+----------------------------+
| 128                        |
+----------------------------+
1 row in set (0.00 sec)

mysql> select try_jq(null, '.foo');
+--------------------+
| try_jq(null, .foo) |
+--------------------+
| NULL               |
+--------------------+
1 row in set (0.00 sec)

mysql> select try_jq('{"id": "sample", "10": {"b": 42}}', '{(.id): .["10"].b}');
+---------------------------------------------------------------+
| try_jq({"id": "sample", "10": {"b": 42}}, {(.id): .["10"].b}) |
+---------------------------------------------------------------+
| {"sample":42}                                                 |
+---------------------------------------------------------------+
1 row in set (0.00 sec)

mysql> select try_jq('[1, 2, 3]', '.foo & .bar');
+--------------------------------+
| try_jq([1, 2, 3], .foo & .bar) |
+--------------------------------+
| NULL                           |
+--------------------------------+
1 row in set (0.00 sec)
```
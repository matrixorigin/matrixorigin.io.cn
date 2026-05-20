---
title: VERSION
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: VERSION() 函数用于获取当前 MatrixOne 的版本信息。这个函数通常返回一个字符串，包含了 MatrixOne 的版本号。如 8.0.30-MatrixOne-v3.0.11，表示 MatrixOn 的版本号是 8.0.30-MatrixOne-v3.0.11, 它的定义是 MySQL 兼容版本号 (8.0.30) + MatrixOne + MatrixOne
  内核版本 (v26.3.0.11)。
---

# **VERSION**

> VERSION() 函数用于获取当前 MatrixOne 的版本信息。这个函数通常返回一个字符串，包含了 MatrixOne 的版本号。如
> 8.0.30-MatrixOne-v3.0.11，表示 MatrixOn 的版本号是 8.0.30-MatrixOne-v3.0.11,
> 它的定义是 MySQL 兼容版本号 (8.0.30) + MatrixOne + MatrixOne 内核版本 (v26.3.0.11)。

## **函数说明**

`VERSION()` 函数用于获取当前 MatrixOne 的版本信息。这个函数通常返回一个字符串，包含了 MatrixOne 的版本号。如 8.0.30-MatrixOne-v3.0.11，表示 MatrixOn 的版本号是 8.0.30-MatrixOne-v3.0.11, 它的定义是 MySQL 兼容版本号 (8.0.30) + MatrixOne + MatrixOne 内核版本 (v26.3.0.11)。

## **函数语法**

```
> VERSION()
```

## **示例**

```sql
mysql> select version();
+-------------------------+
| version()               |
+-------------------------+
| 8.0.30-MatrixOne-v3.0.11 |
+-------------------------+
1 row in set (0.00 sec)
```

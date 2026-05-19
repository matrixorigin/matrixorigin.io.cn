---
title: CURRENT_USER, CURRENT_USER()
doc_type: reference
mysql_compat: partial
differs_from_mysql:
- Return format is 'username@0.0.0.0' rather than MySQL's 'username@host' with a resolved client host.
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: 返回当前用户账户，返回的账户形式为：用户名@hostname。返回值是 utf8mb3 字符集的字符串。
---

# **CURRENT_USER, CURRENT_USER()**


> 返回当前用户账户，返回的账户形式为：用户名@hostname。返回值是 utf8mb3 字符集的字符串。

## **语法说明**

返回当前用户账户，返回的账户形式为：用户名@hostname。返回值是 utf8mb3 字符集的字符串。

## **语法结构**

```
SELECT CURRENT_USER();
```

## **示例**

```sql
mysql> select current_user();
+----------------+
| current_user() |
+----------------+
| root@0.0.0.0   |
+----------------+
1 row in set (0.00 sec)
```

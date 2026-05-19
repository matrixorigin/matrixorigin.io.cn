---
title: OCT(N)
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: []
since: unknown
last_updated: 2026-05-08
llms_summary: 函数 `OCT(N)` 返回 *N* 的八进制值的字符串，其中 *N* 是一个 longlong(BIGINT) 类型的数字，即将一个数字从十进制数字基数系统转换到八进制数字基数系统。 若 *N* 为 *NULL*，则返回 `NULL`。
---

# **OCT(N)**


> 函数 `OCT(N)` 返回 *N* 的八进制值的字符串，其中 *N* 是一个 longlong(BIGINT)
> 类型的数字，即将一个数字从十进制数字基数系统转换到八进制数字基数系统。 若 *N* 为 *NULL*，则返回 `NULL`。

## **函数说明**

函数 ``OCT(N)`` 返回 *N* 的八进制值的字符串，其中 *N* 是一个 longlong(BIGINT) 类型的数字，即将一个数字从十进制数字基数系统转换到八进制数字基数系统。
若 *N* 为 *NULL*，则返回 ``NULL``。

## **函数语法**

```
> OCT(N)
```

## **参数释义**

|  参数   | 说明 |
|  ----  | ----  |
| N | 必要参数。UINT 类型 |

## **示例**

```SQL
SELECT OCT(12);
+---------+
| oct(12) |
+---------+
| 14.0000 |
+---------+
1 row in set (0.00 sec)
```

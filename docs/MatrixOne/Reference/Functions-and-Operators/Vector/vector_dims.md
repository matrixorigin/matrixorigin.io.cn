---
title: vector_dims()
doc_type: reference
mysql_compat: mo_only
differs_from_mysql: []
mo_only:
- 'Vector type and related distance/norm/clustering functions are MatrixOne extensions (compat doc: Data Types — "MatrixOne supports vector types").'
since: unknown
last_updated: 2026-05-08
llms_summary: vector_dims 函数用于确定向量的维度。
---

# **vector_dims()**


> vector_dims 函数用于确定向量的维度。

## **函数说明**

`vector_dims` 函数用于确定向量的维度。

## **函数语法**

```
> SELECT vector_dims(vector) AS dimension_count FROM table_name;
```

## **示例**

```sql
drop table if exists vec_table;
create table vec_table(a int, b vecf32(3), c vecf64(3));
insert into vec_table values(1, "[1,2,3]", "[4,5,6]");
insert into vec_table values(2, "[7,8,9]", "[1,2,3]");
mysql> select * from vec_table;
+------+-----------+-----------+
| a    | b         | c         |
+------+-----------+-----------+
|    1 | [1, 2, 3] | [4, 5, 6] |
|    2 | [7, 8, 9] | [1, 2, 3] |
+------+-----------+-----------+
2 row in set (0.00 sec)

mysql> select vector_dims(b) from vec_table;
+----------------+
| vector_dims(b) |
+----------------+
|              3 |
|              3 |
+----------------+
2 row in set (0.01 sec)
```

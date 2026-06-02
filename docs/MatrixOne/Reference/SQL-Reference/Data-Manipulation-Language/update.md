---
title: UPDATE
doc_type: reference
mysql_compat: partial
differs_from_mysql:
- LOW_PRIORITY and IGNORE modifiers not supported
mo_only: false
since: unknown
last_updated: 2026-06-02
llms_summary: UPDATE 用于修改表中的现有记录，支持 PostgreSQL 风格的 UPDATE ... SET ... FROM ... WHERE 语法。
---

# **UPDATE**

> UPDATE 用于修改表中的现有记录。支持单表、多表以及 PostgreSQL 风格的 `UPDATE ... SET ... FROM ... WHERE` 语法。

## **语法描述**

`UPDATE` 用于修改表中的现有记录。

## **语法结构**

### **单表语法结构**

```
UPDATE table_reference
    SET assignment_list
    [WHERE where_condition]
    [ORDER BY ...]
    [LIMIT row_count]
```

### **PostgreSQL 风格 UPDATE FROM 语法**

```
UPDATE table_reference [ [AS] alias ]
    SET assignment_list
    FROM table_references
    [WHERE where_condition]
```

#### 参数释义

- `UPDATE` 将新值更新到指定表中现有行的列中。
- `SET` 从句指出要修改哪些列以及它们应该被赋予的值。每个值可以作为表达式给出，或者通过 `DEFAULT` 明确将列设置为默认值。
- `WHERE` 从句，用于指定用于标识要更新哪些行的条件。若无 `WHERE` 从句，则更新所有行。
- `ORDER BY` 从句，指按照指定的顺序更新行。
- `LIMIT` 从句用于限制可更新的行数。
- PostgreSQL 风格的 `FROM` 从句引入额外的只读连接源。目标表被更新，`FROM` 从句中的表作为连接源使用且不会被修改。`ORDER BY` 和 `LIMIT` 不支持与 `FROM` 语法共用。

## **示例**

- **单表示例**

```sql
CREATE TABLE t1 (a bigint(3), b bigint(5) primary key);
insert INTO t1 VALUES (1,1),(1,2);
update t1 set a=2 where a=1 limit 1;

mysql> select * from t1;
+------+------+
| a    | b    |
+------+------+
|    2 |    1 |
|    1 |    2 |
+------+------+
```

- **多表示例**

```sql
drop table if exists t1;
create table t1 (a int);
insert into t1 values(1), (2), (4);
drop table if exists t2;
create table t2 (b int);
insert into t2 values(1), (2), (3);
update t1, t2 set a = 1, b =2;

mysql> select * from t1;
+------+
| a    |
+------+
|    1 |
|    1 |
|    1 |
+------+

update t1, t2 set a = null, b =null;

mysql> select * from t2;
+------+
| b    |
+------+
| NULL |
| NULL |
| NULL |
+------+
mysql> select * from t1;
+------+
| a    |
+------+
| NULL |
| NULL |
| NULL |
+------+
```

支持多表 JOIN 语句。

```sql
drop table if exists t1;
drop table if exists t2;
create table t1 (a int, b int, c int);
insert into t1 values(1, 2, 3), (4, 5, 6), (7, 8, 9);
create table t2 (a int, b int, c int);
insert into t2 values(1, 2, 3), (4, 5, 6), (7, 8, 9);
update t1 join t2 on t1.a = t2.a set t1.b = 222, t1.c = 333, t2.b = 222, t2.c = 333;

mysql> select * from t1;
+------+------+------+
| a    | b    | c    |
+------+------+------+
|    1 |  222 |  333 |
|    4 |  222 |  333 |
|    7 |  222 |  333 |
+------+------+------+

mysql> with t11 as (select * from (select * from t1) as t22) update t11 join t2 on t11.a = t2.a set t2.b = 666;

mysql> select * from t2;
+------+------+------+
| a    | b    | c    |
+------+------+------+
|    1 |  666 |  333 |
|    4 |  666 |  333 |
|    7 |  666 |  333 |
+------+------+------+
3 rows in set (0.00 sec)
```

- **PostgreSQL 风格 UPDATE FROM 示例**

```sql
DROP DATABASE IF EXISTS update_from_tests;
CREATE DATABASE update_from_tests;
USE update_from_tests;

CREATE TABLE company (id INT PRIMARY KEY, province VARCHAR(50));
INSERT INTO company VALUES (101, 'BJ'), (102, 'SH'), (103, 'GZ');

CREATE TABLE vec_join_case (id INT PRIMARY KEY, company_id INT, remark VARCHAR(100));
INSERT INTO vec_join_case VALUES (10, 101, 'init'), (20, 102, 'init'), (30, 103, 'init');

-- 基本 PostgreSQL 风格 UPDATE FROM
UPDATE vec_join_case t
SET remark = CONCAT('hot-', c.province)
FROM company c
WHERE c.id = t.company_id;
SELECT id, company_id, remark FROM vec_join_case ORDER BY id;

-- UPDATE FROM 结合 CTE
WITH cc AS (SELECT id, province FROM company)
UPDATE vec_join_case t
SET remark = c.province
FROM cc c
WHERE c.id = t.company_id;
SELECT id, company_id, remark FROM vec_join_case ORDER BY id;

-- UPDATE FROM 结合 LEFT JOIN
UPDATE vec_join_case t
SET remark = COALESCE(c.province, 'unknown')
FROM company c
WHERE c.id = t.company_id;
SELECT id, company_id, remark FROM vec_join_case ORDER BY id;

DROP DATABASE update_from_tests;
```

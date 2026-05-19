---
title: "CUME_DIST()"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: false
since: v3.0.11
last_updated: 2026-05-08
llms_summary: "CUME_DIST 返回当前行在其窗口分区内的累积分布，结果为 (0, 1] 范围内的 DOUBLE，计算方式为值小于等于当前行的行数除以分区大小。"
---

# **CUME_DIST()**

> `CUME_DIST()` 是一个窗口函数，返回当前行在其分区内的累积分布，结果为
> `DOUBLE`，范围为 `(0, 1]`，计算方式为（值小于等于当前行的行数）除以
> （分区大小）。

## 函数说明

`CUME_DIST()` 返回当前行在其窗口分区内的累积分布。值为 `DOUBLE`，范围为
(0, 1]，定义如下：

```
CUME_DIST = (值小于等于当前行值的行数) / (分区总行数)
```

在 `ORDER BY` 表达式上并列的行共享相同的值。该函数不接收参数，且 `DISTINCT`
会被拒绝。

## 函数语法

```
> CUME_DIST() OVER (
    [PARTITION BY column_1, column_2, ... ]
    ORDER BY column_3, column_4, ...
)
```

- `PARTITION BY` 子句可选，将数据集划分为多个分区；累积分布在每个分区内
  独立计算。
- `ORDER BY` 子句定义计算分布前的行排序方式。

## 示例

```sql
DROP DATABASE IF EXISTS cume_dist_demo;
CREATE DATABASE cume_dist_demo;
USE cume_dist_demo;

CREATE TABLE sales (
  department VARCHAR(20),
  employee   VARCHAR(20),
  amount     INT
);
INSERT INTO sales VALUES
  ('Marketing', 'John',    1000),
  ('Marketing', 'Jane',    1200),
  ('Sales',     'Alex',     900),
  ('Sales',     'Bob',     1100),
  ('HR',        'Alice',    800),
  ('HR',        'Charlie',  850);

SELECT department, employee, amount,
       CUME_DIST() OVER (PARTITION BY department ORDER BY amount) AS cd
FROM sales;

DROP TABLE sales;
DROP DATABASE cume_dist_demo;
```

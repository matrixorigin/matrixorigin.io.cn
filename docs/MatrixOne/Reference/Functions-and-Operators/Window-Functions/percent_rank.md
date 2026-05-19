---
title: "PERCENT_RANK()"
doc_type: reference
mysql_compat: full
differs_from_mysql: []
mo_only: false
since: v3.0.11
last_updated: 2026-05-08
llms_summary: "PERCENT_RANK 返回当前行在其窗口分区内的相对排名，结果为 [0, 1] 范围内的 DOUBLE，计算方式为 (rank - 1) 除以 (分区大小 - 1)。"
---

# **PERCENT_RANK()**

> `PERCENT_RANK()` 是一个窗口函数，返回当前行在其分区内的相对排名，结果
> 为 `DOUBLE`，范围为 `[0, 1]`，计算方式为 `(rank - 1) / (分区大小 - 1)`；
> 分区大小为 1 时返回 0。

## 函数说明

`PERCENT_RANK()` 返回当前行在其窗口分区内的相对排名，值为 [0, 1] 范围内
的值。定义如下：

```
PERCENT_RANK = (rank - 1) / (分区总行数 - 1)
```

其中 `rank` 遵循与 `RANK()` 相同的并列处理行为：在 `ORDER BY` 表达式上并
列的行共享相同的排名，且后续排名被跳过。当分区只有一行时，结果为 `0`。该
函数不接收参数，且 `DISTINCT` 会被拒绝。

## 函数语法

```
> PERCENT_RANK() OVER (
    [PARTITION BY column_1, column_2, ... ]
    ORDER BY column_3, column_4, ...
)
```

- `PARTITION BY` 子句可选，将数据集划分为多个分区；百分位排名在每个分区
  内独立计算。
- `ORDER BY` 子句定义计算排名前的行排序方式。

## 示例

```sql
DROP DATABASE IF EXISTS percent_rank_demo;
CREATE DATABASE percent_rank_demo;
USE percent_rank_demo;

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
       PERCENT_RANK() OVER (PARTITION BY department ORDER BY amount) AS pr
FROM sales;

DROP TABLE sales;
DROP DATABASE percent_rank_demo;
```

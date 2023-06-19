# **ROW_NUMBER()**

## **函数说明**

`ROW_NUMBER()` 为数据集中的每一行提供一个唯一的序号，从 1 开始，直到结果集的最后一行。它首先会根据 `ORDER BY` 子句中指定的列对数据集进行排序，然后为每一行赋予一个唯一的行号。

与 `RANK()` 和 `DENSE_RANK()` 函数不同，`ROW_NUMBER()` 在处理平局（即两行或更多行具有相同的值）时会为每一行赋予不同的行号。

## **函数语法**

```
> ROW_NUMBER() OVER (
    [PARTITION BY column_1, column_2, ... ]
    ORDER BY column_3, column_4, ...
)
```

- `PARTITION BY` 子句是可选的，它将数据集分为多个分区，在每个分区内部单独计算行号。
- `ORDER BY` 子句定义了数据集的排序方式，即根据哪一列或哪些列进行排序。可以指定升序（ASC）或降序（DESC）排序。

## **示例**

```SQL
-- 创建一个新的表 'SalesTable'，该表具有三个字段：'Department', 'Employee'和 'Sales'
CREATE TABLE SalesTable (
  Department VARCHAR(50),
  Employee VARCHAR(50),
  Sales INT
);

-- 向'SalesTable'表中插入数据，每行包含一个部门（Department）、一个员工（Employee）和他们的销售额（Sales）
INSERT INTO SalesTable (Department, Employee, Sales) VALUES
('Marketing', 'John', 1000),
('Marketing', 'Jane', 1200),
('Sales', 'Alex', 900),
('Sales', 'Bob', 1100),
('HR', 'Alice', 800),
('HR', 'Charlie', 850);

-- 查询每个部门员工的销售额排名
-- 使用 ROW_NUMBER() 函数按部门（Department）对员工的销售额（Sales）进行排名
-- ROW_NUMBER() 函数将数据集按照部门（Department）分为多个分区，然后在每个分区内部按照销售额（Sales）的降序排列进行排序，并为每一行赋予一个唯一的行号（SalesRank）
-- 所以，每个部门销售额最高的员工将获得行号 1，销售额第二高的员工将获得行号 2，以此类推
mysql> SELECT
    Department,
    Employee,
    Sales,
    ROW_NUMBER() OVER (PARTITION BY Department ORDER BY Sales DESC) as SalesRank
FROM
    SalesTable;
+------------+----------+-------+-----------+
| department | employee | sales | SalesRank |
+------------+----------+-------+-----------+
| HR         | Charlie  |   850 |         1 |
| HR         | Alice    |   800 |         2 |
| Marketing  | Jane     |  1200 |         1 |
| Marketing  | John     |  1000 |         2 |
| Sales      | Bob      |  1100 |         1 |
| Sales      | Alex     |   900 |         2 |
+------------+----------+-------+-----------+
6 rows in set (0.01 sec)
```

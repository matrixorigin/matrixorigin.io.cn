# **RANK()**

## **函数说明**

`RANK()` 为数据集中的每一行提供一个唯一的排名。`RANK()` 首先根据 `ORDER BY` 子句中指定的列对数据集进行排序，然后为每一行赋予一个唯一的排名。

`RANK()` 函数在处理相同值（即平局）的情况时，有一个特殊的行为：当两行或更多行具有相同的值时，它们将获得相同的排名。然后，它将跳过紧随其后的一个或多个排名。例如，如果两行获得排名 1，那么下一行将获得排名 3，而不是 2。

## **函数语法**

```
> RANK() OVER (
    [PARTITION BY column_1, column_2, ... ]
    ORDER BY column_3, column_4, ...
)
```

- `PARTITION BY` 子句是可选的，它将数据集分为多个分区，在每个分区内部单独计算排名。
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

-- 查询'SalesTable'表，并返回每个部门的每个员工，他们的销售额，以及他们所在部门的总销售额（DepartmentSales）
-- 还将返回每个员工在其所在部门的销售额排名（SalesRank）
-- 对于总销售额，使用窗口函数 SUM()，并用'OVER(PARTITION BY Department)'对每个部门分别进行计算
-- 对于销售额排名，使用窗口函数 RANK()，并用'OVER(PARTITION BY Department ORDER BY Sales DESC)'对每个部门的员工根据销售额进行降序排名
-- 在RANK()函数中，如果两个员工的销售额相同，他们会获得相同的排名，并且下一个销售额的排名会跳过。例如，如果有两个员工的销售额都是第一，那么下一个销售额的排名就是第三，而不是第二。
mysql> SELECT
  Department,
  Employee,
  Sales,
  SUM(Sales) OVER(PARTITION BY Department) AS DepartmentSales,
  RANK() OVER(PARTITION BY Department ORDER BY Sales DESC) AS SalesRank
FROM
  SalesTable;
+------------+----------+-------+-----------------+-----------+
| department | employee | sales | DepartmentSales | SalesRank |
+------------+----------+-------+-----------------+-----------+
| HR         | Charlie  |   850 |            1650 |         1 |
| HR         | Alice    |   800 |            1650 |         2 |
| Marketing  | Jane     |  1200 |            2200 |         1 |
| Marketing  | John     |  1000 |            2200 |         2 |
| Sales      | Bob      |  1100 |            2000 |         1 |
| Sales      | Alex     |   900 |            2000 |         2 |
+------------+----------+-------+-----------------+-----------+
6 rows in set (0.01 sec)
```

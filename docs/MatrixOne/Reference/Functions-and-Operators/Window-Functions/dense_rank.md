# **DENSE_RANK()**

## **函数说明**

`DENSE_RANK()` 为数据集中的每一行提供一个唯一的排名，与 RANK() 函数非常相似。`DENSE_RANK()` 函数首先根据 ORDER BY 子句中指定的列对数据集进行排序，然后为每一行赋予一个唯一的排名。

`DENSE_RANK()` 函数处理平局（即两行或更多行具有相同的值）的方式与 `RANK()` 函数略有不同。在存在平局的情况下，`DENSE_RANK()` 会为具有相同值的所有行赋予相同的排名，但是不会跳过紧随其后的任何排名。例如，如果两行获得排名 1，那么下一行将获得排名 2，而不是 3。

## **函数语法**

```
> DENSE_RANK() OVER (
    [PARTITION BY column_1, column_2, ... ]
    ORDER BY column_3, column_4, ...
)
```

- `PARTITION BY` 子句是可选的，它将数据集分为多个分区，在每个分区内部单独计算排名。
- `ORDER BY` 子句定义了数据集的排序方式，即根据哪一列或哪些列进行排序。可以指定升序（ASC）或降序（DESC）排序。

## **示例**

```sql
-- 创建一个名为'SalesTable'的表，它有三个字段：'Department'，'Employee'和'Sales'
CREATE TABLE SalesTable (
  Department VARCHAR(50),
  Employee VARCHAR(50),
  Sales INT
);

-- 向'SalesTable'表插入数据，每一行都包含一个部门（'Department'）、一个员工姓名（'Employee'）和他们的销售额（'Sales'）
INSERT INTO SalesTable (Department, Employee, Sales) VALUES
('Marketing', 'John', 1000),
('Marketing', 'Jane', 1200),
('Sales', 'Alex', 900),
('Sales', 'Bob', 1100),
('HR', 'Alice', 800),
('HR', 'Charlie', 850);

-- 查询'SalesTable'表，返回员工的名字，他们的销售额，以及他们的销售排名（使用'DENSE_RANK()'函数）
-- 在这个查询中，'DENSE_RANK()'函数根据销售额的降序（由'ORDER BY Sales DESC'指定）对所有员工进行排名
-- 如果多个员工的销售额相同，他们会得到相同的排名，并且下一个销售额的排名不会跳过。所以，如果有两个员工的销售额都是第一，那么下一个员工的排名就是第二，而不是第三。
mysql> SELECT
  Employee,
  Sales,
  DENSE_RANK() OVER(ORDER BY Sales DESC) FROM
  SalesTable;
+----------+-------+-----------------------------------------+
| employee | sales | dense_rank() over (order by sales desc) |
+----------+-------+-----------------------------------------+
| Jane     |  1200 |                                       1 |
| Bob      |  1100 |                                       2 |
| John     |  1000 |                                       3 |
| Alex     |   900 |                                       4 |
| Charlie  |   850 |                                       5 |
| Alice    |   800 |                                       6 |
+----------+-------+-----------------------------------------+
6 rows in set (0.01 sec)
```

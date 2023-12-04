# 窗口函数

窗口函数（Window Function）是一种特殊的函数，它能够在查询结果集的某个窗口（Window）上执行计算操作。窗口函数可以用于对结果集进行分组、排序和聚合操作，同时还能够在每个窗口内计算每行数据的相关值，而无需改变结果集的行数。即通过窗口函数，可以在不引入额外的子查询或连接操作的情况下，对结果集进行灵活的分析和处理。

SQL 窗口函数在多种业务场景中都有其广泛的应用：

1. **行内比较**：将每一行的某个值与同一组内的其他行进行比较，例如计算每个员工的薪水与部门平均薪水的差值。这时候，你就可以使用窗口函数。

2. **数据排名**：窗口函数可以方便地生成数据的排名信息，例如，你想要查看销售额的排名，可以使用 `RANK()` 或者 `ROW_NUMBER()` 函数。

3. **滚动计算**：计算移动平均。你可以定义窗口函数的窗口范围，然后进行滚动计算。

## 窗口函数列表

- 大多数聚合函数也可以用作窗口函数，例如，`SUM()`、`AVG()`、`COUNT()` 这些聚合函数可以与窗口函数一起使用，以在窗口内计算某个列的总和、平均值或计数。MatrixOne 支持的可做窗口函数的聚合函数和参考文档参见：

    * [AVG] (../../../Reference/Functions-and-Operators/Aggregate-Functions/avg.md)
    * [COUNT](../../../Reference/Functions-and-Operators/Aggregate-Functions/count.md)
    * [MAX](../../../Reference/Functions-and-Operators/Aggregate-Functions/max.md)
    * [SUM](../../../Reference/Functions-and-Operators/Aggregate-Functions/sum.md)
    * [MIN](../../../Reference/Functions-and-Operators/Aggregate-Functions/min.md)

- 其他窗口函数参见下表：

|函数名称 | 说明|
|---|---|
|[DENSE_RANK()](../../../Reference/Functions-and-Operators/Window-Functions/dense_rank.md)|用于为数据集中的行分配排名，始终为下一个值分配连续的排名，即使前面的值有相同的排名。|
|[RANK()](../../../Reference/Functions-and-Operators/Window-Functions/rank.md)|为查询结果集中的每一行分配一个排名值，相同值的行将具有相同的排名，而下一个排名值将会跳过相同数量的行。|
|[ROW_NUMBER()](../../../Reference/Functions-and-Operators/Window-Functions/row_number.md)|为查询结果集中的每一行分配一个唯一的整数值，根据指定的排序规则确定顺序。|

## 如何使用窗口函数

使用窗口函数通常需要以下步骤：

1. 定义窗口（Window）：通过使用 OVER 子句来定义窗口的范围，可以指定窗口的排序规则、分区方式和行范围等。

2. 编写窗口函数：在 `SELECT` 语句中，将窗口函数与其他列一起列出，指定需要在窗口内计算的列和操作。

下面是一个示例，演示如何使用窗口函数计算每个部门的销售总额和部门内每个员工的销售额排名：

```sql
CREATE TABLE SalesTable (
  Department VARCHAR(50),
  Employee VARCHAR(50),
  Sales INT
);

INSERT INTO SalesTable (Department, Employee, Sales) VALUES
('Marketing', 'John', 1000),
('Marketing', 'Jane', 1200),
('Sales', 'Alex', 900),
('Sales', 'Bob', 1100),
('HR', 'Alice', 800),
('HR', 'Charlie', 850);

SELECT
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

在上述示例中，`PARTITION BY` 子句用于将结果集按部门分区，然后 `SUM()` 函数计算每个部门的销售总额。同时，`ORDER BY` 子句指定按销售额降序排列，`RANK()` 函数根据销售额为每个部门内的员工分配排名。

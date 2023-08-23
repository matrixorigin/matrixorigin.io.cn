# 公共表表达式 (CTE)

公用表表达式（CTE,Common table expression) 是一个命名的临时结果集，仅在单个 SQL 语句 (例如 `SELECT`，`INSERT`，`UPDATE` 或 `DELETE`) 的执行范围内存在。

与派生表类似，CTE 不作为对象存储，仅在查询执行期间持续；与派生表不同，CTE 可以是自引用 ，也可以在同一查询中多次引用。此外，与派生表相比，CTE 提供了更好的可读性和性能。

**应用场景**：

- CTE 可以用于多个地方复用相同的子查询，避免重复编写相同的逻辑。
- 可以用于简化递归查询，例如查找树形结构数据。
- 可以将复杂的查询拆分为多个较小的部分，使查询逻辑更清晰易懂。

**通用表表达式分为非递归和递归两种类型**：

- 非递归公共表达式：是指 CTE 中不引用自身的表达式，它只用于构建一次性的临时结果集，不涉及递归操作。非递归 CTE 语法如下：

```sql
WITH <query_name> AS (
    <query_definition>
)
SELECT ... FROM <query_name>;
```

- 递归公共表达式：是指 CTE 中引用自身的表达式，用于处理具有递归结构的数据，例如树形结构、图形等。递归 CTE 在定义中包含一个基本查询（起始条件），然后在该基本查询的结果上进行递归操作，直到满足停止条件为止。递归 CTE 语法如下：

```sql
WITH RECURSIVE <query_name> AS (
    <query_definition>
)
SELECT ... FROM <query_name>;
```

## 开始前准备

你需要确认在开始之前，已经完成了以下任务：

已完成[单机部署 MatrixOne](../../Get-Started/install-standalone-matrixone.md)。

## CTE 语句使用示例

假设我们要创建一个名为 `EMPLOYEES` 的表，其中包含员工的层次结构关系，然后使用非递归 Common Table Expression（CTE）和递归 CTE 分别查询员工层次结构。

首先，我们创建一个 `EMPLOYEES` 表并插入一些示例数据：

```sql
CREATE TABLE EMPLOYEES (
    EMPLOYEE_ID INT PRIMARY KEY,
    NAME VARCHAR(50),
    MANAGER_ID INT
);

INSERT INTO EMPLOYEES (EMPLOYEE_ID, NAME, MANAGER_ID) VALUES
    (1, 'Alice', NULL),
    (2, 'Bob', 1),
    (3, 'Carol', 1),
    (4, 'David', 2),
    (5, 'Eve', 2),
    (6, 'Frank', 3),
    (7, 'Grace', 3),
    (8, 'Hannah', 4),
    (9, 'Ian', 4);
```

接下来，我们使用递归 CTE 查询员工层次结构：

```sql
WITH RECURSIVE EmployeeHierarchy AS (
    SELECT EMPLOYEE_ID, NAME, MANAGER_ID, 0 AS LEVEL
    FROM EMPLOYEES
    WHERE MANAGER_ID IS NULL

    UNION ALL

    SELECT e.EMPLOYEE_ID, e.NAME, e.MANAGER_ID, eh.LEVEL + 1
    FROM EMPLOYEES e
    INNER JOIN EmployeeHierarchy eh ON e.MANAGER_ID = eh.EMPLOYEE_ID
)
SELECT * FROM EmployeeHierarchy;
+-------------+--------+------------+-------+
| employee_id | name   | manager_id | level |
+-------------+--------+------------+-------+
|           1 | Alice  |       NULL |     0 |
|           2 | Bob    |          1 |     1 |
|           3 | Carol  |          1 |     1 |
|           4 | David  |          2 |     2 |
|           5 | Eve    |          2 |     2 |
|           6 | Frank  |          3 |     2 |
|           7 | Grace  |          3 |     2 |
|           8 | Hannah |          4 |     3 |
|           9 | Ian    |          4 |     3 |
+-------------+--------+------------+-------+
9 rows in set (0.01 sec)
```

然后，我们使用非递归 CTE 查询员工信息：

```sql
WITH EmployeeInfo AS (
    SELECT EMPLOYEE_ID, NAME, MANAGER_ID
    FROM EMPLOYEES
)
SELECT * FROM EmployeeInfo;
+-------------+--------+------------+
| employee_id | name   | manager_id |
+-------------+--------+------------+
|           1 | Alice  |       NULL |
|           2 | Bob    |          1 |
|           3 | Carol  |          1 |
|           4 | David  |          2 |
|           5 | Eve    |          2 |
|           6 | Frank  |          3 |
|           7 | Grace  |          3 |
|           8 | Hannah |          4 |
|           9 | Ian    |          4 |
+-------------+--------+------------+
9 rows in set (0.00 sec)
```

我们使用了一个递归 CTE `EmployeeHierarchy`，它首先选择顶层经理（`MANAGER_ID IS NULL`），然后通过递归连接找到每个员工的直接下属，同时跟踪层次级别。这样，我们就可以通过查询 CTE 来获取员工层次结构的详细信息。

非递归 CTE 示例只是从 `EMPLOYEES` 表中选择所有员工的基本信息，包括 `EMPLOYEE_ID`、`NAME` 和 `MANAGER_ID`。

注意，递归 CTE 需要使用 `RECURSIVE` 关键字来声明。

更多关于 CTE 的使用文档，参考[WITH (Common Table Expressions)](../../Reference/SQL-Reference/Data-Query-Language/with-cte.md)

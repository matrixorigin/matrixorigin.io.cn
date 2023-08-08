# **WITH (Common Table Expressions)**

## **语法说明**

公共表达式（CTE，common table expression），它是在单个语句的执行范围内定义的临时结果集，只在查询期间有效。它可以自引用，也可在同一查询中多次引用。作用是简化复杂的查询，提高代码的可读性和可维护性。公共表达式可以被视为一个临时视图，只在查询的执行周期内存在，对于外部查询是不可见的。

定义 `CTE` 后，可以像 `SELECT`，`INSERT`，`UPDATE`，`DELETE` 或 `CREATE VIEW` 语句一样引用它。

使用 `WITH` 从句指定通用表表达式，`WITH` 从句可以使用一个或多个逗号分隔。每个从句提供一个子查询，该子查询生成一个结果集，并将名称与子查询关联起来。

**应用场景**：

- CTE 可以用于多个地方复用相同的子查询，避免重复编写相同的逻辑。
- 可以用于简化递归查询，例如查找树形结构数据。
- 可以将复杂的查询拆分为多个较小的部分，使查询逻辑更清晰易懂。

**通用表表达式分为非递归和递归两种类型**：

- 非递归公共表达式：是指 CTE 中不引用自身的表达式，它只用于构建一次性的临时结果集，不涉及递归操作。

- 递归公共表达式：是指 CTE 中引用自身的表达式，用于处理具有递归结构的数据，例如树形结构、图形等。递归 CTE 在定义中包含一个基本查询（起始条件），然后在该基本查询的结果上进行递归操作，直到满足停止条件为止。

### 非递归 CTE

#### **语法结构**

```
WITH <query_name> AS (
    <query_definition>
)
SELECT ... FROM <query_name>;
```

#### 参数释义

- `<query_name>`：为 CTE 结果集指定的临时名称。它可以是任何有效的标识符，类似于表名或列名。

- `<query_definition>`：这是定义 CTE 结果集的查询语句。它可以是任何有效的 `SELECT` 查询，用于创建 CTE 的结果集。

- `SELECT ... FROM <query_name>`：这是在 CTE 上执行的查询，你可以在这里使用 CTE 的名称。

### 递归 CTE

#### **语法结构**

```
WITH RECURSIVE <query_name> AS (
    <query_definition>
)
SELECT ... FROM <query_name>;
```

#### 参数释义

- `WITH RECURSIVE`：用于指示这是一个递归 CTE。

- `<query_name>`：为递归 CTE 结果集指定的临时名称。它可以是任何有效的标识符，类似于表名或列名。

- `<query_definition>`：这是定义递归 CTE 结果集的查询语句。它包含两部分：

    + 初始部分：定义了递归的起始条件和初始结果集。
    + 递归部分：定义了如何从初始结果集递归地生成下一轮的结果集。

- `SELECT ... FROM <query_name>`：在递归 CTE 上使用递归 CTE 的名称进行查询。

## **示例**

- 非递归 CTE 示例：

```sql
CREATE TABLE employees (
    id INT PRIMARY KEY,
    name VARCHAR(50),
    salary INT
);

INSERT INTO employees (id, name, salary) VALUES
(1, 'Alice', 50000),
(2, 'Bob', 60000),
(3, 'Charlie', 75000),
(4, 'David', 55000),
(5, 'Eve', 80000);

-- 查找工资高于平均工资的员工
mysql> WITH avg_salary AS (
       SELECT AVG(salary) AS avg_salary FROM employees)
       SELECT name, salary
       FROM employees
       JOIN avg_salary ON salary > avg_salary.avg_salary;
+---------+--------+
| name    | salary |
+---------+--------+
| Charlie |  75000 |
| Eve     |  80000 |
+---------+--------+
2 rows in set (0.00 sec)
```

- 递归 CTE 示例：

```sql
CREATE TABLE employees_hierarchy (
    id INT PRIMARY KEY,
    name VARCHAR(50),
    manager_id INT
);

INSERT INTO employees_hierarchy (id, name, manager_id) VALUES
(1, 'Alice', NULL),
(2, 'Bob', 1),
(3, 'Charlie', 1),
(4, 'David', 2),
(5, 'Eve', 2),
(6, 'Frank', 3);

-- 查找某个员工及其所有下属员工
mysql> WITH RECURSIVE employee_hierarchy_cte (id, name, manager_id, level) AS (
    SELECT id, name, manager_id, 0
    FROM employees_hierarchy
    WHERE name = 'Alice'
    UNION ALL
    SELECT e.id, e.name, e.manager_id, eh.level + 1
    FROM employees_hierarchy AS e
    JOIN employee_hierarchy_cte AS eh ON e.manager_id = eh.id
)
SELECT name, level
FROM employee_hierarchy_cte;
+---------+-------+
| name    | level |
+---------+-------+
| Alice   |     0 |
| Bob     |     1 |
| Charlie |     1 |
| David   |     2 |
| Eve     |     2 |
| Frank   |     2 |
+---------+-------+
6 rows in set (0.00 sec)
```

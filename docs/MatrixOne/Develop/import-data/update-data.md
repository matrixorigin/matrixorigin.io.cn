# 更新数据

本文档介绍如何使用 SQL 语句在 MatrixOne 中更新数据。

## 开始前准备

已完成[单机部署 MatrixOne](../../Get-Started/install-standalone-matrixone.md)。

## 更新数据 SQL 语句

你可以通过两种方式更新数据：`UPDATE` 和 `INSERT ON DUPLICATE KEY UPDATE`。

二者的区别是：

-**[`UPDATE`](../../Reference/SQL-Reference/Data-Manipulation-Language/update.md)**：

- UPDATE 语句用于直接更新已存在的行的数据。
- 需要明确指定要更新的表、列和对应的新值，以及更新的条件。
- 如果满足更新条件，将会修改已存在的行的数据。
- 如果更新的条件不满足，将不会有任何修改操作。

**[`INSERT ON DUPLICATE KEY UPDATE`](../../Reference/SQL-Reference/Data-Manipulation-Language/insert-on-duplicate.md)**：

- INSERT ON DUPLICATE KEY UPDATE 是 INSERT 语句的一个扩展，用于在插入新行时处理重复键的情况。
- 当插入的数据中存在重复键时，即某一列或组合列的值与已存在的行的键值相同，将执行 UPDATE 操作而不是插入新行。
- 可以一次性指定要插入的数据以及在重复键冲突时要进行的更新操作。
- 对于重复键的行，将根据指定的更新操作更新相应的列。

关键区别：

- UPDATE 语句用于直接更新已存在的行，而 INSERT ON DUPLICATE KEY UPDATE 语句用于在插入数据时处理重复键的情况。
- UPDATE 语句需要明确指定要更新的表、列和对应的新值，以及更新的条件。而 INSERT ON DUPLICATE KEY UPDATE 语句通过一次性指定要插入的数据和更新操作，对于重复键的行执行更新操作。

### `UPDATE`

```
UPDATE table_reference
    SET assignment_list
    [WHERE where_condition]
    [ORDER BY ...]
    [LIMIT row_count]
```

1. `UPDATE table_reference`：指定要更新数据的目标表。table_reference 可以是单个表或多个表的联接。

2. `SET assignment_list`：指定要更新的列和值。assignment_list 是一个由列名和相应的值组成的列表，用逗号分隔。每个列名后面使用等号（=）将其与要更新的新值相关联。

3. `[WHERE where_condition]`（可选）：WHERE 子句用于指定更新数据的条件。只有满足指定条件的行才会被更新。where_condition 是一个逻辑表达式，可以使用各种比较运算符和逻辑运算符来定义条件。

4. `[ORDER BY ...]`（可选）：ORDER BY 子句用于按指定的列对要更新的行进行排序。可以使用一个或多个列，并可以指定升序（ASC）或降序（DESC）排序。排序将影响更新的行的顺序。

5. `[LIMIT row_count]`（可选）：LIMIT 子句用于限制要更新的行数。它指定要更新的最大行数（row_count）。如果未指定 LIMIT 子句，则将更新满足 WHERE 条件的所有行。

更新数据的过程中，指定要更新的表、要更新的列和值、更新的条件以及排序和限制，以便根据需求进行灵活的数据更新。

### `INSERT ON DUPLICATE KEY UPDATE`

```
> INSERT INTO [db.]table [(c1, c2, c3)] VALUES (v11, v12, v13), (v21, v22, v23), ...
  [ON DUPLICATE KEY UPDATE column1 = value1, column2 = value2, column3 = value3, ...];
```

1. `INSERT INTO [db.]table [(c1, c2, c3)] VALUES (v11, v12, v13), (v21, v22, v23), ...`
   - `INSERT INTO` 语句用于向表中插入新的行。
   - `[db.]`（可选）指定表所在的数据库名称。如果未提供数据库名称，则默认为当前数据库。
   - `table` 是要插入数据的目标表的名称。
   - `[(c1, c2, c3)]`（可选）指定要插入的列，用括号括起来，并使用逗号分隔列名。如果未指定列名，则假定将插入表中所有可用的列。
   - `VALUES` 子句指定要插入的值。每个值与对应的列一一对应，用逗号分隔，放在括号中。可以插入多行数据，每一行用逗号分隔。

2. `[ON DUPLICATE KEY UPDATE column1 = value1, column2 = value2, column3 = value3, ...]`
   - `ON DUPLICATE KEY UPDATE` 子句用于在插入数据时处理重复键（Duplicate Key）的情况。
   - 当插入的数据中存在重复键时，即某一列或组合列的值与已存在的行的键值相同，将执行 UPDATE 操作而不是插入新行。
   - `column1, column2, column3` 等表示要更新的列名，`value1, value2, value3` 等表示要更新的对应值。

这个语法结构允许将一行或多行数据插入到指定的表中。如果出现重复键的情况，即已存在相同键值的行，可以选择执行 `UPDATE` 操作来更新该行的数据。

请注意，在使用 INSERT INTO 语句时，根据表的结构和需求，提供相应的列名和对应的值。如果存在重复键的情况，并且使用了 `ON DUPLICATE KEY UPDATE` 子句，指定要更新的列和对应的值。

## 示例

- 示例 1：`UPDATE`

```sql
-- 创建表
CREATE TABLE employees (
  id INT PRIMARY KEY,
  name VARCHAR(50),
  department VARCHAR(50),
  salary DECIMAL(10, 2)
);

-- 插入数据
INSERT INTO employees (id, name, department, salary)
VALUES (1, 'John Doe', 'HR', 5000),
       (2, 'Jane Smith', 'Marketing', 6000),
       (3, 'Mike Johnson', 'IT', 7000),
       (4, 'Emily Brown', 'Finance', 8000),
       (5, 'David Wilson', 'HR', 5500);

-- 查看初始数据
mysql> SELECT * FROM employees;
+------+--------------+------------+---------+
| id   | name         | department | salary  |
+------+--------------+------------+---------+
|    1 | John Doe     | HR         | 5000.00 |
|    2 | Jane Smith   | Marketing  | 6000.00 |
|    3 | Mike Johnson | IT         | 7000.00 |
|    4 | Emily Brown  | Finance    | 8000.00 |
|    5 | David Wilson | HR         | 5500.00 |
+------+--------------+------------+---------+
5 rows in set (0.01 sec)

-- 更新数据，使用 UPDATE 语句更新了部门为'HR'的前两个员工的薪资，薪资增加了 10%。WHERE 子句指定了更新数据的条件，只有满足部门为'HR'的行才会被更新。ORDER BY 子句按照 id 列进行升序排序，LIMIT 子句限制只更新两行数据。
mysql> UPDATE employees
       SET salary = salary * 1.1
       WHERE department = 'HR'
       ORDER BY id
       LIMIT 2;
Query OK, 2 rows affected (0.02 sec)

-- 查看更新后的数据
mysql> SELECT * FROM employees;
+------+--------------+------------+---------+
| id   | name         | department | salary  |
+------+--------------+------------+---------+
|    2 | Jane Smith   | Marketing  | 6000.00 |
|    3 | Mike Johnson | IT         | 7000.00 |
|    4 | Emily Brown  | Finance    | 8000.00 |
|    1 | John Doe     | HR         | 5500.00 |
|    5 | David Wilson | HR         | 6050.00 |
+------+--------------+------------+---------+
5 rows in set (0.00 sec)
```

- 示例 2：`INSERT ... ON DUPLICATE KEY UPDATE`

```sql
-- 创建表
CREATE TABLE students (
  id INT PRIMARY KEY,
  name VARCHAR(50),
  age INT,
  grade VARCHAR(10)
);

-- 插入数据
INSERT INTO students (id, name, age, grade)
VALUES (1, 'John Doe', 18, 'A'),
       (2, 'Jane Smith', 17, 'B'),
       (3, 'Mike Johnson', 19, 'A'),
       (4, 'Emily Brown', 18, 'A');

-- 查看初始数据
mysql> SELECT * FROM students;
+------+--------------+------+-------+
| id   | name         | age  | grade |
+------+--------------+------+-------+
|    1 | John Doe     |   18 | A     |
|    2 | Jane Smith   |   17 | B     |
|    3 | Mike Johnson |   19 | A     |
|    4 | Emily Brown  |   18 | A     |
+------+--------------+------+-------+
4 rows in set (0.01 sec)

-- 更新数据
mysql> INSERT INTO students (id, name, age, grade)
       VALUES (2, 'Jane Smith', 18, 'A')
       ON DUPLICATE KEY UPDATE age = VALUES(age), grade = VALUES(grade);
Query OK, 1 row affected (0.01 sec)

-- 查看更新后的数据
mysql> SELECT * FROM students;
+------+--------------+------+-------+
| id   | name         | age  | grade |
+------+--------------+------+-------+
|    1 | John Doe     |   18 | A     |
|    3 | Mike Johnson |   19 | A     |
|    4 | Emily Brown  |   18 | A     |
|    2 | Jane Smith   |   18 | A     |
+------+--------------+------+-------+
4 rows in set (0.00 sec)
```

在上述示例中，首先创建了一个名为 `students` 的表，包含 `id`、`name`、`age` 和 `grade` 四个列。然后，使用 `INSERT INTO` 语句插入了四行学生数据。

接下来，使用 SELECT 语句查看初始数据。然后，使用 INSERT INTO 语句插入了一行学生数据，其中 `id` 为 2 的学生已经存在，这会导致重复键的情况。在这种情况下，使用 `ON DUPLICATE KEY UPDATE` 子句来更新该行的数据。通过 VALUES 函数，我们指定要更新的列和对应的值。

最后，使用 `SELECT` 语句再次查看更新后的数据，可以看到 `id` 为 2 的学生的年龄和成绩已经被更新。

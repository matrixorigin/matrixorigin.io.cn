# 删除数据

本文档介绍如何使用 SQL 语句在 MatrixOne 中删除数据。

## 开始前准备

已完成[单机部署 MatrixOne](../../Get-Started/install-standalone-matrixone.md)。

## 删除数据 SQL 语句

你可以通过三种方式删除数据：`DROP TABLE`、`TRUNCATE TABLE` 和 `DELETE TABLE`。

三者的区别是：

- [`DELETE TABLE`](../../Reference/SQL-Reference/Data-Manipulation-Language/delete.md)：当你要删除部分记录时，用 `DELETE TABLE`。
- [`TRUNCATE TABLE`](../../Reference/SQL-Reference/Data-Definition-Language/truncate-table.md)：当你仍要保留该表，表的结构、索引和约束等都需要保持不变，但要删除所有记录时，用 `TRUNCATE TABLE`。
- [`DROP TABLE`](../../Reference/SQL-Reference/Data-Definition-Language/drop-table.md)：当你不再需要该表时，用 `DROP TABLE`。

### `DELETE`

```
DELETE FROM tbl_name [[AS] tbl_alias]
    [WHERE where_condition]
    [ORDER BY ...]
    [LIMIT row_count]
```

1. `DELETE FROM tbl_name`：指定要从表中删除数据的目标表。tbl_name 是表的名称。

2. `[AS] tbl_alias`（可选）：可以使用 AS 关键字为目标表指定一个表别名（tbl_alias）。别名是可选的，用于简化查询并在语句中引用表。

3. `[WHERE where_condition]`（可选）：WHERE 子句用于指定删除数据的条件。只有满足指定条件的行才会被删除。where_condition 是一个逻辑表达式，可以使用各种比较运算符和逻辑运算符来定义条件。

4. `[ORDER BY ...]`（可选）：ORDER BY 子句用于按指定的列对要删除的行进行排序。可以使用一个或多个列，并可以指定升序（ASC）或降序（DESC）排序。排序将影响删除的行的顺序。

5. `[LIMIT row_count]`（可选）：LIMIT 子句用于限制从表中删除的行数。它指定要删除的最大行数（row_count）。如果未指定 LIMIT 子句，则将删除满足 WHERE 条件的所有行。

### `TRUNCATE`

```
> TRUNCATE [TABLE] table_name;
```

`TRUNCATE` 语句用于删除表中的所有数据，保留表的结构。它将快速清空表，而不是逐行删除数据。

- `[TABLE]`（可选）关键字用于提供更清晰的语法，但在大多数数据库系统中可以省略。
- `table_name` 是要进行操作的目标表的名称。

### `DROP`

```
> DROP TABLE [IF EXISTS] [db.]name
```

`DROP TABLE` 语句用于完全删除数据库中的表，包括表的结构和数据。

- `[IF EXISTS]`（可选）关键字表示如果表存在，则执行删除操作。如果省略此关键字，并且要删除的表不存在，将引发错误。
- `[db.]`（可选）指定表所在的数据库名称。如果未提供数据库名称，则默认为当前数据库。
- `name` 是要删除的表的名称。

## GC（Garbage Collection）机制

在默认配置下，MatrixOne 在执行 `DELETE`、`DROP` 或 `TRUNCATE` 语句后，并不会立即从磁盘中删除数据，而是将这些数据标记为可删除状态。随后，GC（垃圾回收）机制会定期进行扫描，并清理不再需要的旧数据。

默认情况下，垃圾回收机制每隔 30 分钟进行一次扫描。每次扫描会查找超过 1 小时通过 SQL 语句被删除的数据，并开始清理操作，以释放磁盘空间。完成所有清理的最长周期为 90 分钟。因此，需要注意的是，执行 `DELETE`、`DROP` 或 `TRUNCATE` 语句并不会立即减少磁盘使用量。只有在垃圾回收过程中，被标记为可删除的数据才会被清理并释放空间。

## 示例

- 示例 1

```sql
-- 创建表
CREATE TABLE employees (
  id INT PRIMARY KEY,
  name VARCHAR(50),
  department VARCHAR(50)
);

-- 插入数据
INSERT INTO employees (id, name, department)
VALUES (1, 'John Doe', 'HR'),
       (2, 'Jane Smith', 'Marketing'),
       (3, 'Mike Johnson', 'IT'),
       (4, 'Emily Brown', 'Finance');

-- 查看初始数据
mysql> SELECT * FROM employees;
+------+--------------+------------+
| id   | name         | department |
+------+--------------+------------+
|    1 | John Doe     | HR         |
|    2 | Jane Smith   | Marketing  |
|    3 | Mike Johnson | IT         |
|    4 | Emily Brown  | Finance    |
+------+--------------+------------+
4 rows in set (0.01 sec)

-- 删除部分数据
mysql> DELETE FROM employees WHERE department = 'IT';
Query OK, 1 row affected (0.01 sec)

-- 查看删除后的数据
mysql> SELECT * FROM employees;
+------+-------------+------------+
| id   | name        | department |
+------+-------------+------------+
|    1 | John Doe    | HR         |
|    2 | Jane Smith  | Marketing  |
|    4 | Emily Brown | Finance    |
+------+-------------+------------+
3 rows in set (0.00 sec)
```

- 示例 2

```sql
-- 创建表
CREATE TABLE orders (
  order_id INT PRIMARY KEY,
  customer_name VARCHAR(50),
  order_date DATE
);

-- 插入数据
INSERT INTO orders (order_id, customer_name, order_date)
VALUES (1, 'John Doe', '2022-01-01'),
       (2, 'Jane Smith', '2022-02-01'),
       (3, 'Mike Johnson', '2022-03-01'),
       (4, 'Emily Brown', '2022-04-01'),
       (5, 'David Wilson', '2022-05-01');

-- 查看初始数据
mysql> SELECT * FROM orders;
+----------+---------------+------------+
| order_id | customer_name | order_date |
+----------+---------------+------------+
|        1 | John Doe      | 2022-01-01 |
|        2 | Jane Smith    | 2022-02-01 |
|        3 | Mike Johnson  | 2022-03-01 |
|        4 | Emily Brown   | 2022-04-01 |
|        5 | David Wilson  | 2022-05-01 |
+----------+---------------+------------+
5 rows in set (0.01 sec)

-- 删除最早的两个订单
mysql> DELETE FROM orders
       WHERE order_id IN (
       SELECT order_id
       FROM orders
       ORDER BY order_date
       LIMIT 2);
Query OK, 2 rows affected (0.01 sec)

-- 查看删除后的数据
mysql> SELECT * FROM orders;
+----------+---------------+------------+
| order_id | customer_name | order_date |
+----------+---------------+------------+
|        3 | Mike Johnson  | 2022-03-01 |
|        4 | Emily Brown   | 2022-04-01 |
|        5 | David Wilson  | 2022-05-01 |
+----------+---------------+------------+
3 rows in set (0.01 sec)
```

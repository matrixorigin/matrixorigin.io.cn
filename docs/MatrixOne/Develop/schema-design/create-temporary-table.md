# 创建临时表

## 什么是临时表

临时表（temporary table）是一种特殊的表，它在创建后只在当前会话可见。在当前会话结束时，数据库自动删除临时表并释放所有空间，你也可以使用 `DROP TABLE` 删除临时表。

你可以使用临时表在一次会话中保存一些中间结果，例如，你可能需要多次查询这些结果，或者这些结果是其他查询的子集。

## 临时表的优点

临时表在数据库设计中具有多种用途和优点：

- **数据隔离**：临时表在每个会话或事务中是独立的。这意味着，两个相同名称的临时表可以在两个不同的会话中存在，并且不会互相影响。

- **简化复杂查询**：如果一个查询非常复杂，涉及到多个联接和子查询，那么可以将查询结果保存到临时表中，然后在这个临时表上进行操作，从而简化查询和提高性能。

- **提高性能**：对于大数据集的复杂查询，将数据保存在临时表中可以显著提高查询性能。因为临时表保存在内存中，所以访问速度快。

- **保护数据**：使用临时表可以避免对原始数据进行修改。当你需要执行可能会改变原始数据的操作时，可以先将数据存入临时表，然后在临时表上进行操作，这样可以避免误改原始数据。

- **节省存储空间**：临时表在不再需要时会自动删除，这样可以节省存储空间。

- **有助于调试**：在复杂的嵌套查询中，临时表可以用来存储中间结果，以帮助调试和验证每一步的输出结果。

请注意，临时表并非万能的，它们也有一些限制，比如只能在当前会话中访问，而且一旦会话结束，临时表就会消失。

## 开始前准备

在阅读本页面之前，你需要准备以下事项：

- 了解并已经完成构建 MatrixOne 集群。
- 了解什么是[数据库模式](overview.md)。

## 如何使用临时表

使用临时表的语法与常规表相同，只是在创建表的语句前面添加了 TEMPORARY 关键字：

```sql
CREATE TEMPORARY TABLE temp_table_name (column_list);
```

你可以在临时表和常规表中使用相同的表名，而不会产生冲突，因为它们实际上是在不同的命名空间中。但是，在同一个会话中，两个临时表不能共享相同的名称。

!!! note
    1. 即使临时表可以与永久表具有相同的名称，但不推荐。因为这可能会导致意外的数据丢失。例如，如果与数据库服务器的连接丢失，并且您自动重新连接到服务器，则不能区分临时表和永久性表。如果此时你又发出一个 `DROP TABLE` 语句，这个时候删除的可能是永久表而不是临时表，这种结果是不可预料的。
    2. 使用 `SHOW TABLES` 命令显示数据表列表时，你也无法看到临时表列表。

## 示例

```sql
-- 创建一个临时表 'temp_employees'
CREATE TEMPORARY TABLE temp_employees (
    employee_id INT AUTO_INCREMENT,  -- 自增的员工 ID
    first_name VARCHAR(50),          -- 员工名
    last_name VARCHAR(50),           -- 员工姓
    email VARCHAR(100),              -- 员工电子邮件地址
    PRIMARY KEY (employee_id)        -- 设定 'employee_id' 为主键
);

-- 向 'temp_employees' 表中插入一些数据
INSERT INTO temp_employees (first_name, last_name, email)
VALUES ('John', 'Doe', 'john.doe@example.com'),
       ('Jane', 'Doe', 'jane.doe@example.com'),
       ('Jim', 'Smith', 'jim.smith@example.com'),
       ('Jack', 'Johnson', 'jack.johnson@example.com'),
       ('Jill', 'Jackson', 'jill.jackson@example.com');

-- 查询临时表，查看所有员工信息
SELECT * FROM temp_employees;
+-------------+------------+-----------+--------------------------+
| employee_id | first_name | last_name | email                    |
+-------------+------------+-----------+--------------------------+
|           1 | John       | Doe       | john.doe@example.com     |
|           2 | Jane       | Doe       | jane.doe@example.com     |
|           3 | Jim        | Smith     | jim.smith@example.com    |
|           4 | Jack       | Johnson   | jack.johnson@example.com |
|           5 | Jill       | Jackson   | jill.jackson@example.com |
+-------------+------------+-----------+--------------------------+
5 rows in set (0.01 sec)

-- 注意：在这个会话结束时，临时表 'temp_employees' 将被自动删除
```

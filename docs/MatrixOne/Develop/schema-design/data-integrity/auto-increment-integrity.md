# AUTO INCREMENT 自增约束

自增约束（Auto-Increment Constraint）是 MatrixOne 一种用于自动为表中的列生成唯一标识值的特性。它允许你在插入新行时，自动为指定的自增列生成一个递增的唯一值。这在许多情况下非常有用，例如用作主键或标识符。

**自增约束特性**

自增约束可以简化标识符的生成和管理。在使用自增列时，需要注意以下几点：

- 自增列通常用作主键，因此应保证其唯一性。
- 自增列的数据类型应根据需求选择适当的整数类型。
- 自增列的值在插入新行时自动生成，无法手动指定。
- 自增值在表中是唯一的，并且在后续的插入操作中会自动递增。
- 可以通过修改表定义来自定义自增值的起始值和递增步长。

请根据具体的表结构和需求，使用自增约束来简化标识符的生成和管理，并确保数据的完整性和唯一性。

### 语法说明

在创建表时，可以为一个列定义自增约束。通常，自增列的数据类型为整数类型（如 `INT` 或 `BIGINT`）。在创建表时，使用 `AUTO_INCREMENT` 关键字为列添加自增约束。

```sql
CREATE TABLE table_name (
  column_name data_type AUTO_INCREMENT,
  ...
  PRIMARY KEY (primary_key_column)
);
```

- `table_name`：表的名称。
- `column_name`：要定义为自增的列的名称。
- `data_type`：列的数据类型，通常为整数类型（如 `INT` 或 `BIGINT`）。
- `primary_key_column`：表的主键列。

### 示例

下面是一个创建带有自增列的表的示例：

```sql
-- 创建了一个名为`employees`的表，其中`id`列被定义为自增列。`id`列的数据类型为`INT`，并通过`AUTO_INCREMENT`关键字指定了自增约束。表的主键设置为`id`列
CREATE TABLE employees (
  id INT AUTO_INCREMENT,
  name VARCHAR(50),
  department VARCHAR(50),
  PRIMARY KEY (id)
);

-- 插入数据，并让自增列自动生成唯一的标识值，没有为`id`列指定值，而是通过插入数据时自动为`id`列生成递增的唯一值。每次插入新行时，`id`列的值将自动递增。

INSERT INTO employees (name, department)
VALUES ('John Doe', 'HR'),
       ('Jane Smith', 'Marketing'),
       ('Mike Johnson', 'IT');

-- `id` 列的值自动递增，并为每个新插入的行生成唯一的标识值。
mysql> SELECT * FROM employees;
+------+--------------+------------+
| id   | name         | department |
+------+--------------+------------+
|    1 | John Doe     | HR         |
|    2 | Jane Smith   | Marketing  |
|    3 | Mike Johnson | IT         |
+------+--------------+------------+
3 rows in set (0.01 sec)
```

## 限制

1. MatrixOne 暂时还不支持使用 `ALTER TABLE` 修改自增值的起始值和递增步长。
2. 在 MatrixOne 中，虽然语法上支持使用 `set @@auto_increment_increment=n` 来设置递增步长，但实际上并不生效；当前支持设置自增列的初始值 `AUTO_INCREMENT=n`，但步长仍然默认为 1。

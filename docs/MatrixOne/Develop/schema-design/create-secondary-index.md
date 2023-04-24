# 创建次级索引

## 什么是次级索引

在非主键上标识的索引，次级索引也称为非聚集索引（non-clustered index），用于提高查询性能和加速数据检索。次级索引并不直接存储表数据，而是对数据的一部分（如某个列）建立索引，从而允许数据库系统快速定位表中包含特定值的行。

使用次级索引可以帮助加速查询操作，特别是在对大型表进行查询时。次级索引还可以用于支持排序、分组和连接操作，这些操作通常需要对表中的一部分数据进行排序或者匹配。

## 开始前准备

在阅读本页面之前，你需要准备以下事项：

- 了解并已经完成构建 MatrixOne 集群。
- 了解什么是[数据库模式](overview.md)。

## 使用次级索引

创建次级索引可以通过 `CREATE INDEX` 语句创建次级索引，指定索引所针对的列以及其他索引选项。

语法结构为：`CREATE INDEX index_name ON table_name (column_name);`

其中，`index_name` 是索引的名称，`table_name` 是要在其上创建索引的表格名称，而 `column_name` 是用于创建索引的列名。

例如，如果要在名为 `employees` 的表格的 `last_name` 列上创建一个次级索引，可以使用以下 SQL 语句：

```sql
CREATE INDEX idx_lastname ON employees (last_name);
```

使用次级索引：可以在查询语句中使用次级索引来定位数据行。SQL 查询优化器会自动选择合适的索引来执行查询操作，以获得最佳性能。如：

```sql
SELECT * FROM employees WHERE last_name = 'Smith';
```

在这个例子中，查询优化器会使用 `idx_lastname` 索引来定位 `last_name` 为 `Smith` 的数据行。

需要注意的是，创建索引会增加数据库的存储和维护成本，并且在插入、更新和删除数据时也可能会影响性能。因此，在创建次级索引时需要仔细考虑其对数据库性能的影响，并进行必要的优化和调整。

## 示例

```sql
CREATE TABLE users (id INT PRIMARY KEY,
  name VARCHAR(50),
  age INT,
  email VARCHAR(50)
);
-- 我们可以在表格上创建一个次级索引来加快按名字查询用户的速度
CREATE INDEX idx_users_name ON users(name);
-- 插入一些数据
INSERT INTO users VALUES ('1', 'John', '30', 'john@gmail.com');
INSERT INTO users VALUES ('2', 'Tommy', '50', 'tom@gmail.com');
INSERT INTO users VALUES ('3', 'Ann', '33', 'ann@gmail.com');
-- 执行如下查询，数据库可以使用次级索引来快速地查找所有名字为“John”的用户，而不必扫描整个表格。
mysql> SELECT * FROM users WHERE name = 'John';
+------+------+------+----------------+
| id   | name | age  | email          |
+------+------+------+----------------+
|    1 | John |   30 | john@gmail.com |
+------+------+------+----------------+
1 row in set (0.00 sec)
```

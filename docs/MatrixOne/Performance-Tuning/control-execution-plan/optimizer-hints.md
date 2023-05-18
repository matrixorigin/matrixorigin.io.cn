# Optimizer Hints

当你确定了执行计划所存在的问题时，比如优化器选择的不是最优查询计划时，可以使用 Optimizer Hints 来控制执行计划的生成。

`Hint` 提示指令告诉查询优化器如何执行查询语句。通过使用提示，可以为查询提供有关如何访问数据的信息，以提高查询的性能。`Hint` 提示指令通常用于调优大型或复杂的查询。

提示可以用于修改查询的执行计划，包括选择不同的索引、使用不同的 `JOIN` 算法或改变连接顺序等。<!--提示可以用于控制查询的缓存行为，如强制刷新缓存或不缓存查询结果等。-->

SQL 中的提示使用注释语法，可以在查询语句中添加特定的注释来指定提示。

## 语法格式

```
{DELETE|INSERT|SELECT|UPDATE} /*+ hint [text] [hint[text]]... */
```

### 语法解释

- `DELETE`、`INSERT`、`SELECT`、`UPDATE` 是 SQL 语句的关键字。

- `/*+ */` 是 SQL 语句中的注释符号。

- `hint` 是提示的具体指令。

- `text` 是提示指令的参数。

以下是一些常用的 SQL 提示：

`/*+ INDEX (table index) */`：指定使用特定的索引来执行查询。

`/*+ FULL (table) */`：指定执行全表扫描而不是使用索引。

<!--/*+ NOCACHE */：指定不要缓存查询结果。-->

<!--/*+ USE_HASH (table) */：指定使用哈希连接算法。-->

## 应用场景

- 查询优化器选择不合适的执行计划时，可以使用 `hint` 提示来指定一个更好的执行计划。例如，当查询涉及多个表时，优化器可能会选择错误的连接算法或连接顺序，从而导致查询的性能下降。在这种情况下，可以使用提示来指定一个更好的连接算法或连接顺序。

- 当查询包含复杂的子查询或聚合函数时，可以使用 `hint` 提示来优化查询的执行计划。由于优化器无法分析复杂的子查询或聚合函数，因此可能会选择错误的执行计划，从而导致查询的性能下降。

- 当查询访问的数据量非常大时，可以使用 `hint` 提示来优化查询的执行计划。在这种情况下，可以使用提示来指定使用特定的索引或连接算法，以提高查询的性能。

MatrixOne 支持使用 `hint` 提示用于选择全表扫描或使用索引扫描，以及优化多表连接的顺序。

- 选择全表扫描或使用索引扫描：

使用索引扫描可以加快查询的速度，但在某些情况下，全表扫描可能比使用索引扫描更快。例如，当查询条件过于宽泛时，使用索引可能会变得比较缓慢。在这种情况下，可以使用以下提示语法来选择使用全表扫描或索引扫描：

```sql
SELECT /*+ INDEX(table_name index_name) */ column_name FROM table_name WHERE ...
```

其中，table_name 是表名，index_name 是索引名，column_name 是列名。如果指定了索引名，则查询将使用该索引进行扫描。如果没有指定索引名，则查询将使用全表扫描。

- 优化多表连接的顺序：

当查询涉及多个表时，查询优化器将尝试选择最优的连接顺序。但在某些情况下，优化器可能无法选择最优的连接顺序，从而导致查询的性能下降。在这种情况下，可以使用以下提示语法来优化多表连接的顺序：

```sql
SELECT /*+ ORDERED */ column_name FROM table1, table2 WHERE table1.column1 = table2.column2;
```

其中，ORDERED 指定了查询应按照表的顺序连接，即先连接 table1，再连接 table2。这样可以避免优化器选择错误的连接顺序，从而提高查询的性能。

## 示例

```sql
-- 新建一个 名为 orders 的表
CREATE TABLE order (
  order_id INT PRIMARY KEY,
  customer_id INT,
  order_date DATE,
  order_total DECIMAL(10, 2)
);
-- 插入数据
INSERT INTO order (order_id, customer_id, order_date, order_total)
VALUES
  (1, 101, '2022-05-10', 100.00),
  (2, 102, '2022-05-09', 150.00),
  (3, 103, '2022-05-08', 200.00),
  (4, 104, '2022-05-07', 50.00);
-- 查询某个客户的所有订单，并按订单日期降序排列
SELECT order_id, order_date, order_total
FROM orders
WHERE customer_id = 123
ORDER BY order_date DESC;
```

为了优化这个查询，我们可以使用以下 `hint` 提示：

```sql
-- 使用名为 idx_customer_id 的索引来执行查询，这个索引是基于 customer_id 字段创建的
SELECT /*+ INDEX(orders idx_customer_id) */ order_id, order_date, order_total
FROM orders
WHERE customer_id = 123
ORDER BY order_date DESC;
```

## 限制

当前 `/*+ HINT_NAME(t1, t2) */` 仅语法实现，暂无法控制执行计划。

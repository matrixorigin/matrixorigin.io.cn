# 创建视图

## 什么是视图

视图（View）是一个基于 SQL 语句的结果集的可视化、只读的虚拟表，其内容由查询定义。与普通表（存储数据的表）不同，视图不包含数据，仅仅是基于基表（被查询的表）的查询结果的格式化显示。你可以把视图看作是一张表的窗口，这个窗口中的数据反映在其他表上。当查询视图时，数据库会将该视图的 SQL 查询应用到其基础表上。

## 视图的优点

- 简化查询：对于复杂的查询，可以创建视图来隐藏查询的复杂性，只需要从视图中选择数据，而不需要记住复杂的查询语句。

- 增加额外的安全层：视图可以限制用户访问某些数据库字段，只展示他们需要看到的字段，这样可以保护数据的安全。

- 保持数据一致性：如果多个查询需要用到相同的查询子句，那么创建视图可以保持数据一致性。

- 逻辑抽象：视图可以表示基表数据的有用部分，或者汇总，以及从几个表组合而来的信息。

但是视图也有缺点：

- 性能：从数据库视图查询数据可能会很慢，特别是如果视图是基于其他视图创建的。

- 依赖其他表：将根据数据库的基础表创建一个视图。并不是所有的视图都支持对数据进行更新，这主要取决于视图的定义以及它的基础表。

## 开始前准备

在阅读本页面之前，你需要准备以下事项：

- 了解并已经完成构建 MatrixOne 集群。
- 了解什么是[数据库模式](overview.md)。

## 如何使用视图

创建视图的语法如下：

```sql
CREATE VIEW view_name AS
SELECT column1, column2, ...
FROM table_name
WHERE condition;
```

创建视图后，你可以像查询其他表一样查询视图：

```sql
SELECT column1, column2, ...
FROM view_name;
```

## 示例

```sql
-- 创建一个名为 'orders' 的表
CREATE TABLE orders (
    order_id INT AUTO_INCREMENT,
    customer_id INT,
    order_date DATE,
    order_amount DOUBLE,
    PRIMARY KEY (order_id)
);

-- 向 'orders' 表中插入一些数据
INSERT INTO orders (customer_id, order_date, order_amount)
VALUES (1, '2023-01-01', 99.99),
       (1, '2023-01-03', 29.99),
       (2, '2023-01-03', 49.99),
       (3, '2023-01-05', 89.99),
       (1, '2023-01-07', 59.99),
       (2, '2023-01-07', 19.99);

-- 创建一个名为 'order_summary' 的视图，它展示每个客户的总订单数量和总订单金额
CREATE VIEW order_summary AS
SELECT customer_id, COUNT(*) as order_count, SUM(order_amount) as total_amount
FROM orders
GROUP BY customer_id;

-- 查询视图
mysql> SELECT *
FROM order_summary;
+-------------+-------------+--------------+
| customer_id | order_count | total_amount |
+-------------+-------------+--------------+
|           1 |           3 |       189.97 |
|           2 |           2 |        69.98 |
|           3 |           1 |        89.99 |
+-------------+-------------+--------------+
3 rows in set (0.01 sec)
```

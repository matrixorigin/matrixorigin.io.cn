# 使用 CTAS 复制表

## 什么是 CTAS

CTAS([Create Table As Select](../../Reference/SQL-Reference/Data-Definition-Language/create-table-as-select.md))，是一种 SQL 语句，用于基于现有表或查询结果快速创建一个新表 (复制表）。CTAS 语句执行时，会根据 SELECT 子句生成的数据直接创建一个新表，并且新表的列结构和数据类型会与 SELECT 子句中的结果集保持一致。

## 应用场景

CTAS 的应用场景非常广泛，主要包括：

- 数据迁移：使用 CTAS 可以快速地将数据从一个表迁移到另一个表，同时可以改变表的存储结构和分布策略，以适应不同的查询和存储需求。

- 数据备份：CTAS 可以用来创建数据的备份副本，这对于数据恢复和历史数据分析非常有用。

- 表结构变更：当需要修改表结构（如添加或删除列、更改数据类型等）时，CTAS 可以创建一个新的表来反映这些更改，而不会影响原始表。

- 数据科学和机器学习：在数据科学项目中，CTAS 可以用于准备数据集，创建适合机器学习模型训练的干净、格式化的数据表。

CTAS 是一种高效的 SQL 操作，它通过简化数据管理流程和增强操作的灵活性，大幅提升了数据处理和分析的效率。但在应用 CTAS 时，需要考虑到目标数据库系统对 CTAS 的支持程度及其对系统性能的潜在影响，以保证数据同步和操作的准确性和有效性。

## 开始前准备

已完成[单机部署 MatrixOne](../../Get-Started/install-standalone-matrixone.md)。

## 如何使用 CTAS

### 语法

`CTAS` 语句通常采用以下形式：

```sql
CREATE [TEMPORARY] TABLE  table_name as select 
```

有关更多的语法说明，请查看章节 [Create Table As Select](../../Reference/SQL-Reference/Data-Definition-Language/create-table-as-select.md)

### 案例

假设我们有一个电子商务平台，并且我们想要创建一个数据表来分析每个订单的详细信息，包括订单号、客户 ID、订单日期、产品 ID、产品数量和产品价格。

```sql
CREATE TABLE orders(
order_id int auto_increment PRIMARY KEY,
customer_id int,
order_date date,
product_id int,
quantity int,
price float
);

INSERT INTO orders(customer_id,order_date,product_id,quantity,price) values(30,"2023-04-01",5001,2,19.99);
INSERT INTO orders(customer_id,order_date,product_id,quantity,price) values(40,"2023-04-02",5002,1,29.99);
INSERT INTO orders(customer_id,order_date,product_id,quantity,price) values(30,"2023-04-03",5001,1,19.99);

mysql> select * from orders;
+----------+-------------+------------+------------+----------+-------+
| order_id | customer_id | order_date | product_id | quantity | price |
+----------+-------------+------------+------------+----------+-------+
|        1 |          30 | 2023-04-01 |       5001 |        2 | 19.99 |
|        2 |          40 | 2023-04-02 |       5002 |        1 | 29.99 |
|        3 |          30 | 2023-04-03 |       5001 |        1 | 19.99 |
+----------+-------------+------------+------------+----------+-------+
3 rows in set (0.00 sec)

--为了便于分析，我们想要将每个订单的总价格计算出来，并创建一个新的表，其中包含订单号、客户 ID、订单日期和订单总价格。
CREATE TABLE orders_analysis AS
SELECT 
    order_id,
    customer_id,
    order_date,
    product_id,
    quantity,
    price,
     CAST((quantity * price) AS float) AS total_price
FROM 
    orders;

mysql> select * from orders_analysis;
+----------+-------------+------------+------------+----------+-------+-------------+
| order_id | customer_id | order_date | product_id | quantity | price | total_price |
+----------+-------------+------------+------------+----------+-------+-------------+
|        1 |          30 | 2023-04-01 |       5001 |        2 | 19.99 |       39.98 |
|        2 |          40 | 2023-04-02 |       5002 |        1 | 29.99 |       29.99 |
|        3 |          30 | 2023-04-03 |       5001 |        1 | 19.99 |       19.99 |
+----------+-------------+------------+------------+----------+-------+-------------+
3 rows in set (0.00 sec)
```

在这个例子中，CTAS 语句不仅复制了原始表中的列，而且还添加了一个新的计算列 total_price，该列通过将每个订单的产品数量乘以价格来计算订单行项的总价格。这样，我们就得到了一个适合进行销售分析的新表，可以直接用于生成报告或进行进一步的数据分析。

这个例子展示了 CTAS 在数据转换和准备方面的强大能力，它允许我们在创建新表的同时进行数据的清洗和转换，从而为数据分析提供了便利。
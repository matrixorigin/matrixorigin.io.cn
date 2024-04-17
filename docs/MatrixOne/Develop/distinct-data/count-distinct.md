# 使用 COUNT(DISTINCT) 对数据去重

`COUNT(DISTINCT)` 提供了精确的去重计数结果，但可能在大数据集上效率较低。如需处理大型数据集请使用 [BITMAP](bitmap.md)。

本篇文章将介绍如何使用 `COUNT(DISTINCT)` 对少量数据去重。

## 开始前准备

已完成[单机部署 MatrixOne](../../Get-Started/install-standalone-matrixone.md)。

## 示例

```sql
--建立 orders 表，有 customer_id 和 product_id 两个字段，分别表示客户和产品的唯一标识符。
CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    product_id INT,
    order_date DATE,
    quantity INT
);

--插入一些示例数据：
INSERT INTO orders (customer_id, product_id, order_date, quantity)
VALUES
    (1, 101, '2023-04-01', 2),
    (1, 102, '2023-04-02', 1),
    (2, 101, '2023-04-03', 5),
    (3, 103, '2023-04-04', 3),
    (2, 104, '2023-04-05', 1),
    (4, 101, '2023-04-06', 2),
    (4, 102, '2023-04-07', 1),
    (5, 105, '2023-04-08', 4),
    (1, 101, '2023-04-09', 2);

--计算不同客户的数量：
mysql> SELECT COUNT(DISTINCT customer_id) AS unique_customer_count FROM orders;
+-----------------------+
| unique_customer_count |
+-----------------------+
|                     5 |
+-----------------------+
1 row in set (0.01 sec)

--计算不同产品的数量：
mysql> SELECT COUNT(DISTINCT product_id) AS unique_product_count FROM orders;
+----------------------+
| unique_product_count |
+----------------------+
|                    5 |
+----------------------+
1 row in set (0.01 sec)
```

这两个查询将分别返回 orders 表中唯一客户的数量和唯一产品的数量。这些信息对于分析客户多样性和产品销售范围非常有用。

## 参考文档

- [COUNT](../../Reference/Functions-and-Operators/Aggregate-Functions/count.md)

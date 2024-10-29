# MatrixOne 到 MySQL CDC 功能

## 场景描述

一家在线零售企业使用 MatrixOne 作为订单管理系统的生产数据库，用于存储订单数据。为了支持业务的实时分析需求（如订单数量、销售趋势、客户行为等），需要将订单数据从 MatrixOne 实时同步到 MySQL 分析数据库中，供数据分析团队和业务系统使用。通过 `mo_cdc` 工具，可以高效实现订单数据的实时同步，让分析系统随时获取最新的订单信息。

- 源数据库（生产数据库）：MatrixOne 中的 `orders` 表，包含订单数据，记录每笔订单的详细信息，包括订单 ID、客户 ID、下单时间、订单金额和状态。
- 目标数据库（分析数据库）：MySQL 中的 `orders_backup` 表，用于实时统计和分析订单信息。确保业务团队可以实时掌握销售动态。
- 同步需求：通过 `mo_cdc` 将 MatrixOne 的 `orders` 表中的数据实时同步到 MySQL 的 `orders_backup` 表，确保分析系统数据与生产系统一致。

## 操作流程

### 创建表结构

确保源数据库 MatrixOne 和目标数据库 MySQL 中的表结构相同，便于无缝同步数据。

- MatrixOne 中的 `orders` 表：

   ```sql
   CREATE TABLE source_db.orders (
       order_id INT PRIMARY KEY,
       customer_id INT,
       order_date DATETIME,
       amount DECIMAL(10, 2),
       status VARCHAR(20)
   );
   INSERT INTO source_db.orders (order_id, customer_id, order_date, amount, status) VALUES
    (1, 101, '2024-01-15 14:30:00', 99.99, 'Shipped'),
    (2, 102, '2024-02-10 10:00:00', 149.50, 'Delivered'),
    (3, 103, '2024-03-05 16:45:00', 75.00, 'Processing'),
    (4, 104, '2024-04-20 09:15:00', 200.00, 'Shipped'),
    (5, 105, '2024-05-12 14:00:00', 49.99, 'Delivered');
   ```

- MySQL 中的 `orders_backup` 表：

   ```sql
   CREATE TABLE analytics_db.orders_backup (
       order_id INT PRIMARY KEY,
       customer_id INT,
       order_date DATETIME,
       amount DECIMAL(10, 2),
       status VARCHAR(20)
   );
   ```

### 创建 `mo_cdc` 同步任务

通过 `mo_cdc` 工具创建同步任务，将 MatrixOne 的订单数据实时推送至 MySQL。

```bash
>./mo_cdc task create \
       --task-name "task1" \
       --source-uri "mysql://root:111@127.0.0.1:6001" \
       --sink-type "mysql" \
       --sink-uri "mysql://root:111@127.0.0.1:3306" \
       --tables "source_db.orders:analytics_db.orders_backup" \
       --level "account" \
       --account "sys"
```

查看任务状态

```bash
> ./mo_cdc task show \
       --task-name "task1" \
       --source-uri "mysql://root:111@127.0.0.1:6001"
[
  {
    "task-id": "0192d76f-d89a-70b3-a60d-615c5f2fd33d",
    "task-name": "task1",
    "source-uri": "mysql://root:******@127.0.0.1:6001",
    "sink-uri": "mysql://root:******@127.0.0.1:3306",
    "state": "running",
    "checkpoint": "{\n  \"source_db.orders\": 2024-10-29 16:43:00.318404 +0800 CST,\n}",
    "timestamp": "2024-10-29 16:43:01.299298 +0800 CST"
  }
] 
```

连接下游 mysql 查看全量数据同步情况

```sql
mysql> select * from analytics_db.orders_backup;
+----------+-------------+---------------------+--------+------------+
| order_id | customer_id | order_date          | amount | status     |
+----------+-------------+---------------------+--------+------------+
|        1 |         101 | 2024-01-15 14:30:00 |  99.99 | Shipped    |
|        2 |         102 | 2024-02-10 10:00:00 | 149.50 | Delivered  |
|        3 |         103 | 2024-03-05 16:45:00 |  75.00 | Processing |
|        4 |         104 | 2024-04-20 09:15:00 | 200.00 | Shipped    |
|        5 |         105 | 2024-05-12 14:00:00 |  49.99 | Delivered  |
+----------+-------------+---------------------+--------+------------+
5 rows in set (0.01 sec)
```

### 增量同步任务

任务建立后，在上游 MatrixOne 进行数据变更操作

```sql
INSERT INTO source_db.orders (order_id, customer_id, order_date, amount, status) VALUES
(6, 106, '2024-10-29 12:00:00', 150.00, 'New');
DELETE FROM source_db.orders WHERE order_id = 6;
UPDATE source_db.orders SET status = 'Delivered' WHERE order_id = 4;

mysql> select * from source_db.orders;
+----------+-------------+---------------------+--------+------------+
| order_id | customer_id | order_date          | amount | status     |
+----------+-------------+---------------------+--------+------------+
|        4 |         104 | 2024-04-20 09:15:00 | 200.00 | Delivered  |
|        1 |         101 | 2024-01-15 14:30:00 |  99.99 | Shipped    |
|        2 |         102 | 2024-02-10 10:00:00 | 149.50 | Delivered  |
|        3 |         103 | 2024-03-05 16:45:00 |  75.00 | Processing |
|        5 |         105 | 2024-05-12 14:00:00 |  49.99 | Delivered  |
+----------+-------------+---------------------+--------+------------+
5 rows in set (0.00 sec)
```

连接下游 mysql 查看增量数据同步情况

```sql
mysql> select * from analytics_db.orders_backup;
+----------+-------------+---------------------+--------+------------+
| order_id | customer_id | order_date          | amount | status     |
+----------+-------------+---------------------+--------+------------+
|        1 |         101 | 2024-01-15 14:30:00 |  99.99 | Shipped    |
|        2 |         102 | 2024-02-10 10:00:00 | 149.50 | Delivered  |
|        3 |         103 | 2024-03-05 16:45:00 |  75.00 | Processing |
|        4 |         104 | 2024-04-20 09:15:00 | 200.00 | Delivered  |
|        5 |         105 | 2024-05-12 14:00:00 |  49.99 | Delivered  |
+----------+-------------+---------------------+--------+------------+
5 rows in set (0.00 sec)
```

### 断点续传

现在由于意外造成任务中断。

```bash
> ./mo_cdc task pause \
       --task-name "task1" \
       --source-uri "mysql://root:111@127.0.0.1:6001"
```

任务中断期间，往上游 MatrixOne 继续插入数据。

```sql
INSERT INTO source_db.orders (order_id, customer_id, order_date, amount, status) VALUES
(11, 111, '2024-06-15 08:30:00', 250.75, 'Processing');
INSERT INTO source_db.orders (order_id, customer_id, order_date, amount, status) VALUES
(12, 112, '2024-07-22 15:45:00', 399.99, 'Shipped');
INSERT INTO source_db.orders (order_id, customer_id, order_date, amount, status) VALUES
(13, 113, '2024-08-30 10:20:00', 599.99, 'Delivered');

mysql> select * from source_db.orders;
+----------+-------------+---------------------+--------+------------+
| order_id | customer_id | order_date          | amount | status     |
+----------+-------------+---------------------+--------+------------+
|        1 |         101 | 2024-01-15 14:30:00 |  99.99 | Shipped    |
|        2 |         102 | 2024-02-10 10:00:00 | 149.50 | Delivered  |
|        3 |         103 | 2024-03-05 16:45:00 |  75.00 | Processing |
|        4 |         104 | 2024-04-20 09:15:00 | 200.00 | Delivered  |
|        5 |         105 | 2024-05-12 14:00:00 |  49.99 | Delivered  |
|       11 |         111 | 2024-06-15 08:30:00 | 250.75 | Processing |
|       12 |         112 | 2024-07-22 15:45:00 | 399.99 | Shipped    |
|       13 |         113 | 2024-08-30 10:20:00 | 599.99 | Delivered  |
+----------+-------------+---------------------+--------+------------+
8 rows in set (0.01 sec)
```

手动恢复任务。

```bash
> ./mo_cdc task resume \
       --task-name "task1" \
       --source-uri "mysql://root:111@127.0.0.1:6001"
```

连接下游 mysql 查看断点续传情况。

```sql
mysql> select * from analytics_db.orders_backup;
+----------+-------------+---------------------+--------+------------+
| order_id | customer_id | order_date          | amount | status     |
+----------+-------------+---------------------+--------+------------+
|        1 |         101 | 2024-01-15 14:30:00 |  99.99 | Shipped    |
|        2 |         102 | 2024-02-10 10:00:00 | 149.50 | Delivered  |
|        3 |         103 | 2024-03-05 16:45:00 |  75.00 | Processing |
|        4 |         104 | 2024-04-20 09:15:00 | 200.00 | Delivered  |
|        5 |         105 | 2024-05-12 14:00:00 |  49.99 | Delivered  |
|       11 |         111 | 2024-06-15 08:30:00 | 250.75 | Processing |
|       12 |         112 | 2024-07-22 15:45:00 | 399.99 | Shipped    |
|       13 |         113 | 2024-08-30 10:20:00 | 599.99 | Delivered  |
+----------+-------------+---------------------+--------+------------+
8 rows in set (0.00 sec)
```

## 应用效果

通过该方案，零售企业可以实时同步订单数据至分析库，实现订单统计、销售趋势分析、客户行为洞察等应用场景，支持业务决策。同时断点续传保障了在网络延迟或任务中断时的数据一致性，使得数据分析系统始终保持准确、可靠的数据来源。
# 发布订阅

数据库的发布订阅（Publish-Subscribe，简称 Pub/Sub）是一种消息传递模式，其中**发布者**将消息发送给一个或多个**订阅者**，而**订阅者**则接收并处理该消息。在这种模式下，发布者和订阅者之间是松耦合的，它们之间不需要直接通信，因此可以提高应用程序的可扩展性和灵活性。

在数据库中，发布订阅功能通常被用于实时数据更新、缓存同步、业务事件通知等场景。例如，当数据库中某个表的数据发生变化时，可以通过发布订阅功能实时通知订阅者，从而实现实时数据同步和处理。另外，也可以通过发布订阅功能来实现业务事件的通知，例如某个订单被取消、某个库存数量不足等等。

通常，数据库的发布订阅功能由两部分组成：**发布者**和**订阅者**。**发布者**负责发布消息，而**订阅者**则订阅相应消息以达到数据同步的目的。发布者和订阅者之间可以存在多对多的关系，即一个发布者可以向多个订阅者发布消息，而一个订阅者也可以订阅多个消息/数据。

## 应用场景

发布订阅功能具有多种典型的应用场景：

- **数据同步**：当一个数据库需要与另一个数据库保持同步时，发布订阅功能可以用来将数据更改发送到订阅者数据库。例如，当一个网站需要将数据从一个地理位置传输到另一个地理位置时，发布订阅功能可以用来确保两个数据库之间的数据同步。

- **业务数据分发**：发布订阅功能可以用来将业务数据分发到不同的系统或业务流程中。例如，当一个银行需要将客户账户信息分发到多个业务系统中时，发布订阅功能可以用来将数据分发到相应的系统中，确保各个业务流程之间的数据一致性。

- **数据备份**：发布订阅功能可以用来备份数据。例如，当一个数据库需要备份到另一个数据库时，发布订阅功能可以用来将数据备份到订阅者数据库中，以便在主数据库出现故障时恢复数据。

- **实时数据处理**：发布订阅功能可以用来实现实时数据处理。例如，当一个网站需要对来自不同用户的数据进行处理时，发布订阅功能可以用来将数据传输到处理程序中进行处理，以便实现实时数据分析和决策。

## 名词解释

- **发布**：在数据库中，发布通常指的是将一个数据库对象设置为可供其他租户访问的状态。这是数据共享和复制的一个重要步骤，发布的对象可以被其他租户订阅并获取数据。

- **订阅**：订阅是指一个数据库选择接收和复制发布的数据库对象的数据。

- **发布端（Pub）**：发布端是执行发布操作的数据库。发布端负责创建和管理发布的对象，以及管理订阅该发布对象的数据库的访问权限。

- **订阅端（Sub）**：订阅端是订阅发布对象的租户。

- **发布对象**：发布对象是在发布端创建并设置为可发布的数据库对象，即数据库。这些对象的数据可以被订阅端访问和复制。

- **订阅对象**：订阅对象是在订阅端复制和存储的发布对象。订阅对象的数据会根据发布端的数据进行更新。

## 发布订阅范围说明

### 发布/订阅应用范围

**发布端（Pub）**和**订阅端（Sub）**均为 MatrixOne 的租户。

### 可发布/可订阅权限范围

- **发布端（Pub）**只有 ACCOUNTADMIN 或 MOADMIN 角色可以创建发布与订阅。
- **订阅端（Sub）**由 ACCOUNTADMIN 或 MOADMIN 角色操作访问订阅数据权限。

### 发布/订阅数据范围

- 一个**发布**只能与单一数据库关联。
- 支持数据库级别和表级别的发布和订阅。
- **订阅端**对**订阅库**只具备读取权限。
- 若**发布端（Pub）**调整了发布的分享范围，那些不在新范围内的**订阅端（Sub）**如果已经创建了订阅库，那么对这个**订阅库**的访问将无效。
- 若**发布端（Pub）**修改了发布内容，那**订阅端（Sub）**无需额外操作，即可看到更新
- 若**发布端（Pub）**尝试删除已经发布的数据库，那么此次删除将不会成功。
- 若**发布端（Pub）**删除了**发布**，但订阅库中的对应对象仍存在，此时**订阅端（Sub）**访问这个对象会触发错误，需要由**订阅端（Sub）**删除对应的**订阅**。
- 若**发布端（Pub）**删除了**发布对象**，但在订阅库中的对应对象仍然存在，此时**订阅端（Sub）**访问这个对象会触发错误，需要由**订阅端（Sub）**删除对应的**订阅对象**。

## 发布订阅示例

假设有一家跨地区的零售公司，中心仓库数据库需要发布库存和商品价格变动，各分支机构数据库订阅这些变动，确保库存和价格信息在各分支系统中保持同步。

```sql
drop account if exists acc1;
create account acc1 admin_name = 'test_account' identified by '111';
drop account if exists acc2;
create account acc2 admin_name = 'test_account' identified by '111';
```

1. 创建中心仓库数据库并初始化数据
  
    在 `sys` 租户下创建一个中心仓库数据库，包含库存表和商品价格表，并插入一些测试数据用于验证功能。

    ```sql
    -- 创建中心仓库数据库
    create database central_warehouse_db;
    use central_warehouse_db;

    -- 创建库存表
    CREATE TABLE inventory (
        product_id INT PRIMARY KEY,
        product_name VARCHAR(100),
        stock_quantity INT
    );

    -- 创建商品价格表
    CREATE TABLE products (
        product_id INT PRIMARY KEY,
        product_name VARCHAR(100),
        price DECIMAL(10, 2)
    );

    -- 向库存表插入初始数据
    INSERT INTO inventory (product_id, product_name, stock_quantity) VALUES 
    (1, 'Laptop', 100),
    (2, 'Smartphone', 200),
    (3, 'Tablet', 150);

    -- 向商品价格表插入初始数据
    INSERT INTO products (product_id, product_name, price) VALUES 
    (1, 'Laptop', 999.99),
    (2, 'Smartphone', 599.99),
    (3, 'Tablet', 399.99);
    ```

2. 配置发布

    在中心仓库数据库中创建一个数据库级别的发布，将所有表的数据更新发布给租户 `acc1`。如果某分支机构仅关心商品价格的变化，则可以创建一个表级别的发布，仅将商品价格表的更新发布给租户 `acc2`。

    ```sql
    create publication db_warehouse_pub database central_warehouse_db account acc1;
    create publication tab_products_pub database central_warehouse_db table products account acc2;
    ```

3. 在分支机构租户中分别订阅发布

    ```sql
    -- 在 acc1 中订阅 db_warehouse_pub
    create database db_warehouse_sub from sys publication db_warehouse_pub;

    mysql> show subscriptions;
    +------------------+-------------+----------------------+------------+-------------+---------------------+------------------+---------------------+--------+
    | pub_name         | pub_account | pub_database         | pub_tables | pub_comment | pub_time            | sub_name         | sub_time            | status |
    +------------------+-------------+----------------------+------------+-------------+---------------------+------------------+---------------------+--------+
    | db_warehouse_pub | sys         | central_warehouse_db | *          |             | 2024-10-15 11:58:04 | db_warehouse_sub | 2024-10-15 11:59:47 |      0 |
    +------------------+-------------+----------------------+------------+-------------+---------------------+------------------+---------------------+--------+
    1 row in set (0.01 sec)

    use db_warehouse_sub;

    mysql> show tables;
    +----------------------------+
    | Tables_in_db_warehouse_sub |
    +----------------------------+
    | inventory                  |
    | products                   |
    +----------------------------+
    2 rows in set (0.01 sec)

    mysql> select * from inventory;
    +------------+--------------+----------------+
    | product_id | product_name | stock_quantity |
    +------------+--------------+----------------+
    |          1 | Laptop       |            100 |
    |          2 | Smartphone   |            200 |
    |          3 | Tablet       |            150 |
    +------------+--------------+----------------+
    3 rows in set (0.01 sec)

    mysql> select * from products;
    +------------+--------------+--------+
    | product_id | product_name | price  |
    +------------+--------------+--------+
    |          1 | Laptop       | 999.99 |
    |          2 | Smartphone   | 599.99 |
    |          3 | Tablet       | 399.99 |
    +------------+--------------+--------+
    3 rows in set (0.01 sec)

    -- 在 acc2 中订阅 tab_products_pub
    create database tab_products_sub from sys publication tab_products_pub;

    mysql> show subscriptions;
    +------------------+-------------+----------------------+------------+-------------+---------------------+------------------+---------------------+--------+
    | pub_name         | pub_account | pub_database         | pub_tables | pub_comment | pub_time            | sub_name         | sub_time            | status |
    +------------------+-------------+----------------------+------------+-------------+---------------------+------------------+---------------------+--------+
    | tab_products_pub | sys         | central_warehouse_db | products   |             | 2024-10-15 11:58:04 | tab_products_sub | 2024-10-15 13:59:22 |      0 |
    +------------------+-------------+----------------------+------------+-------------+---------------------+------------------+---------------------+--------+
    1 row in set (0.01 sec)

    use tab_products_sub;

    mysql> show tables;
    +----------------------------+
    | Tables_in_tab_products_sub |
    +----------------------------+
    | products                   |
    +----------------------------+
    1 row in set (0.01 sec)

    mysql> select * from products;
    +------------+--------------+--------+
    | product_id | product_name | price  |
    +------------+--------------+--------+
    |          1 | Laptop       | 999.99 |
    |          2 | Smartphone   | 599.99 |
    |          3 | Tablet       | 399.99 |
    +------------+--------------+--------+
    3 rows in set (0.01 sec)
    ```

4. 数据变动

    在发布端数据，发布订阅机制将把这些变动同步到订阅端。

    ```sql
    -- 修改库存表中的库存数量
    UPDATE inventory SET stock_quantity = 80 WHERE product_id = 1;

    -- 删除商品价格表中的某一行
    DELETE FROM products WHERE product_id = 2;

    mysql> select * from inventory;
    +------------+--------------+----------------+
    | product_id | product_name | stock_quantity |
    +------------+--------------+----------------+
    |          1 | Laptop       |             80 |
    |          2 | Smartphone   |            200 |
    |          3 | Tablet       |            150 |
    +------------+--------------+----------------+
    3 rows in set (0.00 sec)

    mysql> select * from products;
    +------------+--------------+--------+
    | product_id | product_name | price  |
    +------------+--------------+--------+
    |          1 | Laptop       | 999.99 |
    |          3 | Tablet       | 399.99 |
    +------------+--------------+--------+
    2 rows in set (0.01 sec)
    ```

5. 在订阅端查看变动情况

    ```sql
    -- 在 acc1 中查看库存情况
    mysql> select * from inventory ;
    +------------+--------------+----------------+
    | product_id | product_name | stock_quantity |
    +------------+--------------+----------------+
    |          1 | Laptop       |             80 |
    |          2 | Smartphone   |            200 |
    |          3 | Tablet       |            150 |
    +------------+--------------+----------------+
    3 rows in set (0.01 sec)

    -- 在 acc2 中查看商品价格情况

    mysql> select * from products;
    +------------+--------------+--------+
    | product_id | product_name | price  |
    +------------+--------------+--------+
    |          1 | Laptop       | 999.99 |
    |          3 | Tablet       | 399.99 |
    +------------+--------------+--------+
    2 rows in set (0.01 sec)
    ```

6. 删除发布

    在某些情况下，当某个仓库停止使用，或者数据发布不再需要对某张表进行同步时，可以通过 DROP PUBLICATION 来解除发布关系，防止不必要的资源消耗。

    ```sql
    -- 删除商品价格表的发布
    drop publication tab_products_sub;
    ```

## 参考文档

### 发布者参考文档

- [CREATE PUBLICATION](../../Reference/SQL-Reference/Data-Definition-Language/create-publication.md)
- [ALTER PUBLICATION](../../Reference/SQL-Reference/Data-Definition-Language/alter-publication.md)
- [DROP PUBLICATION](../../Reference/SQL-Reference/Data-Definition-Language/drop-publication.md)
- [SHOW PUBLICATIONS](../../Reference/SQL-Reference/Other/SHOW-Statements/show-publications.md)
- [SHOW CREATE PUBLICATION](../../Reference/SQL-Reference/Other/SHOW-Statements/show-create-publication.md)

### 订阅者参考文档

- [CREATE...FROM...PUBLICATION...](../../Reference/SQL-Reference/Data-Definition-Language/create-subscription.md)
- [SHOW SUBSCRIPTIONS](../../Reference/SQL-Reference/Other/SHOW-Statements/show-subscriptions.md)

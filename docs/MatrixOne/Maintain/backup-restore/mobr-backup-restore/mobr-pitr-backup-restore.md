# mo_br 工具进行 PITR 备份恢复

## PITR 备份恢复实现原理

PITR（时间点恢复）备份恢复的实现基于完整备份和增量日志，通过记录数据库的事务操作并应用这些增量日志，系统可以将数据库恢复到指定的时间点。恢复过程首先从完整备份开始，将数据库还原到基础状态，然后依次应用增量日志中的事务，直至达到目标时间点，从而实现精确的数据恢复。这种机制有效应对因误操作或故障导致的数据丢失，保障数据库的完整性和一致性。

## 应用场景

PITR 是数据库管理中常见的一个功能，主要用于恢复数据库到某个特定的时间点，通常用于以下场景：

- **误操作恢复：**当数据库中的某些数据被误删除、误修改或误操作时，可以使用 PITR 将数据库恢复到误操作之前的状态，避免数据丢失。

- **灾难恢复：**在遭遇数据库灾难性故障（如硬件故障、软件错误、自然灾害等）后，PITR 可以帮助将数据库恢复到故障发生前的某个时间点，保证业务连续性和数据完整性。

- **数据审核和合规性：**对于需要进行数据审计或需要遵守数据保留政策的企业和组织，PITR 可以提供历史数据的恢复和查看功能，以满足合规性要求。

- **测试和开发环境管理：**在开发和测试过程中，PITR 可以帮助恢复数据库到之前的测试数据集，以支持测试用例的重复运行和开发环境的管理。

- **数据库备份管理：**与常规备份结合使用，PITR 可以提供更细粒度的恢复选项，使得恢复过程更加灵活和精确。

## MatrixOne 对 PITR 的支持

MatrixOne 支持以下两种方式进行 PITR：

- sql 语句
- mo_br 工具

!!! note
    mo_br 企业级服务的备份与恢复工具，你需要联系你的 MatrixOne 客户经理，获取工具下载路径。

## 开始前准备

- 已完成[单机部署 MatrixOne](../../../Get-Started/install-standalone-matrixone.md)

- 已完成 mo_br 工具部署

## 示例

一家大型 SaaS 供应商管理一个多租户环境，提供各种服务给不同的业务客户。这些租户通过集群托管其数据库，存储业务关键数据。一天，系统管理员在进行升级操作时，意外触发了一些错误的脚本操作，影响到了不同租户的多个数据库和表。为了确保系统能尽快恢复并减少数据丢失，团队决定 PITR 进行恢复。

### 创建业务数据

该系统下有 acc1 和 acc2 两个租户，表示不同的客户，每个租户下面有商品信息和订单信息。
  
```sql
create account acc1 admin_name 'root' identified by '111';
create account acc2 admin_name 'root' identified by '111';

#连接acc1
create database db1;
use db1;
--创建商品表，用于存储商品信息
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,       
    product_name VARCHAR(100) NOT NULL,     
    category VARCHAR(50),                    
    price DECIMAL(10, 2) NOT NULL,          
    stock_quantity INT NOT NULL               
);

INSERT INTO products (product_name, category, price, stock_quantity) VALUES
('Gaming Laptop', 'Electronics', 1200.99, 30), 
('Wireless Mouse', 'Accessories', 25.50, 100),   
('Mechanical Keyboard', 'Accessories', 75.00, 50), 
('Smartphone', 'Electronics', 699.99, 50),      
('Headphones', 'Accessories', 199.99, 80),       
('Tablet', 'Electronics', 299.99, 40),           
('Smartwatch', 'Accessories', 149.99, 60),      
('Charger', 'Accessories', 19.99, 200),          
('Webcam', 'Electronics', 59.99, 75);             

create database db2;
use db2;
--创建一张用于存储客户订单的表
CREATE TABLE orders (
    id int PRIMARY KEY auto_increment,      
    product_name VARCHAR(100) NOT NULL,  
    quantity INT NOT NULL,     
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
);

INSERT INTO orders (product_name, quantity) VALUES
('Laptop', 2),
('Mouse', 5),
('Keyboard', 3);

#连接acc2
create database db1;
use db1;
--创建商品表，用于存储商品信息
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,       
    product_name VARCHAR(100) NOT NULL,     
    category VARCHAR(50),                    
    price DECIMAL(10, 2) NOT NULL,          
    stock_quantity INT NOT NULL               
);

INSERT INTO products (product_name, category, price, stock_quantity) VALUES
('Gaming Laptop', 'Electronics', 1200.99, 30), 
('Wireless Mouse', 'Accessories', 25.50, 100),   
('Mechanical Keyboard', 'Accessories', 75.00, 50), 
('Smartphone', 'Electronics', 699.99, 50),      
('Headphones', 'Accessories', 199.99, 80),       
('Tablet', 'Electronics', 299.99, 40),           
('Smartwatch', 'Accessories', 149.99, 60),      
('Charger', 'Accessories', 19.99, 200),          
('Webcam', 'Electronics', 59.99, 75);             

create database db2;
use db2;
--创建一张用于存储客户订单的表
CREATE TABLE orders (
    id int PRIMARY KEY auto_increment,      
    product_name VARCHAR(100) NOT NULL,  
    quantity INT NOT NULL,     
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
);

INSERT INTO orders (product_name, quantity) VALUES
('Smartphone', 10),     
('Headphones', 15),      
('Tablet', 7);         
```

### 创建 pitr

#### mo_br

```bash
#创建集群级别的pitr
./mo_br pitr create --host "127.0.0.1" --port 6001 --user "root" --password "111" --pname "pitr1" --level "cluster" --rangevalue 1 --rangeunit "d"

>./mo_br pitr show --host "127.0.0.1" --port 6001 --user "dump" --password "111" 
PITR NAME	   CREATED TIME    	   MODIFIED TIME   	PITR LEVEL	ACCOUNT NAME	DATABASE NAME	TABLE NAME	PITR LENGTH	PITR UNIT 
pitr1    	2024-10-28 17:22:26	2024-10-28 17:22:26	cluster   	*           	*            	*         	          1	d        

#创建acc1租户级别的pitr
./mo_br pitr create --host "127.0.0.1" --port 6001 --user "acc1#root" --password "111" --pname "pitr2" --level "account" --account "acc1" --rangevalue 10 --rangeunit "h"

>./mo_br pitr show --host "127.0.0.1" --port 6001 --user "acc1#root" --password "111"  --account "acc1"
PITR NAME	   CREATED TIME    	   MODIFIED TIME   	PITR LEVEL	ACCOUNT NAME	DATABASE NAME	TABLE NAME	PITR LENGTH	PITR UNIT 
pitr2    	2024-10-28 17:24:18	2024-10-28 17:24:18	account   	acc1        	*            	*         	         10	h        	

#创建acc2租户级别的pitr
./mo_br pitr create --host "127.0.0.1" --port 6001 --user "acc2#root" --password "111" --pname "pitr3" --level "account" --account "acc2" --rangevalue 10 --rangeunit "h"


>./mo_br pitr show --host "127.0.0.1" --port 6001 --user "acc2#root" --password "111"  --account "acc2"
PITR NAME	   CREATED TIME    	   MODIFIED TIME   	PITR LEVEL	ACCOUNT NAME	DATABASE NAME	TABLE NAME	PITR LENGTH	PITR UNIT 
pitr3    	2024-10-28 17:25:32	2024-10-28 17:25:32	account   	acc2        	*            	*         	         10	h     
```

#### SQL

```sql
#在sys租户下创建集群级别的pitr
mysql> create pitr pitr1 for cluster range 1 "d";
Query OK, 0 rows affected (0.02 sec)

mysql> show pitr;
+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| PITR_NAME | CREATED_TIME        | MODIFIED_TIME       | PITR_LEVEL | ACCOUNT_NAME | DATABASE_NAME | TABLE_NAME | PITR_LENGTH | PITR_UNIT |
+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| pitr1     | 2025-03-03 15:01:31 | 2025-03-03 15:01:31 | cluster    | *            | *             | *          |           1 | d         |
+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
1 row in set (0.00 sec)  

#在acc1租户下创建acc1租户级别的pitr
mysql> create pitr pitr2 for account range 10 "h";
Query OK, 0 rows affected (0.02 sec)

mysql> show pitr;
+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| PITR_NAME | CREATED_TIME        | MODIFIED_TIME       | PITR_LEVEL | ACCOUNT_NAME | DATABASE_NAME | TABLE_NAME | PITR_LENGTH | PITR_UNIT |
+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| pitr2     | 2025-03-03 15:02:00 | 2025-03-03 15:02:00 | account    | acc1         | *             | *          |          10 | h         |
+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
1 row in set (0.01 sec)

#在acc2租户下创建acc2租户级别的pitr
mysql> create pitr pitr3 for account range 10 "h";
Query OK, 0 rows affected (0.02 sec)

mysql> show pitr;
+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| PITR_NAME | CREATED_TIME        | MODIFIED_TIME       | PITR_LEVEL | ACCOUNT_NAME | DATABASE_NAME | TABLE_NAME | PITR_LENGTH | PITR_UNIT |
+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
| pitr3     | 2025-03-03 15:02:25 | 2025-03-03 15:02:25 | account    | acc2         | *             | *          |          10 | h         |
+-----------+---------------------+---------------------+------------+--------------+---------------+------------+-------------+-----------+
1 row in set (0.00 sec)
```

### 模拟升级错误

由于升级脚本错误导致 acc1 下的 db1 和 db2 都被删除，acc2 下的 db1 被删除，db2 下的 orders 表数据被清空。

```sql
--在 acc1 下执行
drop database db1;
drop database db2;

--在 acc2 下执行 
drop database db1;
use db2;
truncate table orders;
```

### 恢复 pitr

#### mo_br

- 为 acc1 进行整个租户的恢复

    ```bash
    ./mo_br pitr restore --host "127.0.0.1" --port 6001 --user "acc1#root" --password "111" --pname "pitr2" --timestamp "2024-10-28 17:30:00" --account "acc1"
    ```

    连接 acc1 查询，可以看到数据成功恢复

    ```sql
    mysql> show databases;
    +--------------------+
    | Database           |
    +--------------------+
    | db1                |
    | db2                |
    | information_schema |
    | mo_catalog         |
    | mysql              |
    | system             |
    | system_metrics     |
    +--------------------+
    7 rows in set (0.01 sec)
    ```

- 为 acc2 进行库表级别的恢复

    ```bash
    #恢复 db1
    ./mo_br pitr restore --host "127.0.0.1" --port 6001 --user "acc2#root" --password "111" --pname "pitr3" --timestamp "2024-10-28 17:30:00" --account "acc2" --database "db1"

    #恢复 orders 表
    ./mo_br pitr restore --host "127.0.0.1" --port 6001 --user "acc2#root" --password "111" --pname "pitr3" --timestamp "2024-10-28 17:30:00" --account "acc2" --database "db2" --table "orders"
    ```

    连接 acc2 查询，可以看到数据成功恢复

    ```sql
    mysql> show databases;
    +--------------------+
    | Database           |
    +--------------------+
    | db1                |
    | db2                |
    | information_schema |
    | mo_catalog         |
    | mysql              |
    | system             |
    | system_metrics     |
    +--------------------+
    7 rows in set (0.01 sec)

    mysql> select * from db2.orders;
    +------+--------------+----------+---------------------+
    | id   | product_name | quantity | order_date          |
    +------+--------------+----------+---------------------+
    |    1 | Smartphone   |       10 | 2024-10-28 17:11:27 |
    |    2 | Headphones   |       15 | 2024-10-28 17:11:27 |
    |    3 | Tablet       |        7 | 2024-10-28 17:11:27 |
    +------+--------------+----------+---------------------+
    3 rows in set (0.00 sec)
    ```

#### SQL

- 为 acc1 进行整个租户的恢复

    ```sql
    mysql> restore from pitr pitr2 "2025-03-03 15:03:00";
    Query OK, 0 rows affected (0.13 sec)

    mysql> show databases;
    +--------------------+
    | Database           |
    +--------------------+
    | db1                |
    | db2                |
    | information_schema |
    | mo_catalog         |
    | mysql              |
    | system             |
    | system_metrics     |
    +--------------------+
    7 rows in set (0.00 sec)
    ```

- 为 acc2 进行库表级别的恢复

    ```sql
    --在租户 acc2 下进行
    #恢复 db1
    restore database db1 from pitr pitr3 "2025-03-03 14:33:30";

    #恢复 orders 表
    restore database db2 table orders from pitr pitr3 "2025-03-03 15:03:00";
    mysql> show databases;
    +--------------------+
    | Database           |
    +--------------------+
    | db1                |
    | db2                |
    | information_schema |
    | mo_catalog         |
    | mysql              |
    | system             |
    | system_metrics     |
    +--------------------+
    7 rows in set (0.01 sec)

    mysql> select * from db2.orders;
    +------+--------------+----------+---------------------+
    | id   | product_name | quantity | order_date          |
    +------+--------------+----------+---------------------+
    |    1 | Smartphone   |       10 | 2025-03-03 15:01:08 |
    |    2 | Headphones   |       15 | 2025-03-03 15:01:08 |
    |    3 | Tablet       |        7 | 2025-03-03 15:01:08 |
    +------+--------------+----------+---------------------+
    3 rows in set (0.01 sec)
    ```
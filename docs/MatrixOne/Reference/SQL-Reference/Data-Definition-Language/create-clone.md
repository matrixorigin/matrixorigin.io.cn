# **CREATE CLONE**

## **语法说明**

CLONE 操作允许在 MatrixOne 数据库中复制表或数据库的结构和数据。克隆可以在同一租户内进行，也可以跨租户进行（仅限 sys 租户操作）。跨租户克隆必须使用预先创建的 snapshot。

## **前提条件**

在执行 CLONE 操作前，需要确保：

- 源数据库和表必须已经存在
- 目标数据库（对于表克隆）必须已经存在，或者使用 CREATE DATABASE 预先创建
- 对于跨租户克隆，必须预先创建 snapshot
- 执行用户需要具有相应的权限

## **连接其他租户**

要连接其他租户进行操作，需要使用特定格式的连接字符串：

```bash
# 连接普通租户 acc1
mysql -h 127.0.0.1 -P 6001 -u root:acc1 -p

# 连接普通租户 acc2  
mysql -h 127.0.0.1 -P 6001 -u root:acc2 -p

# 连接 sys 租户
mysql -h 127.0.0.1 -P 6001 -u root:sys -p
```

## **语法结构**

### 克隆表

```
CREATE TABLE [IF NOT EXISTS] target_db.target_table 
CLONE source_db.source_table 
[{SNAPSHOT = "snapshot_name"}] 
[TO ACCOUNT account_name]
```

### 克隆数据库

```
CREATE DATABASE [IF NOT EXISTS] target_db 
CLONE source_db 
[{SNAPSHOT = "snapshot_name"}] 
[TO ACCOUNT account_name]
```

## **使用说明**

- 同一租户内的克隆操作可以直接执行，无需 snapshot
- 跨租户克隆只能由 sys 租户执行，且必须预先创建 snapshot
- snapshot 提供了数据的时间点视图，确保克隆操作的一致性
- 克隆操作会复制表的结构、数据和相关元数据
- 目标表或数据库必须不存在，或者使用 IF NOT EXISTS 子句

## **权限限制**

1. **系统数据库限制**：
   - 普通租户不能克隆系统数据库（mo_task, mo_catalog, system, mysql, system_metric, information_schema, mo_debug）
   - 所有租户（包括 sys）都不能将数据克隆到系统数据库下

2. **集群表限制**：
   - 普通租户不能克隆集群表（cluster table）
   - 只有 sys 租户可以克隆系统表

3. **订阅数据克隆**：
   - 普通租户只能克隆已订阅的数据库或表
   - 跨租户克隆必须由 sys 租户执行

## **示例**

### 准备工作：创建测试租户、数据库和表

```sql
-- 在 sys 租户下创建测试租户
CREATE ACCOUNT acc1 ADMIN_NAME = 'admin' IDENTIFIED BY '111';
CREATE ACCOUNT acc2 ADMIN_NAME = 'admin' IDENTIFIED BY '111';

-- 连接到 acc1 租户创建测试数据
-- mysql -h 127.0.0.1 -P 6001 -u acc1:admin -p111
CREATE DATABASE acc1_db;
USE acc1_db;
CREATE TABLE acc1_tbl (
    id INT PRIMARY KEY,
    name VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO acc1_tbl (id, name) VALUES (1, 'Alice'), (2, 'Bob');

-- 连接到 acc2 租户创建测试数据  
-- mysql -h 127.0.0.1 -P 6001 -u acc2:admin -p111
CREATE DATABASE acc2_db;
USE acc2_db;
CREATE TABLE acc2_tbl (
    id INT PRIMARY KEY,
    email VARCHAR(100)
);
INSERT INTO acc2_tbl (id, email) VALUES (1, 'alice@example.com'), (2, 'bob@example.com');
```

### Case 1: 同一个租户中 clone

**克隆表：**

```sql
-- 在同一个租户内克隆表
CREATE TABLE acc1_db.t2 CLONE acc1_db.acc1_tbl;

mysql> SELECT * FROM acc1_db.acc1_tbl;
+------+-------+---------------------+
| id   | name  | created_at          |
+------+-------+---------------------+
|    1 | Alice | 2025-09-08 16:43:30 |
|    2 | Bob   | 2025-09-08 16:43:30 |
+------+-------+---------------------+
2 rows in set (0.01 sec)

-- 使用指定 snapshot 克隆
CREATE SNAPSHOT sp FOR ACCOUNT acc1;

CREATE TABLE acc1_db.t3 CLONE acc1_db.acc1_tbl {SNAPSHOT = "sp"};

mysql>  SELECT * FROM acc1_db.t3;
+------+-------+---------------------+
| id   | name  | created_at          |
+------+-------+---------------------+
|    1 | Alice | 2025-09-08 16:43:30 |
|    2 | Bob   | 2025-09-08 16:43:30 |
+------+-------+---------------------+
2 rows in set (0.01 sec)

```

**克隆数据库：**

```sql
-- 在同一个租户内克隆数据库
CREATE DATABASE acc1_db_clone CLONE acc1_db;

mysql> USE acc1_db_clone;
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed
mysql> SHOW TABLES;
+-------------------------+
| Tables_in_acc1_db_clone |
+-------------------------+
| acc1_tbl                |
| t2                      |
| t3                      |
+-------------------------+
3 rows in set (0.01 sec)

-- 使用指定 snapshot 克隆数据库
mysql> CREATE DATABASE acc1_db_clone_snapshot CLONE acc1_db {SNAPSHOT = "sp"};
Query OK, 0 rows affected (0.02 sec)

mysql> use acc1_db_clone_snapshot;
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed
mysql> SHOW TABLES;
+----------------------------------+
| Tables_in_acc1_db_clone_snapshot |
+----------------------------------+
| acc1_tbl                         |
| t2                               |
+----------------------------------+
2 rows in set (0.01 sec)
```

> **注意：**跨租户的 clone 只能由 sys 操作，且必须要先创建 snapshot

### Case 2: clone 其他普通租户数据到 sys

```sql
-- 切换到 sys 租户
-- mysql -h 127.0.0.1 -P 6001 -u sys:root -p111

-- sys 为 acc1 租户创建 account 级别 snapshot
CREATE SNAPSHOT sp_acc1 FOR ACCOUNT acc1;

-- 克隆数据库到 sys
CREATE DATABASE sys_db_from_acc1 CLONE acc1_db {SNAPSHOT = "sp_acc1"};
mysql> use sys_db_from_acc1;
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed
mysql> show tables;
+----------------------------+
| Tables_in_sys_db_from_acc1 |
+----------------------------+
| acc1_tbl                   |
| t2                         |
| t3                         |
+----------------------------+
3 rows in set (0.00 sec)

-- 克隆表到 sys
CREATE TABLE sys_db_from_acc1.acc1_tbl_clone CLONE acc1_db.acc1_tbl {SNAPSHOT = "sp_acc1"};

mysql> select * from sys_db_from_acc1.acc1_tbl_clone;
+------+-------+---------------------+
| id   | name  | created_at          |
+------+-------+---------------------+
|    1 | Alice | 2025-09-08 16:43:30 |
|    2 | Bob   | 2025-09-08 16:43:30 |
+------+-------+---------------------+
2 rows in set (0.01 sec)
```

### Case 3: clone sys 租户的数据到其他普通租户

```sql
-- 在 sys 租户下创建测试数据
CREATE DATABASE sys_db;
USE sys_db;
CREATE TABLE sys_tbl (
    id INT PRIMARY KEY,
    data VARCHAR(100)
);
INSERT INTO sys_tbl (id, data) VALUES (1, 'Sys Data 1'), (2, 'Sys Data 2');

-- sys 为自己创建 snapshot
CREATE SNAPSHOT sp_sys FOR ACCOUNT sys;

-- 克隆数据库到普通租户 acc1
CREATE DATABASE acc1_from_sys CLONE sys_db {SNAPSHOT = "sp_sys"} TO ACCOUNT acc1;

-- 克隆表到普通租户 acc1
CREATE TABLE acc1_db.sys_tbl_clone CLONE sys_db.sys_tbl {SNAPSHOT = "sp_sys"} TO ACCOUNT acc1;

--连接 acc1
mysql> use acc1_from_sys;
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed
mysql> show tables;
+-------------------------+
| Tables_in_acc1_from_sys |
+-------------------------+
| sys_tbl                 |
+-------------------------+
1 row in set (0.00 sec)

mysql> select * from acc1_db.sys_tbl_clone;
+------+------------+
| id   | data       |
+------+------------+
|    1 | Sys Data 1 |
|    2 | Sys Data 2 |
+------+------------+
2 rows in set (0.01 sec)
```

### Case 4: clone 普通租户数据到另一个普通租户

```sql
-- sys 为源租户 acc1 创建 snapshot
CREATE SNAPSHOT sp_acc1_for_clone FOR ACCOUNT acc1;

-- 克隆表从 acc1 到 acc2
CREATE TABLE acc2_db.acc1_tbl_clone CLONE acc1_db.acc1_tbl {SNAPSHOT = "sp_acc1_for_clone"} TO ACCOUNT acc2;

-- 克隆数据库从 acc1 到 acc2
CREATE DATABASE acc2_from_acc1 CLONE acc1_db {SNAPSHOT = "sp_acc1_for_clone"} TO ACCOUNT acc2;

--连接租户 acc2

mysql> select * from acc2_db.acc1_tbl_clone;
+------+-------+---------------------+
| id   | name  | created_at          |
+------+-------+---------------------+
|    1 | Alice | 2025-09-08 16:43:30 |
|    2 | Bob   | 2025-09-08 16:43:30 |
+------+-------+---------------------+
2 rows in set (0.00 sec)

mysql> use acc2_from_acc1;
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A

Database changed
mysql> show tables;
+--------------------------+
| Tables_in_acc2_from_acc1 |
+--------------------------+
| acc1_tbl                 |
| sys_tbl_clone            |
| t2                       |
| t3                       |
+--------------------------+
4 rows in set (0.01 sec)
```

## **注意事项**

- **权限要求**：
     - 同一租户内克隆需要源对象的 SELECT 权限和目标数据库的 CREATE 权限
     - 跨租户克隆只能由 sys 租户执行
     - 普通租户只能克隆已订阅的非系统数据库和表

- **系统对象限制**：
     - 禁止克隆到系统数据库
     - 普通租户禁止克隆系统表和集群表

- **Snapshot 有效期**：
     - Snapshot 有有效期限制，过期后无法用于克隆操作
     - 建议在创建 snapshot 后尽快完成克隆操作

- **资源消耗**：
     - 克隆操作会消耗存储空间和计算资源
     - 大型数据库或表的克隆可能需要较长时间

- **数据一致性**：
     - 使用 snapshot 可以确保克隆数据的时间点一致性
     - 无 snapshot 的克隆反映的是当前时刻的数据状态
# DATA BRANCH CREATE

## 语法说明

`DATA BRANCH CREATE` 语句用于创建数据分支。数据分支是 MatrixOne 提供的一种数据版本管理功能，允许用户从现有的表或数据库创建一个独立的数据副本（分支），用于数据隔离、测试、开发等场景。

数据分支与源数据共享相同的表结构，但数据是独立的。创建分支后，对分支的修改不会影响源数据，反之亦然。系统会自动记录分支的元数据信息，用于后续的 DIFF 和 MERGE 操作。

## 语法结构

### 创建表分支

```
DATA BRANCH CREATE TABLE [database_name.]table_name FROM source_table [{ SNAPSHOT = 'snapshot_name' }] [TO ACCOUNT account_name]
```

### 创建数据库分支

```
DATA BRANCH CREATE DATABASE database_name FROM source_database [{ SNAPSHOT = 'snapshot_name' }] [TO ACCOUNT account_name]
```

## 语法释义

### 参数说明

| 参数 | 说明 |
|------|------|
| `database_name` | 数据库名称。创建表分支时，如果已通过 `USE` 语句选择了数据库，则可以省略；否则必须指定 |
| `table_name` | 新创建的分支表名称。该表必须不存在，否则会报错 |
| `source_table` | 源表名称，可以包含数据库前缀，如 `db.table` |
| `source_database` | 源数据库名称 |
| `SNAPSHOT = 'snapshot_name'` | 可选参数，指定从某个快照点创建分支。如果不指定，则从当前时间点创建 |
| `TO ACCOUNT account_name` | 可选参数，指定将分支创建到其他租户（仅 sys 租户可用） |

### 快照选项

可以使用以下方式指定数据的时间点：

- `{SNAPSHOT = 'snapshot_name'}` - 使用已创建的快照
- `{TIMESTAMP = 'timestamp_value'}` - 使用指定的时间戳

## 使用说明

### 权限要求

- 用户需要对源表/数据库有读取权限
- 用户需要在目标位置有创建表/数据库的权限
- 跨租户操作仅限 sys 租户执行

### 限制条件

- 分支表名称必须是不存在的表，如果目标表已存在会报错
- 系统数据库（如 `mo_catalog`、`information_schema` 等）不能被分支
- 创建分支时会记录分支元数据，用于追踪分支关系

### 与 CREATE CLONE 的区别

`DATA BRANCH CREATE` 底层依赖 `CREATE CLONE` 实现数据复制，但两者有本质区别：

| 特性 | DATA BRANCH CREATE | CREATE CLONE |
|------|-------------------|--------------|
| 数据复制 | ✓ | ✓ |
| 记录分支元数据 | ✓ | ✗ |
| 数据血缘关系 | ✓ 分支与源表保持血缘关系 | ✗ 克隆后完全独立 |
| 支持 DIFF 操作 | ✓ 可比较分支间差异 | ✗ |
| 支持 MERGE 操作 | ✓ 可合并分支数据 | ✗ |
| 适用场景 | 数据版本管理、多分支协作开发 | 简单的数据备份、一次性复制 |

**选择建议**：

- 如果需要后续进行数据差异比较（DIFF）或数据合并（MERGE），请使用 `DATA BRANCH CREATE`
- 如果只是简单的数据复制，不需要追踪数据血缘关系，可以使用 `CREATE CLONE`

> **注意**：没有数据血缘关系的两张表（如通过 `CREATE CLONE` 创建或独立创建的表）也可以执行 DIFF/MERGE 操作，但存在以下限制：
>
> 1. **性能较差**：由于没有分支元数据，系统无法利用血缘关系优化差异计算，需要全量比较数据
> 2. **无法反映血缘关系**：差异结果无法体现数据之间的演进历史和来源关系

## 示例

### 示例 1：创建表分支（基本用法）

从现有表创建一个数据分支：

```sql
-- Expected-Rows: 0
CREATE DATABASE test;
-- Expected-Rows: 0
USE test;

-- Expected-Rows: 0
CREATE TABLE test.orders (
    order_id INT PRIMARY KEY,
    customer_name VARCHAR(50),
    amount DECIMAL(10,2)
);

-- Expected-Rows: 0
INSERT INTO test.orders VALUES 
    (1, 'Alice', 100.00),
    (2, 'Bob', 200.00),
    (3, 'Charlie', 300.00);

-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.orders_dev FROM test.orders;

-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.orders_dev2 FROM test.orders;

-- Expected-Rows: 3
SELECT * FROM test.orders_dev;
+----------+---------------+--------+
| order_id | customer_name | amount |
+----------+---------------+--------+
|        1 | Alice         | 100.00 |
|        2 | Bob           | 200.00 |
|        3 | Charlie       | 300.00 |
+----------+---------------+--------+

-- Expected-Rows: 1
UPDATE test.orders_dev SET amount = 150.00 WHERE order_id = 1;
-- Expected-Rows: 0
INSERT INTO test.orders_dev VALUES (4, 'David', 400.00);

-- Expected-Rows: 3
SELECT * FROM test.orders;
+----------+---------------+--------+
| order_id | customer_name | amount |
+----------+---------------+--------+
|        1 | Alice         | 100.00 |
|        2 | Bob           | 200.00 |
|        3 | Charlie       | 300.00 |
+----------+---------------+--------+

-- Expected-Success: false
DATA BRANCH CREATE TABLE test.orders_dev FROM test.orders;
-- ERROR: table orders_dev already exists
```

### 示例 2：从快照创建表分支

使用快照创建特定时间点的数据分支：

```sql
-- Expected-Rows: 0
CREATE TABLE test.products (
    product_id INT PRIMARY KEY,
    name VARCHAR(50),
    price DECIMAL(10,2)
);

-- Expected-Rows: 0
INSERT INTO test.products VALUES (1, 'Phone', 999.00), (2, 'Laptop', 1999.00);

-- Expected-Rows: 0
CREATE SNAPSHOT sp_products FOR TABLE test products;

-- Expected-Rows: 0
INSERT INTO test.products VALUES (3, 'Tablet', 599.00);
-- Expected-Rows: 1
UPDATE test.products SET price = 899.00 WHERE product_id = 1;

-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.products_snapshot FROM test.products{SNAPSHOT='sp_products'};

-- Expected-Rows: 2
SELECT * FROM test.products_snapshot;
+------------+--------+---------+
| product_id | name   | price   |
+------------+--------+---------+
|          1 | Phone  |  999.00 |
|          2 | Laptop | 1999.00 |
+------------+--------+---------+

-- Expected-Rows: 0
DROP SNAPSHOT sp_products;
```

### 示例 3：创建数据库分支

创建整个数据库的分支：

```sql
-- Expected-Rows: 0
CREATE DATABASE source_db;
-- Expected-Rows: 0
USE source_db;

-- Expected-Rows: 0
CREATE TABLE source_db.users (id INT PRIMARY KEY, name VARCHAR(50));
-- Expected-Rows: 0
CREATE TABLE source_db.logs (id INT PRIMARY KEY, message VARCHAR(100));

-- Expected-Rows: 0
INSERT INTO source_db.users VALUES (1, 'User1'), (2, 'User2');
-- Expected-Rows: 0
INSERT INTO source_db.logs VALUES (1, 'Log entry 1');

-- Expected-Rows: 0
DATA BRANCH CREATE DATABASE dev_db FROM source_db;

-- Expected-Rows: 2
SHOW TABLES FROM dev_db;
+------------------+
| Tables_in_dev_db |
+------------------+
| logs             |
| users            |
+------------------+

-- Expected-Rows: 2
SELECT * FROM dev_db.users;
+----+-------+
| id | name  |
+----+-------+
|  1 | User1 |
|  2 | User2 |
+----+-------+
```

### 示例 4：从快照创建数据库分支

```sql
-- Expected-Rows: 0
CREATE SNAPSHOT sp_source FOR DATABASE source_db;

-- Expected-Rows: 0
USE source_db;
-- Expected-Rows: 0
INSERT INTO source_db.users VALUES (3, 'User3');

-- 从快照创建分支
-- Expected-Rows: 0
DATA BRANCH CREATE DATABASE backup_db FROM source_db{SNAPSHOT='sp_source'};

-- Expected-Rows: 0
USE backup_db;
-- Expected-Rows: 2
SELECT * FROM backup_db.users;
+----+-------+
| id | name  |
+----+-------+
|  1 | User1 |
|  2 | User2 |
+----+-------+

-- Expected-Rows: 0
DROP SNAPSHOT sp_source;
```

### 示例 5：多级分支

从分支创建新的分支：

```sql
-- Expected-Rows: 0
USE test;

-- Expected-Rows: 0
CREATE TABLE test.base_table (a INT PRIMARY KEY, b INT);
-- Expected-Rows: 0
INSERT INTO test.base_table VALUES (1, 1), (2, 2), (3, 3);

-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.branch_level1 FROM test.base_table;
-- Expected-Rows: 0
INSERT INTO test.branch_level1 VALUES (4, 4);

-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.branch_level2 FROM test.branch_level1;
-- Expected-Rows: 0
INSERT INTO test.branch_level2 VALUES (5, 5);

-- Expected-Rows: 1
SELECT COUNT(*) FROM test.base_table;
-- Expected-Rows: 1
SELECT COUNT(*) FROM test.branch_level1;
-- Expected-Rows: 1
SELECT COUNT(*) FROM test.branch_level2;
```

## 注意事项

1. **数据隔离**：分支创建后，源数据和分支数据完全独立，互不影响。

2. **元数据记录**：系统会在 `mo_catalog.mo_branch_metadata` 表中记录分支关系，用于支持后续的 DIFF 和 MERGE 操作。该表仅 sys 租户可访问。

3. **存储开销**：创建分支会复制数据，会产生额外的存储开销。

4. **快照依赖**：如果使用快照创建分支，请确保快照在创建分支前存在且有效。

5. **跨租户限制**：跨租户创建分支仅限 sys 租户操作，且需要预先创建快照。

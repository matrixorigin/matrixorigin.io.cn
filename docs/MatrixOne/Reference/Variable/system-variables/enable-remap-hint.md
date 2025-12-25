# enable_remap_hint 查询重写提示

`enable_remap_hint` 是一个系统变量，用于启用 SQL 查询中的表重写提示（Remap Hint）功能。开启后，你可以通过在 SQL 语句前添加 JSON 格式的注释，将表名映射到自定义的查询语句，从而实现动态查询重写。

## 功能概述

Remap Hint 功能允许你：

- **虚拟表映射**：将不存在的表名映射到实际查询，无需创建视图
- **动态视图替代**：在 SQL 中直接定义查询逻辑，灵活性更高
- **聚合查询重写**：将简单的表查询重写为复杂的聚合查询
- **多表联合重写**：同时对多个表进行查询重写

## 开启/关闭设置

`enable_remap_hint` 默认关闭（值为 0）。

- 仅对当前会话开启：

```sql
SET enable_remap_hint = 1;
```

- 全局开启：

```sql
SET GLOBAL enable_remap_hint = 1;
```

- 关闭：

```sql
SET enable_remap_hint = 0;
```

## 语法格式

```sql
/*+ {
    "rewrites": {
        "database.table_name": "SELECT ... FROM real_table ..."
    }
} */
SELECT * FROM table_name;
```

### 语法说明

- `/*+ ... */`：Hint 注释格式，必须紧跟在 SQL 语句之前
- `rewrites`：JSON 对象，包含表名到查询语句的映射
- **Key 格式**：必须是 `database.table` 格式（包含数据库名）
- **Value 格式**：必须是有效的 SELECT 语句

## 使用示例

### 示例 1：单表重写

将表 `t1` 的查询重写为只返回 `a` 列：

```sql
-- 开启 remap hint
SET enable_remap_hint = 1;

-- 创建测试表
CREATE DATABASE IF NOT EXISTS db1;
USE db1;
CREATE TABLE t1 (a INT, b INT, c INT);
INSERT INTO t1 VALUES (1, 2, 3), (4, 5, 6), (7, 8, 9);

-- 使用 remap hint 重写查询
/*+ {"rewrites": {"db1.t1": "SELECT a FROM db1.t1"}} */
SELECT * FROM t1;
```

结果：

```
+------+
| a    |
+------+
|    1 |
|    4 |
|    7 |
+------+
```

### 示例 2：虚拟汇总表

创建一个虚拟的汇总表，映射到聚合查询：

```sql
-- 创建销售表（假设当前在 db1 数据库中）
CREATE TABLE sales (
    product_id INT,
    quantity INT,
    sale_date DATE
);
INSERT INTO sales VALUES
    (1, 10, '2024-01-01'),
    (1, 15, '2024-01-02'),
    (2, 20, '2024-01-01'),
    (2, 25, '2024-01-02');

-- 虚拟汇总表 - sales_summary 实际不存在
-- hint 将 db1.sales_summary 重写为 db1.sales 的聚合查询
/*+ {
    "rewrites": {
        "db1.sales_summary": "SELECT product_id, SUM(quantity) AS total_quantity FROM db1.sales GROUP BY product_id"
    }
} */
SELECT * FROM db1.sales_summary WHERE total_quantity > 20;
```

结果：

```
+------------+----------------+
| product_id | total_quantity |
+------------+----------------+
|          1 |             25 |
|          2 |             45 |
+------------+----------------+
```

### 示例 3：多表联合重写

同时对多个表进行重写：

```sql
-- 创建订单表和产品表
CREATE TABLE orders (order_id INT, product_id INT, status VARCHAR(20));
CREATE TABLE products (product_id INT, product_name VARCHAR(50), category VARCHAR(20));

INSERT INTO orders VALUES (1, 101, 'completed'), (2, 102, 'pending'), (3, 101, 'completed');
INSERT INTO products VALUES (101, 'Laptop', 'Electronics'), (102, 'Book', 'Education');

-- 同时重写两个表
/*+ {
    "rewrites": {
        "db1.orders": "SELECT * FROM db1.orders WHERE status = 'completed'",
        "db1.products": "SELECT * FROM db1.products WHERE category = 'Electronics'"
    }
} */
SELECT o.order_id, p.product_name FROM orders o
JOIN products p ON o.product_id = p.product_id;
```

结果：

```
+----------+--------------+
| order_id | product_name |
+----------+--------------+
|        1 | Laptop       |
|        3 | Laptop       |
+----------+--------------+
```

### 示例 4：带条件过滤的重写

使用重写为表添加默认过滤条件：

```sql
CREATE TABLE users (id INT, name VARCHAR(50), status VARCHAR(20));
INSERT INTO users VALUES (1, 'Alice', 'active'), (2, 'Bob', 'inactive'), (3, 'Carol', 'active');

-- 将 db1.active_users 映射到只查询活跃用户的查询
/*+ {
    "rewrites": {
        "db1.active_users": "SELECT * FROM db1.users WHERE status = 'active'"
    }
} */
SELECT * FROM db1.active_users;
```

结果：

```
+------+-------+--------+
| id   | name  | status |
+------+-------+--------+
|    1 | Alice | active |
|    3 | Carol | active |
+------+-------+--------+
```

### 示例 5：带窗口函数的重写

使用重写实现复杂的窗口函数查询：

```sql
CREATE TABLE employee_sales (emp_id INT, department VARCHAR(20), monthly_sales DECIMAL(10,2));
INSERT INTO employee_sales VALUES
    (1, 'Sales', 5000.00),
    (2, 'Sales', 7000.00),
    (3, 'Marketing', 4500.00),
    (4, 'Marketing', 6000.00);

-- 使用窗口函数计算部门排名
/*+ {
    "rewrites": {
        "db1.sales_rank": "SELECT emp_id, department, monthly_sales, RANK() OVER (PARTITION BY department ORDER BY monthly_sales DESC) AS dept_rank FROM db1.employee_sales"
    }
} */
SELECT * FROM db1.sales_rank WHERE dept_rank = 1;
```

结果：

```
+--------+------------+---------------+-----------+
| emp_id | department | monthly_sales | dept_rank |
+--------+------------+---------------+-----------+
|      4 | Marketing  |       6000.00 |         1 |
|      2 | Sales      |       7000.00 |         1 |
+--------+------------+---------------+-----------+
```

## 错误处理

使用 Remap Hint 时可能遇到以下错误：

| 错误类型 | 错误信息示例 | 解决方法 |
| --- | --- | --- |
| JSON 格式错误 | `invalid character 'r' looking for beginning of object key string` | 确保 JSON 格式正确，所有 key 和 value 都使用双引号 |
| Key 缺少数据库名 | `the mapping name needs to include database name` | Key 必须是 `database.table` 格式 |
| 空数据库或表名 | `empty table or database` | 数据库名和表名都不能为空 |
| Value 非 SELECT | `only accept SELECT-like statements as rewrites` | Value 必须是 SELECT 语句 |
| 引用不存在的表 | `table "xxx" does not exist` | 确保 Value 中引用的表存在 |
| SQL 语法错误 | `You have an error in your SQL syntax` | 检查 Value 中的 SQL 语法 |

## 限制条件

- **只支持 SELECT 语句**：Remap Hint 仅对 SELECT 语句生效，INSERT、UPDATE、DELETE 等其他语句会被忽略
- **Key 必须包含数据库名**：格式必须是 `database.table`，不能只写表名
- **Value 必须是 SELECT 语句**：不能是 DDL 或其他 DML 语句
- **不支持递归重写**：重写目标中的表不会再次被重写
- **注释格式**：只支持 `/*+ */` 格式

## 应用场景

1. **快速原型开发**：无需创建视图，直接在 SQL 中定义虚拟表
2. **动态报表**：根据需要动态调整查询逻辑
3. **数据抽象**：为复杂查询创建简单的表别名
4. **测试和调试**：临时替换表数据源进行测试
5. **性能优化**：将宽表查询重写为只查询需要的列
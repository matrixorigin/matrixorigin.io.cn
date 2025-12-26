<!-- version: v3.0.4 -->

# DATA BRANCH DELETE

## 语法说明

`DATA BRANCH DELETE` 语句用于删除数据分支。该语句会删除指定的分支表或分支数据库，同时更新分支元数据，将对应的分支标记为已删除状态。

与普通的 `DROP TABLE` 或 `DROP DATABASE` 不同，`DATA BRANCH DELETE` 会保留分支的元数据记录（标记为已删除），这对于审计和追踪分支历史非常有用。

## 语法结构

### 删除表分支

```
DATA BRANCH DELETE TABLE [database_name.]table_name
```

### 删除数据库分支

```
DATA BRANCH DELETE DATABASE database_name
```

## 语法释义

### 参数说明

| 参数 | 说明 |
|------|------|
| `table_name` | 要删除的分支表名称 |
| `database_name` | 数据库名称。删除表时可选，删除数据库时必填 |

## 使用说明

### 权限要求

- 用户需要对目标表/数据库有删除权限

### 执行效果

1. **删除表分支**：删除指定的表，并在 `mo_catalog.mo_branch_metadata` 中将该表的 `table_deleted` 字段标记为 `true`
2. **删除数据库分支**：删除指定数据库中的所有表，并将所有相关表的元数据标记为已删除

### 与 DROP 的区别

| 操作 | 数据删除 | 元数据保留 |
|------|----------|------------|
| `DROP TABLE` | 是 | 否 |
| `DATA BRANCH DELETE TABLE` | 是 | 是（标记为已删除） |
| `DROP DATABASE` | 是 | 否 |
| `DATA BRANCH DELETE DATABASE` | 是 | 是（标记为已删除） |

## 示例

### 示例 1：删除表分支

```sql
-- Expected-Rows: 0
CREATE DATABASE test_db;
-- Expected-Rows: 0
USE test_db;

-- Expected-Rows: 0
CREATE TABLE test_db.base_table (
    id INT PRIMARY KEY,
    name VARCHAR(50)
);
-- Expected-Rows: 0
INSERT INTO test_db.base_table VALUES (1, 'Alice'), (2, 'Bob');

-- Expected-Rows: 0
CREATE SNAPSHOT sp_base FOR TABLE test_db base_table;

-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test_db.branch_table FROM test_db.base_table{SNAPSHOT='sp_base'};

-- Expected-Rows: 2
SHOW TABLES FROM test_db;
+-----------------+
| Tables_in_test_db |
+-----------------+
| base_table      |
| branch_table    |
+-----------------+

-- Expected-Rows: 1
SELECT table_id, table_deleted 
FROM mo_catalog.mo_branch_metadata 
WHERE table_id = (
    SELECT rel_id FROM mo_catalog.mo_tables 
    WHERE reldatabase = 'test_db' AND relname = 'branch_table'
);

-- Expected-Rows: 0
DATA BRANCH DELETE TABLE test_db.branch_table;

-- Expected-Rows: 1
SHOW TABLES FROM test_db;
+-----------------+
| Tables_in_test_db |
+-----------------+
| base_table      |
+-----------------+

-- Expected-Rows: 0
DROP SNAPSHOT sp_base;
-- Expected-Rows: 0
DROP DATABASE test_db;
```

### 示例 2：删除数据库分支

```sql
-- Expected-Rows: 0
CREATE DATABASE source_db;
-- Expected-Rows: 0
USE source_db;

-- Expected-Rows: 0
CREATE TABLE source_db.t1 (a INT PRIMARY KEY);
-- Expected-Rows: 0
CREATE TABLE source_db.t2 (a INT PRIMARY KEY);
-- Expected-Rows: 0
INSERT INTO source_db.t1 VALUES (1), (2);
-- Expected-Rows: 0
INSERT INTO source_db.t2 VALUES (3), (4);

-- Expected-Rows: 0
DATA BRANCH CREATE DATABASE branch_db FROM source_db;

-- Expected-Rows: 1
SHOW DATABASES LIKE 'branch_db';
+--------------------+
| Database (branch_db) |
+--------------------+
| branch_db          |
+--------------------+

-- Expected-Rows: 0
-- Expected-Rows: 2
SHOW TABLES FROM branch_db;
+-------------------+
| Tables_in_branch_db |
+-------------------+
| t1                |
| t2                |
+-------------------+

-- Expected-Rows: 0
DATA BRANCH DELETE DATABASE branch_db;

-- Expected-Rows: 0
SHOW DATABASES LIKE 'branch_db';

-- Expected-Rows: 0
DROP DATABASE source_db;
```

### 示例 3：删除分支后的元数据状态

```sql
-- Expected-Rows: 0
CREATE DATABASE br_meta_db;
-- Expected-Rows: 0
USE br_meta_db;

-- Expected-Rows: 0
CREATE TABLE br_meta_db.base_tbl (a INT PRIMARY KEY, b VARCHAR(10));
-- Expected-Rows: 0
INSERT INTO br_meta_db.base_tbl VALUES (1, 'a'), (2, 'b');

-- Expected-Rows: 0
CREATE SNAPSHOT sp_base_tbl FOR TABLE br_meta_db base_tbl;

-- Expected-Rows: 0
DATA BRANCH CREATE TABLE br_meta_db.branch_tbl FROM br_meta_db.base_tbl{SNAPSHOT='sp_base_tbl'};

-- Expected-Rows: 0
SET @branch_tbl_id = (
    SELECT rel_id FROM mo_catalog.mo_tables
    WHERE reldatabase = 'br_meta_db' AND relname = 'branch_tbl'
);

-- Expected-Rows: 1
SELECT table_deleted FROM mo_catalog.mo_branch_metadata 
WHERE table_id = @branch_tbl_id;
+---------------+
| table_deleted |
+---------------+
| false         |
+---------------+

-- Expected-Rows: 0
DATA BRANCH DELETE TABLE br_meta_db.branch_tbl;

-- Expected-Rows: 1
SELECT table_deleted FROM mo_catalog.mo_branch_metadata 
WHERE table_id = @branch_tbl_id;
+---------------+
| table_deleted |
+---------------+
| true          |
+---------------+

-- Expected-Rows: 0
DROP SNAPSHOT sp_base_tbl;
-- Expected-Rows: 0
DROP DATABASE br_meta_db;
```

### 示例 4：批量删除数据库中的所有分支表

```sql
-- Expected-Rows: 0
CREATE DATABASE src_db;
-- Expected-Rows: 0
USE src_db;

-- Expected-Rows: 0
CREATE TABLE src_db.t1 (a INT PRIMARY KEY);
-- Expected-Rows: 0
CREATE TABLE src_db.t2 (a INT PRIMARY KEY);
-- Expected-Rows: 0
INSERT INTO src_db.t1 VALUES (1);
-- Expected-Rows: 0
INSERT INTO src_db.t2 VALUES (2);

-- Expected-Rows: 0
DATA BRANCH CREATE DATABASE dst_db FROM src_db;

-- Expected-Rows: 0
SET @dst_t1_id = (
    SELECT rel_id FROM mo_catalog.mo_tables
    WHERE reldatabase = 'dst_db' AND relname = 't1'
);
-- Expected-Rows: 0
SET @dst_t2_id = (
    SELECT rel_id FROM mo_catalog.mo_tables
    WHERE reldatabase = 'dst_db' AND relname = 't2'
);

-- Expected-Rows: 2
SELECT table_deleted FROM mo_catalog.mo_branch_metadata
WHERE table_id IN (@dst_t1_id, @dst_t2_id)
ORDER BY table_id;
+---------------+
| table_deleted |
+---------------+
| false         |
| false         |
+---------------+

-- Expected-Rows: 0
DATA BRANCH DELETE DATABASE dst_db;

-- Expected-Rows: 2
SELECT table_deleted FROM mo_catalog.mo_branch_metadata
WHERE table_id IN (@dst_t1_id, @dst_t2_id)
ORDER BY table_id;
+---------------+
| table_deleted |
+---------------+
| true          |
| true          |
+---------------+

-- Expected-Rows: 0
DROP DATABASE src_db;
```

## 注意事项

1. **不可恢复**：删除操作是不可恢复的，删除后数据将永久丢失。请在执行前确认。

2. **元数据保留**：虽然数据被删除，但分支元数据会保留在系统表中，`table_deleted` 字段会被标记为 `true`。该元数据表（`mo_catalog.mo_branch_metadata`）仅 sys 租户可访问。

3. **级联删除**：删除数据库分支时，会删除该数据库下的所有表，并更新所有相关表的元数据。

4. **权限检查**：执行删除操作需要相应的权限，确保当前用户有足够的权限。

5. **审计追踪**：由于元数据保留，sys 租户可以通过查询 `mo_catalog.mo_branch_metadata` 表来追踪分支的历史操作。

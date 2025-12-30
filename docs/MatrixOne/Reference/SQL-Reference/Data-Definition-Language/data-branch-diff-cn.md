# DATA BRANCH DIFF

## 语法说明

`DATA BRANCH DIFF` 语句用于比较两个表之间的数据差异。该功能类似于 Git 的 diff 命令，可以显示两个数据分支之间的插入、删除和更新操作。

系统会自动识别两个表之间的最近公共祖先（LCA，Lowest Common Ancestor），并基于此计算差异。差异结果包括：

- **INSERT**：目标表中存在但基准表中不存在的行
- **DELETE**：基准表中存在但目标表中不存在的行
- **UPDATE**：两个表中主键相同但其他列值不同的行

## 语法结构

```
DATA BRANCH DIFF target_table [{ SNAPSHOT = 'snapshot_name' }] 
    AGAINST base_table [{ SNAPSHOT = 'snapshot_name' }] 
    [OUTPUT output_option]
```

### 输出选项

```
output_option:
    COUNT                           -- 仅返回差异行数
  | LIMIT number                    -- 限制返回的差异行数
  | FILE 'directory_path'           -- 将差异导出为 SQL 文件
  | AS table_name                   -- 将差异保存到表中（暂不支持）
```

## 语法释义

### 参数说明

| 参数 | 说明 |
|------|------|
| `target_table` | 目标表（要比较的表） |
| `base_table` | 基准表（作为比较基准的表） |
| `SNAPSHOT = 'snapshot_name'` | 可选参数，指定使用某个快照时刻的数据进行比较 |
| `OUTPUT COUNT` | 仅返回差异的行数统计 |
| `OUTPUT LIMIT number` | 限制返回的差异行数 |
| `OUTPUT FILE 'path'` | 将差异导出为 SQL 文件到指定目录，支持本地路径或 Stage 路径（如 `stage://stage_name/`） |

### 输出列说明

默认输出包含以下列：

| 列名 | 说明 |
|------|------|
| `diff target against base` | 显示比较的表名 |
| `flag` | 差异类型：INSERT、DELETE 或 UPDATE |
| 其他列 | 表的所有可见列 |

## 使用说明

### LCA（最近公共祖先）

系统会自动检测两个表之间的分支关系：

1. **无 LCA**：两个表没有共同的祖先，直接比较所有数据
2. **有 LCA**：两个表有共同的祖先，基于祖先计算增量差异
3. **自身为 LCA**：一个表是另一个表的祖先

### 支持的表类型

- 带主键的表（推荐）
- 复合主键的表
- 无主键的表（使用隐藏的 fake primary key）

## 示例

### 示例 1：基本差异比较

比较两个没有共同祖先的表：

```sql
-- Expected-Rows: 0
CREATE DATABASE test;
-- Expected-Rows: 0
USE test;

-- Expected-Rows: 0
CREATE TABLE test.t1 (a INT PRIMARY KEY, b VARCHAR(10));
-- Expected-Rows: 0
INSERT INTO test.t1 VALUES (1, '1'), (2, '2'), (3, '3');

-- Expected-Rows: 0
CREATE TABLE test.t2 (a INT PRIMARY KEY, b VARCHAR(10));
-- Expected-Rows: 0
INSERT INTO test.t2 VALUES (1, '1'), (2, '2'), (4, '4');

-- Expected-Rows: 2
DATA BRANCH DIFF test.t2 AGAINST test.t1;
+-------------------+--------+------+------+
| diff t2 against t1 | flag   | a    | b    |
+-------------------+--------+------+------+
| t2                | INSERT |    4 | 4    |
| t1                | INSERT |    3 | 3    |
+-------------------+--------+------+------+

-- Expected-Rows: 2
DATA BRANCH DIFF test.t1 AGAINST test.t2;
+-------------------+--------+------+------+
| diff t1 against t2 | flag   | a    | b    |
+-------------------+--------+------+------+
| t1                | INSERT |    3 | 3    |
| t2                | INSERT |    4 | 4    |
+-------------------+--------+------+------+

-- Expected-Rows: 0
DROP TABLE test.t1;
-- Expected-Rows: 0
DROP TABLE test.t2;
```

### 示例 2：比较分支表（有共同祖先）

```sql
-- Expected-Rows: 0
CREATE TABLE test.t0 (a INT PRIMARY KEY, b INT);
-- Expected-Rows: 0
INSERT INTO test.t0 VALUES (1, 1), (2, 2), (3, 3);

-- 从 t0 创建两个分支
-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.t1 FROM test.t0;
-- Expected-Rows: 0
INSERT INTO test.t1 VALUES (4, 4);

-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.t2 FROM test.t0;
-- Expected-Rows: 0
INSERT INTO test.t2 VALUES (5, 5);

-- Expected-Rows: 2
DATA BRANCH DIFF test.t2 AGAINST test.t1;
+-------------------+--------+------+------+
| diff t2 against t1 | flag   | a    | b    |
+-------------------+--------+------+------+
| t2                | INSERT |    5 |    5 |
| t1                | INSERT |    4 |    4 |
+-------------------+--------+------+------+

-- Expected-Rows: 0
DROP TABLE test.t0;
-- Expected-Rows: 0
DROP TABLE test.t1;
-- Expected-Rows: 0
DROP TABLE test.t2;
```

### 示例 3：使用快照比较

```sql
-- Expected-Rows: 0
CREATE TABLE test.t1 (a INT PRIMARY KEY, b INT);
-- Expected-Rows: 0
INSERT INTO test.t1 VALUES (1, 1), (2, 2);

-- Expected-Rows: 0
CREATE SNAPSHOT sp1 FOR TABLE test t1;

-- Expected-Rows: 0
INSERT INTO test.t1 VALUES (3, 3);
-- Expected-Rows: 1
UPDATE test.t1 SET b = 10 WHERE a = 1;

-- Expected-Rows: 0
CREATE SNAPSHOT sp2 FOR TABLE test t1;

-- Expected-Rows: 1
DATA BRANCH DIFF test.t1{SNAPSHOT='sp2'} AGAINST test.t1{SNAPSHOT='sp1'};
+--------------------+--------+------+------+
| diff t1 against t1 | flag   | a    | b    |
+--------------------+--------+------+------+
| t1                 | INSERT |    3 |    3 |
+--------------------+--------+------+------+

-- Expected-Rows: 0
DROP SNAPSHOT sp1;
-- Expected-Rows: 0
DROP SNAPSHOT sp2;
-- Expected-Rows: 0
DROP TABLE test.t1;
```

!!! note
    当比较同一张表的两个快照时，系统会基于快照之间的增量变化进行比较。在此示例中，虽然 UPDATE 操作修改了 a=1 的行，但由于快照比较的特殊机制，只显示了新增的行。

### 示例 4：仅获取差异数量

```sql
-- Expected-Rows: 0
CREATE TABLE test.t1 (a INT PRIMARY KEY, b INT);
-- Expected-Rows: 0
INSERT INTO test.t1 SELECT result, result FROM generate_series(1, 1000) g;

-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.t2 FROM test.t1;
-- Expected-Rows: 0
INSERT INTO test.t2 SELECT result, result FROM generate_series(1001, 2000) g;
-- Expected-Rows: 100
DELETE FROM test.t2 WHERE a <= 100;

-- Expected-Rows: 1
DATA BRANCH DIFF test.t2 AGAINST test.t1 OUTPUT COUNT;
+----------+
| COUNT(*) |
+----------+
|     1100 |
+----------+

-- Expected-Rows: 0
DROP TABLE test.t1;
-- Expected-Rows: 0
DROP TABLE test.t2;
```

### 示例 5：限制返回行数

```sql
-- Expected-Rows: 0
CREATE TABLE test.t1 (a INT PRIMARY KEY, b INT);
-- Expected-Rows: 0
INSERT INTO test.t1 SELECT result, result FROM generate_series(1, 100) g;

-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.t2 FROM test.t1;
-- Expected-Rows: 0
INSERT INTO test.t2 SELECT result, result FROM generate_series(101, 200) g;

-- Expected-Rows: 5
DATA BRANCH DIFF test.t2 AGAINST test.t1 OUTPUT LIMIT 5;
+--------------------+--------+------+------+
| diff t2 against t1 | flag   | a    | b    |
+--------------------+--------+------+------+
| t2                 | INSERT |  106 |  106 |
| t2                 | INSERT |  107 |  107 |
| t2                 | INSERT |  117 |  117 |
| t2                 | INSERT |  124 |  124 |
| t2                 | INSERT |  156 |  156 |
+--------------------+--------+------+------+

-- Expected-Rows: 0
DROP TABLE test.t1;
-- Expected-Rows: 0
DROP TABLE test.t2;
```

!!! note
    `OUTPUT LIMIT` 返回的行不一定是按主键顺序排列的，而是按照内部存储顺序返回前 N 行差异。

### 示例 6：导出差异为 SQL 文件

```sql
-- Expected-Rows: 0
CREATE TABLE test.t1 (a INT PRIMARY KEY, b INT);
-- Expected-Rows: 0
INSERT INTO test.t1 VALUES (1, 1), (2, 2);

-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.t2 FROM test.t1;
-- Expected-Rows: 0
INSERT INTO test.t2 VALUES (3, 3);
-- Expected-Rows: 1
UPDATE test.t2 SET b = 10 WHERE a = 1;
-- Expected-Rows: 1
DELETE FROM test.t2 WHERE a = 2;

-- Expected-Success: false
DATA BRANCH DIFF test.t2 AGAINST test.t1 OUTPUT FILE '/tmp/diff_output/';
+------------------------------------------+------------------------------------------+
| FILE SAVED TO                            | HINT                                     |
+------------------------------------------+------------------------------------------+
| /tmp/diff_output/diff_t2_t1_20241225.sql | DELETE FROM test.t1, REPLACE INTO test.t1 |
+------------------------------------------+------------------------------------------+

-- Expected-Rows: 0
DROP TABLE test.t1;
-- Expected-Rows: 0
DROP TABLE test.t2;
```

#### 输出文件类型说明

根据差异类型，系统会生成不同格式的文件：

| 场景 | 文件格式 | 说明 |
|------|----------|------|
| 增量同步（目标表非空） | `.sql` | 包含 `DELETE FROM ...` 和 `REPLACE INTO ...` 语句 |
| 全量同步（目标表为空） | `.csv` | CSV 格式，可通过 `LOAD DATA` 导入 |

#### 回放补丁文件

**回放 SQL 文件（增量同步）**：

```
mysql -h <mo_host> -P <mo_port> -u <user> -p <db_name> < diff_t2_t1_20241225.sql
```

**导入 CSV 文件（全量同步）**：

```sql
-- Expected-Success: false
LOAD DATA LOCAL INFILE '/tmp/diff_output/diff_xxx.csv'
INTO TABLE test.t1
FIELDS ENCLOSED BY '"' ESCAPED BY '\\' TERMINATED BY ','
LINES TERMINATED BY '\n';
```

### 示例 6b：导出差异到 Stage（对象存储）

Stage 是 MatrixOne 用于连接外部存储（如 S3、HDFS）的逻辑对象，可以将差异文件直接输出到对象存储，便于跨集群/跨环境同步数据。

```sql
-- Expected-Rows: 0
CREATE STAGE my_stage URL = 's3://my-bucket/diff-output/?region=us-east-1&access_key_id=xxx&secret_access_key=yyy';

-- Expected-Success: false
DATA BRANCH DIFF test.t2 AGAINST test.t1 OUTPUT FILE 'stage://my_stage/';
+-------------------------------------------------+------------------------------------------+
| FILE SAVED TO                                   | HINT                                     |
+-------------------------------------------------+------------------------------------------+
| stage://my_stage/diff_t2_t1_20241225.sql        | DELETE FROM test.t1, REPLACE INTO test.t1 |
+-------------------------------------------------+------------------------------------------+

-- Expected-Success: false
SELECT load_file(CAST('stage://my_stage/diff_t2_t1_20241225.sql' AS DATALINK));

-- Expected-Rows: 0
DROP STAGE my_stage;
```

使用 Stage 的优势：

- **安全**：无需在每次 SQL 中暴露 AK/SK，管理员配置一次即可
- **便捷**：将复杂的 URL 路径封装成简单的对象名
- **跨集群同步**：源端写到对象存储，目标端直接读取执行

### 示例 7：检测更新操作

```sql
-- Expected-Rows: 0
CREATE TABLE test.t0 (a INT PRIMARY KEY, b INT, c INT);
-- Expected-Rows: 0
INSERT INTO test.t0 SELECT result, result, result FROM generate_series(1, 100) g;

-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.t1 FROM test.t0;
-- Expected-Rows: 3
UPDATE test.t1 SET c = c + 1 WHERE a IN (1, 50, 100);

-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.t2 FROM test.t0;
-- Expected-Rows: 3
UPDATE test.t2 SET c = c + 2 WHERE a IN (1, 25, 75);

-- 比较差异，将检测到冲突的更新
-- Expected-Rows: 6
DATA BRANCH DIFF test.t2 AGAINST test.t1;
+--------------------+--------+------+------+------+
| diff t2 against t1 | flag   | a    | b    | c    |
+--------------------+--------+------+------+------+
| t2                 | UPDATE |    1 |    1 |    3 |
| t1                 | UPDATE |    1 |    1 |    2 |
| t2                 | UPDATE |   25 |   25 |   27 |
| t1                 | UPDATE |   50 |   50 |   51 |
| t2                 | UPDATE |   75 |   75 |   77 |
| t1                 | UPDATE |  100 |  100 |  101 |
+--------------------+--------+------+------+------+

-- Expected-Rows: 0
DROP TABLE test.t0;
-- Expected-Rows: 0
DROP TABLE test.t1;
-- Expected-Rows: 0
DROP TABLE test.t2;
```

### 示例 8：复合主键表的差异比较

```sql
-- Expected-Rows: 0
CREATE TABLE test.orders (
    tenant_id INT,
    order_code VARCHAR(8),
    amount DECIMAL(12,2),
    PRIMARY KEY (tenant_id, order_code)
);

-- Expected-Rows: 0
INSERT INTO test.orders VALUES
    (100, 'A100', 120.50),
    (100, 'A101', 80.00),
    (101, 'B200', 305.75);

-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.orders_branch FROM test.orders;

-- 在分支上进行修改
-- Expected-Rows: 1
UPDATE test.orders_branch SET amount = 130.50 WHERE tenant_id = 100 AND order_code = 'A100';
-- Expected-Rows: 1
DELETE FROM test.orders_branch WHERE tenant_id = 100 AND order_code = 'A101';
-- Expected-Rows: 0
INSERT INTO test.orders_branch VALUES (102, 'C300', 512.25);

-- 比较差异
-- Expected-Rows: 3
DATA BRANCH DIFF test.orders_branch AGAINST test.orders;
+-----------------------------------+--------+-----------+------------+--------+
| diff orders_branch against orders | flag   | tenant_id | order_code | amount |
+-----------------------------------+--------+-----------+------------+--------+
| orders_branch                     | UPDATE |       100 | A100       | 130.50 |
| orders_branch                     | DELETE |       100 | A101       |  80.00 |
| orders_branch                     | INSERT |       102 | C300       | 512.25 |
+-----------------------------------+--------+-----------+------------+--------+

-- Expected-Rows: 0
DROP TABLE test.orders;
-- Expected-Rows: 0
DROP TABLE test.orders_branch;
-- Expected-Rows: 0
DROP DATABASE test;
```

## 注意事项

1. **表结构一致性**：进行差异比较的两个表必须具有相同的表结构（列名、列类型）。

2. **主键要求**：虽然支持无主键的表，但建议使用带主键的表以获得更准确的差异结果。

3. **性能考虑**：对于大表，差异比较可能需要较长时间。建议使用 `OUTPUT COUNT` 先了解差异规模。

4. **快照有效性**：使用快照比较时，确保快照存在且有效。

5. **输出文件**：使用 `OUTPUT FILE` 时，确保目标目录存在且有写入权限。生成的 SQL 文件可以直接执行以同步数据。

6. **LCA 检测**：系统会自动检测 LCA，无需手动指定。LCA 的存在会影响差异计算的方式。

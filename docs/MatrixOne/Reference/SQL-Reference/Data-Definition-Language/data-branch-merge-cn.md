# DATA BRANCH MERGE

## 语法说明

`DATA BRANCH MERGE` 语句用于将一个分支表的数据变更合并到另一个分支表中。该功能类似于 Git 的 merge 命令，可以将源分支的插入、删除和更新操作应用到目标分支。

系统会自动识别两个表之间的最近公共祖先（LCA），并基于此计算需要合并的变更。当两个分支对同一行数据进行了不同的修改时，会产生冲突，可以通过冲突处理选项来指定如何处理这些冲突。

## 语法结构

```
DATA BRANCH MERGE source_table [{ SNAPSHOT = 'snapshot_name' }] 
    INTO destination_table [{ SNAPSHOT = 'snapshot_name' }] 
    [WHEN CONFLICT conflict_option]
```

### 冲突处理选项

```
conflict_option:
    FAIL                            -- 遇到冲突时报错并终止（默认行为）
  | SKIP                            -- 跳过冲突的行，保留目标表的数据
  | ACCEPT                          -- 接受源表的数据，覆盖目标表的冲突数据
```

## 语法释义

### 参数说明

| 参数 | 说明 |
|------|------|
| `source_table` | 源表（要合并的数据来源） |
| `destination_table` | 目标表（接收合并数据的表） |
| `SNAPSHOT = 'snapshot_name'` | 可选参数，指定使用某个快照时刻的数据 |
| `WHEN CONFLICT FAIL` | 遇到冲突时报错并终止操作（默认） |
| `WHEN CONFLICT SKIP` | 跳过冲突的行，保留目标表原有数据 |
| `WHEN CONFLICT ACCEPT` | 接受源表的数据，覆盖目标表的冲突数据 |

### 冲突定义

当以下情况发生时，会产生冲突：

- 两个分支都对同一主键的行进行了不同的修改（UPDATE 冲突）
- 两个分支都插入了相同主键但不同值的行（INSERT 冲突）

## 使用说明

### 合并流程

1. 系统首先计算源表和目标表之间的差异
2. 检测是否存在冲突
3. 根据冲突处理选项处理冲突
4. 将非冲突的变更应用到目标表

### 合并操作

- **INSERT**：将源表中新增的行插入到目标表
- **DELETE**：从目标表中删除源表已删除的行
- **UPDATE**：更新目标表中与源表不同的行

## 示例

### 示例 1：简单合并（无冲突）

```sql
-- Expected-Rows: 0
CREATE DATABASE test;
-- Expected-Rows: 0
USE test;

-- 创建基础表
-- Expected-Rows: 0
CREATE TABLE test.t0 (a INT PRIMARY KEY, b INT);
-- Expected-Rows: 0
INSERT INTO test.t0 VALUES (1, 1), (2, 2), (3, 3);

-- 创建两个分支
-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.t1 FROM test.t0;
-- Expected-Rows: 0
INSERT INTO test.t1 VALUES (4, 4);

-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.t2 FROM test.t0;
-- Expected-Rows: 0
INSERT INTO test.t2 VALUES (5, 5);

-- 查看差异
-- Expected-Rows: 2
DATA BRANCH DIFF test.t2 AGAINST test.t1;
+--------------------+--------+------+------+
| diff t2 against t1 | flag   | a    | b    |
+--------------------+--------+------+------+
| t1                 | INSERT |    4 |    4 |
| t2                 | INSERT |    5 |    5 |
+--------------------+--------+------+------+

-- 合并 t2 到 t1
-- Expected-Rows: 0
DATA BRANCH MERGE test.t2 INTO test.t1;

-- 验证合并结果
-- Expected-Rows: 5
SELECT * FROM test.t1 ORDER BY a;
+------+------+
| a    | b    |
+------+------+
|    1 |    1 |
|    2 |    2 |
|    3 |    3 |
|    4 |    4 |
|    5 |    5 |
+------+------+

-- Expected-Rows: 0
DROP TABLE test.t0;
-- Expected-Rows: 0
DROP TABLE test.t1;
-- Expected-Rows: 0
DROP TABLE test.t2;
```

### 示例 2：处理 INSERT 冲突

```sql
-- 创建基础表
-- Expected-Rows: 0
CREATE TABLE test.t0 (a INT PRIMARY KEY, b INT);
-- Expected-Rows: 0
INSERT INTO test.t0 VALUES (1, 1), (2, 2);

-- 创建两个分支，都插入相同主键但不同值的行
-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.t1 FROM test.t0;
-- Expected-Rows: 0
INSERT INTO test.t1 VALUES (3, 3);

-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.t2 FROM test.t0;
-- Expected-Rows: 0
INSERT INTO test.t2 VALUES (3, 4);

-- 查看差异
-- Expected-Rows: 2
DATA BRANCH DIFF test.t2 AGAINST test.t1;
+-------------------+--------+------+------+
| diff t2 against t1 | flag   | a    | b    |
+-------------------+--------+------+------+
| t2                | INSERT |    3 |    4 |
| t1                | INSERT |    3 |    3 |
+-------------------+--------+------+------+

-- 默认行为：遇到冲突报错
-- Expected-Success: false
DATA BRANCH MERGE test.t2 INTO test.t1;
-- ERROR: conflict: t2 INSERT and t1 INSERT on pk(3) with different values

-- 使用 SKIP：跳过冲突，保留 t1 的数据
-- Expected-Rows: 0
DATA BRANCH MERGE test.t2 INTO test.t1 WHEN CONFLICT SKIP;
-- Expected-Rows: 3
SELECT * FROM test.t1 ORDER BY a;
+------+------+
| a    | b    |
+------+------+
|    1 |    1 |
|    2 |    2 |
|    3 |    3 |
+------+------+

-- 使用 ACCEPT：接受 t2 的数据
-- Expected-Rows: 0
DATA BRANCH MERGE test.t2 INTO test.t1 WHEN CONFLICT ACCEPT;
-- Expected-Rows: 3
SELECT * FROM test.t1 ORDER BY a;
+------+------+
| a    | b    |
+------+------+
|    1 |    1 |
|    2 |    2 |
|    3 |    4 |
+------+------+

-- Expected-Rows: 0
DROP TABLE test.t0;
-- Expected-Rows: 0
DROP TABLE test.t1;
-- Expected-Rows: 0
DROP TABLE test.t2;
```

### 示例 3：处理 UPDATE 冲突

```sql
-- 创建基础表
-- Expected-Rows: 0
CREATE TABLE test.t1 (a INT PRIMARY KEY, b INT);
-- Expected-Rows: 0
INSERT INTO test.t1 VALUES (1, 1), (2, 2);

-- 创建分支并进行不同的更新
-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.t2 FROM test.t1;
-- Expected-Rows: 1
UPDATE test.t2 SET b = b + 2 WHERE a = 1;
-- Expected-Rows: 1
UPDATE test.t1 SET b = b + 1 WHERE a = 1;

-- 查看差异
-- Expected-Rows: 2
DATA BRANCH DIFF test.t2 AGAINST test.t1;
+--------------------+--------+------+------+
| diff t2 against t1 | flag   | a    | b    |
+--------------------+--------+------+------+
| t2                 | UPDATE |    1 |    3 |
| t1                 | UPDATE |    1 |    2 |
+--------------------+--------+------+------+

-- 使用 SKIP：保留 t1 的更新
-- Expected-Rows: 0
DATA BRANCH MERGE test.t2 INTO test.t1 WHEN CONFLICT SKIP;
-- Expected-Rows: 2
SELECT * FROM test.t1 ORDER BY a;
+------+------+
| a    | b    |
+------+------+
|    1 |    2 |
|    2 |    2 |
+------+------+

-- 使用 ACCEPT：接受 t2 的更新
-- Expected-Rows: 0
DATA BRANCH MERGE test.t2 INTO test.t1 WHEN CONFLICT ACCEPT;
-- Expected-Rows: 2
SELECT * FROM test.t1 ORDER BY a;
+------+------+
| a    | b    |
+------+------+
|    1 |    3 |
|    2 |    2 |
+------+------+

-- Expected-Rows: 0
DROP TABLE test.t1;
-- Expected-Rows: 0
DROP TABLE test.t2;
```

### 示例 4：无共同祖先的合并

```sql
-- 创建两个独立的表
-- Expected-Rows: 0
CREATE TABLE test.t1 (a INT PRIMARY KEY, b INT);
-- Expected-Rows: 0
INSERT INTO test.t1 VALUES (1, 1), (2, 2);

-- Expected-Rows: 0
CREATE TABLE test.t2 (a INT PRIMARY KEY, b INT);
-- Expected-Rows: 0
INSERT INTO test.t2 VALUES (1, 2), (3, 3);

-- 查看差异
-- Expected-Rows: 4
DATA BRANCH DIFF test.t2 AGAINST test.t1;
+--------------------+--------+------+------+
| diff t2 against t1 | flag   | a    | b    |
+--------------------+--------+------+------+
| t2                 | INSERT |    1 |    2 |
| t1                 | INSERT |    1 |    1 |
| t1                 | INSERT |    2 |    2 |
| t2                 | INSERT |    3 |    3 |
+--------------------+--------+------+------+

-- 使用 SKIP 合并
-- Expected-Rows: 0
DATA BRANCH MERGE test.t2 INTO test.t1 WHEN CONFLICT SKIP;
-- Expected-Rows: 3
SELECT * FROM test.t1 ORDER BY a;
+------+------+
| a    | b    |
+------+------+
|    1 |    1 |
|    2 |    2 |
|    3 |    3 |
+------+------+

-- 使用 ACCEPT 合并
-- Expected-Rows: 0
DATA BRANCH MERGE test.t2 INTO test.t1 WHEN CONFLICT ACCEPT;
-- Expected-Rows: 3
SELECT * FROM test.t1 ORDER BY a;
+------+------+
| a    | b    |
+------+------+
|    1 |    2 |
|    2 |    2 |
|    3 |    3 |
+------+------+

-- Expected-Rows: 0
DROP TABLE test.t1;
-- Expected-Rows: 0
DROP TABLE test.t2;
```

### 示例 5：复杂合并场景

```sql
-- 创建基础表
-- Expected-Rows: 0
CREATE TABLE test.t0 (a INT PRIMARY KEY, b VARCHAR(10));
-- Expected-Rows: 0
INSERT INTO test.t0 SELECT result, 't0' FROM generate_series(1, 100) g;

-- 创建多个分支并进行不同的修改
-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.t1 FROM test.t0;
-- Expected-Rows: 6
UPDATE test.t1 SET b = 't1' WHERE a IN (1, 20, 40, 60, 80, 100);

-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.t2 FROM test.t0;
-- Expected-Rows: 5
UPDATE test.t2 SET b = 't2' WHERE a IN (2, 22, 42, 62, 82);

-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.t3 FROM test.t0;
-- Expected-Rows: 5
UPDATE test.t3 SET b = 't3' WHERE a IN (3, 23, 43, 63, 83);

-- 依次合并到 t0
-- Expected-Rows: 0
DATA BRANCH MERGE test.t1 INTO test.t0;
-- Expected-Rows: 2
SELECT COUNT(*) AS cnt, b FROM test.t0 GROUP BY b ORDER BY cnt;
+-----+------+
| cnt | b    |
+-----+------+
|   6 | t1   |
|  94 | t0   |
+-----+------+

-- Expected-Rows: 0
DATA BRANCH MERGE test.t2 INTO test.t0;
-- Expected-Rows: 3
SELECT COUNT(*) AS cnt, b FROM test.t0 GROUP BY b ORDER BY cnt;
+-----+------+
| cnt | b    |
+-----+------+
|   5 | t2   |
|   6 | t1   |
|  89 | t0   |
+-----+------+

-- Expected-Rows: 0
DATA BRANCH MERGE test.t3 INTO test.t0;
-- Expected-Rows: 4
SELECT COUNT(*) AS cnt, b FROM test.t0 GROUP BY b ORDER BY cnt;
+-----+------+
| cnt | b    |
+-----+------+
|   5 | t2   |
|   5 | t3   |
|   6 | t1   |
|  84 | t0   |
+-----+------+

-- Expected-Rows: 0
DROP TABLE test.t0;
-- Expected-Rows: 0
DROP TABLE test.t1;
-- Expected-Rows: 0
DROP TABLE test.t2;
-- Expected-Rows: 0
DROP TABLE test.t3;
```

### 示例 6：处理 NULL 值的合并

```sql
-- 创建包含 NULL 值的表
-- Expected-Rows: 0
CREATE TABLE test.payout_template (
    batch_id INT PRIMARY KEY,
    region VARCHAR(8),
    amount DECIMAL(12,2),
    reviewer VARCHAR(20)
);

-- Expected-Rows: 0
INSERT INTO test.payout_template VALUES
    (10, 'east', 1200.50, 'amy'),
    (20, 'west', NULL, NULL),
    (30, NULL, 4800.00, 'leo');

-- 创建两个分支
-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.payout_stage FROM test.payout_template;
-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.payout_ops FROM test.payout_template;

-- 在 stage 分支上修改
-- Expected-Rows: 1
UPDATE test.payout_stage SET amount = NULL, reviewer = NULL WHERE batch_id = 10;
-- Expected-Rows: 1
UPDATE test.payout_stage SET reviewer = 'nina' WHERE batch_id = 20;

-- 在 ops 分支上修改
-- Expected-Rows: 1
UPDATE test.payout_ops SET amount = 1250.75 WHERE batch_id = 10;
-- Expected-Rows: 1
UPDATE test.payout_ops SET amount = NULL WHERE batch_id = 30;

-- 查看差异
-- Expected-Rows: 6
DATA BRANCH DIFF test.payout_stage AGAINST test.payout_ops;

-- 使用 SKIP 合并
-- Expected-Rows: 0
DATA BRANCH MERGE test.payout_stage INTO test.payout_ops WHEN CONFLICT SKIP;
-- Expected-Rows: 3
SELECT batch_id, region, amount, reviewer FROM test.payout_ops ORDER BY batch_id;

-- 使用 ACCEPT 合并
-- Expected-Rows: 0
DATA BRANCH MERGE test.payout_stage INTO test.payout_ops WHEN CONFLICT ACCEPT;
-- Expected-Rows: 3
SELECT batch_id, region, amount, reviewer FROM test.payout_ops ORDER BY batch_id;

-- Expected-Rows: 0
DROP TABLE test.payout_template;
-- Expected-Rows: 0
DROP TABLE test.payout_stage;
-- Expected-Rows: 0
DROP TABLE test.payout_ops;
-- Expected-Rows: 0
DROP DATABASE test;
```

## 注意事项

1. **表结构一致性**：进行合并的两个表必须具有相同的表结构（列名、列类型）。

2. **主键要求**：建议使用带主键的表进行合并操作，以便准确识别和处理冲突。

3. **冲突处理**：
   - `FAIL`（默认）：最安全的选项，确保不会意外覆盖数据
   - `SKIP`：保守策略，保留目标表的现有数据
   - `ACCEPT`：激进策略，优先使用源表的数据

4. **事务性**：合并操作是原子的，要么全部成功，要么全部失败。

5. **性能考虑**：对于大表，合并操作可能需要较长时间。建议先使用 `DATA BRANCH DIFF` 了解变更规模。

6. **数据备份**：在执行合并操作前，建议创建快照或备份，以便在需要时回滚。

7. **LCA 影响**：系统会自动检测 LCA，LCA 的存在会影响冲突的判定方式。

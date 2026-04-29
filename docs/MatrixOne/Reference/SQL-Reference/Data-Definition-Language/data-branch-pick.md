# DATA BRANCH PICK

## 语法说明

`DATA BRANCH PICK` 语句用于将源表中**指定的少量行**精准地合入目标表，行的范围可以通过 `KEYS`（主键值）指定，也可以通过 `BETWEEN SNAPSHOT`（快照时间窗口）指定。其作用类似于 Git 的 `cherry-pick`：不是把两个分支之间的全部差异都合进来，而是只把你明确挑选的行应用到目标表上。

对于每个被选中的主键，`DATA BRANCH PICK` 会使用与 `DATA BRANCH DIFF` 相同的最近公共祖先（LCA）逻辑计算源表与目标表之间的差异，过滤出命中选中 key 的行，再把相应的 INSERT / UPDATE / DELETE 应用到目标表。

## 语法结构

```
DATA BRANCH PICK source_table [{ SNAPSHOT = 'snapshot_name' }]
    INTO destination_table
    [ BETWEEN SNAPSHOT from_snapshot AND to_snapshot ]
    [ KEYS ( value_list | subquery ) ]
    [ WHEN CONFLICT conflict_option ]
```

`BETWEEN SNAPSHOT ... AND ...` 与 `KEYS (...)` 至少需要指定其中之一。

### KEYS 子句

```
KEYS ( value_list )        -- 指定的主键字面量列表
KEYS ( subquery )          -- 返回主键列的 SELECT 子查询
```

- 单列主键时，`value_list` 是逗号分隔的字面量列表，例如 `KEYS (1, 2, 3)`。
- 复合主键时，`value_list` 是多个元组，元组内列的顺序必须与 `PRIMARY KEY` 的定义一致，例如 `KEYS ((100, 'A100'), (101, 'B200'))`。
- 子查询必须按主键列顺序投影出所有主键列。若子查询中某个主键列为 `NULL`，语句会报错。

### 冲突处理选项

```
conflict_option:
    FAIL       -- 出现冲突即报错终止（默认）
  | SKIP       -- 冲突行保持目标表原值不变
  | ACCEPT     -- 冲突行用源表的值覆盖目标表
```

冲突的定义：被选中的主键在源表与目标表中都存在，但非主键列的值不同（UPDATE 冲突）；或者两端各自独立 INSERT 了相同主键但取值不同的行（INSERT 冲突）。

## 语法释义

| 参数 | 说明 |
|------|------|
| `source_table` | 源分支 / 源表，提供需要挑选的行。 |
| `destination_table` | 接收挑选结果的目标分支 / 目标表。 |
| `source_table` 上的 `{ SNAPSHOT = 'snapshot_name' }` | 可选：按源表在该快照时刻的数据进行挑选。 |
| `BETWEEN SNAPSHOT from_snapshot AND to_snapshot` | 可选：只挑选源表在两个快照之间发生过变化的行，可与 `KEYS` 组合使用。 |
| `KEYS (...)` | 需要挑选的主键集合，可以是字面量 / 元组列表，也可以是 `SELECT` 子查询。 |
| `WHEN CONFLICT FAIL \| SKIP \| ACCEPT` | 命中 key 的行与目标表冲突时的处理方式，默认为 `FAIL`。 |

## 使用说明

### 使用要求与限制

- **目标表必须有主键**：`destination_table` 必须定义主键，否则 `DATA BRANCH PICK` 会报错；无主键的表不能作为目标。
- **不能在显式事务中执行**：不能在 `BEGIN ... COMMIT` 块内部调用 `DATA BRANCH PICK`。
- **目标表不能带 SNAPSHOT**：`destination_table` 不允许使用 `{ SNAPSHOT = ... }`。
- **`BETWEEN SNAPSHOT` 与源表快照互斥**：`BETWEEN SNAPSHOT ... AND ...` 不能与 `source_table` 上的 `{ SNAPSHOT = ... }` 同时出现。
- **KEYS 子查询不允许 NULL**：若子查询返回的主键列值为 `NULL`，语句会报错。
- **权限**：调用者需要对 `source_table` 有读权限，对 `destination_table` 有修改权限。

### 实际执行的操作

对每一个被选中的主键：

- 该主键只存在于源表时，把源表的行插入目标表。
- 该主键在两表中值完全相同，不做任何变更。
- 该主键在两表中都存在但非主键列不同，按 `WHEN CONFLICT` 选项决定行为。
- 该主键仅在目标表中存在，而源表相对 LCA 做过删除：`ACCEPT` 会在目标表删除该行；`SKIP` 保留该行；`FAIL` 终止执行。

不在任何一侧出现的 key 视为 no-op。

## 示例

### 示例 1：无共同祖先时按主键挑选

```sql
-- Expected-Rows: 0
CREATE DATABASE test;
-- Expected-Rows: 0
USE test;

-- Expected-Rows: 0
CREATE TABLE test.t1 (a INT PRIMARY KEY, b INT);
-- Expected-Rows: 0
INSERT INTO test.t1 VALUES (1, 1), (3, 3), (5, 5);

-- Expected-Rows: 0
CREATE TABLE test.t2 (a INT PRIMARY KEY, b INT);
-- Expected-Rows: 0
INSERT INTO test.t2 VALUES (1, 1), (2, 2), (4, 4);

-- Expected-Rows: 0
DATA BRANCH PICK test.t2 INTO test.t1 KEYS (2);
SELECT * FROM test.t1 ORDER BY a;
+---+---+
| a | b |
+---+---+
| 1 | 1 |
| 2 | 2 |
| 3 | 3 |
| 5 | 5 |
+---+---+

-- Expected-Rows: 0
DROP TABLE test.t1;
-- Expected-Rows: 0
DROP TABLE test.t2;
```

### 示例 2：有共同祖先时挑选多行

```sql
-- Expected-Rows: 0
CREATE TABLE test.t0 (a INT PRIMARY KEY, b INT);
-- Expected-Rows: 0
INSERT INTO test.t0 VALUES (1, 1), (2, 2), (3, 3);

-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.t1 FROM test.t0;

-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.t2 FROM test.t0;
-- Expected-Rows: 0
INSERT INTO test.t2 VALUES (5, 5), (6, 6), (7, 7);

-- 只把 t2 中 pk=5 和 pk=7 合进 t1（跳过 pk=6）
-- Expected-Rows: 0
DATA BRANCH PICK test.t2 INTO test.t1 KEYS (5, 7);
SELECT * FROM test.t1 ORDER BY a;

-- Expected-Rows: 0
DROP TABLE test.t0;
-- Expected-Rows: 0
DROP TABLE test.t1;
-- Expected-Rows: 0
DROP TABLE test.t2;
```

### 示例 3：通过子查询动态指定要挑选的 key

```sql
-- Expected-Rows: 0
CREATE TABLE test.src (a INT PRIMARY KEY, b INT);
-- Expected-Rows: 0
INSERT INTO test.src VALUES (1, 10), (2, 20), (3, 30), (4, 40);

-- Expected-Rows: 0
CREATE TABLE test.dst (a INT PRIMARY KEY, b INT);

-- 驱动表列出需要挑选的主键
-- Expected-Rows: 0
CREATE TABLE test.pick_list (k INT PRIMARY KEY);
-- Expected-Rows: 0
INSERT INTO test.pick_list VALUES (1), (3);

-- Expected-Rows: 0
DATA BRANCH PICK test.src INTO test.dst KEYS (SELECT k FROM test.pick_list);
SELECT * FROM test.dst ORDER BY a;

-- Expected-Rows: 0
DROP TABLE test.src;
-- Expected-Rows: 0
DROP TABLE test.dst;
-- Expected-Rows: 0
DROP TABLE test.pick_list;
```

### 示例 4：冲突处理 FAIL / SKIP / ACCEPT

```sql
-- Expected-Rows: 0
CREATE TABLE test.t0 (a INT PRIMARY KEY, b INT);
-- Expected-Rows: 0
INSERT INTO test.t0 VALUES (1, 1), (2, 2);

-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.t1 FROM test.t0;
-- Expected-Rows: 0
INSERT INTO test.t1 VALUES (3, 30);

-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.t2 FROM test.t0;
-- Expected-Rows: 0
INSERT INTO test.t2 VALUES (3, 40);

-- 默认 FAIL：两端都插入了 pk=3 但值不同，直接报错
-- Expected-Success: false
DATA BRANCH PICK test.t2 INTO test.t1 KEYS (3);

-- SKIP：保留 t1 的值（b = 30）
-- Expected-Rows: 0
DATA BRANCH PICK test.t2 INTO test.t1 KEYS (3) WHEN CONFLICT SKIP;

-- ACCEPT：覆盖为 t2 的值（b = 40）
-- Expected-Rows: 0
DATA BRANCH PICK test.t2 INTO test.t1 KEYS (3) WHEN CONFLICT ACCEPT;

-- Expected-Rows: 0
DROP TABLE test.t0;
-- Expected-Rows: 0
DROP TABLE test.t1;
-- Expected-Rows: 0
DROP TABLE test.t2;
```

### 示例 5：从源表快照挑选

```sql
-- Expected-Rows: 0
CREATE TABLE test.t0 (a INT PRIMARY KEY, b INT);
-- Expected-Rows: 0
INSERT INTO test.t0 VALUES (1, 1), (2, 2), (3, 3);

-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.t1 FROM test.t0;

-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.t2 FROM test.t0;
-- Expected-Rows: 0
INSERT INTO test.t2 VALUES (4, 4), (5, 5);

-- 冻结 t2 的状态，然后继续修改
-- Expected-Rows: 0
CREATE SNAPSHOT sp_src FOR ACCOUNT sys;
-- Expected-Rows: 1
UPDATE test.t2 SET b = 50 WHERE a = 5;
-- Expected-Rows: 0
INSERT INTO test.t2 VALUES (6, 6);

-- 从冻结视图挑选：pk=5 会取快照值 b=5，而不是 50；
-- 快照时刻尚不存在 pk=6，因此对它的 PICK 视为 no-op。
-- Expected-Rows: 0
DATA BRANCH PICK test.t2 {SNAPSHOT='sp_src'} INTO test.t1 KEYS (4, 5, 6);
SELECT * FROM test.t1 ORDER BY a;

-- Expected-Rows: 0
DROP SNAPSHOT sp_src;
-- Expected-Rows: 0
DROP TABLE test.t0;
-- Expected-Rows: 0
DROP TABLE test.t1;
-- Expected-Rows: 0
DROP TABLE test.t2;
```

### 示例 6：按快照时间窗口挑选变更

```sql
-- Expected-Rows: 0
CREATE TABLE test.t0 (a INT PRIMARY KEY, b INT);
-- Expected-Rows: 0
INSERT INTO test.t0 VALUES (1, 1);

-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.t1 FROM test.t0;

-- Expected-Rows: 0
CREATE SNAPSHOT sp_from FOR ACCOUNT sys;
-- Expected-Rows: 0
INSERT INTO test.t1 VALUES (2, 2), (3, 3);
-- Expected-Rows: 0
CREATE SNAPSHOT sp_to FOR ACCOUNT sys;
-- Expected-Rows: 0
INSERT INTO test.t1 VALUES (4, 4);

-- Expected-Rows: 0
CREATE TABLE test.t2 (a INT PRIMARY KEY, b INT);

-- 只挑选 sp_from 到 sp_to 之间发生过变化的行（pk=2、pk=3；pk=4 不在窗口内）
-- Expected-Rows: 0
DATA BRANCH PICK test.t1 INTO test.t2 BETWEEN SNAPSHOT sp_from AND sp_to;
SELECT * FROM test.t2 ORDER BY a;

-- Expected-Rows: 0
DROP SNAPSHOT sp_from;
-- Expected-Rows: 0
DROP SNAPSHOT sp_to;
-- Expected-Rows: 0
DROP TABLE test.t0;
-- Expected-Rows: 0
DROP TABLE test.t1;
-- Expected-Rows: 0
DROP TABLE test.t2;
```

### 示例 7：复合主键

```sql
-- Expected-Rows: 0
CREATE TABLE test.orders (
    tenant_id  INT,
    order_code VARCHAR(8),
    amount     DECIMAL(12, 2),
    PRIMARY KEY (tenant_id, order_code)
);
-- Expected-Rows: 0
INSERT INTO test.orders VALUES
    (100, 'A100', 120.50),
    (100, 'A101',  80.00),
    (101, 'B200', 305.75);

-- Expected-Rows: 0
DATA BRANCH CREATE TABLE test.orders_branch FROM test.orders;
-- Expected-Rows: 0
INSERT INTO test.orders_branch VALUES
    (102, 'C300', 512.25),
    (103, 'D400',  42.00);

-- 只挑选 (102, 'C300')
-- Expected-Rows: 0
DATA BRANCH PICK test.orders_branch INTO test.orders
    KEYS ((102, 'C300'));
SELECT * FROM test.orders ORDER BY tenant_id, order_code;

-- Expected-Rows: 0
DROP TABLE test.orders;
-- Expected-Rows: 0
DROP TABLE test.orders_branch;
```

## 注意事项

1. **与 `DATA BRANCH MERGE` 的区别**：`MERGE` 会应用两个分支之间的全部差异，`PICK` 只应用你在 `KEYS` 中列出的主键集合，或 `BETWEEN SNAPSHOT` 窗口内变化的行。
2. **默认冲突策略是 `FAIL`**：如果希望忽略冲突或直接覆盖，请显式指定 `WHEN CONFLICT SKIP` 或 `WHEN CONFLICT ACCEPT`。
3. **表结构一致性**：`source_table` 与 `destination_table` 的列定义必须一致（与 `DATA BRANCH DIFF` / `DATA BRANCH MERGE` 的要求相同）。
4. **隐式事务**：由于 `DATA BRANCH PICK` 不能在显式事务中执行，使用时请把它单独作为一条语句运行，不要包在 `BEGIN ... COMMIT` 内部。

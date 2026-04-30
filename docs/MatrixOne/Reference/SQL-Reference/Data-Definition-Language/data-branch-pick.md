# DATA BRANCH PICK

## 语法说明

`DATA BRANCH PICK` 语句用于把源表中一部分指定的变更 cherry-pick 到目标表。要挑选的行可以通过主键集合（`KEYS(...)`）指定，也可以通过一段快照时间窗口（`BETWEEN SNAPSHOT ... AND ...`）指定。

`PICK` 内部复用 data branch diff 引擎：先像 `DATA BRANCH DIFF` 一样计算两张表之间的 `INSERT` / `DELETE` / `UPDATE` 变更集合，然后按 `KEYS(...)` 或 `BETWEEN SNAPSHOT` 过滤这个集合，最后把保留下来的变更应用到目标表。

## 语法结构

```
DATA BRANCH PICK source_table [{ SNAPSHOT = 'snapshot_name' }]
    INTO dest_table
    [ BETWEEN SNAPSHOT from_name AND to_name ]
    [ KEYS ( key_list ) ]
    [ WHEN CONFLICT { FAIL | SKIP | ACCEPT } ]
```

`key_list` 可以是主键字面量列表（例如 `1, 2, 3`，复合主键时写成 `(1,'alice'), (2,'bob')`），也可以是返回主键列的 `SELECT` 子查询。

`from_name` 和 `to_name` 可以是标识符，也可以是用引号包裹的字符串，指向该账户下已创建的快照。

## 语法释义

| 参数 | 说明 |
|------|------|
| `source_table` | 要 cherry-pick 源表。可以带库名前缀。可选的 `{ SNAPSHOT = 'name' }` 会把源侧视图冻结到指定快照。 |
| `dest_table` | 接收选中变更的目标表。不支持 snapshot 属性。 |
| `BETWEEN SNAPSHOT from_name AND to_name` | 把要 pick 的行限制为 `source_table` 在两个快照之间的变更。 |
| `KEYS ( key_list )` | 把要 pick 的行限制为主键在 `key_list` 中的行。复合主键时每个键是括号包裹的元组。也支持返回主键列的 `SELECT` 子查询。 |
| `WHEN CONFLICT FAIL` | 默认策略。如果目标表中某个键被本地修改或删除，且源侧的变更与它发生冲突，则语句报错，目标表保持不变。 |
| `WHEN CONFLICT SKIP` | 静默跳过所有冲突键；不冲突的键仍然会被应用。 |
| `WHEN CONFLICT ACCEPT` | 以源侧为准覆盖目标表。对于本地已删除、源侧仍存在的键，`ACCEPT` 会重新插入源侧的行。 |

`BETWEEN SNAPSHOT ...` 和 `KEYS(...)` 至少要提供其一；两者也可以同时使用。

## 使用说明

- `DATA BRANCH PICK` 不允许在显式事务（`BEGIN ... COMMIT`）中执行；否则会返回 `DATA BRANCH PICK is not supported in explicit transactions`。
- 至少要提供 `KEYS(...)` 或 `BETWEEN SNAPSHOT ... AND ...`，二者都缺失时返回 `DATA BRANCH PICK requires a KEYS or BETWEEN SNAPSHOT clause`。
- 源侧 `{ SNAPSHOT = 'name' }` 和 `BETWEEN SNAPSHOT ... AND ...` 不能同时使用，否则返回 `BETWEEN SNAPSHOT and source table snapshot option cannot be used together`。
- 目标表不接受 snapshot 属性；如果写成 `dest_table { SNAPSHOT = 'name' }`，会返回 `destination snapshot option is not supported for DATA BRANCH PICK`。
- 源表和目标表都会走鉴权：调用者需要对 `source_table` 有读权限，对 `dest_table` 有写权限。
- 主键过滤是在按 LCA（最近公共祖先）计算出的变更集合之上进行的（与 `DATA BRANCH DIFF` 一致）。如果某个 `KEYS` 值根本不出现在变更集合里（例如只在目标表、不在源表），则对它的 pick 视为 no-op。
- 复合主键以及 `DECIMAL` 主键在字面量列表和子查询两种写法下都被支持。
- 当源侧用 `{ SNAPSHOT = 'name' }` 固定了时间点时，源表在快照之后发生的变更不会被 pick。

### 冲突语义

这里的"冲突"指的是：某个主键在目标表中已经被本地修改或删除（相对 LCA），而源侧对同一主键又有变更，因此源侧变更已经不能简单地 fast-forward：

- `FAIL`：整条 `DATA BRANCH PICK` 失败，目标表不变。
- `SKIP`：把冲突键从本次 pick 集合中移除，其余非冲突键仍然会被应用。
- `ACCEPT`：以源侧为准覆盖目标表（source wins）；对于本地删除、源侧仍有的键，`ACCEPT` 会重新插入源侧的行。

对于源侧已删除该主键、目标侧仍然保留该主键的情况，删除会被传播到目标侧。

## 示例

以下示例都运行在同一个 database `data_branch_pick_demo_db` 中。

### 示例 1：按主键 pick，两张独立的表（无 LCA）

```sql
DROP DATABASE IF EXISTS data_branch_pick_demo_db;
CREATE DATABASE data_branch_pick_demo_db;
USE data_branch_pick_demo_db;

CREATE TABLE t1 (a INT, b INT, PRIMARY KEY(a));
INSERT INTO t1 VALUES (1,1),(3,3),(5,5);

CREATE TABLE t2 (a INT, b INT, PRIMARY KEY(a));
INSERT INTO t2 VALUES (1,1),(2,2),(4,4);

DATA BRANCH PICK t2 INTO t1 KEYS(2);
SELECT * FROM t1 ORDER BY a ASC;

DATA BRANCH PICK t2 INTO t1 KEYS(4);
SELECT * FROM t1 ORDER BY a ASC;

DROP TABLE t1;
DROP TABLE t2;
```

### 示例 2：按主键 pick，存在 LCA

```sql
USE data_branch_pick_demo_db;

CREATE TABLE t0 (a INT, b INT, PRIMARY KEY(a));
INSERT INTO t0 VALUES (1,1),(2,2),(3,3);

DATA BRANCH CREATE TABLE t1 FROM t0;
INSERT INTO t1 VALUES (4,4);

DATA BRANCH CREATE TABLE t2 FROM t0;
INSERT INTO t2 VALUES (5,5),(6,6),(7,7);

DATA BRANCH PICK t2 INTO t1 KEYS(5,7);
SELECT * FROM t1 ORDER BY a ASC;

DROP TABLE t0;
DROP TABLE t1;
DROP TABLE t2;
```

### 示例 3：按快照窗口 pick（`BETWEEN SNAPSHOT`）

```sql
USE data_branch_pick_demo_db;

DROP SNAPSHOT IF EXISTS pick_sp_from;
DROP SNAPSHOT IF EXISTS pick_sp_to;

CREATE TABLE t0 (a INT, b INT, PRIMARY KEY(a));
INSERT INTO t0 VALUES (1,1);

DATA BRANCH CREATE TABLE t1 FROM t0;

CREATE SNAPSHOT pick_sp_from FOR ACCOUNT sys;

INSERT INTO t1 VALUES (2,2),(3,3);

CREATE SNAPSHOT pick_sp_to FOR ACCOUNT sys;

INSERT INTO t1 VALUES (4,4);

DATA BRANCH PICK t1 INTO t0 BETWEEN SNAPSHOT 'pick_sp_from' AND 'pick_sp_to';
SELECT * FROM t0 ORDER BY a ASC;

DROP SNAPSHOT pick_sp_from;
DROP SNAPSHOT pick_sp_to;
DROP TABLE t0;
DROP TABLE t1;
```

### 示例 4：使用 `WHEN CONFLICT ACCEPT` 解决冲突

```sql
USE data_branch_pick_demo_db;

CREATE TABLE t0 (a INT, b INT, PRIMARY KEY(a));
INSERT INTO t0 VALUES (1,1),(2,2),(3,3);

DATA BRANCH CREATE TABLE t1 FROM t0;
DELETE FROM t1 WHERE a = 2;

DATA BRANCH CREATE TABLE t2 FROM t0;
UPDATE t2 SET b = 200 WHERE a = 2;

DATA BRANCH PICK t2 INTO t1 KEYS(2) WHEN CONFLICT ACCEPT;
SELECT * FROM t1 ORDER BY a ASC;

DROP TABLE t0;
DROP TABLE t1;
DROP TABLE t2;
```

### 示例 5：复合主键，字面量 tuple 与子查询两种写法

```sql
USE data_branch_pick_demo_db;

CREATE TABLE t0 (id INT, name VARCHAR(20), val INT, PRIMARY KEY(id, name));
INSERT INTO t0 VALUES (1,'alice',10),(2,'bob',20),(3,'charlie',30);

DATA BRANCH CREATE TABLE t1 FROM t0;
DATA BRANCH CREATE TABLE t2 FROM t0;

INSERT INTO t2 VALUES (4,'dave',40),(5,'eve',50),(6,'frank',60);

DATA BRANCH PICK t2 INTO t1 KEYS((4,'dave'),(6,'frank'));
SELECT * FROM t1 ORDER BY id, name;

DATA BRANCH PICK t2 INTO t1 KEYS(SELECT id, name FROM t2 WHERE id = 5);
SELECT * FROM t1 ORDER BY id, name;

DROP TABLE t0;
DROP TABLE t1;
DROP TABLE t2;
```

### 示例 6：显式事务内拒绝执行

```sql
USE data_branch_pick_demo_db;

CREATE TABLE t1 (a INT, b INT, PRIMARY KEY(a));
INSERT INTO t1 VALUES (1,1);

CREATE TABLE t2 (a INT, b INT, PRIMARY KEY(a));
INSERT INTO t2 VALUES (1,1),(2,2);

BEGIN;
-- Expected-Success: false
DATA BRANCH PICK t2 INTO t1 KEYS(2);
COMMIT;

DROP TABLE t1;
DROP TABLE t2;

DROP DATABASE data_branch_pick_demo_db;
```

## 注意事项

- `DATA BRANCH PICK` 对两张表的 LCA 关系没有特别要求：无 LCA、祖先关系以及双向 fork 都支持。
- 只支持按主键匹配。未显式声明主键的表会使用引擎内部的 fake primary key。
- 默认冲突策略是 `FAIL`；当目标表可能有本地分歧时，显式使用 `WHEN CONFLICT SKIP` 或 `WHEN CONFLICT ACCEPT`。

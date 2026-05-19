---
title: "DATA BRANCH PICK"
doc_type: reference
mysql_compat: mo_only
differs_from_mysql: []
mo_only: true
since: v3.0.10
last_updated: 2026-05-08
llms_summary: "按主键或快照时间窗口从源表拣取指定行写入目标表的 MatrixOne 数据分支语句，可选择失败、跳过或接受冲突处理策略。"
---

# DATA BRANCH PICK

> 在 MatrixOne 数据分支语义下，将源表中指定的行拣取（cherry-pick）到目标表，无需合并整张表的差异。可以通过 `KEYS` 字面量列表、子查询或 `BETWEEN SNAPSHOT` 时间窗口圈定行集合；相同主键冲突时可按 FAIL / SKIP / ACCEPT 策略处理。

## 语法说明

`DATA BRANCH PICK` 在参与数据分支谱系的两张表之间（无论是否存在公共祖先）拷贝一个行子集。它复用 `DATA BRANCH DIFF` / `DATA BRANCH MERGE` 的差异计算能力，但把作用范围限定到你指定的键集或快照窗口，再把 INSERT / DELETE 变更写入目标表。

该语句适用于选择性同步场景，例如：把单条新数据从测试分支推到主分支、把某次修复回合到另一条分支，或只传播两个快照之间发生的变更。

## 语法结构

```
DATA BRANCH PICK source_table [{ SNAPSHOT = 'snapshot_name' }]
    INTO destination_table
    [BETWEEN SNAPSHOT snapshot_from AND snapshot_to]
    [KEYS ( key_list | subquery )]
    [WHEN CONFLICT conflict_option]
```

`KEYS (...)` 和 `BETWEEN SNAPSHOT ... AND ...` 至少要出现一个。

### KEYS 子句

```
key_list   ::= expr [, expr ...]
             | ( col1_val, col2_val [, ...] ) [, ( ... ) ...]
subquery   ::= SELECT ... FROM ...
```

### 冲突处理选项

```
conflict_option:
    FAIL                            -- 默认，遇到冲突时报错并终止。
  | SKIP                            -- 保留目标行原值，丢弃本次拣取的 DELETE + INSERT。
  | ACCEPT                          -- 用源行覆盖目标行（删除旧行，插入源行）。
```

## 语法释义

| 参数 | 说明 |
|------|------|
| `source_table` | 拣取的源表，可带 `{SNAPSHOT = 'snap'}` 源端时间选项。 |
| `destination_table` | 接收拣取数据的目标表，必须已存在且与源表 schema 一致。不允许在目标表上加快照选项。 |
| `KEYS (expr, ...)` | 要拣取的主键值字面量列表。单列主键时每项为标量；复合主键时每项为 `(c1, c2, ...)` 元组，元素个数需与主键列数一致。 |
| `KEYS (SELECT ...)` | 产出主键值的子查询。复合主键时子查询的列顺序必须与主键列顺序一致，且不允许产出 `NULL`。 |
| `BETWEEN SNAPSHOT a AND b` | 将拣取范围限定到源表在快照 `a` 到 `b` 之间发生的变更。快照名既可以是裸标识符，也可以是字符串字面量。不能与源表 `SNAPSHOT` 选项同时使用。 |
| `WHEN CONFLICT FAIL` | 当拣取键在目标表已有不同值时报错终止，是省略时的默认行为。 |
| `WHEN CONFLICT SKIP` | 保留目标表原行，丢弃该键的拣取（不执行 DELETE 或 INSERT）。 |
| `WHEN CONFLICT ACCEPT` | 用源表行覆盖目标表行（先删后写）。 |

## 使用说明

- **主键决定行匹配粒度。** 语句通过源/目标的主键匹配行。没有显式主键的表使用内部隐藏主键，仍然可用，但匹配粒度降为行级。
- **目标端快照被拒绝。** 在 `destination_table` 上加 `{SNAPSHOT = ...}` 将报错 `destination snapshot option is not supported for DATA BRANCH PICK`。
- **不支持显式事务。** 在 `BEGIN ... COMMIT` 块中执行 `DATA BRANCH PICK` 将报错 `DATA BRANCH PICK is not supported in explicit transactions`。
- **源表快照选项与 `BETWEEN` 互斥。** 同时使用 `source_table{SNAPSHOT = ...}` 和 `BETWEEN SNAPSHOT a AND b` 将报错 `BETWEEN SNAPSHOT and source table snapshot option cannot be used together`。
- **至少需要一个圈定子句。** 同时省略 `KEYS` 与 `BETWEEN SNAPSHOT` 将报错 `DATA BRANCH PICK requires a KEYS or BETWEEN SNAPSHOT clause`。
- **默认冲突策略是 FAIL。** 未指定 `WHEN CONFLICT` 时，遇到第一个冲突键即中止，并对剩余键不再处理。
- **源中不存在的键视为空操作。** 列表中的键如果不在源表（或在 `BETWEEN SNAPSHOT` 窗口内不在源端变更集中），该行被静默跳过。
- **KEYS 子查询约束。** 子查询返回列数必须与主键列数一致（单列 PK 返回 1 列，复合 PK 返回 N 列）；每行被强转为 PK 类型，不支持的类型报错 `KEYS subquery column type X is not supported for primary-key coercion`，`NULL` 值报错 `KEYS subquery returned NULL, but DATA BRANCH PICK primary keys cannot be NULL`。
- **复合主键。** 复合 PK 的字面量键必须是元组，列数不匹配将报错 `KEYS tuple has N elements but composite primary key has M columns`。
- **权限。** 调用者需要源表的 SELECT 类权限和目标表的写入类权限；否则报错 `do not have privilege to execute the statement`。

## 示例

```sql
DROP DATABASE IF EXISTS data_branch_pick_demo;
CREATE DATABASE data_branch_pick_demo;
USE data_branch_pick_demo;

-- 示例 1：从独立源表拣取指定行。
CREATE TABLE t1 (a INT, b INT, PRIMARY KEY(a));
INSERT INTO t1 VALUES (1,1),(3,3),(5,5);

CREATE TABLE t2 (a INT, b INT, PRIMARY KEY(a));
INSERT INTO t2 VALUES (1,1),(2,2),(4,4);

-- 只拣取 pk=2 的行。
DATA BRANCH PICK t2 INTO t1 KEYS(2);
SELECT * FROM t1 ORDER BY a ASC;

-- 继续拣取；源中不存在的键会被忽略。
DATA BRANCH PICK t2 INTO t1 KEYS(4);
DATA BRANCH PICK t2 INTO t1 KEYS(99);
SELECT * FROM t1 ORDER BY a ASC;

DROP TABLE t1;
DROP TABLE t2;

-- 示例 2：WHEN CONFLICT SKIP / ACCEPT 处理冲突。
CREATE TABLE t0 (a INT, b INT, PRIMARY KEY(a));
INSERT INTO t0 VALUES (1,1),(2,2);

DATA BRANCH CREATE TABLE t1 FROM t0;
INSERT INTO t1 VALUES (3,30);

DATA BRANCH CREATE TABLE t2 FROM t0;
INSERT INTO t2 VALUES (3,40);

-- 两个分支都插入了 pk=3 但值不同；默认 FAIL 模式下会报错中止。
-- Expected-Success: false
DATA BRANCH PICK t2 INTO t1 KEYS(3);

-- SKIP 保留 t1 的 (3,30)。
DATA BRANCH PICK t2 INTO t1 KEYS(3) WHEN CONFLICT SKIP;
SELECT * FROM t1 ORDER BY a ASC;

-- ACCEPT 用 t2 的 (3,40) 覆盖。
DATA BRANCH PICK t2 INTO t1 KEYS(3) WHEN CONFLICT ACCEPT;
SELECT * FROM t1 ORDER BY a ASC;

DROP TABLE t0;
DROP TABLE t1;
DROP TABLE t2;

-- 示例 3：通过 KEYS 子查询拣取。
CREATE TABLE t1 (a INT, b INT, PRIMARY KEY(a));
INSERT INTO t1 VALUES (1,1);

CREATE TABLE t2 (a INT, b INT, PRIMARY KEY(a));
INSERT INTO t2 VALUES (1,1),(2,2),(3,3),(4,4),(5,5);

-- 只拣取偶数键对应的行。
DATA BRANCH PICK t2 INTO t1 KEYS(SELECT a FROM t2 WHERE a % 2 = 0);
SELECT * FROM t1 ORDER BY a ASC;

DROP TABLE t1;
DROP TABLE t2;

-- 示例 4：复合主键的元组字面量键。
CREATE TABLE t0 (id INT, name VARCHAR(20), val INT, PRIMARY KEY(id, name));
INSERT INTO t0 VALUES (1,'alice',10),(2,'bob',20);

DATA BRANCH CREATE TABLE t1 FROM t0;
DATA BRANCH CREATE TABLE t2 FROM t0;

INSERT INTO t2 VALUES (4,'dave',40),(5,'eve',50),(6,'frank',60);

-- 拣取三条新行中的两条。
DATA BRANCH PICK t2 INTO t1 KEYS((4,'dave'),(6,'frank'));
SELECT * FROM t1 ORDER BY id, name;

DROP TABLE t0;
DROP TABLE t1;
DROP TABLE t2;

-- 示例 5：按快照时间窗口拣取变更。
DROP SNAPSHOT IF EXISTS sp1;
DROP SNAPSHOT IF EXISTS sp2;

CREATE TABLE t0 (a INT, b INT, PRIMARY KEY(a));
INSERT INTO t0 VALUES (1,1),(2,2),(3,3);

DATA BRANCH CREATE TABLE t1 FROM t0;

CREATE SNAPSHOT sp1 FOR ACCOUNT sys;

INSERT INTO t1 VALUES (4,4),(5,5);

CREATE SNAPSHOT sp2 FOR ACCOUNT sys;

INSERT INTO t1 VALUES (6,6),(7,7);

-- 仅拣取在 sp1 与 sp2 之间发生的变更（pk=4,5）；sp2 之后的 pk=6,7 不拣取。
DATA BRANCH PICK t1 INTO t0 BETWEEN SNAPSHOT sp1 AND sp2;
SELECT * FROM t0 ORDER BY a ASC;

-- BETWEEN 可以与 KEYS 组合，取时间窗口与键集合的交集。
DATA BRANCH PICK t1 INTO t0 BETWEEN SNAPSHOT sp1 AND sp2 KEYS(5);
SELECT * FROM t0 ORDER BY a ASC;

DROP SNAPSHOT sp1;
DROP SNAPSHOT sp2;
DROP TABLE t0;
DROP TABLE t1;

DROP DATABASE data_branch_pick_demo;
```

## 注意事项

1. `DATA BRANCH PICK` 会把 INSERT / DELETE 变更写入目标表；不是快照式原子拷贝，冲突处理是按行生效的。
2. 同时提供 `BETWEEN SNAPSHOT` 和 `KEYS` 时，实际拣取集合是两者的交集。
3. 拣取一个在目标表存在但在源表不存在的键，为空操作。拣取一个在源表被删除、目标表未变更的键，会把 DELETE 传播到目标表。
4. `WHEN CONFLICT FAIL` 下的错误信息形如：`conflict: <dst_table> INSERT and <src_table> INSERT on pk(<pk>) with different values`。

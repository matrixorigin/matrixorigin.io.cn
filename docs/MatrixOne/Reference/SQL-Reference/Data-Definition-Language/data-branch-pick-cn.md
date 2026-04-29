# DATA BRANCH PICK

## 语法说明

`DATA BRANCH PICK` 语句用于把源分支表中**指定的若干行** cherry-pick
到目标分支表。与会把两个分支之间所有差异整体应用的 `DATA BRANCH MERGE`
不同，`PICK` 只应用用户选择的行——可以通过列出主键（`KEYS`）来选择，
也可以通过快照区间（`BETWEEN SNAPSHOT`）来限定。

`DATA BRANCH PICK` 复用 `DATA BRANCH DIFF` / `DATA BRANCH MERGE` 使用的
差异管道：系统会自动识别两个表之间的最近公共祖先（LCA，Lowest Common
Ancestor），计算出 KEYS 指定主键所对应的有效 INSERT / DELETE / UPDATE
集合，然后按照指定的冲突策略应用到目标表。

## 语法结构

```
DATA BRANCH PICK source_table INTO destination_table
    KEYS ( key_list | select_stmt )
    [WHEN CONFLICT conflict_option]

DATA BRANCH PICK source_table INTO destination_table
    BETWEEN SNAPSHOT from_snapshot AND to_snapshot
    [KEYS ( key_list | select_stmt )]
    [WHEN CONFLICT conflict_option]
```

### KEYS 子句

```
KEYS ( expr [, expr ...] )          -- 字面主键值列表
KEYS ( select_stmt )                -- 返回主键行的子查询
```

对于复合主键，字面 key 必须写成与主键列顺序一致的 tuple；子查询必须
返回与主键列数一致的列。

### BETWEEN SNAPSHOT 子句

```
BETWEEN SNAPSHOT snapshot_name AND snapshot_name
```

快照名既可以写成标识符，也可以写成带引号的字符串字面量。该区间用于
限定源侧要 pick 的行所在的时间窗口。

### 冲突处理选项

```
conflict_option:
    FAIL                            -- 遇到冲突时报错并终止（默认行为）
  | SKIP                            -- 跳过冲突的行，保留目标表的数据
  | ACCEPT                          -- 接受源表的数据，覆盖目标表的冲突数据
```

## 语法释义

| 参数 | 说明 |
|------|------|
| `source_table` | 源分支表。可以带 `{SNAPSHOT = 'snapshot_name'}` 选项，把源端定位到某个快照。 |
| `destination_table` | 目标分支表。目标表**不支持**快照选项。 |
| `KEYS ( key_list )` | 字面主键值。单列主键使用标量值；复合主键使用 tuple `(v1, v2, ...)`。 |
| `KEYS ( select_stmt )` | 返回主键列的子查询。单列主键要求子查询返回 1 列；复合主键要求子查询按顺序返回全部主键列。 |
| `BETWEEN SNAPSHOT from_snapshot AND to_snapshot` | 限定只挑选源端在两个快照之间发生的变更。可与 `KEYS` 组合，只挑选同时在该 KEYS 集合中的行。 |
| `WHEN CONFLICT FAIL` | 默认值。若被 pick 的行与目标表冲突，立即报错。 |
| `WHEN CONFLICT SKIP` | 保留目标表中冲突键的原值。 |
| `WHEN CONFLICT ACCEPT` | 使用源表值覆盖目标表中的冲突值。 |

### 冲突的定义

当被 pick 的主键在两个分支上**同时存在且取值不同**时，会被判定为
冲突。例如：两个分支都插入了相同主键但不同列值的行；或两个分支都
更新了同一主键但结果不同；或一侧删除、另一侧更新同一主键。

## 使用说明

- `DATA BRANCH PICK` **不支持** 显式事务（`BEGIN ... COMMIT` 内）。
  必须在自动提交模式下执行。
- 语句必须至少带 `KEYS` 或 `BETWEEN SNAPSHOT` 其一，两者都缺失会报错。
- `BETWEEN SNAPSHOT` 不能与源表的 `{SNAPSHOT = ...}` 选项同时使用。
- 目标表不支持 `{SNAPSHOT = ...}` 选项，写了会被拒绝。
- 子查询返回的主键列不允许出现 `NULL`。
- 未显式指定 `WHEN CONFLICT` 时，默认行为是 `WHEN CONFLICT FAIL`。
- 权限：执行者需要具备读取源表以及修改目标表所需的权限。

## 示例

### 示例 1：按主键 pick

从一个分支中挑一行到另一个分支。

```sql
CREATE DATABASE test;
USE test;

CREATE TABLE t1 (a INT, b INT, PRIMARY KEY(a));
INSERT INTO t1 VALUES (1,1),(3,3),(5,5);

CREATE TABLE t2 (a INT, b INT, PRIMARY KEY(a));
INSERT INTO t2 VALUES (1,1),(2,2),(4,4);

DATA BRANCH PICK t2 INTO t1 KEYS(2);
SELECT * FROM t1 ORDER BY a;
+------+------+
| a    | b    |
+------+------+
|    1 |    1 |
|    2 |    2 |
|    3 |    3 |
|    5 |    5 |
+------+------+

DATA BRANCH PICK t2 INTO t1 KEYS(4);
SELECT * FROM t1 ORDER BY a;
+------+------+
| a    | b    |
+------+------+
|    1 |    1 |
|    2 |    2 |
|    3 |    3 |
|    4 |    4 |
|    5 |    5 |
+------+------+

DROP TABLE t1;
DROP TABLE t2;
```

### 示例 2：带冲突处理的 pick

两个分支都插入了相同主键但不同的列值。默认的 `WHEN CONFLICT FAIL`
会直接报错；`WHEN CONFLICT SKIP` 会保留目标表原值；
`WHEN CONFLICT ACCEPT` 会用源表值覆盖。

```sql
CREATE TABLE t0 (a INT, b INT, PRIMARY KEY(a));
INSERT INTO t0 VALUES (1,1),(2,2);

DATA BRANCH CREATE TABLE t1 FROM t0;
INSERT INTO t1 VALUES (3,30);

DATA BRANCH CREATE TABLE t2 FROM t0;
INSERT INTO t2 VALUES (3,40);

-- 默认 FAIL：以下语句会报错
DATA BRANCH PICK t2 INTO t1 KEYS(3);

DATA BRANCH PICK t2 INTO t1 KEYS(3) WHEN CONFLICT SKIP;
SELECT * FROM t1 ORDER BY a;
+------+------+
| a    | b    |
+------+------+
|    1 |    1 |
|    2 |    2 |
|    3 |   30 |
+------+------+

DATA BRANCH PICK t2 INTO t1 KEYS(3) WHEN CONFLICT ACCEPT;
SELECT * FROM t1 ORDER BY a;
+------+------+
| a    | b    |
+------+------+
|    1 |    1 |
|    2 |    2 |
|    3 |   40 |
+------+------+

DROP TABLE t0;
DROP TABLE t1;
DROP TABLE t2;
```

### 示例 3：使用子查询驱动 KEYS（复合主键）

用子查询提供要 pick 的主键集合。对于复合主键，子查询必须按顺序返回
全部主键列。

```sql
CREATE TABLE t0 (a INT, b INT, c VARCHAR(20), PRIMARY KEY(a, b));
INSERT INTO t0 VALUES (1,1,'base'),(2,2,'base');

DATA BRANCH CREATE TABLE t1 FROM t0;
DATA BRANCH CREATE TABLE t2 FROM t0;

INSERT INTO t2 VALUES (3,3,'new'),(4,4,'new'),(5,5,'new'),(6,6,'new');

DATA BRANCH PICK t2 INTO t1
    KEYS(SELECT a, b FROM t2 WHERE a >= 4 AND a % 2 = 0);

SELECT * FROM t1 ORDER BY a, b;
+------+------+------+
| a    | b    | c    |
+------+------+------+
|    1 |    1 | base |
|    2 |    2 | base |
|    4 |    4 | new  |
|    6 |    6 | new  |
+------+------+------+

DROP TABLE t0;
DROP TABLE t1;
DROP TABLE t2;
```

### 示例 4：按快照区间 pick

`BETWEEN SNAPSHOT` 把 pick 限定在源端两个快照之间发生的变更。快照名
可以是标识符，也可以是字符串字面量。

```sql
CREATE TABLE t0 (a INT, b INT, PRIMARY KEY(a));
INSERT INTO t0 VALUES (1,1);

DATA BRANCH CREATE TABLE t1 FROM t0;

CREATE SNAPSHOT sp_from FOR ACCOUNT sys;
INSERT INTO t1 VALUES (2,2),(3,3);
CREATE SNAPSHOT sp_to FOR ACCOUNT sys;
INSERT INTO t1 VALUES (4,4);

-- 仅 pick sp_from 与 sp_to 之间 t1 上新增的行
DATA BRANCH PICK t1 INTO t0 BETWEEN SNAPSHOT 'sp_from' AND 'sp_to';
SELECT * FROM t0 ORDER BY a;
+------+------+
| a    | b    |
+------+------+
|    1 |    1 |
|    2 |    2 |
|    3 |    3 |
+------+------+

DROP SNAPSHOT sp_from;
DROP SNAPSHOT sp_to;
DROP TABLE t0;
DROP TABLE t1;
```

### 示例 5：BETWEEN SNAPSHOT 与 KEYS 组合

`BETWEEN SNAPSHOT` 与 `KEYS` 可以一起使用，只挑选快照区间内、
主键同时在 KEYS 集合中的行。

```sql
CREATE TABLE t0 (a INT, b INT, PRIMARY KEY(a));
INSERT INTO t0 VALUES (1,1),(2,2),(3,3);

DATA BRANCH CREATE TABLE t1 FROM t0;

CREATE SNAPSHOT sp1 FOR ACCOUNT sys;
INSERT INTO t1 VALUES (4,4),(5,5),(6,6);
CREATE SNAPSHOT sp2 FOR ACCOUNT sys;
INSERT INTO t1 VALUES (7,7);

-- sp1~sp2 之间新增了 {4,5,6}，其中只 pick pk=5
DATA BRANCH PICK t1 INTO t0 BETWEEN SNAPSHOT 'sp1' AND 'sp2' KEYS(5);
SELECT * FROM t0 ORDER BY a;
+------+------+
| a    | b    |
+------+------+
|    1 |    1 |
|    2 |    2 |
|    3 |    3 |
|    5 |    5 |
+------+------+

DROP SNAPSHOT sp1;
DROP SNAPSHOT sp2;
DROP TABLE t0;
DROP TABLE t1;
```

## 注意事项

1. **必须带 KEYS 或 BETWEEN SNAPSHOT**：二者都缺失会被拒绝。
2. **不支持显式事务**：`DATA BRANCH PICK` 必须在自动提交模式下执行，
   位于 `BEGIN ... COMMIT` 内会被拒绝。
3. **源端快照与 BETWEEN SNAPSHOT 互斥**：不能同时给源表加
   `{SNAPSHOT = ...}` 和 `BETWEEN SNAPSHOT`。
4. **目标表不支持快照选项**：目标表必须指向实时表，带
   `{SNAPSHOT = ...}` 会被拒绝。
5. **主键不允许为 NULL**：子查询返回主键列值为 `NULL` 时会报错。
6. **默认冲突策略为 FAIL**：若需非失败行为，请显式写
   `WHEN CONFLICT SKIP` 或 `WHEN CONFLICT ACCEPT`。

---
title: "分支保护快照"
doc_type: reference
mysql_compat: mo_only
differs_from_mysql: []
mo_only: true
since: v3.0.13
last_updated: 2026-05-19
llms_summary: "DATA BRANCH CREATE 自动创建的内部快照，用于保护父表数据不被垃圾回收，对 SHOW SNAPSHOTS 不可见，在 DAG 子树全部删除后自动回收。"
---

# 分支保护快照

> 当 `DATA BRANCH CREATE TABLE` 或 `DATA BRANCH CREATE DATABASE` 创建数据分支时，MatrixOne 自动在 `mo_catalog.mo_snapshots` 中插入一条 `kind='branch'` 的内部快照行。该快照保护父表的数据在仍有后代分支存在时不被垃圾回收。分支保护快照对 `SHOW SNAPSHOTS` 不可见，被 `DROP SNAPSHOT` 拒绝删除，并在整个 DAG 子树被删除后自动回收。

## 语法

无独立 SQL 语法 —— 分支保护快照由 `DATA BRANCH CREATE TABLE` 和 `DATA BRANCH CREATE DATABASE` 自动创建。它们是 `mo_catalog.mo_snapshots` 中的内部目录行，无法通过快照命令（`CREATE SNAPSHOT`、`SHOW SNAPSHOTS`、`DROP SNAPSHOT`）直接创建、列出或删除。

## 参数

分支保护快照通过以下内部命名和分类约定标识：

| 属性 | 值 | 说明 |
|---|---|---|
| `sname` | `__mo_branch_<child_table_id>` | 快照名称；`child_table_id` 为子分支表的集群唯一表标识符，以十进制字符串格式保存 |
| `kind` | `branch` | 区分分支保护快照与用户创建的快照（`kind='user'`） |
| `level` | `table` | 所有分支保护快照均为表级别 |
| `obj_id` | 父表的 `table_id` | 引用此快照所保护数据的父表 |
| `account_name` | 父表所属的账户名称 | 拥有父表的账户 |

## 概念

分支保护快照是 `mo_catalog.mo_snapshots` 中由数据分支子系统全权管理的内部行。它不是用户快照 —— 其 `kind` 列为 `branch`，由系统自动维护。

关键属性：

| 属性 | 值 |
|---|---|
| `sname` | `__mo_branch_<child_table_id>`（十进制） |
| `kind` | `branch` |
| `level` | `table` |
| 创建方 | `DATA BRANCH CREATE TABLE` / `DATA BRANCH CREATE DATABASE` |
| 可见性 | `SHOW SNAPSHOTS` 不显示 |
| 用户可删除 | 否 —— `DROP SNAPSHOT` 拒绝删除 |
| 自动回收 | `DATA BRANCH DELETE TABLE` / `DATA BRANCH DELETE DATABASE` / `DROP TABLE` |

## 生命周期

### 创建

当 `DATA BRANCH CREATE TABLE` 或 `DATA BRANCH CREATE DATABASE` 语句成功执行时，MatrixOne 在同一事务内原子性地插入两行：

1. 在 `mo_catalog.mo_branch_metadata` 中记录父子表关系。
2. 在 `mo_catalog.mo_snapshots` 中插入一条 `kind='branch'` 的行，锚定父表在分支创建时的 `clone_ts`。

快照命名遵循 `__mo_branch_<child_table_id>` 规则，`child_table_id` 是集群内唯一的表标识符。

### 可见性

分支保护快照在所有面向用户的操作中被排除：

- `SHOW SNAPSHOTS` 过滤掉 `kind='branch'` 的行。
- 快照配额统计忽略 `kind='branch'` 的行。
- `DROP SNAPSHOT` 对分支保护快照直接返回错误。

### 回收

分支保护快照通过 DAG 感知的级联算法自动回收：

1. 当分支子表被删除（通过 `DATA BRANCH DELETE TABLE`、`DATA BRANCH DELETE DATABASE` 或 `DROP TABLE`）时，相应元数据行的 `table_deleted` 被置为 `true`。
2. 回收算法从被删除的表沿 DAG 向上遍历，检查每个祖先的子树是否全部被删除。
3. 当整个子树确认已完全删除（所有后代 `table_deleted=true`）时，祖先的分支保护快照从 `mo_snapshots` 中移除。
4. 回收算法具备环安全性 —— 即使 `mo_branch_metadata` 出现异常环，也仅记录警告并正常终止，不会死锁。

## 示例

### 验证分支保护快照的创建及 DROP SNAPSHOT 拒绝删除

```sql
DROP DATABASE IF EXISTS protect_db1;
CREATE DATABASE protect_db1;
USE protect_db1;

CREATE TABLE t1(a INT PRIMARY KEY, b VARCHAR(10));
INSERT INTO t1 VALUES (1, 'a'), (2, 'b');

DATA BRANCH CREATE TABLE t2 FROM t1;

-- 分支保护快照以 kind='branch' 存在
SET @t2_tid = (
  SELECT rel_id FROM mo_catalog.mo_tables
  WHERE reldatabase = 'protect_db1' AND relname = 't2'
);
SET @t1_tid = (
  SELECT rel_id FROM mo_catalog.mo_tables
  WHERE reldatabase = 'protect_db1' AND relname = 't1'
);
SET @t2_sname = CONCAT('__mo_branch_', CAST(@t2_tid AS CHAR));

SELECT COUNT(*) AS branch_rows_total
  FROM mo_catalog.mo_snapshots WHERE kind = 'branch';
SELECT level, database_name, table_name,
       obj_id = @t1_tid AS obj_id_matches_parent
  FROM mo_catalog.mo_snapshots
  WHERE sname = @t2_sname AND kind = 'branch';

-- SHOW SNAPSHOTS 不显示 kind='branch' 的行
SELECT COUNT(*) AS branch_rows_in_show
  FROM mo_catalog.mo_snapshots
  WHERE sname NOT LIKE 'ccpr_%' AND kind != 'branch'
    AND sname LIKE '__mo_branch_%';

-- DROP SNAPSHOT 删除分支保护快照将被拒绝
SET @drop_snap_sql = CONCAT('DROP SNAPSHOT ', @t2_sname);
PREPARE drop_snap_stmt FROM @drop_snap_sql;
-- Expected-Success: false
EXECUTE drop_snap_stmt;
DEALLOCATE PREPARE drop_snap_stmt;

DROP TABLE t2;
DROP TABLE t1;
DROP DATABASE protect_db1;
```

## 注意事项

- 分支保护快照是内部机制。不要直接创建、列出或删除它们。仅对用户快照使用 `SHOW SNAPSHOTS`。
- 如需释放存储，请通过 `DATA BRANCH DELETE TABLE` 或 `DATA BRANCH DELETE DATABASE` 删除分支子表，关联快照将自动清理。
- `mo_catalog.mo_snapshots` 中的 `kind='branch'` 列是区分内部快照与用户快照的权威依据。请勿直接修改该列。

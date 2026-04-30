# Role 规则

## 语法说明

Role rule 是以 role + 表 为粒度的 SQL 改写规则。当一个用户的当前 role 上存在规则时，MatrixOne 会在 SELECT 之前注入一条 rewrite 注释，优化器据此把被引用的表替换为规则中给出的过滤 SELECT。

Role rule 由以下语句管理：

- `ALTER ROLE role ADD RULE "rule_sql" ON TABLE db.tbl`：新增或覆盖规则。
- `ALTER ROLE role DROP RULE ON TABLE db.tbl`：删除规则。
- `SHOW RULES ON ROLE role`：列出 role 上的所有规则。

规则存储在 `mo_catalog.mo_role_rule`（`role_id`、`rule_name`、`rule`）。规则是否生效由 session 系统变量 `enable_remap_hint` 控制：只有当该变量为真时，rewrite 注释才会被注入。

## 语法结构

```
ALTER ROLE role_name ADD RULE "rule_sql" ON TABLE db_name.table_name

ALTER ROLE role_name DROP RULE ON TABLE db_name.table_name

SHOW RULES ON ROLE role_name
```

## 语法释义

| 子句 | 说明 |
|------|------|
| `role_name` | 已存在的 role 名。如果 role 不存在，语句返回 `there is no role <role_name>`。 |
| `"rule_sql"` | 对 `db_name.table_name` 的替换 SELECT，写成双引号包裹的字符串。 |
| `db_name.table_name` | 规则应用的目标表，用作规则 key；同一 `(role, db.table)` 组合只能有一条规则。对同一张表再次执行 `ADD RULE` 会覆盖原规则。 |
| `enable_remap_hint` | 布尔类型的系统变量（scope 为 session/global，默认 `0`）。需要设置为 `1` 才会在当前 session 注入 rewrite 注释。 |

规则的 key 是 `(role_id, rule_name)`，其中 `rule_name` 由 `db_name.table_name` 推导出来。若 rule 不存在而执行 `DROP RULE`，会返回 `rule '<db>.<tbl>' does not exist for role '<role>'`。

## 使用说明

- `ALTER ROLE ... ADD RULE` 先校验 role 存在，再对同 `rule_name` 做一次删除，然后插入新值。这使得对同一张表重复 `ADD RULE` 是幂等的。
- `ALTER ROLE ... DROP RULE` 要求 role 和 rule 都存在，否则会返回内部错误。
- `SHOW RULES ON ROLE` 返回两列：`rule_name`（`db.table` 形式的 key）和 `rule`（保存的 SELECT 文本）。
- 规则仅在 session 的 `enable_remap_hint` 为真时生效；否则规则仍然保存，但对查询没有影响。
- 修改规则后，当前 session 会立即生效。其他 session（使用相同 role）仍然使用缓存中的旧规则，直到执行 `SET ROLE` 刷新或重新连接。
- 规则命中后，用户依然需要对目标表具备普通的 `SELECT` 权限，改写后的 SQL 才能被继续执行。
- 每个 `(role, db.table)` 组合只能有一条规则。如需对同一张表组合多个过滤条件，请把它们写在同一条 `rule_sql` 中。

## 示例

以下示例都运行在同一个数据库 `role_rule_demo_db` 中。

### 示例 1：新增规则并用 `SHOW RULES` 查看

```sql
DROP DATABASE IF EXISTS role_rule_demo_db;
CREATE DATABASE role_rule_demo_db;
USE role_rule_demo_db;

CREATE TABLE t1 (a INT, age INT);
INSERT INTO t1 VALUES (1,1),(2,2),(100,30);

DROP ROLE IF EXISTS test_rule_role;
CREATE ROLE test_rule_role;

ALTER ROLE test_rule_role ADD RULE "select * from role_rule_demo_db.t1 where age > 28" ON TABLE role_rule_demo_db.t1;
SHOW RULES ON ROLE test_rule_role;

DROP ROLE IF EXISTS test_rule_role;
DROP TABLE t1;
DROP DATABASE role_rule_demo_db;
```

### 示例 2：覆盖规则并删除

```sql
DROP DATABASE IF EXISTS role_rule_demo_db;
CREATE DATABASE role_rule_demo_db;
USE role_rule_demo_db;

CREATE TABLE t1 (a INT, age INT);
INSERT INTO t1 VALUES (1,1),(2,2),(100,30);

DROP ROLE IF EXISTS test_rule_role;
CREATE ROLE test_rule_role;

ALTER ROLE test_rule_role ADD RULE "select * from role_rule_demo_db.t1 where age > 28" ON TABLE role_rule_demo_db.t1;

-- 同一张表再次 ADD RULE 会覆盖原规则。
ALTER ROLE test_rule_role ADD RULE "select * from role_rule_demo_db.t1 where age > 50" ON TABLE role_rule_demo_db.t1;
SHOW RULES ON ROLE test_rule_role;

ALTER ROLE test_rule_role DROP RULE ON TABLE role_rule_demo_db.t1;
SHOW RULES ON ROLE test_rule_role;

DROP ROLE IF EXISTS test_rule_role;
DROP TABLE t1;
DROP DATABASE role_rule_demo_db;
```

### 示例 3：通过 `enable_remap_hint` 激活改写

```sql
DROP DATABASE IF EXISTS role_rule_demo_db;
CREATE DATABASE role_rule_demo_db;
USE role_rule_demo_db;

CREATE TABLE t1 (a INT, age INT);
INSERT INTO t1 VALUES (1,1),(2,2),(100,30);

DROP ROLE IF EXISTS test_rule_role;
CREATE ROLE test_rule_role;

ALTER ROLE test_rule_role ADD RULE "select * from role_rule_demo_db.t1 where age > 28" ON TABLE role_rule_demo_db.t1;

SET enable_remap_hint = 1;
SELECT * FROM role_rule_demo_db.t1;

DROP ROLE IF EXISTS test_rule_role;
DROP TABLE t1;
DROP DATABASE role_rule_demo_db;
```

### 示例 4：对不存在 role 或不存在 rule 的报错

```sql
DROP DATABASE IF EXISTS role_rule_demo_db;
CREATE DATABASE role_rule_demo_db;
USE role_rule_demo_db;

CREATE TABLE t1 (a INT, age INT);

DROP ROLE IF EXISTS test_rule_role;
CREATE ROLE test_rule_role;

-- Expected-Success: false
ALTER ROLE non_existent_role ADD RULE "select * from role_rule_demo_db.t1" ON TABLE role_rule_demo_db.t1;

-- Expected-Success: false
ALTER ROLE test_rule_role DROP RULE ON TABLE role_rule_demo_db.t1;

-- Expected-Success: false
SHOW RULES ON ROLE non_existent_role;

DROP ROLE IF EXISTS test_rule_role;
DROP TABLE t1;
DROP DATABASE role_rule_demo_db;
```

## 注意事项

- `enable_remap_hint` 是布尔类型的系统变量，scope 为 `ScopeBoth`；可用 `SET enable_remap_hint = 1` 在当前 session 打开，或用 `SET GLOBAL enable_remap_hint = 1` 作为全局默认。
- 改写注释以 `/*+ {"rewrites": {...}} */` 的形式注入 SQL 前缀，由优化器内部消费。
- 如果 session 没有打开 `enable_remap_hint`，或者当前 role 上没有规则，规则机制对查询透明，不会造成影响。

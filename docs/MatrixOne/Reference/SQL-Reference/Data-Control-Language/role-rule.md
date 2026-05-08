---
title: "角色重写规则（ALTER ROLE ... RULE / SHOW RULES）"
doc_type: reference
mysql_compat: mo_only
differs_from_mysql: []
mo_only: true
since: v3.0.10
last_updated: 2026-05-08
llms_summary: "通过 ALTER ROLE ADD RULE / DROP RULE 为 MatrixOne 角色挂载按表的重写规则，并用 SHOW RULES ON ROLE 列出；会话通过 enable_remap_hint 变量启用注入。"
---

# 角色重写规则

> 通过 `ALTER ROLE ... ADD RULE ... ON TABLE db.tbl` 为角色挂载按表的重写规则，通过 `ALTER ROLE ... DROP RULE ON TABLE db.tbl` 卸载，通过 `SHOW RULES ON ROLE role` 列出。规则会被注入到默认角色拥有该规则、且会话已打开 `enable_remap_hint` 的 SQL 中作为 hint 生效。

## 语法说明

角色重写规则把一段替换 SQL 片段绑定到 `(role, table)` 键对上，存储于 `mo_catalog.mo_role_rule`。当会话的默认角色拥有匹配规则、且会话变量 `enable_remap_hint` 被打开时，前端会把 `/*+ {"rewrites": {...}} */` hint 前缀到发出的 SQL 上，让下游重写器把对基表的查询透明地转向规则体（例如转向视图或带过滤的子查询）。

这一特性由三条语句控制：

- `ALTER ROLE <role> ADD RULE "<sql>" ON TABLE <db>.<tbl>`——新增或覆盖规则。
- `ALTER ROLE <role> DROP RULE ON TABLE <db>.<tbl>`——卸载规则。
- `SHOW RULES ON ROLE <role>`——列出角色上所有规则。

规则以角色为维度；同一角色在同一 `(db, tbl)` 上至多只有一条规则——再次对同一张表 ADD RULE 会覆盖旧规则。

## 语法结构

```text
ALTER ROLE <role_name> ADD RULE "<rewrite_sql>" ON TABLE <db_name>.<table_name>
ALTER ROLE <role_name> DROP RULE ON TABLE <db_name>.<table_name>
SHOW RULES ON ROLE <role_name>
```

## 语法释义

| 参数 | 说明 |
|------|------|
| `role_name` | 要挂载或卸载规则的角色名，必须已存在。 |
| `rewrite_sql` | 替换用 SQL 字符串，可用双引号或单引号包裹。原样存入 `mo_catalog.mo_role_rule.rule`。 |
| `db_name.table_name` | 规则目标表的全限定标识符。两部分共同组成 `mo_catalog.mo_role_rule.rule_name` 列。 |

## 使用说明

- **角色必须存在。** 三条语句都会先按角色名查 `role_id`，角色不存在时报错 `there is no role <role_name>`。
- **目标表可以暂不存在。** `ALTER ROLE ... ADD RULE` 不校验目标表存在；`db_name.table_name` 只作为规则的键以及后续查询的重写目标。
- **Upsert 语义。** 在同一 `(role, db.table)` 已有规则时再次 ADD RULE 会覆盖旧规则体。
- **DROP RULE 需要规则已存在。** `ALTER ROLE ... DROP RULE ON TABLE db.tbl` 对未挂载规则的表报错 `rule '<db.table>' does not exist for role '<role>'`。
- **`enable_remap_hint`。** 只有会话变量 `enable_remap_hint` 为 `1`（或 `ON`）时，才会向 SQL 注入重写 hint。否则规则虽已存储但运行时无效。
- **缓存按会话失效。** ADD / DROP 规则后只会让当前会话的规则缓存失效；其他已加载缓存的会话需要重连或重新执行 `SET ROLE` 才能看到最新规则。
- **存储位置。** 规则落在 `mo_catalog.mo_role_rule`，按 `(role_id, rule_name)` 一行。`SHOW RULES ON ROLE` 输出 `rule_name` 与 `rule` 两列。

## 示例

```sql
DROP DATABASE IF EXISTS role_rule_demo;
CREATE DATABASE role_rule_demo;
USE role_rule_demo;

CREATE TABLE t1 (a INT PRIMARY KEY, age INT);
INSERT INTO t1 VALUES (1, 1), (2, 2), (100, 30);

DROP ROLE IF EXISTS demo_rule_role;
CREATE ROLE demo_rule_role;

-- 示例 1：挂载一条规则并列出角色上的规则。
ALTER ROLE demo_rule_role ADD RULE 'select a, age from t1 where age > 28' ON TABLE role_rule_demo.t1;
SHOW RULES ON ROLE demo_rule_role;

-- 示例 2：在同一 (role, db.table) 上再次 ADD RULE 会覆盖旧规则体。
ALTER ROLE demo_rule_role ADD RULE 'select a, age from t1 where age > 50' ON TABLE role_rule_demo.t1;
SHOW RULES ON ROLE demo_rule_role;

-- 示例 3：DROP RULE 卸载目标表上的规则。
ALTER ROLE demo_rule_role DROP RULE ON TABLE role_rule_demo.t1;
SHOW RULES ON ROLE demo_rule_role;

-- 示例 4：卸载不存在的规则会报错。
-- Expected-Success: false
ALTER ROLE demo_rule_role DROP RULE ON TABLE role_rule_demo.t1;

-- 示例 5：对不存在的角色操作，三条语句都会报错。
-- Expected-Success: false
ALTER ROLE non_existent_role ADD RULE 'select 1' ON TABLE role_rule_demo.t1;

DROP ROLE IF EXISTS demo_rule_role;
DROP TABLE t1;
DROP DATABASE role_rule_demo;
```

## 注意事项

1. 注入到 SQL 的 hint 形式为 `/*+ {"rewrites": {"<db.table>": "<rule_sql>", ...}} */`。下游重写器决定如何使用它；没有匹配的重写器时 hint 等同于空操作。
2. 规则体是不透明字符串——服务端不校验 `rewrite_sql` 是否真的引用目标表。建议规则尽量精简，并定期审阅 `mo_catalog.mo_role_rule`。
3. 规则以会话的*默认角色*解析。通过 `SET ROLE` 或重新登录改变默认角色会重新加载规则缓存。

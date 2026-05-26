---
title: Role Rewrite Rules (ALTER ROLE ... RULE / SHOW RULES)
doc_type: reference
mysql_compat: mo_only
differs_from_mysql: []
mo_only: []
since: v3.0.10
last_updated: 2026-05-26
llms_summary: '角色重写规则把一段替换 SQL 片段绑定到 (role, table) 键对上，存储于 mo_catalog.mo_role_rule。当会话的默认角色拥有匹配规则、且会话变量 enable_remap_hint 被打开时，前端会把 /*+ {"rewrites": {...}} */ hint 前缀到发出的 SQL 上，让下游重写器把对基表的查询透明地转向规则体（例如转向视图或带过滤的子查询）。'
---

# 角色重写规则

> 通过 `ALTER ROLE ... ADD RULE ... ON TABLE db.tbl` 为角色挂载按表的重写规则，通过 `ALTER ROLE ... DROP RULE ON TABLE db.tbl` 卸载，通过 `SHOW RULES ON ROLE role` 列出。规则会被注入到默认角色拥有该规则、且会话已打开 `enable_remap_hint` 的 SQL 中作为 hint 生效。

## 语法说明

角色重写规则把一段替换 SQL 片段绑定到 `(role, table)` 键对上，存储于 `mo_catalog.mo_role_rule`。当会话变量 `enable_remap_hint` 被打开时，前端会从**所有活跃角色**——默认角色、直接授予的次要角色以及继承角色——收集规则，然后把 `/*+ {"rewrites": {...}} */` hint 前缀到发出的 SQL 上，让下游重写器把对基表的查询透明地转向规则体（例如转向视图或带过滤的子查询）。

这一特性由三条语句控制：

- `ALTER ROLE <role> ADD RULE "<sql>" ON TABLE <db>.<tbl>`——新增或覆盖规则。`<sql>` 必须是语法合法的 `SELECT` 语句；非 SELECT 或语法错误的 SQL 会在写入前被拒绝。
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

- **所有活跃角色均参与规则加载。** 当 `enable_remap_hint` 开启时，规则会从默认角色、直接授予的次要角色（若 `SET SECONDARY ROLE ALL` 生效）、以及所有继承角色（按授予时间广度优先遍历发现）一起加载。此前只加载默认角色的规则。
- **规则冲突解决。** 多个角色对同一 `(db, tbl)` 同时定义规则时，优先级按活跃角色发现顺序：默认角色最高，直接授予次要角色（按授予时间）其次，继承角色（按授予时间广度优先）再次。同一 `rule_name` 下后优先级的规则覆盖先优先级的规则。
- **兼容规则合并。** 不同角色中输出列相同（列名与表达式一致）的规则会合并为 `(...role_a_rule...) UNION DISTINCT (...role_b_rule...)` 的单一规则体。不可合并的规则（输出列不同、含聚合函数、窗口函数、ORDER BY、LIMIT 或易变函数）则按优先级解决——高优先级规则胜出，不会生成破损的 UNION。
- **ADD RULE 时校验规则 SQL。** `ALTER ROLE ... ADD RULE` 现在会在写入 `mo_catalog.mo_role_rule` 之前解析并校验 `rule_sql`。只接受语法合法的 `SELECT`（及加括号的 SELECT）语句。空 SQL、语法错误及非 SELECT 语句（如 `DELETE`、`UPDATE`）会被立即拒绝并报错。
- **错误传播。** 加载规则缓存失败时（例如某条此前已被接受的规则无法解析），错误会作为查询错误返回给客户端，而不再被静默吞掉。在旧版本中本会静默回退到未修改 SQL 的查询，升级后可能会显式报错。
- **角色必须存在。** 三条语句都会先按角色名查 `role_id`，角色不存在时报错 `there is no role <role_name>`。
- **目标表可以暂不存在。** `ALTER ROLE ... ADD RULE` 不校验目标表存在；`db_name.table_name` 只作为规则的键以及后续查询的重写目标。
- **Upsert 语义。** 在同一 `(role, db.table)` 已有规则时再次 ADD RULE 会覆盖旧规则体。
- **DROP RULE 需要规则已存在。** `ALTER ROLE ... DROP RULE ON TABLE db.tbl` 对未挂载规则的表报错 `rule '<db.table>' does not exist for role '<role>'`。
- **`enable_remap_hint`。** 只有会话变量 `enable_remap_hint` 为 `1`（或 `ON`）时，才会向 SQL 注入重写 hint。否则规则虽已存储但运行时无效。
- **缓存按会话失效。** ADD / DROP 规则后会让当前会话的规则缓存失效。角色切换（`SET ROLE` 或次要角色切换）也会同步刷新权限缓存与规则缓存，确保新角色的规则立即生效。
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
2. 规则体在 `ADD RULE` 时的 `SELECT` 语法校验之外为不透明字符串——服务端不校验 `rewrite_sql` 是否真的引用目标表或产出的结果语义是否正确。建议规则尽量精简，并定期审阅 `mo_catalog.mo_role_rule`。
3. 规则从所有活跃角色解析：会话的默认角色、次要角色（当 `SET SECONDARY ROLE ALL` 生效时）以及继承角色。更改活跃角色集合（通过 `SET ROLE`、`SET SECONDARY ROLE ALL/NONE` 或重新登录）会使规则缓存失效并重新加载新角色配置下的规则。

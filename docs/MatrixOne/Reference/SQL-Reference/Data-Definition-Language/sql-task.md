---
title: "CREATE TASK（SQL 任务）"
doc_type: reference
mysql_compat: mo_only
differs_from_mysql: []
mo_only: true
since: v3.0.10
last_updated: 2026-05-08
llms_summary: "在 MatrixOne 内定义、修改、删除、手动执行并查询 SQL 任务：按 cron 调度或手动触发执行一段 SQL 体，可选 WHEN 门限、RETRY 重试次数与 TIMEOUT 超时设置。"
---

# CREATE TASK / ALTER TASK / DROP TASK / EXECUTE TASK / SHOW TASKS

> 创建、修改、删除、手动执行并查询 MatrixOne SQL 任务。SQL 任务是由数据库托管的具名作业，按 cron 调度或手动触发执行一段 SQL 体；支持可选的 WHEN 门限、RETRY 重试次数与 TIMEOUT 超时，执行历史通过 SHOW TASKS 与 SHOW TASK RUNS 暴露。

## 语法说明

SQL 任务是 MatrixOne 管理的调度作业，运行用户定义的一段 SQL 体。任务归属于创建它的 account；每个任务可选带 cron 调度、`WHEN` 门限表达式、重试次数、超时时间，以及 `BEGIN ... END` 之间的 SQL 体。

任务运行可以通过两种方式触发：

- 调度器在 cron 表达式命中时自动触发；
- 通过 `EXECUTE TASK` 手动触发。

所有运行历史都会写入 `mo_task.sql_task_run`，并可通过 `SHOW TASK RUNS` 查询。

## 语法结构

### CREATE TASK

```text
CREATE TASK [IF NOT EXISTS] <task_name>
    [SCHEDULE '<cron_expr>' [TIMEZONE '<tz_name>']]
    [WHEN ( <gate_expr> )]
    [RETRY <retry_limit>]
    [TIMEOUT '<duration>']
    AS BEGIN
        <sql_statement>;
        [<sql_statement>; ...]
    END;
```

### ALTER TASK

```text
ALTER TASK <task_name> SUSPEND
ALTER TASK <task_name> RESUME
ALTER TASK <task_name> SET SCHEDULE '<cron_expr>' [TIMEZONE '<tz_name>']
ALTER TASK <task_name> SET WHEN ( <gate_expr> )
ALTER TASK <task_name> SET RETRY <retry_limit>
ALTER TASK <task_name> SET TIMEOUT '<duration>'
```

### DROP TASK

```text
DROP TASK [IF EXISTS] <task_name>
```

### EXECUTE TASK

```text
EXECUTE TASK <task_name>
```

### SHOW TASKS / SHOW TASK RUNS

```text
SHOW TASKS
SHOW TASK RUNS [FOR <task_name>] [LIMIT <n>]
```

## 语法释义

| 参数 | 说明 |
|------|------|
| `task_name` | 任务标识符，同一 account 内唯一。 |
| `SCHEDULE 'cron_expr'` | `robfig/cron/v3` 解析的 cron 表达式（支持 6 字段含秒的形式）。省略则为仅手动触发。 |
| `TIMEZONE 'tz_name'` | 应用于 cron 调度的 IANA 时区名（如 `'UTC'`、`'Asia/Shanghai'`）。省略则使用服务器默认。 |
| `WHEN ( gate_expr )` | 可选的门限表达式，每次运行前重新求值。结果非零 / 非空才执行 SQL 体，否则运行被记为 `GATE_BLOCKED` 状态，且不消耗重试次数。 |
| `RETRY retry_limit` | 失败后最多额外重试次数，默认 `0`。每次尝试都会作为单独一行写入 `mo_task.sql_task_run`。 |
| `TIMEOUT 'duration'` | 单次运行超时，由 Go 的 `time.ParseDuration` 解析（`'500ms'`、`'30s'`、`'5m'`、`'1h'`）。值必须非负。 |
| `AS BEGIN ... END` | SQL 体。内部每条语句以 `;` 结尾，按顺序执行。 |
| `SUSPEND` / `RESUME` | 关闭或恢复调度器触发；`SUSPEND` 不影响 `EXECUTE TASK` 手动触发。 |

## 使用说明

- **名称唯一性。** `CREATE TASK` 在同名任务已存在时报错 `sql task <name> already exists`。`IF NOT EXISTS` 使重复创建变为空操作。
- **任务不存在。** `ALTER TASK` / `DROP TASK` / `EXECUTE TASK` 对不存在的任务报错 `sql task <name> not found`。`DROP TASK IF EXISTS` 使其变为空操作。
- **运行不并发。** 同一任务同时只允许一个运行实例；对正在运行的任务调用 `EXECUTE TASK` 报错 `sql task is already running`。
- **任务服务就绪。** 若当前 CN 的任务服务尚未初始化，语句报错 `task service not ready yet, please try again later.`，待服务就绪后重试即可。
- **TIMEOUT 格式。** 支持 `'1h30m'`、`'90s'`、`'500ms'`、`'0'` 等。格式错误返回 `time.ParseDuration` 原始错误；负值报错 `invalid argument timeout`。
- **WHEN 语义。** 每次运行都会重新求值 `WHEN`。被门限跳过的运行以 `GATE_BLOCKED` 状态入历史，不占用重试次数。
- **SHOW TASKS 列。** `task_name`、`schedule`、`enabled`、`gate_condition`、`retry_limit`、`timeout`、`created_at`、`last_run_status`、`last_run_time`。
- **SHOW TASK RUNS 列。** `run_id`、`task_name`、`trigger_type`、`status`、`started_at`、`finished_at`、`duration`、`attempt`、`rows_affected`、`error_message`。`trigger_type` 为 `MANUAL`（`EXECUTE TASK`）或 `SCHEDULE`（cron 触发）。`LIMIT n` 限制最近 N 条，`FOR task_name` 按任务过滤。
- **手动与调度历史共用 `mo_task.sql_task_run`**，通过 `trigger_type` 区分。

## 示例

> 任务体以 `BEGIN` / `END` 包裹并内嵌 `;` 分隔符，无法在普通 `;` 分隔的客户端中一次性提交。请将以下 SQL 块视为模板；实际使用时建议用支持分隔符切换的客户端（如 `mysql` 客户端的 `DELIMITER` 命令）提交 `CREATE TASK` 语句。

示例 1 ——带 cron 调度的任务：

<!-- validator-ignore -->
```sql
CREATE TASK IF NOT EXISTS <task_name>
    SCHEDULE '0 0 0 1 1 *'
    TIMEZONE 'UTC'
AS BEGIN
    INSERT INTO <target_table>(<marker_col>) VALUES ('cron');
END;
```

示例 2 ——仅手动触发的任务（省略 `SCHEDULE`），通过 `EXECUTE TASK` 触发：

<!-- validator-ignore -->
```sql
CREATE TASK IF NOT EXISTS <task_name>
AS BEGIN
    INSERT INTO <target_table>
    SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM <target_table> WHERE id = 1);
END;
```

示例 3 ——带 `WHEN` 门限、`RETRY` 重试和 `TIMEOUT` 超时的任务：

<!-- validator-ignore -->
```sql
CREATE TASK IF NOT EXISTS <task_name>
    WHEN (EXISTS (SELECT 1 FROM <gate_table> WHERE id = 1))
    RETRY 1
    TIMEOUT '30s'
AS BEGIN
    INSERT INTO <sink_table>
    SELECT 'gate-ok'
    WHERE NOT EXISTS (SELECT 1 FROM <sink_table> WHERE tag = 'gate-ok');
END;
```

示例 4 ——修改、挂起、恢复、执行、查询、删除：

<!-- validator-ignore -->
```sql
ALTER TASK <task_name> SET SCHEDULE '*/1 * * * * *' TIMEZONE 'UTC';
ALTER TASK <task_name> SET WHEN (EXISTS (SELECT 1 FROM <gate_table> WHERE id = 1));
ALTER TASK <task_name> SET RETRY 2;
ALTER TASK <task_name> SET TIMEOUT '1m';

ALTER TASK <task_name> SUSPEND;
ALTER TASK <task_name> RESUME;

EXECUTE TASK <task_name>;

SHOW TASKS;
SHOW TASK RUNS FOR <task_name> LIMIT 5;

DROP TASK IF EXISTS <task_name>;
```

## 注意事项

1. `SCHEDULE` 支持 `robfig/cron/v3` 的 6 字段 cron 形式（含秒）；传统 5 字段表达式可能被拒绝。可用 `TIMEZONE` 将调度锚定到指定 IANA 时区。
2. SQL 体以创建者的角色与默认库执行；不会隐式授予跨 account 访问权限。
3. 运行中触发 `TIMEOUT` 会中止当前语句，并把本次运行状态标记为超时；若配置了 `RETRY`，会再尝试最多 `retry_limit` 次。
4. `DROP TASK` 只删除任务定义，不会清理 `mo_task.sql_task_run` 已写入的历史行。

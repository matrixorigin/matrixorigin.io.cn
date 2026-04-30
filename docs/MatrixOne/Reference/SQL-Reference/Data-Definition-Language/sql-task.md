# SQL Tasks

## 语法说明

SQL task 是一个服务端的具名 SQL 作业，定义存储在 `mo_task.sql_task`。一个 task 可以通过 `EXECUTE TASK` 手动触发一次，也可以按 cron 表达式自动调度。每次运行会在 `mo_task.sql_task_run` 写入一条记录。

SQL task 由以下语句管理：

- `CREATE TASK`：定义一个 task（一次性或按计划）。
- `ALTER TASK`：suspend/resume 或修改 task 的某个子句。
- `DROP TASK`：删除 task 定义。
- `EXECUTE TASK`：立即运行一次 task。
- `SHOW TASKS`：列出当前账户下的 task。
- `SHOW TASK RUNS`：列出运行历史。

每个 task 的归属是创建者所在的账户，并记录创建它的 user 与 role；无论是计划触发还是 `EXECUTE TASK` 手动触发，task body 都会以创建者身份、使用创建时的默认数据库来执行。

## 语法结构

### CREATE TASK

```
CREATE TASK [IF NOT EXISTS] task_name
    [ SCHEDULE 'cron_expr' [ TIMEZONE 'tz_name' ] ]
    [ WHEN ( gate_expression ) ]
    [ RETRY retry_limit ]
    [ TIMEOUT 'duration' ]
    AS BEGIN
        task_body
    END
```

### ALTER TASK

```
ALTER TASK task_name SUSPEND
ALTER TASK task_name RESUME
ALTER TASK task_name SET SCHEDULE 'cron_expr' [ TIMEZONE 'tz_name' ]
ALTER TASK task_name SET WHEN ( gate_expression )
ALTER TASK task_name SET RETRY retry_limit
ALTER TASK task_name SET TIMEOUT 'duration'
```

### DROP TASK

```
DROP TASK [IF EXISTS] task_name
```

### EXECUTE TASK

```
EXECUTE TASK task_name
```

### SHOW TASKS / SHOW TASK RUNS

```
SHOW TASKS
SHOW TASK RUNS [ FOR task_name ] [ LIMIT n ]
```

## 语法释义

| 子句 | 说明 |
|------|------|
| `SCHEDULE 'cron_expr'` | 六字段 cron 表达式（秒、分、时、日、月、星期）。未指定时，task 只能通过 `EXECUTE TASK` 手动触发。 |
| `TIMEZONE 'tz_name'` | cron 计算时使用的 IANA 时区名，未指定时使用 `UTC`。 |
| `WHEN ( gate_expression )` | 每次运行前先求值的布尔表达式；结果为 false 时跳过本次运行（在 `mo_task.sql_task_run` 中记为 `SKIPPED`）。可以是布尔表达式，也可以是返回单值的标量子查询。 |
| `RETRY retry_limit` | 同一次触发失败后额外重试的最大次数，默认 `0`（不重试）。 |
| `TIMEOUT 'duration'` | 单次运行的墙钟超时，使用 Go `time.ParseDuration` 语法（例如 `'30s'`、`'5m'`、`'1h'`）。超时的运行在 `mo_task.sql_task_run` 中记为 `TIMEOUT`。 |
| `task_body` | 位于 `AS BEGIN` 与 `END` 之间的一条或多条 SQL 语句。整体作为一次运行执行，首条失败语句会终止本次运行。 |
| `task_name` | 账户内唯一的标识符。 |
| `retry_limit` | 非负整数。 |
| `SUSPEND` / `RESUME` | 暂停/恢复自动调度。被 `SUSPEND` 的 task 仍可用 `EXECUTE TASK` 手动触发。 |
| `FOR task_name` | 仅返回指定 task 的 `SHOW TASK RUNS` 结果。 |
| `LIMIT n` | 限制 `SHOW TASK RUNS` 返回的行数。 |

### 输出列说明

`SHOW TASKS` 每个 task 返回一行，列为：

`task_name`、`schedule`、`enabled`、`gate_condition`、`retry_limit`、`timeout`、`created_at`、`last_run_status`、`last_run_time`。

`SHOW TASK RUNS` 每次运行返回一行，列为：

`run_id`、`task_name`、`trigger_type`、`status`、`started_at`、`finished_at`、`duration`、`attempt`、`rows_affected`、`error_message`。

`trigger_type` 在 cron 触发时为 `SCHEDULED`，在 `EXECUTE TASK` 触发时为 `MANUAL`；`status` 取值为 `RUNNING` / `SUCCESS` / `FAILED` / `SKIPPED` / `TIMEOUT` 之一。

## 使用说明

- SQL task 依赖后端 task service；若 task service 尚未启动，语句会返回 `task service not ready yet, please try again later.`。
- 同名 task 已存在时，`CREATE TASK` 返回 `sql task <name> already exists`，除非使用 `IF NOT EXISTS`。
- 目标 task 不存在时，`ALTER TASK`、`DROP TASK`、`EXECUTE TASK` 返回 `sql task <name> not found`。`DROP TASK IF EXISTS` 抑制该错误。
- `SCHEDULE` 缺省时该 task 没有 cron，只能通过 `EXECUTE TASK` 运行。
- `ALTER TASK ... SUSPEND` 只停止自动调度，定义本身保留；`RESUME` 会基于当前时间重新计算下一次 fire 时间，因此长时间 suspend 不会触发追赶执行。
- `TIMEOUT` 接受任何 `time.ParseDuration` 支持的字符串（例如 `"90s"`、`"2m"`），空字符串表示不限时；负值会被拒绝。
- 同一账户内，一个 task 同一时刻最多只能有一个正在运行的 run。在前一次 run 尚未结束时再次 `EXECUTE TASK`，会返回 `sql task is already running`。
- Task body 以 definer 的 account / user / 默认 role 运行，不会继承调用者 session 中的当前数据库。请在 body 内使用完全限定的表名 `db.table`，或在创建 task 时确保有默认数据库。
- 每次运行的记录写入 `mo_task.sql_task_run`，`mo_task.sql_task` 保存最新的 task 定义。

## 示例

下面的示例运行在同一个数据库 `sql_task_demo_db` 中。为了避免 `BEGIN ... END` 内部的 `;`，示例中每个 task body 只写一条语句；实际部署时 task body 可以包含以 `;` 分隔的多条语句。

### 示例 1：用 `EXECUTE TASK` 手动触发

```sql
DROP DATABASE IF EXISTS sql_task_demo_db;
CREATE DATABASE sql_task_demo_db;
USE sql_task_demo_db;

CREATE TABLE manual_events (id INT PRIMARY KEY);

DROP TASK IF EXISTS sql_task_manual;

CREATE TASK sql_task_manual
AS BEGIN
    INSERT INTO manual_events SELECT 1 WHERE NOT EXISTS (SELECT 1 FROM manual_events WHERE id = 1)
END;

EXECUTE TASK sql_task_manual;
SELECT COUNT(*) FROM manual_events;

DROP TASK IF EXISTS sql_task_manual;
DROP TABLE manual_events;
```

### 示例 2：带 `TIMEZONE` 的定时任务

```sql
USE sql_task_demo_db;

CREATE TABLE scheduled_events (
    marker VARCHAR(32) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TASK IF EXISTS sql_task_cron;

CREATE TASK sql_task_cron
    SCHEDULE '0 0 0 1 1 *'
    TIMEZONE 'UTC'
AS BEGIN
    INSERT INTO scheduled_events(marker) VALUES ('cron')
END;

ALTER TASK sql_task_cron SET SCHEDULE '*/1 * * * * *' TIMEZONE 'UTC';
ALTER TASK sql_task_cron SUSPEND;
ALTER TASK sql_task_cron RESUME;

EXECUTE TASK sql_task_cron;
SELECT COUNT(*) FROM scheduled_events;

DROP TASK IF EXISTS sql_task_cron;
DROP TABLE scheduled_events;
```

### 示例 3：通过 `WHEN (...)` 设置 gate 条件

```sql
USE sql_task_demo_db;

CREATE TABLE gate_source (id INT PRIMARY KEY);
CREATE TABLE gate_sink (tag VARCHAR(32) PRIMARY KEY);

DROP TASK IF EXISTS sql_task_gate;

CREATE TASK sql_task_gate
    WHEN (EXISTS (SELECT 1 FROM gate_source WHERE id = 1))
AS BEGIN
    INSERT INTO gate_sink SELECT 'gate-ok' WHERE NOT EXISTS (SELECT 1 FROM gate_sink WHERE tag = 'gate-ok')
END;

EXECUTE TASK sql_task_gate;
SELECT COUNT(*) FROM gate_sink;

INSERT INTO gate_source VALUES (1);
EXECUTE TASK sql_task_gate;
SELECT COUNT(*) FROM gate_sink;

DROP TASK IF EXISTS sql_task_gate;
DROP TABLE gate_sink;
DROP TABLE gate_source;
```

### 示例 4：`TIMEOUT` 与 `RETRY`

```sql
USE sql_task_demo_db;

CREATE TABLE timeout_sink (v INT);
CREATE TABLE retry_target (v INT);

DROP TASK IF EXISTS sql_task_timeout;
DROP TASK IF EXISTS sql_task_retry;

CREATE TASK sql_task_timeout
    TIMEOUT '1s'
AS BEGIN
    INSERT INTO timeout_sink SELECT sleep(2)
END;

EXECUTE TASK sql_task_timeout;
SELECT COUNT(*) FROM timeout_sink;

CREATE TASK sql_task_retry
    RETRY 1
AS BEGIN
    INSERT INTO retry_target VALUES (1)
END;

EXECUTE TASK sql_task_retry;
SELECT COUNT(*) FROM retry_target;

DROP TASK IF EXISTS sql_task_timeout;
DROP TASK IF EXISTS sql_task_retry;
DROP TABLE timeout_sink;
DROP TABLE retry_target;
```

### 示例 5：查看 task 与运行历史

```sql
USE sql_task_demo_db;

CREATE TABLE run_target (v INT);

DROP TASK IF EXISTS sql_task_show;

CREATE TASK sql_task_show
AS BEGIN
    INSERT INTO run_target VALUES (1)
END;

EXECUTE TASK sql_task_show;

SHOW TASKS;
SHOW TASK RUNS FOR sql_task_show LIMIT 5;

DROP TASK IF EXISTS sql_task_show;
DROP TABLE run_target;
```

### 示例 6：同一 task 的并发保护

```sql
USE sql_task_demo_db;

CREATE TABLE overlap_sink (v INT);

DROP TASK IF EXISTS sql_task_overlap;

CREATE TASK sql_task_overlap
AS BEGIN
    INSERT INTO overlap_sink SELECT sleep(1)
END;

EXECUTE TASK sql_task_overlap;

-- Expected-Success: false
EXECUTE TASK sql_task_overlap;

DROP TASK IF EXISTS sql_task_overlap;
DROP TABLE overlap_sink;

DROP DATABASE sql_task_demo_db;
```

## 注意事项

- cron 解析器接受六字段表达式：`秒 分 时 日 月 星期`，也支持 `@hourly` 这类 descriptor。
- `WHEN (...)` 支持布尔表达式，也支持可以转换为布尔的标量子查询。
- SQL task 状态会在集群重启后保留；定时任务按下一次 fire 时间恢复。
- `mo_task.sql_task` 与 `mo_task.sql_task_run` 都是普通表，拥有相应权限的用户可以直接 SELECT 它们做自定义监控。

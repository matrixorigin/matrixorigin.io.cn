# 服务器系统变量

MatrixOne 服务器系统变量（System Variable）是指在 MatrixOne Server 中，用于控制或配置数据库引擎或其他组件行为的一组变量。这些变量的值可以通过 `SET` 语句进行设置和更改。

系统变量可分为两类：**全局变量**和**会话变量**。

- **全局变量**：是指对所有连接的 MatrixOne 会话都适用的变量。它们的值在 MatrixOne Server 启动时设置，并在 MatrixOne Server 关闭之前保持不变。全局变量通常用于控制 MatrixOne Server 的行为，例如指定默认备份和恢复位置，指定默认语言环境等。

- **会话变量**：是指只对当前用户连接的 MatrixOne 会话适用的变量。它们的值可以在用户连接的任何时间更改，并在用户断开连接时自动清除。会话变量通常用于控制会话的行为，例如控制打印信息的方式，指定事务隔离级别等。

## 如何查询系统变量？

你可以使用以下 SQL 查询：

```sql
SHOW VARIABLES;
```

这会列出所有系统变量及其当前值。如果你只想查看与特定主题相关的系统变量，可以使用以下语法：

```sql
SHOW VARIABLES LIKE '%theme%';
```

这将列出所有名称中包含 `theme` 的系统变量及其当前值。

__Note:__ `LIKE` 运算符是用来模糊匹配查询字符串的，% 表示零个或多个任意字符。所以，上述命令将匹配名称中包含 `theme` 的任何系统变量。

### 如何查询全局变量？

你可以使用以下 SQL 查询：

```sql
SHOW GLOBAL VARIABLES;
```

这将列出所有全局系统变量及其当前值。如果你只想查看与特定主题相关的全局变量，可以使用以下语法：

```sql
SHOW GLOBAL VARIABLES LIKE '%theme%';
```

这将列出所有名称中包含 `theme` 的全局系统变量及其当前值。

__Note:__ `LIKE` 运算符是用来模糊匹配查询字符串的，% 表示零个或多个任意字符。所以，上述命令将匹配名称中包含 `theme` 的任何全局系统变量。

### 如何查询会话变量？

你可以使用以下 SQL 查询：

```sql
SHOW SESSION VARIABLES;
```

这将列出当前会话中所有的系统变量及其当前值。如果你只想查看与特定主题相关的会话变量，可以使用以下语法：

```sql
SHOW SESSION VARIABLES LIKE '%theme%';
```

这将列出所有名称中包含 `theme` 的会话变量及其当前值。

__Note:__ `LIKE` 运算符是用来模糊匹配查询字符串的，% 表示零个或多个任意字符。所以，上述命令将匹配名称中包含 `theme` 的任何会话系统变量。

## 变量参照表

| Variable_name | Cmd-Line(Y/N) | Option File(Y/N) | Variable Type | System Var(Y/N) | Var Scope(Global、Both/ Session) | Dynamic(Y/N) | Default Value | Optional value |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| auto_increment_increment | Y | N | int | Y | Both | Y | 1 | 1-65535 |
| auto_increment_offset | Y | N | int | Y | Both | Y | 1 | 1-65535 |
| autocommit | Y | N | bool | Y | Both | Y | TRUE | FALSE |
| character_set_client | Y | N | string | Y | Both | Y | "utf8mb4" |  |
| character_set_connection | Y | N | string | Y | Both | Y | "utf8mb4" |  |
| character_set_database | Y | N | string | Y | Both | Y | "utf8mb4" |  |
| character_set_results | Y | N | string | Y | Both | Y | "utf8mb4" |  |
| character_set_server | Y | N | string | Y | Both | Y | "utf8mb4" |  |
| collation_connection | Y | N | string | Y | Both | Y | "default" |  |
| collation_server | Y | N | string | Y | Both | Y | "utf8mb4_bin" |  |
| completion_type | Y | N | enum | Y | Both | Y | "NO_CHAIN" | "NO_CHAIN","CHAIN", "RELEASE" |
| host | Y | N | string | Y | Both | N | "0.0.0.0" |  |
| init_connect | Y | N | string | Y | Both | Y | "" |  |
| interactive_timeout | Y | N | int | Y | Both | Y | 28800 | 1-31536000 |
| license | Y | N | string | Y | Both | N | "APACHE" |  |
| lower_case_table_names | Y | N | int | Y | Both | N | 1 | 0-2 |
| max_allowed_packet | Y | N | int | Y | Both | Y | 16777216 | 1024-1073741824 |
| net_write_timeout | Y | N | int | Y | Both | Y | 60 | 1-31536000 |
| performance_schema | Y | N | int | Y | Both | Y | 0 | 0-1 |
| port | Y | N | int | Y | Both | N | 6001 | 0-65535 |
| profiling | Y | N | int | Y | Both | Y | 0 | 0-1 |
| query_result_maxsize | Y | N | uint | Y | Both | Y | 100 | 0-18446744073709551615 |
| query_result_timeout | Y | N | uint | Y | Both | Y | 24 | 0-18446744073709551615 |
| [save_query_result](save_query_result.md) | Y | N | bool | Y | Both | Y | FALSE | TRUE |
| [sql_mode](sql-mode.md) | Y | N | set | Y | Both | Y | "ONLY_FULL_GROUP_BY,<br>STRICT_TRANS_TABLES,<br>NO_ZERO_IN_DATE,<br>NO_ZERO_DATE,<br>ERROR_FOR_DIVISION_BY_ZERO,<br>NO_ENGINE_SUBSTITUTION" | "ANSI", "TRADITIONAL", "ALLOW_INVALID_DATES", "ANSI_QUOTES", "ERROR_FOR_DIVISION_BY_ZERO", "HIGH_NOT_PRECEDENCE", "IGNORE_SPACE", "NO_AUTO_VALUE_ON_ZERO", "NO_BACKSLASH_ESCAPES", "NO_DIR_IN_CREATE", "NO_ENGINE_SUBSTITUTION", "NO_UNSIGNED_SUBTRACTION", "NO_ZERO_DATE", "NO_ZERO_IN_DATE", "ONLY_FULL_GROUP_BY", "PAD_CHAR_TO_FULL_LENGTH", "PIPES_AS_CONCAT", "REAL_AS_FLOAT", "STRICT_ALL_TABLES", "STRICT_TRANS_TABLES", "TIME_TRUNCATE_FRACTIONAL" |
| sql_safe_updates | Y | N | int | Y | Both | Y | 0 | 0-1 |
| sql_select_limit | Y | N | uint | Y | Both | Y | 18446744073709551615 |  0-18446744073709551615 |
| system_time_zone | Y | N | string | Y | Both | N | "" |  |
| [time_zone](timezone.md) | Y | N | string | Y | Both | N | "SYSTEM" |  |
| transaction_isolation | Y | N | enum | Y | Both | Y | "REPEATABLE-READ" | "READ-UNCOMMITTED", "READ-COMMITTED", "REPEATABLE-READ","REPEATABLE-READ", "SERIALIZABLE" |
| transaction_read_only | Y | N | int | Y | Both | Y | 0 | 0-1 |
| version_comment | Y | N | string | Y | Both | N | "MatrixOne" |  |
| wait_timeout | Y | N | int | Y | Both | Y | 28800 |  1-2147483 |

## 限制

1. MatrixOne 为兼容 MySQL，当前对于本章节所介绍的系统变量仅实现语法支持。
2. MatrixOne 为兼容 MySQL，除支持 `ONLY_FULL_GROUP_BY` 模式以外，sql_mode 其他模式仅实现语法支持。

# MatrixOne 系统数据库和表

MatrixOne 系统数据库和表是 MatrixOne 存储系统信息的地方。你可以通过它们访问系统信息。MatrixOne 在初始化时创建了 6 个系统数据库：`mo_catalog`、`information_schema`、`system_metrcis`、`system`、`mysql` 和 `mo_task`。`mo_task` 当前正在开发中，暂时对你所进行的操作不会产生直接影响。本文档中描述了其他系统数据库和表函数。

系统只能修改系统数据库和表，你仅能从中进行读取操作。

## `mo_catalog` 数据库

`mo_catalog` 用于存储 MatrixOne 对象的元数据，如：数据库、表、列、系统变量、租户、用户和角色。

从 MatrixOne 0.6 版本即引入了多租户的概念，默认的 `sys` 租户和其他租户的行为略有不同。服务于多租户管理的系统表 `mo_account` 仅对 `sys` 租户可见；其他租户看不到此表。

### mo_database table

| 列属性          | 类型           | 描述                                |
| ---------------- | --------------- | --------------------------------------- |
| dat_id           | bigint unsigned | 主键                             |
| datname          | varchar(100)    | 数据库名称                           |
| dat_catalog_name | varchar(100)    | 数据库 catalog 名称，默认`def` |
| dat_createsql    | varchar(100)    | 创建数据库 SQL 语句         |
| owner            | int unsigned    | 角色 ID ID                                 |
| creator          | int unsigned    | 用户 ID ID                                 |
| created_time     | timestamp       | 创建时间                             |
| account_id       | int unsigned    | 租户 ID ID                               |

### mo_tables table

| 列属性        | 类型           | 描述                                                     |
| -------------- | --------------- | ------------------------------------------------------------ |
| rel_id         | bigint unsigned | 主键                                                  |
| relname        | varchar(100)    | 表、索引、视图等的名称                         |
| reldatabase    | varchar(100)    | 包含此关系的数据库，参考 mo_database.datname |
| reldatabase_id | bigint unsigned | 包含此关系的数据库 ID，参考 mo_database.datid |
| relpersistence | varchar(100)    | p = 永久表<br> t = 临时表                     |
| relkind        | varchar(100)    | r = 普通表<br> e = 外部表<br> i = 索引<br> S = 序列<br> v = 视图<br> m = 物化视图 |
| rel_comment    | varchar(100)    |                                                              |
| rel_createsql  | varchar(100)    | 创建表 SQL 语句                                 |
| created_time   | timestamp       | 创建时间                                                |
| creator        | int unsigned    | 创建者 ID                                                   |
| owner          | int unsigned    | 创建者的默认角色 ID                                 |
| account_id     | int unsigned    | 租户 id                                                    |
| partitioned    | blob            | 按语句分区                                       |
| viewdef        | blob            | 视图定义语句                                   |

### mo_columns table

| 列属性           | 类型        | 描述                                               |
| --------------------- | --------------- | ------------------------------------------------------------ |
| att_uniq_name         | varchar(256)    | 主键。隐藏的复合主键，格式类似于 "${att_relname_id}-${attname}" |
| account_id            | int unsigned    | 租户 ID                                                     |
| att_database_id       | bigint unsigned | 数据库 ID                                                   |
| att_database          | varchar(256)    | 数据 Name                                                |
| att_relname_id        | bigint unsigned | 表 ID                                                     |
| att_relname           | varchar(256)    | 此列所属的表。（参考 mo_tables.relname）|
| attname               | varchar(256)    | 列名                                              |
| atttyp                | varchar(256)    | 此列的数据类型 (删除的列为 0 )。   |
| attnum                | int             | 列数。普通列从 1 开始编号。 |
| att_length            | int             | 类型的字节数                                    |
| attnotnull            | tinyint(1)      | 表示一个非空约束。                       |
| atthasdef             | tinyint(1)      | 此列有默认表达式或生成表达式。 |
| att_default           | varchar(1024)   | 默认表达式                                          |
| attisdropped          | tinyint(1)      | 此列已删除，不再有效。删除的列仍然物理上存在于表中，但解析器会忽略它，因此不能通过 SQL 访问它。 |
| att_constraint_type   | char(1)         | p = 主键约束<br>n=无约束                  |
| att_is_unsigned       | tinyint(1)      | 是否未署名                                              |
| att_is_auto_increment | tinyint(1)      | 是否自增                                        |
| att_comment           | varchar(1024)   | 注释                                                      |
| att_is_hidden         | tinyint(1)      | 是否隐藏                                                |
| attr_has_update       | tinyint(1)      | 此列含有更新表达式                           |
| attr_update           | varchar(1024)   | 更新表达式                                            |

### mo_account table (仅 `sys` 租户可见)

| 列属性      | 类型        | 描述     |
| ------------ | ------------ | ------------ |
| account_id   | int unsigned | 租户 ID  |
| account_name | varchar(100) | 租户名  |
| status       | varchar(100) | 开启/暂停 |
| created_time | timestamp    | 创建时间  |
| comment     | varchar(256)  | 注释      |
| suspended_time | TIMESTAMP    | 修改租户状态的时间|

### mo_role table

| 列属性      | 类型        | 描述                      |
| ------------ | ------------ | ----------------------------- |
| role_id      | int unsigned | 角色 ID                  |
| role_name    | varchar(100) | 角色名称                     |
| creator      | int unsigned | 用户 ID                     |
| owner        | int unsigned | MatrixOne 管理员/租户管理员拥有者 ID |
| created_time | timestamp    | 创建时间                   |
| comment     | text         | 注释                      |

### mo_user table

| 列属性               | 类型        | 描述            |
| --------------------- | ------------ | ------------------- |
| user_id               | int          | 用户 ID                |
| user_host             | varchar(100) |   用户主机地址                  |
| user_name             | varchar(100) |    用户名                 |
| authentication_string | varchar(100) |  密码加密的认证字符串     |
| status                | varchar(8)   | 开启、锁定、失效 |
| created_time          | timestamp    |    用户创建时间                 |
| expired_time          | timestamp    |      用户过期时间               |
| login_type            | varchar(16)  | ssl/密码/其他 |
| creator               | int | 创建此用户的创建者 ID              |
| owner                 | int | 此用户的管理员 ID      |
| default_role          | int | 此用户的默认角色 ID          |

### mo_user_grant table

| 列属性           | 类型        | 描述                            |
| ----------------- | ------------ | ----------------------------------- |
| role_id           | int unsigned | 角色 ID                         |
| user_id           | int unsigned | 用户 ID               |
| granted_time      | timestamp    | 授权时间                       |
| with_grant_option | bool         | 是否允许授权 |

### mo_role_grant table

| 列属性           | 类型        | 描述                            |
| ----------------- | ------------ | ----------------------------------- |
| granted_id        | int        | 被授予的角色 ID            |
| grantee_id        | int        | 要授予其他角色的角色 ID           |
| operation_role_id | int        | 操作角色 ID                   |
| operation_user_id | int        | 操作用户 ID                  |
| granted_time      | timestamp    | 授权时间                      |
| with_grant_option | bool         | 是否允许授权 |

### mo_role_privs table

| 列属性           | 类型           | 描述                            |
| ----------------- | --------------- | ----------------------------------- |
| role_id           | int unsigned    | 角色 ID                         |
| role_name         | varchar(100)    | 角色名：accountadmin/public                           |
| obj_type          | varchar(16)     | 对象类型：account/database/table                         |
| obj_id            | bigint unsigned | 对象 ID                        |
| privilege_id      | int             | 权限 ID                      |
| privilege_name    | varchar(100)    | 权限名：权限列表                                   |
| privilege_level   | varchar(100)    | 权限级别                                    |
| operation_user_id | int unsigned    | 操作用户 ID                             |
| granted_time      | timestamp       | 授权时间                                 |
| with_grant_option | bool            | 是否允许授权|

### mo_user_defined_function table

| 列属性            | 类型             | 描述               |
| -----------------| --------------- | ----------------- |
| function_id          | INT(32)       | 函数的 ID，主键    |
| name                 | VARCHAR(100)  |  函数的名称        |
| creator              | INT UNSIGNED(32) | 函数的创建用户 ID  |
| args                 | TEXT(0)       |函数的参数列表       |
| rettype              | VARCHAR(20)   | 函数的返回类型 |
| body                 | TEXT(0)       |函数的函数体     |
| language             | VARCHAR(20)   |  函数所使用的语言      |
| db                   | VARCHAR(100)  | 函数所在的数据库    |
| definer              | VARCHAR(50)   | 定义函数的用户名称     |
| modified_time        | TIMESTAMP(0)  | 函数最后一次修改的时间  |
| created_time         | TIMESTAMP(0)  | 函数的创建时间    |
| type                 | VARCHAR(10)   |函数的类型，默认 FUNCTION   |
| security_type        | VARCHAR(10)   | 安全处理方式，统一值 DEFINER  |
| comment              | VARCHAR(5000) | 创建函数的注释 |
| character_set_client | VARCHAR(64)   | 客户端字符集：utf8mb4  |
| collation_connection | VARCHAR(64)   | 连接排序：utf8mb4_0900_ai_ci   |
| database_collation   | VARCHAR(64)   | 数据库连接排序：utf8mb4_0900_ai_ci  |

### mo_mysql_compatbility_mode table

| 列属性            | 类型             | 描述               |
| -----------------| --------------- | ----------------- |
| configuration_id | INT(32)       | 配置项 id，自增列，作为主键区分不同的配置 |
| account_name     | VARCHAR(300)  | 配置所在的租户名称  |
| dat_name         | VARCHAR(5000) | 配置所在的数据库名称  |
| configuration    | JSON(0)       | 配置内容，以 JSON 形式保存   |

### mo_pubs table

| 列属性            | 类型             | 描述               |
| -----------------| --------------- | ----------------- |
| pub_name      | VARCHAR(64)         | 发布名称|
| database_name | VARCHAR(5000)       |  发布数据的名称 |
| database_id   | BIGINT UNSIGNED(64) | 发布数据库的 ID，与 mo_database 表中的 dat_id 对应  |
| all_table     | BOOL(0)             | 发布库是否包含 database_id 对应数据库内的所有表 |
| all_account   | BOOL(0)             | 是否所有 account 都可以订阅该发布库 |
| table_list    | TEXT(0)             | 在非 all table 时，发布库内包含的表清单，表名与database_id对应数据库下的表一一对应|
| account_list  | TEXT(0)             |在非 all account 时，允许订阅该发布库的 account 清单|
| created_time  | TIMESTAMP(0)        |创建发布库的时间   |
| owner         | INT UNSIGNED(32)    | 创建发布库对应的角色 ID |
| creator       | INT UNSIGNED(32)    |  创建发布库对应的用户 ID  |
| comment       | TEXT(0)             | 创建发布库的备注信息  |

### mo_indexes table

| 列属性            | 类型             | 描述               |
| -----------------| --------------- | ----------------- |
| id               | BIGINT UNSIGNED(64) |    索引 ID            |
| table_id         | BIGINT UNSIGNED(64) |    索引所在表的 ID            |
| database_id      | BIGINT UNSIGNED(64) |    索引所在数据库的 ID            |
| name             | VARCHAR(64)         |  索引的名字              |
| type             | VARCHAR(11)         |  索引的类型，包括主键索引（PRIMARY），唯一索引（UNIQUE），次级索引（MULTIPLE）     |
| is_visible       | TINYINT(8)          | 索引是否可见 ， 1 为可见， 0 不可见 （目前 MatrixOne 的索引全部为可见索引）  |
| hidden           | TINYINT(8)          | 索引是否为隐藏索引， 1 为隐藏索引，0 为非隐藏索引|
| comment          | VARCHAR(2048)       |  索引的注释信息     |
| column_name      | VARCHAR(256)        | 索引的组成列的列名  |
| ordinal_position | INT UNSIGNED(32)    | 索引中的列序号，从 1 开始    |
| options          | TEXT(0)             | 索引的 options 选项信息   |
| index_table_name | VARCHAR(5000)       |  该索引对应的索引表的表名，目前只有唯一索引含有索引表    |

## `system_metrics` 数据库

`system_metrics` 收集 SQL 语句、CPU 和内存资源使用的状态和统计信息。

`system_metrics` 表一些相同的列类型，这些表中的字段描述如下：

- collecttime：收集时间。

- value：采集 `metrics` 的值。

- node：表示 MatrixOne 节点的 uuid。

- role：MatrixOne 节点角色，包括 CN、DN 和 Log。

- account：默认为 “sys” 租户，即触发 SQL 请求的账户。

- type：SQL 类型，可以是 `select`，`insert`，`update`，`delete`，`other` 类型。

### `metric` 表

| 列属性     | 类型        | 描述                                                     |
| ----------- | ------------ | ------------------------------------------------------------ |
| metric_name | VARCHAR(128) | 指标名称，例如：sql_statement_total，server_connections，process_cpu_percent，sys_memory_used 等 |
| collecttime | DATETIME     | 指标数据收集时间                                     |
| value       | DOUBLE       | 指标值                                                 |
| node        | VARCHAR(36)  | MatrixOne 节点 uuid                                                    |
| role        | VARCHAR(32)  | MatrixOne 节点角色                                                   |
| account     | VARCHAR(128) | 租户名称，默认 `sys`                             |
| type       | VARCHAR(32)  | SQL 类型，例如：INSERT，SELECT，UPDATE     |

以下表为 `metric` 表的视图：

* `sql_statement_total` 表：执行 SQL 语句的计数器。
* `sql_statement_errors` 表：执行错误的 SQL 语句的计数器。
* `sql_transaction_total` 表：事务性 SQL 语句的计数器。
* `sql_transaction_errors` 表：错误执行的事务性语句的计数器。
* `server_connection` 表：服务器连接数。
* `server_storage_usage`：服务器存储使用情况。
* `process_cpu_percent` 表：CPU 进程繁忙百分比。
* `process_resident_memory_bytes` 表：驻留内存量，单位为字节。
* `process_open_fds` 表：打开的文件描述符的数量。
* `sys_cpu_seconds_total` 表：系统 CPU 时间，以秒为单位，由核数标准化
* `sys_cpu_combined_percent` 表：系统 CPU 繁忙百分比，所有逻辑核的平均值。
* `sys_memory_used` 表：以字节为单位已使用的系统内存。
* `sys_memory_available` 表：以字节为单位的可用系统内存。
* `sys_disk_read_bytes` 表：以字节为单位读取系统盘。
* `sys_disk_write_bytes` 表：以字节为单位写入系统盘。
* `sys_net_recv_bytes` 表：以字节为单位接收的系统网络。
* `sys_net_sent_bytes` 表：以字节为单位发送的系统网络。

## `system` 数据库

`System` 数据库存储 MatrixOne 历史 SQL 语句、系统日志、错误信息。

### `statement_info` 表

`statement_info` 表记录用户和系统的 SQL 语句和详细信息。

| 列属性               | 类型         | 描述                                                     |
| --------------------- | ------------- | ------------------------------------------------------------ |
| statement_id          | VARCHAR(36)   | 声明语句唯一 ID                                          |
| transaction_id        | VARCHAR(36)   | 事务唯一 ID                                        |
| session_id            | VARCHAR(36)   | 账户唯一 ID                                           |
| account               | VARCHAR(1024) | 租户名称                                               |
| user                  | VARCHAR(1024) | 用户名称                                                    |
| host                  | VARCHAR(1024) | 用户客户端 IP                                               |
| database              | VARCHAR(1024) | 数据库当前会话停留处                        |
| statement             | TEXT          | SQL 语句                                          |
| statement_tag         | TEXT          | 语句中的注释标签 (保留)                              |
| statement_fingerprint | TEXT          | 语句中的注释标签 (保留)                               |
| node_uuid             | VARCHAR(36)   | 节点 uuid，即生成数据的某个节点                          |
| node_type             | VARCHAR(64)   | 在 MatrixOne 内，var 所属的 DN/CN/Log 的节点类型                 |
| request_at            | DATETIME      | 请求接受的 datetime                                      |
| response_at           | DATETIME      | 响应发送的 datetime                                       |
| duration              | BIGINT        | 执行时间，单位：ns                                          |
| status                | VARCHAR(32)   | SQL 语句执行状态：Running, Success, Failed |
| err_code              | VARCHAR(1024) | 错误码                                                 |
| error                 | TEXT          | 错误信息                                                |
| exec_plan             | JSON          | 语句执行计划                            |
| rows_read             | BIGINT        | 读取总行数                                              |
| bytes_scan            | BIGINT        | 扫描总字节数                                           |
| stats                 | JSON          | exec_plan 中的全局统计信息                                              |
| statement_type        | VARCHAR(1024) | 语句类型，[Insert, Delete, Update, Drop Table, Drop User, ...] |
| query_type            | VARCHAR(1024) | 查询类型，[DQL, DDL, DML, DCL, TCL]                                |
| role_id               | BIGINT        | 角色 ID                                                                     |
| sql_source_type       | TEXT          | SQL语句源类型                                                   |
| result_count          | BIGINT(64)    | 统计sql执行结果的行数    |  

### `rawlog` 表

`rawlog` 表记录了非常详细的系统日志。

| 列属性        | 类型         | 描述                                                     |
| -------------- | ------------- | ------------------------------------------------------------ |
| raw_item       | VARCHAR(1024) | 原日志项                                                 |
| node_uuid      | VARCHAR(36)   | 节点 uuid，即生成数据的某个节点                         |
| node_type      | VARCHAR(64)   | 在 MatrixOne 内，var 所属的 DN/CN/Log 的节点类型                         |
| span_id        | VARCHAR(16)   | span 的唯一 ID                                             |
| statement_id   | VARCHAR(36)   | 声明语句唯一 ID                                         |
| logger_name    | VARCHAR(1024) | 日志记录器的名称                                                  |
| timestamp      | DATETIME      | 时间戳的动作                                      |
| level          | VARCHAR(1024) | 日志级别，例如：debug, info, warn, error, panic, fatal      |
| caller         | VARCHAR(1024) | 产生 Log 的地方：package/file.go:123                      |
| message        | TEXT          | 日志消息                                                 |
| extra          | JSON          | 日志动态字段                                          |
| err_code       | VARCHAR(1024) | 错误日志                                                   |
| error          | TEXT          | 错误信息                                                |
| stack          | VARCHAR(4096) |                                                              |
| span_name      | VARCHAR(1024) | span 名称，例如：step name of execution plan, function name in code, ... |
| parent_span_id | VARCHAR(16)   | 父级 span 唯一的 ID                                        |
| start_time     | DATETIME      |                                                              |
| end_time       | DATETIME      |                                                              |
| duration       | BIGINT        | 执行时间，单位：ns                                          |
| resource       | JSON          | 静态资源信息                                  |

其他 3 个表（`log_info`、`span_info` 和 `error_info`）是 `statement_info` 和 `rawlog` 表的视图。

## `information_schema` 数据库

**Information Schema** 提供了一种 ANSI 标准方式，用于查看系统的元数据。MatrixOne 除了为 MySQL 兼容性而包含的表之外，还提供了许多自定义的 `information_schema` 表。

许多 `INFORMATION_SCHEMA` 表都有相应的 `SHOW` 命令。查询 `INFORMATION_SCHEMA` 可以在表之间进行连接。

### MySQL 兼容性表

| 表名称       | 描述                                                  |
| :--------------- | :----------------------------------------------------------- |
| CHARACTER_SETS   | 提供了服务器支持的字符集列表。       |
| COLUMNS          | 提供了所有表的列列表。                  |
| ENGINES          | 提供了支持的存储引擎列表。                |
| KEY_COLUMN_USAGE | 描述了列的键约束，例如主键约束。 |
| PROCESSLIST      | 提供了与执行命令 `SHOW PROCESSLIST` 类似的信息。 |
| SCHEMATA         | 提供了与执行 `SHOW DATABASES` 类似的信息。      |
| TABLES           | 提供了当前用户可以查看的表列表。类似于执行`SHOW TABLES`。 |
| TRIGGERS         | 提供了与执行 `SHOW TRIGGERS` 类似的信息。   |
| USER_PRIVILEGES  | 列举了与当前用户关联的权限。  |
| PROFILING | 提供 SQL 语句执行时一些分析信息。|
| ROUTINES  |提供有关存储存储过程的一些信息。|
| PARAMETERS| 表提供了存储过程的参数和返回值的信息。|
| VIEWS   |提供有关数据库中视图的信息。|
| KEYWORDS | 提供有关数据库中关键字信息，详情参见[关键字](Language-Structure/keywords.md)。|

### `CHARACTER_SETS` 表

`CHARACTER_SETS` 表中的列描述如下：

- `CHARACTER_SET_NAME`：字符集的名称。
- `DEFAULT_COLLATE_NAME`：字符集的默认排序规则名称。
- `DESCRIPTION`：字符集的描述。
- `MAXLEN`：在此字符集中存储字符所需的最大长度。

### `COLUMNS` 表

`COLUMNS` 表中的列描述如下：

- `TABLE_CATALOG`：含有该列的表所属的目录的名称。该值始终为 `def`。
- `TABLE_SCHEMA`：含有列的表所在的模式的名称。
- `TABLE_NAME`：包含列的表的名称。
- `COLUMN_NAME`：列的名称。
- `ORDINAL_POSITION`：表中列的位置。
- `COLUMN_DEFAULT`：列的默认值。如果显式默认值为 `NULL`，或者如果列定义不包含 `default` 子句，则此值为 `NULL`。
- `IS_NULLABLE`：列是否可以为空。如果该列可以存储空值，则该值为 `YES`；否则为 `NO`。
- `DATA_TYPE`：列中的数据类型。
- `CHARACTER_MAXIMUM_LENGTH`：对于字符串列，字符的最大长度。
- `CHARACTER_OCTET_LENGTH`：对于字符串列，最大长度（以字节为单位）。
- `NUMERIC_PRECISION`：数字类型列的数字精度。
- `NUMERIC_SCALE`：数字类型列的数字比例。
- `DATETIME_PRECISION`：对于时间类型列，小数秒精度。
- `CHARACTER_SET_NAME`：字符串列的字符集名称。
- `COLLATION_NAME`：字符串列的排序规则的名称。
- `COLUMN_TYPE`：列类型。
- `COLUMN_KEY`：该列是否被索引。该字段可能具有以下值：
   - `Empty`：此列未编入索引，或者此列已编入索引并且是多列非唯一索引中的第二列。
   - `PRI`：此列是主键或多个主键之一。
   - `UNI`：此列是唯一索引的第一列。
   - `MUL`：该列是非唯一索引的第一列，其中允许给定值多次出现。
- `EXTRA`：给定列的任何附加信息。
- `PRIVILEGES`：当前用户所拥有的对该列的权限。
- `COLUMN_COMMENT`：列定义中包含的描述。
- `GENERATION_EXPRESSION`：对于生成的列，此值显示用于计算列值的表达式。对于非生成列，该值为空。
- `SRS_ID`：此值适用于空间列。它包含列 `SRID` 值，该值表示为存储在该列中的值提供一个空间参考系统。

### `ENGINES` 表

`ENGINES` 表中的列描述如下：

- `ENGINES`：存储引擎的名称。
- `SUPPORT`：服务器对存储引擎的支持级别。
- `COMMENT`：对存储引擎的简短评论。
- `TRANSACTIONS`：存储引擎是否支持事务。
- `XA`：存储引擎是否支持 XA 事务。
- `SAVEPOINTS`：存储引擎是否支持 `savepoints`。

### `PROCESSLIST` 表

`PROCESSLIST` 表中的字段描述如下：

- `ID`：用户连接的 ID。
- `USER`：正在执行 `PROCESS` 的用户名。
- `HOST`：用户连接的地址。
- `DB`：当前连接的默认数据库的名称。
- `COMMAND`：`PROCESS` 正在执行的命令类型。
- `TIME`：`PROCESS` 的当前执行时长，以秒为单位。
- `STATE`：当前连接状态。
- `INFO`：正在处理的请求语句。

### `SCHEMATA` 表

`SCHEMATA` 表提供有关数据库的信息。表数据等同于 `SHOW DATABASES` 语句的结果。`SCHEMATA` 表中的字段描述如下：

- `CATALOG_NAME`：数据库所属的目录。
- `SCHEMA_NAME`：数据库名称。
- `DEFAULT_CHARACTER_SET_NAME`：数据库的默认字符集。
- `DEFAULT_COLLATION_NAME`：数据库的默认排序规则。
- `SQL_PATH`：此项的值始终为 `NULL`。
- `DEFAULT_TABLE_ENCRYPTION`：定义数据库和通用表空间的 *default encryption* 设置。

### `TABLES` 表

`TABLES` 表中列的描述如下：

- `TABLE_CATALOG`：表所属目录的名称。该值始终为 `def`。
- `TABLE_SCHEMA`：表所属的模式的名称。
- `TABLE_NAME`：表的名称。
- `TABLE_TYPE`：表的类型。基本表类型为 `BASE TABLE`，视图表类型为 `VIEW`，`INFORMATION_SCHEMA` 表类型为 `SYSTEM VIEW`。
- `ENGINE`：存储引擎的类型。
- `VERSION`：版本。默认值为 `10`。
- `ROW_FORMAT`：行存储格式。值为 `Fixed`，`Dynamic`，`Compressed`，`Redundant`，`Compact`。
- `TABLE_ROWS`：统计表中的行数。对于 `INFORMATION_SCHEMA` 表，`TABLE_ROWS` 为 `NULL`。
- `AVG_ROW_LENGTH`：表的平均行长度。`AVG_ROW_LENGTH` = `DATA_LENGTH` / `TABLE_ROWS`。
- `DATA_LENGTH`：数据长度。`DATA_LENGTH` = `TABLE_ROWS` * 元组中列的存储长度之和。
- `MAX_DATA_LENGTH`：最大数据长度。该值当前为 `0`，表示数据长度没有上限。
- `INDEX_LENGTH`：索引长度。`INDEX_LENGTH` = `TABLE_ROWS` * 索引元组中列的长度总和。
- `DATA_FREE`：数据片段。该值当前为 `0`。
- `AUTO_INCREMENT`：自增主键的当前步长。
- `CREATE_TIME`：创建表的时间。
- `UPDATE_TIME`：表更新的时间。
- `CHECK_TIME`：检查表的时间。
- `TABLE_COLLATION`：表中字符串的排序规则。
- `CHECKSUM`：校验和。
- `CREATE_OPTIONS`：创建选项。
- `TABLE_COMMENT`：表格的注释和注释。

### `USER_PRIVILEGES` 表

`USER_PRIVILEGES` 表提供了关于全局权限的信息。

`USER_PRIVILEGES` 表中的字段描述如下：

- `GRANTEE`：授权用户名，格式为 `'user_name'@'host_name'`。
- `TABLE_CATALOG`：表所属的目录的名称。值为 `def`。
- `PRIVILEGE_TYPE`：要授予的权限类型。每行只显示一种权限类型。
- `IS_GRANTABLE`：如果你有 `GRANT OPTION` 权限，该值为 `YES`，没有 `GRANT OPTION` 权限，该值为 `NO`。

### `VIEW` 表

- `TABLE_CATALOG`：视图所属目录的名称。值为 `def`。
- `TABLE_SCHEMA`：视图所属的数据库的名称。
- `TABLE_NAME`：视图的名称。
- `VIEW_DEFINITION`：提供视图定义的 `SELECT` 语句。包含了在 `SHOW Create VIEW` 生成的**创建表**列中看到的大部分内容。
- `CHECK_OPTION`：`CHECK_OPTION` 属性的值。值为 `NONE`、`CASCADE` 或 `LOCAL`。
- `IS_UPDATABLE`：在 `CREATE VIEW` 时设置一个名为视图可更新性标志的标志，如果 UPDATE 和 DELETE（以及类似的操作）对视图合法，则标志设置为 `YES（true）`。否则，标志设置为 `NO（false）`。
- `DEFINER`：创建视图的用户的帐户，格式为 `username@hostname`。
- `SECURITY_TYPE`：视图 `SQL SECURITY` 特性。值为 `DEFINER` 或 `INVOKER`。
- `CHARACTER_SET_CLIENT`：创建视图时 `character_set_client` 系统变量的会话值。
- `COLLATION_CONNECTION`：创建视图时，`collation_connection` 系统变量的会话值。

## `mysql` 数据库

### 授权系统表

授权系统表包含了关于用户帐户及其权限信息：

- `user` 用户帐户、全局权限和其他非权限列。

- `db`：数据库级权限。

- `tables_priv`：表级权限。

- `columns_priv`：列级权限。

- `procs_priv`：存储过程和存储函数的权限。

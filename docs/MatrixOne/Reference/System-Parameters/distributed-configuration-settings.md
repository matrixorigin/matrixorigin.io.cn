# 分布式版通用参数配置

在 *matrixone/etc/launch-with-proxy/* 目录下，有四个配置文件：*cn.toml*、*tn.toml*、*proxy.toml* 和 *log.toml*。这些配置文件中包含的参数解释如下：

## cn.toml

### 默认参数

*cn.toml* 文件中默认包含以下参数：

| 参数              | 参数解释                                  | 书写格式示例             |
|-------------------|-------------------------------------------|--------------------------|
| [log]             | 日志配置节                                |                          |
| level             | 日志级别，默认值为 info，可修改为不同级别  | level = "info"        |
| [cn]              | cn 节点，不可修改                         | /                        |
| port-base         | "cn" 使用的起始端口号，从端口号往后，连续20个端口找到可用端口用于内部服务| port-base = 18000       |
| service-host      | 服务连接地址，用于注册到 HAKeeper 中       | service-host = "127.0.0.1" |
| [cn.frontend]     | 前端配置节                                |                          |
| port              | MatrixOne 监听及客户端连接的端口          | port = 6001             |
| host              | 监听 IP 地址                             | host = "0.0.0.0"       |
|[fileservice.s3]	|S3| 文件服务配置节|	|
|bucket|	S3 桶名称|	bucket = "my-bucket"|
|key-prefix|	S3 键前缀|	key-prefix = "prefix/"|

### 扩展参数

你还可以在 *cn.toml* 文件中自定义添加以下配置参数：

| 参数                   | 参数解释                                  | 书写格式                   |
|------------------------|-------------------------------------------|----------------------------|
| [log]                  | 日志配置节                                |                            |
| format                 | 日志保存格式为 JSON 或其他                | format = "console"        |
| filename               | 日志文件名                                |  filename = "mo.log"          |
| [cn.frontend]          | 前端配置节                                |                            |
| unix-socket            | 监听 Unix 域接口                          | unix-socket = "/tmp/mysql.sock"               |
| lengthOfQueryPrinted   | 控制台输出查询长度                        | lengthOfQueryPrinted = 200000 |
| enableTls              | 是否启用 TLS                              | enableTls = false         |
| tlsCaFile              | 客户端 SSL CA 列表文件路径               | tlsCaFile = ''            |
| tlsCertFile            | 客户端 X509 PEM 格式密钥文件路径          | tlsCertFile = ''          |
| tlsKeyFile             | 客户端 X509 PEM 格式密钥文件路径          | tlsKeyFile = ''           |
| saveQueryResult        | 是否保存查询结果                          | saveQueryResult = false   |
| queryResultTimeout     | 查询结果超时时间                          | queryResultTimeout = 24   |
| queryResultMaxsize     | 查询结果最大规模                          | queryResultMaxsize = 100  |
| lowerCaseTableNames    | 标识符大小写敏感，默认参数值为 1，表示大小写不敏感                        | lowerCaseTableNames = 1   |
| [cn.Txn]               | 事务配置节                                |                            |
| isolation              | 事务隔离级别，此参数用于配置节点（cn）上的事务隔离级别。事务隔离级别定义了事务在处理并发操作时的行为。默认情况下，如果未设置隔离级别（Isolation），当事务模式（Mode）设置为乐观（optimistic）时，隔离级别将被设置为序列化隔离（SI），当事务模式设置为悲观（pessimistic）时，隔离级别将被设置为可重复读隔离（RC）。默认：RC                                  | isolation = "RC"          |
| mode                   | 事务模式，此参数用于配置节点（cn）上的事务模式。事务模式定义了如何处理事务中的操作和并发性。可选的值为乐观（optimistic）和悲观（pessimistic），默认值是悲观（pessimistic）。                                  | mode = "pessimistic"       |
| [fileservice.s3]       |                        |                            |
| endpoint               |S3 端点地址|endpoint = "s3.amazonaws.com"|
| [fileservice.cache]    | 文件服务缓存配置节                        |                            |
| memory-capacity        | cache 内存大小                            | memory-capacity = "512MB" |
| disk-path              |磁盘缓存路径|disk-path = "/var/matrixone/cache"|
| disk-capacity          |磁盘缓存容量|disk-capacity = "8GB"|
| [observability]        | 可观测性参数                              |                            |
| host                   | 暴露度量服务监听 IP。该参数指定了度量服务（metrics service）监听的 IP 地址。                       | host = "0.0.0.0"          |
| statusPort             | prometheus 监控端口。该参数定义了度量服务监听的端口号。度量服务通常通过 HTTP 提供度量数据，该参数结合 host 参数构成度量服务的访问地址。                        | statusPort = 7001         |
| enableMetricToProm     | 启用度量服务。如果设置为 true，表示启用度量服务                          | enableMetricToProm = false|
| disableMetric          | 禁用度量收集。如果设置为 true，系统将不会收集任何度量数据，同时也不会监听度量服务端口                          | disableMetric = false     |
| disableTrace           | 禁用跟踪收集。如果设置为 true，系统将停止收集任何跟踪（trace）、度量（metric）和日志（log）数据，                          | disableTrace = false      |
| longQueryTime          | 记录执行时间超过的查询。该参数定义了一个阈值，以秒为单位，用于筛选出执行时间超过该阈值的查询语句，然后记录这些查询的执行计划（ExecPlan）。如果查询的执行时间超过这个阈值，系统会记录查询的执行计划，以便后续分析。如果设置为 0.0，表示记录所有查询的执行计划。                   | longQueryTime = 1.0              |

## tn.toml

### 默认参数

*tn.toml* 文件中默认包含以下参数：

| 参数              | 参数解释                                  | 书写格式示例             |
|-------------------|-------------------------------------------|--------------------------|
| [log]             | 日志配置节                                |                          |
| level             | 日志级别，默认值为 info，可修改为不同级别  | level = "info"        |
| [dn]              | TN 节点，不可修改                         |                        |
| uuid              | TN 的唯一标识符，不可修改                  | uuid = "dd4dccb4-4d3c-41f8-b482-5251dc7a41bf" |
| port-base         | "TN" 使用的起始端口号，从端口号往后，连续20个端口找到可用端口用于内部服务| port-base = 19000       |
| service-host      | 服务连接地址，用于注册到 HAKeeper 中       | service-host = "0.0.0.0" |
|[fileservice.s3]	|S3| 文件服务配置节|	|
|bucket|	S3 桶名称|	bucket = "my-bucket"|
|key-prefix|	S3 键前缀|	key-prefix = "prefix/"|

### 扩展参数

你还可以在 *tn.toml* 文件中自定义添加以下配置参数：

| 参数                   | 参数解释                                  | 书写格式示例             |
|------------------------|-------------------------------------------|--------------------------|
| [log]                  | 日志配置节                                |                          |
| format                 | 日志保存格式为 JSON 或其他                | format = "console"        |
| filename               | 日志文件名                                |  filename = "mo.log"          |
| [dn.LogtailServer]     | Logtail 服务器配置节                      |                            |
| rpc-enable-checksum    | 是否开启 RPC 校验和                        | rpc-enable-checksum = false|
| [fileservice.s3]       |                        |                            |
| endpoint               |S3 端点地址|endpoint = "s3.amazonaws.com"|
| [fileservice.cache]    | 文件服务缓存配置节                        |                            |
| memory-capacity        | cache 内存大小                            | memory-capacity = "512MB" |
| disk-path              |磁盘缓存路径|disk-path = "/var/matrixone/cache"|
| disk-capacity          |磁盘缓存容量|disk-capacity = "8GB"|
| [observability]        | 可观测性参数                              |                            |
| host                   | 暴露度量服务监听 IP。该参数指定了度量服务（metrics service）监听的 IP 地址。                       | host = "0.0.0.0"          |
| statusPort             | prometheus 监控端口。该参数定义了度量服务监听的端口号。度量服务通常通过 HTTP 提供度量数据，该参数结合 host 参数构成度量服务的访问地址。                        | statusPort = 7001         |
| enableMetricToProm     | 启用度量服务。如果设置为 true，表示启用度量服务                          | enableMetricToProm = false|
| disableMetric          | 禁用度量收集。如果设置为 true，系统将不会收集任何度量数据，同时也不会监听度量服务端口                          | disableMetric = false     |
| disableTrace           | 禁用跟踪收集。如果设置为 true，系统将停止收集任何跟踪（trace）、度量（metric）和日志（log）数据，                          | disableTrace = false      |
| longQueryTime          | 记录执行时间超过的查询。该参数定义了一个阈值，以秒为单位，用于筛选出执行时间超过该阈值的查询语句，然后记录这些查询的执行计划（ExecPlan）。如果查询的执行时间超过这个阈值，系统会记录查询的执行计划，以便后续分析。如果设置为 0.0，表示记录所有查询的执行计划。                    | longQueryTime = 1.0              |

## log.toml

### 默认参数

*log.toml* 文件中默认包含以下参数：

| 参数              | 参数解释                                  | 书写格式示例             |
|-------------------|-------------------------------------------|--------------------------|
| [log]            | 日志配置节                                |                          |
| level             | 日志级别，默认值为 info，可修改为不同级别  | level = "info"        |
| [logservice]      | Logservice 配置节                         |                        |
| uuid              | Logservice 的唯一标识符，不可修改           | uuid = "dd1dccb4-4d3c-41f8-b482-5251dc7a41bf" |
| data-dir          | 默认数据目录                              | data-dir = "./mo-data/logservice"  |
|[fileservice.s3]	|S3| 文件服务配置节|	|
|bucket|	S3 桶名称|	bucket = "my-bucket"|
|key-prefix|	S3 键前缀|	key-prefix = "prefix/"|

### 扩展参数

你还可以在 *log.toml* 文件中自定义添加以下配置参数：

| 参数                   | 参数解释                                  | 书写格式示例             |
|------------------------|-------------------------------------------|--------------------------|
| [log]                  | 日志配置节                                |                          |
| format                 | 日志保存格式为 JSON 或其他                | format = "console"        |
| filename               | 日志文件名                                |  filename = "mo.log"          |
|[logservice.BootstrapConfig]|||
|num-of-log-shards       ||num-of-log-shards = 0|
|num-of-tn-shards        ||num-of-tn-shards = 0|
|num-of-log-shard-replicas||num-of-log-shard-replicas = 0|
| [fileservice.s3]       |                        |                            |
| endpoint               |S3 端点地址|endpoint = "s3.amazonaws.com"|
| [fileservice.cache]    | 文件服务缓存配置节                        |                            |
| memory-capacity        | cache 内存大小                            | memory-capacity = "512MB" |
| disk-path              |磁盘缓存路径|disk-path = "/var/matrixone/cache"|
| disk-capacity          |磁盘缓存容量|disk-capacity = "8GB"|
| [observability]        | 可观测性参数                              |                            |
| host                   | 暴露度量服务监听 IP。该参数指定了度量服务（metrics service）监听的 IP 地址。                       | host = "0.0.0.0"          |
| statusPort             | prometheus 监控端口。该参数定义了度量服务监听的端口号。度量服务通常通过 HTTP 提供度量数据，该参数结合 host 参数构成度量服务的访问地址。                        | statusPort = 7001         |
| enableMetricToProm     | 启用度量服务。如果设置为 true，表示启用度量服务                          | enableMetricToProm = false|
| disableMetric          | 禁用度量收集。如果设置为 true，系统将不会收集任何度量数据，同时也不会监听度量服务端口                          | disableMetric = false     |
| disableTrace           | 禁用跟踪收集。如果设置为 true，系统将停止收集任何跟踪（trace）、度量（metric）和日志（log）数据，                          | disableTrace = false      |
| longQueryTime          | 记录执行时间超过的查询。该参数定义了一个阈值，以秒为单位，用于筛选出执行时间超过该阈值的查询语句，然后记录这些查询的执行计划（ExecPlan）。如果查询的执行时间超过这个阈值，系统会记录查询的执行计划，以便后续分析。如果设置为 0.0，表示记录所有查询的执行计划。                    | longQueryTime = 1.0              |

## proxy.toml

### 默认参数

*proxy.toml* 文件中默认包含以下参数：

| 参数              | 参数解释                                  | 书写格式示例             |
|-------------------|-------------------------------------------|--------------------------|
| [log]             | 日志配置节                                |                          |
| level             | 日志级别，默认值为 info，可修改为不同级别  | level = "info"        |
| [proxy]           | 代理配置节                                |                        |
| listen-address    | 监听地址，默认为 `0.0.0.0:6009`          | listen-address = "0.0.0.0:6009" |
|[fileservice.s3]	|S3| 文件服务配置节|	|
|bucket|	S3 桶名称|	bucket = "my-bucket"|
|key-prefix|	S3 键前缀|	key-prefix = "prefix/"|

### 扩展参数

你还可以在 *proxy.toml* 文件中自定义添加以下配置参数：

| 参数                   | 参数解释                                  | 书写格式示例             |
|------------------------|-------------------------------------------|--------------------------|
| [log]                  | 日志配置节                                |                          |
| format                 | 日志保存格式为 JSON 或其他                | format = "console"        |
| filename               | 日志文件名                                |  filename = "mo.log"          |
| [proxy]                | 代理配置节                                |                            |
| rebalance-interval     | 重新平衡间隔。这是两次重新平衡操作之间的时间间隔。在分布式系统中，重新平衡操作是为了均衡服务器之间的负载，确保每个服务器都具有相似的工作量。                          | rebalance-interval = 30   |
| rebalance-disabled     | 重新平衡禁用标志。如果设置为 true，表示重新平衡器被禁用，系统将不会自动执行重新平衡操作。                          | rebalance-disabled = false|
| rebalance-tolerance    | 重新平衡容忍度。这个参数表示重新平衡器的容忍程度。当连接数超过平均值 avg * (1 + tolerance) 时，连接将被迁移到其他 CN（计算节点）服务器上。容忍度的值应小于 1，它定义了在何种程度上连接数可以超过平均值而不触发重新平衡操作。例如，如果容忍度设置为 0.3，当某个服务器的连接数超过平均连接数的 30% 时，重新平衡操作会开始将连接迁移到其他服务器上，以平衡负载。                       | rebalance-tolerance = 0.3 |
| [fileservice.s3]       |                        |                            |
| endpoint               |S3 端点地址|endpoint = "s3.amazonaws.com"|
| [fileservice.cache]    | 文件服务缓存配置节                        |                            |
| memory-capacity        | cache 内存大小                            | memory-capacity = "512MB" |
| disk-path              |磁盘缓存路径|disk-path = "/var/matrixone/cache"|
| disk-capacity          |磁盘缓存容量|disk-capacity = "8GB"|
| [observability]        | 可观测性参数                              |                            |
| host                   | 暴露度量服务监听 IP。该参数指定了度量服务（metrics service）监听的 IP 地址。                       | host = "0.0.0.0"          |
| statusPort             | prometheus 监控端口。该参数定义了度量服务监听的端口号。度量服务通常通过 HTTP 提供度量数据，该参数结合 host 参数构成度量服务的访问地址。                        | statusPort = 7001         |
| enableMetricToProm     | 启用度量服务。如果设置为 true，表示启用度量服务                          | enableMetricToProm = false|
| disableMetric          | 禁用度量收集。如果设置为 true，系统将不会收集任何度量数据，同时也不会监听度量服务端口                          | disableMetric = false     |
| disableTrace           | 禁用跟踪收集。如果设置为 true，系统将停止收集任何跟踪（trace）、度量（metric）和日志（log）数据，                          | disableTrace = false      |
| longQueryTime          | 记录执行时间超过的查询。该参数定义了一个阈值，以秒为单位，用于筛选出执行时间超过该阈值的查询语句，然后记录这些查询的执行计划（ExecPlan）。如果查询的执行时间超过这个阈值，系统会记录查询的执行计划，以便后续分析。如果设置为 0.0，表示记录所有查询的执行计划。                 | longQueryTime = 1.0              |

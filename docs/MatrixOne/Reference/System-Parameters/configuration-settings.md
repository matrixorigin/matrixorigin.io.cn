# **通用参数配置**

在 *matrixone/etc/launch-tae-CN-tae-DN/* 目录有三个配置文件 *cn.toml*、*dn.toml* 和 *log.toml*。

各个配置文件中所含参数解释如下：

### cn.toml

|参数|参数解释|
|---|---|
|service-type = "CN" |节点类型|
|data-dir = "./mo-data"|默认数据目录|
|[log]||
|level = "info" |日志级别，可修改为 info/debug/error/faltal|
|format = "console" |日志格式|
|max-size = 512|日志默认长度|
|[hakeeper-client]|HAkeeper 默认地址与端口，不建议更改|
|service-addresses = [<br>  "127.0.0.1:32001",<br>]||
|[metacache]|元数据缓存|
|memory-capacity = "512MB"|设置元数据的缓存大小，默认 512MB，数据缓存特性对于首次查询较慢，但之后多次查询速度会变快。|
|[[fileservice]] |fileservice 配置，不建议更改|
|name = "LOCAL"|fileservice 存储类型，本地存储|
|backend = "DISK"|fileservice 后端介质，磁盘|
|[[fileservice]]||
|name = "SHARED" |fileservice 存储类型，S3|
|backend = "DISK"|fileservice 后端介质，磁盘|
|data-dir = "mo-data/s3"|s3 存储数据路径|
|[fileservice.cache]||
|memory-capacity = "512MB"|fileservice 使用的 cache 内存大小|
|disk-capacity = "8GB"|fileservice 使用的 cache 磁盘大小|
|disk-path = "mo-data/file-service-cache"|fileservice 的磁盘 cache 路径|
|disk-min-evict-interval = "7m"|磁盘缓存回收的时间间隔，单位为秒（s）或分钟（m)|
|disk-evict-target = 0.8|磁盘缓存回收的目标容量，参数为模板容量占总容量的比例|
|[[fileservice]]||
|name = "ETL"|fileservice 存储类型，ETL|
|backend = "DISK-ETL"|fileservice 后端介质，DISK-ETL|
|[observability]|可观测性参数，默认不开启|
|disableTrace = true||
|disableMetric = true||
|[cn] |cn 节点的编号，不可修改|
|uuid = "dd1dccb4-4d3c-41f8-b482-5251dc7a41bf"||
|[cn.Engine]|cn 节点的存储引擎，分布式 tae，不可修改|
|type = "distributed-tae"||
|[cn.txn]||
|enable-sacrificing-freshness = false| 当设置为 true，并处于推送模式下时，这个参数不保证事务能看到最新提交的数据，而是以当前 CN 接收到的最新 Logtail 提交时间戳作为事务的开始时间。这种设置可以保证同一数据库连接的事务能看到其先前提交的事务的写入数据。|
|enable-cn-based-consistency = false|当上面的参数设置为 true，能保证同一个 CN 上的外部一致性。即一个事务开始的时候，一定可以看到之前已经提交事务的写入。|

## dn.toml

|参数|参数解释|
|---|---|
|service-type = "DN" |节点类型|
|data-dir = "./mo-data"|默认数据目录|
|[log]||
|level = "info" |日志级别，可修改为info/debug/error/faltal|
|format = "console" |日志格式|
|max-size = 512|日志默认长度|
|[hakeeper-client]|HAkeeper 默认地址与端口，不建议更改|
|service-addresses = [<br>  "127.0.0.1:32001",<br>]||
|[metacache]|元数据缓存|
|memory-capacity = "512MB"|设置元数据的缓存大小，默认 512MB，数据缓存特性对于首次查询较慢，但之后多次查询速度会变快。|
|[[fileservice]] |fileservice 配置，不建议更改|
|name = "LOCAL"|fileservice 存储类型，本地存储|
|backend = "DISK"|fileservice 后端介质，磁盘|
|[[fileservice]]||
|name = "SHARED" |fileservice 存储类型，S3|
|backend = "DISK"|fileservice 后端介质，磁盘|
|data-dir = "mo-data/s3"|s3 存储数据路径|
|[fileservice.cache]||
|memory-capacity = "512MB"|fileservice 使用的 cache 内存大小|
|disk-capacity = "8GB"|fileservice 使用的 cache 磁盘大小|
|disk-path = "mo-data/file-service-cache"|fileservice 的磁盘 cache 路径|
|disk-min-evict-interval = "7m"|磁盘缓存回收的时间间隔，单位为秒（s）或分钟（m)|
|disk-evict-target = 0.8|磁盘缓存回收的目标容量，参数为模板容量占总容量的比例|
|[[fileservice]]||
|name = "ETL"|fileservice 存储类型，ETL|
|backend = "DISK-ETL"|fileservice 后端介质，DISK-ETL|
|[dn]||
|uuid = "dd4dccb4-4d3c-41f8-b482-5251dc7a41bf"|DN 的 uuid，不可修改|
|[dn.Txn.Storage]|dn 事务后端的存储引擎，不可修改|
|backend = "TAE" ||
|log-backend = "logservice"||
|[dn.Txn]||
|incremental-dedup = false|设置为 false，DN 开启全量数据去重。设置为 true，DN 只会对快照时间戳之后的主键数据进行去重处理。|
|[dn.Ckp]|DN 的 checkpoint 相关参数，不建议更改|
|flush-interval = "60s" |内部刷新间隔|
|min-count = 100 |checkpoint 最小个数|
|scan-interval = "5s"|内部扫描间隔|
|incremental-interval = "180s"|checkpoint 自增间隔|
|global-min-count = 60 |全局最小的 DN checkpoint 个数|
|[dn.LogtailServer]||
|listen-address = "0.0.0.0:32003"|logtail 监听端口|
|service-address = "127.0.0.1:32003"|logtail 内部访问地址|
|rpc-max-message-size = "16KiB"|logtail 使用的最大 rpc 消息大小|
|rpc-payload-copy-buffer-size = "16KiB"|rpc 复制 buffer 的大小|
|rpc-enable-checksum = true|是否开启 rpc checksum|
|logtail-collect-interval = "2ms"|logtail 的统计收集时间间隔|
|logtail-response-send-timeout = "10s"|logtail 发送的超时时间|
|max-logtail-fetch-failure = 5|获取 logtail 允许的最大失败次数|

## log.toml

|参数|参数解释|
|---|---|
|service-type = "LOG" |节点类型|
|data-dir = "./mo-data"|默认数据目录|
|[log]||
|level = "info" |日志级别，可修改为info/debug/error/faltal|
|format = "console" |日志格式|
|max-size = 512|日志默认长度|
|[[fileservice]] |fileservice 配置，不建议更改|
|name = "LOCAL"|fileservice 存储类型，本地存储|
|backend = "DISK"|fileservice 后端介质，磁盘|
|[[fileservice]]||
|name = "SHARED" |fileservice 存储类型，S3|
|backend = "DISK"|fileservice 后端介质，磁盘|
|data-dir = "mo-data/s3"|s3 存储数据路径|
|[fileservice.cache]||
|memory-capacity = "512MB"|fileservice 使用的 cache 内存大小|
|disk-capacity = "8GB"|fileservice 使用的 cache 磁盘大小|
|disk-path = "mo-data/file-service-cache"|fileservice 的磁盘 cache 路径|
|disk-min-evict-interval = "7m"|磁盘缓存回收的时间间隔，单位为秒（s）或分钟（m)|
|disk-evict-target = 0.8|磁盘缓存回收的目标容量，参数为模板容量占总容量的比例|
|[[fileservice]]||
|name = "ETL"|fileservice 存储类型，ETL|
|backend = "DISK-ETL"|fileservice 后端介质，DISK-ETL|
|[observability]|监控相关参数|
|statusPort = 7001|预留普罗米修斯的监控端口|
|enableTraceDebug = false|开启 trace 功能的 dbug 模式|
|[hakeeper-client]|HAkeeper 默认地址与端口，不建议更改|
|service-addresses = [<br>  "127.0.0.1:32001",<br>]||
|[logservice] |logservice 的相关参数，不可修改|
|deployment-id = 1 |logservice 的部署 id|
|uuid = "7c4dccb4-4d3c-41f8-b482-5251dc7a41bf"|logservice 的节点 id|
|raft-address = "127.0.0.1:32000"|raft 协议使用的地址|
|logservice-address = "127.0.0.1:32001"|logservice 服务地址|
|gossip-address = "127.0.0.1:32002" |gossip 协议的地址|
|gossip-seed-addresses = [<br>"127.0.0.1:32002",<br>]|gossip 协议的种子节点地址|
|gossip-allow-self-as-seed = true|是否允许 gossip 协议用本节点做种子节点|
|[logservice.BootstrapConfig]|bootstrap 相关参数，不可修改|
|bootstrap-cluster = true|bootstrap 是否集群启动|
|num-of-log-shards = 1|logservice 的分片数|
|num-of-dn-shards = 1|dn 的分片数|
|num-of-log-shard-replicas = 1|logservice 分片的副本数|
|init-hakeeper-members = [ <br>"131072:7c4dccb4-4d3c-41f8-b482-5251dc7a41bf",<br>]|初始化 hakeeper 的成员|

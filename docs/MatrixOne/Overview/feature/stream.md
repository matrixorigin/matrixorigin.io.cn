# 流

## 流式数据的特点

随着物联网的发展，时序数据库的需求越来越多，比如智能汽车产生的数据，工厂的设备监控、金融行业的交易行情指标数据等。常见的业务场景包括：

监控软件系统：虚拟机、容器、服务、应用；
监控物理系统：水文监控、制造业工厂中的设备监控、国家安全相关的数据监控、通讯监控、传感器数据、血糖仪、血压变化、心率等；
资产跟踪应用：汽车、卡车、物理容器、运货托盘；
金融交易系统：传统证券、新兴的加密数字货币；
事件应用程序：跟踪用户、客户的交互数据；
商业智能工具：跟踪关键指标和业务的总体健康情况；
互联网行业：也有着非常多的时序数据，例如用户访问网站的行为轨迹，应用程序产生的日志数据等。

一方面由于时序数据库的时间属性，即随着时间的推移不断地产生新的数据；另一方面，时序的数据量巨大，每秒钟可能要写入千万、上亿条数据。这两方面的特性使得时序数据库在一些业务需求中会出现，常见的业务需求有：

1. 获取最新状态，查询最近的数据（例如传感器最新的状态）；
2. 展示区间统计，指定时间范围，查询统计信息，例如平均值、最大值、最小值、计数等；
3. 获取异常数据，根据指定条件，筛选异常数据。

## MatrixOne 在流上的能力

目前行业中已经有一些专用的 NoSQL 时序数据库，如 InfluxDB, OpenTSDB, TDEngine 等，而 MatrixOne 与它们不一样的地方在于 MatrixOne 仍然是一个通用数据库，以满足应用开发的增删改查及数据分析的 HTAP 为核心，同时也仍然是一个关系型数据的建模形式，使用的查询语言也仍然是经典的 SQL 语言，MatrixOne 是在通用数据库能力的基础增加了一些时序相关的能力，定位上来说有点类似于 TimeScaleDB。MatrixOne 在功能上支持时间窗口，降采样，插值，分区等时序常见的能力，性能上可以满足时序场景中对高吞吐，高压缩，实时分析，同时整体架构上的强扩展性，冷热分离，读写分离等特点也非常适合时序相关的场景使用，同时保持了传统数据库中对更新，事务的支持。因此，MatrixOne 更适合需要用普通的关系型数据库进行业务开发，但是同时有需要有一定时序处理能力的混合场景。

MatrixOne 的时序能力体现在以下方面：

- 支持传统数据库中常见的字符串，数字，日期等数据类型，也同时支持新型负载的 JSON，向量等类型，详细可参见[数据类型](../../Reference/Data-Types/data-types.md).
- 支持建立按时间戳作为主键的专用时序表，并支持任意的维度/指标列，详细可参见[时间窗口](../../Develop/read-data/window-function/time-window.md).
- 提供常用的时间窗口能力，可以按不同的时间进行降采样查询，详细可参见[时间窗口](../../Develop/read-data/window-function/time-window.md).
- 支持针对空值的插值能力，并提供不同策略的插值方法，详细可参见[时间窗口](../../Develop/read-data/window-function/time-window.md).
- 支持各类传统数据库中的简单及复杂查询能力，详细可参见[单表查询](../../Develop/read-data/query-data-single-table.md), [多表查询](../../Develop/read-data/multitable-join-query.md), [子查询](../../Develop/read-data/subquery.md), [视图](../../Develop/read-data/subquery.md), [CTE](../../Develop/read-data/cte.md).
- 支持高速的[离线导入](../../Develop/import-data/bulk-load/bulk-load-overview.md), [流式数据写入](../../Develop/import-data/stream-load.md), [Insert into 写入](../../Develop/import-data/insert-data.md)等方式。
- 支持各类[聚合函数](../../Reference/Functions-and-Operators/Aggregate-Functions/count.md), 以满足时序数据类型的计算。
